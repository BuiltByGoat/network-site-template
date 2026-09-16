import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { isScannableFile, scanText } from "../src/lib/privacy";

const ROOT = path.resolve(process.cwd(), process.argv[2] ?? "out");

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(full);
      }
      return isScannableFile(entry.name) ? [full] : [];
    }),
  );

  return files.flat();
}

async function main(): Promise<void> {
  const info = await stat(ROOT).catch(() => null);
  if (!info?.isDirectory()) {
    throw new Error(
      `Privacy scan needs a generated directory at ${ROOT}. Run pnpm build first.`,
    );
  }

  const files = await walk(ROOT);
  const findings = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    findings.push(...scanText(path.relative(process.cwd(), file), source));
  }

  if (findings.length > 0) {
    console.error("Privacy scan failed:");
    for (const finding of findings) {
      console.error(`  [${finding.rule}] ${finding.file}: ${finding.match}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Privacy scan passed (${files.length} files in ${ROOT}).`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
