<script setup lang="ts">
import { ref } from 'vue'
import { X } from '@lucide/vue'
import { COLUMNS } from '@/types/task'
import type { Task, TaskStatus } from '@/types/task'
import { useTasks } from '@/composables/useTasks'
import BoardColumn from './BoardColumn.vue'
import LabelFilter from './LabelFilter.vue'
import TaskDetailPanel from '@/components/task/TaskDetailPanel.vue'

const { tasksByStatus, isLoading, error } = useTasks()

const selectedTask = ref<Task | null>(null)
const selectedLabelIds = ref<string[]>([])

function filteredTasks(status: TaskStatus) {
  const tasks = tasksByStatus(status)
  if (selectedLabelIds.value.length === 0) return tasks
  return tasks.filter((task) => task.labels.some((label) => selectedLabelIds.value.includes(label.id)))
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

    <div class="mb-4 flex justify-end">
      <LabelFilter v-model:selected="selectedLabelIds" />
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
