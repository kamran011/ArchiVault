/**
 * Generates public/favicon.ico from the Archivolt brand mark (ArchivoltLogo.tsx).
 */
import sharp from "sharp";
import toIco from "to-ico";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public");
const outFile = path.join(outDir, "favicon.ico");

// Tailwind cyan tokens used by ArchivoltLogo (explicit for raster export).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" fill="#0a0a0a"/>
  <rect x="4" y="4" width="24" height="24" rx="6" fill="#06b6d4" fill-opacity="0.15" stroke="#06b6d4" stroke-opacity="0.4" stroke-width="1"/>
  <rect x="12" y="12" width="8" height="8" rx="2" fill="#06b6d4"/>
  <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="#22d3ee" stroke-opacity="0.7" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M7.5 24.5l2.8-2.8M21.7 10.3l2.8-2.8" stroke="#67e8f9" stroke-opacity="0.5" stroke-width="1.25" stroke-linecap="round" fill="none"/>
</svg>`;

const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  sizes.map((size) =>
    sharp(Buffer.from(svg)).resize(size, size).png().toBuffer(),
  ),
);

const ico = await toIco(pngBuffers);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, ico);
console.log(`Wrote ${outFile} (${ico.length} bytes, sizes: ${sizes.join(", ")})`);
