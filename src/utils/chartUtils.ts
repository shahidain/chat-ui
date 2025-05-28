import type { ChartData, ChartDataPoint } from '../types/chat';

// Sample data generators for testing charts
export const generateSampleChartData = {
  pie: (): ChartData => ({
    type: 'pie',
    title: 'Sales Distribution',
    data: [
      { name: 'Product A', value: 400 },
      { name: 'Product B', value: 300 },
      { name: 'Product C', value: 200 },
      { name: 'Product D', value: 100 },
    ],
    nameKey: 'name',
    valueKey: 'value'
  }),

  bar: (): ChartData => ({
    type: 'bar',
    title: 'Monthly Revenue',
    data: [
      { name: 'Jan', value: 4000 },
      { name: 'Feb', value: 3000 },
      { name: 'Mar', value: 5000 },
      { name: 'Apr', value: 4500 },
      { name: 'May', value: 6000 },
      { name: 'Jun', value: 5500 },
    ],
    xKey: 'name',
    yKey: 'value'
  }),

  line: (): ChartData => ({
    type: 'line',
    title: 'Website Traffic Over Time',
    data: [
      { name: 'Week 1', value: 1200 },
      { name: 'Week 2', value: 1800 },
      { name: 'Week 3', value: 1600 },
      { name: 'Week 4', value: 2200 },
      { name: 'Week 5', value: 2800 },
      { name: 'Week 6', value: 3200 },
    ],
    xKey: 'name',
    yKey: 'value'
  }),

  scatter: (): ChartData => ({
    type: 'scatter',
    title: 'Price vs Performance',
    data: [
      { x: 100, y: 200 },
      { x: 120, y: 250 },
      { x: 170, y: 300 },
      { x: 140, y: 280 },
      { x: 150, y: 320 },
      { x: 110, y: 220 },
    ],
    xKey: 'x',
    yKey: 'y'
  })
};

// Helper function to parse chart commands from text
export const parseChartCommand = (text: string): ChartData | null => {
  // Simple pattern matching for chart commands
  const chartMatch = text.match(/\[chart:(\w+)\]/i);
  if (!chartMatch) return null;

  const chartType = chartMatch[1].toLowerCase() as 'pie' | 'bar' | 'line' | 'scatter';
  
  switch (chartType) {
    case 'pie':
    case 'bar':
    case 'line':
    case 'scatter':
      return generateSampleChartData[chartType]();
    default:
      return null;
  }
};

// Helper function to create custom chart data
export const createChartData = (
  type: 'pie' | 'bar' | 'line' | 'scatter',
  title: string,
  data: ChartDataPoint[],
  keys: { x?: string; y?: string; name?: string; value?: string } = {}
): ChartData => ({
  type,
  title,
  data,
  xKey: keys.x,
  yKey: keys.y,
  nameKey: keys.name,
  valueKey: keys.value
});
