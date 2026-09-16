import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildPagesRoutesJson,
  stripStaticGoArtifacts,
} from "../src/lib/go-routes";

const ROOT = path.resolve(process.cwd(), process.argv[2] ?? "out");

async function main(): Promise<void> {
  await mkdir(ROOT, { recursive: true });

  const removed = stripStaticGoArtifacts(ROOT);
  if (removed.length > 0) {
    throw new Error(
      `Removed static /go artifacts that would 200: ${removed.join(", ")}. Do not add src/app/go.`,
    );
  }

  const routes = buildPagesRoutesJson(ROOT);
  await writeFile(
    path.join(ROOT, "_routes.json"),
    `${JSON.stringify(routes, null, 2)}\n`,
    "utf8",
  );
  console.log(`Wrote ${path.join(ROOT, "_routes.json")}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
