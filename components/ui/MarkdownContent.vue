<script setup lang="ts">
import type { Message } from '~/types'
import { ref } from 'vue'

const props = defineProps<{ message: Message }>()

const copied = ref(false)

const copyToClipboard = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content.trim())
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <div class="markdown-body p-4 rounded">
    <p v-if="message.role === 'user'" class="whitespace-pre-line">{{ message.content }}</p>

    <div v-else-if="message.role === 'assistant'" class="relative whitespace-pre-line">
      <button
        class="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-xs px-2 py-1 rounded z-10"
        @click="copyToClipboard(message.content)"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
      <pre><code>{{ message.content }}</code></pre>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import url("https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/github-markdown.min.css");

.markdown-body {
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-wrap;
  position: relative;

  img {
    max-width: 8rem !important;
  }

  pre {
    padding: 0.75rem;
    border-radius: 0.5rem;
    background-color: #f6f8fa;
    overflow-x: auto;
    max-width: 100%;
    white-space: pre;
  }

  code {
    font-family: 'DM Mono', 'Roboto Mono', monospace;
    white-space: pre;
  }

  button {
    font-family: inherit;
    transition: background 0.2s ease;
  }
}
</style>