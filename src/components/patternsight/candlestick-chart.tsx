'use client';

import type { StockDataPoint, SupportResistance } from '@/lib/types';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';

type CandlestickChartProps = {
  data: StockDataPoint[];
  supportResistance: SupportResistance;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-background/80 border rounded-lg shadow-lg backdrop-blur-sm">
        <p className="font-bold">{format(new Date(data.date), 'MMM d, yyyy')}</p>
        <p className={`text-sm ${data.close > data.open ? 'text-green-500' : 'text-red-500'}`}>
          Close: {data.close.toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground">Open: {data.open.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">High: {data.high.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">Low: {data.low.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">Volume: {data.volume.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};


// Custom shape for the candle body
const Candle = (props: any) => {
    const { x, y, width, height, fill } = props;
    // Don't render if height is 0 or less
    if (height <= 0) return null;
    return <rect x={x} y={y} width={width} height={height} fill={fill} />;
};


export function CandlestickChart({ data, supportResistance }: CandlestickChartProps) {
  const chartData = data.map(d => ({
    ...d,
    // For the wick
    wick: [d.low, d.high],
    // For the body
    body: [d.open, d.close],
  }));

  const domainMin = Math.min(...data.map(d => d.low)) * 0.95;
  const domainMax = Math.max(...data.map(d => d.high)) * 1.05;

  return (
    <div style={{ width: '100%', height: 450 }}>
      <ResponsiveContainer>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(new Date(date), 'MMM yy')}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
          <YAxis 
            orientation="right" 
            domain={[domainMin, domainMax]}
            tickFormatter={(val) => `$${Number(val).toFixed(0)}`}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Support Lines */}
          {supportResistance.support.map((level, i) => (
             <ReferenceLine key={`sup-${i}`} y={level} label={{ value: `S${i+1}`, position: 'insideTopLeft', fill: 'hsl(var(--accent-foreground))', background: {fill: 'hsl(var(--accent))', padding: [2, 4, 2, 4], radius: 4} }} stroke="hsl(var(--accent))" strokeDasharray="4 4" />
          ))}

          {/* Resistance Lines */}
           {supportResistance.resistance.map((level, i) => (
             <ReferenceLine key={`res-${i}`} y={level} label={{ value: `R${i+1}`, position: 'insideTopLeft', fill: 'hsl(var(--accent-foreground))', background: {fill: 'hsl(var(--accent))', padding: [2, 4, 2, 4], radius: 4} }} stroke="hsl(var(--accent))" strokeDasharray="4 4" />
          ))}

          {/* Wick */}
          <Bar dataKey="wick" fill="hsl(var(--foreground))" barSize={1} />
          
          {/* Body */}
          {chartData.map((entry, index) => {
            const isBullish = entry.close > entry.open;
            return (
              <Bar 
                key={`candle-${index}`} 
                dataKey="body"
                shape={<Candle />}
                fill={isBullish ? 'hsl(140, 70%, 50%)' : 'hsl(0, 70%, 50%)'}
                />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
