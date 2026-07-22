import { Flame, Equal, ArrowDown } from '@lucide/vue'
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

// Priority is a semantic status indicator like due-date urgency — not part of
// the one-accent rule (see TaskCard's due-date comment). "High" is
// deliberately loud (solid fill, not a wash) so it actually reads as urgent
// at a glance instead of blending in with every other muted badge on a card.
export const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  high: 'bg-destructive text-white font-semibold',
}

export const priorityIcons: Record<TaskPriority, typeof Flame> = {
  low: ArrowDown,
  normal: Equal,
  high: Flame,
}
