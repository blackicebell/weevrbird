const fs = require("fs");
const path = require("path");

const roots = ["src", "README.md", "docs", "app.json"];
const bannedPhrases = [
  "Black Tech",
  "black tech",
  "Nigerian Business",
  "You can leave",
  "Nothing urgent",
  "PERSONAL ARCHIVE",
  "archive easier",
  "Discuss shows"
];
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md"]);
const failures = [];

for (const root of roots) {
  scanPath(root);
}

function scanPath(targetPath) {
  if (!fs.existsSync(targetPath)) return;

  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      scanPath(path.join(targetPath, entry));
    }
    return;
  }

  if (!textExtensions.has(path.extname(targetPath))) return;

  const source = fs.readFileSync(targetPath, "utf8");
  for (const phrase of bannedPhrases) {
    if (!source.includes(phrase)) continue;
    failures.push({ file: targetPath, phrase });
  }
}

console.log(JSON.stringify({
  checkedRoots: roots,
  bannedPhrases: bannedPhrases.length,
  failed: failures,
  valid: failures.length === 0
}, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
