import { client } from '#imports'
import { prompts } from '@/prompts'
import { type Message } from '~/types'
import { type FunctionParameters } from 'groq-sdk/resources/shared'
import { VirtualFile } from '~/structures/VirtualFile'
import { usePlaygroundStore } from '@/stores/playground'

type CodeArgument = {
	type: 'component' | 'composable' | 'style' | 'edit'
	filePath: string
	context?: string
}

export function useChat() {
	const messages = ref<Message[]>([])
	const isLoading = ref(false)
	const play = usePlaygroundStore()

	const sendMessage = async (content: string, callback?:(chunk:string)=>void) => {
		isLoading.value = true
		messages.value.push({ role: 'user', content })

		const response = await client.chat.completions.create({
			model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
			messages: [
				{
					role: 'system',
					content
				},
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
									description: 'Ruta del archivo, por ejemplo: components/Foo.vue si es component, composables/foo.ts si es composable, styles/foo.css si es style y la ruta del archivo existente si es edit.'
								},
								type: {
									type: 'string',
									enum: ['component', 'composable', 'style', 'edit'],
									description: 'Tipo de contenido a generar'
								},
								context: {
									type: 'string',
									nullable: true,
									description: 'Contenido original si el tipo es "edit"'
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

		for await (const chunk of response) {
			const delta = chunk.choices?.[0]?.delta

			if (delta?.tool_calls) {
				isToolCall = true
				toolCallData = delta.tool_calls[0]
				break
			}

			if (delta?.content) {
				fullContent += delta.content
				if (messages.value[messages.value.length - 1]?.role === 'assistant') {
					messages.value[messages.value.length - 1].content += delta.content
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

			const toolResponse = await client.chat.completions.create({
				model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
				messages: generationContext,
				stream: true
			})

			// Crear carpeta si no existe
			const dir = filePath.split('/').slice(0, -1).join('/')
			const hasDir = Array.from(play.files.keys()).some(key => key.startsWith(`${dir}/`))
			if (!hasDir && dir) {
				const dummy = new VirtualFile(`${dir}/.gitkeep`, '', play.webcontainer!)
				play.files.set(dummy.filepath, dummy)
			}

			// Crear archivo y escribir progresivamente
			const file = new VirtualFile(filePath, '', play.webcontainer!)
			play.files.set(file.filepath, file)

			let output = ''
			for await (const chunk of toolResponse) {
				const content = chunk.choices?.[0]?.delta?.content
				if (!content) continue
				output += content
				callback ? callback(content) : null
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