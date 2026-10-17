import type { Data } from "~/utils/api";

const storageKey = "atom-air-launcher";

/**
 * The AIR launcher opens the site with ?launcher=air. Remember that for the
 * rest of this browser tab, so the flag survives login and redirects.
 */
export function rememberAirLauncherVisit(search: string) {
  if (new URLSearchParams(search).get("launcher") !== "air") {
    return;
  }

  try {
    sessionStorage.setItem(storageKey, "1");
  } catch {
    /* Storage can be unavailable in private modes; the user agent check still applies. */
  }
}

function visitedFromAirLauncher(): boolean {
  try {
    if (sessionStorage.getItem(storageKey) === "1") {
      return true;
    }
  } catch {
    /* Fall through to the user agent check. */
  }

  return /HabboCustomLauncher/i.test(navigator.userAgent);
}

export function useAirLauncher() {
  const { t } = useLocale();

  const { api, safeUrl } = useApi();

  const { session } = useSession();

  const { busy, error, run } = usePage();

  const fromLauncher = ref(false);

  const available = computed(
    () =>
      fromLauncher.value &&
      !!session.user &&
      !!session.bootstrap.clients?.air_enabled,
  );

  onMounted(() => {
    fromLauncher.value = visitedFromAirLauncher();
  });

  function open() {
    return run(async () => {
      const result = await api<Data<"ClientLaunch">>("/client/launch", "POST", {
        client: "air",
      });

      // The launcher's habbo:// handler is the only non-web scheme the site may open.
      const url = safeUrl(result.data.url, ["habbo:"]);

      if (!url) {
        throw new Error(t("The hotel client is not configured yet."));
      }

      window.location.href = url;
    });
  }

  return { t, available, busy, error, open };
}
