/**
 * Contains all configuration for the report.
 * For the development mode, it just uses mock data from the `data` directory.
 */

import { ReportStats, ReportConfig } from './types';

let reportStats: ReportStats;
let reportConfig: ReportConfig;
let reportDate: Date;

if (process.env.NODE_ENV === 'development') {
  reportStats = require('./data/sample-data.json');
  reportConfig = require('./data/sample-config.json');
  reportDate = new Date();
} else {
  const { REPORT_STATS, REPORT_CONFIG, REPORT_DATE } = window as any;
  if (!REPORT_STATS) {
    throw new Error('REPORT_STATS is not set');
  }
  if (!REPORT_CONFIG) {
    throw new Error('REPORT_CONFIG is not set');
  }
  if (!REPORT_DATE) {
    throw new Error('REPORT_DATE is not set');
  }
  reportStats = REPORT_STATS;
  reportConfig = REPORT_CONFIG;
  reportDate = new Date(REPORT_DATE);
}

export { reportStats, reportConfig, reportDate };
