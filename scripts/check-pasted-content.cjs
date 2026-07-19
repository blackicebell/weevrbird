const path = require("path");
const ts = require("typescript");

require.extensions[".ts"] = function loadTsModule(module, filename) {
  const source = require("fs").readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true
    },
    fileName: filename
  });

  module._compile(output.outputText, filename);
};

const { getPastedContentKind, getPasteNotice } = require(path.join(__dirname, "../src/utils/pastedContent.ts"));

const cases = [
  ["https://example.com/story", "article"],
  ["https://youtu.be/abc123", "video"],
  ["https://example.com/photo.webp?size=large", "image"],
  ["https://example.com/guide.pdf", "resource"],
  ["A useful note without a link", "text"]
];

const failures = cases
  .map(([input, expected]) => {
    const actual = getPastedContentKind(input);
    return { input, expected, actual, passed: actual === expected && getPasteNotice(actual).length > 0 };
  })
  .filter((result) => !result.passed);

console.log(JSON.stringify({
  checked: cases.length,
  failed: failures,
  valid: failures.length === 0
}, null, 2));

if (failures.length > 0) {
  process.exitCode = 1;
}
