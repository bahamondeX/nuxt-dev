<script setup lang="ts">
const content = ref("")
const emit = defineEmits(["send"])

const handleContent = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    emit("send", content.value.trim())
    content.value = ''
  }
}
</script>

<template>
  <div class="w-full border-t bg-base fixed bottom-0 left-0 px-6 py-4">
    <div class="max-w-3xl mx-auto flex items-center">
      <textarea
        v-model="content"
        class="w-full resize-none p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        rows="1"
        placeholder="Send a message..."
        @keydown="handleContent"
      ></textarea>
    </div>
  </div>
</template>