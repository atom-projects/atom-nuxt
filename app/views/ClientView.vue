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
  buttonsEnabled,
  toggleFullscreen,
  handleFrameLoad,
  reload,
} = useGameClient(frame);

const main = useTemplateRef<HTMLElement>("main");

// Follows the visible area so the on-screen keyboard shrinks the game instead of scrolling it away.
function fitVisualViewport() {
  const viewport = window.visualViewport;

  if (!viewport || !main.value || Math.abs(viewport.scale - 1) > 0.01) {
    return;
  }

  main.value.style.height = `${viewport.height}px`;

  main.value.style.top = `${viewport.offsetTop}px`;
}

onMounted(() => {
  fitVisualViewport();

  window.visualViewport?.addEventListener("resize", fitVisualViewport);

  window.visualViewport?.addEventListener("scroll", fitVisualViewport);
});

onBeforeUnmount(() => {
  window.visualViewport?.removeEventListener("resize", fitVisualViewport);

  window.visualViewport?.removeEventListener("scroll", fitVisualViewport);
});
</script>

<template>
  <main
    ref="main"
    class="fixed inset-x-0 top-0 h-dvh w-full touch-manipulation overflow-hidden overscroll-none"
    style="background-color: #0e151c"
  >
    <ClientToolbar
      v-if="buttonsEnabled"
      :busy="busy"
      :fullscreen="fullscreen"
      :online-count="onlineCount"
      :flash-requested="flashRequested"
      @reload="reload"
      @fullscreen="toggleFullscreen"
    />

    <div
      v-if="url"
      class="absolute inset-0 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]"
    >
      <iframe
        ref="frame"
        id="nitro"
        class="m-0 block size-full overflow-hidden rounded-none border-0 p-0"
        :src="url"
        :title="t('Hotel game client')"
        allow="fullscreen; autoplay; clipboard-read; clipboard-write; screen-wake-lock; web-share"
        referrerpolicy="no-referrer"
        @load="handleFrameLoad"
      ></iframe>
    </div>

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
