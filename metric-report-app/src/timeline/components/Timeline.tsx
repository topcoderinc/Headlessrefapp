import * as React from 'react';
import * as moment from 'moment';
import * as R from 'ramda';
import * as c3 from 'c3';
import Select, { Option } from 'react-select';
import { DataSeries } from '../types';
import { RouteStats } from '../../chart/types';

export interface TimelineProps {
  dataSeries: DataSeries[];
  metrics: string[];
}

export type DateType = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

export interface TimelineState {
  metric?: string | null;
  routes: Option<string>[] | null;
  date: DateType | null;
  allRoutes: Option<string>[];
  customStart: Date | null;
  customEnd: Date | null;
}

export class Timeline extends React.Component<TimelineProps, TimelineState> {
  constructor(props: TimelineProps) {
    super(props);
    const allRoutes = R.pipe(
      R.chain((item: DataSeries) => item.routes),
      R.map((item: RouteStats) => item.url)<'1', 'list'>(),
      R.uniq,
      R.map((url: string) => ({
        label: url,
        value: url,
      }))<'1', 'list'>(),
    )(props.dataSeries);
    this.state = {
      metric: null,
      routes: null,
      date: null,
      allRoutes,
      customStart: null,
      customEnd: null,
    };
    console.log(moment);
  }

  // componentDidMount() {
  //   c3.generate({
  //     bindto: '#chart',
  //     data: {
  //       columns: [
  //         ['data1', 30, 200, 100, 400, 150, 250],
  //         ['data2', 50, 20, 10, 40, 15, 25],
  //       ],
  //     },
  //   });
  // }
  getDateRange = () => {
    const { date, customStart, customEnd } = this.state;
    const endOfDay = moment()
      .endOf('day')
      .toDate()
      .getTime();
    switch (date!) {
      case 'today':
        return {
          start: moment()
            .startOf('day')
            .toDate()
            .getTime(),
          end: endOfDay,
        };
      case 'yesterday':
        return {
          start: moment()
            .add(-1, 'day')
            .startOf('day')
            .toDate()
            .getTime(),
          end: moment()
            .add(-1, 'day')
            .endOf('day')
            .toDate()
            .getTime(),
        };
      case 'week':
        return {
          start: moment()
            .startOf('week')
            .toDate()
            .getTime(),
          end: endOfDay,
        };
      case 'month':
        return {
          start: moment()
            .startOf('month')
            .toDate()
            .getTime(),
          end: endOfDay,
        };
      case 'custom': {
        return {
          start: customStart!.getTime(),
          end: customEnd!.getTime(),
        };
      }
    }
  };
  drawChart = () => {
    const { metric, routes, date, customEnd, customStart } = this.state;
    const { dataSeries } = this.props;
    if (!metric || !routes || !date) {
      return;
    }
    if (date === 'custom' && (!customEnd || !customStart)) {
      return;
    }
    const { start, end } = this.getDateRange();
    // routes.reduce(
    //   (acc, item) => {
    //     acc[item.value!] = true;
    //     return acc;
    //   },
    //   {} as { [s: string]: boolean },
    // );
    const urlToValues = routes.reduce(
      (acc, item) => {
        acc[item.value!] = [];
        return acc;
      },
      {} as { [s: string]: number[] },
    );
    const filtered = dataSeries.filter(data => {
      const date = new Date(data.date).getTime();
      return date >= start && date <= end;
    });
    const xColumn = ['x', ...filtered.map(item => item.date)];
    filtered.forEach(data => {
      const routeMap = R.indexBy(item => item.url, data.routes);
      data.routes.forEach(item => {
        const routeState = routeMap[item.url];
        urlToValues[item.url].push(routeState ? routeState[metric] : 0);
      });
    });
    const columns = [
      xColumn,
      ...R.toPairs(urlToValues).map(pair => [pair[0], ...pair[1]]),
    ];
    c3.generate({
      bindto: '#chart',
      data: {
        x: 'x',
        columns,
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%Y-%m-%d',
          },
        },
      },
    });
  };
  changeMetric = (value: Option<string> | null) => {
    if (!value) {
      return;
    }
    this.setState({ metric: value.value }, this.drawChart);
  };

  changeRoutes = (value: Option<string> | Option<string>[] | null) => {
    if (!value || !Array.isArray(value)) {
      return;
    }
    this.setState({ routes: value }, this.drawChart);
  };

  changeDate = (value: Option<string> | null) => {
    if (!value) {
      return;
    }
    this.setState({ date: value.value as DateType }, this.drawChart);
  };

  render() {
    const { metric, allRoutes, routes, date } = this.state;
    const { metrics } = this.props;

    return (
      <div>
        <div className="row">
          <div className="col-md-4">
            <div className="form-group">
              <label>Metric:</label>
              <Select
                clearable={false}
                value={metric || undefined}
                onChange={this.changeMetric}
                options={metrics.map(item => ({ value: item, label: item }))}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label>Routes:</label>
              <Select
                clearable={false}
                multi
                value={routes || undefined}
                onChange={this.changeRoutes}
                options={allRoutes}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label>Date:</label>
              <Select
                clearable={false}
                value={date as string}
                onChange={this.changeDate}
                options={[
                  { value: 'today', label: 'Today' },
                  { value: 'yesterday', label: 'Yesterday' },
                  { value: 'week', label: 'This week' },
                  { value: 'month', label: 'This month' },
                  { value: 'custom', label: 'Custom' },
                ]}
              />
            </div>
          </div>
        </div>
        <div id="chart" />
      </div>
    );
  }
}
