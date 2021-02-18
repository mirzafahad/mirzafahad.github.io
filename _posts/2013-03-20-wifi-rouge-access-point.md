---
layout: post
title: Building a Man-in-the-Middle System
subtitle: using WiFi Rogue Access Point!
image: /img/wifi/cover.png 
tags: [hacking, attack, wireshark, ubuntu, wifi, linux, vmware, access, point, ap, rogue]  
comments: true  
---

In this tutorial I will show how can you build a simple **Man-in-the-Middle** System using **Rogue WiFi Access Point**. 

{: .box-warning}
**Note:** I am **NOT** going to show how to decode or make sense of any packets. That is out of this tutorial's scope.

# What is Man-in-the-middle attack?  
Man-in-the-middle attack is a form of cybercttack where the attacker sits in between two parties who think that they are communicating with each other without knowing that all their communication is going through the attacker, who can simply listens to their conversation or even can alter their communication. [Wikipedia](https://en.wikipedia.org/wiki/Man-in-the-middle_attack#Example) has a great example:

![mitm block diagram](/img/wifi/man_in_the_middle_attack.png){: .center-block :}

*Suppose Alice wishes to communicate with Bob. Meanwhile, Mallory wishes to intercept the conversation to eavesdrop and optionally to deliver a false message to Bob.*

*First, Alice asks Bob for his public key. If Bob sends his public key to Alice, but Mallory is able to intercept it, a Man-in-the-middle (MITM) attack can begin. Mallory sends Alice a forged message that appears to originate from Bob, but instead includes Mallory's public key.*

*Alice, believing this public key to be Bob's, encrypts her message with Mallory's key and sends the enciphered message back to Bob. Mallory again intercepts, deciphers the message using her private key, possibly alters it if she wants, and re-enciphers it using the public key she intercepted from Bob when he originally tried to send it to Alice. When Bob receives the newly enciphered message, he believes it came from Alice.*

# What our MITM System Looks Like?
Our system will create a WiFi access point for general users to connect to. We will pretend that we are a legit WiFi Access Point (e.g. StarbucksGuest, AT&T_Free, Walmartwifi_2.4) so that they will connect to it to use internet. We will provide them the internet access but all the request-and-response will go through our looking glass.

{: .box-error}
**Note:** Which is why you should never connect to a free WiFi access point and then start login into all your financial accounts.


# What will we need?

### Ubuntu
We will be doing everything in Ubuntu OS. The tools we will be using are free for Linux. If you are an Windows fan (like me!), then fear not, we will be using a [Virtual Machine](https://en.wikipedia.org/wiki/Virtual_machine), VMware specifically.

### WiFi Adapter
We will also need an external WiFi adapter, which we will be using to create an access point. We need a WiFi adapter that can support **AP mode** and **Monitor mode**. I am using [this WiFi adapter](https://www.amazon.com/802-11n-150Mbps-Wireless-Adapter-Network/dp/B07FVRKCZJ/ref=sr_1_4?dchild=1&keywords=atheros+ar9271&qid=1610123789&sr=8-4), which uses Atheros AR9271 chipset. So any adapter with Atheros AR9271 should work. But if you already have an adapter or want to buy another adapter you can check if the chipset is supported on Linux and supports both AP and Monitor mode.

#### How to find WiFi adapter chipset?
- If you don't know the chipset of your adapter, first check manufacturer's website. Sometimes they will mention the chipset in their user manual or on their website.
- If your adapter/router has an FCC ID, you can use that to look up the chipset. For example at the back of my Linksys router has this:

![linksys router](/img/wifi/linksys.jpg){: .center-block :}  

The FCC-ID is `Q87-EA8300`. If you google *fcc id search* or just go [here](https://www.fcc.gov/oet/ea/fccid) and type the ID as shown below (don't forget the hyphen):

![fcc search](/img/wifi/fcc.png){: .center-block :}  

Let's choose the latest entry and click on `Detail`.

![fcc list](/img/wifi/fcc_list.png){: .center-block :}  

Now click on `Internal Photos`.

![fcc internal photos](/img/wifi/internal_photos.png){: .center-block :}  

Now scroll through the images and try to find the wireless chipset. Usually the shielded part of a board contains the wireless chipset.

![fcc shielded](/img/wifi/internal_photos2.png){: .center-block :}  

