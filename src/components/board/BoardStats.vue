<script setup lang="ts">
import { computed } from 'vue'
import { useTasks } from '@/composables/useTasks'

const { tasks } = useTasks()

const total = computed(() => tasks.value.length)
const completed = computed(() => tasks.value.filter((t) => t.status === 'done').length)

// Overdue means "should have been done by now" — a done task past its due
// date isn't a problem, so status is excluded once it reaches done.
const overdue = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return tasks.value.filter((t) => t.due_date && t.status !== 'done' && new Date(t.due_date) < today).length
})
</script>

<template>
  <div class="flex items-center gap-4 text-sm sm:gap-5">
    <div>
      <span class="font-semibold text-foreground">{{ total }}</span>
      <span class="ml-1 text-muted-foreground">total</span>
    </div>
    <div>
      <span class="font-semibold text-foreground">{{ completed }}</span>
      <span class="ml-1 text-muted-foreground">completed</span>
    </div>
    <div>
      <span class="font-semibold" :class="overdue > 0 ? 'text-destructive' : 'text-foreground'">{{ overdue }}</span>
      <span class="ml-1 text-muted-foreground">overdue</span>
    </div>
  </div>
</template>
