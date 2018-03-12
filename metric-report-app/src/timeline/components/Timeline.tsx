import * as React from 'react';
import { Moment } from 'moment';
import moment from '../../moment';
import * as R from 'ramda';
import * as c3 from 'c3';
import Select, { Option } from 'react-select';
import { DateRangePicker } from 'react-dates';
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
  customStart: Moment | null;
  customEnd: Moment | null;
  focusedInput: 'startDate' | 'endDate' | null;
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
      focusedInput: null,
    };
  }

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
          start: customStart!.toDate().getTime(),
          end: customEnd!.toDate().getTime(),
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
    const xColumn = ['x', ...filtered.map(item => new Date(item.date))] as any;
    filtered.forEach(data => {
      const routeMap = R.indexBy(item => item.url, data.routes);
      routes.forEach(item => {
        const routeState = routeMap[item.value!];
        urlToValues[item.value!].push(routeState ? routeState[metric] : 0);
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
            format: '%Y-%m-%d %H:%M',
          },
        },
      },
      padding: {
        right: 100,
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

  changeRange = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    this.setState(
      { customStart: startDate, customEnd: endDate },
      this.drawChart,
    );
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
              {date === 'custom' && (
                <DateRangePicker
                  startDate={this.state.customStart}
                  startDateId="start"
                  endDate={this.state.customEnd}
                  endDateId="end"
                  onDatesChange={this.changeRange}
                  focusedInput={this.state.focusedInput}
                  onFocusChange={focusedInput =>
                    this.setState({ focusedInput })
                  }
                  isOutsideRange={() => false}
                />
              )}
            </div>
          </div>
        </div>
        <div id="chart" />
      </div>
    );
  }
}
