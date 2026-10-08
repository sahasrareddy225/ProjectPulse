export type ProjectStatus = 'Active' | 'Completed' | 'On Hold';
export type ProjectHealth = 'Healthy' | 'At Risk' | 'Critical';
export type TaskStatus = 'Todo' | 'In Progress' | 'Completed' | 'Review';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
}

export interface ProjectTaskSummary {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  health: ProjectHealth;
  progress: number;
  membersCount: number;
  tasksCount: number;
  startDate: string;
  dueDate: string;
  owner: string;
  members: ProjectMember[];
  taskSummary: ProjectTaskSummary;
  recentTasks: ProjectTask[];
}

export const initialProjects: Project[] = [
  {
    id: 'projectpulse',
    name: 'ProjectPulse',
    description: 'Enterprise project intelligence platform',
    status: 'Active',
    health: 'Healthy',
    progress: 72,
    membersCount: 5,
    tasksCount: 24,
    startDate: 'Sep 01, 2026',
    dueDate: 'Dec 15, 2026',
    owner: 'Bhavya Gutta',
    members: [
      { id: '1', name: 'Bhavya Gutta', role: 'Frontend Lead', initials: 'BG' },
      { id: '2', name: 'Sahasra Reddy', role: 'Backend Lead', initials: 'SR' },
      { id: '3', name: 'Rakshitha Momula', role: 'Analytics & Intelligence', initials: 'RM' },
    ],
    taskSummary: {
      total: 24,
      completed: 17,
      inProgress: 5,
      overdue: 2
    },
    recentTasks: [
      { id: 't1', title: 'Authentication UI', status: 'Completed', priority: 'High', assignee: 'Bhavya Gutta', dueDate: 'Oct 10, 2026' },
      { id: 't2', title: 'Dashboard API Contract', status: 'In Progress', priority: 'High', assignee: 'Sahasra Reddy', dueDate: 'Oct 12, 2026' },
      { id: 't3', title: 'Analytics Wireframe', status: 'Todo', priority: 'Medium', assignee: 'Rakshitha Momula', dueDate: 'Oct 15, 2026' },
    ]
  },
  {
    id: 'alga-asset-care',
    name: 'Alga Asset Care',
    description: 'Asset management platform',
    status: 'On Hold',
    health: 'At Risk',
    progress: 61,
    membersCount: 6,
    tasksCount: 31,
    startDate: 'Aug 15, 2026',
    dueDate: 'Nov 28, 2026',
    owner: 'Alex Johnson',
    members: [
      { id: '4', name: 'Alex Johnson', role: 'Project Manager', initials: 'AJ' },
      { id: '5', name: 'Sam Lee', role: 'Developer', initials: 'SL' }
    ],
    taskSummary: {
      total: 31,
      completed: 19,
      inProgress: 12,
      overdue: 5
    },
    recentTasks: [
      { id: 't4', title: 'Asset Tracking Schema', status: 'In Progress', priority: 'High', assignee: 'Sam Lee', dueDate: 'Oct 05, 2026' },
    ]
  },
  {
    id: 'smart-foodsaver',
    name: 'Smart FoodSaver',
    description: 'Food spoilage detection platform',
    status: 'Active',
    health: 'Healthy',
    progress: 84,
    membersCount: 4,
    tasksCount: 18,
    startDate: 'Sep 10, 2026',
    dueDate: 'Nov 10, 2026',
    owner: 'Taylor Swift',
    members: [
      { id: '6', name: 'Taylor Swift', role: 'Product Owner', initials: 'TS' }
    ],
    taskSummary: {
      total: 18,
      completed: 15,
      inProgress: 3,
      overdue: 0
    },
    recentTasks: [
      { id: 't5', title: 'Sensor Integration', status: 'In Progress', priority: 'High', assignee: 'Taylor Swift', dueDate: 'Oct 20, 2026' },
    ]
  }
];
