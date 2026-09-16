const FALLBACK_SITE_NAME = "Megapot Network";

export function siteName(): string {
  const value = process.env.NEXT_PUBLIC_SITE_NAME?.trim();
  return value && value.length > 0 ? value : FALLBACK_SITE_NAME;
}

export function documentTitle(name: string = siteName()): string {
  return `Play on Megapot | ${name}`;
}
