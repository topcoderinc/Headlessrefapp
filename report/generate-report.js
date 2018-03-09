/**
 * Module for generating reports.
 */

const fs = require('fs');
const glob = require('glob');
const Path = require('path');
const config = require('./report-config');

const basePath = Path.join(__dirname, '../profiling-data/');

const indexContent = fs.readFileSync(
  Path.join(__dirname, '../scorecard-reports/lib/chart.html'),
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
  const reportContent = indexContent.replace(
    '</head>',
    injectedContent + '</head>',
  );
  fs.writeFileSync(reportPath, reportContent);
  console.log('generated report successfully', reportName);
});
