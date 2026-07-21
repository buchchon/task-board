<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <header class="border-b border-border">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <span class="text-sm font-semibold tracking-tight">Kanban Task Board</span>
      <Button size="sm">+ New Task</Button>
    </div>
  </header>
</template>
