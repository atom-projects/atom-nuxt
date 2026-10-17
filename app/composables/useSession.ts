import { ApiError, type Data, type Envelope } from "~/utils/api";

interface AvatarOptions {
  direction?: number;
  head_direction?: number;
  headonly?: 0 | 1;
  gesture?: string;
  action?: string;
  size?: "s" | "m" | "l" | "b";
}

type Viewer = Pick<Data<"Me">, "id" | "username"> &
  Partial<Data<"Me">> &
  Partial<NonNullable<Data<"Bootstrap">["viewer"]>>;

export function useSessionState() {
  return useState("session", () => ({
    user: null as Viewer | null,
    bootstrap: {} as Data<"Bootstrap">,
    ready: false,
    restriction: "",
  }));
}

export function useSession() {
  const session = useSessionState().value;

  const { api, safeUrl } = useApi();

  async function initialize(): Promise<void> {
    // Request the viewer alongside the bootstrap; its result is applied once the bootstrap has landed.
    const user = api<Data<"Me">>("/me");

    user.catch(() => {});

    session.bootstrap = (await api<Data<"Bootstrap">>("/bootstrap")).data;

    session.user = session.bootstrap.viewer;

    await applyUser(user);

    if (!session.user && session.bootstrap.maintenance) {
      session.restriction = "maintenance";
    }

    session.ready = true;
  }

  function refreshUser(): Promise<void> {
    return applyUser(api<Data<"Me">>("/me"));
  }

  async function applyUser(user: Promise<Envelope<Data<"Me">>>): Promise<void> {
    try {
      session.user = (await user).data;

      session.restriction = "";

      if (session.bootstrap.viewer) {
        session.bootstrap.viewer.requires_two_factor = false;
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        session.user = null;

        session.bootstrap.viewer = null;
      } else if (
        error instanceof ApiError &&
        ["two_factor_required", "account_banned", "maintenance"].includes(
          error.code,
        )
      ) {
        session.restriction = error.code;

        session.bootstrap = (await api<Data<"Bootstrap">>("/bootstrap")).data;

        session.user = session.bootstrap.viewer;
      } else {
        throw error;
      }
    }
  }

  function avatar(
    user?: Partial<Data<"PublicUser">> | null,
    options: AvatarOptions = {},
  ): string {
    if (!user?.look) {
      return "/assets/images/avatar-fallback.png";
    }

    const source = safeUrl(
      `${session.bootstrap.assets?.avatar || ""}${encodeURIComponent(user.look)}`,
    );

    if (!source) {
      return "/assets/images/avatar-fallback.png";
    }

    const url = new URL(source);

    const pose = {
      direction: 2,
      head_direction: 3,
      gesture: "sml",
      size: "m",
      ...options,
    };

    for (const [key, value] of Object.entries(pose)) {
      url.searchParams.set(key, String(value));
    }

    return url.href;
  }

  return { session, initialize, refreshUser, avatar };
}
