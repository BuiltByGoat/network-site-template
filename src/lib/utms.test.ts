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

  it("rejects empty, the template repo name, wallets, and invite tokens", () => {
    expect(hostnameToUtmSource(undefined)).toBeUndefined();
    expect(hostnameToUtmSource("")).toBeUndefined();
    expect(hostnameToUtmSource("network-site-template")).toBeUndefined();
    expect(
      hostnameToUtmSource("0x1111111111111111111111111111111111111111"),
    ).toBeUndefined();
    expect(hostnameToUtmSource("invite.example")).toBeUndefined();
  });
});

describe("resolveUtms", () => {
  it("keeps medium/campaign defaults and does not stamp the template repo name", () => {
    expect(resolveUtms({})).toEqual({
      utm_medium: DEFAULT_UTMS.utm_medium,
      utm_campaign: DEFAULT_UTMS.utm_campaign,
    });
  });

  it("derives hostname-style source from SITE_HOSTNAME", () => {
    expect(
      resolveUtms({
        SITE_HOSTNAME: "https://www.clone-host.example",
      }).utm_source,
    ).toBe("clone-host.example");
  });

  it("prefers SITE_HOSTNAME over aliases and explicit source", () => {
    expect(
      resolveUtms({
        SITE_HOSTNAME: "https://www.deploy-host.example",
        MEGAPOT_SITE_HOSTNAME: "https://www.other-host.example",
        MEGAPOT_UTM_SOURCE: "override-host.example",
      }).utm_source,
    ).toBe("deploy-host.example");
  });

  it("falls back to MEGAPOT_SITE_HOSTNAME then MEGAPOT_UTM_SOURCE", () => {
    expect(
      resolveUtms({
        MEGAPOT_SITE_HOSTNAME: "https://www.clone-host.example",
      }).utm_source,
    ).toBe("clone-host.example");
    expect(
      resolveUtms({
        MEGAPOT_UTM_SOURCE: "deploy-host.example",
      }).utm_source,
    ).toBe("deploy-host.example");
  });

  it("reads medium and campaign from env with defaults", () => {
    expect(
      resolveUtms({
        SITE_HOSTNAME: "deploy-host.example",
        MEGAPOT_UTM_MEDIUM: "Clone",
        MEGAPOT_UTM_CAMPAIGN: "Network-Clone",
      }),
    ).toEqual({
      utm_source: "deploy-host.example",
      utm_medium: "clone",
      utm_campaign: "network-clone",
    });
  });

  it("ignores invalid tokens and keeps medium/campaign defaults", () => {
    expect(
      resolveUtms({
        SITE_HOSTNAME: "not a host",
        MEGAPOT_UTM_MEDIUM: "??",
        MEGAPOT_UTM_CAMPAIGN: "invite-drop",
      }),
    ).toEqual({
      utm_medium: DEFAULT_UTMS.utm_medium,
      utm_campaign: DEFAULT_UTMS.utm_campaign,
    });
  });
});

describe("withUtms", () => {
  it("appends resolved campaign params without inventing a repo-name source", () => {
    const url = withUtms("https://megapot.io/dashboard", resolveUtms({}));
    const parsed = new URL(url);

    expect(parsed.searchParams.get("utm_source")).toBeNull();
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
        "https://megapot.io/?utm_source=network-site-template&utm_medium=template&utm_campaign=network-v1",
      ),
    ).toBe(false);
    expect(
      locationHasCampaignUtms(
        "https://megapot.io/?utm_source=clone-host.example&utm_medium=clone&utm_campaign=network-clone&ref=secret",
      ),
    ).toBe(false);
  });
});
