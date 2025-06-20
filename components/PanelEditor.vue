<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";
import { filesToVirtualFsTree } from "~/templates/utils";
import { VirtualFile } from "~/structures/VirtualFile";

const play = usePlaygroundStore();
const guide = useGuideStore();

const files = computed(() =>
  Array.from(play.files.values()).filter(
    (file) => !isFileIgnored(file.filepath, guide.ignoredFiles),
  ),
);

const directory = computed(() => filesToVirtualFsTree(files.value));

const input = ref<string>("");

// Context menu state for the root directory
const showRootContextMenu = ref(false);
const rootContextMenuX = ref(0);
const rootContextMenuY = ref(0);

watch(
  () => play.fileSelected,
  (newFile) => {
    input.value = newFile?.read() || "";
  },
);

const onTextInput = useDebounceFn(_onTextInput, 500);
function _onTextInput() {
  if (input.value != null) play?.fileSelected?.write(input.value);
}

function handleRootContextMenu(event: MouseEvent) {
  // Prevent default browser context menu
  event.preventDefault();

  // Position the custom context menu
  rootContextMenuX.value = event.clientX;
  rootContextMenuY.value = event.clientY;

  // Show the context menu
  showRootContextMenu.value = true;
}

function closeRootContextMenu() {
  showRootContextMenu.value = false;
}

// Function to handle creating a new file
async function handleCreateFile(path: string) {
  const filename = await new Promise<string | null>((resolve) => {
    const userInput = window.prompt("Enter file name:", "");
    resolve(userInput);
  });

  if (filename) {
    const filepath = path ? `${path}/${filename}` : filename;
    const newFile = new VirtualFile(filepath, "", play.webcontainer!);
    play.files.set(newFile.filepath, newFile);
    play.fileSelected = newFile;
  }

  closeRootContextMenu();
}

// Function to handle creating a new directory
async function handleCreateDir(path: string) {
  const dirname = await new Promise<string | null>((resolve) => {
    const userInput = window.prompt("Enter directory name:", "");
    resolve(userInput);
  });

  if (dirname) {
    const dirpath = path ? `${path}/${dirname}` : dirname;
    // Create a placeholder file in the directory so it shows up in the tree
    const newFile = new VirtualFile(
      `${dirpath}/.gitkeep`,
      "",
      play.webcontainer!,
    );
    play.files.set(newFile.filepath, newFile);
  }

  closeRootContextMenu();
}

// Function to handle renaming a file or directory
async function handleRename(path: string) {
  const isDirectory = files.value.some((file) =>
    file.filepath.startsWith(`${path}/`),
  );

  const oldName = path.split("/").pop() || "";
  const parentPath = path.substring(0, path.length - oldName.length - 1);

  const newName = await new Promise<string | null>((resolve) => {
    const userInput = window.prompt("Enter new name:", oldName);
    resolve(userInput);
  });

  if (newName && newName !== oldName) {
    const newPath = parentPath ? `${parentPath}/${newName}` : newName;

    if (isDirectory) {
      // Rename all files in directory
      files.value.forEach((file) => {
        if (file.filepath.startsWith(`${path}/`)) {
          const relativePath = file.filepath.substring(path.length);
          const newFilePath = `${newPath}${relativePath}`;

          // Create new file with new path
          const newFile = new VirtualFile(newFilePath, "", play.webcontainer!);
          newFile.write(file.read());
          play.files.set(newFile.filepath, newFile);

          // Delete old file
          play.files.delete(file.filepath);

          // Update selected file if needed
          if (play.fileSelected?.filepath === file.filepath) {
            play.fileSelected = newFile;
          }
        }
      });
    } else {
      // Single file rename
      const file = files.value.find((f) => f.filepath === path);
      if (file) {
        const newFile = new VirtualFile(newPath, "", play.webcontainer!);
        newFile.write(file.read());
        play.files.set(newFile.filepath, newFile);
        play.files.delete(file.filepath);

        // Update selected file if needed
        if (play.fileSelected?.filepath === path) {
          play.fileSelected = newFile;
        }
      }
    }
  }
}

// Function to handle deleting a file or directory
async function handleDelete(path: string) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${path}"?`,
  );

  if (confirmed) {
    const isDirectory = files.value.some((file) =>
      file.filepath.startsWith(`${path}/`),
    );

    if (isDirectory) {
      // Delete all files in directory
      files.value.forEach((file) => {
        if (file.filepath.startsWith(`${path}/`)) {
          play.files.delete(file.filepath);

          // Clear selected file if it's being deleted
          if (play.fileSelected?.filepath === file.filepath) {
            play.fileSelected = undefined;
          }
        }
      });
    } else {
      // Single file delete
      play.files.delete(path);

      // Clear selected file if it's being deleted
      if (play.fileSelected?.filepath === path) {
        play.fileSelected = undefined;
      }
    }
  }
}

const handleKeyDown = async (e: KeyboardEvent) => {
  // Check if Option+Shift+Enter is pressed
  // Option key is 'Alt' in most browsers
  if (e.altKey && e.shiftKey && e.key === "Enter") {
    const { run } = useCompletion();
    await run(input.value, (data) => {
      input.value += data;
    });
    // Prevent default behavior if needed
    e.preventDefault();
  }
};

</script>

<template>
  <Splitpanes of-hidden>
    <Pane flex="~ col" h-full of-auto class="max-w-1/3">
      <div h-full grid="~ rows-[min-content_1fr]">
        <div
          flex="~ gap-2 items-center"
          border="b base dashed"
          bg-faded
          px4
          py2
          cursor-pointer
          @contextmenu="handleRootContextMenu"
        >
          <div i-ph-tree-structure-duotone />
          <span text-sm>{{ $t("files") }}</span>
        </div>
        <div py2>
          <PanelEditorFileSystemTree
            v-model="play.fileSelected"
            :directory="directory"
            :depth="-1"
            @create-file="handleCreateFile"
            @create-dir="handleCreateDir"
            @rename="handleRename"
            @delete="handleDelete"
          />
        </div>
      </div>
    </Pane>
    <PaneSplitter />
    <Pane>
      <div h-full grid="~ rows-[min-content_1fr]">
        <div
          flex="~ gap-2 items-center"
          border="b base dashed"
          bg-faded
          px4
          py2
        >
          <FileIcon :path="play.fileSelected?.filepath || ''" />
          <span flex-auto text-sm>{{
            play.fileSelected?.filepath || "Editor"
          }}</span>
        </div>
        <LazyPanelEditorMonaco
          v-if="play.fileSelected"
          v-model="input"
          :filepath="play.fileSelected.filepath"
          h-full
          w-full
          @change="onTextInput"
          @keydown="handleKeyDown"
        />
      </div>
    </Pane>
  </Splitpanes>

  <teleport to="body">
    <PanelEditorContextMenu
      :show="showRootContextMenu"
      :x="rootContextMenuX"
      :y="rootContextMenuY"
      :is-root="true"
      @close="closeRootContextMenu"
      @create-file="handleCreateFile"
      @create-dir="handleCreateDir"
    />
  </teleport>
</template>
