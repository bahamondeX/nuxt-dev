<script setup lang="ts">
import type { Message } from "~/types";
import { Icon } from "@iconify/vue";

const { message } = defineProps<{
  message: Message;
}>();

const timestamp = computed(() => {
  return new Date(message.ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>

<template>
  <div class="py-4 px-2">
    <div
      :class="[
        'flex gap-3 items-start',
        message.role === 'user' ? 'flex-row' : 'flex-row-reverse',
      ]"
    >
      <div
        :class="[
          'flex-shrink-0 rounded-full p-2',
          message.role === 'user'
            ? 'bg-blue-100 text-green-600'
            : 'bg-purple-100 text-gray-600',
        ]"
      >
        <Icon
          :icon="message.role === 'assistant' ? 'mdi:robot' : 'mdi:account'"
          class="h-6 w-6 transition-transform duration-200 hover:scale-110"
        />
      </div>
     <div
        :class="[
          'flex flex-col max-w-[80%]',
          message.role === 'user' ? 'items-start' : 'items-end',
        ]"
      >
        <div class="flex items-center mb-1 text-xs text-gray-500">
          <span class="font-medium">
            {{ message.role === "user" ? "You" : "Claude" }}
          </span>
          <span class="mx-2">•</span>
          <span>{{ timestamp }}</span>
        </div>
        <div
          :class="[
            'rounded-lg shadow-sm',
            message.role === 'user'
              ? 'bg-blue-50 border border-green-100'
              : 'bg-white border border-gray-100',
          ]"
        >
          <ChatMarkDown :content="message.content" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex-row-reverse {
  animation: slide-left 0.3s ease-out;
}

.flex-row {
  animation: slide-right 0.3s ease-out;
}

@keyframes slide-right {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-left {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
