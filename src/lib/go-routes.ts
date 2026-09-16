import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export const GO_FUNCTION_PATHS = ["/go", "/go/"] as const;

export const PAGES_ROUTES_JSON = {
  version: 1,
  include: ["/go", "/go/"],
  exclude: [] as string[],
} as const;

const STATIC_GO_FILES = ["go.html", "go.htm", "go/index.html", "go/index.htm"];

export function findStaticGoArtifacts(root: string): string[] {
  const found: string[] = [];

  for (const relative of STATIC_GO_FILES) {
    const full = path.join(root, relative);
    if (existsSync(full) && statSync(full).isFile()) {
      found.push(relative);
    }
  }

  const goDir = path.join(root, "go");
  if (existsSync(goDir) && statSync(goDir).isDirectory()) {
    for (const name of readdirSync(goDir)) {
      if (name.endsWith(".html") || name.endsWith(".htm")) {
        const relative = path.posix.join("go", name);
        if (!found.includes(relative)) {
          found.push(relative);
        }
      }
    }
  }

  return found;
}

export function routesJsonForcesGoFunction(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as {
    version?: unknown;
    include?: unknown;
    exclude?: unknown;
  };

  if (record.version !== 1 || !Array.isArray(record.include)) {
    return false;
  }

  const include = record.include.filter(
    (rule): rule is string => typeof rule === "string",
  );
  const exclude = Array.isArray(record.exclude)
    ? record.exclude.filter((rule): rule is string => typeof rule === "string")
    : [];

  if (exclude.some((rule) => ruleMatchesGo(rule))) {
    return false;
  }

  return GO_FUNCTION_PATHS.every((pathname) =>
    include.some((rule) => includeMatchesPath(rule, pathname)),
  );
}

function ruleMatchesGo(rule: string): boolean {
  return GO_FUNCTION_PATHS.some((pathname) =>
    includeMatchesPath(rule, pathname),
  );
}

function includeMatchesPath(rule: string, pathname: string): boolean {
  if (rule === "/*" || rule === pathname) {
    return true;
  }

  if (rule.endsWith("/*")) {
    const prefix = rule.slice(0, -1);
    return pathname.startsWith(prefix);
  }

  return false;
}

export function locationHasDefaultUtms(
  location: string,
  utms: { utm_source: string; utm_medium: string; utm_campaign: string },
): boolean {
  try {
    const parsed = new URL(location);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      parsed.searchParams.get("utm_source") === utms.utm_source &&
      parsed.searchParams.get("utm_medium") === utms.utm_medium &&
      parsed.searchParams.get("utm_campaign") === utms.utm_campaign
    );
  } catch {
    return false;
  }
}
