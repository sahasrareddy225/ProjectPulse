import type { Project } from '../../data/projectsData';

export const ProjectMembers = ({ project }: { project: Project }) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-text-primary mb-4">Team Members ({project.membersCount})</h3>
      <div className="space-y-4">
        {project.members.map(member => (
          <div key={member.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex flex-shrink-0 items-center justify-center font-bold text-sm border border-primary/10">
              {member.initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-primary">{member.name}</span>
              <span className="text-xs font-medium text-text-secondary">{member.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
