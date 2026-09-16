import { describe, expect, it } from "vitest";
import { onRequest } from "./go-function";
import { DEFAULT_UTMS } from "./utms";

describe("onRequest /go Function", () => {
  it("302s /go and /go/ with hostname UTMs and never returns 200", () => {
    for (const pathname of ["/go", "/go/"]) {
      const response = onRequest({ env: {} });

      expect(response.status).toBe(302);
      expect(response.status).not.toBe(200);

      const location = response.headers.get("location");
      expect(location).toBeTruthy();
      const parsed = new URL(location ?? "");
      expect(parsed.searchParams.get("utm_source")).toBe(
        DEFAULT_UTMS.utm_source,
      );
      expect(parsed.searchParams.get("utm_medium")).toBe(
        DEFAULT_UTMS.utm_medium,
      );
      expect(parsed.searchParams.get("utm_campaign")).toBe(
        DEFAULT_UTMS.utm_campaign,
      );
      expect(pathname).toMatch(/^\/go\/?$/);
    }
  });

  it("keeps a private destination out of public markup and still 302s", () => {
    const response = onRequest({
      env: { MEGAPOT_PLAY_DESTINATION: "https://megapot.io/play" },
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain("/play");
    expect(response.headers.get("location")).toContain(
      "utm_source=network-site-template",
    );
  });
});
