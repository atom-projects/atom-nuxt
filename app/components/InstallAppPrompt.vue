<script setup lang="ts">
const props = defineProps<{ placement: "page" | "game" | "page-raised" }>();

const { t } = useLocale();

const { session } = useSession();

const { platform, visible, iPad, shareInMoreMenu, dismiss, install } =
  useInstallApp();

const guideOpen = ref(false);

const linkCopied = ref(false);

const closeButton = useTemplateRef<HTMLButtonElement>("closeButton");

const hotel = computed(() => session.bootstrap.hotel_name || t("the hotel"));

const iPhone = computed(() => platform.value !== "android" && !iPad.value);

// Safari's own toolbar is right below the page on iPhone and at the top on iPad.
const arrow = computed(() => {
  if (platform.value !== "ios-safari") {
    return "";
  }

  if (iPad.value) {
    return "top";
  }

  return shareInMoreMenu.value ? "bottom-left" : "bottom";
});

const positions = {
  page: "bottom-[calc(1rem+env(safe-area-inset-bottom))]",
  "page-raised": "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]",
  game: "top-[calc(0.5rem+env(safe-area-inset-top))]",
};

async function openGuide() {
  guideOpen.value = true;

  await nextTick();

  closeButton.value?.focus();
}

function finish() {
  guideOpen.value = false;

  dismiss();
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);

    linkCopied.value = true;
  } catch {
    linkCopied.value = false;
  }
}
</script>

<template>
  <div
    v-if="visible && !guideOpen"
    class="fixed inset-x-3 z-[90] mx-auto flex max-w-md items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2.5 text-[var(--text)] shadow-[0_8px_24px_rgb(0_0_0/0.35)]"
    :class="positions[props.placement]"
    role="region"
    :aria-label="t('Install the app')"
  >
    <img
      src="/pwa/apple-touch-icon.png"
      alt=""
      class="size-11 shrink-0 rounded-[10px]"
      width="44"
      height="44"
    />

    <div class="min-w-0 flex-1 leading-tight">
      <p class="line-clamp-2 text-sm font-bold">
        {{ t("Play :hotel as an app", { hotel }) }}
      </p>

      <p class="line-clamp-2 text-xs text-[var(--muted)]">
        {{ t("Full screen, one tap from your Home Screen.") }}
      </p>
    </div>

    <button
      class="min-h-11 shrink-0 whitespace-nowrap rounded-md border-2 border-[var(--accent-border)] bg-[var(--accent)] px-3 py-1 text-sm font-bold text-white hover:brightness-110"
      @click="platform === 'android' ? install() : openGuide()"
    >
      {{ platform === "android" ? t("Install") : t("Show me how") }}
    </button>

    <button
      class="size-11 shrink-0 rounded-md border-0 bg-transparent p-0 text-[var(--muted)] hover:text-[var(--text)] hover:brightness-100 [&_svg]:size-5"
      :aria-label="t('Not now')"
      :title="t('Not now')"
      @click="dismiss"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
  </div>

  <div
    v-if="visible && guideOpen"
    class="fixed inset-0 z-[95] bg-black/60"
    @click.self="guideOpen = false"
    @keydown.esc="guideOpen = false"
  >
    <section
      class="absolute flex max-h-[calc(100dvh-6rem)] flex-col overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] pb-4 text-[var(--text)] shadow-[0_12px_32px_rgb(0_0_0/0.45)]"
      :class="
        iPhone
          ? 'inset-x-3 bottom-[calc(3.75rem+env(safe-area-inset-bottom))]'
          : 'top-[calc(4rem+env(safe-area-inset-top))] right-4 w-[min(380px,calc(100vw-2rem))]'
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-guide-title"
    >
      <header
        class="flex items-center gap-3 bg-[var(--header)] px-4 py-3 [&_h2]:text-base [&_h2]:font-bold"
      >
        <img
          src="/pwa/apple-touch-icon.png"
          alt=""
          class="size-10 shrink-0 rounded-[9px]"
          width="40"
          height="40"
        />

        <h2 id="install-guide-title" class="flex-1">
          {{ t("Add :hotel to your Home Screen", { hotel }) }}
        </h2>

        <button
          ref="closeButton"
          class="size-11 shrink-0 rounded-md border-0 bg-transparent p-0 text-[var(--muted)] hover:text-[var(--text)] hover:brightness-100 [&_svg]:size-5"
          :aria-label="t('Close')"
          @click="guideOpen = false"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </header>

      <div v-if="platform === 'ios-in-app'" class="grid gap-3 px-4 pt-4 text-sm">
        <p>
          {{
            t(
              "This in-app browser cannot add apps to your Home Screen. Open this page in Safari, then tap Show me how again.",
            )
          }}
        </p>

        <p class="text-[var(--muted)]">
          {{
            t(
              "Tip: tap the menu of this app and choose Open in Safari, or copy the link and paste it in Safari.",
            )
          }}
        </p>

        <button
          class="min-h-11 rounded-md border-2 border-[#cf9d15] bg-[#eeb425] px-4 font-bold text-white hover:bg-[#e3aa1e]"
          @click="copyLink"
        >
          {{ linkCopied ? t("Link copied") : t("Copy link") }}
        </button>
      </div>

      <ol
        v-else
        class="grid gap-3 px-4 pt-4 text-sm [&_li]:flex [&_li]:items-center [&_li]:gap-3 [&_svg]:inline [&_svg]:size-6 [&_svg]:align-middle [&_svg]:text-[#0a84ff]"
      >
        <li>
          <span
            class="grid size-7 shrink-0 place-items-center rounded-full bg-[#eeb425] text-sm font-bold text-white"
            >1</span
          >

          <span v-if="platform === 'ios-browser'">
            {{ t("Tap the Share button") }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" :aria-label="t('Share')" role="img">
              <path d="M12 3v12M8 7l4-4 4 4" />
              <path d="M8.5 10H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1.5" />
            </svg>
            {{ t("in the address bar.") }}
          </span>

          <span v-else-if="shareInMoreMenu && !iPad">
            {{ t("Tap the menu button") }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" :aria-label="t('Menu')" role="img">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            {{ t("on the left of the address bar, then tap Share") }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" :aria-label="t('Share')" role="img">
              <path d="M12 3v12M8 7l4-4 4 4" />
              <path d="M8.5 10H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1.5" />
            </svg>
          </span>

          <span v-else>
            {{ t("Tap the Share button") }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" :aria-label="t('Share')" role="img">
              <path d="M12 3v12M8 7l4-4 4 4" />
              <path d="M8.5 10H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1.5" />
            </svg>
            {{
              iPad
                ? t("at the top of the screen.")
                : t("in the toolbar at the bottom of the screen.")
            }}
          </span>
        </li>

        <li>
          <span
            class="grid size-7 shrink-0 place-items-center rounded-full bg-[#eeb425] text-sm font-bold text-white"
            >2</span
          >

          <span>
            {{ t("Scroll down and choose") }}
            <strong class="whitespace-nowrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="4" />
                <path d="M12 8.5v7M8.5 12h7" />
              </svg>
              {{ t("Add to Home Screen") }}</strong
            >.
          </span>
        </li>

        <li>
          <span
            class="grid size-7 shrink-0 place-items-center rounded-full bg-[#eeb425] text-sm font-bold text-white"
            >3</span
          >

          <span>
            {{ t("Tap") }} <strong>{{ t("Add") }}</strong>.
            {{ t(":hotel now opens full screen from your Home Screen.", { hotel }) }}
          </span>
        </li>

        <li v-if="platform === 'ios-browser'" class="text-[var(--muted)]">
          {{
            t(
              "Don't see Add to Home Screen? Update iOS to 16.4 or newer, or open this page in Safari.",
            )
          }}
        </li>
      </ol>

      <div class="px-4 pt-4">
        <button
          class="min-h-11 w-full rounded-md border-2 border-[var(--accent-border)] bg-[var(--accent)] font-bold text-white"
          @click="finish"
        >
          {{ t("Got it") }}
        </button>
      </div>
    </section>

    <div
      v-if="arrow"
      class="pointer-events-none absolute animate-bounce text-[#eeb425] drop-shadow-[0_2px_0_rgb(0_0_0/0.6)] [&_svg]:size-10"
      :class="{
        'bottom-[calc(0.25rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2':
          arrow === 'bottom',
        'bottom-[calc(0.25rem+env(safe-area-inset-bottom))] left-[28%] -translate-x-1/2':
          arrow === 'bottom-left',
        'right-6 bottom-[calc(0.25rem+env(safe-area-inset-bottom))]':
          arrow === 'bottom-right',
        'top-1 right-24 rotate-180': arrow === 'top',
      }"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 3h4v11h4.5L12 21l-6.5-7H10z" />
      </svg>
    </div>
  </div>
</template>
