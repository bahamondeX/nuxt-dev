<script setup lang="ts">
const ui = useUiState();
const play = usePlaygroundStore();
const guide = useGuideStore();
const runtime = useRuntimeConfig();
const commands = useCommandsStore();

const buildTime = new Date(runtime.public.buildTime);
const timeAgo = useTimeAgo(buildTime);

function downloadCurrentGuide() {
  if (!play.webcontainer) throw new Error("No webcontainer found");

  if (play.status !== "ready") throw new Error("Playground is not ready");

  if (!guide.features.download)
    throw new Error(
      `Download feature is disabled for guide ${guide.currentGuide}`,
    );

  downloadZip(play.webcontainer, guide.ignoredFiles);
}

const i18n = useI18n();

addCommands(
  {
    id: "download-zip",
    title: () => $t("download-zip"),
    visible: () => play.status === "ready" && guide.features.download !== false,
    handler: downloadCurrentGuide,
    icon: "i-ph-download-duotone",
  },
  {
    id: "toggle-terminal",
    title: () => $t("terminal.toggle"),
    handler: () => {
      ui.toggleTerminal();
    },
    icon: "i-ph-terminal-window-duotone",
  },
  {
    id: "language-en",
    title: "Change to English",
    handler: () => i18n.setLocale("en"),
    icon: "i-ph-globe-duotone",
    visible: () => i18n.locale.value !== "en",
  },
  {
    id: "language-es",
    title: "Cambiar a Español",
    handler: () => i18n.setLocale("es"),
    icon: "i-ph-globe-duotone",
    visible: () => i18n.locale.value !== "es",
  },
  {
    id: "language-ja",
    title: "日本語に切り替える",
    handler: () => i18n.setLocale("ja"),
    icon: "i-ph-globe-duotone",
    visible: () => i18n.locale.value !== "ja",
  },
);
</script>

<template>
  <nav px4 py3 text-lg border="b base" flex="~ gap-1 items-center">
    <NuxtLink to="/" title="Nuxt Dev">
      <span class="flex flex-row items-center gap-2 text-green text-2xl"
        ><img src="/favicon.ico" /> Nuxt Dev</span
      >
    </NuxtLink>

    <div flex-auto />
    <div
      flex="~ gap-1 items-center"
      :class="guide.embeddedDocs ? 'z-embedded-docs-raised' : ''"
    >
      <VDropdown :distance="6">
        <button rounded p2 hover="bg-active" title="Languages">
          <div i-ph-translate-duotone text-2xl />
        </button>
        <template #popper>
          <div flex="~ col gap-y-1" p2>
            <button
              v-for="locale of i18n.locales.value"
              :key="locale.code"
              rounded
              px2
              py1
              hover="bg-active"
              :class="locale.code === i18n.locale.value ? 'text-primary' : ''"
              @click="i18n.setLocale(locale.code)"
            >
              {{ locale.name }}
            </button>
          </div>
        </template>
      </VDropdown>
      <button
        rounded
        p2
        hover="bg-active"
        :title="$t('editor.toggle')"
        @click="ui.toggleEditorPreview()"
      >
        <div i-ph-code-duotone text-2xl />
      </button>
      <button
        rounded
        p2
        hover="bg-active"
        :title="$t('search')"
        @click="commands.isShown = true"
      >
        <div i-ph-magnifying-glass-duotone text-2xl />
      </button>
      <button
        v-if="play.status === 'ready' && !!guide.features.download"
        rounded
        p2
        hover="bg-active"
        :title="$t('download-zip')"
        @click="downloadCurrentGuide()"
      >
        <div i-ph-download-duotone text-2xl />
      </button>
      <VDropdown :distance="6">
        <button rounded p2 hover="bg-active" title="Playground Information">
          <div i-ph-info-duotone text-2xl />
        </button>
        <template #popper>
          <div
            px5
            py4
            grid="~ gap-y-3 gap-x-2 cols-[max-content_1fr] items-center"
          >
            <div i-ph-package-duotone text-xl />
            <NuxtLink
              :to="`${runtime.public.repoUrl}/commit/${runtime.public.gitSha}`"
              target="_blank"
              title="View on GitHub"
            >
              <time
                :datetime="buildTime.toISOString()"
                :title="buildTime.toLocaleString()"
              >
                <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
                {{ $t("built") }} {{ timeAgo }} (<code>{{
                  runtime.public.gitSha.slice(0, 5)
                }}</code
                >)
              </time>
            </NuxtLink>
          </div>
        </template>
      </VDropdown>
      <button
        rounded
        p2
        :title="$t('terminal.toggle')"
        hover="bg-active"
        :class="ui.showTerminal ? '' : 'op50'"
        @click="ui.toggleTerminal()"
      >
        <div i-ph-terminal-window-duotone text-2xl />
      </button>
      <ColorSchemeToggle />
      <NuxtLink
        rounded
        p2
        title="GitHub"
        hover="bg-active"
        :href="runtime.public.repoUrl"
        target="_blank"
      >
        <div i-carbon-logo-github text-2xl />
      </NuxtLink>
    </div>
  </nav>
</template>
