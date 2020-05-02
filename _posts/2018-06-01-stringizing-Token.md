---
layout: post
title: Stringizing(#) and Token Pasting(##) Operator
tags: [C, programming, tips]
comments: true
---

If you never heard of any of these operators don't be surprised, not many people knows about it. Let's see what are these.

## Stringizing (#) Operator
---
This operator is used with macros to "stringify" parameters i.e. turn a parameter into a string. Here is a simple example:

```javascript
// Define a macro with # operator:
#define CONVERT_TO_STRING(x)    #x
```


CONVERT_TO_STRING will convert the parameter x into a string. Let's put it into work.

```javascript
printf("Output: %s\r\n", CONVERT_TO_STRING(Hello World));

printf("Output: " CONVERT_TO_STRING(Hello World));
```


The output window will be:  

	Output: Hello World

This can be useful to print out macros. But there is a catch. Let's see another example:

{% highlight javascript linenos %}
#define CONVERT_TO_STRING(x) #x
#define BUFFER_SIZE 10

int main ()
{
    printf("Output: %s\r\n", CONVERT_TO_STRING(BUFFER_SIZE));
    return 0;
}
{% endhighlight %}


Guess what the output window will be:
	
	Output: BUFFER_SIZE


The macro doesn't expand. # operator literally turn anything into string. In order to expand the macro BUFFER_SIZE you'll have to use an extra level of indirection. Here is an updated code:

{% highlight javascript linenos %}
#define CONVERT_TO_STRING(x) #x
#define CONVERT_MACRO_TO_STRING(x) CONVERT_TO_STRING(x)

#define BUFFER_SIZE 10

int main ()
{
    printf("%s: %s\r\n",CONVERT_TO_STRING(BUFFER_SIZE), CONVERT_MACRO_TO_STRING(BUFFER_SIZE));
    return 0;
}
{% endhighlight %}

Now the output window will be:

	BUFFER_SIZE: 10

It is really hard to find a proper example where the use of this operator can be justified. Check out [this example](http://stackoverflow.com/a/147582) where the Author created Enum states' string version during declaration. I am not sure though if that was worth it or not. The only sane example I found was this:

{% highlight javascript linenos %}
#define WARN_IF(EXP) \
do { if (EXP) \
        fprintf (stderr, "Warning: " #EXP "\n"); } \
while (0)

For example:
WARN_IF (x == 0);
     → do 
         { 
           if (x == 0)
           fprintf (stderr, "Warning: " "x == 0" "\n"); 
         } while (0);
{% endhighlight %}

Even that is hard to read. I resonate with one of Martin Fowler's statement:

`"Any fool can write code a computer can understand. Good programmers write code humans can understand."` 

## Token Pasting (##) Operator
---

This is probably the most poorly documented preprocessor operator ever. The token pasting operator eliminates any white space around it and concatenates the non-whitespace characters together. It can only be used with macro definition. Let's look at an example:

{% highlight javascript linenos %}
#define CONCATENATE(a, b) a##b

#define CONVERT_TO_STRING2(x) (#x)
#define CONVERT_TO_STRING(x) CONVERT_TO_STRING2(x)

int main() 
{
    printf("Output: %s\n", CONVERT_TO_STRING(CONCATENATE(Hello, World)));
}
{% endhighlight %}

Notice how CONVERT_TO_STRING was declared using an extra level of indirection, so that CONCATENATE can be used and printed properly. The output window will be:

	Output: HelloWorld

Here is a [practical example](http://complete-concrete-concise.com/programming/c/preprocessor-the-token-pasting-operator) (read the "Why Use it?" section) and a [neat example here](http://gcc.gnu.org/onlinedocs/cpp/Concatenation.html#Concatenation).