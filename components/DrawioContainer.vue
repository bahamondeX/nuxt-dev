<template>
  <div class="container mx-auto p-4 z-50">
    <button 
      @click="toggleMode" 
      class="inline-flex items-center px-4 py-2 mb-6 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
    >
      <Icon
        :icon="showEditor ? 'ph:eye' : 'ph:pencil-simple'" 
        class="mr-2 h-5 w-5"
      />
      {{ showEditor ? 'View' : 'Edit' }}
    </button>
    
    <DrawioEditor
      v-if="showEditor"
      ref="drawioEditorRef"
      :initial-data="diagramData"
      :config="editorConfig"
      @save="onDiagramSave"
      @exit="onDiagramExit"
      class="w-full h-screen max-h-[600px] border border-gray-200 rounded-md shadow-sm"
    />
    <div 
      v-else-if="savedDiagram" 
      class="w-full border border-gray-200 rounded-md shadow-sm p-4 overflow-auto"
    >
      <img :src="savedDiagram.data" alt="Diagram preview" class="max-w-full h-auto" />
    </div>
    <div 
      v-else 
      class="flex justify-center items-center h-[300px] bg-gray-50 border border-dashed border-gray-300 rounded-md"
    >
      <div class="text-center text-gray-500">
        <Icon icon="ph:file-dotted" class="h-12 w-12 mx-auto mb-2" />
        <p>No diagram available. Click "Edit" to create one.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DrawioEditor from './DrawioEditor.vue'

// Types
interface DiagramData {
  xml: string;
  data: string;
}

interface DrawioConfig {
  defaultFonts?: string[];
  ui?: 'kennedy' | 'atlas' | 'dark' | 'min';
  theme?: string;
  customPresetColors?: string[];
  [key: string]: any;
}

// Props
const props = defineProps({
  initialDiagram: {
    type: String,
    default: ''
  },
  config: {
    type: Object as () => Partial<DrawioConfig>,
    default: () => ({})
  }
})

// Default empty diagram
const DEFAULT_DIAGRAM = '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>'

// State with proper typing
const diagramData = ref<string>(props.initialDiagram || '')
const savedDiagram = ref<DiagramData | null>(null)
const drawioEditorRef = ref<InstanceType<typeof DrawioEditor> | null>(null)
const showEditor = ref<boolean>(false)
const editorConfig = reactive<DrawioConfig>({
  defaultFonts: ['Helvetica', 'Arial'],
  ui: 'dark',
  ...props.config
})

const emit = defineEmits<{
  (e: 'save', data: DiagramData): void;
  (e: 'update:diagram', xml: string): void;
}>()

// Toggle between edit and view modes
const toggleMode = (): void => {
  if (!showEditor.value) {
    showEditor.value = true
    nextTick(() => {
      if (drawioEditorRef.value) {
        if (savedDiagram.value) {
          drawioEditorRef.value.loadDiagram(savedDiagram.value.xml)
        } else if (diagramData.value) {
          drawioEditorRef.value.loadDiagram(diagramData.value)
        } else {
          drawioEditorRef.value.loadDiagram(DEFAULT_DIAGRAM)
        }
      }
    })
  } else {
    if (drawioEditorRef.value) {
      drawioEditorRef.value.exportDiagram()
    } else {
      showEditor.value = false
    }
  }
}

const onDiagramSave = (data: DiagramData): void => {
  savedDiagram.value = data
  diagramData.value = data.xml
  emit('save', data)
  emit('update:diagram', data.xml)
  showEditor.value = false
}

const onDiagramExit = (): void => {
  showEditor.value = false
}

// Expose component methods
defineExpose({
  toggleEditor: toggleMode,
  getDiagram: () => savedDiagram.value,
  loadDiagram: (xml: string) => {
    diagramData.value = xml
    if (drawioEditorRef.value && showEditor.value) {
      drawioEditorRef.value.loadDiagram(xml)
    }
  }
})
</script>