import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Label, LabelColor } from '@/types/label'

// Module-level singleton, same pattern as useTasks/useAuth.
const labels = ref<Label[]>([])

async function fetchLabels() {
  const { data, error } = await supabase.from('labels').select('*').order('name')
  if (!error && data) {
    labels.value = data
  }
}

async function createLabel(name: string, color: LabelColor) {
  const trimmed = name.trim()
  if (!trimmed) return null

  const { data, error } = await supabase.from('labels').insert({ name: trimmed, color }).select().single()
  if (error || !data) return null

  labels.value.push(data)
  return data as Label
}

export function useLabels() {
  return { labels, fetchLabels, createLabel }
}
