import { ref, computed } from 'vue'
import type { Task, TaskStatus } from '@/types/task'

// Fake fixture data for the static design pass (roadmap step 3). The shape
// mirrors exactly what Supabase will return, so step 5 swaps this out for
// real queries without touching any component that calls useTasks().
const tasks = ref<Task[]>([
  {
    id: 'mock-1',
    user_id: 'mock-user',
    title: 'Set up CI pipeline',
    description: 'Add a GitHub Actions workflow that lints and builds on every PR.',
    status: 'todo',
    priority: 'high',
    due_date: '2026-07-22',
    created_at: '2026-07-18T09:00:00Z',
  },
  {
    id: 'mock-2',
    user_id: 'mock-user',
    title: 'Write onboarding docs',
    description: null,
    status: 'todo',
    priority: 'normal',
    due_date: null,
    created_at: '2026-07-18T09:05:00Z',
  },
  {
    id: 'mock-3',
    user_id: 'mock-user',
    title: 'Refactor legacy auth module',
    description: null,
    status: 'todo',
    priority: 'low',
    due_date: '2026-09-01',
    created_at: '2026-07-18T09:10:00Z',
  },
  {
    id: 'mock-4',
    user_id: 'mock-user',
    title: 'Fix production login bug',
    description: 'Users are reporting intermittent 500s on /login since yesterday’s deploy.',
    status: 'in_progress',
    priority: 'high',
    due_date: '2026-07-18',
    created_at: '2026-07-17T14:00:00Z',
  },
  {
    id: 'mock-5',
    user_id: 'mock-user',
    title: 'Implement search filters',
    description: 'Filter tasks by priority, assignee, and label.',
    status: 'in_progress',
    priority: 'normal',
    due_date: '2026-07-23',
    created_at: '2026-07-19T11:00:00Z',
  },
  {
    id: 'mock-6',
    user_id: 'mock-user',
    title: 'Migrate database to Postgres 17',
    description: null,
    status: 'done',
    priority: 'normal',
    due_date: null,
    created_at: '2026-07-15T10:00:00Z',
  },
  {
    id: 'mock-7',
    user_id: 'mock-user',
    title: 'Update dependency versions',
    description: null,
    status: 'done',
    priority: 'low',
    due_date: null,
    created_at: '2026-07-16T10:00:00Z',
  },
])

const isLoading = ref(false)
const error = ref<string | null>(null)

export function useTasks() {
  function tasksByStatus(status: TaskStatus) {
    return computed(() => tasks.value.filter((task) => task.status === status)).value
  }

  return { tasks, isLoading, error, tasksByStatus }
}
