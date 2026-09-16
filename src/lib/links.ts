import {
  NETWORK_HUB_ORIGIN,
  PUBLIC_MEGAPOT_ORIGIN,
  RESULTS_ORIGIN,
} from "./origin";
import { resolveUtms, withUtms } from "./utms";

export const PLAY_HREF = "/go";

export const PUBLIC_PATHS = {
  dashboard: "/dashboard",
} as const;

export function publicMegapotUrl(path: string): string {
  return withUtms(
    new URL(path, PUBLIC_MEGAPOT_ORIGIN).toString(),
    resolveUtms(),
  );
}

export function dashboardUrl(): string {
  return publicMegapotUrl(PUBLIC_PATHS.dashboard);
}

export function resultsUrl(): string {
  return withUtms(RESULTS_ORIGIN, resolveUtms());
}

export function hubUrl(): string {
  return withUtms(NETWORK_HUB_ORIGIN, resolveUtms());
}
