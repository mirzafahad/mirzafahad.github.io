---
layout: post
title: Time Server
subtitle: for Arduino Uno!
gh-repo: mirzafahad/Time_Server_Arduino
gh-badge: [star, fork, follow]
tags: [arduino, library, c++]
comments: true
---

**Situation 1:**  
*Problem:* I need an LED to blink every 250ms as a status of a device. But part of the main loop code takes, let’s say, 5seconds to do some computation. How would you go about it to solve it?  

*Me:* You can use a timer. ATMega328p (the microcontroller on Arduino) has three timers. You can set a timer to interrupt you every 250ms and in the ISR you can toggle the LED state.  

Solved!

**Situation 2:**  
*Problem:* I now need to blink 4 LEDs. At every 250ms, 500ms, 750ms, and 1s. Along with that time-consuming application in the main loop. What can you do?  

*Me:* Bizarre requirement, but anyway. We can still use the timer, but now we need to configure the interrupt to generate every 250ms (or better every 1ms) and keep a counter for all four events. It will do the work, but the ISR will be ugly. And not scalable, at all.

**Situation 3:**  
*Problem:* I also need to read a push button, along with everything we had before.  

*Me:* Meh…that is easy. I can just hook it up with an external interrupt, BOOM!!!

**Situation 4:**  
*Problem:* ... ...Four push buttons. Connected to four different pins. Hardware is already designed. And no you can’t use RTOS.  

*Me:*  
![](/img/timeserver/tenor.gif)  

Ok. Mmmm….I can check the button state in the timer. Timer resolution is set to 1ms. Good enough resolution to make the buttons responsive enough.

**Situation 5:**  
*Problem:* When one of the buttons is pressed, one of the LED needs to be turned on for half a second and then goes off.  

*Me:*  
![](/img/timeserver/a.jpg)  

---
Ok, I get it. This is not exactly a practical problem. But I hope I was able to convey the idea. All these situations can be handled using a timer. The blocker is the time-consuming computation in the main loop. A timer can interrupt that computation and you can handle time-sensitive work in the ISR. RTOS 'sorta' do that. But for a simple example you might not want to use an RTOS.


So, how to go about it, elegantly and not clutter the ISR? 


Introducing [Timer Server Library](https://github.com/mirzafahad/Time_Server_Arduino). This library does exactly that. You provide a callback function to the time server and tell it to execute after some time (e.g. 250ms), repeatedly or just once and time server will handle the rest. That’s it.  

Before, showing you what is under the hood, let’s see an example:  

Example for situation 1:  
Blink an LED with a time-consuming computation in the main loop (Simple_Blink.ino)

{% highlight javascript linenos %}
#include "time_server.h"

// Callback functions for LED timer event
static void onBlinkTimerEvent(void);

// TimerEvent(Callback, interval_ms, repeat)
// Repeat the event every 250ms
static TimerEvent BlinkTimer(onBlinkTimerEvent, 250, true); 

void setup() 
{
    // Set the D13 pin as output. Arduino on-board LED is connected to D13.
    pinMode(LED_BUILTIN, OUTPUT);

    // Start the timer event
    BlinkTimer.Start();
}

void loop() 
{
    // Simulating a time consuming application
    delay(5000);
}

// Definition of the callback
static void onBlinkTimerEvent(void)
{
    // Toggle the LED state
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
}

{% endhighlight %}  

Pretty simple, right?

## What is happening under the hood?
---

For the Time Server, I used ATMega328’s Timer 1. That timer generates an interrupt every 1ms. So, if you provide a callback to the time server and asked the server to execute it every, let’s say, 250ms, timer ISR will subtract 1ms from callback’s “Interval” until it reaches zero. If you have more than one TimerEvent, the time server will keep track of all using Linked List. Checkout [examples](https://github.com/mirzafahad/Time_Server_Arduino) to learn how to utilize the library.

#### Caution  
As this library uses Timer 1, you cannot use the **Servo** library and **analogWrite()** on pins 9 and 10.
Also, the timer is configured for ATMega328p with 16MHz crystal. So, the only supported hardware, for now, are: Arduino Uno, Nano, and Pro (5V, 16MHz).


## Functions  
* TimerEvent(Callback, interval_ms, repeat)  
* TimerEvent(Callback)  
You can declare a TimerEvent object with all three parameters, **Callback** (pointer), **interval_ms** (milliseconds), and **repeat** (true/false). If the event doesn’t need to repeat periodically and the interval isn’t fixed, you can just pass the **Callback** and set the interval later. 
 
* SetInterval(interval_ms)  
Set the interval either for a repeated event or for one-shot, in millisecond.
* Start()  
Start the timer of an event.
* Stop()  
Stop the timer of an event.
* Restart()  
The restart will stop the event if it is already started, will reinitialize the counter, and start again.


##### Some tips:
* Try to keep the callback to a minimum. These will be executed in the ISR. So, follow all those same advice that you do for ISR.
* If you use a global variable inside your callback, set them as volatile.
