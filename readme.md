# About the application

* The app is a fork of https://github.com/Rebilly/ReDoc with some little changes/additions made.
* There is also a demo of how to run the app in chrome headless and capture network and tracing logs.
* The app is an "OpenAPI/Swagger-generated API Reference Documentation".

# Requirements

* node 8.4.0+
* npm 5.6.0+


# Installation

* To install the dependencies, run ` npm install `.

# Configurations chrome-profiler/config.json
- *waitTimeout*: may change, wait to make sure application starts up rightly
- *pageTimeout*: may change, sometime tests will fail for timeout error and you may use 0 to disable timeout
- *testBetweenTimeout*: may change, wait sometime between routes
- *routes*: all routes to test, exist url and wait selector to ensure all resources are loaded in test.
- *profileFolder*: no need to change,must be valid git folder exist in repo to push profile files.
- *puppeteerOptions*: must change if you did not install Chrome with path */opt/google/chrome/chrome* or you want to test with different trace categories.
- *tracingOptions*: may change,you can find supported trace categories in [Tracing.js](https://github.com/GoogleChrome/puppeteer/blob/master/lib/Tracing.js).

# Items in profiling data
`profiles-datetime.json` file in profiling-data directory exist below items:
- *Number of all available routes*: read configuration from routes of  `chrome-profiler/config.json`
- *Number of global variables*: evaluate with `code Object.keys(window).length`
- *Number of watchers of each route*: return 0 for non Angular1 application codes and will only return positive value for Angular1 application with watchers.
- *Total size of browser session storage*: total size of sessionStorage and localStorage, manually calculated by assumption stores as UTF-16 (occupies 2 bytes)
- *Total size of IndexedDB storage*: extract result from [Storage](https://chromedevtools.github.io/devtools-protocol/tot/Storage)
- *Number of logs that is published to browser console*: extract result from [Log](https://chromedevtools.github.io/devtools-protocol/tot/Loge) and [console event](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#event-console).
- *Number of detached DOM per screen*: extract result from [HeapSnapshot](https://chromedevtools.github.io/devtools-protocol/tot/HeapProfiler#event-addHeapSnapshotChunk)
- *Number of browser objects*:count the number of HTTP GET requests for each route as the number of browser objects

# Running and Testing

* Run ` npm start ` to start the angular app on localhost:9000 .
* Run ` npm run test ` to test the app and get code coverage result.
* Run ` npm run e2e ` to run e2e tests.


# Verification

* ` npm start ` should run the app on localhost:9000 .


# Running the app on headless chrome
I add two flags from environment variables, if exist **SKIP_ADD_GIT** it will not add files to git repo, if exist **SKIP_START_APP** it will not use spawn to start main application.
* Run ` npm run profile ` to run the app on headless chrome and capture network and tracing logs, console logs,heap snapshot, profiles result.
* The network logs is generated in `networks-datetime.json` file in profiling-data directory.
* The trace logs is generated in `trace-datetime.json` file in profiling-data directory.
* The console logs is generated in `logs-datetime.json` file in profiling-data directory.
* The profiles result file is generated in `profiles-datetime.json` file in profiling-data directory.
* The heap snapshot is generated in `heapsnapshot-datetime.heapsnapshot` file in profiling-data directory.
* to view network file `networks-datetime.json` or console logs file `logs-datetime.json` or profiles result file `profiles-datetime.json`, please use [json viewer](http://jsonviewer.stack.hu/).
* to view trace logs, Open devtools in chrome, go to Performance tab, click on Load Profile icon and select the `trace-datetime.json` file generated.
* to view heap snapshot, Open devtools in chrome, go to Memory tab, click on Load icon and select the `heapsnapshot-datetime.heapsnapshot` file generated,
input **Detached** in Class filter and you can find deached dom trees/nodes, see ![Alt text](docs/images/Detached.png?raw=true "Detached").
* The code for it is in chrome-profiler directory.

# Running with docker
Please install docker and docker-compose.
```sh
docker-compose build
# if you meet permission issue you can either download without docker or add --unsafe option
docker-compose run dev npm install
docker-compose run dev npm test
docker-compose run dev npm run e2e
docker-compose run dev npm run profile
```
Then you can also run `docker-compose up` to start the angular app on localhost:9000 in docker.
