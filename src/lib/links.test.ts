import { describe, expect, it } from "vitest";
import { dashboardUrl, hubUrl, PLAY_HREF, resultsUrl } from "./links";
import {
  NETWORK_HUB_ORIGIN,
  PUBLIC_MEGAPOT_ORIGIN,
  RESULTS_ORIGIN,
} from "./origin";
import { DEFAULT_UTMS } from "./utms";

describe("public outbound links", () => {
  it("keeps Play on the local /go hop", () => {
    expect(PLAY_HREF).toBe("/go");
  });

  it("points Latest results at megapotresults.com, not drawingresults", () => {
    const parsed = new URL(resultsUrl());

    expect(parsed.origin).toBe(RESULTS_ORIGIN);
    expect(parsed.hostname).toBe("megapotresults.com");
    expect(parsed.hostname).not.toContain("drawingresults");
    expect(parsed.searchParams.get("utm_medium")).toBe(DEFAULT_UTMS.utm_medium);
    expect(parsed.searchParams.get("utm_campaign")).toBe(
      DEFAULT_UTMS.utm_campaign,
    );
  });

  it("points the hub footer at megapot.network with campaign UTMs", () => {
    const parsed = new URL(hubUrl());

    expect(parsed.origin).toBe(NETWORK_HUB_ORIGIN);
    expect(parsed.searchParams.get("utm_medium")).toBe(DEFAULT_UTMS.utm_medium);
    expect(parsed.searchParams.get("utm_campaign")).toBe(
      DEFAULT_UTMS.utm_campaign,
    );
  });

  it("keeps dashboard on the public Megapot origin", () => {
    const parsed = new URL(dashboardUrl());

    expect(parsed.origin).toBe(PUBLIC_MEGAPOT_ORIGIN);
    expect(parsed.pathname).toBe("/dashboard");
  });
});
