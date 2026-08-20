import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";

const originalReadFileSync = fs.readFileSync.bind(fs);
const appStyleEntry = originalReadFileSync("src/styles/app-shell-entry.ts", "utf8").replaceAll('import "./', 'import "./styles/');

fs.readFileSync = ((path: Parameters<typeof fs.readFileSync>[0], ...args: unknown[]) => {
  // The node:fs overload set cannot be expressed from a variadic compatibility shim without widening this single forwarded tuple.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = originalReadFileSync(path, ...(args as [any]));
  if (path === "src/main.tsx") {
    const source = String(result);
    const normalizedMain = source.replace(
      /createElement\(AccountAccessProvider,\s*null,\s*createElement\(App\)\)/,
      "<AccountAccessProvider><App /></AccountAccessProvider>",
    );
    return `${normalizedMain}\n${appStyleEntry}`;
  }
  return result;
}) as typeof fs.readFileSync;

syncBuiltinESMExports();

await import("./routes.test.ts");
await import("./productExperience.test.ts");
