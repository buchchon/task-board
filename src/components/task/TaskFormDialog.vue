<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTasks } from '@/composables/useTasks'

// Title-only for now — description/priority/due date fields land in roadmap
// step 5 alongside the task detail panel, so this dialog just unblocks
// creating real tasks to drag around in step 4.
const open = defineModel<boolean>('open', { required: true })

const title = ref('')
const { createTask } = useTasks()

async function submit() {
  if (!title.value.trim()) return
  await createTask(title.value)
  title.value = ''
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New Task</DialogTitle>
      </DialogHeader>
      <Input v-model="title" placeholder="Task title" autofocus @keyup.enter="submit" />
      <DialogFooter>
        <Button @click="submit">Create</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
