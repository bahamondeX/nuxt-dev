<script setup lang="ts">
import { Icon } from "@iconify/vue"

const content = ref<string>("");
const emit = defineEmits<{
  send: [message: string];
}>();

const handleSend = () => {
  if (content.value.trim()) {
    emit("send", content.value);
    content.value = "";
  }
};
</script>

<template>
  <div class="w-full mx-auto fixed bottom-4 px-4">
    <div class="relative flex items-center">
      <input
        class="w-full rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-green-600 border border-gray-300 dark:border-gray-700 px-4 py-3 shadow-sm transition-all"
        placeholder="Enter message..."
        v-model="content"
        @keydown.enter="handleSend"
      />
      <button
        class="absolute right-3 p-1.5 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors"
        @click="handleSend"
      >
       <Icon icon="mdi:send" />
      </button>
    </div>
  </div>
</template>
