export default defineNuxtPlugin(() => {
  rememberAirLauncherVisit(window.location.search);

  useRouter().afterEach((to) => {
    if (to.query.launcher === "air") {
      rememberAirLauncherVisit("?launcher=air");
    }
  });
});
