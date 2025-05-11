import MarkdownIt from 'markdown-it'
import { getSingletonHighlighter } from 'shiki'

let md: MarkdownIt

export async function useMarkdown() {
	const highlighter = await getSingletonHighlighter({
		themes: ['github-dark'],
		langs: ['ts', 'js', 'json', 'bash', 'html', 'vue', 'python']
	})

	if (!md) {
		md = new MarkdownIt({
			html: true,
			linkify: true,
			typographer: true,
			highlight(code, lang) {
				try {
					return highlighter.codeToHtml(code, { lang, theme: 'github-dark' })
				} catch {
					return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`
				}
			}
		})
	}

	return (markdown: string) => md.render(markdown)
}