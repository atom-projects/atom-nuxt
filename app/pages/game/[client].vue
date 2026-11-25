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
  htmlAttrs: { class: "overflow-hidden overscroll-none" },
  bodyAttrs: { class: "overflow-hidden overscroll-none", id: "nitro-client" },
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
