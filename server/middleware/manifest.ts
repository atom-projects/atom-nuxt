import nodeFetch from "node-fetch";
import { defineEventHandler, getRequestURL, setResponseHeaders } from "h3";

interface HotelDetails {
  name: string;
  description: string;
  expires: number;
}

const hotels = new Map<string, HotelDetails>();

async function hotelDetails(backend: string, host: string) {
  const cached = hotels.get(host);

  if (cached && cached.expires > Date.now()) {
    return cached;
  }

  let details = { name: "", description: "" };

  try {
    const response = await nodeFetch(`${backend}/api/v1/bootstrap`, {
      headers: { host, accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const json = (await response.json()) as {
        data?: { hotel_name?: unknown; hotel_description?: unknown };
      };

      details = {
        name: String(json.data?.hotel_name || "").trim(),
        description: String(json.data?.hotel_description || "").trim(),
      };
    }
  } catch {
    /* The manifest still works with the default name. */
  }

  const result = {
    name: details.name || "Hotel",
    description: details.description,
    // Retry soon after a failed lookup so the real name appears quickly.
    expires: Date.now() + (details.name ? 600_000 : 30_000),
  };

  if (hotels.size > 50) {
    hotels.clear();
  }

  hotels.set(host, result);

  return result;
}

// A middleware rather than a server route, so Nitro keeps the app's fetch calls untyped.
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  if (url.pathname !== "/manifest.webmanifest") {
    return;
  }

  const config = useRuntimeConfig(event);

  const host = url.host;

  const hotel = await hotelDetails(config.backendUrl.replace(/\/$/, ""), host);

  setResponseHeaders(event, {
    "content-type": "application/manifest+json; charset=utf-8",
    "cache-control": "public, max-age=3600",
  });

  return {
    id: "/",
    name: hotel.name,
    short_name: hotel.name,
    description: hotel.description || undefined,
    start_url: "/game/nitro",
    scope: "/",
    display: "standalone",
    display_override: ["fullscreen", "standalone"],
    orientation: "any",
    background_color: "#0e151c",
    theme_color: "#0e151c",
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/pwa/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
});
