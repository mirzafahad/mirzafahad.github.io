---
layout: post
title: Microsoft Azure IoT and Sparkfun Thing
gh-repo: mirzafahad/AzureArduino 
gh-badge: [star, fork, follow]
tags: [test]
comments: true
---

Microsoft joined the world of IoT with its Azure IoT Suite. I could not wait to test it. They have a couple of [Starter Kits](http://azure.microsoft.com/en-us/develop/iot/starter-kits/) for beginners that include Adafruit's Feather, Sparkfun's Thing, Raspberry Pi, Intel Edison, etc. You don't need those starter kits if you already have any of those standalone development boards.

The Getting Started Guide can be [found here](http://azure.microsoft.com/en-us/documentation/samples/iot-hub-c-thingdev-getstartedkit/), but I prefer the [Github's Getting Started Guide](http://github.com/Azure-Samples/iot-hub-c-thingdev-getstartedkit). At the time of writing, the former tutorial wasn't updated. 

There are two examples on the official page. I will be exploring **Simple Remote Monitoring** using Sparkfun's Thing Dev. The official tutorial uses [RHT03](http://www.sparkfun.com/products/10167) temperature+humidity sensor. I will be using [HTU21D](http://www.sparkfun.com/products/12064) temperature+humidity sensor, which uses I2C.

Note: You'll need Arduino 1.6.8 or later to follow this tutorial.

### Azure IoT Suite
* Click on 'Free trial'. If you don't have a Microsoft account, you should create one now. You can use any of your existing email addresses. Next, it will ask you to fill up some information.

![](/img/azure/2.png){: .center-block :}

*  Although they'll ask for debit/credit card information, for verification, they won't charge you anything. After your $200 they will disable the service and won't charge you automatically unless you explicitly upgrade the plan. So, don't worry. Once you are done, you'll see something like this:

![](/img/azure/3.png){: .center-block :}

* Click on '+'. Select Remote Monitoring.

![](/img/azure/4.png){: .center-block :}

* Fill up the form. Choose a unique name. Choose your region. Choose Free Trial in the Subscription field. Then click 'Create Solution'.

![](/img/azure/5.png){: .center-block :}

* It can take up to 10 mins. Wait until it is done.

![](/img/azure/6.png){: .center-block :}

* Once it is done it should look like below. If you click on your solution (red +), the right window will pop up.

![](/img/azure/7.png){: .center-block :}

* If you click 'Launch', it might ask you to sign in again. Nevertheless, it will take you to the 'Microsoft Azure IoT Suite - Remote Monitoring Solution' Dashboard.

![](/img/azure/8.png){: .center-block :}

*  If you click on 'Device to View' you'll see some Sample Devices. These devices do not represent any physical real-world devices. These are more like imaginary devices with fabricated data (the graph) to give you a feel of how real-world hardware will work. I will show you later how to create sample devices. The idea is you can create a sample device with automated data generation and work on the Azure IoT Suite. Once you are finished with the web interface you can replace sample devices with actual hardware.

![](/img/azure/9.png){: .center-block :}

* Now click on 'DEVICES'. It will have all those four sample devices. It is better to disable all these because these services will cost you (from $200 you got for a free trial).

![](/img/azure/10.png){: .center-block :}

* Once you disable it, there will be an option to delete it. You can do so if you think you won't need it, which what I did. After that, click on "ADD A DEVICE" at the bottom of the page.

![](/img/azure/11.png){: .center-block :}

* Click on 'Add New' under Custom Device and type a device ID.

<p align="center">
  <img src="/img/azure/12.png">  <br><br> <img src="/img/azure/13.png">
</p>

* If you click on 'Create' it will generate device credentials in step 3. Keep a note of these, preferably on a notepad.

![](/img/azure/14.png){: .center-block :}

* The device you just created will show up in your device list. Now you can enable this device.



### Hardware

<p align="center">
  <img src="/img/azure/15.png">  <img src="/img/azure/16.png">
</p>

* HTU21D uses I2C for communication. Hardware Connections are shown below (HTU21D to Thing Dev):


| HTU21D Pins | Thing Pins |
| :------ |:--- |
| VCC | 3.3V |
| GND | GND |
| SDA | PIN2 |
| SCL | PIN14 |


* I [modified](https://github.com/mirzafahad/AzureArduino/) the [Microsoft's code](http://github.com/Azure-Samples/iot-hub-c-thingdev-getstartedkit/archive/master.zip). If you use HTU21D, it will be better if you use my example. Run "remote_monitoring.ino". Change SSID and password with your Wi-Fi SSID and password.

![](/img/azure/17.png){: .center-block :}

* Change the highlighted variables from "**remote_monitoring.c**". In the place of '**hubName**' just use the name of the hub you chose. For instance if your IoT Hub Hostname is "**fahad.azure-devices.net**", use '**fahad**' as your '**hubName**'.

![](/img/azure/18.png){: .center-block :}

* Don't forget to choose the right board.

![](/img/azure/19.png){: .center-block :}

* If you define 'PRINT_SERIAL' as one from HTU.cpp, then after you load the code open the Terminal. Choose 115200 baud [if you haven't changed already from setup() function]. It will display the sensor data.

<p align="center">
  <img src="/img/azure/20.png">  <img src="/img/azure/21.png">
</p>

### Azure IoT Dashboard

* Let's get back to the Azure Dashboard. Enable the device.

![](/img/azure/22.png){: .center-block :}

* Now go back to dashboard. As I disabled all other sample devices, 'Device to View' only shows one running device. Once you choose that data will start to appear on the graph.

![](/img/azure/23.png){: .center-block :}

* Blow on the sensor, or put a finger on the sensor and see the changes on the graph.