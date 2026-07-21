import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface TaskActivity {
  id: string
  task_id: string
  user_id: string
  type: string
  detail: string
  created_at: string
}

// Module-level singleton holding the activity feed for whichever task is
// currently open in the detail panel (not a full cache of every task's log).
const activity = ref<TaskActivity[]>([])
const isLoading = ref(false)

// Guards against a slow fetch for a previously-open task resolving after the
// panel has already switched to (or closed) a different task.
let currentTaskId: string | null = null

async function fetchActivity(taskId: string) {
  currentTaskId = taskId
  isLoading.value = true
  activity.value = []

  const { data, error } = await supabase
    .from('task_activity')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (!error && data && currentTaskId === taskId) {
    activity.value = data
  }
  if (currentTaskId === taskId) {
    isLoading.value = false
  }
}

async function logActivity(taskId: string, type: string, detail: string) {
  // user_id defaults to auth.uid() server-side (see supabase/migrations),
  // same as tasks and labels.
  const { data, error } = await supabase.from('task_activity').insert({ task_id: taskId, type, detail }).select().single()

  if (!error && data && currentTaskId === taskId) {
    activity.value.unshift(data)
  }
}

export function useTaskActivity() {
  return { activity, isLoading, fetchActivity, logActivity }
}
