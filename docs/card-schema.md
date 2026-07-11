# Esquema de cartas y mazos

## Principios

La fuente de verdad es `CardDefinition` validada por `CardDefinitionSchema`. Las definiciones son inmutables, tienen un ID estable y no contienen callbacks. Las reglas escritas explican la carta al jugador; `effects` y los campos de estadísticas son lo que ejecuta el motor. Nunca se analiza el texto de reglas para aplicar una mecánica.

## Identidad y catálogos

- `id`: minúsculas ASCII con segmentos separados por guion (`^[a-z0-9]+(?:-[a-z0-9]+)*$`). No cambia por traducción.
- `name`: nombre visible y localizable.
- `faction`: `fury | arcane | nature | order | shadow | void`.
- `type`: `mana | unit | instant | persistent | structure | relic`.
- `rarity`: `common | uncommon | rare | mythic`.
- `set` y `collectorNumber`: conjunto y número de colección. El número es positivo.

`color` es un hexadecimal de seis dígitos derivado normalmente de la facción. No es la única señal visual.

## Campos

| Campo | Tipo | Requerido | Regla |
| --- | --- | --- | --- |
| `id` | `string` | sí | kebab-case ASCII, único |
| `name` | `string` | sí | no vacío |
| `faction` | `FactionId` | sí | una de seis facciones |
| `color` | `#RRGGBB` | sí | color de acento |
| `type` | `CardType` | sí | discriminante de anatomía |
| `subtype` | `string` | no | Bestia, Guerrero, Portal… |
| `rarity` | `Rarity` | sí | cuatro niveles |
| `cost` | `ManaCost` | sí | genérico ≥ 0 y mapa de color ≥ 0 |
| `rules` | `string` | sí | explicación visible |
| `flavor` | `string` | sí | narración visible diferenciada |
| `attack` | entero ≥ 0 | unidad | obligatorio en unidad |
| `health` | entero > 0 | unidad | obligatorio en unidad |
| `resistance` | entero > 0 | estructura | obligatorio en estructura; una reliquia puede prepararlo |
| `range` | entero > 0 | no | por defecto de motor según tipo |
| `movement` | entero ≥ 0 | no | 0 para inmóvil |
| `keywords` | `Keyword[]` | sí | puede estar vacío |
| `set` | `string` | sí | conjunto visible |
| `collectorNumber` | entero > 0 | sí | único dentro del conjunto por convención |
| `artist` | `string` | sí | crédito, incluso para arte provisional |
| `aiTags` | `string[]` | sí | pistas heurísticas, no reglas |
| `art` | `CardArt` | sí | WebP, SVG de respaldo y alt |
| `vfx` | `CardVfx` | sí | IDs opcionales de presentación |
| `sfx` | `CardSfx` | sí | IDs opcionales de audio |
| `unlocked` | `boolean` | sí | disponibilidad de contenido |
| `unique` | `boolean` | sí | limita a una copia en mazo |
| `effects` | `CardEffect[]` | sí | puede estar vacío |

## Coste

```ts
interface ManaCost {
  generic: number;
  colored: Partial<Record<FactionId, number>>;
}
```

`{ generic: 1, colored: { fury: 2 } }` significa dos fuentes de Furia más una fuente cualquiera. Una carta de maná debe usar `{ generic: 0, colored: {} }`. El plan de pago reserva color antes de genérico.

## Arte

```ts
interface CardArt {
  webp: string;    // /assets/cards/art/<id>.webp
  fallback: string; // /assets/cards/art/<id>.svg
  alt: string;
}
```

Las dos rutas deben empezar en `/assets/cards/art/` y terminar en la extensión correcta. El SVG permanece aunque exista WebP.

## Reglas estructurales por tipo

- `mana`: coste cero; no necesita estadísticas de combate.
- `unit`: requiere `attack` y `health`; `range` y `movement` se pueden omitir si el motor tiene un valor base.
- `structure`: requiere `resistance`; no se mueve.
- `instant`: se resuelve y va al descarte.
- `persistent`: crea un efecto con caducidad o condición explícita.
- `relic`: tipo preparado; su ciclo completo no se considera garantizado en el slice.

Un campo no aplicable debe omitirse, no rellenarse con cero o cadena vacía para satisfacer una plantilla.

## Palabras clave iniciales

`impulse`, `swift-strike`, `frozen`, `guard`, `flying` y `channel` forman el vocabulario reservado. Solo `impulse` y los estados requeridos por el slice deben asumirse totalmente jugables; una palabra preparada necesita implementación y ayuda contextual antes de publicarse en nuevas cartas.

## Efectos declarativos

La unión discriminada inicial contiene:

| `kind` | Datos relevantes | Resultado |
| --- | --- | --- |
| `damage` | `amount`, `target` | daño a pieza legal |
| `freeze` | `duration` | impide mover/atacar temporalmente |
| `draw` | `amount` | mueve cartas de mazo a mano |
| `discard` | `amount` | mueve cartas de mano a descarte |
| `heal-nexus` | `amount` | recupera Nexo hasta su límite |
| `adjacent-damage` | `amount`, `includeAllies` | daño alrededor de una entrada |
| `buff-self-on-attack` | `attack` | bonificación durante combate |
| `scry` | `amount` | observa/reordena la parte superior |
| `scorch` | `duration` | aplica estado de casilla/pieza |
| `passive` | `id`, `value?` | disparador tipado por registro |

Los `passive.id` son deuda controlada: IDs desconocidos deben rechazarse o quedar explícitamente sin resolución, nunca ejecutarse con `eval` ni lógica derivada del nombre visible.

## Ejemplo mínimo válido

```ts
{
  id: 'sabueso-brasa',
  name: 'Sabueso de Brasa',
  faction: 'fury',
  color: '#b83a2d',
  type: 'unit',
  subtype: 'Bestia',
  rarity: 'common',
  cost: { generic: 0, colored: { fury: 1 } },
  rules: 'Impulso: puede moverse el turno en que entra en juego.',
  flavor: 'No persigue el olor de la sangre, sino el miedo que la precede.',
  attack: 2,
  health: 1,
  range: 1,
  movement: 1,
  keywords: ['impulse'],
  set: 'NEX-01 · Despertar',
  collectorNumber: 2,
  artist: 'Atelier del Nexo',
  aiTags: ['aggressive', 'fast'],
  art: {
    webp: '/assets/cards/art/sabueso-brasa.webp',
    fallback: '/assets/cards/art/sabueso-brasa.svg',
    alt: 'Ilustración de Sabueso de Brasa'
  },
  vfx: { summonEffect: 'ember-pounce', attackEffect: 'ember-trail' },
  sfx: { play: 'fury-play', impact: 'fury-impact' },
  unlocked: true,
  unique: false,
  effects: []
}
```

## Comandante

`CommanderDefinition` tiene `id`, `name`, `title`, `faction`, `nexusHealth`, `rules`, `flavor`, `art` y `vfx`. No es una `CardDefinition`, no tiene coste y no forma parte de `DeckEntry`. En el slice ambos comandantes usan 25 de vida.

## Mazos

```ts
interface DeckDefinition {
  id: string;
  name: string;
  faction: FactionId;
  commanderId: string;
  cards: readonly { cardId: string; count: number }[];
}
```

La validación semántica comprueba tamaño 50, 20 manás, 30 no manás, IDs conocidos, monofacción, máximo cuatro copias normales, máximo una única y comandante conocido de la misma facción. `DeckDefinitionSchema` valida forma; `validateDeck` valida estas relaciones con el catálogo.

## Instancias y estado

La definición describe una carta del catálogo; una instancia en partida añade `instanceId`. Una pieza de tablero añade propietario, posición, vida actual, modificador de ataque, marcas de movimiento/ataque, turno de entrada y estados. Nunca se escribe daño recibido en `CardDefinition`.

## Evolución segura

1. Añadir primero el nuevo miembro al tipo y al esquema Zod.
2. Implementar su semántica en el motor puro.
3. Añadir pruebas de validación, objetivo, resolución y caducidad.
4. Registrar VFX/SFX sin acoplarlos a la resolución.
5. Crear ayuda contextual y comprobar accesibilidad.
6. Solo entonces usarlo en contenido jugable.

Cambiar el significado de un efecto existente requiere versión de reglas si se quieren partidas guardadas o replays en el futuro.
