export const pageNames = ['Dashboard', 'Projects', 'Project Overview', 'New Project', 'Project Review', 'Team', 'Tasks', 'Task Details', 'Admin Users', 'Analytics', 'Assistant'] as const

export type RoutePage = (typeof pageNames)[number]