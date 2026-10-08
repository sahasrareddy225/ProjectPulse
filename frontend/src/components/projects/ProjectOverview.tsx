import { Calendar, User } from 'lucide-react';
import type { Project } from '../../data/projectsData';

export const ProjectOverview = ({ project }: { project: Project }) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-text-primary mb-4">Overview</h3>
      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
        <div>
          <span className="block text-xs font-medium text-text-secondary mb-1">Start Date</span>
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Calendar size={16} className="text-text-muted" />
            {project.startDate}
          </div>
        </div>
        <div>
          <span className="block text-xs font-medium text-text-secondary mb-1">Due Date</span>
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Calendar size={16} className="text-text-muted" />
            {project.dueDate}
          </div>
        </div>
        <div>
          <span className="block text-xs font-medium text-text-secondary mb-1">Project Owner</span>
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <User size={16} className="text-text-muted" />
            {project.owner}
          </div>
        </div>
        <div>
          <span className="block text-xs font-medium text-text-secondary mb-1">Team Members</span>
          <div className="text-sm font-semibold text-text-primary pl-1">
            {project.membersCount}
          </div>
        </div>
        <div>
          <span className="block text-xs font-medium text-text-secondary mb-1">Total Tasks</span>
          <div className="text-sm font-semibold text-text-primary pl-1">
            {project.tasksCount}
          </div>
        </div>
        <div>
          <span className="block text-xs font-medium text-text-secondary mb-1">Completed Tasks</span>
          <div className="text-sm font-semibold text-success pl-1">
            {project.taskSummary.completed}
          </div>
        </div>
      </div>
    </div>
  );
};
