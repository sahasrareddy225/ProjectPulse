import { getInitials } from '../../utils/format'

export function Avatar({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`avatar ${className}`}>{getInitials(name)}</span>
}