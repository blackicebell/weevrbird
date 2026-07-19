import { dirname } from "node:path";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const outputs = [
  {
    input: "Weevrbird Logos/weevrbird-app-icon.svg",
    output: "assets/icon.png",
    size: 1024,
    background: "#FFFDF8"
  },
  {
    input: "Weevrbird Logos/weevrbird-weaverbird-mark.svg",
    output: "assets/adaptive-icon.png",
    size: 1024
  },
  {
    input: "Weevrbird Logos/weevrbird-weaverbird-mark.svg",
    output: "assets/splash-icon.png",
    size: 1024
  },
  {
    input: "Weevrbird Logos/weevrbird-app-icon.svg",
    output: "assets/favicon.png",
    size: 48
  }
];

for (const asset of outputs) {
  await mkdir(dirname(asset.output), { recursive: true });

  let pipeline = sharp(asset.input, { density: 384 }).resize(asset.size, asset.size, { fit: "contain" });

  if (asset.background) {
    pipeline = pipeline.flatten({ background: asset.background });
  }

  await pipeline.png().toFile(asset.output);

  console.log(`exported ${asset.output}`);
}

const featureGraphicOutput = "store-assets/google-play/feature-graphic.png";
const featureBackground = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="bg" x1="0" x2="1024" y1="0" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFDF8"/>
      <stop offset=".62" stop-color="#EAF7F1"/>
      <stop offset="1" stop-color="#DDEFF6"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <path d="M-90 360c160-80 324-92 492-36 172 57 328 39 468-54 69-46 135-70 198-72v302H-90Z" fill="#D8EFE4" opacity=".68"/>
  <path d="M720-52 1100 294" fill="none" stroke="#CFE7DD" stroke-width="96" stroke-linecap="round" opacity=".5"/>
  <path d="M120 442c147-80 300-102 458-66" fill="none" stroke="#A6B39A" stroke-width="2" opacity=".35"/>
  <text x="90" y="392" fill="#0F3D2E" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800" letter-spacing="0">A finite daily issue for useful discovery.</text>
</svg>`);

const logoLockup = await sharp("Weevrbird Logos/weevrbird-logo-lockup.svg", { density: 384 })
  .resize(820, 267, { fit: "contain" })
  .png()
  .toBuffer();

await mkdir(dirname(featureGraphicOutput), { recursive: true });
await sharp(featureBackground)
  .composite([{ input: logoLockup, left: 74, top: 70 }])
  .png()
  .toFile(featureGraphicOutput);

console.log(`exported ${featureGraphicOutput}`);
