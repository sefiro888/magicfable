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
