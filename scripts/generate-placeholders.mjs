import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ICONS, PALETTES } from "./icons.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "products");

const SPECS = [
  ["cloud-cotton-romper", "onesie", ["sky", "mint"]],
  ["blossom-party-frock", "frock", ["blush", "lilac"]],
  ["sunny-tee-shorts-set", "tee", ["butter", "sky"]],
  ["cozy-fleece-hoodie", "hoodie", ["peach", "mint"]],
  ["starry-pajama-set", "pajama", ["sky", "lilac"]],
  ["tiny-traveller-dungaree", "dungaree", ["butter", "denim"]],
  ["first-steps-booties", "bootie", ["rose", "butter"]],
  ["mini-sneakers", "sneaker", ["denim", "sky"]],
  ["summer-sandals", "sandal", ["butter", "peach"]],
  ["sunshine-cap-mitten-set", "cap", ["butter", "mint"]],
  ["pom-pom-beanie", "beanie", ["blush", "lilac"]],
  ["soft-cotton-mittens", "mitten", ["rose", "sky"]],
  ["cloud-socks-pack", "socks", ["mint", "blush"]],
  ["waterproof-feeding-bibs", "bib", ["mint", "peach"]],
];

function star(x, y, size, color) {
  const s = size;
  return `<path d="M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z" fill="${color}" opacity=".55"/>`;
}

function svg(slug, suffix, iconKey, paletteName, tilt) {
  const p = PALETTES[paletteName];
  const icon = typeof ICONS[iconKey] === "function" ? ICONS[iconKey](p.acc) : ICONS[iconKey];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" role="img" aria-label="${slug}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${p.c1}"/>
<stop offset="1" stop-color="${p.c2}"/>
</linearGradient>
</defs>
<rect width="600" height="750" fill="url(#bg)"/>
<circle cx="300" cy="345" r="185" fill="#ffffff" opacity=".5"/>
<g transform="translate(190 235) scale(1.85) rotate(${tilt} 60 60)" fill="${p.fg}">${icon}</g>
${star(120, 130, 14, p.fg)}
${star(490, 620, 11, p.fg)}
${star(500, 140, 9, p.acc)}
<circle cx="105" cy="640" r="10" fill="${p.acc}" opacity=".7"/>
<circle cx="450" cy="90" r="8" fill="#fff" opacity=".8"/>
</svg>
`;
}

mkdirSync(outDir, { recursive: true });

let count = 0;
for (const [slug, iconKey, [palA, palB]] of SPECS) {
  for (const [suffix, pal, tilt] of [
    ["a", palA, -4],
    ["b", palB, 5],
  ]) {
    const file = join(outDir, `${slug}-${suffix}.svg`);
    writeFileSync(file, svg(slug, suffix, iconKey, pal, tilt));
    count += 1;
  }
}
console.log(`Generated ${count} placeholder images in public/products`);
