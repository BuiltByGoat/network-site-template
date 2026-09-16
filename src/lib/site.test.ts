import { describe, expect, it } from "vitest";
import { documentTitle, siteName } from "./site";

describe("documentTitle", () => {
  it("uses Play on Megapot | {SITE_NAME}", () => {
    expect(documentTitle("Clone Host")).toBe("Play on Megapot | Clone Host");
    expect(documentTitle()).toBe(`Play on Megapot | ${siteName()}`);
  });
});
