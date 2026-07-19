const fs = require("fs");

const target = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
const validTargets = new Set(["android", "ios", "all"]);

if (!validTargets.has(target)) {
  console.error("Usage: node scripts/bump-build-number.cjs <android|ios|all> [--dry-run]");
  process.exit(1);
}

const appConfigPath = "app.json";
const releaseInfoPath = "src/app/release.ts";
const appConfig = JSON.parse(fs.readFileSync(appConfigPath, "utf8"));
const expo = appConfig.expo;

if (!expo.android) expo.android = {};
if (!expo.ios) expo.ios = {};

const before = {
  androidVersionCode: expo.android.versionCode,
  iosBuildNumber: expo.ios.buildNumber
};

if (target === "android" || target === "all") {
  const currentVersionCode = Number(expo.android.versionCode);
  if (!Number.isInteger(currentVersionCode) || currentVersionCode < 1) {
    console.error(`Cannot bump Android versionCode from ${expo.android.versionCode}`);
    process.exit(1);
  }

  expo.android.versionCode = currentVersionCode + 1;
}

if (target === "ios" || target === "all") {
  const currentBuildNumber = Number(expo.ios.buildNumber);
  if (!Number.isInteger(currentBuildNumber) || currentBuildNumber < 1) {
    console.error(`Cannot bump iOS buildNumber from ${expo.ios.buildNumber}`);
    process.exit(1);
  }

  expo.ios.buildNumber = String(currentBuildNumber + 1);
}

if (!dryRun) {
  fs.writeFileSync(appConfigPath, `${JSON.stringify(appConfig, null, 2)}\n`);
  updateReleaseInfo(releaseInfoPath, expo);
}

console.log(JSON.stringify({
  target,
  dryRun,
  before,
  after: {
    androidVersionCode: expo.android.versionCode,
    iosBuildNumber: expo.ios.buildNumber
  }
}, null, 2));

function updateReleaseInfo(filePath, expoConfig) {
  if (!fs.existsSync(filePath)) return;

  const source = fs.readFileSync(filePath, "utf8")
    .replace(/version:\s*"[^"]+"/, `version: "${expoConfig.version}"`)
    .replace(/iosBuildNumber:\s*"[^"]+"/, `iosBuildNumber: "${expoConfig.ios.buildNumber}"`)
    .replace(/androidVersionCode:\s*\d+/, `androidVersionCode: ${expoConfig.android.versionCode}`);

  fs.writeFileSync(filePath, source);
}
