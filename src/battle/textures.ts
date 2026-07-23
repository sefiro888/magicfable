import { CanvasTexture, SRGBColorSpace } from 'three';

/**
 * Texturas procedurales del Santuario. Todo se genera en un canvas local:
 * cero assets externos, cero peticiones de red y control total del estilo.
 * Cada textura se genera una única vez y se cachea por clave.
 */
const cache = new Map<string, CanvasTexture>();

const makeCanvas = (size: number): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo crear el contexto 2D para las texturas del Santuario.');
  return [canvas, context];
};

const finishTexture = (key: string, canvas: HTMLCanvasElement): CanvasTexture => {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  cache.set(key, texture);
  return texture;
};

/** PRNG pequeño y determinista para que el Santuario sea idéntico en cada partida. */
const seededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
};

const drawGlyph = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  random: () => number,
) => {
  context.save();
  context.translate(x, y);
  context.rotate(random() * Math.PI * 2);
  context.beginPath();
  const strokes = 2 + Math.floor(random() * 3);
  for (let index = 0; index < strokes; index += 1) {
    const x1 = (random() - 0.5) * size;
    const y1 = (random() - 0.5) * size;
    const x2 = (random() - 0.5) * size;
    const y2 = (random() - 0.5) * size;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    if (random() > 0.5) context.lineTo(x2 + (random() - 0.5) * size * 0.5, y2 + (random() - 0.5) * size * 0.5);
  }
  context.stroke();
  if (random() > 0.6) {
    context.beginPath();
    context.arc(0, 0, size * 0.42, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();
};

/** Piedra del suelo del Santuario con grietas de energía y un anillo rúnico grabado. */
export const sanctuaryFloorTexture = (): CanvasTexture => {
  const cached = cache.get('floor');
  if (cached) return cached;
  const size = 1024;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x52554e41);
  const center = size / 2;

  // Base de piedra oscura con vetas.
  const base = context.createRadialGradient(center, center, size * 0.08, center, center, size * 0.55);
  base.addColorStop(0, '#232838');
  base.addColorStop(0.55, '#161a28');
  base.addColorStop(1, '#0b0e18');
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);

  // Moteado mineral sutil.
  for (let index = 0; index < 2200; index += 1) {
    const x = random() * size;
    const y = random() * size;
    const luminance = 24 + random() * 26;
    context.fillStyle = `rgba(${luminance + 8}, ${luminance + 10}, ${luminance + 22}, ${0.16 + random() * 0.2})`;
    context.fillRect(x, y, 1 + random() * 2.2, 1 + random() * 2.2);
  }

  // Juntas de losas: rejilla suave con desgaste.
  context.strokeStyle = 'rgba(6, 8, 14, 0.55)';
  context.lineWidth = 3;
  const step = size / 8;
  for (let index = 1; index < 8; index += 1) {
    context.beginPath();
    context.moveTo(index * step + (random() - 0.5) * 6, 0);
    context.lineTo(index * step + (random() - 0.5) * 6, size);
    context.stroke();
    context.beginPath();
    context.moveTo(0, index * step + (random() - 0.5) * 6);
    context.lineTo(size, index * step + (random() - 0.5) * 6);
    context.stroke();
  }

  // Grietas de energía arcana (se leerán con el emissiveMap).
  context.strokeStyle = 'rgba(126, 214, 255, 0.5)';
  context.lineWidth = 2.4;
  context.shadowColor = 'rgba(126, 214, 255, 0.8)';
  context.shadowBlur = 10;
  for (let crack = 0; crack < 9; crack += 1) {
    let x = center + (random() - 0.5) * size * 0.7;
    let y = center + (random() - 0.5) * size * 0.7;
    context.beginPath();
    context.moveTo(x, y);
    const segments = 5 + Math.floor(random() * 6);
    for (let segment = 0; segment < segments; segment += 1) {
      x += (random() - 0.5) * 120;
      y += (random() - 0.5) * 120;
      context.lineTo(x, y);
    }
    context.stroke();
  }
  context.shadowBlur = 0;

  // Anillo rúnico grabado alrededor del tablero.
  const ringRadius = size * 0.442;
  context.strokeStyle = 'rgba(214, 178, 110, 0.5)';
  context.lineWidth = 4;
  context.beginPath();
  context.arc(center, center, ringRadius, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(center, center, ringRadius - 26, 0, Math.PI * 2);
  context.stroke();
  context.lineWidth = 3;
  const glyphs = 26;
  for (let index = 0; index < glyphs; index += 1) {
    const angle = (index / glyphs) * Math.PI * 2;
    // Tres runas «quebradas»: huecos apagados en el anillo.
    if (index % 9 === 4) continue;
    drawGlyph(
      context,
      center + Math.cos(angle) * (ringRadius - 13),
      center + Math.sin(angle) * (ringRadius - 13),
      22,
      random,
    );
  }

  return finishTexture('floor', canvas);
};

/** Cara de un monolito con una columna de runas talladas. */
export const monolithTexture = (seed: number): CanvasTexture => {
  const key = `monolith-${seed}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const size = 256;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(seed);

  const base = context.createLinearGradient(0, 0, 0, size);
  base.addColorStop(0, '#1d2231');
  base.addColorStop(1, '#0d101c');
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);
  for (let index = 0; index < 420; index += 1) {
    const luminance = 22 + random() * 22;
    context.fillStyle = `rgba(${luminance}, ${luminance + 4}, ${luminance + 14}, ${0.2 + random() * 0.25})`;
    context.fillRect(random() * size, random() * size, 1 + random() * 2, 1 + random() * 2);
  }
  context.strokeStyle = 'rgba(150, 216, 255, 0.75)';
  context.lineWidth = 2.6;
  context.shadowColor = 'rgba(150, 216, 255, 0.9)';
  context.shadowBlur = 7;
  const runes = 5 + Math.floor(random() * 3);
  for (let index = 0; index < runes; index += 1) {
    drawGlyph(context, size / 2 + (random() - 0.5) * 40, (index + 0.7) * (size / (runes + 1)), 26, random);
  }
  context.shadowBlur = 0;
  return finishTexture(key, canvas);
};

/** Losas de piedra cálida con incrustaciones doradas, para la plataforma celeste. */
export const stoneFloorTexture = (): CanvasTexture => {
  const cached = cache.get('stone-floor');
  if (cached) return cached;
  const size = 1024;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x50494544);
  const center = size / 2;

  const base = context.createRadialGradient(center, center, size * 0.06, center, center, size * 0.62);
  base.addColorStop(0, '#665c55');
  base.addColorStop(0.55, '#4c443f');
  base.addColorStop(1, '#332c29');
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);

  // Moteado mineral.
  for (let index = 0; index < 2600; index += 1) {
    const luminance = 40 + random() * 34;
    context.fillStyle = `rgba(${luminance + 12}, ${luminance + 6}, ${luminance}, ${0.12 + random() * 0.18})`;
    context.fillRect(random() * size, random() * size, 1 + random() * 2.4, 1 + random() * 2.4);
  }

  // Juntas de losas en anillos concéntricos + radios, como en la referencia.
  context.strokeStyle = 'rgba(12, 10, 9, 0.6)';
  context.lineWidth = 3;
  for (let ring = 1; ring <= 5; ring += 1) {
    context.beginPath();
    context.arc(center, center, ring * size * 0.095, 0, Math.PI * 2);
    context.stroke();
  }
  const spokes = 26;
  for (let index = 0; index < spokes; index += 1) {
    const angle = (index / spokes) * Math.PI * 2;
    context.beginPath();
    context.moveTo(center + Math.cos(angle) * size * 0.11, center + Math.sin(angle) * size * 0.11);
    context.lineTo(center + Math.cos(angle) * size * 0.5, center + Math.sin(angle) * size * 0.5);
    context.stroke();
  }

  // Incrustaciones doradas (se leen también en el emissiveMap).
  context.strokeStyle = 'rgba(212, 168, 92, 0.55)';
  context.shadowColor = 'rgba(232, 190, 110, 0.55)';
  context.shadowBlur = 6;
  context.lineWidth = 3.4;
  for (const radius of [0.155, 0.345, 0.475]) {
    context.beginPath();
    context.arc(center, center, size * radius, 0, Math.PI * 2);
    context.stroke();
  }
  context.lineWidth = 2;
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2 + Math.PI / 8;
    context.beginPath();
    context.moveTo(center + Math.cos(angle) * size * 0.16, center + Math.sin(angle) * size * 0.16);
    context.lineTo(center + Math.cos(angle) * size * 0.47, center + Math.sin(angle) * size * 0.47);
    context.stroke();
  }
  context.shadowBlur = 0;
  return finishTexture('stone-floor', canvas);
};

/** Círculo rúnico azul incandescente (fondo transparente) para incrustar en el suelo. */
export const runicCircleTexture = (): CanvasTexture => {
  const cached = cache.get('runic-circle');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x43495243);
  const center = size / 2;
  context.clearRect(0, 0, size, size);

  context.strokeStyle = 'rgba(120, 200, 255, 0.95)';
  context.shadowColor = 'rgba(120, 200, 255, 0.9)';
  context.shadowBlur = 14;
  context.lineWidth = 5;
  context.beginPath();
  context.arc(center, center, size * 0.42, 0, Math.PI * 2);
  context.stroke();
  context.lineWidth = 2.6;
  context.beginPath();
  context.arc(center, center, size * 0.34, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(center, center, size * 0.12, 0, Math.PI * 2);
  context.stroke();

  // Glifos entre los anillos y triángulos internos.
  const glyphs = 12;
  for (let index = 0; index < glyphs; index += 1) {
    const angle = (index / glyphs) * Math.PI * 2;
    drawGlyph(context, center + Math.cos(angle) * size * 0.38, center + Math.sin(angle) * size * 0.38, 20, random);
  }
  context.beginPath();
  for (let index = 0; index <= 3; index += 1) {
    const angle = (index / 3) * Math.PI * 2 - Math.PI / 2;
    const x = center + Math.cos(angle) * size * 0.3;
    const y = center + Math.sin(angle) * size * 0.3;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
  context.shadowBlur = 0;
  return finishTexture('runic-circle', canvas);
};

/** Espiral del portal arcano (se anima rotando el plano que la usa). */
export const portalSwirlTexture = (): CanvasTexture => {
  const cached = cache.get('portal-swirl');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const center = size / 2;
  context.clearRect(0, 0, size, size);
  const glowBase = context.createRadialGradient(center, center, 0, center, center, center);
  glowBase.addColorStop(0, 'rgba(220, 245, 255, 0.9)');
  glowBase.addColorStop(0.35, 'rgba(90, 170, 255, 0.55)');
  glowBase.addColorStop(0.8, 'rgba(30, 70, 180, 0.25)');
  glowBase.addColorStop(1, 'rgba(10, 25, 90, 0)');
  context.fillStyle = glowBase;
  context.fillRect(0, 0, size, size);
  context.strokeStyle = 'rgba(190, 230, 255, 0.8)';
  context.shadowColor = 'rgba(150, 210, 255, 0.9)';
  context.shadowBlur = 10;
  for (let arm = 0; arm < 4; arm += 1) {
    context.lineWidth = 6 - arm;
    context.beginPath();
    const offset = (arm / 4) * Math.PI * 2;
    for (let step = 0; step <= 90; step += 1) {
      const progress = step / 90;
      const angle = offset + progress * Math.PI * 3.4;
      const radius = progress * center * 0.92;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
  context.shadowBlur = 0;
  return finishTexture('portal-swirl', canvas);
};

/** Cielo cósmico: nebulosas y polvo estelar para la esfera de fondo. */
export const nebulaTexture = (): CanvasTexture => {
  const cached = cache.get('nebula');
  if (cached) return cached;
  const size = 1024;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x4e454255);
  context.fillStyle = '#070b1c';
  context.fillRect(0, 0, size, size);
  const blobs: readonly (readonly [string, number])[] = [
    ['rgba(64, 66, 148, 0.34)', 220],
    ['rgba(108, 62, 158, 0.27)', 190],
    ['rgba(40, 90, 190, 0.3)', 240],
    ['rgba(150, 90, 190, 0.18)', 150],
    ['rgba(70, 130, 220, 0.24)', 200],
  ];
  for (const [color, radius] of blobs) {
    for (let index = 0; index < 5; index += 1) {
      const x = random() * size;
      const y = random() * size;
      const r = radius * (0.6 + random() * 0.8);
      const gradient = context.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(7, 11, 28, 0)');
      context.fillStyle = gradient;
      context.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
  for (let index = 0; index < 900; index += 1) {
    const brightness = 0.25 + random() * 0.75;
    context.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
    const radius = random() < 0.06 ? 1.6 : 0.9;
    context.beginPath();
    context.arc(random() * size, random() * size, radius, 0, Math.PI * 2);
    context.fill();
  }
  return finishTexture('nebula', canvas);
};

/** Traza una grieta ramificada con sombra y brillo desplazado (relieve). */
const carveCrack = (
  context: CanvasRenderingContext2D,
  random: () => number,
  startX: number,
  startY: number,
  segments: number,
) => {
  const points: [number, number][] = [[startX, startY]];
  let x = startX;
  let y = startY;
  for (let segment = 0; segment < segments; segment += 1) {
    x += (random() - 0.5) * 52;
    y += 16 + random() * 30;
    points.push([x, y]);
  }
  // Luz desplazada (labio superior de la grieta) y surco oscuro encima.
  for (const [offset, style, width] of [
    [1.8, 'rgba(235, 232, 240, 0.5)', 2.2],
    [0, 'rgba(28, 26, 36, 0.85)', 2.6],
  ] as const) {
    context.strokeStyle = style;
    context.lineWidth = width;
    context.beginPath();
    points.forEach(([px, py], index) => {
      if (index === 0) context.moveTo(px + offset, py + offset);
      else context.lineTo(px + offset, py + offset);
    });
    context.stroke();
  }
};

/**
 * Losa de pavimento tallada para las casillas del tablero: roca con
 * estratos, cincelado profundo, grietas con relieve, esquinas melladas y
 * runas grabadas en algunas variantes. Cuatro variantes cacheadas.
 * Sirve como map y como bumpMap (el contraste alto alimenta el relieve).
 */
export const slabTexture = (variant: 0 | 1 | 2 | 3 = 0): CanvasTexture => {
  const key = `slab-${variant}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const size = 256;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x534c4142 + variant * 977);

  // Base de roca gris azulada con manchas minerales (sin bandas de madera).
  const base = context.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, '#a6a8b4');
  base.addColorStop(0.5, '#90929f');
  base.addColorStop(1, '#7f8290');
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);
  for (let patch = 0; patch < 8; patch += 1) {
    const px = random() * size;
    const py = random() * size;
    const radius = 30 + random() * 70;
    const dark = random() > 0.45;
    const gradient = context.createRadialGradient(px, py, 0, px, py, radius);
    gradient.addColorStop(0, dark
      ? `rgba(62, 62, 76, ${0.10 + random() * 0.1})`
      : `rgba(214, 214, 224, ${0.08 + random() * 0.09})`);
    gradient.addColorStop(1, 'rgba(120, 120, 136, 0)');
    context.fillStyle = gradient;
    context.fillRect(px - radius, py - radius, radius * 2, radius * 2);
  }

  // Grano mineral grueso.
  for (let grain = 0; grain < 2400; grain += 1) {
    const luminance = 96 + random() * 110;
    context.fillStyle = `rgba(${luminance}, ${luminance - 2}, ${luminance + 8}, ${0.06 + random() * 0.14})`;
    context.fillRect(random() * size, random() * size, 1 + random() * 2.6, 1 + random() * 2.2);
  }

  // Marcas de cincel: trazos cortos paralelos en dos zonas.
  for (let zone = 0; zone < 2; zone += 1) {
    const zx = random() * size * 0.6;
    const zy = random() * size * 0.6;
    const angle = random() * Math.PI;
    for (let mark = 0; mark < 7; mark += 1) {
      const mx = zx + Math.cos(angle + 1.57) * mark * 9;
      const my = zy + Math.sin(angle + 1.57) * mark * 9;
      context.strokeStyle = 'rgba(40, 38, 50, 0.4)';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(mx, my);
      context.lineTo(mx + Math.cos(angle) * (14 + random() * 12), my + Math.sin(angle) * (14 + random() * 12));
      context.stroke();
      context.strokeStyle = 'rgba(226, 224, 232, 0.3)';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(mx + 1.4, my + 1.4);
      context.lineTo(mx + 1.4 + Math.cos(angle) * 12, my + 1.4 + Math.sin(angle) * 12);
      context.stroke();
    }
  }

  // Una grieta ramificada con relieve (dos solo en la variante 1).
  carveCrack(context, random, size * (0.2 + random() * 0.45), size * 0.1, 3 + Math.floor(random() * 2));
  if (variant === 1) {
    carveCrack(context, random, size * (0.55 + random() * 0.3), size * 0.45, 3);
  }

  // Runa grabada discreta solo en una de las cuatro variantes.
  if (variant === 3) {
    context.strokeStyle = 'rgba(40, 38, 52, 0.5)';
    context.lineWidth = 3;
    context.shadowColor = 'rgba(238, 235, 244, 0.35)';
    context.shadowBlur = 0;
    context.shadowOffsetX = 1.6;
    context.shadowOffsetY = 1.6;
    drawGlyph(context, size / 2, size / 2, 40, random);
    context.beginPath();
    context.arc(size / 2, size / 2, 52, 0, Math.PI * 2);
    context.stroke();
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
  }

  // Esquinas melladas (desconchones triangulares oscuros).
  for (const [cx, cy] of [[0, 0], [size, 0], [0, size], [size, size]] as const) {
    if (random() > 0.55) continue;
    const reach = 14 + random() * 26;
    context.fillStyle = 'rgba(46, 44, 56, 0.55)';
    context.beginPath();
    context.moveTo(cx, cy);
    context.lineTo(cx + (cx === 0 ? reach : -reach), cy);
    context.lineTo(cx, cy + (cy === 0 ? reach : -reach));
    context.closePath();
    context.fill();
  }

  // Bisel perimetral profundo: surco oscuro + labio iluminado.
  context.strokeStyle = 'rgba(26, 25, 34, 0.72)';
  context.lineWidth = 10;
  context.strokeRect(0, 0, size, size);
  context.strokeStyle = 'rgba(238, 235, 244, 0.34)';
  context.lineWidth = 3;
  context.strokeRect(8, 8, size - 16, size - 16);
  return finishTexture(key, canvas);
};

/**
 * Incrustación dorada grabada en el suelo de la plaza: anillos concéntricos
 * con filigrana, corona de runas y rayos cardinales. Fondo transparente;
 * se apoya plano sobre la piedra (nada de aros flotantes).
 */
export const goldFloorInlayTexture = (): CanvasTexture => {
  const cached = cache.get('gold-floor-inlay');
  if (cached) return cached;
  const size = 1024;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x494e4c59);
  const center = size / 2;
  context.clearRect(0, 0, size, size);

  const gold = (alpha: number) => `rgba(226, 182, 96, ${alpha})`;
  const goldDark = (alpha: number) => `rgba(146, 108, 42, ${alpha})`;

  const ring = (radius: number, width: number, alpha = 0.95) => {
    // Sombra de grabado bajo el oro y trazo dorado encima.
    context.strokeStyle = goldDark(alpha * 0.9);
    context.lineWidth = width + 3;
    context.beginPath();
    context.arc(center, center + 1.5, radius, 0, Math.PI * 2);
    context.stroke();
    context.strokeStyle = gold(alpha);
    context.lineWidth = width;
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.stroke();
  };

  // Banda principal (vive en el mandil de la plaza, alrededor del tablero).
  ring(size * 0.455, 7);
  ring(size * 0.418, 3);
  ring(size * 0.372, 5);
  ring(size * 0.345, 2, 0.8);

  // Corona de runas entre las bandas.
  context.strokeStyle = gold(0.9);
  context.lineWidth = 3;
  const glyphs = 28;
  for (let index = 0; index < glyphs; index += 1) {
    if (index % 7 === 3) continue; // runas quebradas: huecos deliberados
    const angle = (index / glyphs) * Math.PI * 2;
    drawGlyph(context, center + Math.cos(angle) * size * 0.394, center + Math.sin(angle) * size * 0.394, 20, random);
  }

  // Rayos cardinales y diagonales con remate de rombo.
  for (let ray = 0; ray < 8; ray += 1) {
    const angle = (ray / 8) * Math.PI * 2;
    const inner = size * 0.345;
    const outer = size * 0.47;
    context.strokeStyle = gold(ray % 2 === 0 ? 0.95 : 0.6);
    context.lineWidth = ray % 2 === 0 ? 5 : 2.5;
    context.beginPath();
    context.moveTo(center + Math.cos(angle) * inner, center + Math.sin(angle) * inner);
    context.lineTo(center + Math.cos(angle) * outer, center + Math.sin(angle) * outer);
    context.stroke();
    if (ray % 2 === 0) {
      const dx = center + Math.cos(angle) * (outer + 8);
      const dy = center + Math.sin(angle) * (outer + 8);
      context.fillStyle = gold(0.95);
      context.save();
      context.translate(dx, dy);
      context.rotate(angle + Math.PI / 4);
      context.fillRect(-7, -7, 14, 14);
      context.restore();
    }
  }

  // Filigrana de arcos pequeños en la banda exterior.
  context.strokeStyle = gold(0.55);
  context.lineWidth = 2;
  const petals = 56;
  for (let index = 0; index < petals; index += 1) {
    const angle = (index / petals) * Math.PI * 2;
    const px = center + Math.cos(angle) * size * 0.437;
    const py = center + Math.sin(angle) * size * 0.437;
    context.beginPath();
    context.arc(px, py, 9, angle + Math.PI * 0.25, angle + Math.PI * 1.2);
    context.stroke();
  }
  return finishTexture('gold-floor-inlay', canvas);
};

/**
 * Sillería de piedra tileable para revestir la arquitectura del GLB en
 * runtime: hiladas de bloques con juntas desfasadas, variación tonal por
 * bloque, desgaste y regueros de intemperie. Sirve como map y bumpMap.
 */
export const masonryTexture = (): CanvasTexture => {
  const cached = cache.get('masonry');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x4d41534f);

  context.fillStyle = '#9a9aa2';
  context.fillRect(0, 0, size, size);

  const rows = 8;
  const rowHeight = size / rows;
  for (let row = 0; row < rows; row += 1) {
    const offset = row % 2 === 0 ? 0 : rowHeight * 0.9;
    const blocks = 4 + (row % 2);
    const blockWidth = size / blocks;
    for (let block = -1; block <= blocks; block += 1) {
      const x = block * blockWidth + offset;
      const y = row * rowHeight;
      // Tono base por bloque con deriva fría/cálida sutil.
      const value = 128 + (random() - 0.5) * 44;
      const warm = (random() - 0.5) * 10;
      context.fillStyle = `rgb(${value + warm}, ${value + warm * 0.4}, ${value - warm + 8})`;
      context.fillRect(x + 2, y + 2, blockWidth - 4, rowHeight - 4);
      // Sombreado inferior del bloque (bisel).
      context.fillStyle = 'rgba(30, 30, 40, 0.28)';
      context.fillRect(x + 2, y + rowHeight - 7, blockWidth - 4, 5);
      context.fillStyle = 'rgba(255, 255, 255, 0.10)';
      context.fillRect(x + 2, y + 2, blockWidth - 4, 3);
      // Moteado interior.
      for (let grain = 0; grain < 26; grain += 1) {
        const luminance = 70 + random() * 120;
        context.fillStyle = `rgba(${luminance}, ${luminance}, ${luminance + 8}, ${0.05 + random() * 0.1})`;
        context.fillRect(x + 3 + random() * (blockWidth - 8), y + 3 + random() * (rowHeight - 8), 1 + random() * 2.4, 1 + random() * 2);
      }
      // Desconchones ocasionales.
      if (random() > 0.72) {
        context.fillStyle = 'rgba(52, 52, 62, 0.35)';
        context.beginPath();
        context.arc(x + random() * blockWidth, y + random() * rowHeight, 3 + random() * 7, 0, Math.PI * 2);
        context.fill();
      }
    }
    // Junta horizontal.
    context.fillStyle = 'rgba(24, 24, 32, 0.85)';
    context.fillRect(0, row * rowHeight - 1, size, 3);
  }
  // Regueros verticales de intemperie.
  for (let streak = 0; streak < 14; streak += 1) {
    const x = random() * size;
    const height = size * (0.2 + random() * 0.5);
    const y = random() * (size - height);
    const gradient = context.createLinearGradient(0, y, 0, y + height);
    gradient.addColorStop(0, 'rgba(40, 42, 52, 0)');
    gradient.addColorStop(0.4, `rgba(40, 42, 52, ${0.10 + random() * 0.12})`);
    gradient.addColorStop(1, 'rgba(40, 42, 52, 0)');
    context.fillStyle = gradient;
    context.fillRect(x, y, 2 + random() * 5, height);
  }

  const texture = finishTexture('masonry', canvas);
  texture.wrapS = 1000; // RepeatWrapping
  texture.wrapT = 1000;
  return texture;
};

/** Cielo de amanecer para Aether Citadel: horizonte cálido, cénit azul y nubes lejanas. */
export const dawnSkyTexture = (): CanvasTexture => {
  const cached = cache.get('dawn-sky');
  if (cached) return cached;
  const size = 1024;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x44415741);

  const sky = context.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, '#2c3a66');
  sky.addColorStop(0.42, '#51649c');
  sky.addColorStop(0.62, '#8b93b8');
  sky.addColorStop(0.74, '#d9a878');
  sky.addColorStop(0.85, '#f2c48d');
  sky.addColorStop(1, '#8a7290');
  context.fillStyle = sky;
  context.fillRect(0, 0, size, size);

  // Resplandor del sol bajo en el horizonte.
  const sun = context.createRadialGradient(size * 0.31, size * 0.76, 0, size * 0.31, size * 0.76, size * 0.34);
  sun.addColorStop(0, 'rgba(255, 236, 200, 0.95)');
  sun.addColorStop(0.35, 'rgba(255, 202, 138, 0.5)');
  sun.addColorStop(1, 'rgba(255, 190, 120, 0)');
  context.fillStyle = sun;
  context.fillRect(0, 0, size, size);

  // Bandas de nubes lejanas iluminadas por debajo.
  for (let band = 0; band < 26; band += 1) {
    const y = size * (0.55 + random() * 0.36);
    const width = size * (0.12 + random() * 0.3);
    const height = size * (0.012 + random() * 0.02);
    const x = random() * size;
    const warm = y > size * 0.7;
    const gradient = context.createRadialGradient(x, y, 0, x, y, width);
    gradient.addColorStop(0, warm ? 'rgba(255, 214, 168, 0.34)' : 'rgba(206, 216, 240, 0.26)');
    gradient.addColorStop(1, 'rgba(200, 200, 230, 0)');
    context.fillStyle = gradient;
    context.save();
    context.translate(x, y);
    context.scale(1, height / width);
    context.beginPath();
    context.arc(0, 0, width, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  // Estrellas tenues que sobreviven al amanecer en el cénit.
  for (let index = 0; index < 160; index += 1) {
    const y = random() * size * 0.4;
    context.fillStyle = `rgba(255, 255, 255, ${0.14 + random() * 0.3})`;
    context.beginPath();
    context.arc(random() * size, y, 0.9, 0, Math.PI * 2);
    context.fill();
  }
  return finishTexture('dawn-sky', canvas);
};

/** Nube suave para los bancos de niebla bajo la plataforma. */
export const cloudTexture = (): CanvasTexture => {
  const cached = cache.get('cloud');
  if (cached) return cached;
  const size = 256;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x434c4f55);
  context.clearRect(0, 0, size, size);
  for (let index = 0; index < 18; index += 1) {
    const x = size * (0.2 + random() * 0.6);
    const y = size * (0.35 + random() * 0.3);
    const radius = size * (0.1 + random() * 0.16);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(216, 224, 244, 0.5)');
    gradient.addColorStop(1, 'rgba(216, 224, 244, 0)');
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  return finishTexture('cloud', canvas);
};

/** Halo radial suave para llamas, brasas y auras. */
export const glowTexture = (tint: 'ember' | 'arcane' | 'gold'): CanvasTexture => {
  const key = `glow-${tint}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const size = 128;
  const [canvas, context] = makeCanvas(size);
  const colors =
    tint === 'ember'
      ? ['rgba(255, 236, 190, 0.95)', 'rgba(255, 138, 61, 0.55)', 'rgba(200, 50, 20, 0)']
      : tint === 'arcane'
        ? ['rgba(226, 250, 255, 0.95)', 'rgba(105, 205, 255, 0.5)', 'rgba(40, 90, 200, 0)']
        : ['rgba(255, 248, 218, 0.95)', 'rgba(233, 196, 116, 0.5)', 'rgba(160, 110, 40, 0)'];
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, colors[0]!);
  gradient.addColorStop(0.4, colors[1]!);
  gradient.addColorStop(1, colors[2]!);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return finishTexture(key, canvas);
};

/**
 * Suelo de lava para la Fragua de la Caldera: roca basáltica agrietada con
 * vetas incandescentes que serpentean entre las fisuras. Se usa como plano
 * bajo la escenografía, no como sillería tileable, así que las grietas se
 * distribuyen radialmente desde el centro sin repetición.
 */
export const lavaFloorTexture = (): CanvasTexture => {
  const cached = cache.get('lava-floor');
  if (cached) return cached;
  const size = 1024;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x4c415641);
  const center = size / 2;

  // Roca basáltica oscura de base, con variación tonal suave.
  context.fillStyle = '#170805';
  context.fillRect(0, 0, size, size);
  for (let index = 0; index < 260; index += 1) {
    const x = random() * size;
    const y = random() * size;
    const radius = 12 + random() * 46;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    const shade = 8 + Math.floor(random() * 10);
    gradient.addColorStop(0, `rgba(${shade + 12}, ${shade + 4}, ${shade}, 0.5)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Vetas de lava: líneas quebradas que irradian desde varios focos, con
  // núcleo blanco-amarillo y halo naranja-rojo, como grietas incandescentes.
  const veinFrom = (originX: number, originY: number, branches: number) => {
    for (let branch = 0; branch < branches; branch += 1) {
      let x = originX;
      let y = originY;
      let angle = random() * Math.PI * 2;
      const segments = 8 + Math.floor(random() * 10);
      const points: [number, number][] = [[x, y]];
      for (let step = 0; step < segments; step += 1) {
        angle += (random() - 0.5) * 1.1;
        const length = 18 + random() * 34;
        x += Math.cos(angle) * length;
        y += Math.sin(angle) * length;
        points.push([x, y]);
      }
      const draw = (width: number, color: string) => {
        context.strokeStyle = color;
        context.lineWidth = width;
        context.lineCap = 'round';
        context.beginPath();
        points.forEach(([px, py], index) => (index === 0 ? context.moveTo(px, py) : context.lineTo(px, py)));
        context.stroke();
      };
      draw(9, 'rgba(255, 92, 20, 0.5)'); // halo exterior
      draw(4.5, 'rgba(255, 140, 40, 0.85)'); // veta
      draw(1.8, 'rgba(255, 226, 160, 0.95)'); // núcleo brillante
    }
  };
  veinFrom(center, center, 6);
  veinFrom(center * 0.5, center * 0.7, 4);
  veinFrom(center * 1.5, center * 1.25, 4);
  veinFrom(center * 0.7, center * 1.5, 3);
  veinFrom(center * 1.35, center * 0.45, 3);

  // Motas de brasa dispersas entre las grietas.
  for (let index = 0; index < 90; index += 1) {
    const x = random() * size;
    const y = random() * size;
    context.fillStyle = `rgba(255, ${150 + Math.floor(random() * 80)}, ${60 + Math.floor(random() * 60)}, ${0.3 + random() * 0.4})`;
    context.beginPath();
    context.arc(x, y, 1 + random() * 2.4, 0, Math.PI * 2);
    context.fill();
  }

  return finishTexture('lava-floor', canvas);
};
