---
layout: post
title: Microsoft Azure IoT and Sparkfun Thing
gh-repo: mirzafahad/AzureArduino 
gh-badge: [star, fork, follow]
tags: [test]
comments: true
---

Microsoft joined the world of IoT with their great tool Azure IoT suite. I couldn't wait to test it. They have a couple of [Starter Kits](http://azure.microsoft.com/en-us/develop/iot/starter-kits/) for beginners that includes Adafruit's Feather, Sparkfun's Thing, Raspberry Pi, Intel Edison etc. You actually don't need those starter kits if you already have any of those standalone dev boards.

The Getting Started Guide can be [found here](http://azure.microsoft.com/en-us/documentation/samples/iot-hub-c-thingdev-getstartedkit/), but I prefer the [Github's Getting Started Guide](http://github.com/Azure-Samples/iot-hub-c-thingdev-getstartedkit). Because when I started, the former page's tutorial wasn't updated and I was lost in figuring out what I was doing wrong. 

There are two tutorials on the official page. The first one is a Simple Remote Monitoring and the second one has more work than that. So, here I will just 're-write' the first tutorial by adding some pictures. I will be using Sparkfun's Thing Dev. Also, official tutorial uses [RHT03](http://www.sparkfun.com/products/10167) temperature+humidity sensor. I will be using [HTU21D](http://www.sparkfun.com/products/12064) temperature+humidity sensor, which uses I2C.

Note: You'll need Arduino 1.6.8 or later to follow this tutorial.

### Azure IoT Suite
1. Azure IoT Suite is not free. But for first timers, Microsoft provides free trial that is worth $200 of services. Start you free trial [from here](http://azure.microsoft.com/en-us/pricing/free-trial/).

![](/img.azure/1.png){: .center-block :}

2. Click on 'Free trial'. If you don't have a Microsoft account, it is best you create one now. You can use any of your existing email addresses (for instance your gmail, yahoo). Next it will ask you to fill up some information.

![](/img.azure/2.png){: .center-block :}

3.  Although they'll ask for debit/credit card information, for verification, they won't charge you anything. After your $200 they will disable the service and won't charge you automatically unless you explicitly upgrade the plan. So, don't worry. Once you are done, you'll see something like this:

![](/img.azure/3.png){: .center-block :}

4. Click on '+'. Select Remote Monitoring.

![](/img.azure/4.png){: .center-block :}

5. Fill up the form. Choose a unique name. Choose your region. Choose Free Trial in the Subscription field. Then click 'Create Solution'.

![](/img.azure/5.png){: .center-block :}

6. It can take up to 10mins. Wait until it is done.

![](/img.azure/6.png){: .center-block :}

7. Once it is done it should look like below. If you click on your solution (red +) the right window will pop up.

![](/img.azure/7.png){: .center-block :}

8. If you click 'Launch', it might ask you to sign in again. Nevertheless, it will take you to the 'Microsoft Azure IoT Suite - Remote monitoring Solution' Dashboard.

![](/img.azure/8.png){: .center-block :}

9.  If you click on 'Device to View' you'll see some Sample Devices. These devices do not represent any physical real world devices. These are more like imaginary devices with fabricated data (the graph) to give you a feel how real world hardware will work. I will show you later how to create sample devices. The idea is you can create a sample device with automated data generation and work on Azure IoT suite. Once you are finished with web interface you can replace sample device with actual hardware.

![](/img.azure/9.png){: .center-block :}

10. Now click on 'DEVICES'. It will have all those four sample devices. It is better to disable all these, because these services will cost you (from $200 you got for free trial).

![](/img.azure/10.png){: .center-block :}

11. Once you disable it, there will be an option to delete it. You can do so if you think you won't need it, which what I did. After that, click on "ADD A DEVICE" at the bottom of the page.

![](/img.azure/11.png){: .center-block :}

12. Click on 'Add New' under Custom Device and type a device ID.

<p align="center">
  <img src="/img.azure/12.png">  <img src="/img.azure/13.png">
</p>

13. If you click on 'Create' it will generate device credentials in step 3. Keep a note of these, preferably on a notepad.

![](/img.azure/14.png){: .center-block :}

14. The device you just created will show up in your device list (step 10). Now you can enable this device. Although, it is better  to enable once ESP8266 start sending data, because activating device will cost you.



### Hardware

<p align="center">
  <img src="/img.azure/15.png">  <img src="/img.azure/16.png">
</p>

1. HTU21D uses I2C for communication. Hardware Connections are shown below (HTU21D to Thing Dev):


| HTU21D Pins | Thing Pins |
| :------ |:--- |
| VCC | 3.3V |
| GND | GND |
| SDA | PIN2 |
| SCL | PIN14 |


2. I [modified](https://github.com/mirzafahad/AzureArduino/) the [Microsoft's code](http://github.com/Azure-Samples/iot-hub-c-thingdev-getstartedkit/archive/master.zip). If you use HTU21D, it will be better if you use my code. Run "remote_monitoring.ino". Change ssid and password with your Wi-Fi ssid and password.

![](/img.azure/17.png){: .center-block :}

How about a yummy crepe?

![Crepe](https://s3-media3.fl.yelpcdn.com/bphoto/cQ1Yoa75m2yUFFbY2xwuqw/348s.jpg)

It can also be centered!

![Crepe](https://s3-media3.fl.yelpcdn.com/bphoto/cQ1Yoa75m2yUFFbY2xwuqw/348s.jpg){: .center-block :}

Here's a code chunk:

~~~
var foo = function(x) {
  return(x + 5);
}
foo(3)
~~~

And here is the same code with syntax highlighting:

```javascript
var foo = function(x) {
  return(x + 5);
}
foo(3)
```

And here is the same code yet again but with line numbers:

{% highlight javascript linenos %}
var foo = function(x) {
  return(x + 5);
}
foo(3)
{% endhighlight %}

## Boxes
You can add notification, warning and error boxes like this:

### Notification

{: .box-note}
**Note:** This is a notification box.

### Warning

{: .box-warning}
**Warning:** This is a warning box.

### Error

{: .box-error}
**Error:** This is an error box.
