import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  findStaticGoArtifacts,
  PAGES_ROUTES_JSON,
  routesJsonForcesGoFunction,
} from "./go-routes";

describe("Next must not export a static /go page", () => {
  it("has no src/app/go route that would 200", () => {
    expect(existsSync(path.join(process.cwd(), "src/app/go"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "src/app/go.html"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "src/pages/go.tsx"))).toBe(
      false,
    );
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
  it("requires /go and /go/ to invoke the Function", () => {
    expect(routesJsonForcesGoFunction(PAGES_ROUTES_JSON)).toBe(true);
    expect(
      routesJsonForcesGoFunction({
        version: 1,
        include: ["/go"],
        exclude: [],
      }),
    ).toBe(false);
    expect(
      routesJsonForcesGoFunction({
        version: 1,
        include: ["/go", "/go/"],
        exclude: ["/go"],
      }),
    ).toBe(false);
  });
});
