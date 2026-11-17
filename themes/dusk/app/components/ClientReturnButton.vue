<script setup lang="ts">
const { t } = useLocale();

const { session } = useSession();
</script>

<template>
  <NuxtLink
    class="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded border-2 border-yellow-300 bg-yellow-500 px-5 py-3 font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:text-white"
    to="/game/nitro"
  >
    <span class="relative flex size-3" aria-hidden="true">
      <span
        class="absolute inline-flex size-full animate-ping rounded-full bg-green-300 opacity-75"
      ></span>

      <span class="relative inline-flex size-3 rounded-full bg-green-500"></span>
    </span>

    {{ t("Return to :hotel", { hotel: session.bootstrap.hotel_name }) }}
  </NuxtLink>
</template>
