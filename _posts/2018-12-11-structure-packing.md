---
layout: post
title: Structure Packing
tags: [C, programming, tips]
comments: true
---

One day while I was using PVS Studio Static Analyzer it suggested that I have an opportunity to apply 'struct-packing' that can save space. After some googling and reading I was astonished to the fact that I never knew of this! 

#### What is structure packing? 
It is a technique for reducing the memory footprint in C-like structures. Let's see an example. On a 32-bit machine the size of the variable types are:

	sizeof(char *) = 4 Bytes
	sizeof(long)   = 4 Bytes
	sizeof(int)    = 4 Bytes
	sizeof(short)  = 2 Bytes
	sizeof(char)   = 1 Byte
	sizeof(float)  = 4 Bytes
	sizeof(double) = 8 Bytes

Now let's just say you have these variables declared:

	char *ch_ptr;
	char ch;
	int number;
	short sh;

You might assume that these three variables would occupy a continuous span of bytes in memory. That is, on a 32-bit machine 4 bytes of pointer would be immediately followed by 1 byte of char and that immediately followed by 4 bytes of int and then 2 bytes of short.

{: .box-note}
**Note:** I am ignoring the fact that allocated order of static variables might not be the same as source order.

But this is where you would be wrong. Most modern processors are self aligned. Variables doesn't start at arbitrary byte addresses in memory. 'chars' can start on any byte address, but 2-byte 'short' must start on an even address, 4-byte 'int' or 'float' must start on an address divisible by 4, and 8-byte 'long' or 'double' must start on an address divisible by 8. So, the actual placement would be like:

![](/img/struct_pack/table.png){: .center-block :}

As you can see, memory address 0x0005 - 0x0007 is wasted. The official term for this is 'slop'. As if you declared something like this:

	char *ch_ptr;
	char ch;
	char pad[3];
	int number;
	short sh;

It gets worse if you declare these as a struct. For example:

	struct foo
	{
	    char *ch_ptr;
	    char ch;
	    int number;
	    short sh;
	}

Struct will self-align with highest size i.e. 'foo' will be 4-bytes aligned.

![](/img/struct_pack/table2.png){: .center-block :}

You are wasting 6-bytes now. If you have a linked list of 100k of these, imagine how much you are wasting. What if you pass this as a function argument by value? Horrible things can happen. But, if we reorder the variables like this:

	struct foo
	{
	    char *ch_ptr;
	    int number;
	    short sh;
	    char ch;
	}

![](/img/struct_pack/table3.png){: .center-block :}

Now we are wasting only 1-byte. So the trick is **declare your variables in a decreasing order**. 

[Run this](http://onlinegdb.com/S10CaSi0Q) to see the results on an online C compiler.

**Some tips:**  
1) Enumerated-type variables are usually ints but it is compiler-dependent; they could be shorts, longs, or even chars by default. Your compiler may have a pragma or command-line option to force the size.

2) If you have several boolean flags in a struct consider reducing them to 1-bit bitfields and packing them into a place in the structure that would otherwise be slop.

3) The clang compiler has a -Wpadded option that causes it to generate messages about alignment holes and padding. Some versions also have an undocumented -fdump-record-layouts option that yields more information.

**Related Articles:**  
1.[Structure Member Alignment, Padding and Data Packing](http://www.geeksforgeeks.org/structure-member-alignment-padding-and-data-packing/)

2.[The Lost Art of Structure Packing](http://hownot2code.com/2016/11/10/the-lost-art-of-c-structure-packing/)