import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardData } from '../../data/dashboardData';

export const TaskCompletionChart = () => {
  return (
    <div className="bg-surface rounded-lg border border-border flex flex-col h-full min-h-[260px]">
      <div className="px-4 py-3 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold text-sm text-text-primary">Task Completion Trend</h3>
        <span className="text-xs text-text-muted">Last 7 Days</span>
      </div>
      <div className="p-4 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dashboardData.chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
              dy={6}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: 'none', backgroundColor: '#ffffff', padding: '6px 10px' }}
              itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '12px' }}
              labelStyle={{ color: '#64748b', marginBottom: '2px', fontSize: '11px' }}
            />
            <Area 
              type="monotone" 
              dataKey="completed" 
              stroke="var(--color-primary)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCompleted)" 
              activeDot={{ r: 4, fill: 'var(--color-primary)', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

