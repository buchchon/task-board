<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTasks } from '@/composables/useTasks'
import type { Task, TaskPriority } from '@/types/task'

// A null/undefined task means "create"; a real task means "edit" — same
// form either way, just pre-filled and calling updateTask instead of
// createTask on submit.
const props = defineProps<{ task?: Task | null }>()
const open = defineModel<boolean>('open', { required: true })

const { createTask, updateTask } = useTasks()

const title = ref('')
const description = ref('')
const priority = ref<TaskPriority>('normal')
const dueDate = ref('')
const isSubmitting = ref(false)

watch(open, (isOpen) => {
  if (!isOpen) return
  title.value = props.task?.title ?? ''
  description.value = props.task?.description ?? ''
  priority.value = props.task?.priority ?? 'normal'
  dueDate.value = props.task?.due_date ?? ''
})

async function submit() {
  // Guards against double-submit from a fast double-click/Enter — without
  // this, two identical rows can be inserted before the first request
  // resolves and the dialog closes.
  if (!title.value.trim() || isSubmitting.value) return
  isSubmitting.value = true

  const fields = {
    title: title.value,
    description: description.value,
    priority: priority.value,
    due_date: dueDate.value,
  }

  if (props.task) {
    await updateTask(props.task.id, fields)
  } else {
    await createTask(fields)
  }

  isSubmitting.value = false
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ task ? 'Edit Task' : 'New Task' }}</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <Label for="task-title">Title</Label>
          <Input id="task-title" v-model="title" placeholder="Task title" autofocus @keyup.enter="submit" />
        </div>

        <div class="space-y-1.5">
          <Label for="task-description">Description</Label>
          <Textarea id="task-description" v-model="description" placeholder="Optional details" rows="3" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <Label>Priority</Label>
            <Select v-model="priority">
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-1.5">
            <Label for="task-due-date">Due date</Label>
            <Input id="task-due-date" v-model="dueDate" type="date" />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button :disabled="isSubmitting" @click="submit">{{ task ? 'Save' : 'Create' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
