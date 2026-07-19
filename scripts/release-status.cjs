const fs = require("fs");

const appConfig = JSON.parse(fs.readFileSync("app.json", "utf8"));
const packageConfig = JSON.parse(fs.readFileSync("package.json", "utf8"));
const releaseInfoSource = fs.existsSync("src/app/release.ts") ? fs.readFileSync("src/app/release.ts", "utf8") : "";
const expo = appConfig.expo;
const releaseInfoSynced =
  releaseInfoSource.includes(`version: "${expo.version}"`) &&
  releaseInfoSource.includes(`iosBuildNumber: "${expo.ios?.buildNumber}"`) &&
  releaseInfoSource.includes(`androidVersionCode: ${expo.android?.versionCode}`);

const status = {
  appName: expo.name,
  packageName: packageConfig.name,
  packageVersion: packageConfig.version,
  expoVersion: expo.version,
  ios: {
    bundleIdentifier: expo.ios?.bundleIdentifier,
    buildNumber: expo.ios?.buildNumber
  },
  android: {
    package: expo.android?.package,
    versionCode: expo.android?.versionCode,
    targetSdkVersion: expo.plugins?.find((plugin) => Array.isArray(plugin) && plugin[0] === "expo-build-properties")?.[1]?.android?.targetSdkVersion
  },
  checks: {
    versionSynced: packageConfig.version === expo.version,
    releaseInfoSynced,
    iosBuildNumberReady: Number.isInteger(Number(expo.ios?.buildNumber)) && Number(expo.ios?.buildNumber) >= 1,
    androidVersionCodeReady: Number.isInteger(expo.android?.versionCode) && expo.android.versionCode >= 3
  }
};

console.log(JSON.stringify(status, null, 2));

const failed = Object.entries(status.checks).filter(([, passed]) => !passed);
if (failed.length > 0) {
  console.error(`Release status has failing checks: ${failed.map(([name]) => name).join(", ")}`);
  process.exitCode = 1;
}
