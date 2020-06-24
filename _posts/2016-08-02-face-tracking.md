---
layout: post
title: Face Tracking with OpenCV
subtitle: With movable camera!
gh-repo: mirzafahad/FaceTracking_openCV_arduino 
gh-badge: [star, fork, follow]
tags: [arduino, robotics, image processing, opencv]
comments: true
---

There are many fun projects and nifty DIY hacks involving image processing. But it can be daunting if you have to start from scratch. Thanks to open source community for a great library such as OpenCV. It is easy to work with, you can up and running in a couple of hours and can do a lot of cool stuff. To understand the functionality of the OpenCV, I decided to do a simple project. 

A camera that will be connected to a PC will track a human face that is in its field of view and will try to keep it in the middle of the window. Very basic, I know, but sounds cool, right? The original library has been written in C++ and ported to various other languages. For my project, I will be using [Processing](http://processing.org/). 

### Software
Processing has tutorials about OpenCV, don't forget to [check it out](http://github.com/atduskgreg/opencv-processing). Among many examples listed on that page, there is one called 'FaceDetection' (how convenient!). The code is self-explanatory. 

This camera module (shown below) is a cheap endoscopy camera I bought from eBay.

![](/img/face_tracking/camera.png){: .center-block :}

After you solder the wires with the accessory board (provided with the camera) it will show up as a webcam in windows. You can use any webcam though that is compatible with your OS. Once you connect the camera to your PC/Laptop, run the example. It should work, as it is described in the 'FaceDetection' example.

### Hardware
When you run the examples you will see, on your PC/Laptop, that a green square appears on the webcam view around your face. You can get the Cartesian point of the top left corner and width-height of that green square. With these, you can calculate the center of the square. So, the hardware's main task will be to check continuously if the green square's center is the same as the webcam window's (640x480) center or not. If not pan-tilt the camera until it is.

To get rid of the jitter of the camera movement, I set an acceptable error of 20%. You can play with that parameter according to your needs. This is how the setup looked like:

<p align="center">
  <img src="/img/face_tracking/hw1.png">    <img src="/img/face_tracking/hw2.png">
</p>


Here is a demo:

[![](/img/face_tracking/vdo_thumb.png){: .center-block :}](https://youtu.be/sjTVGY5g7gM)


The code is available [here](https://github.com/mirzafahad/face_tracking_open_cv_arduino).
