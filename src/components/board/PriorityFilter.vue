<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import type { TaskPriority } from '@/types/task'

const PRIORITIES: TaskPriority[] = ['low', 'normal', 'high']

const selected = defineModel<TaskPriority[]>('selected', { required: true })

function isSelected(priority: TaskPriority) {
  return selected.value.includes(priority)
}

function toggle(priority: TaskPriority, checked: boolean) {
  selected.value = checked ? [...selected.value, priority] : selected.value.filter((p) => p !== priority)
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="h-8 text-xs">
        Filter by priority
        <span v-if="selected.length > 0" class="ml-1 rounded-full bg-primary px-1.5 text-primary-foreground">
          {{ selected.length }}
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-48 p-2" align="start">
      <label
        v-for="priority in PRIORITIES"
        :key="priority"
        class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm capitalize hover:bg-accent"
      >
        <Checkbox :model-value="isSelected(priority)" @update:model-value="(v) => toggle(priority, !!v)" />
        {{ priority }}
      </label>

      <Button
        v-if="selected.length > 0"
        variant="ghost"
        size="sm"
        class="mt-2 w-full text-xs text-muted-foreground"
        @click="selected = []"
      >
        Clear filters
      </Button>
    </PopoverContent>
  </Popover>
</template>
