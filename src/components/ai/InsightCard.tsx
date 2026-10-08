import type { ReactNode } from 'react'

export function InsightCard({ label, title, children, icon, tone = 'positive' }: { label: string; title: string; children: ReactNode; icon: ReactNode; tone?: 'positive' | 'warning' | 'neutral' }) {
  return <div className={`insight-card ${tone}`}><span className="insight-label">{icon}{label}</span><strong>{title}</strong><p>{children}</p></div>
}