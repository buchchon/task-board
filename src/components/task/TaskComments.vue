<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatTimeAgo } from '@vueuse/core'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useComments } from '@/composables/useComments'

const props = defineProps<{ taskId: string }>()

const { comments, isLoading, fetchComments, addComment } = useComments()

const draft = ref('')
const isPosting = ref(false)

watch(
  () => props.taskId,
  (taskId) => fetchComments(taskId),
  { immediate: true },
)

async function handlePost() {
  if (!draft.value.trim() || isPosting.value) return
  isPosting.value = true
  await addComment(props.taskId, draft.value)
  draft.value = ''
  isPosting.value = false
}
</script>

<template>
  <div>
    <h3 class="text-xs font-medium text-muted-foreground">Comments</h3>

    <div v-if="isLoading" class="mt-2 animate-pulse space-y-2">
      <div class="h-3 w-3/4 rounded bg-muted"></div>
      <div class="h-3 w-1/2 rounded bg-muted"></div>
    </div>
    <p v-else-if="comments.length === 0" class="mt-2 text-sm italic text-muted-foreground">No comments yet</p>
    <ul v-else v-auto-animate class="mt-2 space-y-3">
      <li v-for="comment in comments" :key="comment.id" class="text-sm">
        <p class="text-foreground">{{ comment.body }}</p>
        <span class="text-xs text-muted-foreground">{{ formatTimeAgo(new Date(comment.created_at)) }}</span>
      </li>
    </ul>

    <div class="mt-3 space-y-2">
      <Textarea v-model="draft" placeholder="Write a comment" rows="2" @keydown.meta.enter="handlePost" />
      <Button size="sm" :disabled="!draft.trim() || isPosting" @click="handlePost">Comment</Button>
    </div>
  </div>
</template>
