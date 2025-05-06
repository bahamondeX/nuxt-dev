x<!--
Please create an issue first before submiting PRs.
So that we can discuss about the directions and plans, to avoid wasted efforts. Thank you!
-->

<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";

const ui = useUiState();

function startDragging() {
  ui.isPanelDragging = true;
}

function endDraggingHorizontal(e: { size: number }[]) {
  ui.isPanelDragging = false;
  ui.panelEditor = e[0].size;
  ui.panelPreview = e[1].size;
}
</script>

<template>
  <Splitpanes h-full horizontal of-hidden>
    <PaneSplitter />
    <Pane>
      <Splitpanes
        vertical
        relative
        max-h-full
        of-auto
        w-full
        @resize="startDragging"
        @resized="endDraggingHorizontal"
      >
        <Pane>
          <PanelEditor />
        </Pane>
        <PaneSplitter />
        <Pane>
          <PanelPreview />
        </Pane>
      </Splitpanes>
    </Pane>
    <PaneSplitter />
    <Pane v-if="ui.showTerminal">
      <PanelTerminal />
    </Pane>
    <Pane v-else>
      <ChatContainer />
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
