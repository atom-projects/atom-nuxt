import {
  ApiError,
  type Envelope,
  type RecordData,
  type ApiFailure,
} from "~/utils/api";

export function useApi() {
  const fetchRequest = useRequestFetch();

  const requestHeaders = useRequestHeaders(["cookie"]);

  const frontendOrigin = useRequestURL().origin;

  const { locale } = useLocale();

  const state = useSessionState();

  function backendUrl(path: string): string {
    return path.startsWith("/") ? path : `/${path}`;
  }

  function mediaUrl(path?: string | null): string {
    if (!path) {
      return "";
    }

    return /^https?:\/\//i.test(path) ? path : backendUrl(path);
  }

  function safeUrl(path?: string | null): string {
    if (!path) {
      return "";
    }

    try {
      const url = new URL(mediaUrl(path), frontendOrigin);

      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function xsrfToken(): string {
    const token = document.cookie
      .split("; ")
      .find((value) => value.startsWith("XSRF-TOKEN="))
      ?.slice(11);

    return token ? decodeURIComponent(token) : "";
  }

  async function request<T = RecordData>(
    path: string,
    method = "GET",
    body?: unknown,
    extraHeaders: Record<string, string> = {},
  ): Promise<T> {
    const write = !["GET", "HEAD"].includes(method);

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Accept-Language": locale.value,
      "X-Requested-With": "XMLHttpRequest",
      ...extraHeaders,
    };

    let status = 200;

    let csrfRefreshed = false;

    async function send(): Promise<T> {
      if (write) {
        // Laravel renews XSRF-TOKEN on every response, so only ask for one when the browser has none.
        if (!csrfRefreshed && !xsrfToken()) {
          await refreshCsrf();
        }

        const token = xsrfToken();

        if (token) {
          headers["X-XSRF-TOKEN"] = token;
        }
      }

      return fetchRequest<T>(backendUrl(path), {
        method: method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        body: body as Record<string, unknown> | FormData | undefined,
        headers: {
          ...(import.meta.server
            ? {
                ...requestHeaders,
                referer: frontendOrigin,
                host: new URL(frontendOrigin).host,
              }
            : {}),
          ...headers,
        },
        credentials: "include",
        retry: 0,
        ignoreResponseError: true,

        onResponse({ response }) {
          status = response.status;
        },
      });
    }

    async function refreshCsrf(): Promise<void> {
      await $fetch("/sanctum/csrf-cookie", {
        credentials: "include",
        retry: 0,
      });

      csrfRefreshed = true;
    }

    let data = await send();

    // Laravel rejects a stale CSRF token before the controller runs, so one retry with a fresh token is safe.
    if (write && status === 419 && !csrfRefreshed) {
      await refreshCsrf();

      data = await send();
    }

    if (status >= 400) {
      const json = data as ApiFailure | undefined;

      const error = json?.error || {};

      const code = error.code || json?.code || "request_failed";

      if (status === 401) {
        state.value.user = null;

        state.value.bootstrap.viewer = null;

        state.value.restriction = "";
      }

      if (
        ["account_banned", "maintenance", "two_factor_required"].includes(code)
      ) {
        state.value.restriction = code;
      }

      throw new ApiError(
        status,
        code,
        error.message ||
          json?.message ||
          (status === 419
            ? "Your session expired. Please submit the form again."
            : `The request failed (${status}).`),
        error.fields || json?.errors || {},
        typeof json?.vote_url === "string" ? json.vote_url : null,
      );
    }

    return (data ?? {}) as T;
  }

  function api<T = RecordData>(
    path: string,
    method = "GET",
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<Envelope<T>> {
    return request<Envelope<T>>(`/api/v1${path}`, method, body, headers);
  }

  return { request, api, backendUrl, mediaUrl, safeUrl, xsrfToken };
}
