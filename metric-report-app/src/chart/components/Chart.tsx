import * as React from 'react';
import * as d3 from 'd3';
import { ReportConfig } from '../types';

export interface ChartProps {
  name: string;
  value: number;
  config: ReportConfig;
}

/**
 * Displays a circle chart.
 */
export class Chart extends React.Component<ChartProps> {
  div: HTMLDivElement | null = null;

  componentDidMount() {
    const { name, value, config } = this.props;

    const threshold = config[name];

    const colors = {
      red: '#df332f',
      yellow: '#ffab00',
      green: '#2b882f',
    };

    const getPercent = () => {
      if (threshold === 0) {
        return 100;
      }
      return Math.round(Math.min(value / threshold, 1) * 100);
    };

    const getColor = () => {
      if (value > threshold) {
        return colors.red;
      }
      if (value <= config.healthyRatio * threshold) {
        return colors.green;
      }
      return colors.yellow;
    };

    const percent = getPercent();
    const color = getColor();

    const radius = 50;
    const border = 1;
    const padding = 10;

    const twoPi = Math.PI * 2;
    const boxSize = (radius + padding) * 2;

    const arc = d3.svg
      .arc()
      .startAngle(0)
      .innerRadius(radius)
      .outerRadius(radius - border);

    const parent = d3.select(this.div);

    const svg = parent
      .append('svg')
      .attr('width', boxSize)
      .attr('height', boxSize);

    const g = svg
      .append('g')
      .attr('transform', 'translate(' + boxSize / 2 + ',' + boxSize / 2 + ')');

    const meter = g.append('g').attr('class', 'progress-meter');

    meter
      .append('path')
      .attr('class', 'background')
      .attr('fill', '#ccc')
      .attr('fill-opacity', 0.5)
      .attr('d', arc.endAngle(twoPi));

    const foreground = meter
      .append('path')
      .attr('class', 'foreground')
      .attr('fill', color)
      .attr('fill-opacity', 1)
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 1);

    const front = meter
      .append('path')
      .attr('class', 'foreground')
      .attr('fill', color)
      .attr('fill-opacity', 1);

    const numberText = meter
      .append('text')
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em');

    const progress = percent / 100;
    if (progress > 0) {
      foreground.attr('d', arc.endAngle(twoPi * progress));
      front.attr('d', arc.endAngle(twoPi * progress));
    }
    numberText.text(value);
  }

  render() {
    return (
      <div className="chart">
        <div ref={div => (this.div = div)} />

        <div className="chart__name">{this.props.name}</div>
      </div>
    );
  }
}
