---
layout: post
title: Unlocking GPU Power
subtitle: How I Achieved Massive Speedups Leveraging CUDA in OpenCV and CuPy!
image: /img/cuda/cover.jpg
tags: [cuda, cupy, python, gpu]
comments: true
---

When I first set out to stream video from multiple Intel Realsense cameras on a Jetson Orin, I underestimated how quickly things would get complicated. 
What seemed like a straightforward task, plug in the cameras and start reading frames, turned into a deep dive into Python `multiprocessing`, memory management, the quirks of `Pyrealsense2` library, 
and even patching a Python bug.

In this post, I’ll walk you through how I got real-time streaming from up to six Realsense cameras working on the Jetson Orin. 
The key was leveraging Python’s **multiprocessing** for parallelism, **shared memory** for efficient data transfer, and working around **pyrealsense2**'s limitations in multi-process environments.
