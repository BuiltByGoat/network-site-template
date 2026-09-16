import { describe, expect, it } from "vitest";
import { DEFAULT_UTMS, withUtms } from "./utms";

describe("withUtms", () => {
  it("appends default campaign params", () => {
    const url = withUtms("https://megapot.io/dashboard");
    const parsed = new URL(url);

    expect(parsed.searchParams.get("utm_source")).toBe(DEFAULT_UTMS.utm_source);
    expect(parsed.searchParams.get("utm_medium")).toBe(DEFAULT_UTMS.utm_medium);
    expect(parsed.searchParams.get("utm_campaign")).toBe(
      DEFAULT_UTMS.utm_campaign,
    );
  });

  it("does not overwrite existing utm params", () => {
    const url = withUtms(
      "https://megapot.io/results?utm_source=already&utm_medium=set",
    );
    const parsed = new URL(url);

    expect(parsed.searchParams.get("utm_source")).toBe("already");
    expect(parsed.searchParams.get("utm_medium")).toBe("set");
    expect(parsed.searchParams.get("utm_campaign")).toBe(
      DEFAULT_UTMS.utm_campaign,
    );
  });
});
