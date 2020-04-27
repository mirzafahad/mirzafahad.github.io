---
layout: post
title: Zeno, A Social Robot
subtitle: For early detection of Autism!
image: /img/zeno/cover.jpg
tags: [labview, robotics, avr, power, fpga]
---

Zeno, a human like robot from Robokind, used in our lab for early detection of Autism in children. It has 8 DOF arms and 6 DOF face. The arms used [Dynamixel motors](http://www.robotis.us/dynamixel/).

There is a Kinect with this robot that can detect Human skeleton and then imitate the subject. I used Labview with myRIO to interface with Kinect and Dynamixel actuators. Designed a custom power supply board to provide supply to myRIO, Dynamixels and head's servo with protective measures.

<p align="center">
  <img src="/img/zeno/4.jpg">  
<br>Figure:System Overview
</p>
<p align="center">
  <img src="/img/zeno/5.png">  
  <img src="/img/zeno/7.png">
  <br> Figure: User Interface on LabVIEW and myRIO with custom board
</p>

A video involving inverse kinematics for arms only can be seen here:

[![](/img/zeno/video_thumbnail.png)](https://youtu.be/e4Jsf03_MFs)