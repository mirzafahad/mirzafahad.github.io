---
layout: post
title: Build a Man-in-the-Middle System
subtitle: Part 1 - Introduction
image: /img/wifi/cover.png 
tags: [hacking, attack, wireshark, ubuntu, wifi, linux, vmware, access, point, ap, rogue]  
comments: true  
---

In this four-part tutorial, I will demonstrate how you can build a simple **Man-in-the-Middle** system using **Rogue WiFi Access Point**. In this first part, I will cover the installation of pre-requisite tools to get started. 

{: .box-warning}
**Note:** I am **NOT** going to show how to decrypt TCP/IP packets. That is out of this tutorial's scope.

# What is a Man-in-the-middle attack?  
A man-in-the-middle attack is a form of [cyber-attack](https://en.wikipedia.org/wiki/Cyberattack) where the attacker sits in between two parties who think that they are communicating with each other without knowing that all their communication is going through the attacker, who can simply listen to their *conversation* and/or can alter the communication. [Wikipedia](https://en.wikipedia.org/wiki/Man-in-the-middle_attack#Example) has a great example:

![mitm block diagram](/img/wifi/man_in_the_middle_attack.png){: .center-block :}

*Suppose Alice wishes to communicate with Bob. Meanwhile, Mallory wishes to intercept the conversation to eavesdrop and optionally to deliver a false message to Bob.*

*First, Alice asks Bob for his public key. If Bob sends his public key to Alice, but Mallory is able to intercept it, a Man-in-the-middle (MITM) attack can begin. Mallory sends Alice a forged message that appears to originate from Bob, but instead includes Mallory's public key.*

*Alice, believing this public key to be Bob's, encrypts her message with Mallory's key and sends the enciphered message back to Bob. Mallory again intercepts, deciphers the message using her private key, possibly alters it if she wants, and re-enciphers it using the public key she intercepted from Bob when he originally tried to send it to Alice. When Bob receives the newly enciphered message, he believes it came from Alice.*

# What our MITM system will look like?
We will create a WiFi access point for general users to connect to. We will pretend that we are a legit WiFi Access Point (e.g. *StarbucksGuest*, *AT&T_Free*, *Walmartwifi_2.4*) so that they will connect to the access point to use free internet. We will surely provide them the internet access but all their communication will go through our looking glass.

{: .box-error}
**Note:** Which is why you should never connect to a free WiFi access point and then start login into all your financial accounts. It is unlikely that any financial institutes pass your credentials in plain text, but why should we take the risk.


# What will we need?

### 1. WiFi Adapter
We will need an external WiFi adapter, which will be used to create an access point. The WiFi adapter needs to support **AP mode** and **Monitor mode**. I am using [this WiFi adapter](https://www.amazon.com/802-11n-150Mbps-Wireless-Adapter-Network/dp/B07FVRKCZJ/ref=sr_1_4?dchild=1&keywords=atheros+ar9271&qid=1610123789&sr=8-4), which uses Atheros AR9271 chipset. So any adapter with Atheros AR9271 should work. If you can't find it on Amazon, check Aliexpress. But if you already have an adapter or want to buy another adapter you can check if the chipset is supported on Linux and supports both Monitor and AP mode.

#### 1.1 How to find a WiFi adapter's chipset?
- If you don't know the chipset of your adapter, first check the manufacturer's website. Sometimes they will mention the chipset in their user-manual or on their website.
- If your adapter/router has an FCC ID, you can use that to look up the chipset. For example, at the back of my Linksys router I have this:

![linksys router](/img/wifi/linksys.jpg){: .center-block :}

- The FCC-ID is `Q87-EA8300`. Google `fcc id search` or just go [here](https://www.fcc.gov/oet/ea/fccid) and type the ID as shown below (don't forget the hyphen):

![fcc search](/img/wifi/fcc.png){: .center-block :}

- Let's choose the latest entry and click on `Detail`.

![fcc list](/img/wifi/fcc_list.png){: .center-block :}

- Now click on `Internal Photos`.

![fcc internal photos](/img/wifi/internal_photos.png){: .center-block :}

- Now scroll through the images and try to find the wireless chipset. Usually, the shielded part of a board contains the wireless chipset (shown below).

![fcc shielded](/img/wifi/internal_photos2.png){: .center-block :}

- We see there are three ICs under the shields. We need to find out what are those. Keep scrolling the document.

![unshielded ics](/img/wifi/internal_photos3.png){: .center-block :}

- The left one is a WLAN SoC, [QCA9886](https://www.qualcomm.com/products/qca9886), from Qualcomm.

![QCA9886 ic](/img/wifi/internal_photos4.png){: .center-block :}

- The right one is a WiFi SoC, [IPQ4019](https://www.qualcomm.com/products/ipq4019), from Qualcomm too.

![IPQ4019 ic](/img/wifi/internal_photos5.png){: .center-block :}

- Right next to it is an Ethernet Transceiver, QCA8075.

![QCA8075 ic](/img/wifi/internal_photos6.png){: .center-block :}

#### 1.2 Checking Linux Support
Let's see how to check if a chipset is supported on Linux. First, go to `wireless.wiki.kernel.org`. On the top-right search-box search for your chipset. If I search for *AR9271* this is what I get:

![linux wireless](/img/wifi/linux_wireless.png){: .center-block :}  
![linux wireless](/img/wifi/linux_wireless2.png){: .center-block :}

Click on the matching pagenames link. It will take you to the `ath9k_htc` driver page. There you will find the supported chipsets:

![linux wireless](/img/wifi/linux_wireless3.png){: .center-block :}

Scroll down for *Supported Features*. There we see it supports both *Monitor* and *AP* mode.

![linux wireless](/img/wifi/linux_wireless4.png){: .center-block :}

### 2. Linux: Kali or Ubuntu
We will be doing everything in Linux OS. If you are a Windows fan (like me!), then fear not, we will be using a [Virtual Machine](https://en.wikipedia.org/wiki/Virtual_machine), VMware specifically. I will be using two flavors of Linux, Kali Linux and Ubuntu. Kali Linux is a Debian-derived Linux distribution designed for digital forensics and penetration testing. Ubuntu is a Linux distribution based on Debian and composed mostly of free and open-source software. 

As Ubuntu is ubiquitous, I will provide the screenshots, examples for Ubuntu and then will mention the differences, if any, for the Kali Linux.

#### 2.1 Installing VMware

Download [VMware Workstation Player](https://www.vmware.com/products/workstation-player/workstation-player-evaluation.html) (at the time of writing the version was 16.0). Double click the installer to start the installation.

![vmware](/img/wifi/vmware1.png){: .center-block :}

If you want to use the VMware console add it into the system PATH. In this tutorial we won't be using that, so you can deselect it.

![vmware path](/img/wifi/vmware2.png){: .center-block :}

![vmware](/img/wifi/vmware3.png){: .center-block :}

![vmware](/img/wifi/vmware4.png){: .center-block :}

![vmware](/img/wifi/vmware5.png){: .center-block :}

If the installer asks for a reboot, choose yes.

![vmware](/img/wifi/vmware6.png){: .center-block :}


#### 2.2 Installing Ubuntu on VMware
Go to the [Ubuntu download page](https://ubuntu.com/download/desktop) and download the Ubuntu LTS version image, instead of the latest version. LTS versions are more stable and guaranteed to be supported for a five-year time. At the time of writing this tutorial, the LTS version was `Ubuntu 20.04.2.0 LTS`.

Start the VMware Workstation Player and click `Create a New Virtual Machine`.

![ubuntu install](/img/wifi/ubuntu_install1.png){: .center-block :}

Browse for the Ubuntu ISO image and click *Next*.

![ubuntu install](/img/wifi/ubuntu_install2.png){: .center-block :}

Fill up *Full name*, *User name*, and *Password*.

![ubuntu install](/img/wifi/ubuntu_install3.png){: .center-block :}

Select a location where you want to install the Ubuntu. We will need at least 10GB.

![ubuntu install](/img/wifi/ubuntu_install4.png){: .center-block :}

Now select the disk size. Although it says 20GB is recommended but we are only going to install a handful of tools. Ubuntu needs around 5GB to run properly. We will select 10GB so that we can have some room for new tools. If you want to use Ubuntu for other purposes feel free to increase the size.

Also, select the virtual disk to be a single file. In this tutorial, we are not going to move the VM to another machine.

![ubuntu install](/img/wifi/ubuntu_install5.png){: .center-block :}

We will have to change some of the hardware configurations. So click `Customize Hardware...`.

![ubuntu install](/img/wifi/ubuntu_install6.png){: .center-block :}  
![ubuntu install](/img/wifi/ubuntu_install7.png){: .center-block :}

First, we will change the *Memory* size. We are not going to do any resource-hungry task, so we can reduce it to the recommended minimum, which in my case is 2GB.

![ubuntu install](/img/wifi/ubuntu_install8.png){: .center-block :}

Then change the *Number of processor cores* to 1.

![ubuntu install](/img/wifi/ubuntu_install9.png){: .center-block :}

The default Network Adapter option is to share the host's IP address. Change that to select the **Bridged** option so that Ubuntu can have a direct connection to the network adapter of your system.

![ubuntu install](/img/wifi/ubuntu_install10.png){: .center-block :}

We are not going to run any 3D applications so turn **Accelerate 3D graphics** off.

![ubuntu install](/img/wifi/ubuntu_install11.png){: .center-block :}

Once you finish making all these changes the window should look like this:

![ubuntu install](/img/wifi/ubuntu_install12.png){: .center-block :}

The settings are done. Click *Finish*. Now click `Play virtual machine` to start the Ubuntu installation process.

![ubuntu install](/img/wifi/run_vm.png){: .center-block :}

Now you may or may not come across this error when you start the virtual machine. If not, great. You can skip the rest of the error solving process. But if you do follow along.

![install error](/img/wifi/install_error.png){: .center-block :}

This can be fixed from BIOS. Restart your PC and press the BIOS key. It can be `F1`, `F2`, or any other key. In my case, it was the `Delete` button. Sometimes it is mentioned during the restart process which key needs to be pressed. If not, check your Laptop/Desktop's manufacturer website/user manual.  
Once I got into the BIOS I went to the **Advanced->CPU Configuration**.

![install error](/img/wifi/error1.png){: .center-block :}

Find the `Intel Virtualization Technology` option. If it is *disabled*, enable it.

![install error](/img/wifi/error2.png){: .center-block :}  
![install error](/img/wifi/error3.png){: .center-block :}

Now let's get back to VMware Player again and click `Play virtual machine` to start the Ubuntu installation process. During installation, if VMware asked for an update, download and install it.

![vmware update](/img/wifi/vm_update.png){: .center-block :}  
![vmware update](/img/wifi/vm_update1.png){: .center-block :}

Once the installation is finished login with your credential. Go through the initial setups or skip it. If it asks to install the update, go for it.

![ubuntu](/img/wifi/ubuntu1.png){: .center-block :}  
![ubuntu](/img/wifi/ubuntu2.png){: .center-block :}  
![ubuntu](/img/wifi/ubuntu3.png){: .center-block :}  
![ubuntu](/img/wifi/ubuntu4.png){: .center-block :}

#### 2.3 Installing Kali Linux on VMware
There are two ways to use Kali Linux. You can download the Kali Linux image file and install like Ubuntu. Or just download the image specifically for the VMware. The 2nd option is easy and good enough for our purpose.

Go to Kali Linux [download page](https://www.kali.org/downloads/) and find "*Download Kali Virtual Machines*" and click on the big red button:

![kali](/img/wifi/kali1.png){: .center-block :}

From there download the appropriate image according to system configuration.

![kali](/img/wifi/kali2.png){: .center-block :}

Once the download is finished, unzip it. Open the VMware Player and select **Open a virtual machine**. Go to the extracted folder and select the "*\*.vmx*" file.

![kali](/img/wifi/kali3.png){: .center-block :}

The select `Edit virtual machine settings` and change the Memory to **1GB**, Processors to **1**, and Network Adapter to **Bridged**. Click Ok to save the configuration.

![kali](/img/wifi/kali4.png){: .center-block :}  
![kali](/img/wifi/kali5.png){: .center-block :}

Select `Play virtual machine`. That will start the Kali Linux. A dialog box might prompt asking you if you have moved or copied the VM. Click on `I copied it` to continue.

![kali](/img/wifi/kali6.png){: .center-block :}

You will see the GRUB boot loader and after sometime, VM will start and you will see the login screen. Login with:

`User name: kali`  
`Password:  kali`

And with that concludes first part of this tutorial. In the next part, I will show how you can sniff packets and save it to analayze them later.

[Part-2: Sniffing and Saving Packets](https://mirzafahad.github.io/2021-02-22-wifi-rouge-access-point-part2/)