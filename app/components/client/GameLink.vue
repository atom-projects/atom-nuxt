<script setup lang="ts">
const props = defineProps<{ to: string }>();

const gameWindow = "hotel-client";

/** The game gets its own tab, so logging out in the hotel can close it and keep this page. */
function open(event: MouseEvent) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  if (window.name === gameWindow || document.getElementById("nitro")) {
    event.preventDefault();

    void navigateTo(props.to);

    return;
  }

  const game = window.open("", gameWindow);

  if (!game) {
    return;
  }

  event.preventDefault();

  let running = false;

  try {
    running = game.location.pathname === props.to;
  } catch {
    /* The tab shows another site now; send it back to the game. */
  }

  if (!running) {
    game.location.href = props.to;
  }

  game.focus();
}
</script>

<template>
  <a :href="to" @click="open"><slot /></a>
</template>
