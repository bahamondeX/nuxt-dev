<script setup lang="ts">
const content = ref("")
const emits = defineEmits(["send","chunked"])

const handleContent = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    emits("send", content.value.trim())
    content.value = ''
  }
}

const handleFile = async(file:File)=>{
  const formData = new FormData()
  formData.append("file",file)
  const response = await fetch("http://localhost:8080/v1/files?format=text",{method:"POST",body:formData})
  const data = await response.json()
  const chunks = data.chunks
  chunks.forEach((ch:string)=>{emits('chunked',ch)})
}

const handleFiles = async (files: File[]) => {
  for (const file of files) {
    try {
      await handleFile(file)
    } catch (err) {
      console.error(`Error uploading file ${file.name}:`, err)
    }
  }
}

</script>

<template>
  <div class="w-full border-t bg-base px-6 py-4">
    <div class="max-w-3xl mx-auto flex items-center">
      <textarea
        v-model="content"
        class="w-full resize-none p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        rows="1"
        placeholder="Send a message..."
        @keydown="handleContent"
      ></textarea>
      <UiUploadDropzone @files-selected="handleFiles($event)" />
    </div>
  </div>
</template>