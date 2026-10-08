import { calculateWorkload } from '../../utils/analytics';
import type { Task } from '../../types/task';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const WorkloadAnalysis = ({ tasks }: { tasks: Task[] }) => {
  const workload = calculateWorkload(tasks);

  const data = workload.map(w => ({
    name: w.name.split(' ')[0],
    Completed: w.completed,
    'In Progress': w.inProgress,
    Overdue: w.overdue,
    'To Do': w.assigned - w.completed - w.inProgress - w.overdue,
  }));

  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="font-semibold text-sm text-text-primary mb-2">Team Workload</h3>
        <p className="text-xs text-text-muted">No workload data available for this scope.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex flex-col min-h-[300px]">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <h3 className="font-semibold text-sm text-text-primary">Team Workload</h3>
        <span className="text-xs text-text-muted">{workload.length} team members</span>
      </div>

      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              width={70}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: 'none', backgroundColor: '#ffffff', padding: '6px 10px', fontSize: '11px' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="Completed" stackId="a" fill="#10b981" barSize={16} />
            <Bar dataKey="In Progress" stackId="a" fill="#4f46e5" />
            <Bar dataKey="To Do" stackId="a" fill="#e2e8f0" />
            <Bar dataKey="Overdue" stackId="a" fill="#f59e0b" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

