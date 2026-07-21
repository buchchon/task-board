<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import TaskFormDialog from '@/components/task/TaskFormDialog.vue'

const dialogOpen = ref(false)
</script>

<template>
  <header class="border-b border-border">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <span class="text-sm font-semibold tracking-tight">Kanban Task Board</span>
      <Button size="sm" @click="dialogOpen = true">+ New Task</Button>
    </div>
  </header>

  <TaskFormDialog v-model:open="dialogOpen" />
</template>
