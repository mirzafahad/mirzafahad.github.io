---
layout: post
title: Unlocking GPU Power
subtitle: How I Achieved Massive Speedups Leveraging CUDA in OpenCV and CuPy!
image: /img/cuda/cover.jpg
tags: [cuda, cupy, python, gpu]
comments: true
---

I was part of a team where we were building a ML-driven and vision-based self-checkout system. The platform has multiple cameras to take pictures of products that then passed to a model to determine what's in the picture. It consists of lots of computationally heavy operations. The application was running on an Nvidia Jetson AGX Orin edge device. Compare to a desktop machine this is already a resource constraint device. I was tasked to boost the operational speed. As these devices has integrated Nvidia GPU, i decided to use CUDA to get a speed boost.

Our application heavily relies on OpenCV and Numpy. They both have a CUDA variation. Using CUDA to introduce GPU paralleization in our application boosted the speed to an achievable goal, which wasn't otherwise possible with cpu centric computation.

In this article, I will show some simple example, with timing profile, that how can you easily use OpenCV-CUDA and CuPy (NumPy for CUDA) to get a significant boost in speed.

## Prerequisite

The tech I will be using:

1) Nvidia Jetson AGX Orin (any other linux machine with Nvidia GPU might also work, but I haven't verified).
2) Python 3.11.X (You can easily switch between python versions using `pyenv`. [Check this article](https://mirzafahad.github.io/2025-10-04-switch-between-python-versions-using-pyenv-in-linux/))
4) UV Package and Project Manager ([How To Install UV](https://github.com/astral-sh/uv))

## Setup The Project

1. Clone the repo to follow along: 

   ```bash
   git clone https://github.com/mirzafahad/opencv-cupy-cuda-benchmarks.git
   ```

2. Jetson comes with Jetpack SDK installed that has Nvidia CUDA compiler. Let's check what compiler version we have:
   
   ```bash
   $ nvcc --version
   nvcc: NVIDIA (R) Cuda compiler driver
   Copyright (c) 2005-2022 NVIDIA Corporation
   Built on Sun_Oct_23_22:16:07_PDT_2022
   Cuda compilation tools, release 11.4, V11.4.315
   Build cuda_11.4.r11.4/compiler.31964100_0
   ```

   According to above I have `V11.4`. So I will need `cupy-cuda11x` Python package, which is already added in the `pyproject.toml` file. If you have a different compiler version, add the appropriate package in the `toml` file before the next steps.

3. Make sure `UV` is installed: `$ uv --version` 

4. Execute `sync` to install packages from the `toml` file:

   ```bash
   cd opencv-cupy-cuda-benchmarks
   uv sync
   ```

   This will create a virtual environment in the project directory and install all the packages from the `toml` file. We will install the opencv with CUDA support separately.

5. While we are already inside the project, we will pull some of the directory path into environment variables that we will need when we build the opencv from source. Run the following commands:

   ```bash
   UV_PYTHON=$(uv run which python)
   UV_INCLUDE=$(uv run python -c "from sysconfig import get_paths; print(get_paths()['include'])")
   UV_PACKAGES=$(uv run python -c "import site; print(site.getsitepackages()[0])")
   UV_NUMPY=$(uv run python -c "import numpy; print(numpy.get_include())")
   UV_LIBRARY=$(uv run python -c "import sysconfig; print(sysconfig.get_config_var('LIBDIR'))")
   ```
   
   Once you do the above, print those environment values to make sure they are correct. You should see something similar to these:
   
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
   
   Notice `UV_INCLUDE` can be either your system's path (in my case I am using `pyenv`) or your virtual environment's path and both are correct.

## How To Install OpenCV-CUDA in Your Project's Virtual Environment

Installing OpenCV with CUDA support requires building OpenCV from source, since the pip package doesn't include CUDA support. Once we build it we will copy binary file into our virtual environment. Let's build OpenCV from source:

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

After cmake finishes, look through the output for a section that says:

```bash
--   Python 3:
--     Interpreter:        ...
--     Libraries:          ...
--     numpy:              ...
--     install path:       ...
```

This is what it looks like in my machine:

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

This will take 1-2 hours. After it completes, verify the Python bindings were built:

```bash
ls ~/opencv/build/lib/python3/
```

You should see an `so` file there. Then install:

```bash
sudo make install
sudo ldconfig
```

Now let's check if your virtual environment has `cv2` files:

```bash
ls -la /home/aaeon/projects/cv-experiment/.venv/lib/python3.11/site-packages/cv2/
```

It should have lot of files. Now finally test:

```bash
cd /home/fahad/opencv-cupy-cuda-benchmarks
uv run python -c "import cv2; print(cv2.__version__); print('CUDA devices:', cv2.cuda.getCudaEnabledDeviceCount())"
```

On my Jetson device it prints:

```bash
4.10.0
CUDA devices: 1
```

If you see something similar, congratulation it worked. You now have OpenCV 4.10.0 with CUDA support installed in your UV-managed Python project. 

## Quick verification of CUDA modules:

You can test that CUDA modules are actually available:

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