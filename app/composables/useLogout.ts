import { ApiError } from "~/utils/api";

interface SessionMessage {
  type: "logout-requested" | "logged-out";
}

let channel: BroadcastChannel | null | undefined;

/** One channel per tab, so a tab never receives its own messages. The game client posts on the same name. */
function sessionChannel(): BroadcastChannel | null {
  channel ??=
    typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel("hotel-session");

  return channel;
}

export function useLogout() {
  const { request } = useApi();

  const { session } = useSession();

  const router = useRouter();

  function closeGameTab(): boolean {
    if (router.currentRoute.value.name !== "game-client") {
      return false;
    }

    // Browsers only let a script close a tab that a script opened.
    window.close();

    return window.closed;
  }

  async function logout() {
    try {
      await request("/logout", "POST");
    } catch (failure) {
      if (!(failure instanceof ApiError && failure.status === 401)) {
        throw failure;
      }
    }

    sessionChannel()?.postMessage({ type: "logged-out" } as SessionMessage);

    if (!closeGameTab()) {
      await navigateTo("/", { external: true });
    }
  }

  function showLoggedOut() {
    if (closeGameTab()) {
      return;
    }

    // app.vue sends pages that need an account to the login page.
    session.user = null;

    session.bootstrap.viewer = null;

    session.restriction = "";
  }

  function listen() {
    sessionChannel()?.addEventListener(
      "message",
      (event: MessageEvent<SessionMessage>) => {
        if (event.data?.type === "logged-out") {
          showLoggedOut();
        } else if (event.data?.type === "logout-requested" && session.user) {
          logout().catch(() => {});
        }
      },
    );
  }

  return { logout, listen };
}
