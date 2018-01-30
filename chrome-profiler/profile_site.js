const fs = require('fs');
const chromeLauncher = require('chrome-launcher');
const cdp = require('chrome-remote-interface');
var spawn = require('child_process').spawn;

// URL of the app to be loaded 
const url = 'http://localhost:9000/';

/**
 * function to spawn a new linux process
 * @param  {string} dir working directory for the process
 * @param  {string} cmd command to start the new process
 * @return {object}     spawned Process
 */
function spawnProcess(dir, cmd) {
  var cmdParts = cmd.split(/\s+/);

  return spawn(cmdParts[0], cmdParts.slice(1), { cwd: dir});
}

var child = spawnProcess('.', 'npm start');

child.stdout.on('data', async function (data) {
  console.log(data.toString('utf-8'));
  //check if the angular app has been served.
  if(data && data.indexOf('Project is running at') >= 0){
      hookProfiler();//hook the profiler to a headless chrome
  }
});

// log any errors in child process
child.stderr.on('data', function (data) {
  console.log("error", data.toString('utf-8'));
});

async function hookProfiler(){
  //launch chrome headless
  const chrome = await chromeLauncher.launch({port: 9222});
  const client = await cdp();

  try {
        const events = [];// log events
        const networkRequests = [];//log network requests
        const {Network, Page, Tracing} = client;
        Network.requestWillBeSent((params) => {
            networkRequests.push(params);
        });

        await Page.enable();
        await Network.enable();

        Tracing.dataCollected(({value}) => {
            events.push(...value);
        });

        await Tracing.start();
        await Page.navigate({url});
        await Page.loadEventFired();
        await Tracing.end();
        await Tracing.tracingComplete();

        // save the data
        fs.writeFileSync('./timeline.json', JSON.stringify(events));
        fs.writeFileSync('./network.json', JSON.stringify(networkRequests, null, 4));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
        await chrome.kill();
        console.log('press control+c to quit.');
    }
}
