import * as moment from 'moment';

/**
 * Generate sample data
 * Run under metric-report-app
 *
 * ts-node src/timeline/generate.ts > src/timeline/data/sample-series.json
 */

const urls = [
  'http://localhost:9000/',
  'http://localhost:9000/#section/Authentication',

  'http://localhost:9000/?url=https://api.apis.guru/v2/specs/instagram.com/1.0.0/swagger.yaml#tag/locations',

  'http://localhost:9000/?url=https://api.apis.guru/v2/specs/data2crm.com/1/swagger.yaml#tag/Account',
  'http://localhost:9000/?url=https://api.apis.guru/v2/specs/graphhopper.com/1.0/swagger.yaml',
];

const count = 150;

const rand = (start: number, end: number, precision: number = 0) => {
  return Number((Math.random() * (end - start) + start).toFixed(precision));
};

const randFloat = (start: number, end: number) => rand(start, end, 2);

const data = Array.from(Array(count).keys()).map(i => {
  const date = moment()
    .add(-i * 10, 'hours')
    .format();
  const routes = urls.map(url => ({
    url,
    'total-watchers': rand(0, 10),
    'total-cache-size-mb': randFloat(20, 50),
    'total-indexeddb-size-mb': randFloat(20, 50),
    'total-global-variables': rand(100, 300),
    'total-console-logs': rand(10, 50),
    'total-browser-objects': rand(10, 50),
    'blocking-scripts': rand(0, 5),
    'total-sync-xhr': rand(0, 5),
    'total-async-xhr': rand(0, 5),
    'total-memory-utilization-mb': rand(100, 300),
    'total-page-weight-mb': rand(1, 7),
    'total-cpu-utilization-percentage': rand(10, 70),
  }));
  return {
    date,
    routes,
  };
});

console.log(JSON.stringify(data, null, 2));
