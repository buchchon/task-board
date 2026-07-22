<script setup lang="ts">
import { ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { Sun, Moon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import TaskFormDialog from '@/components/task/TaskFormDialog.vue'

const dialogOpen = ref(false)

// Toggles the `.dark` class the design tokens in main.css key off of.
// Defaults to the OS color-scheme preference, then persists the user's
// choice to localStorage once they override it.
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <header class="border-b border-border">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <span class="text-sm font-semibold tracking-tight">Kanban Task Board</span>
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark()"
        >
          <Sun v-if="isDark" class="size-4" />
          <Moon v-else class="size-4" />
        </Button>
        <Button size="sm" @click="dialogOpen = true">+ New Task</Button>
      </div>
    </div>
  </header>

  <TaskFormDialog v-model:open="dialogOpen" />
</template>
