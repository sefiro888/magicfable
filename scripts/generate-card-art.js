import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(scriptDir, '..', 'public', 'assets', 'cards', 'art');

const cards = [
  ['fuente-furia', 'Fuente de Furia', 'fury', 'monumental magma well under a mountain', 'oil monumentalism', 'none'],
  ['sabueso-brasa', 'Sabueso de Brasa', 'fury', 'ember hound crossing cracked coal', 'creature concept painting', 'beast'],
  ['berserker-ignivoro', 'Berserker Ignivoro', 'fury', 'scarred warrior drinking fire from ruined forge', 'dark heroic oil', 'humanoid'],
  ['dragon-caldera', 'Dragon de la Caldera', 'fury', 'ancient basalt dragon rising from crater', 'epic mural', 'dragon'],
  ['lluvia-ceniza', 'Lluvia de Ceniza', 'fury', 'burning ash falling over a fortress square', 'atmospheric matte painting', 'spell'],
  ['forja-carmesi', 'Forja Carmesi', 'fury', 'ritual forge with floating red weapons', 'industrial fantasy painting', 'structure'],
  ['lancera-magma', 'Lancera de Magma', 'fury', 'magma lancer on a narrow bridge', 'dynamic character illustration', 'humanoid'],
  ['fenix-pavesa', 'Fenix de Pavesa', 'fury', 'phoenix born from black ash', 'luminous gouache', 'bird'],
  ['ariete-volcanico', 'Ariete Volcanico', 'fury', 'heavy volcanic siege ram at impact', 'low angle cinematic', 'machine'],
  ['pacto-ascuas', 'Pacto de Ascuas', 'fury', 'armored hands making an ember oath', 'intimate ritual painting', 'hands'],
  ['altar-combustion', 'Altar de Combustion', 'fury', 'black altar holding a vertical flame', 'symbolist chapel painting', 'structure'],
  ['temblor-rojo', 'Temblor Rojo', 'fury', 'fortress split by a red earthquake', 'cataclysm landscape', 'spell'],
  ['fuente-arcana', 'Fuente Arcana', 'arcane', 'glowing crystal spring in a deep grotto', 'luminous watercolor', 'none'],
  ['centinela-cristal', 'Centinela de Cristal', 'arcane', 'faceted crystal guardian before runic gate', 'prismatic concept art', 'construct'],
  ['tejedora-escarcha', 'Tejedora de Escarcha', 'arcane', 'ice weaver binding an enemy with threads', 'elegant figurative painting', 'humanoid'],
  ['prision-glacial', 'Prision Glacial', 'arcane', 'unit trapped inside translucent ice polyhedron', 'cold architectural fantasy', 'spell'],
  ['cometa-arcano', 'Cometa Arcano', 'arcane', 'cyan comet descending toward frozen target', 'astronomical matte painting', 'spell'],
  ['torre-horizonte', 'Torre del Horizonte', 'arcane', 'slender observatory above clouds', 'romantic architectural painting', 'structure'],
  ['duelista-prisma', 'Duelista del Prisma', 'arcane', 'mystic duelist splitting light with crystal blade', 'precise character painting', 'humanoid'],
  ['golem-azur', 'Golem Azur', 'arcane', 'wide blue golem holding a small sea in its core', 'mineral creature design', 'construct'],
  ['niebla-espejada', 'Niebla Espejada', 'arcane', 'mirror mist lake with impossible reflections', 'surreal nocturne', 'spell'],
  ['eco-cronomante', 'Eco Cronomante', 'arcane', 'chronomancer repeated through time exposures', 'symbolist arcane portrait', 'humanoid'],
  ['archivo-viviente', 'Archivo Viviente', 'arcane', 'living archive made of books and constellations', 'maximalist library painting', 'construct'],
  ['convergencia-astral', 'Convergencia Astral', 'arcane', 'aligned orbits folding a traveler through space', 'clean cosmic geometry', 'spell'],
  ['kaela-corazon-caldera', 'Kaela, Corazon de Caldera', 'fury', 'commander with a furnace heart and basalt armor', 'mythic portrait painting', 'humanoid'],
  ['oriel-custodio-septima-runa', 'Oriel, Custodio de la Septima Runa', 'arcane', 'rune keeper carrying a seventh crystal law', 'ceremonial arcane portrait', 'humanoid'],
];

const palettes = {
  fury: {
    bg0: '#090506', bg1: '#1b0b0d', bg2: '#431415', ground: '#10080a',
    low: '#2b1110', mid: '#7a241b', high: '#e35b22', glow: '#ffb342', white: '#fff0ba',
    accent: '#b99754', smoke: '#4f3430',
  },
  arcane: {
    bg0: '#050b12', bg1: '#071827', bg2: '#10335b', ground: '#06101a',
    low: '#102744', mid: '#2769ad', high: '#53d9ef', glow: '#bff8ff', white: '#efffff',
    accent: '#9c8cff', smoke: '#425f79',
  },
};

const seedOf = (id) => [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
const p = (n) => Number(n.toFixed(2));

function polygon(cx, cy, r, sides, rot = 0) {
  return Array.from({ length: sides }, (_, i) => {
    const a = rot + (Math.PI * 2 * i) / sides;
    return `${p(cx + Math.cos(a) * r)},${p(cy + Math.sin(a) * r)}`;
  }).join(' ');
}

function atmosphere(seed, pal) {
  let out = '';
  for (let i = 0; i < 18; i += 1) {
    const x = (seed * (i + 7) * 37) % 820 - 10;
    const y = (seed * (i + 3) * 19) % 520 + 10;
    const r = 2 + ((seed + i * 13) % 9);
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 3 ? pal.high : pal.glow}" opacity="${0.09 + (i % 4) * 0.035}"/>`;
  }
  for (let i = 0; i < 8; i += 1) {
    const y = 80 + i * 48 + (seed % 17);
    out += `<path d="M-30 ${y} C 145 ${y - 45}, 270 ${y + 36}, 445 ${y - 5} S 730 ${y - 40}, 835 ${y + 12}" fill="none" stroke="${pal.smoke}" stroke-width="${10 + i * 2}" opacity=".055"/>`;
  }
  return out;
}

function figure(kind, pal, id, faction) {
  const hot = faction === 'fury';
  switch (kind) {
    case 'beast':
      return `<g filter="url(#paint)"><path d="M165 360c52-91 144-125 248-76l69-55 116 5-66 42 88 21-119 25c-24 66-83 103-163 105l-81 72-56-3 48-88-70 21-86 72-55-5 91-112Z" fill="url(#body)" stroke="${pal.accent}" stroke-width="7" stroke-linejoin="round"/><path d="m454 280 39-86 22 74 74-74-37 101Z" fill="url(#ember)"/><path d="m214 370c-39-22-65-60-68-98-24 46-54 68-95 86 46 6 76 30 101 68Z" fill="url(#ember)"/><circle cx="535" cy="269" r="12" fill="${pal.white}"/><circle cx="539" cy="267" r="5" fill="${pal.low}"/><path d="m570 311 42 15-48 12Z" fill="${pal.white}" opacity=".72"/></g>`;
    case 'dragon':
      return `<g filter="url(#paint)"><path d="M92 357c98-85 201-88 299-43 92-118 196-141 292-83-72 3-119 29-158 79 81 15 139 58 189 123-109-54-203-47-278 1-78 51-196 71-344-77Z" fill="url(#body)" stroke="${pal.accent}" stroke-width="8"/><path d="M334 349c25-117 88-185 190-207-32 66-34 133-3 203Z" fill="${pal.mid}" opacity=".62"/><path d="M370 365c57-62 132-82 228-49l-59 37 91 23-118 27c-34 58-88 80-164 69Z" fill="${pal.low}" stroke="${pal.high}" stroke-width="6"/><circle cx="535" cy="344" r="13" fill="${pal.white}"/><path d="M374 410c55 20 114 21 177 0" stroke="${pal.glow}" stroke-width="9" opacity=".55"/></g>`;
    case 'bird':
      return `<g filter="url(#paint)"><path d="M397 376c-128-67-213-59-317 20 69-135 183-203 323-90 135-113 251-45 322 90-110-78-196-86-328-20Z" fill="url(#ember)" opacity=".92"/><path d="M394 255c44 42 72 83 74 143-34 44-90 45-132 0 4-61 24-105 58-143Z" fill="url(#body)" stroke="${pal.white}" stroke-width="5"/><path d="M378 249c21-50 12-91-27-133 64 26 98 67 105 123Z" fill="${pal.glow}"/><circle cx="421" cy="318" r="8" fill="${pal.white}"/></g>`;
    case 'humanoid':
      return `<g filter="url(#paint)"><path d="M400 128c40 0 68 31 64 72-4 38-31 66-64 66s-60-28-64-66c-4-41 24-72 64-72Z" fill="${pal.mid}" stroke="${pal.accent}" stroke-width="6"/><path d="M295 500c10-113 43-199 105-258 68 62 103 147 112 258Z" fill="url(#body)" stroke="${pal.accent}" stroke-width="8"/><path d="M302 307 169 402l-43-23 158-134Z" fill="${pal.low}" stroke="${pal.high}" stroke-width="5"/><path d="M499 307 641 401l43-24-166-132Z" fill="${pal.low}" stroke="${pal.high}" stroke-width="5"/><path d="M354 276c31 36 60 36 91 0" stroke="${pal.white}" stroke-width="7" opacity=".6"/><path d="${hot ? 'M390 216c23 41 34 84 30 130' : 'M350 318c78-32 133-31 181 3'}" fill="none" stroke="${pal.glow}" stroke-width="10" opacity=".75"/></g>`;
    case 'construct':
      return `<g filter="url(#paint)"><path d="M404 120 540 218l-36 213-104 83-113-78-32-217Z" fill="url(#body)" stroke="${pal.accent}" stroke-width="8"/><path d="M404 154 487 231 456 380 400 427 339 383 316 230Z" fill="${pal.mid}" opacity=".68"/><path d="${polygon(401, 288, 62, 6, Math.PI / 6)}" fill="url(#ember)" opacity=".85"/><path d="M284 294 147 362l35 62 112-53Z" fill="${pal.low}" stroke="${pal.high}" stroke-width="5"/><path d="M519 294 653 363l-33 62-114-52Z" fill="${pal.low}" stroke="${pal.high}" stroke-width="5"/></g>`;
    case 'machine':
      return `<g filter="url(#paint)"><path d="M132 370 499 248l140 58 41 102-386 53Z" fill="url(#body)" stroke="${pal.accent}" stroke-width="8"/><path d="M493 251 708 251 633 308Z" fill="url(#ember)" stroke="${pal.white}" stroke-width="5"/><circle cx="246" cy="440" r="52" fill="${pal.low}" stroke="${pal.high}" stroke-width="9"/><circle cx="505" cy="408" r="58" fill="${pal.low}" stroke="${pal.high}" stroke-width="9"/><path d="M137 342c125-61 251-92 381-109" stroke="${pal.glow}" stroke-width="8" opacity=".45"/></g>`;
    case 'hands':
      return `<g filter="url(#paint)"><path d="M74 356c112-98 213-114 303-47l-43 70c-91-39-168-22-240 47Z" fill="url(#body)" stroke="${pal.accent}" stroke-width="7"/><path d="M724 356c-112-98-213-114-303-47l43 70c91-39 168-22 240 47Z" fill="url(#body)" stroke="${pal.accent}" stroke-width="7"/><circle cx="400" cy="319" r="68" fill="url(#ember)" opacity=".94"/><path d="${polygon(400, 319, 105, 5, -Math.PI / 2)}" fill="none" stroke="${pal.glow}" stroke-width="5" opacity=".65"/></g>`;
    case 'structure':
      return `<g filter="url(#paint)"><path d="M203 504 257 220 400 112 546 220 603 504Z" fill="url(#body)" stroke="${pal.accent}" stroke-width="8"/><path d="M311 504 336 297 400 242 466 297 491 504Z" fill="${pal.bg0}"/><path d="${polygon(400, 214, 76, hot ? 5 : 7, -Math.PI / 2)}" fill="url(#ember)" opacity=".8"/><path d="M255 247h290M229 358h342" stroke="${pal.high}" stroke-width="8" opacity=".45"/><circle cx="400" cy="396" r="45" fill="${pal.glow}" opacity=".22"/></g>`;
    case 'spell':
    default:
      return `<g filter="url(#paint)"><path d="${hot ? 'M88 430 C 201 320, 230 194, 365 262 S 559 210, 716 102' : 'M74 408 C 214 337, 299 450, 401 306 S 584 158, 735 229'}" fill="none" stroke="url(#ember)" stroke-width="46" stroke-linecap="round" opacity=".88"/><path d="${polygon(400, 300, 128, hot ? 5 : 8, Math.PI / 8)}" fill="none" stroke="${pal.white}" stroke-width="7" opacity=".5"/><path d="${polygon(400, 300, 74, hot ? 3 : 6, -Math.PI / 3)}" fill="url(#body)" opacity=".72"/><circle cx="400" cy="300" r="46" fill="url(#ember)"/></g>`;
  }
}

function svg([id, title, faction, concept, school, kind]) {
  const pal = palettes[faction];
  const seed = seedOf(id);
  const horizon = faction === 'fury'
    ? `<path d="M0 392c96-45 191-64 285-31 87 31 156-47 255-20 98 26 165-31 260-3v222H0Z" fill="${pal.ground}"/><path d="M0 456c146-28 262 26 409-1 134-25 244-10 391 28v77H0Z" fill="${pal.bg0}"/>`
    : `<path d="M0 402c121-49 229-34 323-4 80 26 168-52 266-18 70 24 133 20 211-11v191H0Z" fill="${pal.ground}"/><path d="M0 475c177-26 279 19 419-8 142-27 249-16 381 19v74H0Z" fill="${pal.bg0}"/>`;
  const extra = faction === 'fury'
    ? `<path d="M78 122 188 159 91 183Z" fill="${pal.high}" opacity=".16"/><path d="M586 86 746 118 614 164Z" fill="${pal.glow}" opacity=".1"/><path d="M278 508 330 368 378 508Z" fill="${pal.high}" opacity=".35"/>`
    : `<path d="${polygon(145, 148, 58, 6, Math.PI / 6)}" fill="none" stroke="${pal.glow}" stroke-width="4" opacity=".22"/><path d="${polygon(650, 160, 88, 7, Math.PI / 5)}" fill="none" stroke="${pal.accent}" stroke-width="5" opacity=".2"/><path d="M186 488 399 122 614 489" fill="none" stroke="${pal.high}" stroke-width="3" opacity=".14"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">${concept}; art direction: ${school}; collaborative atelier finish.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${pal.bg0}"/><stop offset=".52" stop-color="${pal.bg1}"/><stop offset="1" stop-color="${pal.bg2}"/></linearGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${pal.mid}"/><stop offset=".56" stop-color="${pal.low}"/><stop offset="1" stop-color="${pal.bg0}"/></linearGradient>
    <radialGradient id="ember" cx=".5" cy=".45" r=".62"><stop stop-color="${pal.white}"/><stop offset=".34" stop-color="${pal.glow}"/><stop offset=".72" stop-color="${pal.high}"/><stop offset="1" stop-color="${pal.mid}"/></radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="paint"><feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#000" flood-opacity=".46"/><feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="${pal.glow}" flood-opacity=".2"/></filter>
    <pattern id="grain" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M0 13h64M0 37h64M19 0v64M43 0v64" stroke="${pal.white}" stroke-width="1" opacity=".025"/></pattern>
  </defs>
  <rect width="800" height="560" fill="url(#bg)"/>
  <circle cx="${faction === 'fury' ? 566 : 268}" cy="${faction === 'fury' ? 205 : 180}" r="190" fill="${pal.high}" opacity=".13" filter="url(#soft)"/>
  <circle cx="${faction === 'fury' ? 288 : 540}" cy="${faction === 'fury' ? 358 : 318}" r="148" fill="${pal.glow}" opacity=".08" filter="url(#soft)"/>
  ${atmosphere(seed, pal)}
  ${extra}
  ${horizon}
  ${figure(kind, pal, id, faction)}
  <rect width="800" height="560" fill="url(#grain)"/>
  <path d="M24 24h752v512H24Z" fill="none" stroke="${pal.white}" stroke-width="2" opacity=".055"/>
</svg>
`;
}

fs.mkdirSync(outDir, { recursive: true });
for (const card of cards) {
  fs.writeFileSync(path.join(outDir, `${card[0]}.svg`), svg(card), 'utf8');
}
