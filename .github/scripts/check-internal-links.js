#!/usr/bin/env node
// Verifies every internal href="/..." link across the site's HTML resolves
// to a real page, using the same URL scheme GitHub Pages serves this Jekyll
// site with (e.g. /about -> about.html). No network calls, no dependencies
// beyond Node's built-ins, so it can't flake on third-party sites being
// slow, rate-limiting, or down.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(dir, f));
}

const files = [
  ...listHtmlFiles(ROOT),
  ...listHtmlFiles(path.join(ROOT, "_includes")),
];

const existingPages = new Set(
  fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith(".html"))
    .map((f) => f.replace(/\.html$/, ""))
);

const hrefRe = /href="(\/[^"#]*)(#[^"]*)?"/g;
let checked = 0;
let broken = 0;

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  let match;
  while ((match = hrefRe.exec(content)) !== null) {
    const rawPath = match[1];
    const rel = rawPath.replace(/^\//, "");
    const slug = rel.replace(/\.html$/, "");
    checked++;
    if (slug === "") continue; // homepage

    // Links to real files on disk (stylesheets, scripts, images) are valid
    // targets even though they are not pages -- resolve them directly.
    if (/\.[a-z0-9]+$/i.test(rel) && !rel.endsWith(".html")) {
      if (!fs.existsSync(path.join(ROOT, rel))) {
        broken++;
        console.error(
          `Broken asset link: href="${rawPath}" in ${path.relative(ROOT, file)}`
        );
      }
      continue;
    }

    if (!existingPages.has(slug)) {
      broken++;
      console.error(
        `Broken internal link: href="${rawPath}${match[2] || ""}" in ${path.relative(ROOT, file)}`
      );
    }
  }
}

console.log(`Checked ${checked} internal links across ${files.length} files.`);
if (broken > 0) {
  console.error(`${broken} broken internal link(s) found.`);
  process.exit(1);
}
console.log("No broken internal links found.");
