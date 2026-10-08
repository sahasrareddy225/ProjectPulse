import { useState } from 'react'
import { ArrowUp, Bot, CheckCircle2, CircleAlert, Sparkles, X } from 'lucide-react'
import { InsightCard } from '../../components/ai/InsightCard'

const suggestions = ['Summarize this week’s progress', 'What needs my attention?', 'Draft a project update']

export function AssistantPage() {
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const ask = (question: string) => {
    setPrompt(question)
    setAnswer('Your team completed 64 tasks this week, up 12.5% from last week. The Website redesign is on track at 78%. The Q4 marketing campaign may need a timeline check: two deliverables are currently at risk.')
  }
  return <div className="assistant-layout"><section className="panel assistant-chat"><div className="assistant-welcome"><div className="assistant-orb"><Sparkles size={22}/></div><h2>Good morning, Alex</h2><p>I’ve been keeping an eye on your projects. What can I help with?</p><div className="prompt-chips">{suggestions.map(suggestion => <button className="prompt-chip" key={suggestion} onClick={() => ask(suggestion)}>{suggestion}</button>)}</div></div>{answer && <div className="chat-exchange"><div className="chat-question"><span className="avatar avatar-small">AM</span><span>{prompt}</span></div><div className="chat-answer"><span className="assistant-orb mini"><Sparkles size={13}/></span><p>{answer}</p></div></div>}<div className="chat-spacer"/><form className="chat-composer" onSubmit={event => { event.preventDefault(); if (prompt.trim()) ask(prompt.trim()) }}><input aria-label="Ask the assistant" placeholder="Ask about your projects, tasks, or team..." value={prompt} onChange={event => setPrompt(event.target.value)}/>{answer && <button className="icon-button" type="button" aria-label="Clear conversation" onClick={() => setAnswer('')}><X size={14}/></button>}<button className="chat-send" type="submit" aria-label="Send message"><ArrowUp size={16}/></button></form></section><aside className="panel assistant-side"><h3>Workspace insights</h3><InsightCard icon={<CheckCircle2 size={12}/>} label="ON TRACK" title="Website redesign is moving well">Design review is complete, with the project 6% ahead of its planned pace.</InsightCard><InsightCard icon={<CircleAlert size={12}/>} label="NEEDS A LOOK" title="Q4 campaign dates may shift" tone="warning">Two tasks depend on copy approval. A quick check-in could keep the launch on schedule.</InsightCard><InsightCard icon={<Bot size={12}/>} label="SUGGESTION" title="Protect a focus block" tone="neutral">You have three review tasks due today. A 45-minute focus block may help clear them.</InsightCard></aside></div>
}