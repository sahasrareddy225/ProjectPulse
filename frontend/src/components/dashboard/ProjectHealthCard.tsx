import { dashboardData } from '../../data/dashboardData';

export const ProjectHealthCard = () => {
  return (
    <div className="bg-surface rounded-lg border border-border flex flex-col overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold text-sm text-text-primary">Project Health</h3>
      </div>
      <div className="p-4 space-y-4 flex-1">
        {dashboardData.projects.map((project) => {
          const isHealthy = project.status === 'Healthy';
          return (
            <div key={project.id} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-xs text-text-primary truncate pr-2">{project.name}</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-text-muted w-8 text-right">
                  {project.progress}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

