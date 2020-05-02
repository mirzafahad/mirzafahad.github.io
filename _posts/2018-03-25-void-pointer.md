---
layout: post
title: Void Pointer in C
tags: [C, programming, tips]
comments: true
---

One of the frequent questions I come across every now and then is, when do I use a void pointer? or what are some practical examples of void pointer?

Pointers are used to store address. People generally use pointer to "point-to-something". It can point to standard variables, structs, functions. Let's start with some general pointers that points to standard variable types:

	int  *IntPointer;
	char *CharPointer;

**IntPointer** can point to a integer type variable, **CharPointer** can point to a char type variable.

	int IntegerNumber = 3;
	IntPointer = &IntegerNumber;
	char Character = 'A';
	CharPointer = &Character;

But you can't do:

	IntPointer = &Character;      // Not valid
	CharPointer = &IntegerNumber; // Not valid

Now, void pointer can "point-to-anything" i.e. you can do:

```javascript
void *VoidPointer;
VoidPointer = &Character;     // Valid
VoidPointer = &IntegerNumber; // Valid
```

Ok, this looks fancy, I get it. But what's the application? A real world example? 


### A very simple example
---
Let's think of a very simple example. Assume we have a function called `animal_sound(args)`, whose job is to generate animal sound based on it's argument. Now, let's say, we have a "dog" variable of type `sDog_t` and a "cat" variable of type `sCat_t` (sDog_t and sCat_t are typedefs). How do we make animal_sound() function to take both types of variables and not complain? void pointer to the rescue.

{% highlight javascript linenos %}
sDog_t dog;
sCat_t cat;

void animal_sound(void *animal);
{% endhighlight %}


#### Implementation
The implementation can be tricky. See, you cannot deference a void pointer. Because, compiler doesn't know what void pointer is pointing to. First, you will need to cast that pointer with proper variable type. For example, if you want `animal_sound()` to generate only dog sound you would do:

{% highlight javascript linenos %}
void animal_sound(void *animal)
{
    sDog_t animalDog = (sDog_t *)animal;
    printf("%s\r\n", animalDog->sound); 
}
{% endhighlight %}

So, the million dollar question is, how will animal_sound() know the type of argument and properly cast it? There aren't any other ways, unless you tell the function somehow. There are different ways to solve this problem.


`sDog_t` and `sCat_t` are struct. They can have different sets of variables. But at the beginning of the list of variables we can have a common variable (e.g. Animal Type) for all the animal typedefs. Let's declare an enum type variable called `AnimalType`.

{% highlight javascript linenos %}
typedef enum eAnimalType
{
    CAT,
    DOG
}eAnimalType_t;

typedef struct sDog
{
    eAnimalType_t animalType;
    char *sound;
    ... ... ...
    int randomInteger;
    float randomFloat;
}sDog_t;

typedef struct sCat
{
    eAnimalType_t animalType;
    char *sound;
    ... ... ...
    int randomInteger;
    int anotherRandomInteger;
}sCat_t;
{% endhighlight %}

The first variable of both structs is `eAnimalType_t`. So whatever Animal type we pass to the animal_sound() we will know that the first variable will be eAnimalType_t. Now, let's create instances of sDog_t and sCat_t:

{% highlight javascript linenos %}
sDog_t dog = {.animalType = DOG, .sound = "bark!"};
sCat_t cat = {.animalType = CAT, .sound = "meow!"};
{% endhighlight %}

And this is how you should implement `animal_sound()`:

{% highlight javascript linenos %}
void animal_sound (void *animal)
{
    // By casting animal with eAnimalType_t we are 
    // just addressing the first variable - animalType
    switch (*((eAnimalType_t *)animal))
    {
        case CAT:
        {
            sCat_t *catType = (sCat_t *)animal;
	    printf ("%s\r\n", catType->sound);
	    break;
        }
        case DOG:
        {
            sDog_t *dogType = (sDog_t *)animal;
	    printf ("%s\r\n", dogType->sound);
	    break;
        }
        default:
        {
            printf("Here");
            break;
        }
    }
}

{% endhighlight %}

First we de-referenced animal by type casting with `eAnimalType_t`. Once we know the type of the variable animal points to, we properly de-referenced it again inside the switch-case. Now you can simply call animal_sound(&dog) or animal_sound(&cat). The full code can be found [here](http://onlinegdb.com/Skx9rt0kdM).

 

### REAL world example
---
**Example 1:**  
If you ever used `malloc()` you are already using void pointers. malloc() returns a void pointer. You always put return value of malloc() with a type casting. For example:

{% highlight javascript linenos %}
int *arr;
arr = (int *)malloc(5*sizeof(int));
char *foo = (char *)malloc(sizeof(char));
{% endhighlight %}

**Example 2:**  
C library's `qsort()` is a good example of generic function. The routine will sort an array of any type when you provide the base pointer, number of elements, the size of the type, and a comparison function which takes pointers to two of the data types.

	void qsort(void *base, size_t nmemb, size_t size, int(*compar)(const void *, const void *));

Here is a [link](http://linux.die.net/man/3/qsort) if you want to check it out.

**Example 3:**  
You can make a generic container for a linked-list by using a void pointer to point to a data:

```javascript
struct list 
{ 	
    struct list *next; 	
    struct list *prev; 	
    void *data;
};
```