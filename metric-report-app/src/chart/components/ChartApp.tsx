import * as React from 'react';
import { reportStats, reportConfig, reportDate } from '../config';
import { RouteList } from './RouteList';
import { RouteStats } from './RouteStats';
import { Title } from './Title';

/**
 * Main component. Provide data for all child components.
 */
export const ChartApp: React.SFC = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-4 col-md-6 col-sm-12 scroll">
          <RouteList routes={reportStats.routes} />
        </div>
        <div className="col-lg-8 col-md-6 col-sm-12 scroll">
          <Title>Report Date: {reportDate.toUTCString()}</Title>
          {reportStats.routes.map((item, i) => (
            <RouteStats key={i} index={i} route={item} config={reportConfig} />
          ))}
        </div>
      </div>
    </div>
  );
};
