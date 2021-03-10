---
layout: post
title: Continuous Integration for Arduino Projects
subtitle: using GitHub Actions!
gh-repo: mirzafahad/ci_arduino_project
gh-badge: [star, fork, follow]
image: /img/cicd/cover.png 
tags: [github, ci, continuous, integration, arduino, actions, yaml, cli]  
comments: true  
---

I use TravisCI for some of Arduino projects. But Travis announced a new pricing model which no longer has a free tier for open-source projects. While I was looking for another free CI service I learned about GitHub's own **GitHub Actions**. As all my hobby-project-repositories are already in GitHub, choosing this was no brainer. In this tutorial I will show how you can setup Continuous Integration (CI) for your Arduino Projects that are already on GitHub.


# What is CI/CD?
CI/CD stands for Continuous Integration/Continuous Delivery. It provides a way to automate your building, testing and deployment of applications. Let's say you have a shared repository for an application where diffrent developers are working on different features. By using a CI service, when a developer pushes their code changes, in a dedicated server an automated process builds the application and runs a set of tests to confirm that the newest code integrates with what’s currently in the master branch. 

![ci test](/img/cicd/ci_test.png){: .center-block :}
 
# How is it Different for Firmware Development?
GitHub Actions actually make it really easy to set up continuous integration for the language and tooling you want to use. Along with all the popular languages, you can also have `make`/`CMake` based C/C++ projects. You will just need to click a button and rest will be set for you. But when it comes to firmware, you will also have to consider what hardware architecture the firmware was developed for. And that makes things, well, I wouldn't say complicated, rather it requires you to do things differently. 

# How is it Different for Arduino?
If you ever worked with Arudino you already know that your project files and libraries do not live under the same directory. You will have your projects files at one place and but your personal libraries can be in another place. Most of the steps for setting up the CI are same for both cases, except for libraries you will have to add some extra '*steps*'.
	
# CI for Arduino Projects
![ci build](/img/cicd/hero.png){: .center-block :}

I will use Arduino's **Blink** example as my project. Let's start by creating a new repository on GitHub:

![creating repo](/img/cicd/creating_repo.png){: .center-block :}

I will choose `ci_arduino_project` as my repository name and also, will add a readme to the repo.

![creating repo](/img/cicd/creating_repo2.png){: .center-block :}

Clone the repo into your local space. I am using [Sourcetree](https://www.sourcetreeapp.com/). Now, open the blink example from the Arduino IDE. 

![arduino blink](/img/cicd/arduino_blink.png){: .center-block :}

To keep things simple I will assume your project uses Arduino Uno. The benefit of CI is you can test your code against any number of Arduino platform (including custom hardware definitions from Sparkfun and Adafruit) in one workflow.

![arduino blink](/img/cicd/arduino_blink2.png){: .center-block :}

Save the project inside the cloned repo. This is what my directory looks like:

![project directory](/img/cicd/directory.png){: .center-block :}

Push the changes to the GitHub repo. In your GitHub repo page click on `Actions`.

![actions](/img/cicd/actions.png){: .center-block :}

GitHub might suggest some workflows based on your programming language. In our case we will go with `set up a workflow yourself`.

![actions](/img/cicd/actions2.png){: .center-block :}

That will take you to the `main.yml` page.

![yml](/img/cicd/yml.png){: .center-block :}

GitHub actions are event driven. That means you can run a series of commands after a specified event has occured. For example, everytime someone creates a pull-request for a repository you can automatically run a command (or a series of commands) that executes a softwate script. To do that GithHub action uses yaml syntax. In a yaml file you will define the events, jobs and steps. Then this yaml file will be stored in your code repository in the directory called `.github/workflows`.

Let's replace the contents of `main.yml` with the following:

{% highlight javascript linenos %}
# This is the name of the workflow, visible on GitHub UI.
name: Arduino Build

# Controls when the action will run. 
on:
  # Triggers the workflow on push or pull request events but only for the main branch
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# This is the list of jobs that will be run concurrently.
# Since we use a build matrix, the actual number of jobs
# started depends on how many configurations the matrix
# will produce.
jobs:
  # This is the name of the job - can be whatever.
  build:
    # Here we tell GitHub that the jobs must be determined
    # dynamically depending on a matrix configuration.
    strategy:
      matrix:
        # The matrix will produce one job for each configuration
        # parameter of type `arduino-platform`, in this case it
        # is only 1.
        arduino-platform: ["arduino:avr"]
        # This is usually optional but we need to statically define the
        # FQBN of the boards we want to test for each platform. In the
        # future the CLI might automatically detect and download the core
        # needed to compile against a certain FQBN, at that point the
        # following `include` section will be useless.
        include:
          # This works like this: when the platformn is "arduino:avr", the
          # variable `fqbn` is set to "arduino:avr:uno".
          - arduino-platform: "arduino:avr"
            fqbn: "arduino:avr:uno"

    # This is the platform GitHub will use to run our workflow,
    # I picked ubuntu.
    runs-on: ubuntu-latest

    # This is the list of steps this job will run.
    steps:
      # First of all, we clone the repo using the `checkout` action.
      - name: Checkout
        uses: actions/checkout@master

      # We use the `arduino/setup-arduino-cli` action to install and
      # configure the Arduino CLI on the system.
      - name: Setup Arduino CLI
        uses: arduino/setup-arduino-cli@v1.1.1
      
      
      # We then install the platform, which one will be determined
      # dynamically by the build matrix.
      - name: Install platform
        run: |
          arduino-cli core update-index
          arduino-cli core install ${{ matrix.arduino-platform }}
      # Finally, we compile the sketch, using the FQBN that was set
      # in the build matrix.
      - name: Compile Sketch
        run: arduino-cli compile --fqbn ${{ matrix.fqbn }} ./Blink --warnings more
{% endhighlight %}

I will explain later what all these mean. You can change the file name to something meaningful. I changed mine to `arduino.yml`. Then click **Start commit**. 

![yml](/img/cicd/yml2.png){: .center-block :}

Type a short, meaningful commit message that describes the change you made to the file and click **Commit new file**.

![yml](/img/cicd/yml3.png){: .center-block :}

That will create the `.github/workflows/` directory in your repo and put your `arduino.yml` inside that. Don't forget to pull the changes into your local repo. Now make some changes in the blink example e.g. change the delay duration to 500ms and push those changes to the GitHub repo. Go to your GitHub repo page and click on `Actions`. You will see the script is running on your changes (yellow circle). Once it is passed a green check mark will appear.

![ci](/img/cicd/ci.png){: .center-block :}  
![ci](/img/cicd/ci2.png){: .center-block :}

### Workflow Status Badge
You can display a status badge in your repository to indicate the status of your workflows. 

![badge](/img/cicd/badge.png){: .center-block :}

A status badge shows whether a workflow is currently failing or passing. A common place to add a status badge is in the `README.md` file of your repository, but you can add it to any web page you'd like. By default, badges display the status of your default branch. You can use the following markup line in the readme:

~~~
![workflow status](https://github.com/<OWNER>/<REPO>/actions/workflows/<YML_FILE>/badge.svg)

# e.g. in my case

![workflow status](https://github.com/mirzafahad/cicd/actions/workflows/arduino.yml/badge.svg)
~~~

I added that in to my readme.

You can also get the status for a specific branch or event using the branch and event query parameters in the URL. To learn more visit [this github doc page](https://docs.github.com/en/actions/managing-workflow-runs/adding-a-workflow-status-badge).

In the next section I will go through the YAML file and also show some extra options e.g.  compile your code for multiple platforms, adding other arduino libraries into your build system etc.

# The YAML file
![yaml](/img/cicd/yaml.png){: .center-block :}






<hr>

