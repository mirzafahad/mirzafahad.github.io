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
5. 

Here's a useless table:

| Number | Next number | Previous number |
| :------ |:--- | :--- |
| Five | Six | Four |
| Ten | Eleven | Nine |
| Seven | Eight | Six |
| Two | Three | One |


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
