<script setup lang="ts">
const frame = useTemplateRef<HTMLIFrameElement>("frame");

const {
  t,
  busy,
  error,
  url,
  voteUrl,
  disconnected,
  fullscreen,
  onlineCount,
  flashRequested,
  toggleFullscreen,
  handleFrameLoad,
  reload,
} = useGameClient(frame);
</script>

<template>
  <main
    class="fixed inset-0 size-full overflow-hidden"
    style="background-color: #0e151c"
  >
    <ClientToolbar
      :busy="busy"
      :fullscreen="fullscreen"
      :online-count="onlineCount"
      :flash-requested="flashRequested"
      @reload="reload"
      @fullscreen="toggleFullscreen"
    />

    <iframe
      v-if="url"
      ref="frame"
      id="nitro"
      class="absolute inset-0 m-0 size-full overflow-hidden rounded-none border-0 p-0"
      :src="url"
      :title="t('Hotel game client')"
      allow="fullscreen; autoplay"
      referrerpolicy="no-referrer"
      @load="handleFrameLoad"
    ></iframe>

    <AppNotice :error="error" />

    <section
      v-if="flashRequested"
      class="flex h-full flex-col items-center justify-center gap-4 px-6 py-[72px] text-center [&_h2]:text-2xl"
    >
      <h2>{{ t("Flash client unavailable in this browser") }}</h2>

      <p>
        {{
          t(
            "This frontend supports the Nitro browser client. The legacy Flash client requires a separate supported Flash runtime.",
          )
        }}
      </p>

      <NuxtLink
        class="flex items-center justify-center gap-1 rounded border-2 border-[#cf9d15] bg-[#eeb425] px-2 py-1 text-sm font-normal text-white transition-colors duration-150 ease-in-out hover:bg-[#e3aa1e] hover:text-white hover:filter-none [&_svg]:size-5"
        to="/game/nitro"
      >
        {{ t("Open Nitro") }}
      </NuxtLink>
    </section>

    <section
      v-else-if="!url && !busy"
      class="flex h-full flex-col items-center justify-center gap-4 px-6 py-[72px] text-center [&_h2]:text-2xl"
    >
      <p>{{ error || t("The hotel client is not configured yet.") }}</p>

      <a
        v-if="voteUrl"
        class="flex items-center justify-center gap-1 rounded border-2 border-[#cf9d15] bg-[#eeb425] px-2 py-1 text-sm font-normal text-white transition-colors duration-150 ease-in-out hover:bg-[#e3aa1e] hover:text-white hover:filter-none [&_svg]:size-5"
        :href="voteUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ t("Vote for the hotel") }}
      </a>

      <button
        class="flex items-center justify-center gap-1 rounded border-2 border-[#cf9d15] bg-[#eeb425] px-2 py-1 text-sm font-normal text-white transition-colors duration-150 ease-in-out hover:bg-[#e3aa1e] hover:text-white hover:filter-none [&_svg]:size-5"
        @click="reload"
      >
        {{ t("Try again") }}
      </button>
    </section>

    <section
      v-if="disconnected"
      class="absolute inset-0 bg-black/50 [&_h2]:text-center [&_h2]:text-2xl [&_h2]:text-white"
      role="alert"
    >
      <div
        class="relative flex size-full flex-col items-center justify-center gap-4 [&>div]:flex [&>div]:gap-4"
      >
        <h2>{{ t("Whoops! It seems like you have been disconnected...") }}</h2>

        <div>
          <button
            :disabled="busy"
            class="flex items-center justify-center gap-1 rounded border-2 border-[#cf9d15] bg-[#eeb425] px-4 py-2 text-base font-normal text-white transition-colors duration-150 ease-in-out hover:bg-[#e3aa1e] hover:text-white hover:filter-none [&_svg]:size-5"
            @click="reload"
          >
            {{ t("Reload client") }}
          </button>

          <NuxtLink
            class="rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white hover:bg-green-700 hover:text-white"
            to="/user/me"
          >
            {{ t("Back to website") }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>
