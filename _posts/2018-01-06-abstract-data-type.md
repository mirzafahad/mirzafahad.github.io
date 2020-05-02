---
layout: post
title: Abstract Data Type in C
tags: [programming]
comments: true
---

Barbara Liskov,  an American computer scientist, defines ADTs as follows:

`“An abstract data type is defined indirectly, only by the operations that may be performed on it and by mathematical constraints on the effects (and possibly cost) of those operations.”`
 

In an ADT, a module’s data is treated as private; it is encapsulated. There are a couple modularity options we can employ for encapsulating a module’s data. The first choice is to hide data using static file scope variables in the `.c` file, giving access to the functions in the compilation unit. The data is accessible only indirectly through the module’s public interface, which is defined in the `.h` file as a set of function prototypes. This approach works for a module that has a single set of data to manage, something you can call a `single-instance module`.


But, when a module has to manage different sets of data for different clients, we need to implement `multiple-instance module`. With a multiple-instance module, structures must be initialized and passed back to a client holding their context. Here is where ADTs come into play. You can declare a `typedef` of a forward declared struct in a header file and implement the actual struct in the source file (`.c`).

 

For example, if you want to implement a circular buffer you will need an instance of the buffer. A buffer module can be used by different other libraries. So, every other library will need an instance of the circular buffer i.e. circular buffer needs to implemented as a multiple-instance module. But you don't need to show other libraries what the data structure looks like and should keep it private by limiting the scope in .c file. In header file you can declare:

```
typedef struct sCircularBuffer_t * CircularBuffer;
```


And in source file we can define the actual definition:

{% highlight javascript linenos %}

{% endhighlight %}