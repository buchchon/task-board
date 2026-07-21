<script setup lang="ts">
import { ref } from 'vue'
import { COLUMNS } from '@/types/task'
import type { Task } from '@/types/task'
import { useTasks } from '@/composables/useTasks'
import BoardColumn from './BoardColumn.vue'
import TaskDetailPanel from '@/components/task/TaskDetailPanel.vue'

const { tasksByStatus, isLoading, error } = useTasks()

const selectedTask = ref<Task | null>(null)
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <div
      v-if="error"
      class="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ error }}
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <BoardColumn
        v-for="column in COLUMNS"
        :key="column.status"
        :label="column.label"
        :status="column.status"
        :tasks="tasksByStatus(column.status)"
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
