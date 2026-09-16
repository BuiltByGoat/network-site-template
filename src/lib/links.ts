import { PUBLIC_MEGAPOT_ORIGIN } from "./origin";
import { withUtms } from "./utms";

export const PLAY_HREF = "/go";

export const PUBLIC_PATHS = {
  dashboard: "/dashboard",
  results: "/results",
} as const;

export function publicMegapotUrl(path: string): string {
  return withUtms(new URL(path, PUBLIC_MEGAPOT_ORIGIN).toString());
}

export function dashboardUrl(): string {
  return publicMegapotUrl(PUBLIC_PATHS.dashboard);
}

export function resultsUrl(): string {
  return publicMegapotUrl(PUBLIC_PATHS.results);
}
