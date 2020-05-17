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

*Me:* You can use RTOS. But I think that would be an overkill if my application is just that, computation in the main loop, and an LED blinking.
You can use a timer though. ATMega328p (the microcontroller on Arduino) has three timers. You can set a timer to interrupt you every 250ms and in the ISR you can toggle the LED state.  

Solved!

**Situation 2:**  
*Problem:* I now need to blink 4 LEDs. One at every 250ms, 500ms, 750ms, and 1s. Along with that time-consuming application in the main loop. What can you do?  

*Me:* Bizarre requirement, but anyway. We can still use the timer, but now we need to configure the interrupt to generate every 250ms (or better every 1ms) and keep a counter for all four events. It will do the work, but the ISR will be ugly. And not scalable, at all.

**Situation 3:**  
*Problem:* I also need to read a push button, along with everything we had before.  

*Me:* Meh…that is easy. I can just hook it up with an external interrupt, BOOM!!!

**Situation 4:**  
*Problem:* ... ...Four push buttons. Connected to four different pins. Hardware is already designed. And no you can’t use RTOS.  

Me: 
![](/img/timeserver/tenor.gif){: .center-block :}