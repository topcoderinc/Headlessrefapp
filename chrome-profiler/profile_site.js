const fs = require('fs');
const puppeteer = require('puppeteer');
const spawn = require('child_process').spawn;
const path = require('path');
const { URL } = require('url');
const config = require(path.resolve(__dirname, 'config.json'));
const simpleGit = require('simple-git')();
const heapSnapshotLoader = require('./HeapSnapshotLoader');
const timeout = ms => new Promise(res => setTimeout(res, ms));
const getDateTime =_ => new Date().toISOString().replace(/[-:\.]/g, '_');
const formatBytes = bytes=>{
  let num  = bytes/Math.pow(1024,2);
  let chars = Array.from(String(num));
  let decimals = 0;
  let dotIndex = chars.findIndex(x=>x==='.');
  if(dotIndex !== -1){
    let nonZeroIndex = chars.findIndex(x=>x!=='.' && x!=='0');
    if(nonZeroIndex !== -1){
      decimals = nonZeroIndex;
    }
  }
  return Number(num.toFixed(decimals));
};
let child;
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
if(process.env.SKIP_START_APP){
  hookProfiler();//hook the profiler to a headless chrome
} else {
  child = spawnProcess('.', 'npm start');
  child.stdout.on('data', async function (data) {
    console.log(data.toString('utf-8'));
    //check if the angular app has been served.
    if (data && data.indexOf('Compiled successfully') >= 0) {
      await timeout(config.waitTimeout);// sleep to ensure everything is prepared
      hookProfiler();//hook the profiler to a headless chrome
    }
  });

   // log any errors in child process
  child.stderr.on('data', function (data) {
    console.log("error", data.toString('utf-8'));
  });
}


async function hookProfiler() {
  let browser;
  try {
    //launch chrome headless
    browser = await puppeteer.launch(config.puppeteerOptions);
    const routes = config.routes;
    const profiles = {'total-routes': routes.length, routes:[]};
    for(let i=0; i< routes.length; i++) {
      const page = await browser.newPage();
      const result = await pageProfiler(routes[i], page);
      console.log(result);
      profiles.routes.push(result);
      await page.close();
      await timeout(config.testBetweenTimeout);
    }
    const profilesName = path.join(config.profileFolder, `profiles-${getDateTime()}.json`);
    fs.writeFileSync(profilesName, JSON.stringify(profiles));
    //add profile result to git if is not skip and current directory is git repo
    if(!process.env.SKIP_ADD_GIT && await simpleGit.checkIsRepo()){
      await simpleGit.add(profilesName);
    }
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

/**
 * Profile page with url/selector
 * @param route cantains the page url and selector
 * @param page the chrome page
 * @returns profile result with all information
 */
async function pageProfiler(route, page) {
  const url = route.url;
  console.log(`Go to page with url ${url}`);
  const client = page._client;
  const networkRequests = [];//log network requests
  page.on('requestfinished', request => {
    networkRequests.push({
      'requestId': request._requestId,
      'documentURL': request._url,
      'request': {
        'method': request._method,
        'headers': request._headers
      },
      'response': {
        'url': request._response._url,
        'status': request._response._status,
        'headers': request._response._headers
      },
      'type': request._resourceType,
      'frameId': request._frame._id
    });

  });
  // need to listen console in page and Log.entryAdded in client to get all logs
  const logs = [];
  page.on('console', msg => {
    logs.push({
        type: msg._type,
        text: msg._text
    });
  });
  client.on('Log.entryAdded', logEntry => {
    logs.push(logEntry.entry);
  });

  // log heapsnapshot
  const chunks = [];
  client.on('HeapProfiler.addHeapSnapshotChunk', ({chunk}) => {
    heapSnapshotLoader.write(chunk);
    chunks.push(chunk);
  });

  // start events
  await page.tracing.start(config.tracingOptions);
  await client.send('Page.enable');
  await client.send('Log.enable');
  await client.send('Log.startViolationsReport', {config:[]});
  await client.send('HeapProfiler.enable');

  // go to page with url and wait for selector
  await page.goto(url, {timeout: config.pageTimeout});
  await page.waitForSelector(route.selector, {timeout: config.pageTimeout});

  // stop events
  await client.send('HeapProfiler.takeHeapSnapshot', {reportProgress: false});
  heapSnapshotLoader.close();
  await page._client.send('Log.stopViolationsReport');
  await page.tracing.stop();

  const datetime  = getDateTime();
  // timeline or trace file
  const traceName = path.join(config.profileFolder, `trace-${datetime}.json`);
  fs.renameSync(config.tracingOptions.path, traceName);

  // save the network data
  const networkName = path.join(config.profileFolder, `networks-${datetime}.json`);
  fs.writeFileSync(networkName,JSON.stringify(networkRequests));

  // save the heapsnapshot
  const logsName = path.join(config.profileFolder, `logs-${datetime}.json`);
  fs.writeFileSync(logsName, JSON.stringify(logs));

  // save the heapsnapshot, it is not json and can only load by chrome dev tools
  const heapsnapshotName = path.join(config.profileFolder, `heapsnapshot-${datetime}.heapsnapshot`) ;
  fs.writeFileSync(heapsnapshotName, chunks.join(''));
  // find detached nodes
  const heapSnapshot = heapSnapshotLoader.buildSnapshot();
  const nodes = heapSnapshot.aggregates(true, 'allObjects',(n)=>n.name().indexOf("Detached DOM")!==-1);
  console.log('Detached DOM');
  const totalDeachedDoms = Object.keys(nodes).reduce((previous, key)=>{
    console.log(`Category: ${key}, object count is ${nodes[key].count}`);
    return previous + nodes[key].count;
  }, 0);

  const totalWatchers = await page.evaluate(_ => {
    window.angular =  window.angular || {}; // avoid ReferenceError
    if(!angular|| !angular.element){
      // can only calculate watchers of Angular1 application
      return 0;
    } else {
      function getWatchers(root) {
        root = angular.element(root || document.documentElement);

        function getElemWatchers(element) {
          var isolateWatchers = getWatchersFromScope(element.data().$isolateScope);
          var scopeWatchers = getWatchersFromScope(element.data().$scope);
          var watchers = scopeWatchers.concat(isolateWatchers);
          angular.forEach(element.children(), function (childElement) {
            watchers = watchers.concat(getElemWatchers(angular.element(childElement)));
          });
          return watchers;
        }

        function getWatchersFromScope(scope) {
          if (scope) {
            return scope.$$watchers || [];
          } else {
            return [];
          }
        }

        return getElemWatchers(root);
      }
      return getWatchers().length;
    }
  });


  const sourceUrl = new URL(url);
  const sourceOrigin = sourceUrl.origin;
  const storageUsage = await client.send('Storage.getUsageAndQuota', {origin: sourceOrigin});
  console.log('storage usage');
  console.log(storageUsage);
  const indexDBStorage = storageUsage.usageBreakdown.find(s=>s.storageType === 'indexeddb');


  const  totalGlobalVariables  = await page.evaluate(_ =>Object.keys(window).length);
  const  totalCache  = await page.evaluate(_ =>{
    // https://stackoverflow.com/questions/4391575/how-to-find-the-size-of-localstorage
    // Each length is multiplied by 2 because the char in javascript stores as UTF-16 (occupies 2 bytes)
    // Storage will always return nothing or zero so have to calculate in this way
    return Object.keys(window.localStorage)
        .reduce((previous, key)=>
          previous + (key.length + window.localStorage[key].length) * 2, 0)
      + Object.keys(window.sessionStorage)
        .reduce((previous, key)=>previous + (key.length + window.sessionStorage[key].length) * 2, 0)
  });

  //add profile result to git if is not skip and current directory is git repo
  if(!process.env.SKIP_ADD_GIT && await simpleGit.checkIsRepo()){
    await simpleGit.add([traceName, networkName, logsName, heapsnapshotName]);
  }


  return {
    url: url,
    'total-watchers':totalWatchers,
    'total-cache-size-mb':formatBytes(totalCache),
    'total-indexeddb-size-mb': indexDBStorage ? formatBytes(indexDBStorage.usage): 0,
    'total-global-variables': totalGlobalVariables,
    'total-console-logs' : logs.length,
    'total-detached-dom':  totalDeachedDoms,
  }
}
