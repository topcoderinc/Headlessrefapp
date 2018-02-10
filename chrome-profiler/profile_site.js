const fs = require('fs');
const puppeteer = require('puppeteer');
const spawn = require('child_process').spawn;
const path = require('path');
const config = require(path.resolve(__dirname, 'config.json'));
const simpleGit = require('simple-git')();
const timeout = ms => new Promise(res => setTimeout(res, ms));
// URL of the app to be loaded 
const url = config.url;
/**
 * function to spawn a new linux process
 * @param  {string} dir working directory for the process
 * @param  {string} cmd command to start the new process
 * @return {object}     spawned Process
 */
function spawnProcess(dir, cmd) {
  const cmdParts = cmd.split(/\s+/);

  return spawn(cmdParts[0], cmdParts.slice(1), {cwd: dir});
}

const child = spawnProcess('.', 'npm start');

child.stdout.on('data', async function (data) {
  console.log(data.toString('utf-8'));
  //check if the angular app has been served.
  if (data && data.indexOf('Compiled successfully') >= 0) {
    await timeout(5000);// sleep to ensure everything is preared
    hookProfiler();//hook the profiler to a headless chrome
  }
});

// log any errors in child process
child.stderr.on('data', function (data) {
  console.log("error", data.toString('utf-8'));
});

async function hookProfiler() {
  let browser;
  try {
    //launch chrome headless
    browser = await puppeteer.launch(config.puppeteerOptions);
    const page = await browser.newPage();
    const networkRequests = [];//log network requests
    page.on('requestfinished', request => {
      networkRequests.push({
        "requestId": request._requestId,
        "documentURL": request._url,
        "request": {
          "method": request._method,
          "headers": request._headers
        },
        "response": {
          "url": request._response._url,
          "status": request._response._status,
          "headers": request._response._headers
        },
        "type": request._resourceType,
        "frameId": request._frame._id
      });

    });
    // see all possible options/categories in https://github.com/GoogleChrome/puppeteer/blob/master/lib/Tracing.js
    await page.tracing.start(config.tracingOptions);
    console.log(`Go to page with url ${url}`);
    await page.goto(url, {timeout: config.timeout});
    await page.waitForSelector(config.swaggerNameSelector, {timeout: config.timeout});
    let name  = await page.$eval(config.swaggerNameSelector, e => e.textContent);
    console.log(`current swagger document name is ${name}`);
    // Type into search box.
    await page.type(config.swaggerUrlSelector, config.swaggerUrl);
    // click explore button
    await page.$eval(config.exploreButtonSelector, exploreButton => exploreButton.click());
    // wait until all resources are loaded
    await page.waitForNavigation({waitUntil: ['domcontentloaded','networkidle0'], timeout: config.timeout});
    console.log('current page url is '+ page.url());
    name  = await page.$eval(config.swaggerNameSelector,e => e.textContent);
    console.log(`current swagger document name is ${name}`);
    // open chrome for timeline viewer https://chromedevtools.github.io/timeline-viewer/ to view trace file
    await page.tracing.stop();

    const datetime  = new Date().toISOString().replace(/[-:\.]/g, '_');
    const traceName = path.join(config.profileFolder, `trace-${datetime}.json`);
    // include cpu/memory/network data in trace
    fs.renameSync(config.tracingOptions.path, traceName);
    const networkName = path.join(config.profileFolder, `networks-${datetime}.json`);
    // save the network data
    fs.writeFileSync(networkName,JSON.stringify(networkRequests));
    //add profile result to git 
    await simpleGit.add([traceName, networkName]);
  } catch (err) {
    console.error(err);
  } finally {
    if (browser) {
      await browser.close();
    }
    if(child){
      // will exit after destroy stdin of child and kill child
      child.stdin.destroy();
      child.kill();
    }
    process.exit();
  }
}

