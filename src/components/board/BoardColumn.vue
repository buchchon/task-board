<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import type { Task, TaskStatus } from '@/types/task'
import { useTasks } from '@/composables/useTasks'
import TaskCard from './TaskCard.vue'
import TaskCardSkeleton from './TaskCardSkeleton.vue'

const props = defineProps<{
  label: string
  status: TaskStatus
  tasks: Task[]
  isLoading: boolean
}>()

const emit = defineEmits<{ 'select-task': [task: Task] }>()

const { updateTaskStatus } = useTasks()

// vuedraggable needs a writable array to bind v-model to (the `tasks` prop
// is a filtered computed, not writable). This local copy is kept in sync
// with the shared task list below; vuedraggable mutates it directly during
// a drag for instant visual feedback, ahead of the actual persistence.
const items = ref<Task[]>([...props.tasks])

watch(
  () => props.tasks,
  (next) => {
    items.value = [...next]
  },
)

interface ChangeEvent {
  added?: { element: Task }
}

// Only "added" matters here: a card landing in this column (from this column
// or another) means its status should become this column's status. The
// source column's own "removed" event needs no handling — the status write
// below is what actually moves the task between columns' filtered lists.
function handleChange(event: ChangeEvent) {
  if (event.added) {
    updateTaskStatus(event.added.element.id, props.status)
  }
}
</script>

<template>
  <section class="flex flex-col rounded-lg border border-primary/15 border-t-2 border-t-primary/50 bg-primary/[0.03] p-3">
    <header class="mb-3 flex items-center justify-between px-1">
      <h2 class="text-sm font-medium text-foreground">{{ label }}</h2>
      <span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {{ tasks.length }}
      </span>
    </header>

    <template v-if="isLoading">
      <div class="flex flex-col gap-2">
        <TaskCardSkeleton v-for="n in 2" :key="n" />
      </div>
    </template>
    <template v-else>
      <draggable
        v-model="items"
        group="tasks"
        item-key="id"
        animation="150"
        ghost-class="drag-ghost"
        drag-class="drag-fallback"
        class="flex min-h-16 flex-1 flex-col gap-2"
        @change="handleChange"
      >
        <template #item="{ element }">
          <TaskCard :task="element" @select="emit('select-task', $event)" />
        </template>
        <template #footer>
          <p
            v-if="items.length === 0"
            class="rounded-md border border-dashed border-primary/25 px-3 py-6 text-center text-xs text-muted-foreground"
          >
            No tasks yet
          </p>
        </template>
      </draggable>
    </template>
  </section>
</template>
