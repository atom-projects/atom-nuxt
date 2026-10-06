import type { Ref } from "vue";
import { ApiError, type Data } from "~/utils/api";

export function useGameClient(frame: Ref<HTMLIFrameElement | null>) {
  const { t } = useLocale();

  const { api, request, safeUrl } = useApi();

  const { session } = useSession();

  const route = useRoute();

  const { busy, error, run } = usePage();

  const url = ref("");

  const voteUrl = ref("");

  const disconnected = ref(false);

  const fullscreen = ref(false);

  const onlineCount = ref(session.bootstrap.online_count || 0);

  const flashRequested = route.params.client === "flash";

  let onlineTimer: ReturnType<typeof setInterval> | undefined;

  useSeoMeta({
    title: () =>
      `${session.bootstrap.hotel_name} - ${flashRequested ? "Flash" : "Nitro"}`,
    robots: "noindex, nofollow",
  });

  useHead({ bodyAttrs: { class: "overflow-hidden", id: "nitro-client" } });

  async function launch() {
    voteUrl.value = "";

    disconnected.value = false;

    url.value = "";

    try {
      const result = await api<Data<"ClientLaunch">>("/client/launch", "POST", {
        client: "nitro",
      });

      url.value = safeUrl(result.data.url);

      if (!url.value) {
        throw new Error(t("The hotel client is not configured yet."));
      }
    } catch (failure) {
      if (failure instanceof ApiError && failure.code === "vote_required") {
        voteUrl.value = safeUrl(failure.voteUrl);
      }

      throw failure;
    }
  }

  async function updateOnlineCount() {
    try {
      const result = await request<{ data: { onlineCount: number } }>(
        "/api/online-count",
      );

      onlineCount.value = result.data.onlineCount;
    } catch {
      /* Keep the most recent count when a refresh is unavailable. */
    }
  }

  async function toggleFullscreen() {
    await run(async () => {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    });
  }

  function updateFullscreen() {
    fullscreen.value = !!document.fullscreenElement;
  }

  function handleMessage(event: MessageEvent) {
    if (
      !frame.value?.contentWindow ||
      event.source !== frame.value.contentWindow ||
      !url.value ||
      event.origin !== new URL(url.value).origin
    ) {
      return;
    }

    if (typeof event.data !== "string") {
      return;
    }

    const prefix = [
      "Nitro_LegacyExternalInterface",
      "Octane_LegacyExternalInterface",
    ].find((value) => event.data.startsWith(value));

    if (!prefix) {
      return;
    }

    try {
      const message: unknown = JSON.parse(event.data.slice(prefix.length));

      if (
        message &&
        typeof message === "object" &&
        "method" in message &&
        message.method === "disconnect"
      ) {
        disconnected.value = true;
      }
    } catch {
      /* Ignore malformed messages from the game frame. */
    }
  }

  function handleFrameLoad() {
    if (!url.value || !frame.value?.contentWindow) {
      return;
    }

    try {
      const destination = frame.value.contentWindow.location.href;

      const clientSource = new URL(url.value);

      const clientBase =
        clientSource.origin + clientSource.pathname.replace(/[^/]*$/, "");

      if (
        /^https?:\/\//.test(destination) &&
        !destination.startsWith(clientBase)
      ) {
        window.location.replace(destination);
      }
    } catch {
      /* A cross-origin renderer cannot expose its destination. */
    }
  }

  onMounted(() => {
    window.addEventListener("message", handleMessage);

    document.addEventListener("fullscreenchange", updateFullscreen);

    void updateOnlineCount();

    onlineTimer = setInterval(() => {
      void updateOnlineCount();
    }, 15000);

    if (!flashRequested) {
      void run(launch);
    }
  });

  onBeforeUnmount(() => {
    if (onlineTimer) {
      clearInterval(onlineTimer);
    }

    window.removeEventListener("message", handleMessage);

    document.removeEventListener("fullscreenchange", updateFullscreen);
  });

  return {
    t,
    busy,
    error,
    url,
    voteUrl,
    disconnected,
    fullscreen,
    onlineCount,
    flashRequested,
    toggleFullscreen,
    handleFrameLoad,
    reload: () => run(launch),
  };
}
