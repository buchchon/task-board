<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useLabels } from '@/composables/useLabels'
import { labelSwatchStyles } from '@/types/label'

const { labels } = useLabels()
const selected = defineModel<string[]>('selected', { required: true })

function isSelected(labelId: string) {
  return selected.value.includes(labelId)
}

function toggle(labelId: string, checked: boolean) {
  selected.value = checked ? [...selected.value, labelId] : selected.value.filter((id) => id !== labelId)
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="h-8 text-xs">
        Filter by label
        <span v-if="selected.length > 0" class="ml-1 rounded-full bg-primary px-1.5 text-primary-foreground">
          {{ selected.length }}
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-64 p-2" align="start">
      <p v-if="labels.length === 0" class="px-2 py-1.5 text-xs text-muted-foreground">No labels yet</p>
      <div v-else class="max-h-56 space-y-0.5 overflow-y-auto">
        <label
          v-for="l in labels"
          :key="l.id"
          class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
        >
          <Checkbox :model-value="isSelected(l.id)" @update:model-value="(v) => toggle(l.id, !!v)" />
          <span :class="['size-2 shrink-0 rounded-full', labelSwatchStyles[l.color]]" />
          <span class="truncate">{{ l.name }}</span>
        </label>
      </div>

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
