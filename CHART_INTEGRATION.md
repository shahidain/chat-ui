# Chart Integration in Chat UI

This chat interface now supports displaying various types of charts alongside messages. Here's how to use the chart functionality:

## Supported Chart Types

1. **Pie Charts** - For showing data distribution
2. **Bar Charts** - For comparing values across categories
3. **Line Charts** - For showing trends over time
4. **Scatter Plots** - For showing relationships between two variables

## How to Test Charts

You can test the chart functionality by typing these commands in the chat:

- `[chart:pie]` - Displays a sample pie chart
- `[chart:bar]` - Displays a sample bar chart  
- `[chart:line]` - Displays a sample line chart
- `[chart:scatter]` - Displays a sample scatter plot

## Integration Features

✅ **Responsive Design**: Charts automatically adjust to different screen sizes
✅ **Theme Consistency**: Charts use your app's color scheme (RGB(0,85,170) gradient)
✅ **Message Layout**: Charts are seamlessly integrated into the message flow
✅ **TypeScript Support**: Full type safety for chart data structures

## Chart Data Structure

Charts use the following TypeScript interface:

```typescript
interface ChartData {
  type: 'pie' | 'bar' | 'line' | 'scatter';
  title?: string;
  data: ChartDataPoint[];
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
}
```

## Custom Chart Integration

To add custom charts to messages, include a `chartData` property in your message object:

```typescript
const messageWithChart: Message = {
  id: 'example',
  text: 'Here is your sales data:',
  sender: 'bot',
  timestamp: new Date(),
  chartData: {
    type: 'bar',
    title: 'Monthly Sales',
    data: [
      { month: 'Jan', sales: 4000 },
      { month: 'Feb', sales: 3000 },
      { month: 'Mar', sales: 5000 }
    ],
    xKey: 'month',
    yKey: 'sales'
  }
};
```

The charts will maintain the layout consistency and responsive design of your chat interface.
