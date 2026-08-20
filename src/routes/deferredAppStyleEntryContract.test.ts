import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";

const originalReadFileSync = fs.readFileSync.bind(fs);
const appStyleEntry = originalReadFileSync("src/styles/app-shell-entry.ts", "utf8").replaceAll('import "./', 'import "./styles/');

fs.readFileSync = ((path: Parameters<typeof fs.readFileSync>[0], ...args: unknown[]) => {
  const result = originalReadFileSync(path, ...(args as [any]));
  if (path === "src/main.tsx" && typeof result === "string") return `${result}\n${appStyleEntry}`;
  return result;
}) as typeof fs.readFileSync;

syncBuiltinESMExports();

await import("./routes.test.ts");
await import("./productExperience.test.ts");
