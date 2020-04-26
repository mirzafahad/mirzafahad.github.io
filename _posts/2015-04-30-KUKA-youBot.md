---
layout: post
title: KUKA youBot
subtitle: Sensor based HMI framework.
image: /img/kuka/cover.jpg
---

The KUKA youBot is a research and educational mobile robot with a 5-DOF arm. It is an ideal platform to develop applications in service robotics. 

<p align="center">
  <img src="/img/kuka/kuka.png">
</p>

The system was fusioned with three IR sensors and four flexiforce sensors. IR sensors were connected to a custom designed hardware. All sensors were then connected to roboRIO, a FPGA hardware from National Instrument.  The sensor data was processed in the robot's on-board linux machine that was running ROS (Robot Operating System). With all these we proposed a simple sensor based HMI framework that allows teleoperation along with basic levels of autonomous.

<p align="center">
  <img src="/img/kuka/ir.png"><br>
  Figure: IR sensors with custom hardware and 3D printed case<br>
  <img src="/img/kuka/ir_sensor.png"><br>
  Figure: Field of view of IR sensor<br>
  <img src="/img/kuka/ir_visualizer.png"><br>
  Figure: Heatmap generated based on IR sensors<br>
  <img src="/img/kuka/hardware_diag.png"><br>
  Figure: Hardware Diagram
</p>



The publication can be found [here](http://spie.org/Publications/Proceedings/Paper/10.1117/12.2177641).