const path = require("path");
const ts = require("typescript");

require.extensions[".ts"] = function loadTsModule(module, filename) {
  const source = require("fs").readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true
    },
    fileName: filename
  });

  module._compile(output.outputText, filename);
};

const { runContentSourceSelfCheck } = require(path.join(__dirname, "../src/content/examples.ts"));

const result = runContentSourceSelfCheck();

console.log(JSON.stringify(result, null, 2));

if (result.selectedSourceIds.includes("indie-design-radio")) {
  console.error("Paused audio source was selected into an edition.");
  process.exitCode = 1;
}
