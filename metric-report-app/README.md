# Metric report


## Prerequisites
1. Node 8.9
1. NPM 5.5

## Usage

### Installation

    npm install

### Development Mode
Chart report  
Run `npm start:chart`  
Open http://localhost:1234/
It uses data from `chart/data` directory:
- `sample-config.json` - configuration for threshold
- `sample-data.json` - values for charts

Timeline report  
demo http://take.ms/u8GFz

Run `npm start:timeline`  
Open http://localhost:1234/
It uses data from `timeline/data` directory:
- `sample-metrics.json` - list of all metrics
- `sample-series.json` - chart data