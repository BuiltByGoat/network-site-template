export const DEFAULT_UTMS = {
  utm_source: "network-site-template",
  utm_medium: "template",
  utm_campaign: "network-v1",
} as const;

export type UtmParams = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
};

export function withUtms(url: string, utms: UtmParams = DEFAULT_UTMS): string {
  const parsed = new URL(url);

  for (const [key, value] of Object.entries(utms)) {
    if (!parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, value);
    }
  }

  return parsed.toString();
}
