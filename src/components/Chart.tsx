import React from 'react';
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
  '#98D8C8',
  '#F7DC6F'
];

const Chart: React.FC<ChartProps> = ({ chartData }) => {
  const { type, title, data, xKey, yKey, nameKey, valueKey } = chartData;

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart width={400} height={300}>
            <Pie
              data={data}
              cx={200}
              cy={150}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
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
            <Bar dataKey={yKey || 'value'} fill="rgb(0, 85, 170)" />
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
  };

  return (
    <div className="chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;
