<script setup lang="ts">
const { t } = useLocale();

const { session, avatar } = useSession();

const portrait = computed(() =>
  avatar(session.user, { size: "l", action: "wav" }),
);
</script>

<template>
  <section
    v-if="session.user"
    class="relative flex h-[250px] items-center overflow-hidden rounded-xl bg-gray-900/50 py-8 text-white lg:px-8"
  >
    <div class="block w-40 lg:hidden">
      <NuxtLink
        class="absolute bottom-2 -left-4 drop-shadow transition-transform duration-300 hover:scale-105"
        :to="`/home/${session.user.username}`"
      >
        <img
          :src="portrait"
          :alt="session.user.username"
          class="[image-rendering:pixelated]"
        />
      </NuxtLink>
    </div>

    <div class="z-10">
      <div
        class="relative hidden size-[200px] overflow-hidden rounded-full bg-[url(/assets/images/dusk/me_circle_image.png)] lg:block"
      >
        <NuxtLink
          class="absolute -bottom-12 left-8 drop-shadow transition-transform duration-300 hover:scale-105"
          :to="`/home/${session.user.username}`"
        >
          <img
            :src="portrait"
            :alt="session.user.username"
            class="max-w-none [image-rendering:pixelated]"
          />
        </NuxtLink>
      </div>
    </div>

    <div
      class="flex w-full flex-col justify-between self-start px-4 lg:flex-row"
    >
      <div class="flex flex-col gap-1 self-start py-2 lg:ml-2">
        <h1 class="text-3xl font-semibold leading-9">
          {{ t("Hey :username!", { username: session.user.username }) }}
        </h1>

        <p class="italic">{{ session.user.motto }}</p>
      </div>

      <div class="w-full self-start lg:ml-14 lg:w-64">
        <NuxtLink
          class="block w-full rounded border-2 border-yellow-300 bg-yellow-500 px-4 py-2 text-center text-white transition-transform duration-300 hover:scale-[1.02] hover:text-white"
          to="/game/nitro"
        >
          {{ t("Go to :hotel", { hotel: session.bootstrap.hotel_name }) }}
        </NuxtLink>

        <ClientAirLaunchButton
          class="mt-2 block w-full rounded border-2 border-white/40 bg-gray-900/60 px-4 py-2 text-center text-white transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
        />
      </div>
    </div>

    <MeBalances />
  </section>
</template>
