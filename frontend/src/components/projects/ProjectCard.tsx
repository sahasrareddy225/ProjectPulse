import { Users, CheckSquare, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../data/projectsData';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

  const getHealthDot = (health: string) => {
    switch (health) {
      case 'Healthy': return 'bg-emerald-500';
      case 'At Risk': return 'bg-amber-500';
      case 'Critical': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div 
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group bg-surface rounded-lg border border-border p-4 hover:border-neutral-400 transition-colors cursor-pointer flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${getHealthDot(project.health)}`} />
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
              {project.name}
            </h3>
          </div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted px-1.5 py-0.5 rounded bg-neutral-100">
            {project.status}
          </span>
        </div>
        
        <p className="text-xs text-text-secondary line-clamp-2 mb-4">
          {project.description}
        </p>
      </div>

      <div className="space-y-3 pt-3 border-t border-border">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[11px] text-text-muted">Progress</span>
            <span className="font-mono font-semibold text-text-primary text-[11px]">{project.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-1">
              <Users size={12} /> {project.membersCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckSquare size={12} /> {project.tasksCount}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 font-mono">
            <Calendar size={12} /> {project.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
};

