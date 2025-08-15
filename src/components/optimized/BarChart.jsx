import React, { memo } from 'react';
import { Bar } from 'react-chartjs-2';
import { measurePerformance } from '../../utils/performanceMonitor';

const BarChart = memo(({ data, options }) => {
  const renderChart = () => {
    return measurePerformance('BarChart-render', () => (
      <Bar data={data} options={options} />
    ));
  };

  return renderChart();
});

BarChart.displayName = 'BarChart';

export default BarChart;
