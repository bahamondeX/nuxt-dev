<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

const modelValue = ref("")
const drawioVisible = ref(false)

const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: true }),
    Image.configure(),
  ]
})

type DiagramData = {
  data: string
  xml: string
  timestamp?: number
}

const savedDiagramData = ref<DiagramData | null>(null)

const onDiagramSave = (data: DiagramData): void => {
  savedDiagramData.value = data;
  
  if (editor.value && data.data) {
    editor.value.chain().focus().setImage({ src: data.data }).run();
    drawioVisible.value = false;
  }
}

const onDrawioClose = (): void => {
  drawioVisible.value = false;
}

const toggleDrawio = (): void => {
  drawioVisible.value = !drawioVisible.value;
}

const formattingButtons = [
  {
    icon: "mdi-format-bold",
    action: () => editor.value?.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive('bold'),
    tooltip: "Bold"
  },
  {
    icon: "mdi-format-italic",
    action: () => editor.value?.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive('italic'),
    tooltip: "Italic"
  },
  {
    icon: "mdi-format-strikethrough-variant",
    action: () => editor.value?.chain().focus().toggleStrike().run(),
    isActive: () => editor.value?.isActive('strike'),
    tooltip: "Strikethrough"
  },
  {
    icon: "mdi-format-quote-close",
    action: () => editor.value?.chain().focus().toggleBlockquote().run(),
    isActive: () => editor.value?.isActive('blockquote'),
    tooltip: "Quote"
  },
  {
    icon: "mdi-format-list-bulleted",
    action: () => editor.value?.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value?.isActive('bulletList'),
    tooltip: "Bullet List"
  },
  {
    icon: "mdi-format-list-numbered",
    action: () => editor.value?.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value?.isActive('orderedList'),
    tooltip: "Ordered List"
  },
  {
    icon: "mdi-code-braces",
    action: () => editor.value?.chain().focus().toggleCodeBlock().run(),
    isActive: () => editor.value?.isActive('codeBlock'),
    tooltip: "Code Block"
  },
  {
    icon: "mdi-link-variant",
    action: () => {
      const url = window.prompt('URL')
      if (url) {
        editor.value?.chain().focus().setLink({ href: url }).run()
      }
    },
    isActive: () => editor.value?.isActive('link'),
    tooltip: "Link"
  },
  {
    icon: "mdi-image",
    action: () => {
      const url = window.prompt('Image URL')
      if (url) {
        editor.value?.chain().focus().setImage({ src: url }).run()
      }
    },
    tooltip: "Image"
  },
  {
    icon: "mdi-format-header-1",
    action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 1 }),
    tooltip: "Heading 1"
  },
  {
    icon: "mdi-format-header-2",
    action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 2 }),
    tooltip: "Heading 2"
  },
  {
    icon: "mdi-format-header-3",
    action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 3 }),
    tooltip: "Heading 3"
  },
  {
    icon: "mdi-format-clear",
    action: () => editor.value?.chain().focus().clearNodes().unsetAllMarks().run(),
    tooltip: "Clear formatting"
  },
  {
    icon: "mdi-undo",
    action: () => editor.value?.chain().focus().undo().run(),
    tooltip: "Undo"
  },
  {
    icon: "mdi-redo",
    action: () => editor.value?.chain().focus().redo().run(),
    tooltip: "Redo"
  },
  {
    icon: "mdi-graph",
    action: () => toggleDrawio(),
    tooltip: "Diagram",
    isActive: () => drawioVisible.value
  }
]

onMounted(() => {
  editor.value?.commands.setContent(modelValue.value);
  editor.value?.commands.focus();
});

onUnmounted(() => {
  editor.value?.destroy();
});
</script>

<template>
  <div class="editor-container" v-if="editor">
    <!-- Toolbar -->
    <div class="toolbar-container">
      <div class="toolbar-content">
        <button
          v-for="(button, index) in formattingButtons"
          :key="index"
          @click="button.action"
          class="editor-button"
          :class="{ 'is-active': button.isActive && button.isActive() }"
          :title="button.tooltip"
        >
          <Icon :icon="button.icon" />
        </button>
      </div>
    </div>
    
    <!-- Editor Content -->
    <div class="editor-wrapper">
      <EditorContent
        class="tiptap"
        :editor="editor"
        v-model="modelValue"
      />
    </div>
    
    <!-- Drawio Modal -->
    <Teleport to="body">
      <div v-if="drawioVisible" class="drawio-modal-container">
        <div class="modal-backdrop" @click="onDrawioClose"></div>
        
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Diagram Editor</h3>
            <button @click="onDrawioClose" class="close-button">
              <Icon icon="mdi-close" />
            </button>
          </div>
          
          <div class="modal-body">
            <DrawioContainer 
              @save="onDiagramSave"
              @exit="onDrawioClose"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss">
@import url("https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/github-markdown.min.css");
@import url("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/github.min.css");
@import url("https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Open+Sans:wght@400;600;700&family=Roboto+Mono:wght@400;500&display=swap");

:root {
  --editor-font: 'Open Sans', system-ui, sans-serif;
  --editor-code-font: 'Roboto Mono', monospace;
  --editor-heading-font: 'Merriweather', serif;
  --editor-primary-color: #3b82f6;
  --editor-bg-color: #ffffff;
  --editor-text-color: #1f2937;
  --editor-border-color: #e5e7eb;
  --editor-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --editor-radius: 0.5rem;
}

.editor-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  font-family: var(--editor-font);
  color: var(--editor-text-color);
  overflow: hidden;
}

.toolbar-container {
  position: sticky;
  top: 0;
  background-color: var(--editor-bg-color);
  box-shadow: var(--editor-shadow);
  padding: 0.5rem;
  z-index: 10;
  border-bottom: 1px solid var(--editor-border-color);
}

.toolbar-content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  justify-content: flex-start;
  align-items: center;
  padding: 0.25rem;
  overflow-x: auto;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
}

.editor-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--editor-border-color);
  border-radius: 0.375rem;
  background-color: var(--editor-bg-color);
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f9fafb;
    color: #111827;
    border-color: #d1d5db;
  }
  
  &.is-active {
    background-color: #eff6ff;
    color: var(--editor-primary-color);
    border-color: #bfdbfe;
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.editor-wrapper {
  flex-grow: 1;
  overflow: auto;
  padding: 1rem;
  background-color: #f9fafb;
}

/* Improved editor styles */
.tiptap {
  height: 100%;
  width: 100%;
  max-width: 50rem;
  margin: 0 auto;
  outline: none;
  background-color: var(--editor-bg-color);
  border-radius: var(--editor-radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  
  p {
    margin: 0.75em 0;
    line-height: 1.6;
  }
  
  .ProseMirror {
    min-height: calc(100vh - 140px);
    outline: none;
    caret-color: var(--editor-primary-color);
    font-size: 1rem;
    line-height: 1.6;
  }
  
  img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 1.5rem auto;
    border-radius: 0.25rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--editor-heading-font);
    line-height: 1.3;
    color: #111827;
  }
  
  h1 {
    font-size: 2rem;
    margin: 1.5em 0 0.5em;
    border-bottom: 1px solid var(--editor-border-color);
    padding-bottom: 0.3em;
  }
  
  h2 {
    font-size: 1.5rem;
    margin: 1.2em 0 0.5em;
  }
  
  h3 {
    font-size: 1.25rem;
    margin: 1em 0 0.5em;
  }
  
  code {
    font-family: var(--editor-code-font);
    background-color: #f3f4f6;
    border-radius: 0.25rem;
    padding: 0.1em 0.4em;
    font-size: 0.9em;
  }
  
  pre {
    background-color: #282c34;
    color: #abb2bf;
    border-radius: 0.375rem;
    padding: 1rem;
    margin: 1em 0;
    overflow-x: auto;
    
    code {
      background-color: transparent;
      padding: 0;
      color: inherit;
    }
  }
  
  blockquote {
    border-left: 4px solid var(--editor-primary-color);
    padding-left: 1rem;
    color: #4b5563;
    font-style: italic;
    margin: 1em 0;
  }
  
  ul, ol {
    padding-left: 1.5rem;
    margin: 0.75em 0;
  }
  
  li {
    margin: 0.375em 0;
  }
  
  a {
    color: var(--editor-primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

/* Drawio Modal Styles */
.drawio-modal-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}

.modal-content {
  position: relative;
  background-color: var(--editor-bg-color);
  border-radius: var(--editor-radius);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 92%;
  height: 85%;
  max-width: 72rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--editor-border-color);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--editor-text-color);
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: #6b7280;
  border: none;
  border-radius: 0.25rem;
  padding: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
    color: #1f2937;
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.modal-body {
  flex-grow: 1;
  overflow: hidden;
  padding: 0.25rem;
  background-color: #f9fafb;
}

@media (max-width: 768px) {
  .toolbar-content {
    justify-content: flex-start;
  }
  
  .editor-button {
    width: 32px;
    height: 32px;
    
    svg {
      width: 1rem;
      height: 1rem;
    }
  }
  
  .tiptap {
    padding: 1rem;
  }
  
  .modal-content {
    width: 96%;
    height: 90%;
  }
}

/* Add a light typewriter animation for the cursor */
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}

.ProseMirror-focused {
  .ProseMirror-gapcursor::after {
    border-top: 1px solid var(--editor-primary-color);
    animation: blink 1s step-end infinite;
  }
}

/* First loading state */
.editor-container:not(.loaded) {
  .tiptap {
    opacity: 0.7;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --editor-bg-color: #1e1e1e;
    --editor-text-color: #e5e7eb;
    --editor-border-color: #374151;
    --editor-primary-color: #60a5fa;
    --editor-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
  }
  
  .toolbar-container {
    background-color: #111827;
  }
  
  .editor-wrapper {
    background-color: #111827;
  }
  
  .editor-button {
    background-color: #1f2937;
    color: #d1d5db;
    border-color: #374151;
    
    &:hover {
      background-color: #374151;
      color: #f9fafb;
    }
    
    &.is-active {
      background-color: #1e3a8a;
      color: #93c5fd;
      border-color: #3b82f6;
    }
  }
  
  .tiptap {
    background-color: #1f2937;
    
    code {
      background-color: #374151;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: #f9fafb;
    }
    
    h1 {
      border-bottom-color: #374151;
    }
    
    blockquote {
      color: #9ca3af;
    }
  }
  
  .modal-content,
  .modal-body {
    background-color: #1f2937;
  }
}
</style>