import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'
import { STATUS_LABELS } from '@/types/task'
import type { Label } from '@/types/label'
import { useTaskActivity } from './useTaskActivity'

const { logActivity } = useTaskActivity()

// Module-level (singleton) state, same pattern as useAuth: one shared task
// list for the whole app, not per-component state.
const tasks = ref<Task[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export interface TaskFields {
  title: string
  description?: string | null
  priority?: TaskPriority
  due_date?: string | null
}

async function fetchTasks() {
  isLoading.value = true
  error.value = null

  const { data, error: fetchError } = await supabase
    .from('tasks')
    .select('*, task_labels(labels(*))')
    .order('created_at', { ascending: true })

  if (fetchError) {
    error.value = 'Could not load tasks. Please refresh the page.'
  } else {
    // Flatten the join (tasks -> task_labels -> labels) into a plain labels
    // array on each task; nothing downstream needs the join shape itself.
    tasks.value = (data ?? []).map(({ task_labels, ...task }) => ({
      ...task,
      labels: (task_labels ?? []).map((tl: { labels: Label }) => tl.labels),
    }))
  }

  isLoading.value = false
}

async function createTask(fields: TaskFields) {
  const title = fields.title.trim()
  if (!title) return null

  // user_id and status default server-side (see supabase/migrations).
  const { data, error: insertError } = await supabase
    .from('tasks')
    .insert({
      title,
      description: fields.description || null,
      priority: fields.priority ?? 'normal',
      due_date: fields.due_date || null,
    })
    .select()
    .single()

  if (insertError) {
    error.value = 'Could not create task. Please try again.'
    return null
  }

  const task: Task = { ...data, labels: [] }
  tasks.value.push(task)
  await logActivity(data.id, 'created', 'Created task')
  return task
}

async function updateTask(taskId: string, fields: TaskFields) {
  const task = tasks.value.find((t) => t.id === taskId)
  if (!task) return

  const previous = { ...task }
  const patch = {
    title: fields.title.trim(),
    description: fields.description || null,
    priority: fields.priority ?? 'normal',
    due_date: fields.due_date || null,
  }
  Object.assign(task, patch)

  const { error: updateError } = await supabase.from('tasks').update(patch).eq('id', taskId)

  if (updateError) {
    Object.assign(task, previous)
    error.value = 'Could not update task. Please try again.'
    return
  }

  // One activity line per field that actually changed, not a generic "edited".
  if (previous.title !== patch.title) {
    await logActivity(taskId, 'edited', `Renamed to "${patch.title}"`)
  }
  if (previous.description !== patch.description) {
    await logActivity(taskId, 'edited', 'Updated description')
  }
  if (previous.priority !== patch.priority) {
    const label = patch.priority.charAt(0).toUpperCase() + patch.priority.slice(1)
    await logActivity(taskId, 'edited', `Changed priority to ${label}`)
  }
  if (previous.due_date !== patch.due_date) {
    await logActivity(taskId, 'edited', patch.due_date ? `Set due date to ${patch.due_date}` : 'Cleared due date')
  }
}

async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const task = tasks.value.find((t) => t.id === taskId)
  if (!task || task.status === status) return

  // Optimistic update so the drag feels instant; rolled back if the write fails.
  const previousStatus = task.status
  task.status = status

  const { error: updateError } = await supabase.from('tasks').update({ status }).eq('id', taskId)

  if (updateError) {
    task.status = previousStatus
    error.value = 'Could not move task. Please try again.'
    return
  }

  await logActivity(taskId, 'status_change', `Moved ${STATUS_LABELS[previousStatus]} → ${STATUS_LABELS[status]}`)
}

async function deleteTask(taskId: string) {
  const removed = tasks.value.find((t) => t.id === taskId)
  if (!removed) return

  const index = tasks.value.indexOf(removed)
  tasks.value.splice(index, 1)

  const { error: deleteError } = await supabase.from('tasks').delete().eq('id', taskId)

  if (deleteError) {
    tasks.value.splice(index, 0, removed)
    error.value = 'Could not delete task. Please try again.'
  }
}

async function toggleTaskLabel(taskId: string, label: Label, attach: boolean) {
  const task = tasks.value.find((t) => t.id === taskId)
  if (!task) return

  if (attach) {
    if (task.labels.some((l) => l.id === label.id)) return
    task.labels.push(label)

    const { error: insertError } = await supabase.from('task_labels').insert({ task_id: taskId, label_id: label.id })

    if (insertError) {
      task.labels = task.labels.filter((l) => l.id !== label.id)
      error.value = 'Could not add label. Please try again.'
      return
    }

    await logActivity(taskId, 'label_added', `Added label "${label.name}"`)
  } else {
    const index = task.labels.findIndex((l) => l.id === label.id)
    if (index === -1) return
    task.labels.splice(index, 1)

    const { error: deleteError } = await supabase
      .from('task_labels')
      .delete()
      .eq('task_id', taskId)
      .eq('label_id', label.id)

    if (deleteError) {
      task.labels.splice(index, 0, label)
      error.value = 'Could not remove label. Please try again.'
      return
    }

    await logActivity(taskId, 'label_removed', `Removed label "${label.name}"`)
  }
}

// Reconciles a task's label set with a desired one — used by both the quick
// toggle in the detail panel and the create/edit form's pending selection,
// so the added/removed diffing logic isn't duplicated in either caller.
async function syncTaskLabels(taskId: string, current: Label[], next: Label[]) {
  const added = next.filter((l) => !current.some((c) => c.id === l.id))
  const removed = current.filter((c) => !next.some((l) => l.id === c.id))
  await Promise.all([
    ...added.map((l) => toggleTaskLabel(taskId, l, true)),
    ...removed.map((l) => toggleTaskLabel(taskId, l, false)),
  ])
}

export function useTasks() {
  function tasksByStatus(status: TaskStatus) {
    return computed(() => tasks.value.filter((task) => task.status === status)).value
  }

  return {
    tasks,
    isLoading,
    error,
    tasksByStatus,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    toggleTaskLabel,
    syncTaskLabels,
  }
}
