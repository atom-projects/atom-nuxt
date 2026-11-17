/** The game client is not started, on screen, or running behind the website. */
export type ClientPresence = "closed" | "open" | "background";

export function useClientPresence() {
  return useState<ClientPresence>("client-presence", () => "closed");
}
