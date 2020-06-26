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

As I mentioned before, I will be using [32F746GDISCOVERY](https://www.st.com/en/evaluation-tools/32f746gdiscovery.html) development board and [STM32CubeIDE](https://www.st.com/en/development-tools/stm32cubeide.html) to code.  

Download and install the software if you haven't already. Then download this [repo from github](https://github.com/mirzafahad/stm32_tflite_sine). You can open this project directly in the STM32CubeIDE by double clicking '**.project**' file.

![project structure](/img/tflite/project_structure.png){: .center-block :}    

This is what it will look like in the IDE.

![IDE structure](/img/tflite/ide_structure.png){: .center-block :}    

Before we explore what is happening in the code, let's just compile and flash the code right away. You can build the project using the _hammer_ icon, or from **Project->Build Project**.

![Build](/img/tflite/build.png){: .center-block :}    

Now plug in the board. It should show up as a drive. The driver should be installed during the IDE setup. If your ST-Link (on-board) programmer needs an firmware update IDE will prompt for it. Just follow its instructions.

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
* Go to **New->STM32 Project**.

![New project](/img/tflite/new.png){: .center-block :} 

* Select **Board Selector**.
* Type **32F746GDISCOVERY** in the search box.

![Search board](/img/tflite/search.png){: .center-block :}  

* Select the product from the **Board List** and click **Next**.

![Select board](/img/tflite/select.png){: .center-block :}  

* Give project a useful name and select C++ as **Targeted Language**. TensorFlow is written in C++.
* Click Finish.

![Project settings](/img/tflite/project_settings.png){: .center-block :}  

* Then follow [my commits](https://github.com/mirzafahad/stm32_tflite_sine/commits/master). It is self documented.

Couple of things that needs some clarification:

* This project came with the model files. If you want to use your own model file, replace the ones that came with the repo with yours.
* TFLite uses a function called `DebugLog()` to print out error messages. The header file is in `tensorflow/tensorflow/lite/micro/debug_log.h`. Printing output using UART will vary by hardware, so it is user's responsibility to provide the implementation. `debug_log.c` is included under the `Core` folder and is specific to STM32.

# What is happening under the hood?
Let's open the `main.cpp` (under the `Core` folder).

{% highlight javascript linenos %}
#include "stm32746g_discovery.h"
#include "lcd.h"
#include "sine_model.h"
#include "tensorflow/lite/micro/kernels/all_ops_resolver.h"
#include "tensorflow/lite/micro/micro_error_reporter.h"
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/schema/schema_generated.h"
#include "tensorflow/lite/version.h"
{% endhighlight %}

`stm32746g_discovery.h` is provided by STM32Cube.  
`lcd.h` is implemented by me on top of STM32 LCD library to plot the graph.  
`sine_model.h` is downloaded from Google Colab.  
`all_ops_resolver.h` will bring all the operations that TensorFlow Lite uses.  
`micro_error_reporter.h` is the equivalent of printf on serial. It is helpful for debugging and error reporting.  
`micro_interpreter.h` interpreter runs the inference engine.  
`schema_generated.h` defines the structure of TFLite FlatBuffer data, used to translate our `sine_model`.  

{% highlight javascript linenos %}
namespace
{
    tflite::ErrorReporter* error_reporter = nullptr;
    const tflite::Model* model = nullptr;
    tflite::MicroInterpreter* interpreter = nullptr;
    TfLiteTensor* model_input = nullptr;
    TfLiteTensor* model_output = nullptr;

    // Create an area of memory to use for input, output, and intermediate arrays.
    // Finding the minimum value for your model may require some trial and error.
    constexpr uint32_t kTensorArenaSize = 2 * 1024;
    uint8_t tensor_arena[kTensorArenaSize];
} // namespace 
{% endhighlight %}

You actually don't need this namespace, but TensorFlow uses namespace to organize everything. Using namespace here will make these variables and pointers unique to this file.

`kTensorArenaSize` is the space you will allocate for TensorFlow to do its magic. This is to prevent dynamic memory allocation. It is hard to tell how much space you need, you have to guess its size and requires some trial and error. You can start with 1KByte. If it is not enough it will throw an error when you run the program (that's when the serial output comes handy). Then you come back and increase its size.  

{% highlight javascript linenos %}
//Enable the CPU Cache
cpu_cache_enable();

// Reset of all peripherals, Initializes the Flash interface and the Systick.
HAL_Init();

// Configure the system clock
system_clock_config();

// Configure on-board green LED
BSP_LED_Init(LED_GREEN);

// Initialize UART1
uart1_init();

// Initialize LCD
LCD_Init();
{% endhighlight %} 

Initialize all the peripherals. Clock is configured to run at `200MHz`. The dev board uses `UART1` as its `COM` output.

{% highlight javascript linenos %}
static tflite::MicroErrorReporter micro_error_reporter;
error_reporter = &micro_error_reporter;
{% endhighlight %} 

`MicroErrorReporter` is a mechanism to print data that uses DebugLog(), which I mentioned before and was implemented in `debug_log.c` using UART. It is a subclass of `ErrorReporter` and TensorFlow uses `ErrorReporter` to report error. By pointing `MicroErrorReporter` back to `ErrorReporter` we are letting TensorFlow to use our UART to report error.

Pointers are tricky!

{% highlight javascript linenos %}
model = tflite::GetModel(sine_model);

if(model->version() != TFLITE_SCHEMA_VERSION)
{
    TF_LITE_REPORT_ERROR(error_reporter,
  	                     "Model provided is schema version %d not equal "
  	                     "to supported version %d.",
  	                     model->version(), TFLITE_SCHEMA_VERSION);
  	return 0;
}
{% endhighlight %} 

Let's get a handler of our model and check if the model's TFLite version is same as our TFLite library version.

{% highlight javascript linenos %}
static tflite::ops::micro::AllOpsResolver resolver;

// Build an interpreter to run the model with.
static tflite::MicroInterpreter static_interpreter(model, resolver, tensor_arena, kTensorArenaSize,
                                                   error_reporter);
interpreter = &static_interpreter;
{% endhighlight %} 

Let's create an instance of `AllOpsResolver` that allows TFLite Micro to use all the operation it needs to run inference. And then we create the interpreter, by providing it our model handler, the arena pointer, the ops handler, and the error reporting handler (so that it can print error messages).

{% highlight javascript linenos %}
// Allocate memory from the tensor_arena for the model's tensors.
TfLiteStatus allocate_status = interpreter->AllocateTensors();
if (allocate_status != kTfLiteOk)
{
    TF_LITE_REPORT_ERROR(error_reporter, "AllocateTensors() failed");
    return 0;
}
{% endhighlight %} 
`AllocateTensors()` uses the memory that you allocated previously for the tensors defined by our model. And if you didn't allocate enough memory previously this is where it will fail. So, keep an eye on the serial terminal.


{% highlight javascript linenos %}
model_input = interpreter->input(0);
model_output = interpreter->output(0);
{% endhighlight %} 

This is where we get the handlers of our model's input and output buffer.

As we want to generate a continuous sine wave and `x` is a float number, the possible number between `0` to `2pi` is quite large. To limit that we will decide beforehand how many `x_value` we will use i.e. the number of inferences we want to do.

{% highlight javascript linenos %}
const float INPUT_RANGE = 2.f * 3.14159265359f;
const uint16_t INFERENCE_PER_CYCLE = 70;

float unitValuePerDevision = INPUT_RANGE / static_cast<float>(INFERENCE_PER_CYCLE);
{% endhighlight %} 

We divide the `INPUT_RANGE` with the number of inference to get the unit value for `x`. In the infinite loop we will use a for loop to generate the inference number and multiply it with the unit value to generate `x`.

{% highlight javascript linenos %}
while (1)
{
    // Calculate an x value to feed into the model
    for(uint16_t inferenceCount = 0; inferenceCount <= INFERENCE_PER_CYCLE; inferenceCount++)
    {
        float x_val = static_cast<float>(inferenceCount) * unitValuePerDevision;

        // Place our calculated x value in the model's input tensor
        model_input->data.f[0] = x_val;

        // Run inference, and report any error
        TfLiteStatus invoke_status = interpreter->Invoke();
        if (invoke_status != kTfLiteOk)
        {
            TF_LITE_REPORT_ERROR(error_reporter, "Invoke failed on x_val: %f\n", static_cast<float>(x_val));
            return 0;
        }

        // Read the predicted y value from the model's output tensor
        float y_val = model_output->data.f[0];

        // Do something with the results
        handle_output(error_reporter, x_val, y_val);
    }
}
{% endhighlight %} 

We call the `interpreter->Invoke()` to run the inference on the input. `handle_output()` is used to do whatever you want to do with the result. It also take the `error_reporter` handler so that it can at least the print the results on a serial terminal.

{% highlight javascript linenos %}
void handle_output(tflite::ErrorReporter* error_reporter, float x_value, float y_value)
{
	// Log the current X and Y values
	TF_LITE_REPORT_ERROR(error_reporter, "x_value: %f, y_value: %f\n", x_value, y_value);

	// A custom function can be implemented and used here to do something with the x and y values.
	// In my case I will be plotting sine wave on an LCD.
	LCD_Output(x_value, y_value);
}
{% endhighlight %} 

As I wanted to print the result on an LCD, I call my `LCD_Output()` function using the `x` and `y` value.

And that is it. I hope you enjoy reading this as much as I enjoyed writing this. This is not supposed to be a comprehensive tutorial but merely to help you get started.

If you want to learn more about TensorFlow, this [crash course](https://developers.google.com/machine-learning/crash-course) by Google might come handy.


[Part-1: Introduction](https://mirzafahad.github.io/2020-06-16-tflite-stm32/)    

[Part-2: Training model and generating C files](https://mirzafahad.github.io/2020-06-23-tflite-stm32-part2/)



