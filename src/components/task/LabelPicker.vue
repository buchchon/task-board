<script setup lang="ts">
import { ref } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLabels } from '@/composables/useLabels'
import { LABEL_COLORS, DEFAULT_LABEL_COLOR, labelSwatchStyles } from '@/types/label'
import type { Label, LabelColor } from '@/types/label'

// Controlled: this component never talks to the tasks table itself, it just
// reports the desired label set. A task-detail-panel caller can apply each
// change immediately (attach/detach on an existing task); a create/edit form
// caller can hold it as pending state and only sync it on submit, once a
// task id actually exists.
const props = defineProps<{ modelValue: Label[] }>()
const emit = defineEmits<{ 'update:modelValue': [Label[]] }>()

const { labels, createLabel } = useLabels()

const open = ref(false)
const newLabelName = ref('')
const newLabelColor = ref<LabelColor>(DEFAULT_LABEL_COLOR)
const isCreating = ref(false)

function hasLabel(label: Label) {
  return props.modelValue.some((l) => l.id === label.id)
}

function onToggle(label: Label, checked: boolean) {
  emit(
    'update:modelValue',
    checked ? [...props.modelValue, label] : props.modelValue.filter((l) => l.id !== label.id),
  )
}

async function handleCreate() {
  if (!newLabelName.value.trim() || isCreating.value) return
  isCreating.value = true

  const created = await createLabel(newLabelName.value, newLabelColor.value)
  if (created) {
    emit('update:modelValue', [...props.modelValue, created])
    newLabelName.value = ''
    newLabelColor.value = DEFAULT_LABEL_COLOR
  }

  isCreating.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="h-7 text-xs">
        + Label
        <span v-if="modelValue.length > 0" class="ml-0.5 rounded-full bg-primary px-1.5 text-primary-foreground">
          {{ modelValue.length }}
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-64 p-2" align="start">
      <div class="max-h-48 space-y-0.5 overflow-y-auto">
        <p v-if="labels.length === 0" class="px-2 py-1.5 text-xs text-muted-foreground">No labels yet</p>
        <label
          v-for="l in labels"
          :key="l.id"
          class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
        >
          <Checkbox :model-value="hasLabel(l)" @update:model-value="(v) => onToggle(l, !!v)" />
          <span :class="['size-2 shrink-0 rounded-full', labelSwatchStyles[l.color]]" />
          <span class="truncate">{{ l.name }}</span>
        </label>
      </div>

      <div class="mt-2 border-t border-border pt-2">
        <Input v-model="newLabelName" placeholder="New label" class="h-8 text-sm" @keyup.enter="handleCreate" />
        <div class="mt-2 flex items-center gap-1.5">
          <button
            v-for="color in LABEL_COLORS"
            :key="color"
            type="button"
            :class="[
              'size-5 rounded-full ring-offset-2 ring-offset-popover transition',
              labelSwatchStyles[color],
              newLabelColor === color ? 'ring-2 ring-ring' : '',
            ]"
            :aria-label="color"
            @click="newLabelColor = color"
          />
        </div>
        <Button size="sm" class="mt-2 w-full" :disabled="!newLabelName.trim() || isCreating" @click="handleCreate">
          Add label
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
