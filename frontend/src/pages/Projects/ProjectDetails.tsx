import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, X } from 'lucide-react';
import { initialProjects } from '../../data/projectsData';
import type { Project } from '../../data/projectsData';
import { ProjectOverview } from '../../components/projects/ProjectOverview';
import { ProjectProgress } from '../../components/projects/ProjectProgress';
import { ProjectMembers } from '../../components/projects/ProjectMembers';
import { RecentProjectTasks } from '../../components/projects/RecentProjectTasks';
import { FormInput } from '../../components/common/FormInput';

export const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', startDate: '', dueDate: '' });

  useEffect(() => {
    const foundProject = initialProjects.find(p => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
      setFormData({
        name: foundProject.name,
        description: foundProject.description,
        startDate: foundProject.startDate,
        dueDate: foundProject.dueDate
      });
    } else {
      setProject(null);
    }
  }, [projectId]);

  const handleEditProject = (e: FormEvent) => {
    e.preventDefault();
    if (project) {
      setProject({
        ...project,
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        dueDate: formData.dueDate
      });
      setIsEditModalOpen(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
        <h2 className="text-lg font-semibold text-text-primary">Project not found</h2>
        <button 
          onClick={() => navigate('/projects')}
          className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Back link */}
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft size={14} />
        Back to Projects
      </Link>

      {/* Header section */}
      <div className="bg-surface p-4 rounded-lg border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">{project.name}</h1>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted px-1.5 py-0.5 rounded bg-neutral-100">
              {project.status}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-text-secondary font-medium">
              <span className={`w-2 h-2 rounded-full ${
                project.health === 'Healthy' ? 'bg-emerald-500' :
                project.health === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              {project.health}
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl leading-relaxed">
            {project.description}
          </p>
        </div>

        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-50 text-text-primary font-medium text-xs rounded-md hover:bg-neutral-100 transition-colors border border-border flex-shrink-0"
        >
          <Edit3 size={13} />
          Edit Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-4">
          <ProjectProgress project={project} />
          <RecentProjectTasks project={project} />
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-4">
          <ProjectOverview project={project} />
          <ProjectMembers project={project} />
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40">
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-md overflow-hidden border border-border">
            <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-neutral-50/50">
              <h2 className="text-sm font-semibold text-text-primary">Edit Project</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-text-muted hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleEditProject} className="p-4 space-y-3 text-xs">
              <FormInput
                label="Project Name"
                placeholder="Project Name"
                value={formData.name}
                onChange={e => updateForm('name', e.target.value)}
              />
              
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Description</label>
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={e => updateForm('description', e.target.value)}
                  className="px-3 py-2 border border-border rounded-md text-xs bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={e => updateForm('startDate', e.target.value)}
                />
                <FormInput
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={e => updateForm('dueDate', e.target.value)}
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

