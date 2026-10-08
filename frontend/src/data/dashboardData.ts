export const dashboardData = {
  stats: {
    activeProjects: 12,
    totalTasks: 148,
    completedTasks: 84,
    overdueTasks: 6
  },
  projects: [
    { id: '1', name: 'ProjectPulse', status: 'Healthy', progress: 78 },
    { id: '2', name: 'Alga Asset Care', status: 'At Risk', progress: 61 },
    { id: '3', name: 'Smart FoodSaver', status: 'Healthy', progress: 86 }
  ],
  activities: [
    { id: '1', description: 'Task "API Integration" was completed', time: '2 hours ago', user: 'JD' },
    { id: '2', description: 'New project member added to ProjectPulse', time: '4 hours ago', user: 'SM' },
    { id: '3', description: 'Sprint deadline updated', time: 'Yesterday', user: 'JD' },
    { id: '4', description: 'Task assigned to a team member', time: 'Yesterday', user: 'RK' },
    { id: '5', description: 'Project status changed to At Risk', time: '2 days ago', user: 'Sys' }
  ],
  notifications: [
    { id: '1', message: 'Task deadline approaching', time: '1 hour ago', type: 'warning' },
    { id: '2', message: 'Project health changed', time: '3 hours ago', type: 'info' },
    { id: '3', message: 'New task assigned', time: '5 hours ago', type: 'success' },
    { id: '4', message: 'Team member joined project', time: '1 day ago', type: 'info' }
  ],
  chartData: [
    { name: 'Mon', completed: 12 },
    { name: 'Tue', completed: 19 },
    { name: 'Wed', completed: 15 },
    { name: 'Thu', completed: 22 },
    { name: 'Fri', completed: 16 }
  ]
};
