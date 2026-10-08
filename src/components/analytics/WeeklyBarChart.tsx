export interface WeeklyValue {
  label: string
  completed: number
  created: number
}

export function WeeklyBarChart({ data }: { data: WeeklyValue[] }) {
  return <div className="bars">{data.map(week => <div className="bar-group" key={week.label}><span className="bar" style={{ height: `${week.completed}%` }}/><span className="bar alt" style={{ height: `${week.created}%` }}/><small className="bar-label">{week.label}</small></div>)}</div>
}