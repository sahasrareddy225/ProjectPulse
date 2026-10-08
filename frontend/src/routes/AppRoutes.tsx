import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Login } from '../pages/Login/Login';
import { Register } from '../pages/Register/Register';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Projects } from '../pages/Projects/Projects';
import { ProjectDetails } from '../pages/Projects/ProjectDetails';
import { Tasks } from '../pages/Tasks/Tasks';
import { TaskDetail } from '../pages/Tasks/TaskDetail';
import { Workflow } from '../pages/Workflow/Workflow';
import { Analytics } from '../pages/Analytics/Analytics';
import { AIAssistant } from '../pages/AIAssistant/AIAssistant';
import { initialTasks } from '../data/tasksData';
import type { Task } from '../types/task';

const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-surface border border-border rounded-lg p-8 h-full flex flex-col items-center justify-center">
    <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-3">{title}</h2>
    <p className="text-sm text-text-secondary">This page is currently under construction.</p>
  </div>
);

// Task state is lifted here so both /tasks and /tasks/:taskId share the same list.
// When the backend is integrated, replace this state with a React Query / SWR cache.
function TaskRoutes() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleTaskEdit = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Tasks
            // Tasks page manages its own local additions; global edits come from detail
            tasks={tasks}
            onTasksChange={setTasks}
          />
        }
      />
      <Route
        path="/:taskId"
        element={<TaskDetail tasks={tasks} onEdit={handleTaskEdit} />}
      />
    </Routes>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="tasks/*" element={<TaskRoutes />} />
        <Route path="workflow" element={<Workflow />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="settings" element={<Placeholder title="Settings" />} />
      </Route>
    </Routes>
  );
}
