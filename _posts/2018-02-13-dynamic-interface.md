---
layout: post
title: Dynamic Interface Models
subtitle: For Embedded C
tags: [C, programming, tips]
comments: true
---

Let's say you are designing a home automation system. One part of that is **LightScheduler**. During development the requirement said to support one technology. Now, the product manager and hardware designers have refined some of the requirements. The system must be able to handle different light controlling technologies in one shipped binary. 

Also, the light operations will be expanded to support brightening, dimming, and strobe. During system configuration, the administrator of the home automation system selects from one of the supported light-controlling hardware products.

 

Let’s look at a not so great, but common, way to handle this situation, and then we’ll look at a SOLID design. A common, though problematic, way to handle hardware variations in `C` is to use conditional logic during runtime. A design that relies on runtime conditional logic often results in code that is difficult to understand and maintain. 
The application problem being solved is buried in a mass of conditional logic, making virtually everything a special case. 

Let’s look at the LightController interface and how a runtime choice of light-controlling hardware was shoehorned into the code. Here is the interface (`LightController.h`) that doesn't care what light controller technology was used:

{% highlight javascript linenos %}
#include "LightDriver.h"
void LightController_Create(void);
void LightController_Destroy(void);
bool LightController_Add(int id, LightDriver);
void LightController_TurnOn(int id);
void LightController_TurnOff(int id);
{% endhighlight %}


### LightController Interface
---
Notice that `LightController_Add()` takes a `LightDriver` Abstract Data Type (ADT) as a parameter and adds it to its internal storage. Now let's look at the `LightDriver.h`:

{% highlight javascript linenos %}
typedef struct LightDriverStruct * LightDriver;
typedef enum LightDriverType
{
    TestLightDriver,
    X10,
    AcmeWireless,
    MemoryMapped
}LightDriverType;

typedef struct LightDriverStruct
{
    LightDriverType type;
    int id;
}LightDriverStruct;
{% endhighlight %}


### A Specific LightDriver
---
You can add more type under enum if you decide to support other technologies in the future. Now, each specific type of *LightDriver* you want to support needs to define a struct that begins with an instance of `LightDriverStruct`, like this: (for this example we will implement X10 driver, `X10LightDriver.c`):

{% highlight javascript linenos %}
typedef struct X10LightDriverStruct *X10LightDriver;
typedef struct X10LightDriverStruct
{
   LightDriverStruct base;
   X10_HouseCode house;
   int unit;
   char message[MAX_X10_MESSAGE_LENGTH];
}X10LightDriverStruct;
{% endhighlight %}

All other *LightDriver* should have this kind of struct by putting *LightDriverStruct* at the beginning, thus each member of the family will have the same memory layout for the common data. I will show later how this helps.

 
After the *LightDriverStruct* comes the hardware-specific parameters. The X10-specific data includes the house code and the unit number. The combination of the two values identifies a specific light. These constants are part of the X10 driver interface. Let's look at the `X10LightDriver.h`:

{% highlight javascript linenos %}
LightDriver X10LightDriver_Create(int id, X10_HouseCode code, int unit);
void X10LightDriver_Destroy(LightDriver);
void X10LightDriver_TurnOn(LightDriver);
void X10LightDriver_TurnOff(LightDriver);

LightDriver X10LightDriver_Create(int id, X10_HouseCode house, int unit)
{
   X10LightDriver self = calloc(1, sizeof(X10LightDriverStruct));
   self->base.type = X10;
   self->base.id = id;
   self->house = house;
   self->unit = unit;
   return (LightDriver)self;
}
{% endhighlight %}

The specific *LightDriver* create functions return a *LightDriver* ADT. All their driver functions accept the ADT too. The create function takes the common id parameter as well as parameters specific to X10. It allocates memory for the X10 data structure and then populates it. Notice how I returned the *X10LightDriver* instance as *LightDriver*. By dereferencing of base, LightDriver will point to **base** and won't care what is after that.
 

LightController interface only accepts *LightDriver*. So you can actually add any number of hardware specific driver and return the *LightDriver* instance to the LightController Interface. It won't care what driver you are using. IT will use `LightController_TurnOn()` to use `X10LightController_TurnOn()` using the *LightDriver* type. Let's look at *X10LightController_TurnOn*:

{% highlight javascript linenos %}
void X10LightDriver_TurnOn(LightDriver base)
{
   X10LightDriver self = (X10LightDriver)base;
   formatTurnOnMessage(self);
   sendMessage(self);
}
{% endhighlight %}

As we are passing *LightDriver* instance, drivers start by casting the generic *LightDriver* pointer into their specific driver type. Then they do whatever detailed work is necessary, which for X10 means formatting a message and sending it to the device.

Let's see how can we implement LightController_TurnOn():

{% highlight javascript linenos %}
void LightController_TurnOn(int id)
{
 LightDriver driver = lightDrivers[id];
 if (NULL == driver)
     return;
 switch (driver->type)
 {
    case X10:
        X10LightDriver_TurnOn(driver);
        break;
    case AcmeWireless:
        AcmeWirelessLightDriver_TurnOn(driver);
        break;
    case MemoryMapped:
        MemMappedLightDriver_TurnOn(driver);
        break;
    case TestLightDriver:
        LightDriverSpy_TurnOn(driver);
        break;
    default:
        /* now what? */
        break;
 }
}
{% endhighlight %}

Do you see the problem? This is just one function. We will have to repeat the 'switch-case' for all the LightController functions. Not only that, if we decide to add another new LightController technology, we will have to modify all the functions. A **dynamic interface** is required.


A dynamic interface uses one or more function pointers to allow the implementation of a given function to be chosen at runtime. This single level of indirection provides runtime flexibility. Function pointers are a powerful language feature that allow the caller of a function to avoid a compile or link-time dependency on a particular function.  Let's declare a typedef in a header file, `LightDriverPrivate.h`:

{% highlight javascript linenos %}
typedef struct sLightDriverInterface
{
   void (*TurnOn)(LightDriver);
   void (*TurnOff)(LightDriver);
   void (*Destroy)(LightDriver);
}sLightDriverInterface_t;

{% endhighlight %}

Then add the below code in `LightDriver.c`:

{% highlight javascript linenos %}
static LightDriverInterface interface = NULL;
void LightDriver_SetInterface(sLightDriverInterface_t i)
{
   interface = i;
}
{% endhighlight %}

The generic `LightDriver_TurnOn()` function calls the specific driver through this interface struct, passing a pointer to the LightDriver ADT:

{% highlight javascript linenos %}
void LightDriver_TurnOn(LightDriver self)
{
   interface->TurnOn(self);
}
{% endhighlight %}

That's it. The actual light drivers (X10, AcmeWireless etc.) doesn't change. In the application all you have to do is declare a sLightDriverInterface variable, point the functions and pass it to the LightDriver_SetInterface(). Now you can get rid off all the switch-case.
