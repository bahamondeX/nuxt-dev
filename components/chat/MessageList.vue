<script setup lang="ts">
import type { Message } from "~/types";
import { Icon } from "@iconify/vue"

const props = defineProps<{
  messages: Message[];
}>();

const messageListRef = ref<HTMLDivElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

watch(
  () => props.messages.length,
  () => {
    scrollToBottom();
  },
);

onMounted(() => {
  scrollToBottom();
});

const groupedMessages = computed(() => {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = "";
  let currentGroup: Message[] = [];

  props.messages.forEach((message) => {
    const messageDate = new Date(message.ts).toLocaleDateString();

    if (messageDate !== currentDate) {
      if (currentGroup.length > 0) {
        groups.push({
          date: currentDate,
          messages: [...currentGroup],
        });
      }
      currentDate = messageDate;
      currentGroup = [message];
    } else {
      currentGroup.push(message);
    }
  });

  if (currentGroup.length > 0) {
    groups.push({
      date: currentDate,
      messages: currentGroup,
    });
  }

  return groups;
});

const isConsecutive = (index: number, messages: Message[]) => {
  if (index === 0) return false;
  return messages[index].role === messages[index - 1].role;
};

</script>

<template>
  <div
    ref="messageListRef"
    class="flex flex-col w-full overflow-y-auto px-4 py-2 scroll-smooth mb-12"
  >
    <!-- Empty state -->
    <div
      v-if="messages.length === 0"
      class="flex flex-col items-center justify-center h-full text-gray-400"
    >
      <div class="w-16 h-16 mb-4 opacity-50">
        <Icon icon="mdi:message" />
      </div>
      <p class="text-lg font-medium">No messages yet</p>
      <p class="text-sm">Start a conversation to begin chatting</p>
    </div>

    <!-- Message groups -->
    <div
      v-for="(group, groupIndex) in groupedMessages"
      :key="`group-${groupIndex}`"
      class="mb-4"
    >
      <!-- Date separator -->
      <div class="flex justify-center my-4">
        <div class="px-4 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
          {{
            new Date(group.date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })
          }}
        </div>
      </div>

      <!-- Messages -->
      <div v-for="(message, index) in group.messages" :key="message.id">
        <ChatMessage
          v-if="message.role !== 'system'"
          :message="message"
          :class="{
            'mt-1': isConsecutive(index, group.messages),
            'mt-4': !isConsecutive(index, group.messages),
          }"
        />
      </div>
    </div>

    <!-- Scroll to bottom button that appears when not at bottom -->
    <button
      v-if="messages.length > 5"
      class="absolute bottom-24 right-8 p-2 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
      @click="scrollToBottom"
    >
      <Icon icon="mdi:chevron-down" />
    </button>
  </div>
</template>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}

/* Hide scrollbar for IE, Edge and Firefox */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}
</style>
