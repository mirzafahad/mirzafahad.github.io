---
layout: post
title: Unlocking GPU Power
subtitle: How I Achieved Massive Speedups Leveraging CUDA in OpenCV and CuPy
image: /img/pyenv/cover.jpg
tags: [opencv, cuda, cupy, gpu, Parallelization, python, linux]
comments: true
---

To Be Continue.

For installing and managing several Python versions, Pyenv is an excellent tool. It keeps the system tidy and clear of unused package bloat and enables developers to access newer versions of Python easily. Additionally, it allows users to specify the Python version that a particular project uses and immediately transition to that version. 

The following steps will work both on X86_64 and ARM64 machines.


---
## Step 1: Install and Update Dependencies
Starting any installation process by updating system packages is usually a good idea:

```bash
sudo apt update -y
```

Now run the following command to install all of pyenv’s dependencies:

```bash
sudo apt install -y make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev python-openssl git
```

## Step 2: Download the Pyenv script in Ubuntu
Download the Pyenv script using the following command:

```bash
curl https://pyenv.run | bash
```

## Step 3: Set the Environment Up
Run the following block of commands to set certain crucial environment variables and set up pyenv autocompletion to correctly configure pyenv for use on the system:

```bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
```

Now **restart** the shell or open a new shell.


## Step 4: Look over the Installation
Check what Python versions are currently available:

```bash
pyenv install --list
```

Let’s install Python 3.11.13:

```bash
pyenv install 3.11.13
```

If this command takes a while to execute, do not be alarmed. Pyenv is building it from the source code. Once that is done check if it is installed:

```bash
pyenv versions
```

Change Python to version 3.11.13:

```bash
pyenv global 3.11.13
```

Now check the Python version and where it is located:

```bash
python --version
which python
```

