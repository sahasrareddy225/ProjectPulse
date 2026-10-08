import { Circle } from 'lucide-react'
import type { Task } from '../../types'

export function PriorityTag({ priority }: { priority: Task['priority'] }) {
  return <span className={`priority-label ${priority.toLowerCase()}`}><Circle size={7} fill="currentColor"/>{priority}</span>
}