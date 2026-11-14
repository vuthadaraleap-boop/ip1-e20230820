<script setup lang="ts">
// Shows ONE of: loading, error, empty, or the real content (the default slot).
// Every list and detail page uses it, so the three states always look the same.
defineProps<{
  loading: boolean
  error: string | null
  empty: boolean
  emptyText: string
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div v-if="loading" class="state" role="status">
    <span class="spinner" aria-hidden="true"></span>
    Loading…
  </div>
  <div v-else-if="error" class="state state-error" role="alert">
    <p>{{ error }}</p>
    <button type="button" class="btn" @click="emit('retry')">Try again</button>
  </div>
  <div v-else-if="empty" class="state state-empty">{{ emptyText }}</div>
  <slot v-else />
</template>
