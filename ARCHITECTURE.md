# ARCHITECTURE — Crónicas del Nexo

## Principio rector

**El motor decide; la presentación representa.** Ninguna animación, sonido o
componente visual altera reglas. El motor es una biblioteca TypeScript pura
(sin React, Three ni DOM) que devuelve, junto a cada estado nuevo, una cola
de `AnimationEvent` ya resueltos que la capa visual reproduce.

## Capas

```text
┌───────────────────────────────────────────────────────────┐
│ DATOS (validados con Zod al cargar)                       │
│  src/game/cards.ts · decks.ts · factions.ts · schemas.ts  │
└──────────────────────────┬────────────────────────────────┘
                           ↓
┌───────────────────────────────────────────────────────────┐
│ MOTOR PURO                    ←  IA (ai.ts)               │
│  engine.ts (acciones, efectos, coste efectivo)            │
│  mana.ts (pagos) · random.ts (PRNG sembrado)              │
│  deck-validation.ts                                       │
│  Salida: ActionResult { ok, state, error }                │
│          state.animations: AnimationEvent[]               │
└──────────────────────────┬────────────────────────────────┘
                           ↓
┌───────────────────────────────────────────────────────────┐
│ ORQUESTACIÓN (Zustand)                                    │
│  store/match.ts  → drena animations a pendingAnimations   │
│  store/preferences.ts → persistencia local (v2)           │
└──────────────────────────┬────────────────────────────────┘
                           ↓
┌───────────────────────────────────────────────────────────┐
│ PRESENTACIÓN                                              │
│  pages/BattlePage.tsx → director de animaciones,          │
│    mano en abanico, modales (mulligan/scry/inspección)    │
│  battle/Board3D.tsx  → escena R3F interactiva             │
│  battle/Sanctuary.tsx → escenografía del Santuario        │
│  battle/EventEffects.tsx → VFX por tipo de evento         │
│  battle/textures.ts  → texturas procedurales (canvas)     │
│  services/audio.ts   → señales sintetizadas               │
│  components/Card.tsx → marco de carta único y reutilizado │
└───────────────────────────────────────────────────────────┘
```

## Flujo de una acción

1. La UI (o la IA) construye una `GameAction` y llama a `store.dispatch`.
2. `applyAction` del motor valida y devuelve `ActionResult` inmutable.
3. El store guarda el estado con la cola vaciada y añade los eventos a
   `pendingAnimations` (cola de presentación, fuera del estado de reglas).
4. El **director de animaciones** (efectos en BattlePage) consume la cola
   de uno en uno: reproduce sonido, dispara `EventEffects` en la escena,
   abre canales laterales (modal de scry, revelación) y espera
   `durationMs / animationSpeed` (o casi cero con movimiento reducido).
5. El turno de la IA es **paso a paso**: `chooseNextAiAction` devuelve una
   única acción legal; la UI la despacha cuando la cola está vacía, con lo
   que cada jugada rival se ve y se oye por separado.

## Determinismo

- `createMatch(deckA, deckB, seed)` produce partidas reproducibles.
- Todo azar deriva del PRNG sembrado (`random.ts`).
- La IA es determinista (desempates estables por hash/orden lexicográfico).
- Los tests aprovechan esto: simulación de partida completa sin bucles.

## Reglas de dependencia

- `src/game/**` no importa nada de React/Three/DOM (regla de AGENTS.md).
- `battle/**` puede leer tipos del motor, nunca modificar estado de reglas.
- Los efectos de carta son **datos** (`CardEffect[]`), resueltos por el
  motor; los identificadores `vfx`/`sfx` son claves declarativas que la
  presentación traduce a efectos concretos (tono cromático incluido).

## Puntos de extensión

| Quiero añadir… | Toco |
| --- | --- |
| Una carta | `cards.ts` (+ SVG en `public/assets/cards/art/`) |
| Un efecto de regla nuevo | `types.ts` (CardEffect) + `schemas.ts` + `engine.ts` + prueba |
| Un efecto visual nuevo | `EventEffects.tsx` (nuevo caso) o tono en `toneOf` |
| Un escenario | Nuevo módulo hermano de `Sanctuary.tsx` + selector |
| Una facción | `factions.ts` + cartas + variante de Esencia en labels |
| Un sonido real | `public/assets/audio/` + sustituir síntesis en `audio.ts` |
| Otra IA | Implementar `chooseNextAiAction` alternativo |

## Rendimiento

- Calidad gráfica (baja/media/alta) controla: sombras, dpr, antialias,
  partículas (Sparkles/Stars) y elementos secundarios del escenario.
- Texturas procedurales generadas una vez y cacheadas (Map por clave).
- Efectos de evento montados solo mientras dura el evento (key por id).
- `reducedMotion` corta partículas en movimiento, sacudidas y tweens.
