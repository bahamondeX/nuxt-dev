import { client } from '#imports'
import { prompts } from '@/prompts'
import { type Message } from '~/types'
import { type FunctionParameters } from 'groq-sdk/resources/shared'
import { VirtualFile } from '~/structures/VirtualFile'
import { usePlaygroundStore } from '@/stores/playground'

const MODEL_ID = 'gemini-2.0-flash'

type CodeArgument = {
	type: 'component' | 'composable' | 'style' | 'edit'
	filePath: string
	context?: string
}

export function useChat() {
	const messages = ref<Message[]>([])
	const isLoading = ref(false)
	const play = usePlaygroundStore()

	const sendMessage = async (content: string, callback?: (chunk: string) => void) => {
		isLoading.value = true
		messages.value.push({ role: 'user', content })

		const chatStream = await client.chat.completions.create({
			model: MODEL_ID,
			messages: [
				{ role: 'system', content },
				...messages.value
			],
			stream: true,
			tools: [
				{
					type: 'function',
					function: {
						name: 'codeGeneration',
						description: 'Generates metadata to setup code Generation for Nuxt3 Environment',
						parameters: {
							type: 'object',
							properties: {
								filePath: {
									type: 'string',
									description: 'Path of the file to generate or modify.'
								},
								type: {
									type: 'string',
									enum: ['component', 'composable', 'styles', 'edit'],
									description: 'Type of code to generate.'
								},
								context: {
									type: 'string',
									nullable: true,
									description: 'Original code content if editing.'
								}
							},
							required: ['filePath', 'type']
						} as unknown as FunctionParameters
					}
				}
			],
			tool_choice: 'auto'
		})

		let fullContent = ''
		let isToolCall = false
		let toolCallData: any = null

		for await (const chunk of chatStream) {
			const delta = chunk.choices?.[0]?.delta

			if (delta?.tool_calls) {
				isToolCall = true
				toolCallData = delta.tool_calls[0]
				break
			}

			if (delta?.content) {
				fullContent += delta.content
				const lastMsg = messages.value[messages.value.length - 1]
				if (lastMsg?.role === 'assistant') {
					lastMsg.content += delta.content
				} else {
					messages.value.push({ role: 'assistant', content: delta.content })
				}
			}
		}

		if (isToolCall && toolCallData?.function) {
			const args = JSON.parse(toolCallData.function.arguments) as CodeArgument
			const systemPrompt = prompts[args.type] as Message
			const filePath = args.filePath

			const generationContext: Message[] = [systemPrompt]

			if (args.context && args.type === 'edit') {
				generationContext.push({ role: 'assistant', content: args.context })
			}

			generationContext.push({
				role: 'user',
				content: `Create or update: \`${filePath}\``
			})

			const toolStream = await client.chat.completions.create({
				model: MODEL_ID,
				messages: generationContext,
				stream: true
			})

			const dir = filePath.split('/').slice(0, -1).join('/')
			const hasDir = Array.from(play.files.keys()).some(key => key.startsWith(`${dir}/`))
			if (!hasDir && dir) {
				const dummy = new VirtualFile(`${dir}/.gitkeep`, '', play.webcontainer!)
				play.files.set(dummy.filepath, dummy)
			}

			const file = new VirtualFile(filePath, '', play.webcontainer!)
			play.files.set(file.filepath, file)

			let output = ''
			for await (const chunk of toolStream) {
				const content = chunk.choices?.[0]?.delta?.content
				if (!content) continue
				output += content
				callback?.(content)
				file.write(output)
			}
		}

		isLoading.value = false
	}

	return {
		messages,
		isLoading,
		sendMessage
	}
}