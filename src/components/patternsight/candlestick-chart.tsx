'use client';

import type { StockDataPoint, SupportResistance } from '@/lib/types';
import {
  ComposedChart,
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


export function CandlestickChart({ data, supportResistance }: CandlestickChartProps) {
  const domainMin = Math.min(...data.map(d => d.low)) * 0.95;
  const domainMax = Math.max(...data.map(d => d.high)) * 1.05;

  return (
    <div style={{ width: '100%', height: 450 }}>
      <ResponsiveContainer>
        <ComposedChart data={data}>
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
             <ReferenceLine key={`sup-${i}`} y={level} label={{ value: `S${i+1}`, position: 'insideTopLeft', fill: 'hsl(var(--accent-foreground))' }} stroke="hsl(var(--accent))" strokeDasharray="4 4" />
          ))}

          {/* Resistance Lines */}
           {supportResistance.resistance.map((level, i) => (
             <ReferenceLine key={`res-${i}`} y={level} label={{ value: `R${i+1}`, position: 'insideTopLeft', fill: 'hsl(var(--accent-foreground))' }} stroke="hsl(var(--accent))" strokeDasharray="4 4" />
          ))}

          {/* Price lines */}
          <Line
            type="monotone"
            dataKey="close"
            name="Close"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="open"
            name="Open"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
