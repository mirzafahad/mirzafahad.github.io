---
layout: post
title: Graduation Mortar Board
subtitle: Everything that has a beginning has an end!
image: /img/grad/cover.png
gh-repo: mirzafahad/Graduation_Cap 
gh-badge: [star, fork, follow]
tags: [electronics, mortar board, movie, matrix, graduation]
comments: true
---

Update 1: My mortar board is featured on [Arduino website](http://blog.arduino.cc/2016/06/06/arduino-powers-this-matrix-themed-mortarboard/)!!

Update 2: Checkout the [instructables](http://www.instructables.com/id/The-Matrix-Themed-Graduation-Cap/) I put together.

A week before my convocation I thought I can't attend without decorating my mortar board. As I didn't have much time, lots of my idea wasn't plausible. I knew I won't be able to pull off any fancy idea.

I'm a huge fan of Sci-Fi genre. Movies, games, novels, you name it, I love it. [The Matrix](http://www.youtube.com/watch?v=m8e-FF8MsqU) was one of my favorite movies of all time. I watched it countless times. There was a [monologue in the movie](https://www.youtube.com/watch?v=5wqd-ETXrOw), which I thought, goes with graduation ceremony really well.

This is what I came up with:

<p align="center">
  <img src="/img/grad/mortar_top.png">  <img src="/img/grad/mortar_side.png">
</p>


But I wasn't 100% satisfied. I felt like it won't be complete if I don't use any electronics. So I added LEDs:

![](/img/grad/mortar_led.png){: .center-block :}

But not just any LEDs.


[![](/img/grad/vdo_thumb.png){: .center-block :}](https://youtu.be/Bh-glHXmJ-Q)

I used Adafruit's Neopixel Ring LEDs. It uses only one pin to communicate, which is handy.I used an Arduino mini Pro (3.3V - 8MHz) from sparkfun to program the animation. 3.3V/8MHz version was used to reduce the current consumption, which in turn makes my lithium ion battery (3.7V) lasts longer.  Everything was placed inside the cap. I also placed a slide switch between my battery and board/LED so that I can turn it ON/OFF conveniently.

The code is available [here](https://github.com/mirzafahad/graduation_cap).