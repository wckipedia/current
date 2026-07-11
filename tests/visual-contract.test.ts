import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = path.join(process.cwd(), "src");

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const location = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(location) : /\.(tsx|ts|css)$/.test(entry.name) ? [location] : [];
  });
}

describe("typography-only contract", () => {
  it("contains no media or vector elements", () => {
    const source = sourceFiles(appRoot).map((file) => fs.readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/<(img|svg|canvas|picture|video|audio|iframe)\b/i);
  });

  it("does not add a second animation engine", () => {
    const packageJson = fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8");
    expect(packageJson).not.toMatch(/gsap|animejs|framer-motion/);
    expect(packageJson).toContain('"motion"');
  });
});
