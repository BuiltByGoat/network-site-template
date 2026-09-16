import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { PLAY_HREF } from "../src/lib/links";
import {
  NETWORK_HUB_ORIGIN,
  PUBLIC_MEGAPOT_ORIGIN,
  RESULTS_ORIGIN,
} from "../src/lib/origin";
import { documentTitle, siteName } from "../src/lib/site";
import { locationHasCampaignUtms, resolveUtms } from "../src/lib/utms";

const ROOT = path.resolve(process.cwd(), process.argv[2] ?? "out");
const GO_SOURCES = [
  path.resolve(process.cwd(), "functions/go.js"),
  path.resolve(process.cwd(), "functions/go/index.js"),
];

const REQUIRED_CTAS = ["play", "dashboard", "results", "hub"] as const;
const REQUIRED_GO_ENV = [
  "MEGAPOT_PLAY_DESTINATION",
  "SITE_HOSTNAME",
  "MEGAPOT_SITE_HOSTNAME",
  "MEGAPOT_UTM_SOURCE",
  "MEGAPOT_UTM_MEDIUM",
  "MEGAPOT_UTM_CAMPAIGN",
] as const;

function hrefsOf(html: string, cta: string): string[] {
  const tags = html.matchAll(
    new RegExp(`<a\\b[^>]*\\bdata-cta="${cta}"[^>]*>`, "gi"),
  );

  return [...tags]
    .map((tag) => tag[0].match(/\bhref="([^"]+)"/i)?.[1])
    .filter((href): href is string => Boolean(href));
}

function decodeHref(href: string): string {
  return href.replaceAll("&amp;", "&");
}

function hostOf(url: string): string | undefined {
  try {
    return new URL(decodeHref(url)).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function hasResolvedUtms(url: string): boolean {
  try {
    const parsed = new URL(decodeHref(url));
    const expected = resolveUtms();
    const source = parsed.searchParams.get("utm_source");
    if (source === "network-site-template") {
      return false;
    }
    if (expected.utm_source && !locationHasCampaignUtms(parsed.toString())) {
      return false;
    }
    return (
      parsed.searchParams.get("utm_medium") === expected.utm_medium &&
      parsed.searchParams.get("utm_campaign") === expected.utm_campaign &&
      (!expected.utm_source || source === expected.utm_source)
    );
  } catch {
    return false;
  }
}

async function collectHtml(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const chunks = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectHtml(full);
      }
      return entry.name.endsWith(".html") ? [await readFile(full, "utf8")] : [];
    }),
  );
  return chunks.flat();
}

async function main(): Promise<void> {
  const info = await stat(ROOT).catch(() => null);
  if (!info?.isDirectory()) {
    throw new Error(
      `UTM check needs a generated directory at ${ROOT}. Run pnpm build first.`,
    );
  }

  const pages = await collectHtml(ROOT);
  const html = pages.join("\n");
  const errors: string[] = [];
  const title = documentTitle(siteName());

  if (!html.includes(`<title>${title}</title>`)) {
    errors.push(`Document title must be ${title}`);
  }

  if (html.includes("drawingresults")) {
    errors.push(
      "Latest results must use megapotresults.com, not drawingresults as primary",
    );
  }

  for (const cta of REQUIRED_CTAS) {
    const hrefs = hrefsOf(html, cta);
    if (hrefs.length === 0) {
      errors.push(`Missing data-cta="${cta}" link in ${ROOT}`);
      continue;
    }

    for (const href of hrefs) {
      if (cta === "play") {
        if (href !== PLAY_HREF) {
          errors.push(`Play CTA must link to ${PLAY_HREF}, found ${href}`);
        }
        continue;
      }

      const host = hostOf(href);
      if (cta === "results" && host !== new URL(RESULTS_ORIGIN).hostname) {
        errors.push(`results CTA must go to ${RESULTS_ORIGIN}, found ${href}`);
      }
      if (cta === "hub" && host !== new URL(NETWORK_HUB_ORIGIN).hostname) {
        errors.push(
          `hub footer must go to ${NETWORK_HUB_ORIGIN}, found ${href}`,
        );
      }
      if (
        cta === "dashboard" &&
        host !== new URL(PUBLIC_MEGAPOT_ORIGIN).hostname
      ) {
        errors.push(
          `dashboard CTA must stay on ${PUBLIC_MEGAPOT_ORIGIN}, found ${href}`,
        );
      }

      if (!hasResolvedUtms(href)) {
        errors.push(
          `${cta} link must stamp resolved UTMs (SITE_HOSTNAME source, not the template repo name): ${href}`,
        );
      }
    }
  }

  const goSources = await Promise.all(
    GO_SOURCES.map((file) => readFile(file, "utf8")),
  );
  const goSource = goSources.join("\n");
  if (goSources[0] !== goSources[1]) {
    errors.push("functions/go.js and functions/go/index.js must be identical");
  }
  if (!goSource.includes("export function onRequest")) {
    errors.push("functions/go.js must export onRequest");
  }
  if (!goSource.includes("export function onRequestGet")) {
    errors.push("functions/go.js must export onRequestGet");
  }
  if (!goSource.includes("302")) {
    errors.push("/go must 302");
  }
  for (const name of REQUIRED_GO_ENV) {
    if (!goSource.includes(name)) {
      errors.push(
        `/go must read ${name} (utm_source from SITE_HOSTNAME, not the template repo name)`,
      );
    }
  }
  if (!goSource.includes("hostnameToUtmSource")) {
    errors.push("/go must derive utm_source from SITE_HOSTNAME");
  }
  if (!goSource.includes("resolveUtms")) {
    errors.push("/go must resolve UTMs from private env, not only defaults");
  }
  if (/utm_source:\s*"network-site-template"/.test(goSource)) {
    errors.push(
      "/go must not hardcode utm_source as the literal network-site-template",
    );
  }

  if (errors.length > 0) {
    console.error("UTM check failed:");
    for (const error of errors) {
      console.error(`  ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`UTM check passed (${pages.length} HTML files in ${ROOT}).`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
