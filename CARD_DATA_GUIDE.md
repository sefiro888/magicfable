# CARD_DATA_GUIDE — Cómo se define una carta

Las cartas son **datos** (`src/game/cards.ts`) validados con Zod
(`src/game/schemas.ts`) al cargar. La lógica vive en el motor; la carta solo
declara qué efectos tiene y qué claves audiovisuales usa.

## Estructura (CardDefinition)

```ts
defineCard({
  id: 'fenix-pavesa',              // kebab-case; nombra también su arte
  name: 'Fénix de Pavesa',
  faction: 'fury',                 // fury | arcane | nature | order | shadow | void
  type: 'unit',                    // mana | unit | instant | persistent | structure | relic
  subtype: 'Ave ígnea',
  rarity: 'uncommon',              // common | uncommon | rare | mythic
  cost: factionCost('fury', 1, 2), // (facción, coste de color, genérico)
  attack: 2, health: 3,            // unidades
  // resistance: 5,                // estructuras
  range: 2, movement: 1,
  rules: 'Al entrar en juego, inflige 1 de daño a una carta enemiga adyacente.',
  flavor: 'Cada una de sus plumas recuerda un incendio distinto.',
  keywords: [],                    // impulse | swift-strike | frozen | guard | flying | channel
  collectorNumber: 8,
  aiTags: ['ranged', 'damage'],    // pistas para la heurística de la IA
  unique: false,                   // true = máximo 1 copia por mazo (✦)
  effects: [{ kind: 'passive', id: 'entry-adjacent-enemy-damage', value: 1 }],
  vfx: { summonEffect: 'rift-open', attackEffect: 'fire-bolt', impactEffect: 'magma-pop' },
  sfx: { play: 'fury-play', impact: 'fury-impact' },  // opcional; hay valores por defecto
})
```

`defineCard` completa automáticamente: color de facción, rutas de arte
(`/assets/cards/art/<id>.webp|.svg`), set, artista y validación Zod.

## Efectos disponibles (resueltos por el motor)

| kind | Parámetros | Qué hace |
| --- | --- | --- |
| damage | amount, target: enemy-piece \| any-piece | Daño directo con objetivo |
| freeze | duration | Congela una unidad |
| draw / discard | amount | Robo / descarte propio |
| heal-nexus | amount | Cura tu Nexo (tope: máximo del comandante) |
| adjacent-damage | amount, includeAllies | Daño al entrar, en cruz |
| buff-self-on-attack | attack | Bonus al atacar |
| scry | amount | Observa y reordena la cima del mazo (modal para el jugador) |
| scorch | duration | Abrasa la casilla del objetivo |
| refresh-move | — | Una unidad aliada puede volver a moverse |
| splash-weakest-enemy | amount | Réplica sobre la unidad enemiga más débil |
| passive | id, value? | Pasivas con resolutor propio (ver tabla) |

### Pasivas con resolutor en el motor

`first-damage-reduction` (Gólem) · `spell-generic-discount` (Archivo) ·
`entry-adjacent-enemy-damage` · `structure-bonus-damage` ·
`freeze-on-damage` · `frozen-bonus-damage` · `target-attack-until-end` ·
`first-fury-unit-attack` (Forja, por cardId) · `loot-after-spell` (Torre,
por cardId) · `blocking-structure` (implícita: toda pieza bloquea).

**Regla de oro: si una carta declara un efecto, el motor debe resolverlo.**
Un efecto nuevo entra siempre con: tipo en `types.ts`, esquema en
`schemas.ts`, resolutor en `engine.ts`, objetivo en la UI/IA si lo necesita
y prueba en `src/game/*.test.ts`.

## Claves vfx/sfx

Son **declarativas**: la capa visual deduce el tono cromático de la clave
(`ember/fury/…` cálido, `frost/…` hielo, `arcane/…` azul, resto dorado) y el
tipo de efecto del evento. Nombra las claves con sentido temático y el
sistema hará el resto. Sonidos: la síntesis actual es un placeholder; los
archivos reales irán en `public/assets/audio/` (ver `services/audio.ts`).

## Arte

- Cada `id` necesita `public/assets/cards/art/<id>.svg` (placeholder actual,
  generado por `scripts/generate-card-art.js`).
- Un `<id>.webp` con el mismo nombre tiene prioridad automática (arte final).
- No incorporar ilustraciones sin licencia verificable (AGENTS.md).

## Mazos

50 cartas exactas = 20 fuentes + 30 acción · máx. 4 copias (1 si única) ·
comandante de la misma facción. `validateDeck` lo comprueba y `createMatch`
rechaza mazos inválidos.

## Traducción futura

Los textos viven en las definiciones (`name`, `rules`, `flavor`, labels de
`utils/cardLabels.ts` y glosario). Extraerlos a un diccionario por idioma es
mecánico: ningún texto de carta está incrustado en componentes visuales.
