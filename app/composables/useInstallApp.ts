interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * - `android`: the browser offers a one tap install.
 * - `ios-safari`: Safari, installed through the Share menu.
 * - `ios-browser`: Chrome, Edge or Firefox on iOS, which also have Add to Home Screen in their Share menu.
 * - `ios-in-app`: an app's built-in browser, which cannot install; the player must open Safari.
 */
export type InstallPlatform =
  | "android"
  | "ios-safari"
  | "ios-browser"
  | "ios-in-app";

const DISMISS_KEY = "atom-install-dismissed";

const DISMISS_DAYS = 14;

const installEvent = shallowRef<BeforeInstallPromptEvent | null>(null);

const installed = ref(false);

/** Starts listening early, because Chrome fires the install event before the page has mounted. */
export function listenForInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();

    installEvent.value = event as BeforeInstallPromptEvent;
  });

  window.addEventListener("appinstalled", () => {
    installed.value = true;

    installEvent.value = null;
  });
}

function runsInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIPad() {
  return (
    /iPad/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  );
}

function detectPlatform(): InstallPlatform | null {
  const agent = navigator.userAgent;

  if (/Android/i.test(agent)) {
    return "android";
  }

  if (!/iPhone|iPod/.test(agent) && !isIPad()) {
    return null;
  }

  if (/CriOS|FxiOS|EdgiOS/.test(agent)) {
    return "ios-browser";
  }

  if (!/Safari\//.test(agent) || /FBAN|FBAV|Instagram|Line\/|GSA\//.test(agent)) {
    return "ios-in-app";
  }

  return "ios-safari";
}

function dismissedRecently() {
  try {
    const value = Number(localStorage.getItem(DISMISS_KEY));

    return value > Date.now() - DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

export function useInstallApp() {
  const platform = ref<InstallPlatform | null>(null);

  const dismissed = ref(true);

  const iPad = ref(false);

  // Safari 26 moved Share behind the ••• button.
  const shareInMoreMenu = ref(false);

  onMounted(() => {
    if (window.top !== window.self || runsInstalled()) {
      return;
    }

    platform.value = detectPlatform();

    iPad.value = isIPad();

    shareInMoreMenu.value =
      Number(navigator.userAgent.match(/Version\/(\d+)/)?.[1] || 0) >= 26;

    dismissed.value = dismissedRecently();
  });

  const visible = computed(() => {
    if (!platform.value || dismissed.value || installed.value) {
      return false;
    }

    return platform.value !== "android" || !!installEvent.value;
  });

  function dismiss() {
    dismissed.value = true;

    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* Without storage the banner returns on the next visit. */
    }
  }

  async function install() {
    const event = installEvent.value;

    if (!event) {
      return;
    }

    installEvent.value = null;

    await event.prompt();

    if ((await event.userChoice).outcome === "dismissed") {
      dismiss();
    }
  }

  return { platform, visible, iPad, shareInMoreMenu, dismiss, install };
}
