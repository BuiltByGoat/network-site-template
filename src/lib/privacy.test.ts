import { describe, expect, it } from "vitest";
import { isScannableFile, scanText } from "./privacy";

describe("scanText", () => {
  it("flags wallet-like hex and invite paths", () => {
    const findings = scanText(
      "out/index.html",
      '<a href="/invite/abc">0x1111111111111111111111111111111111111111</a>',
    );
    const rules = findings.map((finding) => finding.rule);

    expect(rules).toContain("wallet-like-hex");
    expect(rules).toContain("invite-path");
  });

  it("allows cribble hex colors and env names without values", () => {
    const findings = scanText(
      "out/index.html",
      "color:#02fe01 MEGAPOT_API_KEY MEGAPOT_REFERRER_ADDRESS SITE_HOSTNAME MEGAPOT_UTM_SOURCE",
    );

    expect(findings).toEqual([]);
  });
});

describe("isScannableFile", () => {
  it("accepts generated web text", () => {
    expect(isScannableFile("index.html")).toBe(true);
    expect(isScannableFile("chunk.js")).toBe(true);
    expect(isScannableFile("photo.png")).toBe(false);
  });
});
