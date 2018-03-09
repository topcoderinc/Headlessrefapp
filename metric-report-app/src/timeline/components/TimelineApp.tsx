import * as React from 'react';
import { metrics, dataSeries } from '../config';
import { Timeline } from './Timeline';

/**
 * Main component. Provide data for all child components.
 */
export const TimelineApp: React.SFC = () => {
  return (
    <div className="container main">
      <h1>Timeline</h1>
      <Timeline metrics={metrics} dataSeries={dataSeries} />
    </div>
  );
};
