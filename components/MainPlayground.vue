<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";

const ui = useUiState();
const chunk = ref("");

async function handleSend(data: string) {
  chunk.value += data;
}
</script>

<template>
  <!-- Layout principal: vertical (arriba Chat+Editor/Preview, abajo Terminal) -->
  <Splitpanes horizontal h-full w-full of-hidden>
    
    <!-- Parte superior: Chat + Editor/Preview -->
    <Pane class="min-w-1/3">
      <Splitpanes vertical of-hidden>
        <!-- ChatBot a la izquierda (1/3 del ancho) -->
        <Pane>
          <ChatBot @send="handleSend" />
        </Pane>

        <!-- Editor o Preview a la derecha (2/3 del ancho) -->
        <Pane class="min-w-2/3">
          <PanelEditor v-if="ui.showEditor" />
          <PanelPreview v-else />
        </Pane>
      </Splitpanes>
    </Pane>

    <!-- Terminal en la parte inferior, ocupa todo el ancho -->
    <Pane v-if="ui.showTerminal">
      <PanelTerminal />
    </Pane>
  </Splitpanes>
</template>

<style>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-30vw);
  opacity: 0;
}
</style>