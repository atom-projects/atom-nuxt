<script setup lang="ts">
const { t } = useLocale();

const { session } = useSession();
</script>

<template>
  <NuxtLink
    class="fixed right-6 bottom-6 z-50 flex items-center rounded-full bg-white/95 px-6 py-3 text-lg font-semibold text-black shadow-lg ring-1 ring-black/10 transition duration-300 ease-in-out hover:scale-105 hover:bg-white hover:text-black dark:bg-gray-900 dark:text-white dark:ring-white/10 dark:hover:text-white"
    to="/game/nitro"
  >
    {{ t("Return to :hotel", { hotel: session.bootstrap.hotel_name }) }}
  </NuxtLink>
</template>
