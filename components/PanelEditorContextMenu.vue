<!-- PanelEditorContextMenu.vue -->
<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  x: number;
  y: number;
  isRoot?: boolean;
  isDirectory?: boolean;
  path?: string;
}>();

const emit = defineEmits<{
  (e: "create-file", path: string): void;
  (e: "create-dir", path: string): void;
  (e: "rename", path: string): void;
  (e: "delete", path: string): void;
  (e: "close"): void;
}>();

// Check if we're showing file or directory options
const isFile = computed(() => !props.isRoot && !props.isDirectory);

// Close the menu when clicking outside
function onClickOutside(event: MouseEvent) {
  if (props.show) {
    emit("close");
  }
}

// Close menu on escape key
onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && props.show) {
      emit("close");
    }
  });
});

onMounted(() => {
  window.addEventListener("click", onClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", onClickOutside);
});
</script>

<template>
  <div
    v-if="show"
    :style="{ left: `${x}px`, top: `${y}px` }"
    class="absolute z-50 bg-base border border-base shadow-lg rounded text-sm min-w-40"
    @click.stop
  >
    <div v-if="isRoot" class="py-1">
      <button
        class="w-full text-left px-3 py-1 hover:bg-active flex items-center gap-2"
        @click="emit('create-file', path || '')"
      >
        <div i-ph-file-plus-duotone class="opacity-60" />
        New File
      </button>
      <button
        class="w-full text-left px-3 py-1 hover:bg-active flex items-center gap-2"
        @click="emit('create-dir', path || '')"
      >
        <div i-ph-folder-plus-duotone class="opacity-60" />
        New Directory
      </button>
    </div>

    <div v-else-if="isDirectory" class="py-1">
      <button
        class="w-full text-left px-3 py-1 hover:bg-active flex items-center gap-2"
        @click="emit('create-file', path || '')"
      >
        <div i-ph-file-plus-duotone class="opacity-60" />
        New File
      </button>
      <button
        class="w-full text-left px-3 py-1 hover:bg-active flex items-center gap-2"
        @click="emit('create-dir', path || '')"
      >
        <div i-ph-folder-plus-duotone class="opacity-60" />
        New Directory
      </button>
      <div class="border-t border-base my-1"></div>
      <button
        class="w-full text-left px-3 py-1 hover:bg-active flex items-center gap-2"
        @click="emit('rename', path || '')"
      >
        <div i-ph-pencil-simple-duotone class="opacity-60" />
        Rename
      </button>
      <button
        class="w-full text-left px-3 py-1 hover:bg-active flex items-center gap-2 text-red"
        @click="emit('delete', path || '')"
      >
        <div i-ph-trash-duotone class="opacity-60" />
        Delete
      </button>
    </div>

    <div v-else-if="isFile" class="py-1">
      <button
        class="w-full text-left px-3 py-1 hover:bg-active flex items-center gap-2"
        @click="emit('rename', path || '')"
      >
        <div i-ph-pencil-simple-duotone class="opacity-60" />
        Rename
      </button>
      <button
        class="w-full text-left px-3 py-1 hover:bg-active flex items-center gap-2 text-red"
        @click="emit('delete', path || '')"
      >
        <div i-ph-trash-duotone class="opacity-60" />
        Delete
      </button>
    </div>
  </div>
</template>
