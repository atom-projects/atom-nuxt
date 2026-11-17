<script setup lang="ts">
import ClientView from "~/views/ClientView.vue";

const route = useRoute();

const { session } = useSession();

const { locale } = useLocale();

const { isDark } = useThemeMode();

const { theme } = useAppConfig();

const clientPresence = useClientPresence();

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
    class: isDark.value ? "dark" : "",
    "data-theme": theme.name,
  },
}));

watch(
  () => [session.user, session.restriction],
  () => {
    if (!session.ready) {
      return;
    }

    const destination = accessDestination(
      route.path,
      !!route.meta.auth,
      session,
    );

    if (destination) {
      void navigateTo(
        destination === "/login"
          ? { path: destination, query: { next: route.fullPath } }
          : destination,
      );
    }
  },
);

watch(
  () => session.user,
  (user) => {
    if (!user) {
      clientPresence.value = "closed";
    }
  },
);

watch(
  () => route.fullPath,
  () => {
    if (import.meta.client) {
      document
        .querySelectorAll("details.nav-menu[open]")
        .forEach((menu) => menu.removeAttribute("open"));
    }
  },
);
</script>

<template>
  <NuxtLayout>
    <NuxtPage :page-key="(route) => route.fullPath" />
  </NuxtLayout>

  <ClientView
    v-if="clientPresence !== 'closed'"
    :class="{ invisible: clientPresence === 'background' }"
    :inert="clientPresence === 'background'"
  />

  <ClientReturnButton
    v-if="clientPresence === 'background' && route.name !== 'game-client'"
  />
</template>
