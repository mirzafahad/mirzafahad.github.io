---
layout: post
title: Optimizing Multiple Realsense Camera Streaming on Jetson Orin
subtitle: How multiprocessing, shared memory, and pyrealsense helped me push Jetson Orin to its limits!
image: /img/realsense/cover.jpg
tags: [camera, memory, python, realsense]
comments: true
---

When I first set out to stream video from multiple Intel Realsense cameras on a Jetson Orin, I underestimated how quickly things would get complicated. 
What seemed like a straightforward task, plug in the cameras and start reading frames, turned into a deep dive into Python `multiprocessing`, memory management, the quirks of `Pyrealsense2` library, 
and even patching a Python bug.

In this post, I’ll walk you through how I got real-time streaming from up to six Realsense cameras working on the Jetson Orin. 
The key was leveraging Python’s **multiprocessing** for parallelism, **shared memory** for efficient data transfer, and working around **pyrealsense2**'s limitations in multi-process environments.

If you're working on a vision-based edge project or just trying to push more out of limited hardware, this breakdown of lessons and fixes may save you hours (or days) of debugging.

### Assumption
This guide assumes you're familiar with:

- Python (I've used [3.11.9](https://www.python.org/downloads/release/python-3119/))
- The [multiprocessing](https://docs.python.org/3/library/multiprocessing.html) module. 
- The [pyrealsense2](https://github.com/IntelRealSense/librealsense/blob/master/wrappers/python/readme.md). 

I did explain the [Shared Memory](https://docs.python.org/3/library/multiprocessing.shared_memory.html) briefly and how I have created a wrapper for ease of use.
Grab the code from (here)[https://github.com/mirzafahad/realsense-multicam] to follow along.


---
## Challenge #1: When the Cameras Overwhelm the Jetson
My initial implementation was sequential:

- Grab a frame from camera 1
- Put it in a queue
- Repeat for camera 2...3...N
- Loop back to the first

This worked when post-processing was minimal. But as my application grew more complex, frames started dropping. 
Why? Because in `pyrealsense2`, if you don’t pull a frame in time, it gets dropped. Not buffered. Dropped.

#### First Attempt: Threading
I turned to Python's [threading](https://docs.python.org/3/library/threading.html) module to read from multiple cameras concurrently. 
Unfortunately, Python threads aren’t truly parallel due to the Global Interpreter Lock (GIL). They context-switch, which wasn’t fast enough. As my application scaled, threading became a bottleneck.

#### Solution: True Parallelism with Multiprocessing
Enter the [multiprocessing](https://docs.python.org/3/library/multiprocessing.html) module. By spawning one process per camera, I bypassed the GIL. 
Each process ran independently, with its own memory space and access to a camera, fully utilizing the Jetson’s CPU cores. This brought a significant performance boost.


---
## Challenge #2: Pyrealsense2 and Multiprocessing Don't Get Along
At first, I tried wrapping the Realsense logic inside a class that inherited from `multiprocessing.Process`. 
That failed. Turns out, `pyrealsense2` objects aren’t picklable, i.e. they cannot be serialized using the `pickle` module, which means they can’t be serialized to pass into a new process.

*Note: Pickling is the process of converting a Python object into a byte stream so it can be saved to a file or sent over a network.*


#### Solution: Initialize Pyrealsense2 instance Inside run() Instead of the constructor
The workaround was to move all Realsense initialization to the multiprocessing's `run()` method. This avoids pickling entirely for the `pyrealsense2`. 
I used a helper method called `init_in_run()` to handle all unpicklable setup at runtime:

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
This was the first major breakthrough.

---

## Challenge #3: Efficient Frame Sharing Between Processes
Once each camera ran in its own process, the problem became how do I get frames into the main process? Because the processes each have their own memory space. So how do you transfer data between two process
who has no clue of other memory spaces? 

Here comes the pitfall of multiprocessing. Processes share data through an inter-process communication (IPC) mechanism. It serializes the data, makes a copy of that data, and then sends it over to the other process.
The other process then de-serialize it before using. This caused massive memory copies and delays.

Let’s do the math:

`float64 dtype numpy array uses 8 bytes for each content`

1280x720 RGB image = 1280 × 720 × 3 × 8 bytes = ~21MB per frame

3 cameras @ 15fps = 21 × 15 × 3 = 945MB/sec

6 cameras @ 5fps = 21 × 5 × 6 = 630MB/sec

And that’s just color. Add depth, and you're quickly overwhelmed. The application was wasting a lot of the CPU cycle serializing, copying and de-serializing.

#### Solution: Use Shared Memory for Fast Frame Transfer
Introducing Shared Memory. With [multiprocessing.shared_memory](https://docs.python.org/3/library/multiprocessing.shared_memory.html) multiple processes can access the same memory block directly, zero copying. 
This is useful when you're working with large data like images or arrays and want to avoid the performance overhead of inter-process communication (IPC) like queues or pipes. 

Each camera producer writes to a (uniquely) named shared memory block. The consumer process accesses it using the block’s name. If you don't provide a name, the module will generate a random-unique name.




#### How to use shared memory
Shared Memory works especially well with NumPy arrays, which can be easily shared and reconstructed using the shared memory block. The frames we receive from `pyrealsense2` are a numpy array.

```python 
frameset = self.pipeline.wait_for_frames(5000)
color_frame = np.asarray(frameset.get_color_frame().get_data())
color_frame_shm = self._convert_np_array_to_shared_memory_array(color_frame)
```

Inside `_convert_np_array_to_shared_memory_array()`, first we get a block of shared memory of numpy array size:

```python
shared_memory = SharedMemory(name=sm_name, create=True, size=np_array.nbytes)
```

Note, the `create` argument is set to `True`. This tells `SharedMemory` that we want to create this block. Then, we create a Numpy instance and ask it to use that shared memory block for saving.

```python
sm_np_array: NDArray = np.ndarray(
	shape=np_array.shape,
	dtype=np_array.dtype,
	buffer=shared_memory.buf,
)
```

Next, copy the data to that new numpy array.

```python
np.copyto(dst=sm_np_array, src=np_array)
```

They way the project is structured we don't use the frame where we created so we must close it here (not unlink) before returning the metadata.

```python
shared_memory.close()

# We can read the data as long as we know the name of the memory.
return SharedMemoryNdArray(
	memory_name=shared_memory.name,
	np_array_dtype=np_array.dtype,
	np_array_shape=np_array.shape,
	)
```

Note: Shared memory blocks may outlive the original process that created them. When one process no longer needs access to a shared memory block that might still be needed by other processes, 
the `close()` method should be called. When a shared memory block is no longer needed by any process, the `unlink()` method should be called to ensure proper cleanup.



I created a `SharedMemoryNdArray` dataclass to pass shared memory metadata through a queue. The metadata consists of information the other process needs to read that block.

```python
@dataclass
class SharedMemoryNdArray:
memory info that represents a numpy array.
    memory_name: str
    np_array_dtype: DTypeLike
    np_array_shape: tuple[int, ...]
```

This can be passed using the IPC mechanism easily. The dataclass also has helper methods to get the numpy array back from the shared memory:

```python
def get_np_array(self) -> NDArray:
    shared_memory = SharedMemory(name=self.memory_name)

    # Create a new numpy array that uses the shared memory.
    sm_numpy_array: NDArray = np.ndarray(
        shape=self.np_array_shape,
        dtype=self.np_array_dtype,
        buffer=shared_memory.buf,
    )
    numpy_array = sm_numpy_array.copy()
    shared_memory.close()
    return numpy_array
```

Notice how we created a shared memory instance with `create = False` and passing a name. 
It will read that named memory, in this case.

I have a method to unlink the memory when we need to:
```python
def unlink_memory(self) -> None:
    shared_memory = SharedMemory(name=self.memory_name)
    shared_memory.close()
    shared_memory.unlink()
```

First you create the shared memory instance. Then close it and unlink it to free the memory block.


I also created a frameset class to keep track of which frame is from what camera:

```python
@dataclass
class SharedMemoryFrameset:
    color_frame: SharedMemoryNdArray
    depth_frame: SharedMemoryNdArray
    camera_config: CameraConfiguration
    timestamp: float = field(default_factory=time.time)
```

Our `CameraFrameConsumer` only display the frames. It has a method call `show_frames()`. We unlink the memory here.

```python
def show_frames(self) -> None:
    while True:
        # Get a frame from the multiprocessing.queue
        frameset = self.frame_q.get()  # type: SharedMemoryFrameset
        
        ... ... ...
        
        # Once we display the frame, unlink it, 
        # so that we can free the shared memory.
        frameset.unlink_all_memory()  
        # This will unlink both color and depth frame memory.
```

---
## Challenge #4: Python resource_tracker Bug Caused Memory Leaks
This is the sneaky part.

The `resource_tracker` is an internal component used by Python's multiprocessing module. It keeps track of shared memory objects to clean them up automatically. But if:

- Process A creates a shared memory block
- Process B unlinks it

Then, when Process A exits, it tries to clean it up again, fails, and throws a warning:

`resource_tracker: There appear to be 1 leaked shared_memory objects to clean up at shutdown`

The reason is that every shared memory object that has been created is being tracked twice: first, when it was generated by the `CameraFrameProducer` process and second, when it's consumed by the main process, i.e. `CameraFrameConsumer`. 
This is mainly because the current implementation of the constructor of `SharedMemory` will register the shared memory object regardless of whether you are creating the block or just reading from it.

Even worse, over long periods, the `resource_tracker` will keep tracking the names of the shared memory block, in a dict, of already deleted blocks by the other process.
The size of the dict will increase slowly but steadily and eventually will occupy all the ram until it crashes. 

#### Solution: Patch the Resource Tracker
I patched it by updating the `resource_tracker`'s `register()` and `unregister()` methods. The patch is called inside the camera child processes 
so that the `resource_tracker` doesn't track shared memory names anymore in the child process.

This is not a full fix, it’s a monkey-patch, but it works well enough for long-running applications.

The patch lives in `utils.py`.


## Docker
If you use a docker container, you will need to adjust the `shm_size` to make sure it will have enough shared memory block to let your application use. 
Start with a large size if you are not sure how much you might need (e.g. `shm_size: "16gb"`).


## Source Code
You can find the full source code and instructions in the [repository](https://github.com/mirzafahad/realsense-multicam).


## Feedback Welcome
Have thoughts, improvements, or questions? I’d love to hear from you. Feel free to [open an issue](https://github.com/mirzafahad/realsense-multicam/issues) or reach out directly.

## Note:
This article also appears on [Medium](https://medium.com/@fahadmirza8/optimizing-multiple-realsense-camera-streaming-on-jetson-orin-e76c994ab09e).