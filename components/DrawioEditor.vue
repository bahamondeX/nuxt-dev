<template>
  <div class="diagram-container relative">
    <div v-if="!isLoaded" class="absolute inset-0 flex justify-center items-center bg-gray-100/80 backdrop-blur-sm z-10 rounded-md">
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-700 font-medium">Loading editor...</p>
      </div>
    </div>
    
    <iframe 
      ref="drawioFrameRef" 
      :src="drawioUrl" 
      class="w-full h-screen max-h-[600px] border-0 rounded-md shadow-lg transition-all duration-300"
      :class="{ 'opacity-0 scale-98': !isLoaded, 'opacity-100 scale-100': isLoaded }"
      @load="onFrameLoad"
    ></iframe>
    
    <div class="mt-3 flex justify-between items-center text-sm" v-if="lastSaved">
      <span class="text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ formatDate(lastSaved) }}
      </span>
      <div class="flex items-center gap-3">
        <span v-if="isModified" class="text-amber-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Unsaved changes
        </span>
        <div class="flex gap-2">
          <button 
            @click="saveCurrentDiagram" 
            class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center transition-colors"
            title="Save diagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save
          </button>
          <button 
            @click="exportAsPng" 
            class="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded flex items-center transition-colors"
            title="Export as PNG"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Export
          </button>
          <button 
            @click="resetDiagram" 
            class="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
            title="Reset diagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="mt-3 flex justify-end" v-if="!lastSaved">
      <button 
        @click="saveCurrentDiagram" 
        class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Save Diagram
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DrawioConfig {
  defaultFonts?: string[];
  ui?: 'kennedy' | 'atlas' | 'dark' | 'min';
  theme?: string;
  customPresetColors?: string[];
  customFonts?: Record<string, string>;
  defaultColorSchemes?: Array<Array<Record<string, string> | null>>;
  libraries?: string[];
  enabledLibraries?: string[];
  defaultLibraries?: string;
  plugins?: string[];
  [key: string]: any;
}

interface DrawioMessage {
  event: string;
  xml?: string;
  data?: string;
  message?: string;
  exit?: boolean;
  modified?: boolean;
  name?: string;
  error?: string;
  [key: string]: any;
}

interface DrawioAction {
  action: string;
  xml?: string;
  xmlpng?: string;
  format?: string;
  config?: DrawioConfig;
  exit?: boolean;
  spinKey?: string;
  message?: string;
  modified?: boolean;
  [key: string]: any;
}

interface SaveEventData {
  xml: string;
  data: string;
  timestamp?: number;
}

// Define props with TypeScript interfaces
interface Props {
  initialData?: string;
  config?: DrawioConfig;
  autosave?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialData: '',
  autosave: false,
  config: () => ({
    ui: 'dark',
    theme: 'sketch',
    defaultFonts: ['Helvetica', 'Arial', 'Source Sans Pro', 'Roboto'],
    customPresetColors: ['#33658A', '#86BBD8', '#2F4858', '#F6AE2D', '#F26419'],
    plugins: ['text;dropcursor;trello;whiteboard'],
    libraries: ['general', 'flowchart', 'uml', 'er', 'bpmn', 'mockups', 'arrows2']
  })
})

const emit = defineEmits<{
  (e: 'save', data: SaveEventData): void;
  (e: 'exit'): void;
  (e: 'error', error: string): void;
  (e: 'statusChange', status: { modified: boolean }): void;
}>()

// Refs with proper typing
const drawioFrameRef = ref<HTMLIFrameElement | null>(null)
const diagramXml = ref<string>(props.initialData || '')
const drawioUrl = ref<string>('https://embed.diagrams.net/?embed=1&proto=json&spin=1&configure=1&libraries=1')
const isLoaded = ref<boolean>(false)
const isModified = ref<boolean>(false)
const lastSaved = ref<number | null>(null)
const autoSaveInterval = ref<number | null>(null)

// Setup message listener when component is mounted
onMounted(() => {
  window.addEventListener('message', handleDrawioMessage)
  
  // Set up autosave if enabled
  if (props.autosave) {
    autoSaveInterval.value = window.setInterval(() => {
      if (isModified.value) {
        saveCurrentDiagram()
      }
    }, 30000) // Autosave every 30 seconds if modified
  }
})

// Clean up event listeners before component is unmounted
onBeforeUnmount(() => {
  window.removeEventListener('message', handleDrawioMessage)
  
  // Clear autosave interval
  if (autoSaveInterval.value) {
    clearInterval(autoSaveInterval.value)
  }
})

// Watch for changes to initialData prop
watch(() => props.initialData, (newValue: string) => {
  if (newValue && newValue !== diagramXml.value) {
    diagramXml.value = newValue
    loadDiagram(newValue)
  }
})

// Methods
const onFrameLoad = (): void => {
  // Frame is loaded
  console.log('draw.io iframe loaded')
  isLoaded.value = true
}

const handleDrawioMessage = (event: MessageEvent): void => {
  // Make sure the message is from draw.io
  if (event.data && drawioFrameRef.value && event.source === drawioFrameRef.value.contentWindow) {
    try {
      const msg = JSON.parse(event.data) as DrawioMessage
      
      switch (msg.event) {
        case 'configure':
          // Configure the editor appearance and behavior
          sendMessage({
            action: 'configure',
            config: props.config
          })
          break
        
        case 'init':
          // Editor is initialized, load a diagram if available
          if (diagramXml.value) {
            sendMessage({
              action: 'load',
              xml: diagramXml.value
            })
          }
          break
        
        case 'save':
          // User clicked save, export the diagram
          sendMessage({
            action: 'export',
            format: 'xmlsvg' // or 'xml', 'png', etc.
          })
          break
        
        case 'export':
          // Handle the exported data
          if (msg.xml && msg.data) {
            const saveData: SaveEventData = {
              xml: msg.xml,
              data: msg.data,
              timestamp: Date.now()
            }
            
            emit('save', saveData)
            
            // Update local state
            diagramXml.value = msg.xml
            lastSaved.value = saveData.timestamp ? saveData.timestamp : new Date().getTime()
            isModified.value = false
          }
          break
          
        case 'exit':
          // Handle exit event if needed
          emit('exit')
          break
          
        case 'status':
          // Track modification status
          if (msg.modified !== undefined) {
            isModified.value = msg.modified
            emit('statusChange', { modified: msg.modified })
          }
          break
          
        case 'error':
          // Handle errors
          if (msg.message) {
            console.error('draw.io error:', msg.message)
            emit('error', msg.message)
          }
          break
      }
    } catch (e) {
      console.error('Error handling draw.io message:', e)
    }
  }
}

const sendMessage = (message: DrawioAction): void => {
  // Send a message to the draw.io iframe
  if (drawioFrameRef.value && drawioFrameRef.value.contentWindow) {
    drawioFrameRef.value.contentWindow.postMessage(JSON.stringify(message), '*')
  }
}

// Format date for display
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Exposed methods that can be called using template refs
const loadDiagram = (xmlData: string): void => {
  diagramXml.value = xmlData
  sendMessage({
    action: 'load',
    xml: xmlData
  })
}

const saveCurrentDiagram = (): void => {
  sendMessage({
    action: 'export',
    format: 'xmlsvg'
  })
}

const exportAsPng = (): void => {
  sendMessage({
    action: 'export',
    format: 'xmlpng'
  })
}

const resetDiagram = (): void => {
  if (confirm('Are you sure you want to reset the diagram? This action cannot be undone.')) {
    // Create a blank diagram
    const blankDiagram = '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>'
    loadDiagram(blankDiagram)
  }
}

// Expose methods to parent components
defineExpose({
  loadDiagram,
  exportDiagram: exportAsPng,
  saveCurrentDiagram,
  resetDiagram
})
</script>

<style scoped>
.scale-98 {
  transform: scale(0.98);
}

.diagram-container {
  position: relative;
}
</style>