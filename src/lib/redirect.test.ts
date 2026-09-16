import { describe, expect, it } from "vitest";
import { PUBLIC_MEGAPOT_ORIGIN } from "./origin";
import { buildPlayRedirect, resolvePlayDestination } from "./redirect";
import { DEFAULT_UTMS } from "./utms";

describe("resolvePlayDestination", () => {
  it("falls back to the public Megapot origin when env is empty", () => {
    expect(resolvePlayDestination(undefined)).toBe(PUBLIC_MEGAPOT_ORIGIN);
    expect(resolvePlayDestination("")).toBe(PUBLIC_MEGAPOT_ORIGIN);
    expect(resolvePlayDestination("   ")).toBe(PUBLIC_MEGAPOT_ORIGIN);
  });

  it("rejects non-http values", () => {
    expect(resolvePlayDestination("javascript:alert(1)")).toBe(
      PUBLIC_MEGAPOT_ORIGIN,
    );
    expect(resolvePlayDestination("/play")).toBe(PUBLIC_MEGAPOT_ORIGIN);
    expect(resolvePlayDestination("not a url")).toBe(PUBLIC_MEGAPOT_ORIGIN);
  });

  it("keeps an absolute play URL from env", () => {
    expect(resolvePlayDestination("https://megapot.io/play")).toBe(
      "https://megapot.io/play",
    );
  });
});

describe("buildPlayRedirect", () => {
  it("stamps default UTMs on the public origin when env is empty", () => {
    const parsed = new URL(buildPlayRedirect(undefined));

    expect(parsed.origin).toBe(PUBLIC_MEGAPOT_ORIGIN);
    expect(parsed.pathname).toBe("/");
    expect(parsed.searchParams.get("utm_source")).toBe(DEFAULT_UTMS.utm_source);
    expect(parsed.searchParams.get("utm_medium")).toBe(DEFAULT_UTMS.utm_medium);
    expect(parsed.searchParams.get("utm_campaign")).toBe(
      DEFAULT_UTMS.utm_campaign,
    );
  });

  it("appends UTMs to a private destination without leaking extra params", () => {
    const parsed = new URL(
      buildPlayRedirect("https://megapot.io/play?bonus=host"),
    );

    expect(parsed.origin).toBe("https://megapot.io");
    expect(parsed.pathname).toBe("/play");
    expect(parsed.searchParams.get("bonus")).toBe("host");
    expect(parsed.searchParams.get("utm_source")).toBe(DEFAULT_UTMS.utm_source);
    expect(parsed.searchParams.has("ref")).toBe(false);
    expect(parsed.searchParams.has("referral")).toBe(false);
  });

  it("stamps deploy-host UTMs from private env instead of the template name", () => {
    const parsed = new URL(
      buildPlayRedirect("https://megapot.io/play", {
        MEGAPOT_UTM_SOURCE: "deploy-host.example",
        MEGAPOT_UTM_MEDIUM: "clone",
        MEGAPOT_UTM_CAMPAIGN: "network-clone",
      }),
    );

    expect(parsed.searchParams.get("utm_source")).toBe("deploy-host.example");
    expect(parsed.searchParams.get("utm_medium")).toBe("clone");
    expect(parsed.searchParams.get("utm_campaign")).toBe("network-clone");
  });

  it("derives utm_source from MEGAPOT_SITE_HOSTNAME when source is unset", () => {
    const parsed = new URL(
      buildPlayRedirect(undefined, {
        MEGAPOT_SITE_HOSTNAME: "https://www.clone-host.example",
      }),
    );

    expect(parsed.searchParams.get("utm_source")).toBe("clone-host.example");
    expect(parsed.searchParams.get("utm_medium")).toBe(DEFAULT_UTMS.utm_medium);
    expect(parsed.searchParams.get("utm_campaign")).toBe(
      DEFAULT_UTMS.utm_campaign,
    );
  });
});
