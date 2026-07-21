import type { Label } from './label'

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'normal' | 'high'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  created_at: string
  labels: Label[]
}

export const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'in_review', label: 'In Review' },
  { status: 'done', label: 'Done' },
]

// e.g. STATUS_LABELS.in_progress === 'In Progress' — used for activity log
// messages like "Moved To Do → In Progress".
export const STATUS_LABELS = Object.fromEntries(COLUMNS.map((c) => [c.status, c.label])) as Record<
  TaskStatus,
  string
>
