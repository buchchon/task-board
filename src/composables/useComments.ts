import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface Comment {
  id: string
  task_id: string
  user_id: string
  body: string
  created_at: string
}

// Module-level singleton holding the comment thread for whichever task is
// currently open in the detail panel — same pattern as useTaskActivity.
const comments = ref<Comment[]>([])
const isLoading = ref(false)

let currentTaskId: string | null = null

async function fetchComments(taskId: string) {
  currentTaskId = taskId
  isLoading.value = true
  comments.value = []

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (!error && data && currentTaskId === taskId) {
    comments.value = data
  }
  if (currentTaskId === taskId) {
    isLoading.value = false
  }
}

async function addComment(taskId: string, body: string) {
  const trimmed = body.trim()
  if (!trimmed) return

  const { data, error } = await supabase.from('comments').insert({ task_id: taskId, body: trimmed }).select().single()

  if (!error && data && currentTaskId === taskId) {
    comments.value.push(data)
  }
}

export function useComments() {
  return { comments, isLoading, fetchComments, addComment }
}
