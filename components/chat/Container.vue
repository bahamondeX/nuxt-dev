<script setup lang="ts">
import type { Message, Thread } from "~/types/chat";
import { client } from "#imports";
const messages = ref<Message[]>([]);
const threads = ref<Thread[]>([]);
const loading = ref<boolean>(false);
const emits = defineEmits(["send"])

const handleSend = async (content: string) => {
  loading.value = true;
	messages.value.push({role:"system",content:"You are `Nuxt Dev` a code generation agent, your goal is to generate renderable VueJS components with no further neither prior content, advice or comments. Backticks (```vue) syntax is not allowed. You must generate high quality Single File Components using script setup, composition API and typescript, you are not able to use external libraries, you must use only Vue, TailwindCSS, Iconify and Typescript.",id:crypto.randomUUID(),ts:new Date()})
  messages.value.push({
    id: crypto.randomUUID(),
    role: "user",
    content,
    ts: new Date(),
  });
	
  try {
    const response = await client.chat.completions.create({
      model: "claude-3-7-sonnet-20250219",
      messages: messages.value.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    const newMessage = {
      id: crypto.randomUUID(),
      role: "assistant" as "assistant" | "user",
      content: "",
      ts: new Date(),
    };
    messages.value.push(newMessage);

    for await (const chunk of response) {
      if (chunk.choices[0]?.delta?.content) {
				emits('send',chunk.choices[0]?.delta?.content)
        messages.value[messages.value.length - 1].content +=
          chunk.choices[0].delta.content;
      }
    }
  } catch (error) {
    console.error("Error in chat completion:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section
    class="flex flex-col items-start justify-center h-full overflow-auto shadow-xl"
  >
    <div class="flex flex-row items-center w-full">
      <ChatThreads :threads="threads" />
      <ChatMessageList :messages="messages" />
    </div>
    <ChatInputText @send="handleSend"  />
  </section>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 128, 0, 0.5); /* Transparent green */
  border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 128, 0, 0.7); /* Slightly less transparent on hover */
}

/* For Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 128, 0, 0.5) transparent;
}
</style>
