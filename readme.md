# About the application-

* The app is a fork of https://github.com/Rebilly/ReDoc with some little changes/additions made.
* There is also a demo of how to run the app in chrome headless and capture network and tracing logs.
* The app is an "OpenAPI/Swagger-generated API Reference Documentation".
* The code is in ReDoc directory.

# Requirements-

* node 8.4.0+
* npm 5.6.0+


# Installation-

* To install the dependencies, run ` npm install `.


# Running and Testing-

* Run ` npm start ` to start the angular app on localhost:9000 .
* Run ` npm run test ` to test the app and get code coverage result.
* Run ` npm run e2e ` to run e2e tests.


# Verification-

* ` npm start ` should run the app on localhost:9000 .


# Running the app on headless chrome-

* Run ` npm run profile ` to run the app on headless chrome and capture network and tracing logs.
* The network logs is generated in network.json file in ReDoc directory.
* The trace logs is generated in timeline.json file in ReDoc directory.
* to view trace logs, Open devtools in chrome, go to Performance tab, click on Load Profile icon and select the timeline.json file generated.
* The code for it is in Redoc/chrome-profiler directory.


# VIDEO-

* There are two videos.
* video_app.mp4 shows the app and the test cases running.
* video_chrome_headless.mp4 shows a chrome headless opening the website and then records performance and network data and saves it.

