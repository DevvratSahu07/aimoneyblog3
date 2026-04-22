import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(sourceDir, "..", "..", "..", ".env");

export function loadRootEnv(): void {
  if (!existsSync(rootEnvPath)) return;

  const lines = readFileSync(rootEnvPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;

    const name = trimmed.slice(0, separatorIndex).trim();
    if (!name || process.env[name] !== undefined) continue;

    let value = trimmed.slice(separatorIndex + 1).trim();
    const wrappedInQuotes =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));

    if (wrappedInQuotes) {
      value = value.slice(1, -1);
    }

    process.env[name] = value;
  }
}
