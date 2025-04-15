---
layout: post
title: Optimizing Multiple Realsense Camera Streaming on Jetson Orin
subtitle: How multiprocessing, shared memory, and pyrealsense helped me push Jetson Orin to its limits!
image: /img/realsense/cover.jpg
tags: [camera, memory, python, realsense]
comments: true
---

When I first set out to stream video from multiple Intel Realsense cameras on a Jetson Orin, I underestimated how quickly things would get complicated. 
What seemed like a straightforward task, just plug in the cameras and start reading frames, turned into a deep dive into Python multiprocessing, memory management, the quirks of the pyrealsense2 library, 
and even fixing a Python bug.

In this post, I’ll walk you through how I got real-time streaming from up to six Realsense cameras working on the Jetson Orin. 
The key was leveraging Python’s *multiprocessing* for parallelism, *shared memory* for fast data transfer between processes, and understanding how to work around *pyrealsense2*'s limitations in multiprocessing environments.

Whether you're working on a vision-based edge device project or just curious how to squeeze more out of limited hardware, I’ll break down the lessons, challenges, and solutions that helped push the Jetson Orin to its limits.


**Quick heads up**: I am assuming you have some experience with Python (using 3.11) and the [multiprocessing](https://docs.python.org/3/library/multiprocessing.html) module. Also assuming you have used 
the [pyrealsense2](https://github.com/IntelRealSense/librealsense/blob/master/wrappers/python/readme.md) library and figured how frustrating it can be when it comes to multiple camera streaming. 
Do not worry if [Shared Memory](https://docs.python.org/3/library/multiprocessing.shared_memory.html) is new to you, I will break that part down as clearly as I can.



## Challenge #1: When the Cameras Overwhelm the Jetson
I started to get frames sequentially. Get a frame from a camera, pass it to a queue, then get a frame from another camera. Once i go through all cameras start from the beginning. 
This works if your frame's post processing doesn't take much time. As my original application started to get bigger and complicated and takes more time in between, this way of getting frames started to struggle and it would drop frames. 
In pyrealsense2 if you don't call to get frames before the frame is ready, it gets dropped. To get better frame rate, I moved to [threading](https://docs.python.org/3/library/threading.html), Python's thread-based parallelism.

Working with computer vision on edge devices often pushes hardware to its limits. When the scope of the application grew, the Jetson Orin, though quite capable, started to struggle pulling real-time frames from multiple cameras 
even using threading. Python threads don’t run in true parallel because of the Global Interpreter Lock (GIL). Instead, they context-switch, which simply wasn’t fast enough and I realized this won't scale well.

#### Solution: True Parallelism with Multiprocessing
To get around the GIL, I turned to Python’s multiprocessing module. Unlike threads, processes run independently with their own memory space, allowing true parallel frame capture across all six cameras. 
I spawn one process per camera. This allowed each camera stream to run independently, making full use of available CPU cores. This gave me the performance boost I needed.


## Challenge #2: pyrealsense2 and Multiprocessing Don't Get Along
When I tried to use the pyrealsense2 library inside a class that inherits from multiprocessing.Process, the application failed. It turns out pyrealsense2 objects are not picklable.
Which means that the object cannot be serialized using the `pickle` module. Pickling is the process of converting a Python object into a byte stream so it can be saved to a file or sent over a network.

When we create a separate process, it takes the memory from `main` process, pickle it and pass it to the new process. Because pyrealsense2 isn't picklable, I cannot create a process that has pyrealsense2 instance.

#### Solution: Initialize pyrealsense2 instance Inside run() Instead of __init__()
The key was to avoid initializing pyrealsense2 in the constructor. Instead, I moved that logic into the run() method. That means, it gets initialized at the run time and not before the serialization.
In my example I have a `init_in_run()` method, that initializes all the unpicklable objects.

Example:

```python
    def run(self) -> None:
        self.init_in_run()

        while True:
		   ... ... ... ... ... ...
	
	 def init_in_run(self) -> None:

        rs_config = rs.config()
        rs_config.enable_device(self.camera_config.serial_number)
		... ... ... ... ... ...

```


## Challenge #3: Efficient Frame Sharing Between Processes
The original application was still using threading for different pipelines, after the post process of the frames. So they were tied to main process. And each camera frame producer was running independently in a separate process.
They all have their own memory space and no other process can access that. In this case, how do you sent data from one to other?

There comes the pitfall of multiprocessing. Processes shares data through inter-process communication (IPC) mechanism. It serializes the data, makes a copy of that data and then send it over to the other process.
The other process then de-serialize it before using.

Let's do a quick math. Assume a camera is generating 15 frames per second. The frame resolution is 1280 x 720. The float64 dtype numpy array uses 8 bytes.

Color image bytes: 1280 x 720 x 3 x 8 = 21MB

Three Camera @ 15fps = 21 x 15 x 3 = 945MB

Six cameras @ 5FPS = 21 x 5 x 6 = 630MB

If you also want save depth frame, the size increase. That is a lot of unnecessary copy-pasta. When we tried to pass the frame arrays through the queue, it quickly led to high RAM usage and noticeable lag.

#### Solution: Use Shared Memory for Fast Frame Transfer
Introducing Shared Memory. [multiprocessing.shared_memory](https://docs.python.org/3/library/multiprocessing.shared_memory.html) is a Python module that allows different processes to access and modify 
the same block of memory without copying data between them. This is useful when you're working with large data like images or arrays and want to avoid the performance overhead of inter-process communication (IPC) like queues or pipes.

Instead of each process having its own copy, they can all work with the same memory buffer—making your application faster and more memory efficient.
It works especially well with NumPy arrays, which can be easily shared and reconstructed using the shared memory block.

1) You create a shared memory block. Each shared memory block is assigned a unique name.
2) You copy your data to this memory block.
3) You send the name of your memory block to the process that needs it.
4) The other process can attach to that same shared memory block using that same name, reads the data and uses it.

As a resource for sharing data across processes, shared memory blocks may outlive the original process that created them. When one process no longer needs access to a shared memory block that might still be needed by other processes, 
the `close()` method should be called. When a shared memory block is no longer needed by any process, the `unlink()` method should be called to ensure proper cleanup.

I created a `SharedMemoryNdArray` class to pass metadata about a shared memory block. The metadata consists of information the other process needs to read that block.

```python
@dataclass
class SharedMemoryNdArray:
memory info that represents a numpy array.
    memory_name: str
    np_array_dtype: DTypeLike
    np_array_shape: tuple[int, ...]
```

This can be passed using IPC mechanism easily. The dataclass also has two helper methods to get the numpy array back from the shared memory and unlink the memory, once we are done using it.

```python
def get_np_array(self) -> NDArray:
   ... ... ...

def unlink_memory(self) -> None:
   ... ... ...
```

In this example, the CameraFrameProducer created the shared memory block and CameraFrameConsumer used it and unlinked it.

I also created a frameset class to keep track of which frame is from what camera:

```python
@dataclass
class SharedMemoryFrameset:
    color_frame: SharedMemoryNdArray
    depth_frame: SharedMemoryNdArray
    camera_config: CameraConfiguration
    timestamp: float = field(default_factory=time.time)
```


## Challenge #4: Python resource_tracker Bug Caused Memory Leaks
The resource_tracker is an internal component used by Python's multiprocessing module. Its job is to keep track of system resources e.g. shared memory blocks that are created by your program.
When the program ends or a process terminates, resource_tracker helps make sure those resources are cleaned up properly to prevent memory leaks.

However, if one process creates a shared memory block and another process unlinks (i.e., deletes) it, the resource_tracker in the original process may still try to clean it up later and throw warnings like:

`resource_tracker: There appear to be 1 leaked shared_memory objects to clean up at shutdown`

The reason is that every shared memory object I created is being tracked twice: first, when it was generated by the CameraFrameProducer processes and second, when it's consumed by the main process i.e. CameraFrameConsumer. 
This is mainly because the current implementation of the constructor of SharedMemory will register the shared memory object regardless of whether you are creating the block or just reading from it.

The main issue was, as my application run for days at a time, the resource_tracker kept tracking the names of the shared_memory block, in a dict, although they have been released in other process.
The size of the dict increased slowly, but steadily and eventually occupied all the ram until it crashed. This was the hardest bug to track because the system would crash after weeks and very hard
to follow for debugging.

#### Solution: Patch the Resource Tracker
I patched it (not a fix) by updating the resource_tracker's `register()` and `unregister()` methods. The patch is in the `utils.py` and 
called inside the camera child processes so that the resource_tracker doesn't track shared_memory names.


## Source Code
You can find the full source code and instructions in the [repository](https://github.com/mirzafahad/realsense-multicam).


## Feedback Welcome
Have thoughts, improvements, or questions? I’d love to hear from you.