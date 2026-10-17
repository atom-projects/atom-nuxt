<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const { t, available, busy, error, open } = useAirLauncher();
</script>

<template>
  <template v-if="available">
    <button v-bind="$attrs" type="button" :disabled="busy" @click="open">
      {{ t("Open AIR client") }}
    </button>

    <p v-if="error" role="alert" class="mt-1 text-sm text-red-400">
      {{ error }}
    </p>
  </template>
</template>
