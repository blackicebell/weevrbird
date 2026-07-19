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

await mkdir("assets", { recursive: true });

for (const asset of outputs) {
  let pipeline = sharp(asset.input, { density: 384 }).resize(asset.size, asset.size, { fit: "contain" });

  if (asset.background) {
    pipeline = pipeline.flatten({ background: asset.background });
  }

  await pipeline.png().toFile(asset.output);

  console.log(`exported ${asset.output}`);
}
