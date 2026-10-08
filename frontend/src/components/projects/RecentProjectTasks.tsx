import type { Project } from '../../data/projectsData';
import { Calendar, User } from 'lucide-react';

export const RecentProjectTasks = ({ project }: { project: Project }) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-success-light text-success border-success/20';
      case 'In Progress': return 'bg-primary-light text-primary border-primary/20';
      case 'Review': return 'bg-info-light text-info border-info/20';
      default: return 'bg-gray-100 text-text-secondary border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Urgent':
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-warning';
      default: return 'text-info';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-background/30">
        <h3 className="text-lg font-bold text-text-primary">Recent Tasks</h3>
        <button className="text-xs font-bold text-primary hover:text-primary-light transition-colors">View All</button>
      </div>
      <div className="divide-y divide-border">
        {project.recentTasks.map(task => (
          <div key={task.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-background/50 transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-primary mb-1">{task.title}</span>
              <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-text-muted" /> {task.assignee}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-text-muted" /> {task.dueDate}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getPriorityColor(task.priority)} bg-background border border-border`}>
                {task.priority}
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md w-24 text-center border ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
