import type { ProjectStatus as Status } from '../../types'

export function ProjectStatus({ status }: { status: Status }) {
  const className = status === 'At risk' ? 'risk' : status === 'Completed' ? 'complete' : ''
  return <span className={`status-pill ${className}`}>{status}</span>
}