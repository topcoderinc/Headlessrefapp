import * as React from 'react';
import { RouteStats } from '../types';
import { Title } from './Title';

export interface RouteListProps {
  routes: RouteStats[];
}

/**
 * Displays a list of all routes in the left sidebar.
 */
export const RouteList: React.SFC<RouteListProps> = ({ routes }) => {
  return (
    <div>
      <Title>Total Routes: {routes.length}</Title>
      <div className="list-group">
        {routes.map((route, i) => (
          <a
            key={i}
            href={`#route-${i}`}
            className="list-group-item list-group-item-action route-name"
          >
            {route.url}
          </a>
        ))}
      </div>
    </div>
  );
};
