import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PAGES_ROUTES_JSON } from "../src/lib/go-routes";

const ROOT = path.resolve(process.cwd(), process.argv[2] ?? "out");

async function main(): Promise<void> {
  await mkdir(ROOT, { recursive: true });
  await writeFile(
    path.join(ROOT, "_routes.json"),
    `${JSON.stringify(PAGES_ROUTES_JSON, null, 2)}\n`,
    "utf8",
  );
  console.log(`Wrote ${path.join(ROOT, "_routes.json")}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
