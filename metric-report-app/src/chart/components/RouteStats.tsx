import * as React from 'react';
import { RouteStats as RouteStatsType, ReportConfig } from '../types';
import { Chart } from './Chart';

export interface RouteStatsProps {
  route: RouteStatsType;
  config: ReportConfig;
  index: number;
}

/**
 * Display charts for a given route.
 */
export const RouteStats: React.SFC<RouteStatsProps> = ({
  route,
  config,
  index,
}) => {
  const { url, ...chartValues } = route;
  return (
    <div id={`route-${index}`} className="card">
      <div className="card-body">
        <h5 className="card-title">
          <strong>Results for: </strong> {url}
        </h5>
        <div className="charts-container">
          {Object.keys(chartValues).map(name => (
            <Chart
              key={name}
              name={name}
              config={config}
              value={chartValues[name]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
