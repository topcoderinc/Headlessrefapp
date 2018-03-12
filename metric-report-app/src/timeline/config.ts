/**
 * Contains all configuration for the report.
 * For the development mode, it just uses mock data from the `data` directory.
 */

import { DataSeries } from './types';

let metrics: string[];
let dataSeries: DataSeries[];

if (process.env.NODE_ENV === 'development') {
  metrics = require('./data/sample-metrics.json');
  dataSeries = require('./data/sample-series.json');
} else {
  const { METRICS, DATA_SERIES } = window as any;
  if (!METRICS) {
    throw new Error('METRICS is not set');
  }
  if (!DATA_SERIES) {
    throw new Error('DATA_SERIES is not set');
  }
  metrics = METRICS;
  dataSeries = DATA_SERIES;
}

export { metrics, dataSeries };
