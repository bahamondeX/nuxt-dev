<script setup lang="ts">
import { type Message } from "~/types"
defineProps<{ messages: Message[] }>()
</script>

<template>
  <div class="flex flex-col space-y-4 p-4 overflow-y-auto h-[calc(100vh-8rem)]">
    <div
      v-for="(message, index) in messages"
      :key="index"
      :class="[
        'max-w-3xl px-4 py-3 rounded-lg',
        message.role === 'user'
          ? 'self-end bg-cyan-100 text-gray-900'
          : 'self-start bg-white text-gray-900 shadow-md'
      ]"
    >
      <UiMarkdownContent :message="message" />
    </div>
  </div>
</template>