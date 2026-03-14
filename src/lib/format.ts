/** Format height in inches to feet'inches" display. */
export function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

/** Format seconds to mm:ss (e.g., 390 → "6:30"). */
export function formatErgTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Format seconds to mm:ss.t with tenths (e.g., 390.5 → "6:30.5"). */
export function formatErgTimeDetailed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const wholeSeconds = Math.floor(secs);
  const tenths = Math.round((secs - wholeSeconds) * 10);
  return `${mins}:${wholeSeconds.toString().padStart(2, "0")}.${tenths}`;
}

/** Capitalize and replace underscores with spaces. */
export function formatSportCode(code: string): string {
  return code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
