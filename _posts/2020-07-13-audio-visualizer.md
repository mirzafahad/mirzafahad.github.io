---
layout: post
title: Audio Visualizer
subtitle: Using BLE and an Android App!
gh-repo: mirzafahad/stm32_tflite_sine
gh-badge: [star, fork, follow]
image: /img/audio/cover.png 
tags: [nrf52832, adafruit, feather, c++, android, audio, led, microcontroller, bluetooth]  
comments: true  
---

Because of the unprecedented pandemic and work-from-home mandate, I realized I have been spending an unhealthy amount of time in front of my PC. Either for work, mindlessly browsing YouTube and watching cat videos, or playing video games. 

My workstation was badly in need of a major overhaul. To bring <b><font color="red">c</font><font color="green">o</font><font color="purple">l</font><font color="blue">o</font><font color="orange">r</font></b> at my workspace I made an audio visualizer using LED strips. 

There are many off-the-shelf solutions out there. LED strips come in different types and sizes. They even come with controllers. You can choose to control the strip using __IR Remote__, your phone (__Bluetooth__), or even Alexa (__Wi-Fi__). If you go to [AliExpress](https://www.aliexpress.com/wholesale?catId=0&initiative_id=SB_20200715235024&SearchText=led+strip) you can get a complete kit in less than $20.

But I had very specific requirements:
- I wanted to play music from my desktop, not from my phone, and not streaming anything wirelessly. 
- I wanted LEDs to react to different audio spectrum amplitude i.e. treble, middle, base, etc.
- I wanted to generate my custom animations.

Some off-the-shelf products had __audio mode__. But they came only in two flavors. Either you play music on your phone or it will use an on-board microphone to react to "__any__" sound. 

The microphone solution would have been okay, but as it would react to any sound, I bet it would have ended up as annoying. Also, none of those products could distinguish audio spectrums. So, I had to go out and build this for myself. 

As work progressed, I wanted to add more features. For example, static backlight or cycle through color spectrum like a <b><font color="red">r</font><font color="green">a</font><font color="purple">i</font><font color="blue">n</font><font color="orange">b</font><font color="hotpink">o</font><font color="brown">w</font></b>, etc. At first, I wanted to cycle between different modes using buttons. But I quickly realized that it is not sustainable. So, I build an android app to manage that. Here is a quick demo:

![Rainbow mode](/img/audio/visualizer.gif){: .center-block :}    


If you are interested to make one for yourself I wrote a how-to on [Instructables](coming soon).
