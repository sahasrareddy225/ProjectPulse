import type { Task } from '../../types/task';
import { initialProjects } from '../../data/projectsData';
import { calculateCompletionMetrics, calculateProjectHealth, calculateOverdueMetrics } from '../../utils/analytics';
import { useNavigate } from 'react-router-dom';

export const ProjectComparison = ({ allTasks }: { allTasks: Task[] }) => {
  const navigate = useNavigate();

  const comparisonData = initialProjects.map(project => {
    const projectTasks = allTasks.filter(t => t.projectId === project.id);
    const completion = calculateCompletionMetrics(projectTasks);
    const health = calculateProjectHealth(projectTasks);
    const overdue = calculateOverdueMetrics(projectTasks);
    
    return {
      id: project.id,
      name: project.name,
      completionRate: completion.completionRate,
      healthStatus: health.status,
      overdueTasks: overdue.totalOverdue,
      blockedTasks: completion.blocked,
      totalTasks: projectTasks.length,
    };
  });

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-neutral-50/50">
        <div>
          <h3 className="font-semibold text-sm text-text-primary">Project Comparison</h3>
          <p className="text-xs text-text-muted">Multi-project performance metrics</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-neutral-50/30 text-text-muted font-semibold">
              <th className="py-2.5 px-4">Project</th>
              <th className="py-2.5 px-4">Health</th>
              <th className="py-2.5 px-4">Completion</th>
              <th className="py-2.5 px-4 text-right">Overdue</th>
              <th className="py-2.5 px-4 text-right">Blocked</th>
              <th className="py-2.5 px-4 text-right">Total Tasks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {comparisonData.map(proj => (
              <tr 
                key={proj.id} 
                onClick={() => navigate(`/projects/${proj.id}`)}
                className="hover:bg-neutral-50/60 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 font-semibold text-text-primary">
                  {proj.name}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      proj.healthStatus === 'Healthy' ? 'bg-emerald-500' :
                      proj.healthStatus === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    {proj.healthStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${proj.completionRate}%` }} />
                    </div>
                    <span className="font-mono text-text-secondary">{proj.completionRate}%</span>
                  </div>
                </td>
                <td className={`py-3 px-4 text-right font-mono font-medium ${proj.overdueTasks > 0 ? 'text-amber-600' : 'text-text-muted'}`}>
                  {proj.overdueTasks}
                </td>
                <td className={`py-3 px-4 text-right font-mono font-medium ${proj.blockedTasks > 0 ? 'text-rose-600' : 'text-text-muted'}`}>
                  {proj.blockedTasks}
                </td>
                <td className="py-3 px-4 text-right font-mono text-text-secondary">
                  {proj.totalTasks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

