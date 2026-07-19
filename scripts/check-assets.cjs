const sharp = require("sharp");

const requiredImages = [
  { path: "assets/icon.png", width: 1024, height: 1024 },
  { path: "assets/adaptive-icon.png", width: 1024, height: 1024 },
  { path: "assets/splash-icon.png", width: 1024, height: 1024 },
  { path: "assets/favicon.png", width: 48, height: 48 },
  { path: "assets/store/google-play/feature-graphic.png", width: 1024, height: 500 }
];

async function main() {
  const results = [];

  for (const image of requiredImages) {
    const metadata = await sharp(image.path).metadata();
    const actual = `${metadata.width}x${metadata.height}`;
    const expected = `${image.width}x${image.height}`;
    const valid = metadata.width === image.width && metadata.height === image.height && metadata.format === "png";

    results.push({
      path: image.path,
      actual,
      expected,
      format: metadata.format,
      valid
    });
  }

  console.log(JSON.stringify(results, null, 2));

  const invalid = results.filter((result) => !result.valid);
  if (invalid.length > 0) {
    console.error("One or more app assets have invalid dimensions or format.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
