export type PageName = 'Dashboard' | 'Projects' | 'Project Overview' | 'New Project' | 'Project Review' | 'Team' | 'Tasks' | 'Task Details' | 'Admin Users' | 'Analytics' | 'Assistant'

export type ProjectStatus = 'On track' | 'At risk' | 'Completed'

export interface Project {
  id: string
  name: string
  category: string
  owner: string
  dueDate: string
  progress: number
  status: ProjectStatus
  color: string
}

export interface Task {
  id: string
  title: string
  project: string
  assignee: string
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
  done: boolean
}