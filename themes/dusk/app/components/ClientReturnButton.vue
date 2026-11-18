<script setup lang="ts">
const { t } = useLocale();

const { session } = useSession();
</script>

<template>
  <NuxtLink
    class="fixed right-6 bottom-6 z-50 flex items-center rounded border-2 border-yellow-300 bg-yellow-500 px-5 py-3 font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:text-white"
    to="/game/nitro"
  >
    {{ t("Return to :hotel", { hotel: session.bootstrap.hotel_name }) }}
  </NuxtLink>
</template>
