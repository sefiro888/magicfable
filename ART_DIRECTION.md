# ART_DIRECTION — Dirección de arte

Complementa a `docs/art-direction.md` (guía original de ilustración por
carta). Este documento fija la dirección global de la experiencia.

## Pilares visuales

1. **La carta es la protagonista absoluta.** Sobre el tablero la unidad ES
   la carta física: nunca una miniatura permanente. Los efectos 3D son
   extensiones breves de la carta (columna de invocación, proyectil,
   impacto) y la atención regresa siempre a ella.
2. **Presupuesto 60/25/15.** 60 % cartas e información, 25 % escenario e
   iluminación, 15 % animaciones y partículas.
3. **Fantasía oscura elegante, no lúgubre.** Piedra fría azulada, oro viejo
   ceremonial, energía arcana cian y fuego carmesí como acentos.
4. **Legibilidad antes que espectáculo.** Ningún efecto tapa coste, nombre,
   estadísticas ni estados; los materiales aditivos no escriben en el
   z-buffer para no ocultar cartas.

## Paleta

| Uso | Color |
| --- | --- |
| Fondo/abismo | `#05070d` |
| Piedra del Santuario | `#141827` – `#232838` |
| Oro ceremonial (anillo, HUD) | `#d7b467` / `#f1d68f` |
| Energía arcana / Esencia Celeste | `#79c8ff` / `#a8ecff` |
| Fuego / Esencia Carmesí | `#ff8a3d` / `#e04a2e` |
| Marfil de texto | `#f5eddc` |

Los tonos de los VFX se derivan automáticamente de las claves declarativas
de cada carta (ver ANIMATION_SYSTEM.md).

## Tipografía

- Display serif (Georgia/var(--display)) para nombres, títulos, números
  ceremoniales.
- Sans (Inter/system) para reglas, HUD y ayudas.

## Cartas

- Marco por facción con filigrana, gema de rareza, sello de facción,
  costes con sigilo de color + genérico.
- Estados siempre con icono + color + texto (nunca solo color): congelada ❄,
  agotada ◒, dañada (vida en rojo), seleccionada (anillo + glow), objetivo
  válido (pulso dorado), no pagable (desaturada).
- En mano: abanico con elevación al cursor; la carta encarada se lee
  completa (coste, reglas, stats).

## Escenario

Ver `SCENARIO_GUIDE.md`. Regla corta: el Santuario ambienta y reacciona,
jamás distrae. Partículas acotadas por nivel de calidad; nada parpadea de
forma continua cerca del tablero.

## Arte de cartas (estado actual)

Los 26 SVG son placeholders procedurales propios (script
`scripts/generate-card-art.js`), oscuros y de silueta simple. Sustitución:
exportar el arte final a `public/assets/cards/art/<card-id>.webp`
(800 × 560); tendrá prioridad automática sobre el SVG sin tocar código.
Mantener: iluminación dramática, un único punto focal, margen inferior
oscuro para que el texto de la carta respire.
