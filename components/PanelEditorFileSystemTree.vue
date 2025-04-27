<script lang="ts">
import type { VirtualFile } from "~/structures/VirtualFile";
import type { VirtualFileSystemTree } from "~/structures/VirtualFileSystemTree";
</script>

<script setup lang="ts">
const props = defineProps<{
  name?: string;
  directory?: VirtualFileSystemTree;
  file?: VirtualFile;
  depth: number;
  path?: string;
}>();

const emit = defineEmits<{
  (e: "create-file", path: string): void;
  (e: "create-dir", path: string): void;
  (e: "rename", path: string): void;
  (e: "delete", path: string): void;
}>();

const selectedFile = defineModel<VirtualFile>();

const isFileSelected = computed(
  () => props.file?.filepath === selectedFile.value?.filepath,
);

// TODO: config default open from templates
const isDirectoryOpen = ref(true);

// Context menu state
const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

function handleClick() {
  if (props.directory) isDirectoryOpen.value = !isDirectoryOpen.value;
  else if (props.file) selectedFile.value = props.file;
}

function handleContextMenu(event: MouseEvent) {
  // Prevent default browser context menu
  event.preventDefault();

  // Position the custom context menu
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;

  // Show the context menu
  showContextMenu.value = true;
}

function closeContextMenu() {
  showContextMenu.value = false;
}

function handleCreateFile(path: string) {
  emit("create-file", path);
  closeContextMenu();
}

function handleCreateDir(path: string) {
  emit("create-dir", path);
  closeContextMenu();
}

function handleRename(path: string) {
  emit("rename", path);
  closeContextMenu();
}

function handleDelete(path: string) {
  emit("delete", path);
  closeContextMenu();
}

// put folders first and sort alphabetically
const sortedDirectory = computed(
  () =>
    props.directory &&
    Object.fromEntries(
      Object.entries(props.directory).sort(([aName, a], [bName, b]) => {
        if ("directory" in a && !("directory" in b)) return -1;
        if (!("directory" in a) && "directory" in b) return 1;
        return aName.localeCompare(bName);
      }),
    ),
);

const folderCaret = computed(() => {
  const icon = "i-ph-caret-right transition-transform duration-300 op50";
  if (props.directory) {
    return isDirectoryOpen.value ? `${icon} rotate-90` : icon;
  } else {
    return "opacity-0";
  }
});

// Get the full path for the current node
const currentPath = computed(() => {
  if (!props.name) return "";
  return props.path ? `${props.path}/${props.name}` : props.name;
});
</script>

<template>
  <div>
    <button
      v-if="name"
      hover="bg-active"
      :style="{
        paddingLeft: `${0.2 + 0.8 * props.depth}rem`,
      }"
      :class="isFileSelected ? 'bg-active' : 'text-faded'"
      w-full
      flex
      items-center
      gap-1
      px2
      py1
      text-left
      text-sm
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      <div :class="folderCaret" h-4 w-4 flex-none />
      <FileIcon
        h-4
        w-4
        flex-none
        :path="name"
        :is-directory="!!props.directory"
        :is-directory-open="isDirectoryOpen"
      />
      <span ml1>{{ name }}</span>
    </button>
    <div v-if="directory" v-show="isDirectoryOpen">
      <PanelEditorFileSystemTree
        v-for="(child, childName) in sortedDirectory"
        :key="childName"
        v-model="selectedFile"
        :name="childName.toString()"
        :path="currentPath"
        :depth="depth + 1"
        v-bind="child"
        @create-file="handleCreateFile"
        @create-dir="handleCreateDir"
        @rename="handleRename"
        @delete="handleDelete"
      />
    </div>

    <teleport to="body">
      <PanelEditorContextMenu
        :show="showContextMenu"
        :x="contextMenuX"
        :y="contextMenuY"
        :is-directory="!!props.directory"
        :is-root="false"
        :path="currentPath"
        @close="closeContextMenu"
        @create-file="handleCreateFile"
        @create-dir="handleCreateDir"
        @rename="handleRename"
        @delete="handleDelete"
      />
    </teleport>
  </div>
</template>
