import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../styles/version-a-global-family-authority-20260904.css", import.meta.url), "utf8");
const shellEntry = readFileSync(new URL("../styles/app-shell-entry.ts", import.meta.url), "utf8");

describe("approved Version A global family authority", () => {
  it("owns the authenticated family foundation and role accents", () => {
    expect(css).toContain(".hlc-signed-in-shell");
    expect(css).toContain('data-portal="resident"');
    expect(css).toContain('data-portal="professional"');
    expect(css).toContain('data-portal="partner"');
    expect(css).toContain('data-portal="internal"');
    expect(css).toContain("--hlc-blue");
    expect(css).toContain("--hlc-green");
    expect(css).toContain("--hlc-gold");
    expect(css).toContain("--hlc-purple");
  });

  it("owns shared identity, imagery, AI, and dark loading presentation", () => {
    expect(css).toContain(".hlc-profile-avatar");
    expect(css).toContain(".hlc-header-avatar");
    expect(css).toContain(".hlc-greeting");
    expect(css).toContain(".hlc-context-image");
    expect(css).toContain(".hlc-provider-image");
    expect(css).toContain(".hlc-community-image");
    expect(css).toContain(".hlc-ai-launcher");
    expect(css).toContain(".hlc-route-loading-state");
  });

  it("is the final authenticated visual authority in the cascade", () => {
    const authority = 'import "./version-a-global-family-authority-20260904.css";';
    expect(shellEntry.trim().endsWith(authority)).toBe(true);
  });
});
