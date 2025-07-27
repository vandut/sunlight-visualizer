import React, { useMemo } from 'react';
import useSimulationStore from '../stores/useSimulationStore';
import { getDailySunlightData } from '../utils/sunlight-data';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SunlightChartProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const SunlightChart: React.FC<SunlightChartProps> = ({ isExpanded, onToggle }) => {
  // Select state atomically to prevent re-renders on unrelated state changes (e.g., time, camera position)
  const date = useSimulationStore((state) => state.date);
  const location = useSimulationStore((state) => state.location);
  const weather = useSimulationStore((state) => state.weather);

  const theoreticalData = useMemo(() => {
    return getDailySunlightData(date, location);
  }, [date, location]);

  const processedData = useMemo(() => {
    const getMultiplier = () => {
      switch (weather) {
        case 'Cloudy':
          return 0.2;
        case 'Rainy':
          return 0.05;
        case 'Sunny':
        default:
          return 1.0;
      }
    };
    const multiplier = getMultiplier();
    return theoreticalData.map((lux) => Math.round(lux * multiplier));
  }, [theoreticalData, weather]);

  // Format data for Recharts: an array of objects.
  const chartData = useMemo(() => {
    const data = processedData.map((lux, index) => ({
      hour: index,
      lux,
    }));
    // To make the line extend to 24h, add a data point for hour 24.
    // The lux value at 24h is assumed to be the same as 0h for a continuous-looking chart.
    if (data.length > 0) {
      data.push({ hour: 24, lux: data[0].lux });
    }
    return data;
  }, [processedData]);

  return (
    <div className={`absolute bottom-0 left-0 z-20 ${isExpanded ? 'w-full' : ''}`}>
      <button 
        onClick={onToggle}
        className={`
          bg-white/80 backdrop-blur-sm text-slate-700 font-medium py-2 px-6 
          border-t border-l border-r border-slate-200 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
          rounded-tr-lg select-none
        `}
        aria-expanded={isExpanded}
        aria-controls="sunlight-chart-panel"
      >
        {isExpanded ? 'Hide Chart' : 'Show Chart'}
      </button>

      {isExpanded && (
        <div 
          id="sunlight-chart-panel"
          className="h-64 bg-white/80 backdrop-blur-sm border-t border-r border-l border-slate-200 p-4 flex flex-col -mt-px"
          aria-hidden={!isExpanded}
        >
          <p className="text-slate-700 font-bold text-center flex-shrink-0 mb-2 select-none">Sunlight Exposure Analysis</p>
          <div className="flex-grow bg-slate-200/50 rounded flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 0,
                  left: -10,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#d1d5db" />
                <XAxis
                  dataKey="hour"
                  type="number"
                  domain={[0, 24]}
                  ticks={[3, 6, 9, 12, 15, 18, 21]}
                  tickFormatter={(tick) => `${tick}h`}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                  style={{ fontSize: '12px', fill: '#64748b', fontFamily: 'sans-serif', userSelect: 'none' }}
                />
                <YAxis hide={true} domain={[0, 100000]} />
                <Tooltip
                  isAnimationActive={false}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: '500' }}
                  formatter={(value: number, name: string) => [`${Math.round(value)} lux`, 'Sunlight']}
                  labelFormatter={(label: number) => `Hour: ${label}`}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="lux"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#chartFill)"
                  dot={false}
                  activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SunlightChart;