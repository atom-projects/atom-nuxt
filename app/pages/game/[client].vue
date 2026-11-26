<script setup lang="ts">
import ClientView from "~/views/ClientView.vue";

definePageMeta({
  layout: false,
  validate: (route) => ["nitro", "flash"].includes(String(route.params.client)),
  auth: true,
});

const route = useRoute();

const { session } = useSession();

const presence = useClientPresence();

const flashRequested = route.params.client === "flash";

useSeoMeta({
  title: () =>
    `${session.bootstrap.hotel_name} - ${flashRequested ? "Flash" : "Nitro"}`,
  robots: "noindex, nofollow",
});

useHead({
  htmlAttrs: { class: "h-full overflow-hidden overscroll-none bg-[#0e151c]" },
  bodyAttrs: {
    class: "h-full overflow-hidden overscroll-none bg-[#0e151c] p-0",
    id: "nitro-client",
  },
});

if (!flashRequested) {
  onMounted(() => {
    presence.value = "open";
  });

  onBeforeUnmount(() => {
    if (presence.value === "open") {
      presence.value = "background";
    }
  });
}
</script>

<template>
  <ClientView v-if="flashRequested" />
</template>

<style>
#nitro-client > #__nuxt {
  height: 100%;
}
</style>
