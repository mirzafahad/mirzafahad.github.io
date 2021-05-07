---
layout: post
title: text, data, bss, and dec
subtitle: Demystifying memory, code, and data size!
image: /img/text/cover.png 
tags: [firmware, memory, stm, size]
comments: true
---

When you compile your firmware application have you seen something like this in your console? 

![console output](/img/text/empty_file_size.png){: .center-block :}
Console output from STM32CubeIDE

Have you ever wondered what in the world are `text`, `data`, `bss`, and `dec` stand for? Well, you are in for a treat once I explain those.

## Memory Layout of a C program
A typical memory map of a C program consists of the following sections.

- A text segment 
- Initialized data segment 
- Uninitialized data segment 
- Stack 
- Heap

![memory map](/img/text/memory.png){: .center-block :}

### Text Segment (text)
A text segment, also known as a code segment, is the memory section where executable instructions (i.e. your code) lives. This segment ends up in FLASH. From the console output above I can see `text` occupies 544 bytes for my `simple_example` code. This is what my `simple_example` code look like:


![Empty code](/img/text/blank_code.png){: .center-block :}

Let's add some more code to see if my `text` size changes:

![fizzbuzz added](/img/text/fizz_buzz.png){: .center-block :}


Aha! The `text` size increased 24-bytes. If you check the map file you'll see the function is added under the `.text` section:

![map file](/img/text/map_file.png){: .center-block :}

![fizzbuzz map](/img/text/fizzbuzz_map.png){: .center-block :}

If you have `const` variable, that will be added under `.text` i.e. they will be saved in FLASH. Here is an example:

![const](/img/text/const.png){: .center-block :}

The `text` size increased by 4-bytes (char takes 1 byte, the array size is 4).


### Data segment (.data)
A data segment (`.data`) contains the global variables and static variables that are **initialized**. To see an example let's add a global variable into our code:

![data](/img/text/data.png){: .center-block :}

`.data` segment increased by 4-bytes. `GlobalVar` is not constant, so it will end up in RAM. But the value we initialized with (0x87654321) is constant, and will live in FLASH memory, i.e.

<p style="text-align:center">`Flash = .text + .data`</p>

 The initialization of the variable is done during the startup code. In the STM's startup code this happens in `CopyDataInit`:

![data init](/img/text/data_init.png){: .center-block :}



