import { describe, expect, it } from "vitest";
import {
  DEFAULT_UTMS,
  hostnameToUtmSource,
  locationHasCampaignUtms,
  resolveUtms,
  withUtms,
} from "./utms";

describe("hostnameToUtmSource", () => {
  it("strips scheme and www", () => {
    expect(hostnameToUtmSource("https://www.clone-host.example")).toBe(
      "clone-host.example",
    );
    expect(hostnameToUtmSource("clone-host.example")).toBe(
      "clone-host.example",
    );
  });

  it("rejects empty, wallets, and invite tokens", () => {
    expect(hostnameToUtmSource(undefined)).toBeUndefined();
    expect(hostnameToUtmSource("")).toBeUndefined();
    expect(
      hostnameToUtmSource("0x1111111111111111111111111111111111111111"),
    ).toBeUndefined();
    expect(hostnameToUtmSource("invite.example")).toBeUndefined();
  });
});

describe("resolveUtms", () => {
  it("falls back to template defaults when env is empty", () => {
    expect(resolveUtms({})).toEqual(DEFAULT_UTMS);
  });

  it("prefers MEGAPOT_UTM_SOURCE over hostname and defaults", () => {
    expect(
      resolveUtms({
        MEGAPOT_UTM_SOURCE: "deploy-host.example",
        MEGAPOT_SITE_HOSTNAME: "https://www.other-host.example",
      }).utm_source,
    ).toBe("deploy-host.example");
  });

  it("derives hostname-style source from MEGAPOT_SITE_HOSTNAME", () => {
    expect(
      resolveUtms({
        MEGAPOT_SITE_HOSTNAME: "https://www.clone-host.example",
      }).utm_source,
    ).toBe("clone-host.example");
  });

  it("reads medium and campaign from env with defaults", () => {
    expect(
      resolveUtms({
        MEGAPOT_UTM_SOURCE: "deploy-host.example",
        MEGAPOT_UTM_MEDIUM: "Clone",
        MEGAPOT_UTM_CAMPAIGN: "Network-Clone",
      }),
    ).toEqual({
      utm_source: "deploy-host.example",
      utm_medium: "clone",
      utm_campaign: "network-clone",
    });
  });

  it("ignores invalid tokens and keeps defaults", () => {
    expect(
      resolveUtms({
        MEGAPOT_UTM_SOURCE: "not a host",
        MEGAPOT_UTM_MEDIUM: "??",
        MEGAPOT_UTM_CAMPAIGN: "invite-drop",
      }),
    ).toEqual(DEFAULT_UTMS);
  });
});

describe("withUtms", () => {
  it("appends resolved campaign params", () => {
    const url = withUtms("https://megapot.io/dashboard", resolveUtms({}));
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

describe("locationHasCampaignUtms", () => {
  it("accepts hostname-style campaign params and rejects referral queries", () => {
    expect(
      locationHasCampaignUtms(
        "https://megapot.io/?utm_source=clone-host.example&utm_medium=clone&utm_campaign=network-clone",
      ),
    ).toBe(true);
    expect(
      locationHasCampaignUtms(
        "https://megapot.io/?utm_source=clone-host.example&utm_medium=clone&utm_campaign=network-clone&ref=secret",
      ),
    ).toBe(false);
  });
});
