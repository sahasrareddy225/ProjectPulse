import type { Project } from '../../data/projectsData';

export const ProjectProgress = ({ project }: { project: Project }) => {
  const { taskSummary } = project;

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-text-primary">Overall Progress</h3>
        <span className="text-2xl font-bold text-text-primary tracking-tight">{project.progress}%</span>
      </div>
      
      <div className="h-3 w-full bg-background rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500" 
          style={{ width: `${project.progress}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <span className="block text-xs font-medium text-text-secondary mb-1">Total Tasks</span>
          <span className="text-lg font-bold text-text-primary">{taskSummary.total}</span>
        </div>
        <div className="text-center">
          <span className="block text-xs font-medium text-text-secondary mb-1">Completed</span>
          <span className="text-lg font-bold text-success">{taskSummary.completed}</span>
        </div>
        <div className="text-center">
          <span className="block text-xs font-medium text-text-secondary mb-1">In Progress</span>
          <span className="text-lg font-bold text-primary">{taskSummary.inProgress}</span>
        </div>
        <div className="text-center">
          <span className="block text-xs font-medium text-text-secondary mb-1">Overdue</span>
          <span className="text-lg font-bold text-warning">{taskSummary.overdue}</span>
        </div>
      </div>
    </div>
  );
};
