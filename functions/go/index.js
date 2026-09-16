const PUBLIC_MEGAPOT_ORIGIN = "https://megapot.io";

const DEFAULT_UTMS = {
  utm_source: "network-site-template",
  utm_medium: "template",
  utm_campaign: "network-v1",
};

function isSafeHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function resolvePlayDestination(envValue) {
  const trimmed = typeof envValue === "string" ? envValue.trim() : "";
  if (!trimmed || !isSafeHttpUrl(trimmed)) {
    return PUBLIC_MEGAPOT_ORIGIN;
  }
  return trimmed;
}

function withUtms(url) {
  const parsed = new URL(url);
  for (const [key, value] of Object.entries(DEFAULT_UTMS)) {
    if (!parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, value);
    }
  }
  return parsed.toString();
}

function handleGo(context) {
  const location = withUtms(
    resolvePlayDestination(context.env.MEGAPOT_PLAY_DESTINATION),
  );
  return Response.redirect(location, 302);
}

export function onRequest(context) {
  return handleGo(context);
}

export function onRequestGet(context) {
  return handleGo(context);
}
