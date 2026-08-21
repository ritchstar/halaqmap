/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * صورة معاينة واتساب مربّعة 1200×1200 — الاسم والصفة داخل الإطار حتى لا يُقصّ الكرت.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fontkit from 'fontkit';
import sharp from 'sharp';
import { loadPartnerContractArabicFont } from './partnerContractArabicFont.js';
import {
  decodeCoiffeurCardToken,
  sanitizeCoiffeurCardName,
  sanitizeCoiffeurCardRole,
} from './coiffeurCardShare.js';

export const COIFFEUR_CARD_OG_SIZE = 1200;
export const COIFFEUR_CARD_OG_VERSION = '3';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = join(MODULE_DIR, 'assets', 'coiffeur-map-logo-seal-256.webp');
const BRAND_AR = 'كوافير ماب';
const BRAND_EN = 'Coiffeur Map';
const HOST = 'coiffeur.halaqmap.com';
const MARKETING_LEAD_ROLE = 'رئيسة مجموعة تسويقية';

const CREAM = '#f7efe8';
const BLUSH = '#f4d4c0';
const ROSE = '#e8b4a2';
const INK = '#2a1218';

type OgFont = ReturnType<typeof fontkit.create>;

let cachedFont: OgFont | null | undefined;
let cachedLogo: Buffer | null | undefined;

function isMarketingLead(role: string): boolean {
  return role.trim() === MARKETING_LEAD_ROLE;
}

function measure(font: OgFont, text: string, size: number): number {
  const run = font.layout(text || ' ');
  const scale = size / font.unitsPerEm;
  return run.positions.reduce((sum, pos) => sum + pos.xAdvance, 0) * scale;
}

function wrapWords(font: OgFont, text: string, size: number, maxWidth: number, maxLines: number): string[] {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const lines: string[] = [];
  let line = '';
  for (const word of tokens) {
    const test = line ? `${line} ${word}` : word;
    if (measure(font, test, size) <= maxWidth || !line) {
      line = test;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length >= maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.slice(0, maxLines);
}

function textGroup(
  font: OgFont,
  text: string,
  centerX: number,
  baseline: number,
  size: number,
  fill: string,
): string {
  const run = font.layout(text);
  const scale = size / font.unitsPerEm;
  const width = run.positions.reduce((sum, pos) => sum + pos.xAdvance, 0) * scale;
  let pen = centerX - width / 2;
  const parts: string[] = [];
  for (let i = 0; i < run.glyphs.length; i += 1) {
    const glyph = run.glyphs[i];
    const pos = run.positions[i];
    const x = pen + pos.xOffset * scale;
    const y = baseline - pos.yOffset * scale;
    const d = glyph.path.toSVG();
    if (d) {
      parts.push(
        `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale} ${-scale})"><path d="${d}" fill="${fill}"/></g>`,
      );
    }
    pen += pos.xAdvance * scale;
  }
  return parts.join('');
}

function plate(x: number, y: number, w: number, h: number, r: number): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="rgba(20,8,14,0.82)" stroke="rgba(244,212,192,0.72)" stroke-width="3"/>`;
}

async function loadFont(): Promise<OgFont | null> {
  if (cachedFont !== undefined) return cachedFont;
  const buf = await loadPartnerContractArabicFont();
  if (!buf) {
    cachedFont = null;
    return null;
  }
  try {
    cachedFont = fontkit.create(buf);
    return cachedFont;
  } catch {
    cachedFont = null;
    return null;
  }
}

function loadLogo(): Buffer | null {
  if (cachedLogo !== undefined) return cachedLogo;
  try {
    cachedLogo = readFileSync(LOGO_PATH);
    return cachedLogo;
  } catch {
    cachedLogo = null;
    return null;
  }
}

function buildOverlaySvg(input: {
  font: OgFont;
  name: string;
  role: string;
}): string {
  const { font, name, role } = input;
  const W = COIFFEUR_CARD_OG_SIZE;
  const marketing = isMarketingLead(role);
  const headline = marketing ? 'أدعوك إلى كوافير ماب' : 'أقرب مشغل يناسبك';
  const tagline = 'استعلمي من موقعك — مجاناً وبلا تطبيق';
  const invite = marketing ? 'بطاقة تعريف من رئيسة المجموعة التسويقية' : null;
  const kicker = marketing ? 'بداية المجموعة التسويقية' : null;
  const cta = 'ادخلي كوافير ماب';
  const sectors = 'كوافير · تجميل · سبا · مكياج';

  const nameLines = wrapWords(font, name, 54, 880, 2);
  const roleLines = wrapWords(font, role, 32, 760, 2);
  const headLines = wrapWords(font, headline, 40, 880, 2);
  const tagLines = wrapWords(font, tagline, 28, 880, 2);

  const nameH = nameLines.length === 1 ? 118 : 168;
  const roleH = roleLines.length === 1 ? 64 : 100;
  const pitchH = invite ? 250 : 210;

  let y = 430;
  const layers: string[] = [];

  layers.push(
    `<rect x="0" y="0" width="${W}" height="14" fill="url(#stripe)"/>`,
    `<rect x="42" y="42" width="${W - 84}" height="${W - 84}" rx="48" fill="none" stroke="rgba(247,239,232,0.42)" stroke-width="3"/>`,
    `<rect x="58" y="58" width="${W - 116}" height="${W - 116}" rx="40" fill="none" stroke="rgba(201,139,150,0.55)" stroke-width="2"/>`,
  );

  layers.push(textGroup(font, BRAND_EN, W / 2, 348, 28, CREAM));
  layers.push(textGroup(font, BRAND_AR, W / 2, 390, 30, BLUSH));

  if (kicker) {
    const kw = Math.min(640, Math.max(360, measure(font, kicker, 24) + 56));
    layers.push(plate((W - kw) / 2, y, kw, 48, 24));
    layers.push(textGroup(font, kicker, W / 2, y + 34, 24, ROSE));
    y += 64;
  }

  layers.push(plate(96, y, W - 192, nameH, 28));
  let ny = y + (nameLines.length === 1 ? 78 : 62);
  for (const ln of nameLines) {
    layers.push(textGroup(font, ln, W / 2, ny, 54, CREAM));
    ny += 58;
  }
  y += nameH + 18;

  const roleText = roleLines.join(' ');
  const roleW = Math.min(
    W - 280,
    Math.max(300, Math.max(...roleLines.map((ln) => measure(font, ln, 32))) + 64),
  );
  layers.push(plate((W - roleW) / 2, y, roleW, roleH, 32));
  let ry = y + (roleLines.length === 1 ? 44 : 40);
  for (const ln of roleLines) {
    layers.push(textGroup(font, ln, W / 2, ry, 32, BLUSH));
    ry += 40;
  }
  y += roleH + 22;

  layers.push(plate(96, y, W - 192, pitchH, 26));
  let py = y + 56;
  for (const ln of headLines) {
    layers.push(textGroup(font, ln, W / 2, py, 40, CREAM));
    py += 46;
  }
  for (const ln of tagLines) {
    layers.push(textGroup(font, ln, W / 2, py, 28, BLUSH));
    py += 38;
  }
  layers.push(textGroup(font, sectors, W / 2, py + 6, 24, ROSE));
  if (invite) {
    layers.push(textGroup(font, invite, W / 2, py + 44, 24, BLUSH));
  }
  y += pitchH + 28;

  const ctaW = 620;
  layers.push(
    `<rect x="${(W - ctaW) / 2}" y="${y}" width="${ctaW}" height="74" rx="37" fill="url(#cta)"/>`,
  );
  layers.push(textGroup(font, cta, W / 2, y + 50, 32, INK));

  layers.push(textGroup(font, HOST, W / 2, 1148, 22, CREAM));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">
  <defs>
    <linearGradient id="stripe" x1="0" y1="0" x2="${W}" y2="0">
      <stop offset="0%" stop-color="#c98b96"/>
      <stop offset="48%" stop-color="#f4d4c0"/>
      <stop offset="100%" stop-color="#f7efe8"/>
    </linearGradient>
    <linearGradient id="cta" x1="0" y1="0" x2="${ctaW}" y2="0">
      <stop offset="0%" stop-color="#f7efe8"/>
      <stop offset="50%" stop-color="#f4d4c0"/>
      <stop offset="100%" stop-color="#c98b96"/>
    </linearGradient>
  </defs>
  ${layers.join('\n  ')}
</svg>`;
}

export function coiffeurCardOgPublicUrl(origin: string, token: string): string {
  const base = origin.replace(/\/+$/, '');
  return `${base}/c/${encodeURIComponent(token)}/og.jpg?v=${COIFFEUR_CARD_OG_VERSION}`;
}

export async function renderCoiffeurCardOgJpeg(token: string): Promise<Buffer | null> {
  const decoded = decodeCoiffeurCardToken(token);
  if (!decoded) return null;
  const name = sanitizeCoiffeurCardName(decoded.name);
  const role = sanitizeCoiffeurCardRole(decoded.role);
  if (name.length < 2 || role.length < 2) return null;

  const font = await loadFont();
  if (!font) return null;

  const W = COIFFEUR_CARD_OG_SIZE;
  const svg = buildOverlaySvg({ font, name, role });
  const logo = loadLogo();

  const composites: sharp.OverlayOptions[] = [];
  if (logo) {
    const mark = 236;
    const ring = 256;
    const ringSvg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${ring}" height="${ring}">
        <circle cx="${ring / 2}" cy="${ring / 2}" r="${ring / 2 - 4}" fill="none" stroke="rgb(247,239,232)" stroke-width="8"/>
        <circle cx="${ring / 2}" cy="${ring / 2}" r="${ring / 2 - 16}" fill="none" stroke="rgb(201,139,150)" stroke-width="3"/>
      </svg>`,
    );
    const rounded = await sharp(logo)
      .resize(mark, mark)
      .composite([
        {
          input: Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${mark}" height="${mark}"><circle cx="${mark / 2}" cy="${mark / 2}" r="${mark / 2}" fill="white"/></svg>`,
          ),
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer();
    composites.push({
      input: await sharp(ringSvg).png().toBuffer(),
      top: 78,
      left: Math.round((W - ring) / 2),
    });
    composites.push({
      input: rounded,
      top: 88,
      left: Math.round((W - mark) / 2),
    });
  }

  composites.push({ input: Buffer.from(svg), top: 0, left: 0 });

  return sharp({
    create: {
      width: W,
      height: W,
      channels: 3,
      background: { r: 20, g: 8, b: 14 },
    },
  })
    .composite(composites)
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
}

export function coiffeurCardOgFallbackUrl(origin: string): string {
  return `${origin.replace(/\/+$/, '')}/images/coiffeur/card-og.png`;
}
