import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  FORBIDDEN_GO_FUNCTION_FILES,
  findStaticGoArtifacts,
  GO_FUNCTION_PATHS,
  locationHasDefaultUtms,
  REQUIRED_GO_FUNCTION_FILES,
  routesJsonForcesGoFunction,
} from "../src/lib/go-routes";

const LIVE_UTMS = {
  SITE_HOSTNAME: "https://www.clone-host.example",
  MEGAPOT_UTM_MEDIUM: "clone",
  MEGAPOT_UTM_CAMPAIGN: "network-clone",
} as const;

const LIVE_UTM_PARAMS = {
  utm_source: "clone-host.example",
  utm_medium: LIVE_UTMS.MEGAPOT_UTM_MEDIUM,
  utm_campaign: LIVE_UTMS.MEGAPOT_UTM_CAMPAIGN,
} as const;

const ROOT = path.resolve(process.cwd(), process.argv[2] ?? "out");
const PORT = Number(process.env.GO_CHECK_PORT ?? "4191");
const ORIGIN = `http://127.0.0.1:${PORT}`;

function assertPlainJsFunctions(): void {
  for (const relative of REQUIRED_GO_FUNCTION_FILES) {
    if (!existsSync(path.resolve(process.cwd(), relative))) {
      throw new Error(`Missing ${relative} (plain JS Pages Function).`);
    }
  }
  for (const relative of FORBIDDEN_GO_FUNCTION_FILES) {
    if (existsSync(path.resolve(process.cwd(), relative))) {
      throw new Error(
        `Remove ${relative}. Competing TS Functions do not invoke on Pages.`,
      );
    }
  }
}

async function assertNoStaticGo(): Promise<void> {
  const artifacts = findStaticGoArtifacts(ROOT);
  if (artifacts.length > 0) {
    throw new Error(
      `/go would be a static 200. Remove these from ${ROOT}: ${artifacts.join(", ")}. Play is a Pages Function only.`,
    );
  }
}

async function assertRoutesJson(): Promise<void> {
  const routesPath = path.join(ROOT, "_routes.json");
  const source = await readFile(routesPath, "utf8").catch(() => {
    throw new Error(
      `Missing ${routesPath}. The /go Function must win via _routes.json include ["/*"] with /go not excluded.`,
    );
  });

  if (!routesJsonForcesGoFunction(JSON.parse(source))) {
    throw new Error(
      `${routesPath} must include ["/*"] and must not exclude /go or /go/.`,
    );
  }
}

async function waitForReady(child: ReturnType<typeof spawn>): Promise<void> {
  let log = "";

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(`wrangler pages dev did not become ready\n${log.trim()}`),
      );
    }, 45_000);

    const onData = (chunk: Buffer): void => {
      const text = chunk.toString();
      log += text;
      if (text.includes("Ready on")) {
        clearTimeout(timeout);
        child.stdout?.off("data", onData);
        child.stderr?.off("data", onData);
        resolve();
      }
    };

    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(
        new Error(`wrangler exited before ready (code ${code})\n${log.trim()}`),
      );
    });
  });
}

async function assertLiveRedirects(): Promise<void> {
  const child = spawn(
    "pnpm",
    [
      "exec",
      "wrangler",
      "pages",
      "dev",
      ROOT,
      "--port",
      String(PORT),
      "--ip",
      "127.0.0.1",
      "--binding",
      `SITE_HOSTNAME=${LIVE_UTMS.SITE_HOSTNAME}`,
      "--binding",
      `MEGAPOT_UTM_MEDIUM=${LIVE_UTMS.MEGAPOT_UTM_MEDIUM}`,
      "--binding",
      `MEGAPOT_UTM_CAMPAIGN=${LIVE_UTMS.MEGAPOT_UTM_CAMPAIGN}`,
    ],
    {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    },
  );

  try {
    await waitForReady(child);

    for (const pathname of GO_FUNCTION_PATHS) {
      const response = await fetch(`${ORIGIN}${pathname}`, {
        redirect: "manual",
      });

      if (response.status === 200) {
        throw new Error(
          `${pathname} returned HTTP 200 (static HTML). It must HTTP 302 via functions/go.js. Smoke: curl -sI ${pathname} → 302 + Location UTMs.`,
        );
      }

      if (response.status !== 302) {
        throw new Error(`${pathname} must HTTP 302, got ${response.status}`);
      }

      const location = response.headers.get("location");
      if (!location || !locationHasDefaultUtms(location, LIVE_UTM_PARAMS)) {
        throw new Error(
          `${pathname} Location must stamp SITE_HOSTNAME as utm_source (not the template repo name), got ${location}`,
        );
      }
    }
  } finally {
    child.kill("SIGTERM");
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 2000);
      child.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }
}

async function main(): Promise<void> {
  const info = await stat(ROOT).catch(() => null);
  if (!info?.isDirectory()) {
    throw new Error(
      `/go check needs a generated directory at ${ROOT}. Run pnpm build first.`,
    );
  }

  assertPlainJsFunctions();
  await assertNoStaticGo();
  await assertRoutesJson();
  await assertLiveRedirects();
  console.log(
    `/go check passed: Function 302 + env UTMs for ${GO_FUNCTION_PATHS.join(" and ")}; no static 200.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
