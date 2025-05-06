<script setup lang="ts">
import type { Thread } from "~/types";
import { Icon } from "@iconify/vue"

const props = defineProps<{
  threads: Thread[];
}>();

const emit = defineEmits(["select-thread"]);

const selectedThreadId = ref<string | null>(null);

const selectThread = (threadId: string) => {
  selectedThreadId.value = threadId;
  emit("select-thread", threadId);
};

// Format the timestamp nicely
const formatTime = (timestamp: Date) => {
  const now = new Date();
  const messageDate = new Date(timestamp);

  // If same day, show time
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // If within last 7 days, show day name
  const daysDiff = Math.floor(
    (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysDiff < 7) {
    return messageDate.toLocaleDateString([], { weekday: "short" });
  }

  // Otherwise show date
  return messageDate.toLocaleDateString([], { month: "short", day: "numeric" });
};

// Truncate long messages
const truncateMessage = (message: string, maxLength = 50) => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + "...";
};
</script>

<template>
  <section
    class="w-72 overflow-y-auto bg-gradient-to-br from-green-500 to-cyan-300 p-4 flex flex-col gap-3"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-500">Conversations</h2>
      <button
        class="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-colors shadow-md"
        title="New conversation"
      >
       <Icon icon="mdi:plus" />
      </button>
    </div>

    <!-- Thread list -->
    <div
      v-for="thread in threads"
      :key="thread.id"
      :class="[
        'bg-gray-900 bg-opacity-30 border border-gray-700 rounded-lg cursor-pointer hover:bg-opacity-40 transition-all shadow-lg',
        selectedThreadId === thread.id ? 'ring-2 ring-cyan-300' : '',
      ]"
      @click="selectThread(thread.id)"
    >
      <div class="p-3">
        <!-- Thread title -->
        <h3 class="text-lg font-bold text-white mb-2 truncate">
          {{ thread.title }}
        </h3>

        <!-- Last message preview -->
        <p class="text-gray-300 text-sm mb-3 line-clamp-2">
          {{
            truncateMessage(thread.messages[thread.messages.length - 1].content)
          }}
        </p>

        <!-- Footer with metadata -->
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span class="px-2 py-1 bg-gray-800 bg-opacity-70 rounded-md">
            {{ thread.messages.length }}
            {{ thread.messages.length === 1 ? "message" : "messages" }}
          </span>
          <span
            class="px-2 py-1 bg-cyan-800 bg-opacity-40 rounded-md flex items-center gap-1"
          >
           <Icon icon="mdi:clock" />
            {{ formatTime(thread.messages[thread.messages.length - 1].ts) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="threads.length === 0"
      class="flex flex-col items-center justify-center h-full text-gray-500"
    >
      <div class="w-16 h-16 mb-4 opacity-50">
        <Icon icon="mdi:message-" />
      </div>
      <p class="text-center">No conversations yet</p>
      <p class="text-sm text-center mt-2">Start a new chat to begin</p>
    </div>
  </section>
</template>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

/* Hide scrollbar for IE, Edge and Firefox */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

/* Hover animation */
@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 232, 249, 0.4);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(103, 232, 249, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 232, 249, 0);
  }
}

.ring-cyan-300 {
  animation: pulse-border 2s infinite;
}
</style>
