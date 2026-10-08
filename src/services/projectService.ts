import type { Project } from '../types'

const projects: Project[] = [
  { id: 'PR-024', name: 'Website redesign', category: 'Product design', owner: 'Mia Chen', dueDate: 'Oct 18, 2026', progress: 78, status: 'On track', color: '' },
  { id: 'PR-031', name: 'Q4 marketing campaign', category: 'Marketing', owner: 'Jordan Lee', dueDate: 'Oct 24, 2026', progress: 52, status: 'At risk', color: 'orange' },
  { id: 'PR-019', name: 'Mobile app launch', category: 'Engineering', owner: 'Sam Rivera', dueDate: 'Nov 02, 2026', progress: 64, status: 'On track', color: 'green' },
  { id: 'PR-028', name: 'Customer research', category: 'Research', owner: 'Taylor Kim', dueDate: 'Nov 08, 2026', progress: 100, status: 'Completed', color: 'violet' },
  { id: 'PR-033', name: 'Brand refresh', category: 'Design', owner: 'Alex Morgan', dueDate: 'Nov 12, 2026', progress: 31, status: 'At risk', color: 'rose' },
]

export function getProjects(): Project[] {
  return projects
}