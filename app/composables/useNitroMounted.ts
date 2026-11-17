export function useNitroMounted() {
  return useState("nitro-mounted", () => false);
}
