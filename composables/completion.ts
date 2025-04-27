import { client } from "./client";

export const useCompletion = () => {
  const prompt = ref<string>(
    "Generate a complete Vue.js component that builds upon my code snippet. Focus exclusively on writing clean, functional code using Vue 3 composition API with <script setup lang='ts'> syntax. Include proper Tailwind CSS styling that resembles shadcn UI aesthetics.\nImportant requirements:\n\nOnly output the code that completes my component\nDo not repeat code I've already written\nUse TypeScript with proper typing\nInclude well-structured template markup\nWrite optimized logic with composition API patterns\nDo not include code fence markers in your response",
  );
  async function run(input: string, callback: (data: string) => any) {
    const response = await client.chat.completions.create({
      model: "claude-3-7-sonnet-20250219",
      messages: [
        { role: "user", content: prompt.value },
        { role: "user", content: input },
      ],
      stream: true,
      max_tokens: 32768,
    });
    for await (const chunk of response) {
      const content = chunk.choices[0].delta.content;
      if (content) {
        callback(content);
      }
    }
  }
  return { prompt, run };
};
