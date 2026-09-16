import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { PLAY_HREF } from "../src/lib/links";
import { DEFAULT_UTMS } from "../src/lib/utms";

const ROOT = path.resolve(process.cwd(), process.argv[2] ?? "out");
const GO_SOURCE = path.resolve(process.cwd(), "functions/go.ts");

const REQUIRED_CTAS = ["play", "dashboard", "results"] as const;

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

function hasDefaultUtms(url: string): boolean {
  try {
    const parsed = new URL(decodeHref(url));
    return (
      parsed.searchParams.get("utm_source") === DEFAULT_UTMS.utm_source &&
      parsed.searchParams.get("utm_medium") === DEFAULT_UTMS.utm_medium &&
      parsed.searchParams.get("utm_campaign") === DEFAULT_UTMS.utm_campaign
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

      if (!hasDefaultUtms(href)) {
        errors.push(
          `${cta} link must stamp ${DEFAULT_UTMS.utm_source} / ${DEFAULT_UTMS.utm_medium} / ${DEFAULT_UTMS.utm_campaign}: ${href}`,
        );
      }
    }
  }

  const goSource = await readFile(GO_SOURCE, "utf8");
  if (!goSource.includes("buildPlayRedirect")) {
    errors.push(
      "functions/go.ts must call buildPlayRedirect so /go stamps UTMs",
    );
  }
  if (!goSource.includes("MEGAPOT_PLAY_DESTINATION")) {
    errors.push("functions/go.ts must read MEGAPOT_PLAY_DESTINATION");
  }
  if (!goSource.includes("302")) {
    errors.push("functions/go.ts must 302");
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
