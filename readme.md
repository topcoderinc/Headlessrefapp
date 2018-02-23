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
  - *usageInterval*: may change, check cpu usage with interval using [pidusage](https://www.npmjs.com/package/pidusage)
  - *routes*: all routes to test, exist url and wait selector to ensure all resources are loaded in test.
  - *chromePaths*: may change,will be used when executablePath in profileFolder did not find match chrome application.
  - *profileFolder*: no need to change,must be valid git folder exist in repo to push profile files.
  - *puppeteerOptions*: must change if you did not install Chrome with path *executablePath* and *chromePaths* or you want to test with different trace categories.
  - *tracingOptions*: may change,you can find supported trace categories in [Tracing.js](https://github.com/GoogleChrome/puppeteer/blob/master/lib/Tracing.js).
  
  # Items in profiling data
  `profiles-datetime.json` file in profiling-data directory exist below items:
  - *Number of all available routes*: read configuration from routes of  `chrome-profiler/config.json`
  - *Number of global variables*: evaluate with `code Object.keys(window).length`
  - *Number of watchers of each route*: return 0 for non Angular1 application codes and will only return positive value for Angular1 application with watchers.
  - *Total size of browser session storage*: total size of sessionStorage and localStorage, manually calculated by assumption stores as UTF-16 (occupies 2 bytes)
  - *Total size of IndexedDB storage*: extract result from [Storage](https://chromedevtools.github.io/devtools-protocol/tot/Storage)
  - *Number of logs that is published to browser console*: extract result from [Log](https://chromedevtools.github.io/devtools-protocol/tot/Loge) and [console event](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#event-console).
  - *Number of browser objects*:count the number of HTTP GET requests for each route as the number of browser objects
  - *Number of async XHRs per screen*:count all asynchronous XHR Network Requests from the network file when each URL is loaded
  - *Number of sync XHRs per screen*:count all synchronous XHR Network Requests from the network file when each URL is loaded
  - *Total memory utilization per screen*:extract the total memory consumed when each URL is loaded, the unit is MB
  - *Total CPU percent per screen*:extract the total CPU percent consumed when each URL is loaded
  - *Page size of a given route/screen*:Total Download of HTML/IMG/Scripts everything (in MB) for each URL loaded

   
  # Running and Testing
  
  * Run ` npm start ` to start the angular app on localhost:9000 .
  * Run ` npm run test ` to test the app and get code coverage result.
  * Run ` npm run e2e ` to run e2e tests.
  
  
  # Verification
  
  * ` npm start ` should run the app on localhost:9000 .
  
  
  # Running the app on headless chrome
  I add two flags from environment variables, if exist **SKIP_ADD_GIT** it will not add files to git repo, if exist **SKIP_START_APP** it will not use spawn to start main application.
  It will be more stable if do not start application using spawn and it will not meet timeout error so often if your application is already running and navigate once without errors in console. 
  I add **--max_old_space_size=2000000** for profile npm script  and if your computer does not have enough memory please remove this options or adjust with your own configurations.
  ```sh
  npm start
  # open http://localhost:9000/ to make sure it could open locally successfully once then run profile task without need to start app and add files to git
  # can only run below command in linux or mac you may set environment variables using set SKIP_ADD_GIT=true set SKIP_START_APP=true under windows and then run npm run profile
  SKIP_ADD_GIT=true SKIP_START_APP=true npm run profile
  ```
  * Run ` npm run profile ` to run the app on headless chrome and capture network and tracing logs, console logs, profiles result.
  * The network logs is generated in `networks-datetime.json` file in profiling-data directory.
  * The trace logs is generated in `trace-datetime.json` file in profiling-data directory.
  * The console logs is generated in `logs-datetime.json` file in profiling-data directory.
  * The profiles result file is generated in `profiles-datetime.json` file in profiling-data directory.
  * to view network file `networks-datetime.json` or console logs file `logs-datetime.json` or profiles result file `profiles-datetime.json`, please use [json viewer](http://jsonviewer.stack.hu/).
  * to view trace logs, Open devtools in chrome, go to Performance tab, click on Load Profile icon and select the `trace-datetime.json` file.
  * The code for it is in chrome-profiler directory.
  
  # Running with docker
  Please install docker(17.12.0+) and docker-compose(1.19.0+) or latest docker and docker-compose that supports
  [docker-compose version 3.5](https://docs.docker.com/compose/compose-file/compose-versioning/#version-35) with new feature **shm_size**.
  Please note it may exist memory or storage limit to run chrome headless in docker with memory leak pages and you may meet Crash error for page and timeout error sometimes.
  
  ```sh
  docker-compose build
  # if you meet permission issue you can either download without docker or add --unsafe option
  docker-compose run dev npm install
  docker-compose run --rm dev npm test
  docker-compose run --rm dev npm run e2e
  ```
  
  You have to run scripts in below orders to run profile in new docker container with less errors(still have to open http://localhost:9000 once).
  ```sh
   docker rm -f puppeteer_chrome
   docker-compose up --force-recreate
   docker exec -it puppeteer_chrome npm run profile
  ```
   or you can also use this way 
   ```sh
   docker rm -f puppeteer_chrome
   docker-compose run --rm --service-ports --name=puppeteer_chrome dev
   docker exec -it puppeteer_chrome npm run profile
   ```
  Actually if you remove **SKIP_START_APP=true** from docker-compose.yml file, you can also run `docker-compose run --rm dev npm run profile` directly without need to start application in docker but may meet some wired errors for timeout issues very often.
