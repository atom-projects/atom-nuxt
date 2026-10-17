<script setup lang="ts">
const { t } = useLocale();

const { safeUrl } = useApi();

const { session, avatar } = useSession();

const backdrop = computed(
  () =>
    safeUrl(session.bootstrap.assets?.me_backdrop) ||
    "/assets/images/atom/kasja_mepage_image.png",
);
</script>

<template>
  <section
    v-if="session.user"
    class="relative flex h-[180px] items-center justify-between overflow-hidden rounded bg-black/30 bg-blend-multiply px-10"
    :style="{ backgroundImage: `url('${backdrop}')` }"
  >
    <NuxtLink
      class="absolute -bottom-12 left-0 transition duration-300 ease-in-out [filter:drop-shadow(2px_1px_0_#fff)_drop-shadow(-2px_1px_0_#fff)_drop-shadow(0_-2px_0_#fff)] hover:scale-105 [&_img]:[image-rendering:pixelated]"
      :to="`/home/${session.user.username}`"
    >
      <img
        :src="avatar(session.user, { size: 'l', action: 'wav' })"
        :alt="session.user.username"
      />
    </NuxtLink>

    <NuxtLink
      class="relative ml-auto rounded-full bg-white/90 px-6 py-2 text-lg font-semibold text-black transition duration-300 ease-in-out hover:bg-white hover:text-black dark:bg-gray-900 dark:text-white dark:hover:text-white"
      to="/game/nitro"
    >
      {{ t("Go to :hotel", { hotel: session.bootstrap.hotel_name }) }}
    </NuxtLink>

    <ClientAirLaunchButton
      class="relative ml-3 rounded-full bg-white/90 px-6 py-2 text-lg font-semibold text-black transition duration-300 ease-in-out hover:bg-white hover:text-black disabled:opacity-60 dark:bg-gray-900 dark:text-white dark:hover:text-white"
    />
  </section>
</template>
