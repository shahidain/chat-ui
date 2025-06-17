import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { ChartData } from '../types/chat';
import './Chart.css';

interface ChartProps {
  chartData: ChartData;
}

const COLORS = [
  'rgb(0, 85, 170)',
  'rgb(70, 160, 255)',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',  '#F7DC6F'
];

// Custom comparison function for React.memo to deeply compare chartData
const arePropsEqual = (prevProps: ChartProps, nextProps: ChartProps): boolean => {
  // Quick reference check first
  if (prevProps.chartData === nextProps.chartData) {
    return true;
  }
  
  const prev = prevProps.chartData;
  const next = nextProps.chartData;
  
  // Compare primitive properties
  if (
    prev.type !== next.type ||
    prev.title !== next.title ||
    prev.xKey !== next.xKey ||
    prev.yKey !== next.yKey ||
    prev.nameKey !== next.nameKey ||
    prev.valueKey !== next.valueKey ||
    prev.description !== next.description
  ) {
    return false;
  }
  
  // Compare data arrays
  if (prev.data.length !== next.data.length) {
    return false;
  }
  
  // Deep compare data array elements
  for (let i = 0; i < prev.data.length; i++) {
    const prevItem = prev.data[i];
    const nextItem = next.data[i];
    
    const prevKeys = Object.keys(prevItem);
    const nextKeys = Object.keys(nextItem);
    
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    
    for (const key of prevKeys) {
      if (prevItem[key] !== nextItem[key]) {
        return false;
      }
    }
  }
  
  return true;
};

const Chart: React.FC<ChartProps> = React.memo(({ chartData }) => {
  const { type, title, data, xKey, yKey, nameKey, valueKey } = chartData;
  
  const getPieRadius = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? 80 : 130;
    }
    return 130;
  };

  const renderChart = useMemo(() => {
    switch (type) {      
      case 'pie':
        return (
          <PieChart width={400} height={300}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={getPieRadius()}
              fill="#8884d8"
              dataKey={valueKey || 'value'}
              nameKey={nameKey || 'name'}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey || 'name'} />            
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yKey || 'value'}>
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'line':
        return (
          <LineChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={yKey || 'value'} 
              stroke="rgb(0, 85, 170)" 
              strokeWidth={2}
              dot={{ fill: 'rgb(70, 160, 255)', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'scatter':
        return (
          <ScatterChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey || 'x'} name={xKey || 'X'} />
            <YAxis dataKey={yKey || 'y'} name={yKey || 'Y'} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter 
              name="Data Points" 
              dataKey={yKey || 'y'} 
              fill="rgb(0, 85, 170)" 
            />
          </ScatterChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  }, [type, data, xKey, yKey, nameKey, valueKey]);

  return (
    <div className="chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          {renderChart}
        </ResponsiveContainer>
      </div>
    </div>
  );
}, arePropsEqual);

Chart.displayName = 'Chart';

export default Chart;
