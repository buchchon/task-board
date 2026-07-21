<script setup lang="ts">
import { ref, watch } from 'vue'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import TaskFormDialog from './TaskFormDialog.vue'
import LabelPicker from './LabelPicker.vue'
import TaskActivityLog from './TaskActivityLog.vue'
import { useTasks } from '@/composables/useTasks'
import { useTaskActivity } from '@/composables/useTaskActivity'
import { labelColorStyles } from '@/types/label'
import type { Task } from '@/types/task'

const props = defineProps<{ task: Task | null }>()
const open = defineModel<boolean>('open', { required: true })

const { deleteTask } = useTasks()
const { fetchActivity } = useTaskActivity()

const editOpen = ref(false)

const priorityStyles: Record<Task['priority'], string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-secondary text-secondary-foreground',
  high: 'bg-destructive/10 text-destructive',
}

watch(
  () => props.task,
  (task) => {
    if (task) fetchActivity(task.id)
  },
  { immediate: true },
)

async function handleDelete() {
  if (!props.task) return
  await deleteTask(props.task.id)
  open.value = false
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent v-if="task">
      <SheetHeader>
        <SheetTitle>{{ task.title }}</SheetTitle>
      </SheetHeader>

      <div class="space-y-4 px-4">
        <p v-if="task.description" class="text-sm text-muted-foreground">{{ task.description }}</p>
        <p v-else class="text-sm italic text-muted-foreground">No description</p>

        <div class="flex items-center gap-2">
          <span :class="['rounded px-1.5 py-0.5 text-xs font-medium capitalize', priorityStyles[task.priority]]">
            {{ task.priority }}
          </span>
          <span v-if="task.due_date" class="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            Due {{ task.due_date }}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <span
            v-for="l in task.labels"
            :key="l.id"
            :class="['rounded px-1.5 py-0.5 text-xs font-medium', labelColorStyles[l.color]]"
          >
            {{ l.name }}
          </span>
          <LabelPicker :task="task" />
        </div>

        <TaskActivityLog />
      </div>

      <SheetFooter class="flex-row justify-between gap-2">
        <Button variant="outline" class="text-destructive hover:text-destructive" @click="handleDelete">
          Delete
        </Button>
        <Button @click="editOpen = true">Edit</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>

  <TaskFormDialog v-if="task" v-model:open="editOpen" :task="task" />
</template>
