<script setup lang="ts">
import { ref } from 'vue'
import { X, Search } from '@lucide/vue'
import { COLUMNS } from '@/types/task'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'
import { useTasks } from '@/composables/useTasks'
import { Input } from '@/components/ui/input'
import BoardColumn from './BoardColumn.vue'
import LabelFilter from './LabelFilter.vue'
import PriorityFilter from './PriorityFilter.vue'
import BoardStats from './BoardStats.vue'
import TaskDetailPanel from '@/components/task/TaskDetailPanel.vue'

const { tasksByStatus, isLoading, error } = useTasks()

const selectedTask = ref<Task | null>(null)
const selectedLabelIds = ref<string[]>([])
const selectedPriorities = ref<TaskPriority[]>([])
const searchQuery = ref('')

function filteredTasks(status: TaskStatus) {
  let tasks = tasksByStatus(status)

  if (selectedLabelIds.value.length > 0) {
    tasks = tasks.filter((task) => task.labels.some((label) => selectedLabelIds.value.includes(label.id)))
  }

  if (selectedPriorities.value.length > 0) {
    tasks = tasks.filter((task) => selectedPriorities.value.includes(task.priority))
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    tasks = tasks.filter((task) => task.title.toLowerCase().includes(query))
  }

  return tasks
}
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <div
      v-if="error"
      class="mb-4 flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <span>{{ error }}</span>
      <button
        type="button"
        class="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
        @click="error = null"
      >
        <X class="size-4" />
      </button>
    </div>

    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <BoardStats />

      <div class="flex items-center gap-2">
        <div class="relative">
          <Search class="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Search tasks" class="h-8 w-44 pl-8 text-sm" />
        </div>
        <PriorityFilter v-model:selected="selectedPriorities" />
        <LabelFilter v-model:selected="selectedLabelIds" />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <BoardColumn
        v-for="column in COLUMNS"
        :key="column.status"
        :label="column.label"
        :status="column.status"
        :tasks="filteredTasks(column.status)"
        :is-loading="isLoading"
        @select-task="selectedTask = $event"
      />
    </div>

    <TaskDetailPanel
      :task="selectedTask"
      :open="selectedTask !== null"
      @update:open="(v) => { if (!v) selectedTask = null }"
    />
  </main>
</template>
