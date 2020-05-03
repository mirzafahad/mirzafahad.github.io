---
layout: post
title: Python module for ST-Link Utility
subtitle: Using CLI Utility!
gh-repo: mirzafahad/pystlink
gh-badge: [star, fork, follow]
tags: [ST-Link/V2, stlink, SWD, Python, ARM, CortexM, STM32, FLASH, USB]
comments: true
---

This is a collection of Python methods to automate STMicroelectonics flash using ST-Link CLI Utility (Windows).

**Required Packages:**  
- pywin32  
- pypiwin32


**Hardware used**  
ST-Link V2 that comes with STMicroelectronics Nucleo development boards. These ST-Links also provide USB-to-Serial ports.


**Download**  
Download [ST-Link Utility](https://www.st.com/en/development-tools/stsw-link004.html) and install. Make sure to add the "ST-LINK_CLI.exe" 's directory in the PATH.


**Supported programmers**  
Check ST-Link Utility guide.


### How to install and use
---
There aren't any installations. Clone the [repository](https://github.com/mirzafahad/pystlink) and use the methods. There are only two public methods:

- `findall()`  
  This method returns all the ST-Link Probe number and corresponding COM port number.

- `flash(hex_path, probe_no)` 
  This method takes the hex file path and the probe number (default = 0). It returns status ('successful' / 'failed') and the checksum of the hex/binary file.


**Example**  

{% highlight javascript linenos %}
import stlink

if __name__ == '__main__':
  print(stlink.findall())
  status, checksum = stlink.flash('G:\\test.hex')
  print(status)
{% endhighlight %}

**Output:**  

	[{'probe': '0', 'com': 'COM4'}]
	successful


The repo can be found [here](https://github.com/mirzafahad/pystlink).