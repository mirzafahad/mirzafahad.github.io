---
layout: post
title: Build a Man-in-the-Middle System
subtitle: Part 3 - Access point and Bridging
image: /img/wifi/cover3.png 
tags: [hacking, attack, wireshark, ubuntu, wifi, linux, vmware, access, point, ap, rogue]  
comments: true  
---

In this part 3 of the "**Build a Man-in-the-Middle System**" tutorial, I will demonstrate how to set up your very own rogue access point where people will connect to you. You can use this technique anywhere there’s a WiFi hotspot. And all with open source tools!


# 1. Access Point
Before we get started, make sure you have two WiFi interfaces or one WiFi and one Ethernet interface. One will be used for creating access point and the other one will be used for internet. Because you will need to provide the internet access to your users. If not, they will figure something is wrong and will disconenct from your access point. **I will be using Ethernet**. But the instructions are same either way.

hostapd will give us access point feature. THis will turn our WiFi adapter into access point mode.  

Create AP configuration file:
1. WiFi interface
2. Bridge Interface
3. WiFi driver
4. Hardware mode: a, b, g, n
5. SSID/NAME entice your target to connect to you
6. Channel

# 2. Bridging
Will create a virtual bridge betyween our two interfaces. get our target out to real internet so that they dont know that we are actually in the middle.