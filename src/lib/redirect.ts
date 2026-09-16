import { PUBLIC_MEGAPOT_ORIGIN } from "./origin";
import { resolveUtms, type UtmEnv, withUtms } from "./utms";

function isSafeHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function resolvePlayDestination(envValue: string | undefined): string {
  const trimmed = envValue?.trim();

  if (!trimmed || !isSafeHttpUrl(trimmed)) {
    return PUBLIC_MEGAPOT_ORIGIN;
  }

  return trimmed;
}

export function buildPlayRedirect(
  envValue: string | undefined,
  utmEnv: UtmEnv = {},
): string {
  return withUtms(resolvePlayDestination(envValue), resolveUtms(utmEnv));
}
