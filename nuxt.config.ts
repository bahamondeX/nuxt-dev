import { execaSync } from "execa";

export default defineNuxtConfig({
  build: {
    analyze: false
  },
  modules: [
    "@vueuse/nuxt",
    "@unocss/nuxt",
    "@nuxtjs/seo",
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@pinia/nuxt",
    "floating-vue/nuxt",
    "@nuxtjs/i18n",
    "~/modules/template-loader",
    "~/modules/nuxt-link",
  ],
  devtools: {
    enabled: true,
  },
  app: {
    head: {
      titleTemplate: "%s - Nuxt Tutorial",
      htmlAttrs: {
        lang: "en-US",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  site: {
    url: "https://learn.nuxt.com",
  },
  colorMode: {
    classSuffix: "",
  },
  runtimeConfig: {
    public: {
      buildTime: Date.now(),
      gitSha: execaSync("git", ["rev-parse", "HEAD"]).stdout.trim(),
      repoUrl: "https://github.com/obahamondex/nuxt-dev.com",
    },
    app: {
      devtools: {
        iframeProps: {
          allow: "cross-origin-isolated",
          credentialless: true,
        },
      },
    },
  },

  features: {
    inlineStyles: false,
  },

  experimental: {
    watcher: "parcel",
  },

  compatibilityDate: "2024-04-03",
  nitro: {
    routeRules: {
      "/**": {
        headers: {
          "Cross-Origin-Embedder-Policy": "require-corp",
          "Cross-Origin-Opener-Policy": "same-origin",
        },
      },
    },
  },
  vite: {
    build: {
      minify: "esbuild",
      cssMinify: "esbuild",
    },
    server: {
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
    optimizeDeps: {
      include: [
        "monaco-editor/esm/vs/editor/editor.worker",
        "monaco-editor-core/esm/vs/editor/editor.worker",
        "typescript/lib/tsserverlibrary",
        "@vue/language-service",
        "@volar/monaco/worker",
        "typescript",
        "vscode-uri",
      ],
    },
  },
  typescript: {
    includeWorkspace: true,
    tsConfig: {
      include: ["../content/**/.template/**/*.ts"],
    },
  },

  i18n: {
    locales: [
      {
        name: "English",
        code: "en",
        file: "en.yaml",
      },
      {
        name: "日本語",
        code: "ja",
        file: "ja.yaml",
      },
      {
        name: "Español",
        code: "es",
        file: "es.yaml"

      }
    ],
    lazy: true,
    strategy: "prefix",
    defaultLocale: "en",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
    experimental: {
      autoImportTranslationFunctions: true,
    },
  }
});
