import { useState, useEffect } from 'react';
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
import { Notifications } from '../pages/Notifications/Notifications';
import { initialTasks } from '../data/tasksData';
import type { Task } from '../types/task';
import { useAuthStore } from '../store/authStore';

import { taskService } from '../services/taskService';

const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-surface border border-border rounded-lg p-8 h-full flex flex-col items-center justify-center">
    <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-3">{title}</h2>
    <p className="text-sm text-text-secondary">This page is currently under construction.</p>
  </div>
);

function TaskRoutes() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    taskService.getTasks()
      .then(data => {
        if (mounted) {
          setTasks(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          console.warn('[TaskRoutes] Could not fetch tasks:', err);
          setIsLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  const handleTaskCreate = async (data: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const created = await taskService.createTask(data);
      setTasks(prev => [created, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  };

  const handleTaskEdit = async (updated: Task) => {
    try {
      const saved = await taskService.updateTask(updated.id, updated);
      setTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      throw err;
    }
  };

  const handleTaskDelete = async (id: string) => {
    try {
      const ok = await taskService.deleteTask(id);
      if (ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      throw err;
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Tasks
            tasks={tasks}
            onTasksChange={setTasks}
            onCreateTask={handleTaskCreate}
            onDeleteTask={handleTaskDelete}
            isLoading={isLoading}
            error={error}
            onClearError={() => setError(null)}
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="tasks/*" element={<TaskRoutes />} />
        <Route path="workflow" element={<Workflow />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Placeholder title="Settings" />} />
      </Route>
    </Routes>
  );
}
