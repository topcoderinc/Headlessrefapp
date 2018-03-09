/**
 * Module for generating reports.
 */

const fs = require('fs');
const glob = require('glob');
const Path = require('path');
const config = require('./report-config');

const basePath = Path.join(__dirname, '../profiling-data/');

const chartContent = fs.readFileSync(
  Path.join(__dirname, '../scorecard-reports/lib/chart.html'),
  'utf8',
);
const timelineContent = fs.readFileSync(
  Path.join(__dirname, '../scorecard-reports/lib/timeline.html'),
  'utf8',
);
const configContent = fs.readFileSync(
  Path.join(__dirname, './report-config.json'),
  'utf8',
);

const files = glob.sync('profiles-*.json', {
  cwd: basePath,
});

if (!files.length) {
  console.log('No profiles found');
  process.exit();
}

// convert 2018_02_23T08_19_55_772Z
// to 2018-02-23T08:19:55.772Z
const parseDate = str => {
  const [date, time] = str.split('T');
  const [h, m, s, ms] = time.split('_');
  const transformed =
    date.replace(/_/g, '-') + 'T' + [h, m, s].join(':') + '.' + ms;
  return new Date(transformed);
};

const dataSeries = [];

// insert at the end in <head>
function injectJS(content, js) {
  return content.replace('</head>', js + '</head>');
}

files.forEach(name => {
  console.log('processing', name);
  const stats = fs.readFileSync(Path.join(basePath, name), 'utf8');
  const formattedDate = name.replace('profiles-', '').replace('.json', '');
  const date = parseDate(formattedDate);
  if (date.toString() === 'Invalid Date') {
    console.log(`Invalid date "${formattedDate}". Ignoring file.`);
    return;
  }
  const reportName = `scorecard-reports-${formattedDate}.html`;
  const reportPath = Path.join(__dirname, '../scorecard-reports/', reportName);
  const injectedContent = `
    <script type="text/javascript">
      window.REPORT_STATS = ${stats};
      window.REPORT_CONFIG = ${configContent};
      window.REPORT_DATE = "${date.toISOString()}";
    </script>
  `;
  // insert at the end in <head>
  const reportHtml = injectJS(chartContent, injectedContent);
  fs.writeFileSync(reportPath, reportHtml);
  console.log('generated report successfully', reportName);
  dataSeries.push({
    date: date.toISOString(),
    routes: JSON.parse(stats).routes,
  });
});

const timelineName = `timeline-chart.html`;
const timelinePath = Path.join(
  __dirname,
  '../scorecard-reports/',
  timelineName,
);
const metrics = Object.keys(config).filter(item => item !== 'healthyRatio');
const injectedContent = `
  <script type="text/javascript">
    window.METRICS = ${JSON.stringify(metrics)};
    window.DATA_SERIES = ${JSON.stringify(dataSeries)};
  </script>
`;
const timelineHtml = injectJS(timelineContent, injectedContent);
fs.writeFileSync(timelinePath, timelineHtml);
console.log('generated timeline successfully');
