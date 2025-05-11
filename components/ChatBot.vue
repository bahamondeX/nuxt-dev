<script setup lang="ts">
const { messages, sendMessage, isLoading } = useChat()
const emit = defineEmits(["send"])
const callback = (chunk:string)=>{
  emit("send",chunk)
}
const handleSend = async (content:string)=>{
   await sendMessage(content,callback)
}

</script>
<template>
<div>
<UiInputContent @send="handleSend" dark:invert />
<UiMessageList :messages="messages" />
</div>
</template>
<style scoped>

</style>