<script setup lang="ts">
import type { Task } from '@/types/task'
import TaskCard from './TaskCard.vue'
import TaskCardSkeleton from './TaskCardSkeleton.vue'

defineProps<{
  label: string
  tasks: Task[]
  isLoading: boolean
}>()
</script>

<template>
  <section class="flex flex-col rounded-lg border border-border bg-muted/30 p-3">
    <header class="mb-3 flex items-center justify-between px-1">
      <h2 class="text-sm font-medium text-foreground">{{ label }}</h2>
      <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {{ tasks.length }}
      </span>
    </header>

    <div class="flex flex-col gap-2">
      <template v-if="isLoading">
        <TaskCardSkeleton v-for="n in 2" :key="n" />
      </template>
      <template v-else-if="tasks.length === 0">
        <p class="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
          No tasks yet
        </p>
      </template>
      <template v-else>
        <TaskCard v-for="task in tasks" :key="task.id" :task="task" />
      </template>
    </div>
  </section>
</template>
