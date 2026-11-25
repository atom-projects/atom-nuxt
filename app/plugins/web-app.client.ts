export default defineNuxtPlugin(() => {
  if (window.top !== window.self) {
    return;
  }

  listenForInstallPrompt();

  if (import.meta.dev || !("serviceWorker" in navigator)) {
    return;
  }

  const register = () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* The site works the same without the worker; only installing needs it. */
    });

  if (document.readyState === "complete") {
    void register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
});
