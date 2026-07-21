<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'
import { useTaskActivity } from '@/composables/useTaskActivity'

const { activity, isLoading } = useTaskActivity()
</script>

<template>
  <div>
    <h3 class="text-xs font-medium text-muted-foreground">Activity</h3>

    <div v-if="isLoading" class="mt-2 animate-pulse space-y-2">
      <div class="h-3 w-3/4 rounded bg-muted"></div>
      <div class="h-3 w-1/2 rounded bg-muted"></div>
    </div>
    <p v-else-if="activity.length === 0" class="mt-2 text-sm italic text-muted-foreground">No activity yet</p>
    <ul v-else class="mt-2 space-y-2">
      <li v-for="entry in activity" :key="entry.id" class="text-sm text-foreground">
        {{ entry.detail }}
        <span class="text-xs text-muted-foreground"> · {{ formatTimeAgo(new Date(entry.created_at)) }}</span>
      </li>
    </ul>
  </div>
</template>
