import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Task, TaskStatus } from '@/types/task'

// Module-level (singleton) state, same pattern as useAuth: one shared task
// list for the whole app, not per-component state.
const tasks = ref<Task[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

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

async function createTask(title: string) {
  const trimmed = title.trim()
  if (!trimmed) return

  // user_id and status default server-side (see supabase/migrations), so a
  // bare title insert is a complete, valid row.
  const { data, error: insertError } = await supabase.from('tasks').insert({ title: trimmed }).select().single()

  if (insertError) {
    error.value = 'Could not create task. Please try again.'
    return
  }

  tasks.value.push(data)
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

export function useTasks() {
  function tasksByStatus(status: TaskStatus) {
    return computed(() => tasks.value.filter((task) => task.status === status)).value
  }

  return { tasks, isLoading, error, tasksByStatus, fetchTasks, createTask, updateTaskStatus }
}
