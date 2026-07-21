import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'

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
    .select('*')
    .order('created_at', { ascending: true })

  if (fetchError) {
    error.value = 'Could not load tasks. Please refresh the page.'
  } else {
    tasks.value = data ?? []
  }

  isLoading.value = false
}

async function createTask(fields: TaskFields) {
  const title = fields.title.trim()
  if (!title) return

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
    return
  }

  tasks.value.push(data)
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
  }
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
  }
}
