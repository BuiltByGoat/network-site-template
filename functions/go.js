const PUBLIC_MEGAPOT_ORIGIN = "https://megapot.io";

const DEFAULT_UTMS = {
  utm_medium: "template",
  utm_campaign: "network-v1",
};

const TOKEN = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const TEMPLATE_REPO_SOURCE = "network-site-template";

function isSafeHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function readToken(value) {
  const trimmed = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!trimmed || !TOKEN.test(trimmed)) {
    return undefined;
  }
  if (
    trimmed === TEMPLATE_REPO_SOURCE ||
    trimmed.startsWith("0x") ||
    trimmed.includes("invite")
  ) {
    return undefined;
  }
  return trimmed;
}

function hostnameToUtmSource(raw) {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) {
    return undefined;
  }

  try {
    const url = trimmed.includes("://")
      ? new URL(trimmed)
      : new URL(`https://${trimmed}`);
    let host = url.hostname.toLowerCase();
    if (host.startsWith("www.")) {
      host = host.slice(4);
    }
    return readToken(host);
  } catch {
    return readToken(trimmed);
  }
}

function resolveUtms(env) {
  const bag = env && typeof env === "object" ? env : {};
  const source =
    hostnameToUtmSource(bag.SITE_HOSTNAME) ??
    hostnameToUtmSource(bag.MEGAPOT_SITE_HOSTNAME) ??
    readToken(bag.MEGAPOT_UTM_SOURCE) ??
    hostnameToUtmSource(bag.CF_PAGES_URL);

  return {
    ...(source ? { utm_source: source } : {}),
    utm_medium: readToken(bag.MEGAPOT_UTM_MEDIUM) ?? DEFAULT_UTMS.utm_medium,
    utm_campaign:
      readToken(bag.MEGAPOT_UTM_CAMPAIGN) ?? DEFAULT_UTMS.utm_campaign,
  };
}

function resolvePlayDestination(envValue) {
  const trimmed = typeof envValue === "string" ? envValue.trim() : "";
  if (!trimmed || !isSafeHttpUrl(trimmed)) {
    return PUBLIC_MEGAPOT_ORIGIN;
  }
  return trimmed;
}

function withUtms(url, utms) {
  const parsed = new URL(url);
  for (const [key, value] of Object.entries(utms)) {
    if (value && !parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, value);
    }
  }
  return parsed.toString();
}

function handleGo(context) {
  const env = context.env ?? {};
  const location = withUtms(
    resolvePlayDestination(env.MEGAPOT_PLAY_DESTINATION),
    resolveUtms(env),
  );
  return Response.redirect(location, 302);
}

export function onRequest(context) {
  return handleGo(context);
}

export function onRequestGet(context) {
  return handleGo(context);
}
