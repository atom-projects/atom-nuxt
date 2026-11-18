export default defineNuxtPlugin(() => {
  useLogout().listen();
});
