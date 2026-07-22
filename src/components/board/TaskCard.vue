<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types/task'
import { labelColorStyles } from '@/types/label'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ select: [task: Task] }>()

const priorityStyles: Record<Task['priority'], string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-secondary text-secondary-foreground',
  high: 'bg-destructive/10 text-destructive',
}

// Due-date urgency is a semantic status color (red/amber), layered on top of
// the neutral+accent base — not part of the one-accent rule, same as Linear/
// Asana use red for overdue regardless of their brand color.
const dueDateInfo = computed(() => {
  if (!props.task.due_date) return null

  const due = new Date(props.task.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  const label = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  if (diffDays < 0) return { label, tone: 'overdue' as const }
  if (diffDays <= 2) return { label, tone: 'soon' as const }
  return { label, tone: 'normal' as const }
})

const dueDateStyles = {
  overdue: 'bg-destructive/10 text-destructive',
  soon: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  normal: 'bg-muted text-muted-foreground',
}

// vuedraggable/SortableJS's drag handling can swallow the native `click`
// event even for a plain click with no movement, so "was this a click or a
// drag" is detected manually here by comparing pointerdown/pointerup
// position, instead of relying on `click`.
let pointerDownAt: { x: number; y: number } | null = null

function handlePointerDown(event: PointerEvent) {
  pointerDownAt = { x: event.clientX, y: event.clientY }
}

function handlePointerUp(event: PointerEvent) {
  if (!pointerDownAt) return
  const movedX = Math.abs(event.clientX - pointerDownAt.x)
  const movedY = Math.abs(event.clientY - pointerDownAt.y)
  pointerDownAt = null
  if (movedX < 5 && movedY < 5) {
    emit('select', props.task)
  }
}
</script>

<template>
  <article
    class="select-none rounded-md border border-border bg-card p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:cursor-grabbing"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
  >
    <div v-if="task.labels.length > 0" class="mb-1.5 flex flex-wrap items-center gap-1">
      <span
        v-for="l in task.labels"
        :key="l.id"
        :class="['rounded px-1.5 py-0.5 text-[10px] font-medium', labelColorStyles[l.color]]"
      >
        {{ l.name }}
      </span>
    </div>
    <h3 class="text-sm font-medium leading-snug text-card-foreground">{{ task.title }}</h3>
    <p v-if="task.description" class="mt-1 line-clamp-2 text-xs text-muted-foreground">
      {{ task.description }}
    </p>
    <div class="mt-3 flex items-center gap-1.5">
      <span :class="['rounded px-1.5 py-0.5 text-[10px] font-medium capitalize', priorityStyles[task.priority]]">
        {{ task.priority }}
      </span>
      <span
        v-if="dueDateInfo"
        :class="['rounded px-1.5 py-0.5 text-[10px] font-medium', dueDateStyles[dueDateInfo.tone]]"
      >
        {{ dueDateInfo.label }}
      </span>
    </div>
  </article>
</template>
