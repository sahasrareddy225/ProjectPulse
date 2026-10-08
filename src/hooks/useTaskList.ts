import { useState } from 'react'
import type { Task } from '../types'

export function useTaskList(initialTasks: Task[]) {
  const [tasks, setTasks] = useState(initialTasks)
  const toggleTask = (id: string) => setTasks(current => current.map(task => task.id === id ? { ...task, done: !task.done } : task))
  return { tasks, toggleTask }
}