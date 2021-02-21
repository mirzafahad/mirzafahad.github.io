---
layout: post
title: Building a Man-in-the-Middle System
subtitle: Part 2 - Sniffing
image: /img/wifi/cover2.png 
tags: [hacking, attack, wireshark, ubuntu, wifi, linux, vmware, access, point, ap, rogue]  
comments: true  
---

In this part 2 of the "**Building a Man-in-the-Middle System**" tutorial, I will demonstrate how to snif WiFi packets using native command line tools on Ubuntu. I will explain each step elaborately and then at the end I will put all the commands together so that you can simply copy-paste the commands from here to your OS. So let's get started.

### Step-1: Connect WiFi Adapter to Ubuntu
First thing we are going to do is transfer the WiFi adapter connection from Windows to virtual machine (Ubuntu).

- Run the VMware player and start the virtual machine.
- After login to OS, plug in the WiFi adapter into USB.
- That should generate a prompt asking where you would like to connect your device. Choose virtual machine and press OK.

![adapter connection](/img/wifi/wifi_connect.png){: .center-block :}

- You can also add your device from the menu.

![adapter connection](/img/wifi/wifi_connect2.png){: .center-block :}

- Once that is done, click the network manager at the top right corner. It shows that WiFi adapter is active (but not connected to any network). 

![adapter connection](/img/wifi/wifi_connect2.png){: .center-block :}

- Now this is very important. You need to have a separate way to connect to internet, and not using Atheros WiFi adapter. We will use the Atheros WiFi adapter to create rogue access point for others to connect. You can have another WiFi adapter, dongle, hotspot, LTE, Ethernet, whatever, to connect to internet. We will create a bridge between your internet connection and your rogue access point so that when a user connects to your access point you can monitor the bridge and see what is happening. **In my case I am connected to internet through Ethernet.**.

### Step-2: Turn OFF Network Manager
*Network manager* on Ubuntu is a background process that takes care of all the networking related stuff. For example, when you plug in an Ethernet cable the network manager will automatically send a DHCP request to grab an IP and a default gateway. When you connect a wireless adapter it will automatically scans for access points and provide you a list.

So we must turn off the network manager. Because we want to have the full control of the Adapter so that we can change the mode (AP, Monitor), turn on/off the adapter, select channel etc. If network manager is running in the background, it won't let me do all those things. Bring up your terminal by clicking `Show Applications` and typing `terminal` in the search box:

![terminal](/img/wifi/terminal1.png){: .center-block :}  
![terminal](/img/wifi/terminal2.png){: .center-block :}

That will open the terminal window. Now execute the following command:

~~~
sudo /etc/init.d/network-manager stop
~~~

That will turn OFF the network manager. You will also see that three triangle icon is dissappeared from the top right corner.

![terminal](/img/wifi/terminal3.png){: .center-block :}  
![terminal](/img/wifi/network_manger_icon_dis.png){: .center-block :}

To turn back ON you will have to execute:

~~~
sudo /etc/init.d/network-manager start
~~~

That should bring back the three-triangle icon at the top right corner.

### Step-3: Shutdown Wireless Interface
Before we make any changes to our adapter we need to shut the interface down first. And we are going to do that by using a command called `ifconfig`. It is a system administration utility tool in Ubuntu for network interface configuration. In layman's terms, it is a command you type on the terminal to manipulate network interfaces. If you want to see all the network interfaces on your system type below command on your terminal:

~~~
ifconfig -a
~~~

![ifconfig](/img/wifi/ifconfig.png){: .center-block :}

`ens33` is my ethernet interface, which  is `UP`. `lo` is the loopback. And `wlxc01c3006xxxxx` is my Atheros WiFi adapter. The flags of my adapter doesn't show `UP` so that means that interface is already down. But if it was up, to shut down execute:

~~~
sudo ifconfig wlxc01c3006xxxxx down
~~~

You should use your adapter's interface name instead of `wlxc01c3006xxxxx`. 

### Step-4: Switch Wireless Interface into Monitor Mode
To sniff WiFi packets we will have to change your adapter's mode into **Monitor** mode, default is **Managed** mode. And for that we will use another command line tool, `iwconfig`. It is similar to ifconfig, but is dedicated to the wireless interfaces. It is used to set the parameters of the network interface which are specific to the wireless operation (for example : the frequency). If you execute `iwconfig` on terminal it will show some specific parameters of your adapter:

![iwconfig](/img/wifi/iwconfig.png){: .center-block :}

Notice, the mode is set to **Managed**. To change the mode to **Monitor**, execute:

~~~
sudo iwconfig wlxc01c3006xxxxx mode monitor
~~~

To check if the mode changed or not execute `iwconfig` again.

![iwconfig](/img/wifi/iwconfig2.png){: .center-block :}


### Step-5: Bring Up the Wireless interface
Now let's bring up your wireless interface. Execute:

~~~
sudo ifconfig wlxc01c3006xxxxx up
~~~

![ifconfig](/img/wifi/ifconfig2.png){: .center-block :}

### Step-6: Select Which Channel to Monitor
All versions of Wi-Fi up to and including 802.11n (a, b, g, n) operate between the frequencies of 2400 and 2500MHz. These 100MHz are separated into 14 channels of 20MHz each (see diagram below).

![wifi channel](/img/wifi/wifi_channel.png){: .center-block :}

You can select which channel do you want to sniff the packets from. Or you can write a bash script to cycle between channels. To select one specific channel:

~~~
sudo iwconfig wlxc01c3006xxxxx channel <channel no>

e.g.

sudo iwconfig wlxc01c3006b533 channel 1
~~~

Later in this tutorial I will show how you can write a bash script to cycle between channels.

### Step-7: Start your sniffing
If all the commands were executed succesfully, your adapter already started sniffing WiFi packets. Now let's print/dump the sniffed packets into the terminal:

~~~
sudo tcpdump -i wlxc01c3006xxxxx
~~~

You should see all kinds of packets just printing on the terminal one after another. To stop, press `Ctrl + C`. A snippet of output of `tcpdump` is shown below:

![tcpdump](/img/wifi/tcpdump.png){: .center-block :}

As we can see all the packets are from channel 1. You can change the channel on the fly. To do that just open another terminal window and execute channel change command while tcpdump is still running on the other terminal window.

### Step-8: Changing channels with scripting
