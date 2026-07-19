const fs = require("fs");

const requiredFiles = [
  "docs/store-readiness.md",
  "docs/privacy-policy-draft.md",
  "docs/terms-of-use-draft.md",
  "public/privacy.html",
  "public/terms.html"
];
const requiredSnippets = [
  ["docs/store-readiness.md", "docs/privacy-policy-draft.md"],
  ["docs/store-readiness.md", "docs/terms-of-use-draft.md"],
  ["docs/store-readiness.md", "public/privacy.html"],
  ["docs/store-readiness.md", "public/terms.html"],
  ["docs/privacy-policy-draft.md", "support@weevrbird.app"],
  ["docs/terms-of-use-draft.md", "support@weevrbird.app"],
  ["public/privacy.html", "support@weevrbird.app"],
  ["public/terms.html", "support@weevrbird.app"],
  ["src/app/release.ts", "supportEmail: \"support@weevrbird.app\""]
];
const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    failures.push(`${file} is missing`);
  }
}

for (const [file, snippet] of requiredSnippets) {
  if (!fs.existsSync(file)) {
    failures.push(`${file} is missing`);
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(snippet)) {
    failures.push(`${file} must include ${snippet}`);
  }
}

console.log(JSON.stringify({
  checkedFiles: requiredFiles,
  checkedSnippets: requiredSnippets.length,
  failed: failures,
  valid: failures.length === 0
}, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
