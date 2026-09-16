import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildPagesRoutesJson,
  FORBIDDEN_GO_FUNCTION_FILES,
  findStaticGoArtifacts,
  REQUIRED_GO_FUNCTION_FILES,
  routesJsonForcesGoFunction,
} from "./go-routes";
import { DEFAULT_UTMS } from "./utms";

describe("Next must not export a static /go page", () => {
  it("has no src/app/go route that would 200", () => {
    expect(existsSync(path.join(process.cwd(), "src/app/go"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "src/app/go.html"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "src/pages/go.tsx"))).toBe(
      false,
    );
  });
});

describe("Pages Function files", () => {
  it("ships identical plain JS handlers and no competing TS Function", () => {
    for (const relative of REQUIRED_GO_FUNCTION_FILES) {
      expect(existsSync(path.join(process.cwd(), relative))).toBe(true);
    }
    for (const relative of FORBIDDEN_GO_FUNCTION_FILES) {
      expect(existsSync(path.join(process.cwd(), relative))).toBe(false);
    }

    const go = path.join(process.cwd(), "functions/go.js");
    const slash = path.join(process.cwd(), "functions/go/index.js");
    const goSource = readRequired(go);
    const slashSource = readRequired(slash);

    expect(slashSource).toBe(goSource);
    expect(goSource).toContain("export function onRequest");
    expect(goSource).toContain("export function onRequestGet");
    expect(goSource).toContain("302");
    expect(goSource).toContain("MEGAPOT_PLAY_DESTINATION");
    expect(goSource).toContain("MEGAPOT_UTM_SOURCE");
    expect(goSource).toContain("MEGAPOT_SITE_HOSTNAME");
    expect(goSource).toContain("MEGAPOT_UTM_MEDIUM");
    expect(goSource).toContain("MEGAPOT_UTM_CAMPAIGN");
    expect(goSource).toContain("hostnameToUtmSource");
    expect(goSource).toContain("resolveUtms");
    expect(goSource).toContain(DEFAULT_UTMS.utm_source);
    expect(goSource).toContain(DEFAULT_UTMS.utm_medium);
    expect(goSource).toContain(DEFAULT_UTMS.utm_campaign);
    expect(goSource).not.toContain('from "');
  });

  it("does not put account_id in wrangler.toml", () => {
    const wrangler = readRequired(path.join(process.cwd(), "wrangler.toml"));
    expect(wrangler).not.toMatch(/account_id/);
  });
});

describe("findStaticGoArtifacts", () => {
  it("fails closed when Next emitted a static /go page", () => {
    const root = mkdtempSync(path.join(tmpdir(), "go-static-"));
    mkdirSync(path.join(root, "go"));
    writeFileSync(path.join(root, "go", "index.html"), "<html>play</html>");

    expect(findStaticGoArtifacts(root)).toContain("go/index.html");
  });

  it("passes when out/ has no go HTML", () => {
    const root = mkdtempSync(path.join(tmpdir(), "go-clean-"));
    writeFileSync(path.join(root, "index.html"), "<html>home</html>");

    expect(findStaticGoArtifacts(root)).toEqual([]);
  });
});

describe("routesJsonForcesGoFunction", () => {
  it("requires include /* and never excludes /go", () => {
    const root = mkdtempSync(path.join(tmpdir(), "go-routes-"));
    writeFileSync(path.join(root, "index.html"), "<html>home</html>");
    writeFileSync(path.join(root, "icon.svg"), "<svg></svg>");
    mkdirSync(path.join(root, "_next"));

    const routes = buildPagesRoutesJson(root);
    expect(routes.include).toEqual(["/*"]);
    expect(routes.exclude).toContain("/");
    expect(routes.exclude).toContain("/index.html");
    expect(routes.exclude).toContain("/_next/*");
    expect(routes.exclude).toContain("/icon.svg");
    expect(routes.exclude).not.toContain("/go");
    expect(routes.exclude).not.toContain("/go/");
    expect(routesJsonForcesGoFunction(routes)).toBe(true);

    expect(
      routesJsonForcesGoFunction({
        version: 1,
        include: ["/go", "/go/"],
        exclude: [],
      }),
    ).toBe(false);
    expect(
      routesJsonForcesGoFunction({
        version: 1,
        include: ["/*"],
        exclude: ["/go"],
      }),
    ).toBe(false);
  });
});

function readRequired(file: string): string {
  return readFileSync(file, "utf8");
}
