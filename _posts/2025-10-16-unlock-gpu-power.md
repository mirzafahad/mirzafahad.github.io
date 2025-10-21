---
layout: post
title: Unlocking GPU Power
subtitle: How I Achieved Massive Speedups Leveraging CUDA in OpenCV and CuPy!
image: /img/cuda/cover.jpg
tags: [cuda, cupy, python, gpu]
comments: true
---

I was part of a team building an ML-driven, vision-based self-checkout system. The platform uses multiple cameras to capture product images, which are then passed to a model for identification. This process involves numerous computationally intensive operations. Our application ran on an Nvidia Jetson AGX Orin edge device, a resource-constrained platform compared to desktop machines. Since these devices have integrated Nvidia GPUs, we can leverage CUDA for performance gains.

Our application heavily relies on OpenCV and NumPy, both of which have CUDA-enabled variations. By using CUDA to introduce GPU parallelization, we achieved speed improvements that would have been impossible with CPU-centric computation alone.

In this article, I'll share practical examples with timing profiles demonstrating how you can easily use OpenCV-CUDA and CuPy (NumPy for CUDA) to achieve significant performance boosts.

## Prerequisites

The technologies I'll be using:

1. [Nvidia Jetson AGX Orin](https://www.amazon.com/dp/B0BYGB3WV4?utm_source=nvidia&th=1) (other Linux machines with Nvidia GPU should work, though I haven't verified this)
2. Python 3.11.X. Use `pyenv` to switch between Python versions. ([How to use pyenv](https://mirzafahad.github.io/2025-10-04-switch-between-python-versions-using-pyenv-in-linux/))
3. `UV` Package and Project Manager ([How To Install UV](https://github.com/astral-sh/uv))

## Setting Up The Project

### 1. Clone the Repository
Clone the repo to follow along: 

```bash
git clone https://github.com/mirzafahad/opencv-cupy-cuda-benchmarks.git
```
### 2. Check Your CUDA Compiler Version
Jetson devices come with the Jetpack SDK, which includes the Nvidia CUDA compiler. Let's verify the compiler version:

```bash
$ nvcc --version
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2022 NVIDIA Corporation
Built on Sun_Oct_23_22:16:07_PDT_2022
Cuda compilation tools, release 11.4, V11.4.315
Build cuda_11.4.r11.4/compiler.31964100_0
```

In my case, I have `V11.4`, so I'll need the `cupy-cuda11x` Python package, which is already included in the `pyproject.toml` file. If you have a different compiler version, update the `toml` file with the appropriate package before proceeding.

### 3. Install Packages Using UV
Make sure `UV` is installed: 
```bash
uv --version
```
Execute `sync` to install packages from the `toml` file:

```bash
cd opencv-cupy-cuda-benchmarks
uv sync
```

This creates a virtual environment in the project directory and installs all packages from the `toml` file. We'll install OpenCV with CUDA support separately.

### 4. Set Up Environment Variables

While we are inside the project directory, we'll capture some directory paths as environment variables. These tell the OpenCV build process where to find your Python installation and packages. Run the following commands:

```bash
UV_PYTHON=$(uv run which python)
UV_INCLUDE=$(uv run python -c "from sysconfig import get_paths; print(get_paths()['include'])")
UV_PACKAGES=$(uv run python -c "import site; print(site.getsitepackages()[0])")
UV_NUMPY=$(uv run python -c "import numpy; print(numpy.get_include())")
UV_LIBRARY=$(uv run python -c "import sysconfig; print(sysconfig.get_config_var('LIBDIR'))")
```

Verify these environment values by printing them. You should see output similar to this (**Note**: the following is an example what I see on my machine. Instead of `fahad` you will probably see the user you are using.):

```bash
$ echo "Python: $UV_PYTHON"
Python: /home/fahad/opencv-cupy-cuda-benchmarks/.venv/bin/python
$ echo "Include: $UV_INCLUDE"
Include: /home/fahad/.pyenv/versions/3.11.13/include/python3.11
$ echo "Packages: $UV_PACKAGES"
Packages: /home/fahad/opencv-cupy-cuda-benchmarks/.venv/lib/python3.11/site-packages
$ echo "Numpy: $UV_NUMPY"
Numpy: /home/fahad/opencv-cupy-cuda-benchmarks/.venv/lib/python3.11/site-packages/numpy/_core/include
$ echo "Library: $UV_LIBRARY"
Library: /home/fahad/.pyenv/versions/3.11.13/lib
```

Note: `UV_INCLUDE` can point to either your system's path (in my case, I'm using `pyenv`) or your virtual environment's path and both are correct.

## Installing OpenCV-CUDA in Your Project's Virtual Environment

Installing OpenCV with CUDA support requires building from source, as the pip package doesn't include CUDA support. Once built, we'll copy the binary files into our virtual environment.

### Step 1: Building OpenCV from Source

#### 1. Install System Dependencies

```bash
sudo apt-get update
sudo apt-get install -y build-essential cmake git pkg-config libgtk-3-dev \
    libavcodec-dev libavformat-dev libswscale-dev libv4l-dev \
    libxvidcore-dev libx264-dev libjpeg-dev libpng-dev libtiff-dev \
    gfortran openexr libatlas-base-dev python3-dev python3-numpy \
    libtbb2 libtbb-dev libdc1394-dev libeigen3-dev
```

#### 2. Clone and Configure OpenCV

```bash
cd ~
git clone https://github.com/opencv/opencv.git
git clone https://github.com/opencv/opencv_contrib.git
cd opencv
git checkout 4.10.0  # or your preferred version
cd ../opencv_contrib
git checkout 4.10.0
```

#### 3. Build OpenCV

The following CMake configuration tells OpenCV to build with CUDA support. The key flags are:
- `WITH_CUDA=ON`: Enables GPU acceleration.
- `CUDA_ARCH_BIN="8.7"`: Optimizes for Jetson AGX Orin's GPU architecture (adjust if using different hardware).
- `ENABLE_FAST_MATH=ON` and `CUDA_FAST_MATH=ON`: Enable mathematical optimizations for speed.
- The `PYTHON3_*` flags: Point to your UV virtual environment so OpenCV installs there.

```bash
mkdir ~/opencv/build
cd ~/opencv/build

cmake -D CMAKE_BUILD_TYPE=RELEASE \
    -D CMAKE_INSTALL_PREFIX=/usr/local \
    -D OPENCV_EXTRA_MODULES_PATH=~/opencv_contrib/modules \
    -D WITH_CUDA=ON \
    -D CUDA_ARCH_BIN="8.7" \
    -D CUDA_ARCH_PTX="" \
    -D ENABLE_FAST_MATH=ON \
    -D CUDA_FAST_MATH=ON \
    -D WITH_CUBLAS=ON \
    -D WITH_CUDNN=ON \
    -D OPENCV_DNN_CUDA=ON \
    -D WITH_GSTREAMER=ON \
    -D BUILD_opencv_python3=ON \
    -D PYTHON3_EXECUTABLE=$UV_PYTHON \
    -D PYTHON3_INCLUDE_DIR=$UV_INCLUDE \
    -D PYTHON3_LIBRARY=$UV_LIBRARY/libpython3.11.so \
    -D PYTHON3_PACKAGES_PATH=$UV_PACKAGES \
    -D PYTHON3_NUMPY_INCLUDE_DIRS=$UV_NUMPY \
    -D OPENCV_PYTHON3_INSTALL_PATH=$UV_PACKAGES \
    -D BUILD_EXAMPLES=OFF ..
```

After cmake finishes, look for a section in the output that says:

```bash
--   Python 3:
--     Interpreter:        ...
--     Libraries:          ...
--     numpy:              ...
--     install path:       ...
```

Here's what it looks like on my machine (**Note**: Notice the path has my username):

```bash
Python 3:
--   Interpreter:   /home/fahad/opencv-cupy-cuda-benchmarks/.venv/bin/python (ver 3.11.13)
--   Libraries:     /home/fahad/.pyenv/versions/3.11.13/lib/libpython3.11.so (ver 3.11.13)
--   Limited API:   NO
--   numpy:         /home/fahad/opencv-cupy-cuda-benchmarks/.venv/lib/python3.11/site-packages/numpy/_core/include (ver 2.3.3)
--   install path:  /home/fahad/opencv-cupy-cuda-benchmarks/.venv/lib/python3.11/site-packages/cv2/python-3.11
```

#### 4. Run the `make` command

```bash
make -j$(nproc)
```

This will take 1-2 hours. After completion, verify the Python bindings were built:

```bash
ls ~/opencv/build/lib/python3/
```

You should see a `.so` file. Then install:

```bash
sudo make install
sudo ldconfig
```

Now verify that your virtual environment has the `cv2` files:

```bash
ls -la ~/opencv-cupy-cuda-benchmarks/.venv/lib/python3.11/site-packages/cv2/
```

You should see numerous files. Finally, test the installation:

```bash
cd ~/opencv-cupy-cuda-benchmarks
uv run python -c "import cv2; print(cv2.__version__); print('CUDA devices:', cv2.cuda.getCudaEnabledDeviceCount())"
```

On my Jetson device, this prints:

```bash
4.10.0
CUDA devices: 1
```

If you see similar output, congratulations! You now have OpenCV 4.10.0 with CUDA support installed in your UV-managed Python project.

## Quick verification of CUDA modules

You can verify that CUDA modules are actually available:

```python
import cv2
import numpy as np

img = cv2.imread('image.jpg')

# Upload image to GPU.
gpu_img = cv2.cuda.GpuMat()
gpu_img.upload(img)

# Process on GPU.
gpu_gray = cv2.cuda.cvtColor(gpu_img, cv2.COLOR_BGR2GRAY)

# Download back to CPU
cpu_gray = gpu_gray.download()
```

## OpenCV-CUDA Benchmark

I will benchmark CPU vs GPU performance for background subtraction using OpenCV's MOG (Mixture of Gaussians) algorithm. Background subtraction identifies which parts of an image have changed. Imagine separating a person walking through a scene from the static background behind them. MOG works by building a statistical model of what the "normal" background looks like, then flagging anything different as foreground.

I'll compare standard OpenCV (CPU) implementation against OpenCV CUDA (GPU) implementation on:
1. **Static images**: Repeated processing of the same image simulates a camera watching an unchanging scene (like an empty room).
2. **Video file**: Real motion tests how well the algorithm adapts to dynamic changes (like people moving).

The `cv2.bgsegm.createBackgroundSubtractorMOG()` will run in CPU and  `cv2.cuda.createBackgroundSubtractorMOG()` is the CUDA alternative. 

```python
import cv2
# CPU background subtraction.
bg_subtractor = cv2.bgsegm.createBackgroundSubtractorMOG()
# CUDA background subtraction.
bg_subtractor = cv2.cuda.createBackgroundSubtractorMOG()
```
I ran two tests using two different inputs to simulate two different scenarios: a static background and a background with motion. For static background, I used a static image with repeated iterations. For example:

```python
image = cv2.imread(image_file)
for _ in range(150):
    bg_subtractor.apply(image, learningRate=0.1)
```
For CUDA, we also need two additional concepts: **CUDA streams** and **GPU matrices**.

**CUDA Stream**: Think of this as a "work queue" for the GPU. It's like a conveyor belt where you can place tasks and the GPU processes them in order without making the CPU wait around. Multiple streams can run in parallel, like having multiple conveyor belts working simultaneously.

**GPU Matrix (GpuMat)**: This is OpenCV's way of storing image data directly in the GPU's memory (VRAM) rather than your computer's regular memory (RAM). To process something on the GPU, you first upload it from the CPU, do the work there, then download it back when done. While moving data between the two adds some time, the GPU's processing speed more than makes up for it.

```python
bg_subtractor = cv2.cuda.createBackgroundSubtractorMOG()
stream = cv2.cuda_Stream()
gpu_frame = cv2.cuda_GpuMat()

for _ in range(150):
    gpu_frame.upload(image)
    gpu_foreground_mask = bg_subtractor.apply(gpu_frame, learningRate=0.1, stream=stream)
    gpu_foreground_mask.download()
```

**Important benchmarking considerations:**
1. **GPU warm-up**: Like a car engine, GPUs perform better after they've "warmed up." The first few operations compile and optimize code (called JIT compilation). We run warm-up iterations first so our timing measurements reflect real-world performance, not startup overhead.
2. **Synchronization**: GPUs work asynchronously, they accept work orders and process them independently while the CPU continues doing other things. To measure GPU timing accurately, we must tell the CPU to wait until the GPU truly finishes all work before stopping the timer.

Both of these are handled in the code. 

To run the code:
```bash
cd ~/opencv-cupy-cuda-benchmarks
uv run python src/benchmark/bg_subtraction_benchmark.py
```
The benchmark results are shown in the following image.

<p align="center">
  <img src="/img/cuda/bg_subtraction_benchmark.png">  
</p>

## CuPy Benchmark

In this section, I'll compare CPU (NumPy) and GPU (CuPy) performance for batch image normalization, a common preprocessing step in deep learning. Normalization rescales pixel values to a standard range, making neural networks train more effectively. Think of it like converting different currencies to US dollars so you can compare prices fairly.

I'll test three scenarios using six images:
1. **NumPy (CPU)**: Traditional CPU processing.
2. **CuPy (GPU → CPU)**: GPU processing but copying results back to CPU memory, like using a supercomputer then printing the results on paper for local use.
3. **CuPy (GPU → GPU)**: GPU processing with results staying in GPU memory. This is beneficial when downstream operations (like GPU-based inference with TensorRT) can continue processing on the GPU, eliminating CPU-GPU transfer overhead, there's no copying back and forth..

To run the code:
```bash
cd ~/opencv-cupy-cuda-benchmarks
uv run python src/benchmark/cupy_benchmark.py
```
The benchmark results are shown in the following image.

<p align="center">
  <img src="/img/cuda/cupy_benchmark.png">
</p>

## Conclusion

These benchmarks demonstrate the substantial performance gains achievable through GPU acceleration using CUDA. Both OpenCV-CUDA and CuPy provide significant speedups for computationally intensive operations, making them invaluable for resource-constrained edge devices and high-throughput applications.

Key takeaways:
- GPU acceleration shines for batch operations and repetitive computations.
- Memory transfer overhead (CPU ↔ GPU) is real but often outweighed by computation gains.
- Keeping data on the GPU throughout your pipeline maximizes performance.
- Warm-up iterations are essential for accurate GPU benchmarking.

When building vision or ML applications on Nvidia hardware, leveraging CUDA can transform your application's performance from barely viable to production-ready.