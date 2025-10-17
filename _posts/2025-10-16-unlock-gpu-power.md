---
layout: post
title: Unlocking GPU Power
subtitle: How I Achieved Massive Speedups Leveraging CUDA in OpenCV and CuPy!
image: /img/cuda/cover.jpg
tags: [cuda, cupy, python, gpu]
comments: true
---

I was part of a team building an ML-driven, vision-based self-checkout system. The platform uses multiple cameras to capture product images, which are then passed to a model for identification. This process involves numerous computationally intensive operations. Our application ran on an Nvidia Jetson AGX Orin edge device, a resource-constrained platform compared to desktop machines. I was tasked with boosting operational speed, and since these devices have integrated Nvidia GPUs, I decided to leverage CUDA for performance gains.

Our application heavily relies on OpenCV and NumPy, both of which have CUDA-enabled variations. By using CUDA to introduce GPU parallelization, we achieved speed improvements that would have been impossible with CPU-centric computation alone.

In this article, I'll share practical examples with timing profiles demonstrating how you can easily use OpenCV-CUDA and CuPy (NumPy for CUDA) to achieve significant performance boosts.

## Prerequisites

The technologies I'll be using:

1. Nvidia Jetson AGX Orin (other Linux machines with Nvidia GPUs should work, though I haven't verified this)
2. Python 3.11.X (you can easily switch between Python versions using `pyenv`. [Check this article](https://mirzafahad.github.io/2025-10-04-switch-between-python-versions-using-pyenv-in-linux/))
3. UV Package and Project Manager ([How To Install UV](https://github.com/astral-sh/uv))

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

While we are inside the project directory, we'll capture some directory paths as environment variables, needed for building OpenCV from source. Run the following commands:

```bash
UV_PYTHON=$(uv run which python)
UV_INCLUDE=$(uv run python -c "from sysconfig import get_paths; print(get_paths()['include'])")
UV_PACKAGES=$(uv run python -c "import site; print(site.getsitepackages()[0])")
UV_NUMPY=$(uv run python -c "import numpy; print(numpy.get_include())")
UV_LIBRARY=$(uv run python -c "import sysconfig; print(sysconfig.get_config_var('LIBDIR'))")
```
   
Verify these environment values by printing them. You should see output similar to this:
   
```bash
$ echo "Python: $UV_PYTHON"
Python: /home/fahad/opencv-cupy-cuda-benchmarks/.venv/bin/python
$ echo "Include: $UV_INCLUDE"
Include: /home/fahad/.pyenv/versions/3.11.13/include/python3.11
$ echo "Packages: $UV_PACKAGES"
Packages: /home/fahad/opencv-cupy-cuda-benchmarks/.venv/lib/python3.11/site-packages
$ echo "Numpy: $UV_NUMPY"
Numpy: /home/fahad/opencv-cupy-cuda-benchmarks/.venv/lib/python3.11/site-packages/numpy/_core/include
$ echo "Numpy: $UV_LIBRARY"
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

Here's what it looks like on my machine:

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
ls -la /home/aaeon/projects/cv-experiment/.venv/lib/python3.11/site-packages/cv2/
```

You should see numerous files. Finally, test the installation:

```bash
cd /home/fahad/opencv-cupy-cuda-benchmarks
uv run python -c "import cv2; print(cv2.__version__); print('CUDA devices:', cv2.cuda.getCudaEnabledDeviceCount())"
```

On my Jetson device, this prints:

```bash
4.10.0
CUDA devices: 1
```

If you see similar output, congratulations! You now have OpenCV 4.10.0 with CUDA support installed in your UV-managed Python project.

## Quick verification of CUDA modules:

You can verify that CUDA modules are actually available:

```python
import cv2
import numpy as np

# Upload image to GPU
img = cv2.imread('image.jpg')
gpu_img = cv2.cuda_GpuMat()
gpu_img.upload(img)

# Process on GPU
gpu_gray = cv2.cuda.cvtColor(gpu_img, cv2.COLOR_BGR2GRAY)

# Download back to CPU
gray = gpu_gray.download()
```