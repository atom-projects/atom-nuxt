<script setup lang="ts">
defineProps<{
  busy: boolean;
  fullscreen: boolean;
  onlineCount: number;
  flashRequested: boolean;
}>();

const emit = defineEmits<{ reload: []; fullscreen: [] }>();

const { t } = useLocale();
</script>

<template>
  <nav
    class="client-toolbar absolute top-[calc(1rem+env(safe-area-inset-top))] left-[calc(1rem+env(safe-area-inset-left))] z-10 flex gap-2"
    :aria-label="t('Game controls')"
  >
    <NuxtLink
      class="flex items-center justify-center gap-1 rounded border-2 border-[#cf9d15] bg-[#eeb425] px-2 py-1 text-sm font-normal text-white transition-colors duration-150 ease-in-out hover:bg-[#e3aa1e] hover:text-white hover:filter-none [&_svg]:size-5"
      to="/user/me"
      :aria-label="t('Back to website')"
      :title="t('Back to website')"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.69Z"
        />

        <path
          d="M12 5.432 20.159 13.591c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.43Z"
        />
      </svg>
    </NuxtLink>

    <button
      v-if="!flashRequested"
      class="flex items-center justify-center gap-1 rounded border-2 border-[#cf9d15] bg-[#eeb425] px-2 py-1 text-sm font-normal text-white transition-colors duration-150 ease-in-out hover:bg-[#e3aa1e] hover:text-white hover:filter-none [&_svg]:size-5"
      :disabled="busy"
      :aria-label="t('Reload client')"
      :title="t('Reload client')"
      @click="emit('reload')"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    </button>

    <button
      class="flex items-center justify-center gap-1 rounded border-2 border-[#cf9d15] bg-[#eeb425] px-2 py-1 text-sm font-normal text-white transition-colors duration-150 ease-in-out hover:bg-[#e3aa1e] hover:text-white hover:filter-none [&_svg]:size-5"
      :disabled="busy"
      :aria-pressed="fullscreen"
      :aria-label="t('Toggle fullscreen')"
      :title="t('Toggle fullscreen')"
      @click="emit('fullscreen')"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
        />
      </svg>
    </button>

    <span
      class="flex items-center justify-center gap-1 rounded border-2 border-[#cf9d15] bg-[#eeb425] px-2 py-1 text-sm font-normal text-white transition-colors duration-150 ease-in-out hover:bg-[#e3aa1e] hover:text-white hover:filter-none [&_svg]:size-5 cursor-default [&_svg]:size-4!"
      :aria-label="`${onlineCount} ${t('online')}`"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
          clip-rule="evenodd"
        />
      </svg>

      <span>{{ onlineCount }}</span>
    </span>
  </nav>
</template>

<style scoped>
/* Phones get the hotel's own touch HUD; these buttons would cover it. */
@media (pointer: coarse) and (max-width: 599px), (pointer: coarse) and (max-height: 599px) {
  .client-toolbar {
    display: none;
  }
}
</style>
