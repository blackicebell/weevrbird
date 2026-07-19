import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import sharp from "sharp";

const outputDir = "assets/store/google-play/screenshots";
const size = { width: 1080, height: 1920 };

const palette = {
  ink: "#0E1715",
  green: "#0F3D2E",
  softGreen: "#DFF2EA",
  mint: "#EEF8F3",
  paper: "#FFFDF8",
  line: "#D8E7DE",
  gold: "#DBA85B",
  clay: "#C86F4A",
  blue: "#DDEFF6"
};

const screens = [
  {
    file: "01-today.png",
    kicker: "TODAY",
    title: "A finite daily issue.",
    body: "Useful reading, source context, and a clear stopping point.",
    tab: "Today",
    cards: [
      ["Weekend street closure notice", "City of Atlanta / Today", "External reading / Open source"],
      ["Try the Sunday market near Grant Park", "Atlanta / Recommendation", "Saved by local members"],
      ["A guide to small cultural spaces", "Atlanta Magazine / This week", "Discuss on Weevrbird"]
    ]
  },
  {
    file: "02-smartfeeds.png",
    kicker: "SMARTFEEDS",
    title: "Follow useful feeds.",
    body: "Topics, places, and sources keep their own pace and point of view.",
    tab: "Feeds",
    chips: ["Atlanta", "Tech", "Business", "Design"],
    cards: [
      ["Atlanta", "Weekend Guide", "2.4k linked locals / 11 new pieces"],
      ["Tech", "Useful tools and independent work", "Sources, questions, and saved context"],
      ["Business", "Practical signals and local notes", "Curated sources plus community context"]
    ]
  },
  {
    file: "03-contribute.png",
    kicker: "CONTRIBUTE",
    title: "Paste useful links.",
    body: "Share articles, images, videos, questions, and notes.",
    tab: "Contribute",
    cards: [
      ["Paste any useful link", "Weevrbird classifies the draft and keeps it private first.", "Paste"],
      ["Choose where it belongs", "Add context before it appears in a Smartfeed.", "Draft"],
      ["Contribute without pressure", "No follower counts. No pressure to post fast.", "Save"]
    ]
  },
  {
    file: "04-library.png",
    kicker: "LIBRARY",
    title: "Save useful context.",
    body: "Keep articles, collections, notes, and reading lists in one place.",
    tab: "Library",
    cards: [
      ["Atlanta places I return to", "5 saved places", "Collection"],
      ["Essays on slower attention", "7 reads", "Shelf"],
      ["Tools for independent artists", "4 resources", "Resource list"]
    ]
  },
  {
    file: "05-profile.png",
    kicker: "PROFILE",
    title: "Attention over clout.",
    body: "Bird marks, optional pen names, private connection counts, and safety controls.",
    tab: "You",
    cards: [
      ["Quiet Architect", "@quietarchitect / Atlanta", "Linked through Atlanta, Tech, and UX Design"],
      ["Currently paying attention to", "Atlanta, Tech, Business, Urbanism", "Edit any time"],
      ["Safety and support", "Copy app details, mute, block, report, or reset.", "Private controls"]
    ]
  }
];

await mkdir(outputDir, { recursive: true });

for (const screen of screens) {
  const svg = renderScreen(screen);
  const output = `${outputDir}/${screen.file}`;
  await mkdir(dirname(output), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(output);
  console.log(`exported ${output}`);
}

function renderScreen(screen) {
  const startY = screen.chips ? 790 : 708;
  const cards = screen.cards.map((card, index) => renderCard(card, startY + index * 250)).join("");
  const chips = screen.chips ? renderChips(screen.chips) : "";

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.width} ${size.height}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1080" y1="0" y2="1920" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${palette.paper}"/>
      <stop offset=".58" stop-color="${palette.mint}"/>
      <stop offset="1" stop-color="${palette.blue}"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <path d="M-120 840c250-112 510-128 780-48 183 54 363 48 540-18v1146H-120Z" fill="${palette.softGreen}" opacity=".66"/>
  <path d="M780-90 1160 300" fill="none" stroke="${palette.line}" stroke-width="112" stroke-linecap="round" opacity=".45"/>
  <text x="92" y="118" fill="${palette.green}" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800">${screen.kicker}</text>
  ${textBlock(screen.title, 92, 230, 86, 92, 22, 2, palette.ink, "Georgia, serif", 700)}
  ${textBlock(screen.body, 92, 330, 36, 46, 50, 2, "#33443F", "Inter, Arial, sans-serif", 400)}
  ${renderPhoneShell(screen, cards, chips)}
  <text x="92" y="1810" fill="${palette.green}" font-family="Georgia, serif" font-size="58" font-weight="700">Weevrbird</text>
  <text x="92" y="1862" fill="#365249" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700">Built for curiosity, not clout.</text>
</svg>`;
}

function renderPhoneShell(screen, cards, chips) {
  const phoneTitle = screen.title.replace(/\.$/, "");
  return `
  <rect x="128" y="450" width="824" height="1320" rx="64" fill="#10201C" opacity=".14"/>
  <rect x="108" y="430" width="824" height="1320" rx="64" fill="${palette.paper}" stroke="${palette.line}" stroke-width="3"/>
  <rect x="156" y="484" width="728" height="1140" rx="26" fill="${palette.mint}"/>
  <text x="196" y="562" fill="${palette.green}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800">${screen.kicker}</text>
  ${textBlock(phoneTitle, 196, 624, 48, 54, 24, 2, palette.ink, "Georgia, serif", 700)}
  ${chips}
  ${cards}
  ${renderNav(screen.tab)}
  `;
}

function renderChips(chips) {
  return chips.map((chip, index) => {
    const x = 196 + index * 158;
    const fill = index === 0 ? palette.green : "#FFFFFF";
    const text = index === 0 ? "#FFFFFF" : palette.ink;
    return `<rect x="${x}" y="674" width="132" height="64" rx="32" fill="${fill}" stroke="${palette.line}"/>
  <text x="${x + 24}" y="715" fill="${text}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800">${escapeXml(chip)}</text>`;
  }).join("");
}

function renderCard(card, y) {
  const titleLines = wrapText(card[0], 30, 2);
  const bodyY = y + 154 + titleLines.length * 34;
  return `
  <rect x="196" y="${y}" width="648" height="224" rx="18" fill="${palette.paper}" stroke="${palette.line}" stroke-width="2"/>
  <circle cx="232" cy="${y + 45}" r="8" fill="${palette.green}" opacity=".75"/>
  <text x="254" y="${y + 53}" fill="${palette.green}" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="800">${escapeXml(card[2])}</text>
  ${textBlock(card[0], 226, y + 112, 33, 38, 30, 2, palette.ink, "Georgia, serif", 700)}
  ${textBlock(card[1], 226, bodyY, 25, 32, 42, 2, "#3C4A46", "Inter, Arial, sans-serif", 400)}
  `;
}

function renderNav(active) {
  const tabs = ["Today", "Feeds", "Contribute", "Library", "You"];
  return `
  <rect x="156" y="1546" width="728" height="78" rx="39" fill="#FFFFFF" opacity=".92"/>
  ${tabs.map((tab, index) => {
    const x = 204 + index * 140;
    const activeFill = tab === active ? palette.green : "#42554F";
    const plus = tab === "Contribute";
    return plus
      ? `<circle cx="${x + 34}" cy="1585" r="42" fill="${palette.green}"/>
  <text x="${x + 21}" y="1603" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="48">+</text>
  <text x="${x - 22}" y="1656" fill="${activeFill}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800">${tab}</text>`
      : `<circle cx="${x + 34}" cy="1576" r="17" fill="none" stroke="${activeFill}" stroke-width="5"/>
  <text x="${x - 4}" y="1656" fill="${activeFill}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800">${tab}</text>`;
  }).join("")}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textBlock(value, x, y, fontSize, lineHeight, maxChars, maxLines, fill, family, weight) {
  const lines = wrapText(value, maxChars, maxLines);
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${fontSize}" font-weight="${weight}" letter-spacing="0">
    ${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join("")}
  </text>`;
}

function wrapText(value, maxChars, maxLines) {
  const words = String(value).split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length === maxLines) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (lines.length > maxLines) return lines.slice(0, maxLines);
  return lines;
}
