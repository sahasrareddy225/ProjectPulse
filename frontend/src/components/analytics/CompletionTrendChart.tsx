import { useMemo } from 'react';
import type { Task } from '../../types/task';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const CompletionTrendChart = ({ tasks }: { tasks: Task[] }) => {
  const data = useMemo(() => {
    const dates = tasks.map(t => t.createdAt.split('T')[0]).sort();
    if (dates.length === 0) return [];
    
    let currentTotal = 0;
    let currentCompleted = 0;
    
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const chartData = [];
    
    for (const task of sortedTasks) {
      const date = task.createdAt.split('T')[0];
      currentTotal += 1;
      if (task.status === 'COMPLETED') currentCompleted += 1;
      
      chartData.push({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Total: currentTotal,
        Completed: currentCompleted
      });
    }
    
    return chartData;
  }, [tasks]);

  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="font-semibold text-sm text-text-primary mb-2">Task Completion Trend</h3>
        <p className="text-xs text-text-muted">No historical data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <h3 className="font-semibold text-sm text-text-primary">Task Completion Trend</h3>
        <span className="text-[11px] text-text-muted font-medium">Cumulative progress</span>
      </div>

      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTrendCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11 }} 
              dy={6}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: 'none', backgroundColor: '#ffffff', padding: '6px 10px', fontSize: '11px' }}
            />
            <Area 
              type="monotone" 
              dataKey="Completed" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorTrendCompleted)" 
            />
            <Area 
              type="monotone" 
              dataKey="Total" 
              stroke="#64748b" 
              strokeDasharray="4 4"
              strokeWidth={1.5}
              fillOpacity={0} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

