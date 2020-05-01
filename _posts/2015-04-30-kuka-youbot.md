---
layout: post
title: KUKA youBot
subtitle: Sensor based HMI framework.
image: /img/kuka/cover.png
tags: [labview, robotics, fpga]
---

The KUKA youBot is a research and educational mobile robot with a 5-DOF arm. It is an ideal platform to develop applications in service robotics. 

<p align="center">
  <img src="/img/kuka/kuka.png"><br>
  Figure: KUKA youBot
</p>

The system was fusioned with three IR sensors and four flexiforce sensors. IR sensors were connected to a custom designed hardware. All sensors were then connected to roboRIO, a FPGA hardware from National Instrument. 

The sensor data was processed in the robot's on-board linux machine that was running ROS (Robot Operating System). With all these we proposed a simple sensor based HMI framework that allows teleoperation along with basic levels of autonomous.

The publication can be found [here](http://spie.org/Publications/Proceedings/Paper/10.1117/12.2177641) and [here](https://www.spiedigitallibrary.org/conference-proceedings-of-spie/9859/985904/Investigation-of-human-robot-interface-performance-in-household-environments/10.1117/12.2224247.short?SSO=1). Or download the pdf from [here](/files/Multi-Modal.pdf) and [here](/files/2016_SPIE.pdf).

<p align="center">
  <img src="/img/kuka/ir.png"><br>
  Figure: IR sensors with custom hardware and 3D printed case<br><br>
  <img src="/img/kuka/ir_sensor.png"><br>
  Figure: Field of view of IR sensor<br><br>
  <img src="/img/kuka/ir_visualizer.png"><br>
  Figure: Heatmap generated based on IR sensors<br><br>
  <img src="/img/kuka/hardware_diag.png"><br>
  Figure: Hardware Diagram
</p>



