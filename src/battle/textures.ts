import { CanvasTexture, NoColorSpace, SRGBColorSpace } from 'three';

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

/**
 * Puñado de lóbulos redondos superpuestos con degradado suave: la técnica
 * más simple para que una nube lea como un volumen esponjoso en vez de una
 * elipse plana. `tint` es el color de la cara iluminada (por debajo/lado del
 * sol); el resto de cada lóbulo se desvanece hacia transparente.
 */
const drawCloudPuff = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  tint: string,
  shadeTint: string,
  random: () => number,
) => {
  const lobes = 5 + Math.floor(random() * 4);
  for (let index = 0; index < lobes; index += 1) {
    const angle = (index / lobes) * Math.PI * 2 + random() * 0.6;
    const spread = radius * (0.42 + random() * 0.3);
    const lx = x + Math.cos(angle) * spread * 1.15;
    const ly = y + Math.sin(angle) * spread * 0.55 - radius * 0.18;
    const lr = radius * (0.4 + random() * 0.4);
    // La mitad superior del lóbulo queda más fría/oscura; la inferior, cálida y luminosa.
    const shaded = Math.sin(angle) < -0.1;
    const gradient = context.createRadialGradient(lx, ly, 0, lx, ly, lr);
    gradient.addColorStop(0, shaded ? shadeTint : tint);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(lx, ly, lr, 0, Math.PI * 2);
    context.fill();
  }
  // Núcleo central, más denso, para que el conjunto no se lea hueco.
  const core = context.createRadialGradient(x, y, 0, x, y, radius * 0.75);
  core.addColorStop(0, tint);
  core.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = core;
  context.beginPath();
  context.arc(x, y, radius * 0.75, 0, Math.PI * 2);
  context.fill();
};

/**
 * Cielo de amanecer para Aether Citadel: nubes con volumen real iluminadas
 * desde abajo y un lavado cósmico violeta entreverado con estrellas.
 *
 * La cámara de la partida mira hacia abajo desde muy cerca del tablero
 * (ver CAMERA_POSITION/CAMERA_TARGET): del cielo solo se llega a ver una
 * franja estrecha justo por encima del horizonte, rasante — nunca el cénit.
 * Por eso casi todo el detalle (nubes, nebulosa, estrellas) se concentra
 * entre v≈0.42 y v≈0.86 de esta textura en vez de repartirse por igual;
 * el resto solo aporta continuidad de color si la cámara cambia algún día.
 */
export const dawnSkyTexture = (): CanvasTexture => {
  const cached = cache.get('dawn-sky');
  if (cached) return cached;
  const size = 1536;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x44415741);

  const sky = context.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, '#1c1f3f');
  sky.addColorStop(0.3, '#2c2c5a');
  sky.addColorStop(0.42, '#453f74');
  sky.addColorStop(0.5, '#6a5c8c');
  sky.addColorStop(0.58, '#9b7d9a');
  sky.addColorStop(0.68, '#d0977f');
  sky.addColorStop(0.78, '#eeb47d');
  sky.addColorStop(0.88, '#f6cf95');
  sky.addColorStop(1, '#8a7290');
  context.fillStyle = sky;
  context.fillRect(0, 0, size, size);

  // Lavado nebuloso violeta/magenta justo en la franja que la cámara alcanza
  // a ver: manchas suaves y alargadas, no un degradado uniforme, para que
  // lea como nube cósmica entreverada con el amanecer, no como niebla plana.
  for (let index = 0; index < 7; index += 1) {
    const x = size * (0.05 + random() * 0.9);
    const y = size * (0.4 + random() * 0.28);
    const w = size * (0.16 + random() * 0.22);
    const nebula = context.createRadialGradient(x, y, 0, x, y, w);
    nebula.addColorStop(0, `rgba(${180 + random() * 40 | 0}, ${140 + random() * 30 | 0}, ${230 + random() * 20 | 0}, ${0.22 + random() * 0.14})`);
    nebula.addColorStop(1, 'rgba(150, 120, 220, 0)');
    context.fillStyle = nebula;
    context.save();
    context.translate(x, y);
    context.scale(1.7, 0.85);
    context.beginPath();
    context.arc(0, 0, w, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  // Resplandor del sol bajo en el horizonte.
  const sun = context.createRadialGradient(size * 0.31, size * 0.72, 0, size * 0.31, size * 0.72, size * 0.36);
  sun.addColorStop(0, 'rgba(255, 240, 210, 0.98)');
  sun.addColorStop(0.3, 'rgba(255, 210, 150, 0.55)');
  sun.addColorStop(1, 'rgba(255, 190, 120, 0)');
  context.fillStyle = sun;
  context.fillRect(0, 0, size, size);

  // Estrellas que sobreviven al amanecer, concentradas donde la cámara
  // llega a rozarlas entre las nubes, con un puñado destacando en cruz.
  for (let index = 0; index < 140; index += 1) {
    const y = size * (0.36 + random() * 0.3);
    const bright = random() > 0.9;
    const r = bright ? 1.8 + random() * 1.3 : 0.5 + random() * 0.9;
    const x = random() * size;
    const fade = 1 - Math.max(0, (y / size - 0.55) * 2.2); // se apagan según se acercan al resplandor cálido
    context.fillStyle = `rgba(255, 255, 255, ${Math.max(0, (0.18 + random() * 0.36) * fade)})`;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fill();
    if (bright && random() > 0.45 && fade > 0.3) {
      context.save();
      context.globalAlpha = 0.5 * fade;
      context.strokeStyle = '#ffffff';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x - r * 3.4, y);
      context.lineTo(x + r * 3.4, y);
      context.moveTo(x, y - r * 3.4);
      context.lineTo(x, y + r * 3.4);
      context.stroke();
      context.restore();
    }
  }

  // Nubes con volumen real: puñados de lóbulos superpuestos, concentradas
  // en la franja visible y más densas y cálidas hacia el horizonte.
  for (let index = 0; index < 34; index += 1) {
    const horizonBias = random() * random(); // sesga hacia el horizonte sin descartar el resto de la franja
    const y = size * (0.44 + horizonBias * 0.42);
    const x = random() * size;
    const radius = size * (0.045 + random() * 0.08) * (0.7 + horizonBias);
    const warmth = Math.min(1, (y / size - 0.5) * 2.2);
    const tint = `rgba(255, ${226 - warmth * 10 | 0}, ${196 + warmth * 20 | 0}, ${0.42 + warmth * 0.28})`;
    const shadeTint = `rgba(${150 + warmth * 60 | 0}, ${140 + warmth * 50 | 0}, ${195 - warmth * 30 | 0}, ${0.32 + warmth * 0.15})`;
    drawCloudPuff(context, x, y, radius, tint, shadeTint, random);
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
/** Tonos disponibles para `glowTexture`: uno por facción (más el genérico "gold" de Orden). */
export type GlowTint = 'ember' | 'arcane' | 'gold' | 'nature' | 'shadow' | 'void';

/** Tres paradas de degradado radial (centro, medio, borde) por cada tinte, en `rgba()`. */
const GLOW_COLORS: Readonly<Record<GlowTint, readonly [string, string, string]>> = {
  ember: ['rgba(255, 236, 190, 0.95)', 'rgba(255, 138, 61, 0.55)', 'rgba(200, 50, 20, 0)'],
  arcane: ['rgba(226, 250, 255, 0.95)', 'rgba(105, 205, 255, 0.5)', 'rgba(40, 90, 200, 0)'],
  gold: ['rgba(255, 248, 218, 0.95)', 'rgba(233, 196, 116, 0.5)', 'rgba(160, 110, 40, 0)'],
  // Naturaleza: verde hoja, a juego con el acento de la facción (#a7db67).
  nature: ['rgba(232, 250, 210, 0.95)', 'rgba(167, 219, 103, 0.55)', 'rgba(57, 117, 58, 0)'],
  // Sombra: violeta apagado y oscuro, a juego con su acento (#8d51aa).
  shadow: ['rgba(232, 210, 245, 0.9)', 'rgba(141, 81, 170, 0.55)', 'rgba(38, 29, 45, 0)'],
  // Vacío: magenta vivo, a juego con su acento (#c775ff) — más luminoso que Sombra para distinguirlas.
  void: ['rgba(245, 220, 255, 0.95)', 'rgba(199, 117, 255, 0.6)', 'rgba(89, 50, 125, 0)'],
};

export const glowTexture = (tint: GlowTint): CanvasTexture => {
  const key = `glow-${tint}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const size = 128;
  const [canvas, context] = makeCanvas(size);
  const colors = GLOW_COLORS[tint];
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.4, colors[1]);
  gradient.addColorStop(1, colors[2]);
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

/**
 * Agua oscura del lago que rodea el Santuario: azul de noche con ondulaciones
 * claras. Se usa en un plano grande y repetido, y el material la desplaza
 * lentamente para que el lago parezca moverse sin coste de simulación.
 */
export const nightWaterTexture = (): CanvasTexture => {
  const cached = cache.get('night-water');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x57415445);

  context.fillStyle = '#060d1c';
  context.fillRect(0, 0, size, size);
  // Manchas de profundidad: el agua no es un color plano.
  for (let index = 0; index < 120; index += 1) {
    const x = random() * size;
    const y = random() * size;
    const radius = 30 + random() * 90;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(20, 44, 78, ${0.1 + random() * 0.18})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  // Crestas: arcos finos y tendidos, más densos cuanto más claros.
  for (let index = 0; index < 260; index += 1) {
    const y = random() * size;
    const x = random() * size;
    const width = 20 + random() * 90;
    const alpha = 0.05 + random() * 0.22;
    context.strokeStyle = `rgba(150, 200, 255, ${alpha})`;
    context.lineWidth = 0.6 + random() * 1.4;
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(x + width / 2, y - 3 - random() * 5, x + width, y);
    context.stroke();
  }
  return finishTexture('night-water', canvas);
};

/**
 * Basalto de la Caldera: roca volcánica casi negra con juntas de columna
 * hexagonal y algún rescoldo atrapado. Tileable, para paredes y columnas.
 */
export const basaltTexture = (): CanvasTexture => {
  const cached = cache.get('basalt');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x42415341);

  context.fillStyle = '#120a09';
  context.fillRect(0, 0, size, size);
  for (let index = 0; index < 700; index += 1) {
    const shade = 14 + Math.floor(random() * 26);
    context.fillStyle = `rgba(${shade + 10}, ${shade}, ${shade - 2}, ${0.25 + random() * 0.4})`;
    context.fillRect(random() * size, random() * size, 1 + random() * 3, 1 + random() * 3);
  }
  // Juntas verticales: el basalto se rompe en prismas alargados.
  for (let index = 0; index < 22; index += 1) {
    const x = random() * size;
    context.strokeStyle = `rgba(0, 0, 0, ${0.35 + random() * 0.35})`;
    context.lineWidth = 1 + random() * 3;
    context.beginPath();
    context.moveTo(x, 0);
    for (let y = 0; y <= size; y += 32) context.lineTo(x + (random() - 0.5) * 10, y);
    context.stroke();
  }
  // Rescoldos: pocas vetas naranjas, para que el negro no quede muerto.
  for (let index = 0; index < 14; index += 1) {
    const x = random() * size;
    const y = random() * size;
    context.strokeStyle = `rgba(255, ${90 + Math.floor(random() * 90)}, 30, ${0.25 + random() * 0.35})`;
    context.lineWidth = 1 + random() * 2;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + (random() - 0.5) * 60, y + (random() - 0.5) * 60);
    context.stroke();
  }
  return finishTexture('basalt', canvas);
};

/**
 * Hierro de fragua: metal oscuro martilleado con remaches, para el armazón que
 * sostiene el tablero sobre la lava.
 */
export const forgeIronTexture = (): CanvasTexture => {
  const cached = cache.get('forge-iron');
  if (cached) return cached;
  const size = 256;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x4952454e);

  const base = context.createLinearGradient(0, 0, 0, size);
  base.addColorStop(0, '#2e2723');
  base.addColorStop(1, '#171310');
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);
  // Marcas de martillo: óvalos claros muy tenues.
  for (let index = 0; index < 90; index += 1) {
    const x = random() * size;
    const y = random() * size;
    const r = 4 + random() * 9;
    const gradient = context.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(120, 104, 92, ${0.12 + random() * 0.16})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // Remaches en los bordes.
  for (const y of [14, size - 14]) {
    for (let x = 14; x < size; x += 34) {
      context.fillStyle = 'rgba(150, 130, 112, 0.55)';
      context.beginPath();
      context.arc(x, y, 3.4, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = 'rgba(0, 0, 0, 0.45)';
      context.beginPath();
      context.arc(x + 1, y + 1.4, 2.2, 0, Math.PI * 2);
      context.fill();
    }
  }
  return finishTexture('forge-iron', canvas);
};

/**
 * Piedra musgosa del Santuario: granito gris azulado con líquenes verdes.
 * Es el suelo de la isla y la carne de los monolitos rotos.
 */
export const mossStoneTexture = (): CanvasTexture => {
  const cached = cache.get('moss-stone');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x4d4f5353);

  // Granito CLARO: en 3D esta textura multiplica al color del material, así
  // que si la base es oscura las piedras salen como siluetas negras de noche.
  context.fillStyle = '#8b95a3';
  context.fillRect(0, 0, size, size);
  for (let index = 0; index < 600; index += 1) {
    const shade = 130 + Math.floor(random() * 60);
    context.fillStyle = `rgba(${shade}, ${shade + 6}, ${shade + 14}, ${0.2 + random() * 0.35})`;
    context.fillRect(random() * size, random() * size, 1 + random() * 3, 1 + random() * 3);
  }
  // Líquenes: manchas verdes irregulares agrupadas.
  for (let index = 0; index < 55; index += 1) {
    const cx = random() * size;
    const cy = random() * size;
    for (let blob = 0; blob < 12; blob += 1) {
      const x = cx + (random() - 0.5) * 60;
      const y = cy + (random() - 0.5) * 60;
      const r = 3 + random() * 12;
      context.fillStyle = `rgba(${86 + Math.floor(random() * 40)}, ${126 + Math.floor(random() * 50)}, ${82 + Math.floor(random() * 30)}, ${0.12 + random() * 0.24})`;
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fill();
    }
  }
  // Grietas.
  for (let index = 0; index < 30; index += 1) {
    let x = random() * size;
    let y = random() * size;
    context.strokeStyle = `rgba(28, 32, 40, ${0.3 + random() * 0.4})`;
    context.lineWidth = 0.8 + random() * 1.8;
    context.beginPath();
    context.moveTo(x, y);
    for (let step = 0; step < 5; step += 1) {
      x += (random() - 0.5) * 70;
      y += (random() - 0.5) * 70;
      context.lineTo(x, y);
    }
    context.stroke();
  }
  return finishTexture('moss-stone', canvas);
};

/**
 * Mármol claro de la Ciudadela: piedra pulida con vetas doradas finas. Es lo
 * contrario del granito del Santuario y del basalto de la Caldera — cada sitio
 * tiene su material, y por eso no comparten textura.
 */
export const marbleTexture = (): CanvasTexture => {
  const cached = cache.get('marble');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x4d415242);

  const base = context.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, '#efe6d6');
  base.addColorStop(0.5, '#e2d6c2');
  base.addColorStop(1, '#d6c8b2');
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);
  // Nubes de tono: el mármol nunca es liso.
  for (let index = 0; index < 90; index += 1) {
    const x = random() * size;
    const y = random() * size;
    const radius = 30 + random() * 110;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255, 250, 240, ${0.1 + random() * 0.2})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  // Vetas: grises frías y algún hilo dorado.
  for (let index = 0; index < 26; index += 1) {
    let x = random() * size;
    let y = random() * size;
    const golden = index % 5 === 0;
    context.strokeStyle = golden
      ? `rgba(198, 158, 84, ${0.25 + random() * 0.3})`
      : `rgba(150, 142, 130, ${0.12 + random() * 0.2})`;
    context.lineWidth = golden ? 0.8 + random() : 0.6 + random() * 1.6;
    context.beginPath();
    context.moveTo(x, y);
    for (let step = 0; step < 7; step += 1) {
      x += (random() - 0.5) * 120;
      y += (random() - 0.5) * 120;
      context.lineTo(x, y);
    }
    context.stroke();
  }
  return finishTexture('marble', canvas);
};

/**
 * Arenisca tallada: la piedra de Duna. Vetas horizontales de sedimento, poros
 * y una retícula muy tenue de sillares, con jeroglíficos apuntados de vez en
 * cuando. Se dibuja a propósito muy poco contrastada: sobre ella van columnas
 * enormes, y una textura ruidosa las convertiría en confeti a lo lejos.
 */
export const sandstoneTexture = (): CanvasTexture => {
  const cached = cache.get('sandstone');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x44554e41);

  context.fillStyle = '#c9a86a';
  context.fillRect(0, 0, size, size);
  // Vetas de sedimento: bandas horizontales, que es como se deposita la arenisca.
  for (let index = 0; index < 48; index += 1) {
    const y = random() * size;
    const alto = 2 + random() * 14;
    const tono = 176 + Math.floor(random() * 46);
    context.fillStyle = `rgba(${tono}, ${tono - 26}, ${tono - 74}, ${0.2 + random() * 0.3})`;
    context.fillRect(0, y, size, alto);
  }
  // Poros y grano.
  for (let index = 0; index < 1400; index += 1) {
    const tono = 150 + Math.floor(random() * 80);
    context.fillStyle = `rgba(${tono}, ${tono - 30}, ${tono - 80}, ${0.12 + random() * 0.25})`;
    context.fillRect(random() * size, random() * size, 1 + random() * 2, 1 + random() * 2);
  }
  // Juntas de sillar, apenas insinuadas.
  context.strokeStyle = 'rgba(120, 92, 48, 0.28)';
  context.lineWidth = 1;
  for (let y = 0; y <= size; y += 64) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(size, y);
    context.stroke();
  }
  for (let fila = 0; fila * 64 <= size; fila += 1) {
    const desfase = fila % 2 === 0 ? 0 : 48;
    for (let x = desfase; x <= size; x += 96) {
      context.beginPath();
      context.moveTo(x, fila * 64);
      context.lineTo(x, fila * 64 + 64);
      context.stroke();
    }
  }
  // Jeroglíficos: trazos cortos agrupados en cartuchos, sin dibujar nada
  // legible — a esta distancia solo cuenta la silueta.
  context.strokeStyle = 'rgba(96, 72, 34, 0.4)';
  for (let grupo = 0; grupo < 10; grupo += 1) {
    const x = 20 + random() * (size - 60);
    const y = 20 + random() * (size - 60);
    for (let signo = 0; signo < 5; signo += 1) {
      context.lineWidth = 1 + random();
      context.beginPath();
      const sy = y + signo * 9;
      context.moveTo(x, sy);
      context.lineTo(x + 4 + random() * 9, sy);
      context.moveTo(x + 2, sy - 3);
      context.lineTo(x + 2, sy + 3);
      context.stroke();
    }
  }
  return finishTexture('sandstone', canvas);
};

/**
 * Arena de duna: grano fino con la ondulación que deja el viento. Va en el
 * suelo, que ocupa media pantalla, así que el patrón se mantiene suave para
 * que no cintilee al mover la cámara.
 */
export const desertSandTexture = (): CanvasTexture => {
  const cached = cache.get('desert-sand');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x53414e44);

  context.fillStyle = '#dcbc82';
  context.fillRect(0, 0, size, size);
  // Rizos del viento: ondas paralelas, ligeramente irregulares.
  for (let index = 0; index < 60; index += 1) {
    const y = (index / 60) * size + (random() - 0.5) * 5;
    context.strokeStyle = `rgba(196, 158, 100, ${0.16 + random() * 0.2})`;
    context.lineWidth = 2 + random() * 3;
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= size; x += 24) context.lineTo(x, y + Math.sin(x / 46 + index) * 4);
    context.stroke();
  }
  for (let index = 0; index < 2200; index += 1) {
    const tono = 205 + Math.floor(random() * 45);
    context.fillStyle = `rgba(${tono}, ${tono - 34}, ${tono - 92}, ${0.1 + random() * 0.2})`;
    context.fillRect(random() * size, random() * size, 1, 1);
  }
  return finishTexture('desert-sand', canvas);
};

/**
 * Cielo de mediodía en el desierto: azul lavado arriba, blanco cegador cerca
 * del horizonte y una franja dorada donde la calima levanta el polvo.
 *
 * El azul de arriba es lo que salva el escenario: sin él, con la arena y la
 * piedra del mismo tono, la escena entera se convierte en una mancha amarilla
 * sin profundidad.
 */
export const desertSkyTexture = (): CanvasTexture => {
  const cached = cache.get('desert-sky');
  if (cached) return cached;
  const size = 1024;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x53554e21);

  const sky = context.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, '#4d86bd');
  sky.addColorStop(0.24, '#7cabd4');
  sky.addColorStop(0.44, '#b7cfe0');
  sky.addColorStop(0.6, '#e9e2cd');
  sky.addColorStop(0.72, '#f6e3b4');
  sky.addColorStop(0.85, '#e9c98d');
  sky.addColorStop(1, '#d9b478');
  context.fillStyle = sky;
  context.fillRect(0, 0, size, size);

  // Calima: velos horizontales muy tenues en la franja baja, que es la única
  // que la cámara llega a ver.
  for (let index = 0; index < 26; index += 1) {
    const y = size * (0.55 + random() * 0.4);
    context.fillStyle = `rgba(255, 240, 205, ${0.04 + random() * 0.07})`;
    context.fillRect(0, y, size, 6 + random() * 26);
  }
  return finishTexture('desert-sky', canvas);
};

/**
 * Dosel del bosque visto desde abajo: hojas apretadas con claros por donde
 * entra el sol.
 *
 * Va en la cúpula del cielo del claro, así que hace de «cielo» y de techo a
 * la vez: lo que se ve arriba no es azul, son copas. Los claros son la razón
 * de ser de la textura — sin ellos el bosque queda como una cueva verde.
 */
export const canopyTexture = (): CanvasTexture => {
  const cached = cache.get('canopy');
  if (cached) return cached;
  const size = 1024;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x43414e4f);

  // Fondo: verde muy oscuro, la sombra del interior de la copa.
  const base = context.createLinearGradient(0, 0, 0, size);
  base.addColorStop(0, '#0e1a0e');
  base.addColorStop(0.55, '#162815');
  base.addColorStop(1, '#24361c');
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);

  // Claros: por donde entra la luz. Se dibujan antes que las hojas para que
  // las hojas los recorten y queden con borde dentado, no circulares.
  for (let gap = 0; gap < 26; gap += 1) {
    const gx = random() * size;
    const gy = random() * size * 0.85;
    const radius = 26 + random() * 88;
    const gradient = context.createRadialGradient(gx, gy, 0, gx, gy, radius);
    gradient.addColorStop(0, `rgba(255, 246, 208, ${0.55 + random() * 0.4})`);
    gradient.addColorStop(0.35, `rgba(206, 232, 160, ${0.3 + random() * 0.25})`);
    gradient.addColorStop(1, 'rgba(150, 190, 120, 0)');
    context.fillStyle = gradient;
    context.fillRect(gx - radius, gy - radius, radius * 2, radius * 2);
  }

  // Masas de hoja: elipses superpuestas en varios verdes.
  for (let clump = 0; clump < 620; clump += 1) {
    const cx = random() * size;
    const cy = random() * size;
    const verde = 54 + random() * 92;
    context.save();
    context.translate(cx, cy);
    context.rotate(random() * Math.PI * 2);
    context.fillStyle = `rgba(${Math.floor(verde * 0.5)}, ${Math.floor(verde)}, ${Math.floor(verde * 0.42)}, ${0.3 + random() * 0.45})`;
    context.beginPath();
    context.ellipse(0, 0, 10 + random() * 34, 5 + random() * 16, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  // Ramas: siluetas oscuras que cruzan por delante de las hojas.
  for (let branch = 0; branch < 34; branch += 1) {
    context.strokeStyle = `rgba(18, 22, 14, ${0.4 + random() * 0.4})`;
    context.lineWidth = 1.6 + random() * 6;
    context.beginPath();
    let bx = random() * size;
    let by = random() * size;
    context.moveTo(bx, by);
    for (let step = 0; step < 5; step += 1) {
      bx += (random() - 0.5) * 150;
      by += (random() - 0.5) * 110;
      context.lineTo(bx, by);
    }
    context.stroke();
  }
  return finishTexture('canopy', canvas);
};

/**
 * Corteza de árbol viejo: surcos verticales profundos, líquenes y la veta
 * partida en placas.
 *
 * Los troncos del claro usaban la textura de mampostería —piedra de sillar—
 * porque era la única con relieve a mano. A la escala a la que se ven, un
 * tronco con juntas de ladrillo canta: la corteza va SIEMPRE en vertical y
 * nunca forma retícula.
 */
export const barkTexture = (): CanvasTexture => {
  const cached = cache.get('bark');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x4241524b);

  const base = context.createLinearGradient(0, 0, size, 0);
  base.addColorStop(0, '#4a3a28');
  base.addColorStop(0.5, '#5c4832');
  base.addColorStop(1, '#3f3122');
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);

  // Surcos: recorren la altura entera con desviaciones cortas, y se bifurcan.
  for (let groove = 0; groove < 46; groove += 1) {
    let x = random() * size;
    const oscuro = random() > 0.4;
    context.strokeStyle = oscuro
      ? `rgba(24, 17, 10, ${0.4 + random() * 0.4})`
      : `rgba(126, 102, 72, ${0.2 + random() * 0.26})`;
    context.lineWidth = 1 + random() * 5;
    context.beginPath();
    context.moveTo(x, -4);
    for (let y = 0; y <= size + 4; y += 14) {
      x += (random() - 0.5) * 7;
      context.lineTo(x, y);
    }
    context.stroke();
  }

  // Placas: trozos de corteza levantada, con su sombra por un lado.
  for (let plate = 0; plate < 34; plate += 1) {
    const px = random() * size;
    const py = random() * size;
    const w = 10 + random() * 26;
    const h = 26 + random() * 80;
    context.fillStyle = `rgba(${86 + random() * 40}, ${68 + random() * 32}, ${44 + random() * 24}, ${0.16 + random() * 0.2})`;
    context.beginPath();
    context.ellipse(px, py, w / 2, h / 2, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = 'rgba(18, 12, 7, 0.34)';
    context.lineWidth = 1 + random() * 1.6;
    context.beginPath();
    context.ellipse(px + 1.5, py, w / 2, h / 2, 0, -1.2, 1.2);
    context.stroke();
  }

  // Grano fino.
  for (let grain = 0; grain < 2600; grain += 1) {
    const l = 44 + random() * 70;
    context.fillStyle = `rgba(${l + 16}, ${l}, ${l - 14}, ${0.06 + random() * 0.16})`;
    context.fillRect(random() * size, random() * size, 1 + random() * 2, 1 + random() * 4);
  }

  // Líquenes: manchas verdosas y grises, sobre todo en un lado del tronco.
  for (let lichen = 0; lichen < 24; lichen += 1) {
    const lx = random() * size * 0.55;
    const ly = random() * size;
    const radius = 6 + random() * 22;
    const gradient = context.createRadialGradient(lx, ly, 0, lx, ly, radius);
    const verdoso = random() > 0.45;
    gradient.addColorStop(0, verdoso
      ? `rgba(122, 148, 92, ${0.22 + random() * 0.24})`
      : `rgba(150, 152, 138, ${0.16 + random() * 0.2})`);
    gradient.addColorStop(1, 'rgba(120, 130, 100, 0)');
    context.fillStyle = gradient;
    context.fillRect(lx - radius, ly - radius, radius * 2, radius * 2);
  }
  return finishTexture('bark', canvas);
};

/** Suelo del bosque más allá del claro: tierra, hojarasca y helecho. */
export const forestFloorTexture = (): CanvasTexture => {
  const cached = cache.get('forest-floor');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x464c4f52);

  context.fillStyle = '#3d3a27';
  context.fillRect(0, 0, size, size);
  for (let patch = 0; patch < 40; patch += 1) {
    const px = random() * size;
    const py = random() * size;
    const radius = 20 + random() * 70;
    const musgo = random() > 0.5;
    const gradient = context.createRadialGradient(px, py, 0, px, py, radius);
    gradient.addColorStop(0, musgo
      ? `rgba(64, 92, 42, ${0.24 + random() * 0.3})`
      : `rgba(94, 76, 48, ${0.2 + random() * 0.26})`);
    gradient.addColorStop(1, 'rgba(60, 56, 38, 0)');
    context.fillStyle = gradient;
    context.fillRect(px - radius, py - radius, radius * 2, radius * 2);
  }
  // Hojarasca suelta.
  for (let leaf = 0; leaf < 320; leaf += 1) {
    context.save();
    context.translate(random() * size, random() * size);
    context.rotate(random() * Math.PI * 2);
    const otono = random() > 0.5;
    context.fillStyle = otono
      ? `rgba(${138 + random() * 62}, ${88 + random() * 44}, ${36 + random() * 26}, ${0.24 + random() * 0.3})`
      : `rgba(${72 + random() * 40}, ${98 + random() * 44}, ${44 + random() * 24}, ${0.22 + random() * 0.28})`;
    context.beginPath();
    context.ellipse(0, 0, 3 + random() * 6, 1.6 + random() * 3, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
  // Ramitas.
  for (let twig = 0; twig < 60; twig += 1) {
    context.strokeStyle = `rgba(58, 44, 28, ${0.24 + random() * 0.3})`;
    context.lineWidth = 0.8 + random() * 1.6;
    const tx = random() * size;
    const ty = random() * size;
    const angle = random() * Math.PI * 2;
    const len = 6 + random() * 22;
    context.beginPath();
    context.moveTo(tx, ty);
    context.lineTo(tx + Math.cos(angle) * len, ty + Math.sin(angle) * len);
    context.stroke();
  }
  return finishTexture('forest-floor', canvas);
};

/**
 * Mancha de sombra de contacto: negro opaco en el centro que se deshace hacia
 * los bordes.
 *
 * Va DEBAJO de cada ficha del tablero. Las luces ya proyectan sombra real,
 * pero esa sombra sale despedida en la dirección de la luz y deja el punto de
 * apoyo limpio — lo justo para que la pieza parezca flotar un dedo por encima
 * de la losa. Esta mancha es el truco de siempre para pegarla al suelo, y
 * además funciona igual en las cinco escenas por muy distinta que sea su
 * iluminación.
 */
export const contactShadowTexture = (): CanvasTexture => {
  const cached = cache.get('contact-shadow');
  if (cached) return cached;
  const size = 128;
  const [canvas, context] = makeCanvas(size);
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.62)');
  gradient.addColorStop(0.45, 'rgba(0, 0, 0, 0.34)');
  gradient.addColorStop(0.75, 'rgba(0, 0, 0, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return finishTexture('contact-shadow', canvas);
};

/**
 * Cielo del fiordo helado: noche polar con aurora boreal.
 *
 * La aurora se dibuja como cortinas verticales de verde y violeta con el
 * borde inferior más denso, que es como se ve de verdad: la luz nace arriba
 * y se deshilacha al bajar, nunca al revés.
 */
export const auroraSkyTexture = (): CanvasTexture => {
  const cached = cache.get('aurora-sky');
  if (cached) return cached;
  const size = 1024;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x4155524f);

  // Noche polar: azul muy oscuro arriba, algo más claro hacia el horizonte.
  const night = context.createLinearGradient(0, 0, 0, size);
  night.addColorStop(0, '#040812');
  night.addColorStop(0.45, '#0a1428');
  night.addColorStop(0.78, '#16283f');
  night.addColorStop(1, '#24405a');
  context.fillStyle = night;
  context.fillRect(0, 0, size, size);

  // Estrellas: más densas arriba, donde el cielo es más oscuro.
  for (let star = 0; star < 900; star += 1) {
    const sx = random() * size;
    const sy = random() * size * 0.8;
    const alto = 1 - sy / (size * 0.8);
    const brillo = 0.2 + random() * 0.8 * alto;
    const radio = random() > 0.94 ? 1.4 + random() * 1.2 : 0.4 + random() * 0.7;
    context.fillStyle = `rgba(226, 238, 255, ${brillo})`;
    context.beginPath();
    context.arc(sx, sy, radio, 0, Math.PI * 2);
    context.fill();
  }

  // Cortinas de aurora.
  for (let curtain = 0; curtain < 7; curtain += 1) {
    const cx = random() * size;
    const ancho = 90 + random() * 220;
    const techo = size * (0.06 + random() * 0.16);
    const suelo = techo + size * (0.24 + random() * 0.3);
    const verde = random() > 0.32;
    const gradient = context.createLinearGradient(0, techo, 0, suelo);
    gradient.addColorStop(0, verde ? 'rgba(120, 255, 190, 0)' : 'rgba(180, 140, 255, 0)');
    gradient.addColorStop(0.35, verde ? 'rgba(96, 240, 176, 0.3)' : 'rgba(158, 120, 240, 0.24)');
    gradient.addColorStop(0.75, verde ? 'rgba(140, 255, 200, 0.42)' : 'rgba(196, 150, 255, 0.32)');
    gradient.addColorStop(1, verde ? 'rgba(200, 255, 226, 0)' : 'rgba(226, 190, 255, 0)');
    context.fillStyle = gradient;
    // Los pliegues: la cortina ondula, no es una banda recta.
    context.beginPath();
    context.moveTo(cx, techo);
    for (let y = techo; y <= suelo; y += 14) {
      const t = (y - techo) / (suelo - techo);
      context.lineTo(cx + Math.sin(t * 5 + curtain) * 46 * t, y);
    }
    for (let y = suelo; y >= techo; y -= 14) {
      const t = (y - techo) / (suelo - techo);
      context.lineTo(cx + Math.sin(t * 5 + curtain) * 46 * t + ancho * (0.5 + t * 0.5), y);
    }
    context.closePath();
    context.fill();
  }

  // Resplandor difuso: liga las cortinas para que no floten sueltas.
  for (let glow = 0; glow < 5; glow += 1) {
    const gx = random() * size;
    const gy = size * (0.1 + random() * 0.3);
    const radio = 150 + random() * 260;
    const gradient = context.createRadialGradient(gx, gy, 0, gx, gy, radio);
    gradient.addColorStop(0, 'rgba(110, 230, 180, 0.12)');
    gradient.addColorStop(1, 'rgba(90, 200, 170, 0)');
    context.fillStyle = gradient;
    context.fillRect(gx - radio, gy - radio, radio * 2, radio * 2);
  }
  return finishTexture('aurora-sky', canvas);
};

/**
 * Nieve apelmazada del fiordo. Casi blanca a propósito: el color lo pone la
 * luz de la aurora, no la textura — una nieve ya teñida de azul se pelearía
 * con cada cambio de iluminación de la escena.
 */
/**
 * Cielo de costa al final de la tarde, para el Rompiente de Nerith.
 *
 * Cuidado con el encuadre: la cámara mira 37 grados en picado, así que del
 * cielo solo se ve una franja fina justo encima del horizonte. Por eso el
 * degradado carga TODO el interés en el tercio inferior de la textura — lo de
 * arriba se dibuja y no lo ve nadie, y repartir el color a partes iguales
 * dejaría en pantalla la parte más sosa.
 */
export const coastSkyTexture = (): CanvasTexture => {
  const cached = cache.get('coast-sky');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x434f4153);

  // Cénit frío arriba, ámbar abajo: la luz rasante del sol poniéndose sobre el
  // agua. La franja visible es la de abajo, así que ahí va lo cálido.
  // OJO con dónde va lo cálido. En una cúpula esférica la coordenada v=0 es el
  // cénit y v=1 el NADIR: el horizonte cae en la mitad, no abajo. En el primer
  // intento puse el ámbar entre 0,82 y 1, o sea por debajo del mar, y el
  // atardecer entero quedó enterrado bajo el agua sin que se viera nada.
  const sky = context.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, '#12283f');
  sky.addColorStop(0.3, '#2f5c78');
  sky.addColorStop(0.43, '#7c9fae');
  sky.addColorStop(0.49, '#e8b98a');
  sky.addColorStop(0.53, '#ffdcae');
  sky.addColorStop(0.58, '#f2c496');
  sky.addColorStop(0.72, '#8aa8b4');
  sky.addColorStop(1, '#31586a');
  context.fillStyle = sky;
  context.fillRect(0, 0, size, size);

  // Nubes en bandas horizontales largas, no en bolas: en la costa el viento
  // las estira, y unas nubes redondas parecerían de dibujo animado.
  for (let band = 0; band < 22; band += 1) {
    // Las nubes se quedan en la franja visible: por encima del horizonte y sin
    // subir tanto que el encuadre las deje fuera.
    const y = size * (0.3 + random() * 0.22);
    const height = 3 + random() * 13;
    const width = size * (0.3 + random() * 0.8);
    const x = random() * size - width * 0.3;
    const warm = y > size * 0.42;
    context.fillStyle = warm
      ? `rgba(${240 + random() * 15}, ${186 + random() * 40}, ${142 + random() * 40}, ${0.16 + random() * 0.22})`
      : `rgba(${150 + random() * 60}, ${168 + random() * 50}, ${186 + random() * 40}, ${0.1 + random() * 0.16})`;
    context.beginPath();
    context.ellipse(x + width / 2, y, width / 2, height, 0, 0, Math.PI * 2);
    context.fill();
  }

  // El sol, muy bajo y muy ancho: aplastado por la refracción, como se ve de
  // verdad cuando toca el agua.
  // El sol, justo en el horizonte (mitad de la esfera), no en el nadir.
  const sunY = size * 0.5;
  const halo = context.createRadialGradient(size * 0.5, sunY, 0, size * 0.5, sunY, size * 0.42);
  halo.addColorStop(0, 'rgba(255, 246, 222, 0.95)');
  halo.addColorStop(0.22, 'rgba(255, 218, 164, 0.62)');
  halo.addColorStop(0.55, 'rgba(255, 196, 136, 0.26)');
  halo.addColorStop(1, 'rgba(255, 186, 126, 0)');
  context.fillStyle = halo;
  context.fillRect(0, sunY - size * 0.42, size, size * 0.84);

  return finishTexture('coast-sky', canvas);
};

/**
 * Arena mojada de la orilla: clara, con ondas de resaca y restos de espuma
 * seca. Es el suelo que rodea la plataforma del tablero.
 */
export const wetSandTexture = (): CanvasTexture => {
  const cached = cache.get('wet-sand');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x57455453);

  const base = context.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, '#9d9578');
  base.addColorStop(0.5, '#8d8570');
  base.addColorStop(1, '#7d7666');
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);

  // Ondas de resaca: las crestas que deja el agua al retirarse. Van todas en
  // la misma dirección porque las hace la misma ola, no el viento.
  for (let ripple = 0; ripple < 46; ripple += 1) {
    const y = random() * size;
    context.strokeStyle = `rgba(${178 + random() * 40}, ${170 + random() * 36}, ${150 + random() * 30}, ${0.12 + random() * 0.2})`;
    context.lineWidth = 1 + random() * 3.4;
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= size; x += 18) context.lineTo(x, y + Math.sin((x / size) * Math.PI * 4 + ripple) * 6);
    context.stroke();
  }

  // Grano y conchitas rotas.
  for (let grain = 0; grain < 3200; grain += 1) {
    const l = 120 + random() * 90;
    context.fillStyle = `rgba(${l + 8}, ${l}, ${l - 18}, ${0.05 + random() * 0.14})`;
    context.fillRect(random() * size, random() * size, 1 + random() * 2, 1 + random() * 2);
  }
  for (let shell = 0; shell < 40; shell += 1) {
    context.fillStyle = `rgba(238, 232, 216, ${0.2 + random() * 0.35})`;
    context.beginPath();
    context.arc(random() * size, random() * size, 0.8 + random() * 2, 0, Math.PI * 2);
    context.fill();
  }

  return finishTexture('wet-sand', canvas);
};

/**
 * Cielo del Patio de Fundición: anochecer cargado de humo, con el resplandor
 * del horno tiñendo la panza de las nubes desde abajo.
 *
 * Igual que en el cielo de costa, lo cálido va en la MITAD de la textura y no
 * al final: en una cúpula esférica v=0 es el cénit y v=1 el nadir, así que el
 * horizonte —lo único que se ve con el picado de la cámara— cae en v=0,5.
 */
export const forgeSkyTexture = (): CanvasTexture => {
  const cached = cache.get('forge-sky');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x464f5247);

  const sky = context.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, '#0e1218');
  sky.addColorStop(0.3, '#1e222a');
  sky.addColorStop(0.44, '#4a3a30');
  sky.addColorStop(0.5, '#9a5a28');
  sky.addColorStop(0.55, '#c4762e');
  sky.addColorStop(0.62, '#6d4630');
  sky.addColorStop(0.78, '#2a2620');
  sky.addColorStop(1, '#16130f');
  context.fillStyle = sky;
  context.fillRect(0, 0, size, size);

  // Humo: bancos anchos y bajos. Los de la franja caliente llevan la panza
  // naranja, que es lo que delata que la luz viene del suelo y no del cielo.
  for (let bank = 0; bank < 26; bank += 1) {
    const y = size * (0.26 + random() * 0.26);
    const height = 6 + random() * 20;
    const width = size * (0.3 + random() * 0.8);
    const x = random() * size - width * 0.3;
    const lit = y > size * 0.4;
    context.fillStyle = lit
      ? `rgba(${186 + random() * 50}, ${112 + random() * 44}, ${56 + random() * 30}, ${0.14 + random() * 0.2})`
      : `rgba(${58 + random() * 34}, ${56 + random() * 28}, ${58 + random() * 26}, ${0.16 + random() * 0.22})`;
    context.beginPath();
    context.ellipse(x + width / 2, y, width / 2, height, 0, 0, Math.PI * 2);
    context.fill();
  }

  // El resplandor del horno subiendo desde el horizonte: no es un sol, es una
  // mancha ancha y sin borde, porque lo que ilumina está en el suelo.
  const glowY = size * 0.52;
  const glow = context.createRadialGradient(size * 0.36, glowY, 0, size * 0.36, glowY, size * 0.44);
  glow.addColorStop(0, 'rgba(255, 168, 78, 0.55)');
  glow.addColorStop(0.4, 'rgba(226, 118, 44, 0.26)');
  glow.addColorStop(1, 'rgba(200, 96, 34, 0)');
  context.fillStyle = glow;
  context.fillRect(0, glowY - size * 0.44, size, size * 0.88);

  return finishTexture('forge-sky', canvas);
};

/**
 * Tejado vidriado: las hileras de tejas de cana que cubren un alero chino.
 *
 * Es la textura que hace que un tejado se lea como tejado. Sin ella, la malla
 * curva del alero es una superficie lisa y podria ser cualquier cosa; con las
 * hileras marcadas, la curva se entiende de un vistazo porque las lineas la
 * siguen. Se dibujan como bandas VERTICALES porque la geometria del alero se
 * genera por revolucion y su coordenada U corre a lo ancho.
 */
export const roofTileTexture = (): CanvasTexture => {
  const cached = cache.get('roof-tile');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x524f4f46);

  context.fillStyle = '#3f6a56';
  context.fillRect(0, 0, size, size);

  // Cada hilera: una teja de media cana con su lomo iluminado y su valle en
  // sombra. El degradado de tres paradas es lo que le da el volumen redondo.
  const hileras = 26;
  const ancho = size / hileras;
  for (let fila = 0; fila < hileras; fila += 1) {
    const x = fila * ancho;
    const tono = 0.9 + random() * 0.2;
    const g = context.createLinearGradient(x, 0, x + ancho, 0);
    g.addColorStop(0, `rgba(${Math.round(28 * tono)}, ${Math.round(58 * tono)}, ${Math.round(46 * tono)}, 1)`);
    g.addColorStop(0.42, `rgba(${Math.round(112 * tono)}, ${Math.round(168 * tono)}, ${Math.round(140 * tono)}, 1)`);
    g.addColorStop(0.62, `rgba(${Math.round(150 * tono)}, ${Math.round(206 * tono)}, ${Math.round(176 * tono)}, 1)`);
    g.addColorStop(1, `rgba(${Math.round(34 * tono)}, ${Math.round(66 * tono)}, ${Math.round(54 * tono)}, 1)`);
    context.fillStyle = g;
    context.fillRect(x, 0, ancho + 0.6, size);
  }

  // Juntas horizontales: donde acaba una teja y empieza la siguiente ladera
  // abajo. Sin ellas el tejado parece de una pieza.
  for (let junta = 1; junta < 7; junta += 1) {
    const y = (junta / 7) * size + (random() - 0.5) * 6;
    context.fillStyle = 'rgba(18, 38, 30, 0.5)';
    context.fillRect(0, y, size, 2.6);
    context.fillStyle = 'rgba(168, 220, 190, 0.22)';
    context.fillRect(0, y + 2.6, size, 1.2);
  }

  // Brillo del vidriado: manchas alargadas y muy claras, como el reflejo del
  // cielo sobre el esmalte mojado.
  for (let brillo = 0; brillo < 30; brillo += 1) {
    context.fillStyle = `rgba(214, 245, 226, ${0.05 + random() * 0.12})`;
    context.beginPath();
    context.ellipse(random() * size, random() * size, 2 + random() * 4, 12 + random() * 40, 0, 0, Math.PI * 2);
    context.fill();
  }

  return finishTexture('roof-tile', canvas);
};

/**
 * Laca roja de corte: cinabrio profundo, con la veta de la madera de debajo
 * apenas insinuada y motas de oro. Va en columnas, biombos y barandillas.
 */
export const lacquerTexture = (): CanvasTexture => {
  const cached = cache.get('lacquer');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x4c414351);

  const base = context.createLinearGradient(0, 0, size, size);
  base.addColorStop(0, '#a8342c');
  base.addColorStop(0.5, '#93281f');
  base.addColorStop(1, '#7d1f18');
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);

  // La veta: la laca se aplica sobre madera y la deja adivinar, no la tapa.
  for (let veta = 0; veta < 120; veta += 1) {
    const y = random() * size;
    context.strokeStyle = `rgba(${58 + random() * 40}, ${18 + random() * 16}, ${14 + random() * 12}, ${0.1 + random() * 0.16})`;
    context.lineWidth = 0.7 + random() * 2.4;
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= size; x += 40) context.lineTo(x, y + (random() - 0.5) * 7);
    context.stroke();
  }

  // Capas de laca: la pieza lleva muchas manos, y cada una deja su onda.
  for (let capa = 0; capa < 9; capa += 1) {
    const px = random() * size;
    const py = random() * size;
    const radius = 50 + random() * 120;
    const g = context.createRadialGradient(px, py, 0, px, py, radius);
    g.addColorStop(0, `rgba(196, 74, 58, ${0.07 + random() * 0.1})`);
    g.addColorStop(1, 'rgba(196, 74, 58, 0)');
    context.fillStyle = g;
    context.fillRect(px - radius, py - radius, radius * 2, radius * 2);
  }

  // Motas de oro espolvoreadas.
  for (let mota = 0; mota < 200; mota += 1) {
    context.fillStyle = `rgba(230, 194, 108, ${0.1 + random() * 0.3})`;
    context.beginPath();
    context.arc(random() * size, random() * size, 0.5 + random() * 1.5, 0, Math.PI * 2);
    context.fill();
  }

  return finishTexture('lacquer', canvas);
};

export const packedSnowTexture = (): CanvasTexture => {
  const cached = cache.get('packed-snow');
  if (cached) return cached;
  const size = 512;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(0x534e4f57);

  context.fillStyle = '#eef4fa';
  context.fillRect(0, 0, size, size);
  // Dunas de nieve: ondas suaves y largas, barridas por el viento.
  for (let drift = 0; drift < 26; drift += 1) {
    const y = random() * size;
    const gradient = context.createLinearGradient(0, y - 20, 0, y + 20);
    gradient.addColorStop(0, 'rgba(206, 222, 238, 0)');
    gradient.addColorStop(0.5, `rgba(202, 218, 236, ${0.18 + random() * 0.22})`);
    gradient.addColorStop(1, 'rgba(206, 222, 238, 0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= size; x += 32) context.lineTo(x, y + Math.sin(x * 0.012 + drift) * 14);
    context.lineTo(size, y + 26);
    for (let x = size; x >= 0; x -= 32) context.lineTo(x, y + Math.sin(x * 0.012 + drift) * 14 + 26);
    context.closePath();
    context.fill();
  }
  // Costra: la nieve vieja se cuartea en placas.
  for (let crust = 0; crust < 40; crust += 1) {
    context.strokeStyle = `rgba(178, 198, 218, ${0.1 + random() * 0.16})`;
    context.lineWidth = 0.6 + random() * 1.4;
    context.beginPath();
    let cx = random() * size;
    let cy = random() * size;
    context.moveTo(cx, cy);
    for (let step = 0; step < 4; step += 1) {
      cx += (random() - 0.5) * 60;
      cy += (random() - 0.5) * 60;
      context.lineTo(cx, cy);
    }
    context.stroke();
  }
  // Brillo de cristal: los destellos que hacen que la nieve no sea papel.
  for (let sparkle = 0; sparkle < 1200; sparkle += 1) {
    context.fillStyle = `rgba(255, 255, 255, ${0.2 + random() * 0.6})`;
    context.fillRect(random() * size, random() * size, 1 + random() * 1.6, 1 + random() * 1.6);
  }
  return finishTexture('packed-snow', canvas);
};

// ─── Suelo del tablero ──────────────────────────────────────────────────────
//
// Las casillas reutilizaban las texturas de ambiente (basalto, musgo,
// arenisca), que se generan UNA sola vez y se cachean sin variante: las 64
// casillas salían idénticas píxel a píxel. Una rejilla perfectamente repetida
// se lee como falsa al instante por mucho relieve que tenga cada losa.
//
// Estas texturas son propias del suelo jugable y aportan las tres cosas que
// de verdad separan una piedra real de un color plano:
//
//  1. VARIANTES por casilla: seis dibujos distintos repartidos por posición,
//     así que dos losas vecinas nunca son la misma imagen.
//  2. OCLUSIÓN HORNEADA: cada losa se oscurece hacia sus cuatro bordes. Es lo
//     que finge la sombra de contacto entre losa y losa, y lo que más
//     profundidad da por céntimo de esfuerzo.
//  3. MAPA DE RUGOSIDAD: el brillo deja de ser uniforme. El basalto vitrifica
//     donde está fresco, el musgo brilla donde está mojado y la arena no
//     brilla en ninguna parte — tres materiales que se leen distintos aunque
//     compartan la misma geometría.

export type BoardTileStyle = 'stone' | 'basalt' | 'moss' | 'sand' | 'ice' | 'forest' | 'tide' | 'forge' | 'glaze' | 'sandstone';

/** Cuántos dibujos distintos hay por estilo. Seis bastan para que el ojo no encuentre el patrón. */
export const BOARD_TILE_VARIANTS = 6;

/** Semilla estable por estilo+variante: el mismo mapa se ve siempre igual. */
const tileSeed = (style: BoardTileStyle, variant: number): number => {
  const base = { stone: 0x53544f4e, basalt: 0x42415354, moss: 0x4d4f5353, sand: 0x53414e44, ice: 0x49434545, forest: 0x464f5245, tide: 0x54494445, forge: 0x464f5247, glaze: 0x474c415a, sandstone: 0x53414e53 }[style];
  return (base + variant * 7919) >>> 0;
};

/**
 * Oscurecimiento hacia los cuatro bordes de la losa. Se dibuja al final, por
 * encima de todo el detalle, para que también apague el grano y las vetas —
 * si solo tiñera el fondo, el grano seguiría igual de brillante en la esquina
 * y delataría que la sombra está pintada.
 */
const bakeEdgeShade = (context: CanvasRenderingContext2D, size: number, strength: number): void => {
  const band = size * 0.34;
  const edges: readonly [number, number, number, number][] = [
    [0, 0, band, 0],
    [size, 0, size - band, 0],
    [0, 0, 0, band],
    [0, size, 0, size - band],
  ];
  for (const [x0, y0, x1, y1] of edges) {
    const gradient = context.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
};

/** Junta tallada en el borde: la línea de sombra donde acaba la losa. */
const drawTileGroove = (context: CanvasRenderingContext2D, size: number, alpha: number): void => {
  const width = Math.max(2, size * 0.016);
  context.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
  context.lineWidth = width;
  context.strokeRect(width / 2, width / 2, size - width, size - width);
};

/** Mapa de color de una losa del tablero. */
export const boardTileTexture = (style: BoardTileStyle, variant: number): CanvasTexture => {
  const key = `board-tile-${style}-${variant}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const size = 256;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom(tileSeed(style, variant));

  if (style === 'stone') {
    // Caliza tallada y pulida: cálida, con vetas finas y esquinas desportilladas.
    const base = context.createLinearGradient(0, 0, size, size);
    base.addColorStop(0, '#cfc6b2');
    base.addColorStop(0.55, '#bdb3a0');
    base.addColorStop(1, '#a99f8d');
    context.fillStyle = base;
    context.fillRect(0, 0, size, size);
    for (let vein = 0; vein < 5; vein += 1) {
      context.strokeStyle = `rgba(122, 114, 100, ${0.14 + random() * 0.18})`;
      context.lineWidth = 0.6 + random() * 1.8;
      context.beginPath();
      let vx = random() * size;
      let vy = 0;
      context.moveTo(vx, vy);
      while (vy < size) {
        vy += 12 + random() * 20;
        vx += (random() - 0.5) * 34;
        context.lineTo(vx, vy);
      }
      context.stroke();
    }
    for (let grain = 0; grain < 2200; grain += 1) {
      const l = 150 + random() * 80;
      context.fillStyle = `rgba(${l}, ${l - 6}, ${l - 20}, ${0.05 + random() * 0.12})`;
      context.fillRect(random() * size, random() * size, 1 + random() * 2, 1 + random() * 2);
    }
    // Desportillado en una esquina distinta según la variante.
    const corner = variant % 4;
    const cx = corner === 0 || corner === 3 ? 0 : size;
    const cy = corner < 2 ? 0 : size;
    context.fillStyle = 'rgba(88, 82, 70, 0.5)';
    context.beginPath();
    context.moveTo(cx, cy);
    context.lineTo(cx + (cx === 0 ? 1 : -1) * (16 + random() * 26), cy);
    context.lineTo(cx, cy + (cy === 0 ? 1 : -1) * (14 + random() * 24));
    context.closePath();
    context.fill();
    drawTileGroove(context, size, 0.4);
    bakeEdgeShade(context, size, 0.36);
  } else if (style === 'basalt') {
    // Roca volcánica: fracturada en prismas, con rescoldo en las grietas.
    // El tono NO es negro puro a propósito: una losa casi negra multiplicada
    // por el tinte de zona se convierte en un agujero sin forma, y el tablero
    // deja de leerse sobre el fondo de lava. Basalto real bajo luz cálida es
    // gris pardo oscuro, no tinta.
    context.fillStyle = '#3b2d2c';
    context.fillRect(0, 0, size, size);
    for (let patch = 0; patch < 9; patch += 1) {
      const px = random() * size;
      const py = random() * size;
      const radius = 26 + random() * 60;
      const gradient = context.createRadialGradient(px, py, 0, px, py, radius);
      gradient.addColorStop(0, `rgba(96, 76, 70, ${0.18 + random() * 0.22})`);
      gradient.addColorStop(1, 'rgba(48, 36, 34, 0)');
      context.fillStyle = gradient;
      context.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    }
    for (let grain = 0; grain < 1800; grain += 1) {
      const l = 46 + random() * 62;
      context.fillStyle = `rgba(${l + 10}, ${l}, ${l - 4}, ${0.16 + random() * 0.3})`;
      context.fillRect(random() * size, random() * size, 1 + random() * 2.4, 1 + random() * 2.4);
    }
    // Fractura columnar: una red de grietas que cruza la losa.
    const cracks: { x: number; y: number }[][] = [];
    for (let crack = 0; crack < 3 + (variant % 3); crack += 1) {
      const path: { x: number; y: number }[] = [];
      let x = random() * size;
      let y = -6;
      while (y < size + 6) {
        path.push({ x, y });
        y += 16 + random() * 22;
        x += (random() - 0.5) * 46;
      }
      cracks.push(path);
      context.strokeStyle = `rgba(0, 0, 0, ${0.5 + random() * 0.35})`;
      context.lineWidth = 1.4 + random() * 3.2;
      context.beginPath();
      context.moveTo(path[0]!.x, path[0]!.y);
      for (const point of path.slice(1)) context.lineTo(point.x, point.y);
      context.stroke();
    }
    // Rescoldo dentro de la grieta, no encima: más fino y ligeramente desplazado.
    for (const path of cracks) {
      if (random() > 0.55) continue;
      context.strokeStyle = `rgba(255, ${96 + Math.floor(random() * 90)}, 34, ${0.3 + random() * 0.4})`;
      context.lineWidth = 0.8 + random() * 1.4;
      context.beginPath();
      context.moveTo(path[0]!.x, path[0]!.y);
      for (const point of path.slice(1)) context.lineTo(point.x + 0.8, point.y);
      context.stroke();
    }
    // Ceniza posada, sobre todo hacia los bordes.
    for (let ash = 0; ash < 260; ash += 1) {
      const ax = random() * size;
      const ay = random() * size;
      const borde = Math.min(ax, ay, size - ax, size - ay) / (size / 2);
      context.fillStyle = `rgba(150, 142, 138, ${(1 - borde) * 0.16 * random()})`;
      context.fillRect(ax, ay, 1 + random() * 3, 1 + random() * 3);
    }
    drawTileGroove(context, size, 0.55);
    bakeEdgeShade(context, size, 0.3);
  } else if (style === 'moss') {
    // Granito húmedo: frío, moteado, con musgo entrando por juntas y grietas.
    context.fillStyle = '#6a6f68';
    context.fillRect(0, 0, size, size);
    for (let fleck = 0; fleck < 2600; fleck += 1) {
      const l = 74 + random() * 88;
      const warm = random() > 0.7;
      context.fillStyle = warm
        ? `rgba(${l + 14}, ${l + 4}, ${l - 12}, ${0.1 + random() * 0.2})`
        : `rgba(${l - 8}, ${l}, ${l - 2}, ${0.1 + random() * 0.22})`;
      context.fillRect(random() * size, random() * size, 1 + random() * 2.4, 1 + random() * 2.2);
    }
    // Musgo: entra desde los bordes hacia dentro, que es por donde se cuela el agua.
    for (let clump = 0; clump < 16; clump += 1) {
      const along = random() * size;
      const depth = random() * size * 0.34;
      const edge = (variant + clump) % 4;
      const mx = edge === 0 ? along : edge === 1 ? size - depth : edge === 2 ? along : depth;
      const my = edge === 0 ? depth : edge === 1 ? along : edge === 2 ? size - depth : along;
      const radius = 10 + random() * 30;
      const gradient = context.createRadialGradient(mx, my, 0, mx, my, radius);
      gradient.addColorStop(0, `rgba(72, 96, 48, ${0.34 + random() * 0.3})`);
      gradient.addColorStop(0.6, `rgba(84, 104, 56, ${0.16 + random() * 0.16})`);
      gradient.addColorStop(1, 'rgba(80, 100, 54, 0)');
      context.fillStyle = gradient;
      context.fillRect(mx - radius, my - radius, radius * 2, radius * 2);
    }
    // Liquen claro, en manchas pequeñas y secas.
    for (let lichen = 0; lichen < 9; lichen += 1) {
      context.fillStyle = `rgba(168, 176, 140, ${0.1 + random() * 0.16})`;
      context.beginPath();
      context.arc(random() * size, random() * size, 3 + random() * 9, 0, Math.PI * 2);
      context.fill();
    }
    // Grieta con agua estancada.
    context.strokeStyle = 'rgba(24, 30, 26, 0.5)';
    context.lineWidth = 1.4 + random() * 2.4;
    context.beginPath();
    let gx = random() * size;
    let gy = 0;
    context.moveTo(gx, gy);
    while (gy < size) {
      gy += 18 + random() * 26;
      gx += (random() - 0.5) * 40;
      context.lineTo(gx, gy);
    }
    context.stroke();
    drawTileGroove(context, size, 0.5);
    bakeEdgeShade(context, size, 0.38);
  } else if (style === 'forest') {
    // Losa del claro: piedra cálida que el bosque se está tragando — musgo
    // por las juntas, raíces cruzando y hojarasca encima. Deliberadamente más
    // CÁLIDA y parda que el granito del Santuario, que también lleva musgo:
    // si las dos escenas verdes comparten tono, dejan de ser dos sitios.
    const base = context.createLinearGradient(0, 0, size, size);
    base.addColorStop(0, '#9a9179');
    base.addColorStop(0.5, '#8a836c');
    base.addColorStop(1, '#786f5c');
    context.fillStyle = base;
    context.fillRect(0, 0, size, size);
    for (let grain = 0; grain < 2200; grain += 1) {
      const l = 108 + random() * 74;
      context.fillStyle = `rgba(${l + 6}, ${l}, ${l - 16}, ${0.06 + random() * 0.14})`;
      context.fillRect(random() * size, random() * size, 1 + random() * 2.2, 1 + random() * 2.2);
    }
    // Raíces: cruzan la losa entera, no se quedan en el borde.
    for (let root = 0; root < 2 + (variant % 2); root += 1) {
      const vertical = (variant + root) % 2 === 0;
      let along = random() * size;
      context.strokeStyle = `rgba(74, 58, 40, ${0.34 + random() * 0.24})`;
      context.lineWidth = 2.6 + random() * 4.4;
      context.beginPath();
      context.moveTo(vertical ? along : 0, vertical ? 0 : along);
      for (let step = 0; step <= size; step += 26) {
        along += (random() - 0.5) * 22;
        context.lineTo(vertical ? along : step, vertical ? step : along);
      }
      context.stroke();
    }
    // Musgo entrando por las juntas, más tupido que en el granito.
    for (let clump = 0; clump < 20; clump += 1) {
      const along = random() * size;
      const depth = random() * size * 0.4;
      const edge = (variant + clump) % 4;
      const mx = edge === 0 ? along : edge === 1 ? size - depth : edge === 2 ? along : depth;
      const my = edge === 0 ? depth : edge === 1 ? along : edge === 2 ? size - depth : along;
      const radius = 12 + random() * 34;
      const gradient = context.createRadialGradient(mx, my, 0, mx, my, radius);
      gradient.addColorStop(0, `rgba(78, 108, 46, ${0.4 + random() * 0.3})`);
      gradient.addColorStop(0.6, `rgba(92, 122, 56, ${0.2 + random() * 0.18})`);
      gradient.addColorStop(1, 'rgba(88, 116, 54, 0)');
      context.fillStyle = gradient;
      context.fillRect(mx - radius, my - radius, radius * 2, radius * 2);
    }
    // Hojarasca: elipses giradas, en ocres y verdes apagados.
    for (let leaf = 0; leaf < 22; leaf += 1) {
      const lx = random() * size;
      const ly = random() * size;
      const otono = random() > 0.45;
      context.save();
      context.translate(lx, ly);
      context.rotate(random() * Math.PI * 2);
      context.fillStyle = otono
        ? `rgba(${150 + random() * 60}, ${96 + random() * 46}, ${40 + random() * 30}, ${0.3 + random() * 0.3})`
        : `rgba(${86 + random() * 40}, ${112 + random() * 44}, ${52 + random() * 26}, ${0.28 + random() * 0.28})`;
      context.beginPath();
      context.ellipse(0, 0, 4 + random() * 7, 2 + random() * 3.4, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
    drawTileGroove(context, size, 0.46);
    bakeEdgeShade(context, size, 0.34);
  } else if (style === 'sandstone') {
    // Losa de arenisca rosada de un templo, con el MANDALA tallado.
    //
    // Es la única losa del juego con simetría RADIAL. Las otras nueve se
    // apoyan en vetas, grietas, hileras o remaches, que son formas alargadas o
    // en rejilla; esta se organiza alrededor de un centro. Basta eso para que
    // el tablero se reconozca de un vistazo sin haber visto el resto de la
    // escena, que es justo lo que tiene que hacer un suelo propio.
    //
    // El mandala va TALLADO, no pintado: cada trazo lleva su surco oscuro y,
    // pegado encima, un filo claro. Ese par sombra-luz es lo único que
    // distingue algo hundido en la piedra de algo dibujado sobre ella, y sin
    // él el motivo flotaría como una calcomanía.

    // Arenisca rosada. Ni el ocre pálido de Duna ni el gris del Santuario: la
    // piedra de estos templos tira a salmón.
    const base = context.createLinearGradient(0, 0, size, size);
    base.addColorStop(0, '#c99a76');
    base.addColorStop(0.5, '#b98a68');
    base.addColorStop(1, '#a97a5c');
    context.fillStyle = base;
    context.fillRect(0, 0, size, size);

    // Estratos de sedimento: la arenisca se deposita en capas, y esas bandas
    // suaves son lo que la separa de un estuco liso.
    for (let strata = 0; strata < 6; strata += 1) {
      const y = (strata / 6) * size + (random() - 0.5) * 20;
      const alto = 10 + random() * 26;
      context.fillStyle = `rgba(${168 + random() * 40}, ${120 + random() * 30}, ${92 + random() * 26}, ${0.1 + random() * 0.14})`;
      context.fillRect(0, y, size, alto);
    }
    for (let grain = 0; grain < 2800; grain += 1) {
      const l = 150 + random() * 80;
      context.fillStyle = `rgba(${l}, ${l - 34}, ${l - 56}, ${0.05 + random() * 0.13})`;
      context.fillRect(random() * size, random() * size, 1 + random() * 2.2, 1 + random() * 2.2);
    }

    // EL MANDALA. Se dibuja dos veces: primero el surco (oscuro, ancho y
    // desplazado hacia abajo-derecha) y encima el filo (claro, fino y
    // desplazado hacia arriba-izquierda). La luz de la escena viene de arriba,
    // así que ese es el orden que hace que se vea hundido.
    const cx = size / 2;
    const cy = size / 2;
    const radios = variant % 2 === 0 ? [34, 58, 84] : [30, 52, 76, 98];
    const petalos = 8 + (variant % 3) * 4;
    for (const capa of [
      { color: 'rgba(96, 62, 42, 0.62)', width: 4.6, dx: 1.4, dy: 1.8 },
      { color: 'rgba(232, 200, 172, 0.5)', width: 1.7, dx: -0.8, dy: -1.1 },
    ]) {
      context.strokeStyle = capa.color;
      context.lineWidth = capa.width;
      context.save();
      context.translate(cx + capa.dx, cy + capa.dy);

      // Anillos concéntricos.
      for (const r of radios) {
        context.beginPath();
        context.arc(0, 0, r, 0, Math.PI * 2);
        context.stroke();
      }
      // Corona de pétalos de loto entre los dos anillos exteriores.
      const rInterior = radios[radios.length - 2]!;
      const rExterior = radios[radios.length - 1]!;
      for (let petalo = 0; petalo < petalos; petalo += 1) {
        const a0 = (petalo / petalos) * Math.PI * 2;
        const a1 = ((petalo + 1) / petalos) * Math.PI * 2;
        const am = (a0 + a1) / 2;
        context.beginPath();
        context.moveTo(Math.cos(a0) * rInterior, Math.sin(a0) * rInterior);
        // Un pétalo de loto es una ojiva: sube en punta y vuelve a bajar.
        context.quadraticCurveTo(
          Math.cos(am) * (rExterior + 8),
          Math.sin(am) * (rExterior + 8),
          Math.cos(a1) * rInterior,
          Math.sin(a1) * rInterior,
        );
        context.stroke();
      }
      // Radios cortos del anillo interior: el eje del mandala.
      for (let rayo = 0; rayo < petalos / 2; rayo += 1) {
        const a = (rayo / (petalos / 2)) * Math.PI * 2;
        context.beginPath();
        context.moveTo(Math.cos(a) * radios[0]!, Math.sin(a) * radios[0]!);
        context.lineTo(Math.cos(a) * radios[1]!, Math.sin(a) * radios[1]!);
        context.stroke();
      }
      // Bindu: el punto del centro.
      context.beginPath();
      context.arc(0, 0, 7, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }

    // Rangoli: el polvo blanco de arroz con el que se redibuja el motivo cada
    // mañana. Va ENCIMA del tallado y desbordándolo un poco, porque se echa a
    // mano y nunca cae justo en el surco.
    context.fillStyle = 'rgba(246, 240, 228, 0.5)';
    for (let punto = 0; punto < petalos * 2; punto += 1) {
      const a = (punto / (petalos * 2)) * Math.PI * 2;
      const r = radios[radios.length - 1]! + 12;
      context.beginPath();
      context.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.2 + random() * 1.6, 0, Math.PI * 2);
      context.fill();
    }

    // Pétalos de caléndula: naranjas, pequeños y siempre desparramados. Es lo
    // que le quita la rigidez al mandala y lo hace parecer un sitio en uso.
    for (let petalo = 0; petalo < 16; petalo += 1) {
      context.save();
      context.translate(random() * size, random() * size);
      context.rotate(random() * Math.PI * 2);
      context.fillStyle = `rgba(${226 + random() * 26}, ${128 + random() * 44}, ${28 + random() * 30}, ${0.42 + random() * 0.3})`;
      context.beginPath();
      context.ellipse(0, 0, 3.4 + random() * 3, 1.8 + random() * 1.4, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    // Tizne de las lámparas de ghee: manchas oscuras y suaves.
    for (let hollin = 0; hollin < 3; hollin += 1) {
      const hx = random() * size;
      const hy = random() * size;
      const radius = 18 + random() * 36;
      const gradient = context.createRadialGradient(hx, hy, 0, hx, hy, radius);
      gradient.addColorStop(0, `rgba(52, 38, 30, ${0.2 + random() * 0.2})`);
      gradient.addColorStop(1, 'rgba(52, 38, 30, 0)');
      context.fillStyle = gradient;
      context.fillRect(hx - radius, hy - radius, radius * 2, radius * 2);
    }

    drawTileGroove(context, size, 0.46);
    bakeEdgeShade(context, size, 0.34);
  } else if (style === 'glaze') {
    // Loseta vidriada de la Corte de Jade. Es la unica del juego que no imita
    // un material NATURAL ni uno FABRICADO EN BRUTO, sino una pieza de
    // ceramica de horno: por eso es la unica con motivo dibujado a mano y con
    // simetria de taller, y la unica que brilla como esmalte.
    //
    // Las cuatro capas son las de una pieza real, en su orden:
    //   1. el bizcocho (la arcilla cruda, que asoma por los desconchones),
    //   2. el vidriado de celadon, que se acumula y oscurece en las
    //      depresiones — eso es lo que le da profundidad de esmalte,
    //   3. el CRAQUELADO, la red de grietas finas que el vidriado hace al
    //      enfriar mas despacio que la arcilla. Es la firma de esta loseta,
    //      como el agua en la de marea o la rejilla en la de forja,
    //   4. el oro: la greca de meandros del borde y el motivo del centro.
    //
    // La greca (el patron 回, cuadrados enroscados) va dibujada segmento a
    // segmento y no con una textura repetida a lo bruto: es geometria exacta y
    // es justo lo que hace que se lea como taller imperial y no como estampado.

    // 1. Bizcocho.
    context.fillStyle = '#c9bda6';
    context.fillRect(0, 0, size, size);

    // 2. Vidriado de celadon, con la veta del pincel y el charco de los bordes.
    const glaze = context.createLinearGradient(0, 0, size, size);
    glaze.addColorStop(0, '#8fb8a4');
    glaze.addColorStop(0.45, '#79a591');
    glaze.addColorStop(1, '#66907e');
    context.fillStyle = glaze;
    context.fillRect(0, 0, size, size);
    for (let pool = 0; pool < 7; pool += 1) {
      const px = random() * size;
      const py = random() * size;
      const radius = 30 + random() * 70;
      const gradient = context.createRadialGradient(px, py, 0, px, py, radius);
      gradient.addColorStop(0, `rgba(70, 118, 100, ${0.16 + random() * 0.2})`);
      gradient.addColorStop(1, 'rgba(70, 118, 100, 0)');
      context.fillStyle = gradient;
      context.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    }

    // 3. Craquelado. Se siembran puntos y se une cada uno con los que tiene
    //    cerca: eso aproxima las aristas de un diagrama de Voronoi, que es la
    //    forma que toma de verdad una grieta de esmalte. Dos pasadas: la ancha
    //    y oscura del fondo de la grieta, y encima la fina y clara del filo,
    //    que es lo que la hace parecer hundida y no pintada.
    const nodos = Array.from({ length: 26 }, () => ({ x: random() * size, y: random() * size }));
    for (const capa of [
      { color: 'rgba(48, 82, 70, 0.5)', width: 1.9 },
      { color: 'rgba(196, 214, 200, 0.32)', width: 0.7 },
    ]) {
      context.strokeStyle = capa.color;
      context.lineWidth = capa.width;
      for (let i = 0; i < nodos.length; i += 1) {
        for (let j = i + 1; j < nodos.length; j += 1) {
          const a = nodos[i]!;
          const b = nodos[j]!;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          if (dist > size * 0.26) continue;
          // La grieta no va recta: quiebra una vez a mitad de camino.
          const mx = (a.x + b.x) / 2 + (random() - 0.5) * 14;
          const my = (a.y + b.y) / 2 + (random() - 0.5) * 14;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(mx, my);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    }

    // 4a. La greca de meandros del borde. Cada eslabon es una espiral cuadrada
    //     abierta; se dibuja una vez y se repite girada en los cuatro lados.
    const inset = 20;
    const paso = (size - inset * 2) / 6;
    const eslabon = (ox: number, oy: number, giro: number) => {
      context.save();
      context.translate(ox, oy);
      context.rotate(giro);
      context.beginPath();
      context.moveTo(-paso * 0.36, paso * 0.3);
      context.lineTo(-paso * 0.36, -paso * 0.3);
      context.lineTo(paso * 0.3, -paso * 0.3);
      context.lineTo(paso * 0.3, paso * 0.1);
      context.lineTo(-paso * 0.08, paso * 0.1);
      context.lineTo(-paso * 0.08, -paso * 0.08);
      context.stroke();
      context.restore();
    };
    for (const oro of [
      { color: 'rgba(92, 68, 20, 0.55)', width: 4.2, dx: 1, dy: 1.4 },
      { color: 'rgba(226, 190, 96, 0.92)', width: 3, dx: 0, dy: 0 },
      { color: 'rgba(255, 238, 178, 0.5)', width: 1.1, dx: -0.5, dy: -0.7 },
    ]) {
      context.strokeStyle = oro.color;
      context.lineWidth = oro.width;
      context.lineJoin = 'miter';
      context.save();
      context.translate(oro.dx, oro.dy);
      for (let k = 0; k < 6; k += 1) {
        const t = inset + paso * (k + 0.5);
        eslabon(t, inset, 0);
        eslabon(size - inset, t, Math.PI / 2);
        eslabon(size - t, size - inset, Math.PI);
        eslabon(inset, size - t, -Math.PI / 2);
      }
      context.restore();
    }

    // 4b. El motivo del centro, distinto por variante. Son los tres que se
    //     repiten en la ceramica de corte: la nube enroscada (ruyi), el sello
    //     cuadrado y la flor de cuatro petalos.
    const cx = size / 2;
    const cy = size / 2;
    const motivo = variant % 3;
    for (const oro of [
      { color: 'rgba(92, 68, 20, 0.5)', width: 5, dx: 1.2, dy: 1.6 },
      { color: 'rgba(226, 190, 96, 0.88)', width: 3.4, dx: 0, dy: 0 },
    ]) {
      context.strokeStyle = oro.color;
      context.lineWidth = oro.width;
      context.save();
      context.translate(cx + oro.dx, cy + oro.dy);
      if (motivo === 0) {
        // Nube enroscada: dos volutas encaradas colgando de un arco.
        for (const lado of [-1, 1]) {
          context.beginPath();
          context.arc(lado * 17, 0, 13, lado > 0 ? -0.4 : Math.PI + 0.4, lado > 0 ? Math.PI * 1.5 : Math.PI * 0.5, lado < 0);
          context.stroke();
          context.beginPath();
          context.arc(lado * 17, 0, 5.5, 0, Math.PI * 2);
          context.stroke();
        }
        context.beginPath();
        context.moveTo(-30, 6);
        context.quadraticCurveTo(0, -22, 30, 6);
        context.stroke();
      } else if (motivo === 1) {
        // Sello cuadrado: marco doble con una marca dentro.
        context.strokeRect(-22, -22, 44, 44);
        context.strokeRect(-15, -15, 30, 30);
        context.beginPath();
        context.moveTo(-8, -6);
        context.lineTo(8, -6);
        context.moveTo(0, -10);
        context.lineTo(0, 10);
        context.moveTo(-8, 8);
        context.lineTo(8, 8);
        context.stroke();
      } else {
        // Flor de cuatro petalos, la roseta de las tejas vidriadas.
        for (let petalo = 0; petalo < 4; petalo += 1) {
          context.save();
          context.rotate((petalo / 4) * Math.PI * 2);
          context.beginPath();
          context.moveTo(0, 0);
          context.quadraticCurveTo(13, -13, 0, -26);
          context.quadraticCurveTo(-13, -13, 0, 0);
          context.stroke();
          context.restore();
        }
        context.beginPath();
        context.arc(0, 0, 5, 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();
    }

    // Desconchones: por donde el vidriado ha saltado y asoma el bizcocho. Van
    // SIEMPRE en las esquinas, que es donde una loseta se descascarilla.
    for (let chip = 0; chip < 3; chip += 1) {
      const corner = (variant + chip) % 4;
      const ox = corner === 0 || corner === 3 ? 0 : size;
      const oy = corner < 2 ? 0 : size;
      context.fillStyle = `rgba(201, 189, 166, ${0.5 + random() * 0.3})`;
      context.beginPath();
      context.moveTo(ox, oy);
      context.lineTo(ox + (ox === 0 ? 1 : -1) * (10 + random() * 20), oy);
      context.lineTo(ox + (ox === 0 ? 1 : -1) * (6 + random() * 10), oy + (oy === 0 ? 1 : -1) * (10 + random() * 16));
      context.lineTo(ox, oy + (oy === 0 ? 1 : -1) * (8 + random() * 18));
      context.closePath();
      context.fill();
    }

    drawTileGroove(context, size, 0.42);
    bakeEdgeShade(context, size, 0.3);
  } else if (style === 'forge') {
    // Plancha de fundición: acero remachado, con una banda de rejilla por la
    // que se ve el metal al rojo de abajo. Es el único suelo FABRICADO del
    // juego — todos los demás son piedra, arena, hielo o tierra — y por eso su
    // dibujo es el único que tiene simetría y piezas repetidas a propósito.
    //
    // AVISO para quien toque el material: aquí NO se sube `metalness`. No hay
    // mapa de entorno en ninguna escena, y el metal sin entorno que reflejar se
    // apaga en vez de brillar (ya dejó las losas de basalto como un agujero
    // negro). El acero se finge con rugosidad baja, arañazos claros y el
    // rescoldo de las juntas, no con metalness.
    const base = context.createLinearGradient(0, 0, size, size);
    base.addColorStop(0, '#8a8272');
    base.addColorStop(0.5, '#756e60');
    base.addColorStop(1, '#635d51');
    context.fillStyle = base;
    context.fillRect(0, 0, size, size);

    // Cepillado del acero: rayas finas y paralelas, todas en la misma
    // dirección. Es lo primero que distingue una plancha laminada de una losa.
    const brushed = variant % 2 === 0;
    for (let stroke = 0; stroke < 260; stroke += 1) {
      const along = random() * size;
      const l = 96 + random() * 92;
      context.strokeStyle = `rgba(${l + 14}, ${l + 6}, ${l - 6}, ${0.05 + random() * 0.12})`;
      context.lineWidth = 0.5 + random() * 1.6;
      context.beginPath();
      if (brushed) {
        context.moveTo(0, along);
        context.lineTo(size, along + (random() - 0.5) * 5);
      } else {
        context.moveTo(along, 0);
        context.lineTo(along + (random() - 0.5) * 5, size);
      }
      context.stroke();
    }

    // Manchas de aceite y hollín: oscuras, irregulares y siempre en las
    // esquinas o junto a la rejilla, que es donde se acumula la porquería.
    for (let stain = 0; stain < 5; stain += 1) {
      const sx = random() * size;
      const sy = random() * size;
      const radius = 22 + random() * 52;
      const gradient = context.createRadialGradient(sx, sy, 0, sx, sy, radius);
      gradient.addColorStop(0, `rgba(28, 24, 20, ${0.3 + random() * 0.26})`);
      gradient.addColorStop(1, 'rgba(28, 24, 20, 0)');
      context.fillStyle = gradient;
      context.fillRect(sx - radius, sy - radius, radius * 2, radius * 2);
    }

    // Óxido: naranja pardo, entrando por los bordes.
    for (let rust = 0; rust < 4; rust += 1) {
      const edge = (variant + rust) % 4;
      const along = random() * size;
      const depth = random() * size * 0.26;
      const rx = edge === 0 ? along : edge === 1 ? size - depth : edge === 2 ? along : depth;
      const ry = edge === 0 ? depth : edge === 1 ? along : edge === 2 ? size - depth : along;
      const radius = 18 + random() * 40;
      const gradient = context.createRadialGradient(rx, ry, 0, rx, ry, radius);
      gradient.addColorStop(0, `rgba(146, 88, 44, ${0.26 + random() * 0.24})`);
      gradient.addColorStop(1, 'rgba(132, 78, 40, 0)');
      context.fillStyle = gradient;
      context.fillRect(rx - radius, ry - radius, radius * 2, radius * 2);
    }

    // LA REJILLA: una banda de barrotes con el metal al rojo debajo. Es la
    // firma del material, igual que la lámina de agua lo es en la losa de
    // marea — sin ella esto sería una chapa gris y nada más.
    //
    // Pero NO va en todas las variantes. En el primer intento la puse en las
    // seis y el tablero entero salió a rayas rojas: dejaba de leerse como un
    // suelo de fundición y pasaba a parecer un estampado. En un patio real la
    // rejilla es una parte del pavimento, no el pavimento. Dos de cada seis
    // losas la llevan; el resto es plancha maciza, y el contraste entre unas y
    // otras es justo lo que hace que la rejilla se note.
    const hasGrate = variant % 3 === 0;
    const grateWidth = size * 0.3;
    const grateX = variant % 2 === 0 ? size * 0.16 : size * 0.54;
    if (hasGrate) {
      // Primero el hueco: el rojo del metal fundido que se ve por debajo.
      const glow = context.createLinearGradient(grateX, 0, grateX + grateWidth, 0);
      glow.addColorStop(0, 'rgba(104, 30, 6, 0.82)');
      glow.addColorStop(0.5, 'rgba(196, 76, 14, 0.86)');
      glow.addColorStop(1, 'rgba(104, 30, 6, 0.82)');
      context.fillStyle = glow;
      context.fillRect(grateX, 14, grateWidth, size - 28);
      // Y encima los barrotes, que son lo que convierte el rojo en rejilla.
      for (let bar = 0; bar < 9; bar += 1) {
        const by = 14 + (bar / 9) * (size - 28);
        context.fillStyle = `rgba(${62 + random() * 26}, ${56 + random() * 22}, ${48 + random() * 18}, 0.94)`;
        context.fillRect(grateX, by, grateWidth, (size - 28) / 9 * 0.56);
      }
      // Marco de la rejilla, para que no parezca pintada encima.
      context.strokeStyle = 'rgba(48, 43, 37, 0.9)';
      context.lineWidth = 5;
      context.strokeRect(grateX, 14, grateWidth, size - 28);
    }

    // Remaches: dos filas a lo largo de los bordes. Cada uno con su brillo
    // arriba y su sombra abajo, que es lo que le da el bulto.
    const rivet = (rx: number, ry: number) => {
      const r = 4.2;
      context.fillStyle = 'rgba(40, 36, 31, 0.5)';
      context.beginPath();
      context.arc(rx, ry + 1.4, r, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = 'rgba(150, 142, 126, 0.85)';
      context.beginPath();
      context.arc(rx, ry, r, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = 'rgba(206, 198, 180, 0.8)';
      context.beginPath();
      context.arc(rx - 1.2, ry - 1.4, r * 0.42, 0, Math.PI * 2);
      context.fill();
    };
    for (let index = 0; index < 8; index += 1) {
      const t = 18 + (index / 7) * (size - 36);
      rivet(t, 15);
      rivet(t, size - 15);
      rivet(15, t);
      rivet(size - 15, t);
    }

    // Arañazos: metal limpio asomando bajo el uso. Muy pocos y muy claros —
    // son lo que hace que la plancha parezca pisada durante años.
    for (let scratch = 0; scratch < 12; scratch += 1) {
      context.strokeStyle = `rgba(212, 204, 186, ${0.14 + random() * 0.24})`;
      context.lineWidth = 0.6 + random() * 1.2;
      context.beginPath();
      const sx = random() * size;
      const sy = random() * size;
      context.moveTo(sx, sy);
      context.lineTo(sx + (random() - 0.5) * 70, sy + (random() - 0.5) * 70);
      context.stroke();
    }

    drawTileGroove(context, size, 0.55);
    bakeEdgeShade(context, size, 0.34);
  } else if (style === 'tide') {
    // Plataforma de marea: la roca que el mar descubre y vuelve a tapar dos
    // veces al día. Es la losa con MÁS capas del juego, y a propósito: es el
    // suelo de la facción que se llama como ella, así que tiene que aguantar
    // que la mires toda la partida.
    //
    // El orden de las capas no es decorativo, es el orden en que la playa las
    // deposita: primero la roca mojada, luego la arena que el agua arrastra a
    // los rincones, encima el alga que se agarra a lo que no se mueve, después
    // los percebes y las conchas, y al final la lámina de agua metida en las
    // juntas, que es lo único que va POR ENCIMA de todo lo demás.
    // Aclarada respecto al primer intento (#5e7480 → #42545e): con aquellos
    // tonos el tablero se leía a rgb(25,27,25), casi negro y sin color. La roca
    // mojada de verdad ES oscura, pero un tablero de juego tiene que aguantar
    // media hora de partida siendo legible, así que gana la legibilidad.
    const base = context.createLinearGradient(0, 0, size, size);
    base.addColorStop(0, '#93a7b0');
    base.addColorStop(0.5, '#7e939d');
    base.addColorStop(1, '#6d838d');
    context.fillStyle = base;
    context.fillRect(0, 0, size, size);

    // Grano de la roca: pizarra mojada, con el moteado muy fino.
    for (let grain = 0; grain < 2600; grain += 1) {
      const l = 104 + random() * 84;
      context.fillStyle = `rgba(${l - 8}, ${l + 4}, ${l + 12}, ${0.06 + random() * 0.16})`;
      context.fillRect(random() * size, random() * size, 1 + random() * 2.2, 1 + random() * 2.2);
    }

    // Estratos: la roca de costa se parte en capas paralelas, y es lo que la
    // distingue de un adoquín cualquiera.
    for (let strata = 0; strata < 4; strata += 1) {
      const y = (strata + 0.5) * (size / 4) + (random() - 0.5) * 22;
      context.strokeStyle = `rgba(38, 50, 58, ${0.2 + random() * 0.22})`;
      context.lineWidth = 1.4 + random() * 3;
      context.beginPath();
      context.moveTo(0, y);
      for (let x = 0; x <= size; x += 22) context.lineTo(x, y + (random() - 0.5) * 9);
      context.stroke();
    }

    // Arena arrastrada a los rincones: pálida y siempre pegada a un borde.
    for (let pocket = 0; pocket < 5; pocket += 1) {
      const edge = (variant + pocket) % 4;
      const along = random() * size;
      const depth = random() * size * 0.3;
      const sx = edge === 0 ? along : edge === 1 ? size - depth : edge === 2 ? along : depth;
      const sy = edge === 0 ? depth : edge === 1 ? along : edge === 2 ? size - depth : along;
      const radius = 20 + random() * 44;
      const gradient = context.createRadialGradient(sx, sy, 0, sx, sy, radius);
      gradient.addColorStop(0, `rgba(198, 182, 148, ${0.34 + random() * 0.24})`);
      gradient.addColorStop(0.65, `rgba(176, 162, 132, ${0.14 + random() * 0.12})`);
      gradient.addColorStop(1, 'rgba(170, 156, 128, 0)');
      context.fillStyle = gradient;
      context.fillRect(sx - radius, sy - radius, radius * 2, radius * 2);
    }

    // Alga parda: tiras largas, no manchas. El alga se tumba en la dirección
    // en que se retiró el agua, así que todas van casi paralelas.
    const drift = random() * Math.PI;
    for (let weed = 0; weed < 7; weed += 1) {
      context.save();
      context.translate(random() * size, random() * size);
      context.rotate(drift + (random() - 0.5) * 0.5);
      context.fillStyle = `rgba(${58 + random() * 36}, ${74 + random() * 34}, ${44 + random() * 24}, ${0.28 + random() * 0.28})`;
      context.beginPath();
      context.ellipse(0, 0, 16 + random() * 30, 2.4 + random() * 3.4, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    // Percebes: anillos claros con el centro oscuro, apiñados en grupos.
    for (let cluster = 0; cluster < 4; cluster += 1) {
      const cx = random() * size;
      const cy = random() * size;
      for (let shell = 0; shell < 9 + random() * 12; shell += 1) {
        const bx = cx + (random() - 0.5) * 46;
        const by = cy + (random() - 0.5) * 46;
        const r = 1.6 + random() * 2.8;
        context.fillStyle = `rgba(214, 208, 192, ${0.36 + random() * 0.34})`;
        context.beginPath();
        context.arc(bx, by, r, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = `rgba(64, 72, 74, ${0.4 + random() * 0.3})`;
        context.beginPath();
        context.arc(bx, by, r * 0.42, 0, Math.PI * 2);
        context.fill();
      }
    }

    // Conchas sueltas: arcos finos, nacarados.
    for (let shell = 0; shell < 5; shell += 1) {
      context.save();
      context.translate(random() * size, random() * size);
      context.rotate(random() * Math.PI * 2);
      context.strokeStyle = `rgba(232, 226, 212, ${0.3 + random() * 0.3})`;
      context.lineWidth = 1 + random() * 1.6;
      context.beginPath();
      context.arc(0, 0, 3 + random() * 5, 0.2, Math.PI - 0.2);
      context.stroke();
      context.restore();
    }

    // La lámina de agua: charcos turquesa que se quedan en las depresiones y,
    // sobre todo, en las juntas. Es la firma del material — sin esto la losa
    // sería roca gris cualquiera, y con esto se lee mojada de un vistazo.
    for (let pool = 0; pool < 3; pool += 1) {
      const px = random() * size;
      const py = random() * size;
      const radius = 22 + random() * 50;
      const gradient = context.createRadialGradient(px, py, 0, px, py, radius);
      gradient.addColorStop(0, `rgba(58, 168, 168, ${0.3 + random() * 0.2})`);
      gradient.addColorStop(0.7, `rgba(44, 128, 138, ${0.16 + random() * 0.12})`);
      gradient.addColorStop(1, 'rgba(40, 116, 128, 0)');
      context.fillStyle = gradient;
      context.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    }
    // Agua encajada en las juntas: un marco turquesa por dentro del borde.
    context.strokeStyle = 'rgba(62, 176, 176, 0.3)';
    context.lineWidth = 9;
    context.strokeRect(5, 5, size - 10, size - 10);
    // Y el brillo del reflejo justo encima de esa agua.
    context.strokeStyle = 'rgba(178, 240, 236, 0.22)';
    context.lineWidth = 2.2;
    context.strokeRect(9, 9, size - 18, size - 18);

    drawTileGroove(context, size, 0.5);
    bakeEdgeShade(context, size, 0.3);
  } else if (style === 'ice') {
    // Losa helada: piedra gris azulada bajo una capa de hielo, con la nieve
    // apelmazada en las juntas y flores de escarcha creciendo desde los
    // bordes. Es el material más reflectante del juego — por eso su mapa de
    // rugosidad es el que más contrasta.
    const base = context.createLinearGradient(0, 0, size, size);
    base.addColorStop(0, '#c3d4e2');
    base.addColorStop(0.5, '#a8bccd');
    base.addColorStop(1, '#8fa6ba');
    context.fillStyle = base;
    context.fillRect(0, 0, size, size);
    // Piedra que se adivina bajo el hielo: manchas frías, desenfocadas.
    for (let patch = 0; patch < 7; patch += 1) {
      const px = random() * size;
      const py = random() * size;
      const radius = 24 + random() * 58;
      const gradient = context.createRadialGradient(px, py, 0, px, py, radius);
      gradient.addColorStop(0, `rgba(88, 104, 122, ${0.16 + random() * 0.2})`);
      gradient.addColorStop(1, 'rgba(120, 140, 160, 0)');
      context.fillStyle = gradient;
      context.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    }
    // Grietas del hielo: ramifican, no van rectas.
    const drawCrack = (x: number, y: number, angle: number, length: number, depth: number) => {
      if (depth > 3 || length < 6) return;
      const x2 = x + Math.cos(angle) * length;
      const y2 = y + Math.sin(angle) * length;
      context.strokeStyle = `rgba(226, 242, 255, ${0.4 - depth * 0.08})`;
      context.lineWidth = Math.max(0.5, 2.4 - depth * 0.6);
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x2, y2);
      context.stroke();
      drawCrack(x2, y2, angle + (random() - 0.5) * 1.1, length * (0.5 + random() * 0.3), depth + 1);
      if (random() > 0.45) drawCrack(x2, y2, angle + (random() - 0.5) * 1.6, length * (0.4 + random() * 0.3), depth + 1);
    };
    for (let crack = 0; crack < 2 + (variant % 3); crack += 1) {
      drawCrack(random() * size, random() * size, random() * Math.PI * 2, 26 + random() * 30, 0);
    }
    // Burbujas atrapadas: lo que delata que es hielo y no cristal.
    for (let bubble = 0; bubble < 40; bubble += 1) {
      context.fillStyle = `rgba(236, 248, 255, ${0.1 + random() * 0.22})`;
      context.beginPath();
      context.arc(random() * size, random() * size, 0.8 + random() * 2.6, 0, Math.PI * 2);
      context.fill();
    }
    // Escarcha: agujas finas que entran desde los bordes hacia el centro.
    for (let frost = 0; frost < 26; frost += 1) {
      const edge = (variant + frost) % 4;
      const along = random() * size;
      const sx = edge === 0 ? along : edge === 1 ? size : along;
      const sy = edge === 0 ? 0 : edge === 1 ? along : edge === 2 ? size : along;
      const inward = edge === 0 ? Math.PI / 2 : edge === 1 ? Math.PI : edge === 2 ? -Math.PI / 2 : 0;
      const angle = inward + (random() - 0.5) * 0.9;
      const length = 8 + random() * 26;
      context.strokeStyle = `rgba(244, 252, 255, ${0.24 + random() * 0.3})`;
      context.lineWidth = 0.6 + random() * 1.2;
      context.beginPath();
      context.moveTo(sx, sy);
      const ex = sx + Math.cos(angle) * length;
      const ey = sy + Math.sin(angle) * length;
      context.lineTo(ex, ey);
      // Barbas laterales: es lo que convierte una raya en una flor de escarcha.
      for (let barb = 1; barb <= 3; barb += 1) {
        const t = barb / 4;
        const bx = sx + (ex - sx) * t;
        const by = sy + (ey - sy) * t;
        const blen = length * 0.22 * (1 - t);
        context.moveTo(bx, by);
        context.lineTo(bx + Math.cos(angle + 1.1) * blen, by + Math.sin(angle + 1.1) * blen);
        context.moveTo(bx, by);
        context.lineTo(bx + Math.cos(angle - 1.1) * blen, by + Math.sin(angle - 1.1) * blen);
      }
      context.stroke();
    }
    // Nieve apelmazada en la junta: se acumula justo donde acaba la losa.
    const snowBand = size * 0.1;
    for (let flake = 0; flake < 500; flake += 1) {
      const fx = random() * size;
      const fy = random() * size;
      const dist = Math.min(fx, fy, size - fx, size - fy);
      if (dist > snowBand) continue;
      context.fillStyle = `rgba(250, 253, 255, ${(1 - dist / snowBand) * 0.55 * random()})`;
      context.fillRect(fx, fy, 1 + random() * 3, 1 + random() * 3);
    }
    drawTileGroove(context, size, 0.34);
    bakeEdgeShade(context, size, 0.24);
  } else {
    // Arenisca al sol: ocre, con ondulación de viento y arena acumulada.
    const base = context.createLinearGradient(0, 0, size * 0.3, size);
    base.addColorStop(0, '#d8b87c');
    base.addColorStop(0.5, '#c9a86a');
    base.addColorStop(1, '#b8975c');
    context.fillStyle = base;
    context.fillRect(0, 0, size, size);
    // Estratos: la arenisca se deposita en capas horizontales.
    for (let layer = 0; layer < 22; layer += 1) {
      const y = random() * size;
      const h = 2 + random() * 12;
      const t = 178 + Math.floor(random() * 44);
      context.fillStyle = `rgba(${t}, ${t - 28}, ${t - 78}, ${0.12 + random() * 0.2})`;
      context.fillRect(0, y, size, h);
    }
    // Ondulación de viento: crestas suaves y paralelas, giradas por variante.
    context.save();
    context.translate(size / 2, size / 2);
    context.rotate((variant / BOARD_TILE_VARIANTS) * Math.PI);
    context.translate(-size / 2, -size / 2);
    for (let ripple = 0; ripple < 14; ripple += 1) {
      const y = (ripple / 14) * size + (random() - 0.5) * 8;
      context.strokeStyle = `rgba(232, 206, 158, ${0.1 + random() * 0.14})`;
      context.lineWidth = 2 + random() * 4;
      context.beginPath();
      context.moveTo(-size * 0.3, y);
      for (let x = -size * 0.3; x < size * 1.3; x += 24) {
        context.lineTo(x, y + Math.sin(x * 0.05 + ripple) * 4);
      }
      context.stroke();
    }
    context.restore();
    for (let grain = 0; grain < 2400; grain += 1) {
      const t = 156 + random() * 82;
      context.fillStyle = `rgba(${t}, ${t - 30}, ${t - 80}, ${0.08 + random() * 0.2})`;
      context.fillRect(random() * size, random() * size, 1 + random() * 2, 1 + random() * 2);
    }
    // Arena acumulada en los bordes: la losa se entierra por donde no pisa nadie.
    for (let drift = 0; drift < 220; drift += 1) {
      const dx = random() * size;
      const dy = random() * size;
      const borde = Math.min(dx, dy, size - dx, size - dy) / (size / 2);
      context.fillStyle = `rgba(226, 202, 152, ${(1 - borde) * 0.3 * random()})`;
      context.fillRect(dx, dy, 1 + random() * 3.4, 1 + random() * 3.4);
    }
    drawTileGroove(context, size, 0.3);
    bakeEdgeShade(context, size, 0.28);
  }

  return finishTexture(key, canvas);
};

/**
 * Campo de ALTURAS de la losa: gris medio = la cara de la piedra, oscuro =
 * hundido, claro = sobresale.
 *
 * Existe porque hasta ahora el relieve salía de usar el mapa de COLOR como
 * mapa de altura (`bumpMap={slab}`), y eso da por bueno que «oscuro =
 * hundido», que es físicamente falso y se notaba:
 *
 *  - En el basalto, las grietas llevan RESCOLDO, o sea que son lo más claro
 *    de la losa. Con el color como altura, las grietas SOBRESALÍAN en vez de
 *    hundirse — justo al revés.
 *  - En el bosque, una hoja oscura se leía como un agujero, y las raíces
 *    (que cruzan por encima de la piedra) quedaban hundidas.
 *  - En el musgo y la nieve pasa lo mismo: son material acumulado ENCIMA,
 *    no huecos.
 *
 * Aquí el relieve se dibuja a propósito, sin depender del color.
 */
const drawTileHeight = (style: BoardTileStyle, variant: number, size: number, context: CanvasRenderingContext2D): void => {
  const random = seededRandom((tileSeed(style, variant) ^ 0x48454947) >>> 0);
  // Cara de la piedra: el punto medio del que todo sube o baja.
  context.fillStyle = 'rgb(140, 140, 140)';
  context.fillRect(0, 0, size, size);

  const dip = (alpha: number) => `rgba(0, 0, 0, ${alpha})`;
  const rise = (alpha: number) => `rgba(255, 255, 255, ${alpha})`;

  if (style === 'basalt') {
    // Grietas HUNDIDAS (aunque brillen por el rescoldo) y placas levantadas.
    for (let plate = 0; plate < 7; plate += 1) {
      const px = random() * size;
      const py = random() * size;
      const radius = 26 + random() * 54;
      const gradient = context.createRadialGradient(px, py, 0, px, py, radius);
      gradient.addColorStop(0, rise(0.3));
      gradient.addColorStop(1, rise(0));
      context.fillStyle = gradient;
      context.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    }
    for (let crack = 0; crack < 3 + (variant % 3); crack += 1) {
      let x = random() * size;
      let y = -6;
      context.strokeStyle = dip(0.85);
      context.lineWidth = 2 + random() * 4;
      context.beginPath();
      context.moveTo(x, y);
      while (y < size + 6) {
        y += 16 + random() * 22;
        x += (random() - 0.5) * 46;
        context.lineTo(x, y);
      }
      context.stroke();
    }
  } else if (style === 'moss' || style === 'forest') {
    // Musgo y hojarasca son material ENCIMA de la piedra: sobresalen.
    const clumps = style === 'forest' ? 20 : 16;
    for (let clump = 0; clump < clumps; clump += 1) {
      const along = random() * size;
      const depth = random() * size * 0.38;
      const edge = (variant + clump) % 4;
      const mx = edge === 0 ? along : edge === 1 ? size - depth : edge === 2 ? along : depth;
      const my = edge === 0 ? depth : edge === 1 ? along : edge === 2 ? size - depth : along;
      const radius = 12 + random() * 30;
      const gradient = context.createRadialGradient(mx, my, 0, mx, my, radius);
      gradient.addColorStop(0, rise(0.5));
      gradient.addColorStop(1, rise(0));
      context.fillStyle = gradient;
      context.fillRect(mx - radius, my - radius, radius * 2, radius * 2);
    }
    if (style === 'forest') {
      // Las raíces cruzan POR ENCIMA de la losa: son lo más alto de todo.
      for (let root = 0; root < 2 + (variant % 2); root += 1) {
        const vertical = (variant + root) % 2 === 0;
        let along = random() * size;
        context.strokeStyle = rise(0.75);
        context.lineWidth = 4 + random() * 5;
        context.beginPath();
        context.moveTo(vertical ? along : 0, vertical ? 0 : along);
        for (let step = 0; step <= size; step += 26) {
          along += (random() - 0.5) * 22;
          context.lineTo(vertical ? along : step, vertical ? step : along);
        }
        context.stroke();
      }
    } else {
      // Grieta con agua: hundida.
      context.strokeStyle = dip(0.6);
      context.lineWidth = 2 + random() * 3;
      context.beginPath();
      let gx = random() * size;
      let gy = 0;
      context.moveTo(gx, gy);
      while (gy < size) {
        gy += 18 + random() * 26;
        gx += (random() - 0.5) * 40;
        context.lineTo(gx, gy);
      }
      context.stroke();
    }
  } else if (style === 'ice') {
    // Grietas del hielo hundidas; escarcha y nieve apelmazada, levantadas.
    for (let crack = 0; crack < 2 + (variant % 3); crack += 1) {
      const cx = random() * size;
      const cy = random() * size;
      const angle = random() * Math.PI * 2;
      const length = 40 + random() * 50;
      context.strokeStyle = dip(0.55);
      context.lineWidth = 1.6 + random() * 2.4;
      context.beginPath();
      context.moveTo(cx, cy);
      context.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
      context.stroke();
    }
    const band = size * 0.12;
    for (let flake = 0; flake < 700; flake += 1) {
      const fx = random() * size;
      const fy = random() * size;
      const dist = Math.min(fx, fy, size - fx, size - fy);
      if (dist > band) continue;
      context.fillStyle = rise((1 - dist / band) * 0.5 * random());
      context.fillRect(fx, fy, 2 + random() * 3, 2 + random() * 3);
    }
  } else if (style === 'sand') {
    // Ondulación de viento: crestas y valles suaves, girados por variante.
    context.save();
    context.translate(size / 2, size / 2);
    context.rotate((variant / BOARD_TILE_VARIANTS) * Math.PI);
    context.translate(-size / 2, -size / 2);
    for (let ripple = 0; ripple < 14; ripple += 1) {
      const y = (ripple / 14) * size;
      context.strokeStyle = rise(0.34);
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(-size * 0.3, y);
      for (let x = -size * 0.3; x < size * 1.3; x += 24) context.lineTo(x, y + Math.sin(x * 0.05 + ripple) * 4);
      context.stroke();
      context.strokeStyle = dip(0.28);
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(-size * 0.3, y + 9);
      for (let x = -size * 0.3; x < size * 1.3; x += 24) context.lineTo(x, y + 9 + Math.sin(x * 0.05 + ripple) * 4);
      context.stroke();
    }
    context.restore();
  } else {
    // Caliza: marcas de cincel hundidas y la esquina desportillada, que es
    // material que FALTA y por tanto baja.
    for (let zone = 0; zone < 3; zone += 1) {
      const zx = random() * size;
      const zy = random() * size;
      const angle = random() * Math.PI;
      for (let mark = 0; mark < 7; mark += 1) {
        context.strokeStyle = dip(0.3);
        context.lineWidth = 2;
        const mx = zx + Math.cos(angle + 1.57) * mark * 9;
        const my = zy + Math.sin(angle + 1.57) * mark * 9;
        context.beginPath();
        context.moveTo(mx, my);
        context.lineTo(mx + Math.cos(angle) * 16, my + Math.sin(angle) * 16);
        context.stroke();
      }
    }
    const corner = variant % 4;
    const cx = corner === 0 || corner === 3 ? 0 : size;
    const cy = corner < 2 ? 0 : size;
    context.fillStyle = dip(0.55);
    context.beginPath();
    context.moveTo(cx, cy);
    context.lineTo(cx + (cx === 0 ? 1 : -1) * 26, cy);
    context.lineTo(cx, cy + (cy === 0 ? 1 : -1) * 24);
    context.closePath();
    context.fill();
  }

  // La junta del borde es lo MÁS hundido de la losa en todos los materiales:
  // es donde acaba la piedra. Se dibuja al final para que nada la pise.
  const grooveWidth = Math.max(3, size * 0.03);
  context.strokeStyle = dip(0.9);
  context.lineWidth = grooveWidth;
  context.strokeRect(grooveWidth / 2, grooveWidth / 2, size - grooveWidth, size - grooveWidth);
};

/**
 * Mapa de normales de la losa, derivado del campo de alturas por Sobel.
 *
 * Un mapa de normales le dice a la luz hacia dónde MIRA cada punto de la
 * superficie, así que el relieve reacciona de verdad al moverse la luz en vez
 * de ser un sombreado aproximado a partir del brillo del color.
 */
export const boardTileNormal = (style: BoardTileStyle, variant: number): CanvasTexture => {
  const key = `board-normal-${style}-${variant}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const size = 256;
  const [, heightContext] = makeCanvas(size);
  drawTileHeight(style, variant, size, heightContext);
  const height = heightContext.getImageData(0, 0, size, size).data;

  const [canvas, context] = makeCanvas(size);
  const out = context.createImageData(size, size);
  // Muestreo separado dos píxeles: suaviza el ruido del dibujo sin difuminar
  // las juntas, que son la parte que más tiene que notarse.
  const gap = 2;
  const sample = (x: number, y: number): number => {
    const cx = Math.min(size - 1, Math.max(0, x));
    const cy = Math.min(size - 1, Math.max(0, y));
    return height[(cy * size + cx) * 4]!;
  };
  // Cuánto relieve aparente. Por material: la arena ondula suave, la roca
  // partida y la piedra tallada marcan mucho más.
  const strength = { stone: 2.6, basalt: 3.4, moss: 2.4, sand: 1.6, ice: 2.2, forest: 3, tide: 3.2, forge: 3.6, glaze: 2.2, sandstone: 3 }[style];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (sample(x + gap, y) - sample(x - gap, y)) / 255;
      const dy = (sample(x, y + gap) - sample(x, y - gap)) / 255;
      const rawX = -dx * strength;
      const rawY = -dy * strength;
      const length = Math.hypot(rawX, rawY, 1);
      const nx = rawX / length;
      const ny = rawY / length;
      const nz = 1 / length;
      const index = (y * size + x) * 4;
      out.data[index] = Math.round((nx * 0.5 + 0.5) * 255);
      // El verde va con el signo cambiado: la V de la textura crece hacia
      // arriba y la Y del canvas hacia abajo. Sin invertirlo, el relieve se
      // ilumina por el lado contrario y las juntas se leen como crestas.
      out.data[index + 1] = Math.round((-ny * 0.5 + 0.5) * 255);
      out.data[index + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      out.data[index + 3] = 255;
    }
  }
  context.putImageData(out, 0, 0);
  const texture = finishTexture(key, canvas);
  // Un mapa de normales son datos, no color: en sRGB Three.js le aplicaría
  // gamma y el relieve saldría deformado. Mismo caso que la rugosidad.
  texture.colorSpace = NoColorSpace;
  // El tablero se mira desde unos 35°, un ángulo muy rasante: aquí es donde
  // el filtrado anisotrópico se nota de verdad (con 4 la piedra lejana se
  // emborrona). Se sube solo en las texturas del suelo jugable.
  texture.anisotropy = 16;
  return texture;
};

/**
 * Mapa de rugosidad de la losa: blanco = mate, negro = brillante. Es lo que
 * hace que dos materiales con la misma geometría se lean como sustancias
 * distintas — sin esto, el basalto vitrificado y la arena seca reflejan la
 * luz exactamente igual.
 */
export const boardTileRoughness = (style: BoardTileStyle, variant: number): CanvasTexture => {
  const key = `board-rough-${style}-${variant}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const size = 128;
  const [canvas, context] = makeCanvas(size);
  const random = seededRandom((tileSeed(style, variant) ^ 0x5a5a5a5a) >>> 0);

  // Nivel base de mate por material. El hielo es el más brillante del juego.
  const baseLevel = { stone: 200, basalt: 150, moss: 210, sand: 244, ice: 70, forest: 226, tide: 96, forge: 104, glaze: 58, sandstone: 232 }[style];
  context.fillStyle = `rgb(${baseLevel}, ${baseLevel}, ${baseLevel})`;
  context.fillRect(0, 0, size, size);

  if (style === 'ice') {
    // La nieve apelmazada del borde NO brilla: es el contraste entre el hielo
    // pulido del centro y la nieve mate de la junta lo que hace que se lean
    // como dos materiales distintos sobre la misma losa.
    const band = size * 0.14;
    const edges: readonly [number, number, number, number][] = [
      [0, 0, band, 0],
      [size, 0, size - band, 0],
      [0, 0, 0, band],
      [0, size, 0, size - band],
    ];
    for (const [x0, y0, x1, y1] of edges) {
      const gradient = context.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, 'rgba(240, 240, 240, 0.9)');
      gradient.addColorStop(1, 'rgba(240, 240, 240, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
    }
    // Zonas escarchadas sueltas, también mates.
    for (let frost = 0; frost < 8; frost += 1) {
      const fx = random() * size;
      const fy = random() * size;
      const radius = 8 + random() * 22;
      const gradient = context.createRadialGradient(fx, fy, 0, fx, fy, radius);
      gradient.addColorStop(0, 'rgba(225, 225, 225, 0.75)');
      gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
      context.fillStyle = gradient;
      context.fillRect(fx - radius, fy - radius, radius * 2, radius * 2);
    }
  } else if (style === 'basalt') {
    // Zonas vitrificadas: manchas muy brillantes donde la roca se enfrió deprisa.
    for (let glass = 0; glass < 7; glass += 1) {
      const gx = random() * size;
      const gy = random() * size;
      const radius = 12 + random() * 30;
      const gradient = context.createRadialGradient(gx, gy, 0, gx, gy, radius);
      gradient.addColorStop(0, 'rgba(40, 40, 40, 0.85)');
      gradient.addColorStop(1, 'rgba(150, 150, 150, 0)');
      context.fillStyle = gradient;
      context.fillRect(gx - radius, gy - radius, radius * 2, radius * 2);
    }
  } else if (style === 'moss') {
    // Charcos: el musgo retiene agua y esas zonas reflejan mucho.
    for (let pool = 0; pool < 9; pool += 1) {
      const px = random() * size;
      const py = random() * size;
      const radius = 8 + random() * 26;
      const gradient = context.createRadialGradient(px, py, 0, px, py, radius);
      gradient.addColorStop(0, 'rgba(58, 58, 58, 0.8)');
      gradient.addColorStop(1, 'rgba(210, 210, 210, 0)');
      context.fillStyle = gradient;
      context.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    }
  } else if (style === 'stone') {
    // Pulido desigual: el centro de la losa se lustra con el paso, los bordes no.
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.6);
    gradient.addColorStop(0, 'rgba(120, 120, 120, 0.55)');
    gradient.addColorStop(1, 'rgba(220, 220, 220, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }

  // Ruido fino: sin él la rugosidad queda en bandas y se nota el degradado.
  for (let noise = 0; noise < 900; noise += 1) {
    const level = baseLevel - 30 + random() * 60;
    context.fillStyle = `rgba(${level}, ${level}, ${level}, ${0.1 + random() * 0.2})`;
    context.fillRect(random() * size, random() * size, 1 + random() * 3, 1 + random() * 3);
  }
  const texture = finishTexture(key, canvas);
  // Un mapa de rugosidad NO es color: son datos crudos. Si se deja en sRGB
  // (lo que hace `finishTexture` por defecto, correcto para los mapas de
  // color) Three.js le aplica corrección gamma y el material sale bastante
  // más brillante de lo pedido.
  texture.colorSpace = NoColorSpace;
  return texture;
};
