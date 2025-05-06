<script setup lang="ts">
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

const props = defineProps({
  content: {
    type: String,
    default: "" as string,
  },
});

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (error) {
        console.error("Highlight error:", error);
      }
    }
    return (
      '<pre><code class="hljs">' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  },
});

// Copy functionality
const copied = ref(false);
const copyTimeout = ref<NodeJS.Timeout | null>(null);

const copyToClipboard = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const preElement = target.closest(".code-wrapper")?.querySelector("pre");

  if (preElement) {
    const code = preElement.textContent || "";
    navigator.clipboard.writeText(code).then(() => {
      copied.value = true;

      if (copyTimeout.value) {
        clearTimeout(copyTimeout.value);
      }

      copyTimeout.value = setTimeout(() => {
        copied.value = false;
      }, 2000);
    });
  }
};

// Process content to wrap code blocks with copy button
const renderedContent = computed(() => {
  const rendered = md.render(props.content);

  // Add copy button to code blocks
  return rendered.replace(
    /<pre><code class="hljs(.*?)">([\s\S]*?)<\/code><\/pre>/g,
    '<div class="code-wrapper relative group"><pre><code class="hljs$1">$2</code></pre><button class="copy-btn" title="Copy code">📋</button></div>',
  );
});
</script>

<template>
  <div
    class="markdown-body bg-gray-500 dark:bg-gray-800 rounded-lg shadow-md max-w-lg p-4 text-sm text-black"
    v-html="renderedContent"
  ></div>
</template>

<style scoped lang="scss">
@import url("https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/github-markdown.min.css");
@import url("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/github-dark.min.css");
@import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap&family=Open+Sans:wght@400;600;700&display=swap&family=DM+Mono:wght@400;500;600;700&display=swap&family=Roboto+Mono:wght@400;500;600;700&display=swap&family=Merriweather:wght@400;500;600;700&display=swap");

.markdown-body {
  color: #24292e;
  font-family: "Open Sans", sans-serif;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: "Merriweather", serif;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }

  code {
    font-family: "Roboto Mono", monospace;
  }

  img {
    max-width: 8rem !important;
    border-radius: 4px;
  }

  pre {
    line-height: 1.35;
    border-radius: 6px;
    padding: 16px;
    margin: 16px 0;
    overflow: auto;
  }

  a {
    color: green;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  blockquote {
    border-left: 4px solid #dfe2e5;
    padding: 0 1em;
    color: #6a737d;
  }
}

:deep(.code-wrapper) {
  position: relative;

  .copy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.2s;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  &:hover .copy-btn {
    opacity: 1;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .markdown-body {
    color: #e6e6e6;

    a {
      color: green;
    }

    blockquote {
      border-left-color: #4b5563;
      color: #9ca3af;
    }
  }
}
</style>

<script lang="ts">
// Client-side only code for copy functionality
export default {
  mounted() {
    // Add event listeners for copy buttons
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", (event) =>
        this.copyToClipboard(event as MouseEvent),
      );
    });
  },

  beforeUnmount() {
    // Clean up event listeners
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.removeEventListener("click", (event) =>
        this.copyToClipboard(event as MouseEvent),
      );
    });
  },

  methods: {
    copyToClipboard(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const preElement = target?.closest(".code-wrapper")?.querySelector("pre");
      if (preElement) {
        const code = preElement.textContent || "";
        navigator.clipboard.writeText(code);

        // Show copied feedback
        const originalText =
          event.target instanceof HTMLElement ? event.target.textContent : "";
        if (event.target instanceof HTMLElement) {
          event.target.textContent = "✓";
          event.target.style.background = "rgba(46, 160, 67, 0.4)";
        }

        setTimeout(() => {
          (event.target as HTMLElement).textContent = originalText;
          (event.target as HTMLElement).style.background =
            "rgba(255, 255, 255, 0.1)";
        }, 2000);
      }
    },
  },
};
</script>
