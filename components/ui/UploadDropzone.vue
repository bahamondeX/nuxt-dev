<template>
  <div
    class="flex flex-col items-center justify-center px-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500 transition-colors"
    :class="{ 'border-blue-500 bg-blue-50': isDraggingOver }"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />
    <Icon icon="mdi:cloud-upload-outline" class="w-12 h-12 text-gray-400" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

const emit = defineEmits<{
  (e: 'files-selected', files: File[]): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDraggingOver = ref(false);
const files = ref<File[]>([]);

const handleDragEnter = (event: DragEvent) => {
  isDraggingOver.value = true;
};

const handleDragOver = (event: DragEvent) => {
  // This is necessary to allow dropping
  event.dataTransfer!.dropEffect = 'copy';
};

const handleDragLeave = (event: DragEvent) => {
  isDraggingOver.value = false;
};

const processFiles = (fileList: FileList) => {
  const newFiles = Array.from(fileList);
  files.value = [...newFiles]; // Replace or append as needed
  emit('files-selected', newFiles);
  // Reset for next selection if needed
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleDrop = (event: DragEvent) => {
  isDraggingOver.value = false;
  if (event.dataTransfer?.files) {
    processFiles(event.dataTransfer.files);
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};



const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    processFiles(target.files);
  }
};
</script>