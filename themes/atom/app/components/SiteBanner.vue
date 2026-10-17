<script setup lang="ts">
import LoginDialog from "./LoginDialog.vue";

const { t, session, hotel, logo, logoFailed, safeUrl } = useThemeShell();

const headerImage = computed(
  () =>
    safeUrl(session.bootstrap.assets?.header) ||
    "/assets/images/atom/kasja_mepage_header.png",
);

const loginDialog =
  useTemplateRef<InstanceType<typeof LoginDialog>>("loginDialog");
</script>

<template>
  <header
    class="relative flex h-52 w-full items-center justify-center"
    :style="{ backgroundImage: `url('${headerImage}')` }"
  >
    <div class="absolute size-full bg-black/50"></div>

    <div
      v-if="session.user"
      class="relative flex h-full w-full max-w-7xl items-center justify-center pr-10 md:justify-between"
    >
      <div class="flex items-center gap-x-4">
        <NuxtLink class="ml-7" to="/user/me" :aria-label="`${hotel} home`">
          <img
            class="transition duration-300 ease-in-out [filter:drop-shadow(2px_1px_0_#fff)_drop-shadow(-2px_1px_0_#fff)_drop-shadow(0_-2px_0_#fff)] hover:scale-105"
            :src="logo"
            :alt="t('Hotel logo')"
            @error="logoFailed = true"
          />
        </NuxtLink>

        <div
          class="relative hidden h-[50px] items-center rounded-md bg-white px-4 dark:bg-gray-900 dark:text-white md:flex"
        >
          <div
            class="absolute -left-1 size-6 rotate-45 bg-white dark:bg-gray-900"
          ></div>

          <span class="relative">{{
            t(":online :hotel online", {
              online: session.bootstrap.online_count || 0,
              hotel,
            })
          }}</span>
        </div>
      </div>

      <div class="flex gap-x-4">
        <NuxtLink
          class="relative hidden rounded-full bg-white/90 px-6 py-2 text-lg font-semibold text-black transition duration-300 ease-in-out hover:bg-white hover:text-black dark:bg-gray-900 dark:text-white dark:hover:text-white md:block"
          to="/game/nitro"
        >
          {{ t("Nitro client") }}
        </NuxtLink>

        <NuxtLink
          v-if="session.bootstrap.clients?.flash_enabled"
          class="relative hidden rounded-full bg-white/90 px-6 py-2 text-lg font-semibold text-black transition duration-300 ease-in-out hover:bg-white hover:text-black dark:bg-gray-900 dark:text-white dark:hover:text-white md:block"
          to="/game/flash"
        >
          {{ t("Flash client") }}
        </NuxtLink>

        <ClientAirLaunchButton
          class="relative hidden rounded-full bg-white/90 px-6 py-2 text-lg font-semibold text-black transition duration-300 ease-in-out hover:bg-white hover:text-black disabled:opacity-60 dark:bg-gray-900 dark:text-white dark:hover:text-white md:block"
        />
      </div>
    </div>

    <div v-else class="relative flex justify-center">
      <div class="flex-col font-semibold text-white md:w-[600px]">
        <p class="hidden text-center text-xl leading-7 md:block">
          {{
            t(
              "An online virtual world where you can create your own avatar, make friends, chat, create rooms and much more!",
            )
          }}
        </p>

        <div
          class="flex flex-col items-center justify-center gap-x-6 gap-y-4 md:mt-6 md:flex-row md:gap-y-0"
        >
          <button
            type="button"
            class="rounded-full border-2 border-white bg-transparent px-8 py-2 text-white uppercase transition duration-200 ease-in-out hover:bg-white hover:text-black"
            aria-haspopup="dialog"
            @click="loginDialog?.open()"
          >
            {{ t("Login") }}
          </button>

          <p class="text-sm text-white/80 uppercase">{{ t("Or") }}</p>

          <NuxtLink
            class="rounded-full bg-green-600/80 px-8 py-2.5 text-white uppercase transition duration-200 ease-in-out hover:bg-green-600 hover:text-white"
            to="/register"
          >
            {{ t("Create an account") }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>

  <LoginDialog ref="loginDialog" />
</template>
