const fs = require("fs");

const appConfig = JSON.parse(fs.readFileSync("app.json", "utf8"));
const easConfig = JSON.parse(fs.readFileSync("eas.json", "utf8"));
const packageConfig = JSON.parse(fs.readFileSync("package.json", "utf8"));
const releaseInfoSource = fs.readFileSync("src/app/release.ts", "utf8");
const expo = appConfig.expo;
const failures = [];
const easIgnore = fs.existsSync(".easignore") ? fs.readFileSync(".easignore", "utf8") : "";

function expectEqual(label, actual, expected) {
  if (actual !== expected) {
    failures.push(`${label}: expected ${expected}, received ${actual}`);
  }
}

expectEqual("App name", expo.name, "Weevrbird");
expectEqual("App slug", expo.slug, "weevrbird");
expectEqual("Expo version", expo.version, packageConfig.version);
expectEqual("App description", expo.description, "A personal information app for finite daily editions, Smartfeeds, saved context, and useful contributions.");
expectEqual("URL scheme", expo.scheme, "weevrbird");
expectEqual("iOS bundle identifier", expo.ios?.bundleIdentifier, "com.weevrbird.app");
expectEqual("Android package", expo.android?.package, "com.weevrbird.app");

if (!releaseInfoSource.includes(`version: "${expo.version}"`)) {
  failures.push(`releaseInfo.version must match app.json version ${expo.version}`);
}

if (!releaseInfoSource.includes(`iosBuildNumber: "${expo.ios?.buildNumber}"`)) {
  failures.push(`releaseInfo.iosBuildNumber must match app.json iOS buildNumber ${expo.ios?.buildNumber}`);
}

if (!releaseInfoSource.includes(`androidVersionCode: ${expo.android?.versionCode}`)) {
  failures.push(`releaseInfo.androidVersionCode must match app.json Android versionCode ${expo.android?.versionCode}`);
}

const bundledAssets = expo.assetBundlePatterns ?? [];
if (!Array.isArray(bundledAssets) || bundledAssets.length !== 1 || bundledAssets[0] !== "assets/**/*") {
  failures.push(`Asset bundle patterns should only include assets/**/*, received ${JSON.stringify(bundledAssets)}`);
}

["node_modules/", ".expo/", "qa-screenshots/", "Weevrbird Logos/"].forEach((pattern) => {
  if (!easIgnore.includes(pattern)) {
    failures.push(`.easignore must include ${pattern}`);
  }
});

if (!Number.isInteger(expo.android?.versionCode) || expo.android.versionCode < 3) {
  failures.push(`Android versionCode must be at least 3, received ${expo.android?.versionCode}`);
}

const iosBuildNumber = Number(expo.ios?.buildNumber);
if (!Number.isInteger(iosBuildNumber) || iosBuildNumber < 1) {
  failures.push(`iOS buildNumber must be an integer string at least 1, received ${expo.ios?.buildNumber}`);
}

const buildProperties = expo.plugins?.find((plugin) => Array.isArray(plugin) && plugin[0] === "expo-build-properties");
const androidBuildProperties = buildProperties?.[1]?.android;
expectEqual("Android compileSdkVersion", androidBuildProperties?.compileSdkVersion, 35);
expectEqual("Android targetSdkVersion", androidBuildProperties?.targetSdkVersion, 35);

["preview", "simulator", "production"].forEach((profile) => {
  const image = easConfig.build?.[profile]?.ios?.image;
  if (!String(image ?? "").includes("xcode-26")) {
    failures.push(`EAS ${profile} iOS image must use Xcode 26, received ${image}`);
  }
});

const result = {
  appName: expo.name,
  appVersion: expo.version,
  iosBundleIdentifier: expo.ios?.bundleIdentifier,
  iosBuildNumber: expo.ios?.buildNumber,
  androidPackage: expo.android?.package,
  assetBundlePatterns: expo.assetBundlePatterns,
  easIgnoredBuildInputs: ["node_modules/", ".expo/", "qa-screenshots/", "Weevrbird Logos/"].filter((pattern) => easIgnore.includes(pattern)),
  androidVersionCode: expo.android?.versionCode,
  releaseInfoSynced: failures.every((failure) => !failure.startsWith("releaseInfo.")),
  androidTargetSdkVersion: androidBuildProperties?.targetSdkVersion,
  iosBuildImages: {
    preview: easConfig.build?.preview?.ios?.image,
    simulator: easConfig.build?.simulator?.ios?.image,
    production: easConfig.build?.production?.ios?.image
  },
  valid: failures.length === 0
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
