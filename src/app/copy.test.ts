import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const APP = path.dirname(fileURLToPath(import.meta.url));

const PUBLIC_SOURCES = [
  path.join(APP, "page.tsx"),
  path.join(APP, "layout.tsx"),
  path.join(APP, "icon.svg"),
];

const BUILDER_AD_COPY = [
  "Ship a jackpot front door",
  "Network template",
  "first-party Megapot Network site template",
  "First-party Megapot Network site template",
  "MEGAPOT_PLAY_DESTINATION",
  "Host env only",
  "Clone, export",
  "clone/export",
  "site template",
  "Private /go",
  "Play hops through",
];

describe("public player copy", () => {
  const source = PUBLIC_SOURCES.map((file) => readFileSync(file, "utf8")).join(
    "\n",
  );

  it("does not advertise the developer template on the landing page", () => {
    for (const phrase of BUILDER_AD_COPY) {
      expect(
        source,
        `public markup must not contain “${phrase}”`,
      ).not.toContain(phrase);
    }
  });
});
