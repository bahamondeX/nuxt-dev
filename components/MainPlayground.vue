x<!--
Please create an issue first before submiting PRs.
So that we can discuss about the directions and plans, to avoid wasted efforts. Thank you!
-->

<script setup lang="ts">
import { Pane, Splitpanes } from "splitpanes";

const ui = useUiState();

const chunk = ref("")


async function handleSend(data: string) {
  chunk.value += data;
}

</script>

<template>
  <Splitpanes h-full max-w-0.5 horizontal of-hidden>
    <PanelSplitter />
    <Pane>
      <Splitpanes
        vertical
        relative
        max-h-full
        of-auto
        w-full
      >
        <Pane>
          <PanelEditor />
        </Pane>
        <PanelSplitter />
        <Pane>
          <PanelPreview />
        </Pane>
      </Splitpanes>
    </Pane>
    <PanelSplitter />
    <Pane v-if="ui.showTerminal">
      <PanelTerminal />
    </Pane>
    <Pane v-else of-auto> 
      <ChatBot @send="handleSend" />
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
