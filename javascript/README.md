Scalr APIv2 Javascript sample
=============================

Usage
-----

#### Install node.js and npm

Follow the steps [here](https://docs.npmjs.com/getting-started/installing-node) if npm is not installed on your machine.

#### Start the test server

Start the example server on your machine by running `npm start` in this directory.

#### Open the example page

Navigate to [http://localhost:8000/](http://localhost:8000) with your browser and play with the examples.


Reusing the code
----------------

This example is a browser-based application using the AngularJS framework. If you want to use a different framework,
you can retrieve the ScalrAPI service definition at the beginning of app.js, and the only thing you need to change is
the `$http` call that performs the actual HTTP request in the `makeApiCall` function.

