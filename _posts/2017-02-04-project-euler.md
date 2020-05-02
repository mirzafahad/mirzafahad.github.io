---
layout: post
title: Project Euler - Problem 142
tags: [programming]
comments: true
---

In an interview I was asked to solve Project Euler: Problem 142 using Python. Here is the problem statement:

`Find the smallest x + y + z with integers x > y > z > 0 such that x + y, x − y, x + z,x − z, y + z, y − z are all perfect squares.`


One way to approach to this problem is using brute-force. Start with the minimum value of `x, y, z`. From the condition `'x > y > z > 0'` we can say that the minimum value of the variables are `x = 3; y = 2; z = 1;`
 

We can implement three nested 'for' loops and test all the possible combination of x, y, and z for perfect squares. That technique will progress pretty fast until it hits 500 (= x). After that, the performance of the brute-force approach degrades exponentially. So let's take  another approach. 

Let's assume,

~~~  
a = x + y  ... ... ... (1)  
b = x - y  ... ... ... (2)  
c = x + z  ... ... ... (3)  
d = x - z  ... ... ... (4)  
e = y + z  ... ... ... (5)  
f = y - z  ... ... ... (6)  
~~~  
 

Now, we can re-write equation (2),(5) and (6):  
~~~  
b = x - y = (x + z) - (y + z) => b =  c - e  
e = y + z = (x + y) - (x - z) => e = a - d  
f = y - z = (x + y) - (x + z) => f =  a - c  
~~~  
 

i.e. if we can solve a,c, and d, we can find other three (b, e, f) too. If we have the value of all the six perfect squares then we find x, y, and z:

~~~  
from (1) and (2),  x = (a + b) / 2  ... ... ... (7)  
from (5) and (6),  y = (e + f) / 2  ... ... ... (8)  
from (3) and (4),  z = (c - d) / 2  ... ... ... (9) 
~~~  
 

Now, we know that `x > y > z > 0`. Based on that and from equation (1), (3), and (4) we can say:

* a > c > d
* And equation (9) tells us that c and d must have same parity (both odd or both even) in order to divisible by 2 (remember, x, y, and z are integers).
* As a, c, and d are also perfect squares there minimum value will be (based on (A) ):
~~~  
    a = 16 (4^2)

    c = 9 (3^2)

    d = 1  (1^2) [not 2^2, c and d should have same parity]
~~~