export default defineNuxtPlugin(() => {
  const router = useRouter();

  const target = router.resolve(window.location.pathname);

  if (target.name !== "game-client" || target.params.client !== "nitro") {
    return;
  }

  // Plugins run before the initial navigation, so the handoff overlaps the session requests.
  startEarlyClientLaunch();

  // Only the game page reached by this first navigation may use the early handoff.
  const stop = router.afterEach((to, _from, failure) => {
    stop();

    if (failure || to.name !== "game-client" || to.params.client !== "nitro") {
      discardEarlyClientLaunch();
    }
  });
});
