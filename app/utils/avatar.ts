export interface AvatarOptions {
  direction?: number;
  head_direction?: number;
  headonly?: 0 | 1;
  gesture?: string;
  action?: string;
  size?: "s" | "m" | "l" | "b";
}

const POSTURES = ["sit", "lay", "wlk"];
const EXPRESSIONS: Record<string, string> = {
  wav: "wave",
  kiss: "kiss",
  laugh: "laugh",
};
const GESTURES = ["sml", "sad", "agr", "srp"];
const SIZES: Record<string, string> = { s: "s", m: "m", l: "l", b: "m" };

function within(value: unknown, max: number, fallback: number): number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= max
    ? value
    : fallback;
}

/** Builds the twelve-field variant the hotel imager expects. */
export function avatarVariant(
  options: AvatarOptions = {},
  gender?: string | null,
): string {
  const direction = within(options.direction, 7, 2);
  const headDirection = within(options.head_direction, 7, direction);
  const gesture = GESTURES.includes(options.gesture ?? "")
    ? (options.gesture as string)
    : "nrm";
  const sex = String(gender ?? "").toLowerCase() === "f" ? "f" : "m";
  const size = SIZES[options.size ?? ""] ?? "m";

  if (options.headonly) {
    return [
      sex,
      size,
      "head",
      headDirection,
      headDirection,
      "std",
      "none",
      gesture,
      0,
      0,
      0,
      "still",
    ].join("-");
  }

  const action = options.action ?? "";

  return [
    sex,
    size,
    "full",
    direction,
    headDirection,
    POSTURES.includes(action) ? action : "std",
    EXPRESSIONS[action] ?? "none",
    gesture,
    0,
    0,
    0,
    "still",
  ].join("-");
}
