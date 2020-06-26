---  
layout: post  
title: How to run Neural Network model on STM32  
subtitle: Part 3 - Running TFLite Model on STM32!
gh-repo: mirzafahad/stm32_tflite_sine
gh-badge: [star, fork, follow]
image: /img/tflite/cover3.png 
tags: [stm32, tensorflow, c, c++, python, neural netwrok, machine learning, microcontroller]  
comments: true  
---  
  
# Running the model on the STM32
As I mentioned before, I will be using [**32F746GDISCOVERY**](https://www.st.com/en/evaluation-tools/32f746gdiscovery.html) development board and [STM32CubeIDE](https://www.st.com/en/development-tools/stm32cubeide.html) to code.  

Download and install the software if you haven't already. Then download this [repo from github](https://github.com/mirzafahad/stm32_tflite_sine). You can open this project directly in the STM32CubeIDE by double clicking '**.project**' file.

![project structure](/img/tflite/project_structure.png){: .center-block :}    

This is what it will look like in the IDE.

![IDE structure](/img/tflite/ide_structure.png){: .center-block :}    

Before we explore what is happening in the code, let's just compile and flash the code right away. You can build the project using the _hammer_ icon, or from **Project->Build Project**.

![Build](/img/tflite/build.png){: .center-block :}    

Now plug in the board. It should show up as a drive. The driver should be automatically installed during IDE setup. If your ST-Link (on-board) programmer needs an firmware update IDE will prompt for it. Just follow their instructions.

![Drive](/img/tflite/drive.png){: .center-block :}    

Now run the program. This will load the binary in to the microcontroller.

![Run](/img/tflite/run.png){: .center-block :}    

And you should see something like this:

![lcd output](/img/tflite/lcd_output.gif){: .center-block :}  

If you have a terminal software (e.g. [TeraTerm](https://ttssh2.osdn.jp/index.html.en)) connect to the ST-Link COM port (in my case, it showed up as COM32):

![TeraTerm Settings](/img/tflite/terterm_settings.png){: .center-block :}  

Setup the serial port following this:

![Serial setup](/img/tflite/serial_setup.png){: .center-block :}  

You should be seeing `x` and its corresponding `y` values.

![Serial output](/img/tflite/serial_output.png){: .center-block :}  

If you get this far kudos to you. _Noice_!

# How to create the project from scratch
* Go to **New->STM32 Project**
* Select **Board Selector**
* Type **32F746GDISCOVERY** in the search box
* Select the product from the **Board List** and click **Next**
* Give project a useful name and select C++ as **Targeted Language**. TensorFlow is written in C++
* Click Finish

![New project](/img/tflite/new.png){: .center-block :}  
![Search board](/img/tflite/search.png){: .center-block :}  
![Select board](/img/tflite/select.png){: .center-block :}  
![Project settings](/img/tflite/project_settings.png){: .center-block :}  



[Part-1: Introduction](https://mirzafahad.github.io/2020-06-16-tflite-stm32/)    

[Part-2: Training model and generating C files](https://mirzafahad.github.io/2020-06-23-tflite-stm32-part2/)
