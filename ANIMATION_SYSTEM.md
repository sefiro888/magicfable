# ANIMATION_SYSTEM — Director de animaciones

## Contrato

El motor emite `AnimationEvent` **después** de resolver cada acción:

```ts
interface AnimationEvent {
  id: string                // único, ordena y clava cada montaje de VFX
  type: AnimationEventType  // draw · resource · mana-flow · summon · spell ·
                            // move · attack · damage · shield · destroy ·
                            // freeze · reveal · nexus-damage · turn · victory
  actorId?: string          // jugador o pieza origen
  targetId?: string         // pieza, carta o '<player>-nexus'
  from?/to?: Position       // casillas implicadas (los VFX las necesitan)
  amount?: number           // daño, cantidad de scry…
  effectId?: string         // clave declarativa del vfx de la carta
  durationMs: number        // duración base
}
```

Las animaciones **nunca** deciden reglas. El estado ya está resuelto cuando
el evento llega a la vista; omitirlas jamás desincroniza la partida.

## Ciclo del director (BattlePage)

1. `store.pendingAnimations` acumula los eventos drenados de cada acción.
2. Si no hay `currentEvent`, se avanza la cola (`advanceEvent`).
3. Con cada `currentEvent`:
   - se reproduce su señal de audio (`cueForEvent`),
   - se montan sus VFX (`<EventEffects key={event.id}>` dentro del Canvas),
   - se abren canales laterales si procede (modal de escrutinio, revelación,
     pancarta de turno),
   - un temporizador de `durationMs / animationSpeed` llama a `finishEvent`.
4. Con `reducedMotion`, la duración baja a ~40 ms y los VFX no se montan.
5. El botón «Saltar animaciones (N)» (`skipAnimations`) vacía la cola de
   forma segura: el estado visual final es el mismo.
6. Mientras la cola está ocupada se bloquean «Finalizar turno» y la mano;
   el tablero sigue respondiendo para inspección.

## Mapa evento → presentación

| Evento | VFX (EventEffects) | Audio | Extra |
| --- | --- | --- | --- |
| summon | Columna de luz + halo en la casilla | summon | — |
| attack | Proyectil con estela from→to | attack | — |
| damage | Anillo expansivo + chispas (+grande si ≥4) | impact | Sacudida si ≥4 |
| nexus-damage | Onda sobre el Nexo + golpe de luz | impact | Sacudida + flare de braseros |
| shield | Estallido azul (reducción del Gólem) | shield | — |
| freeze | Floración de púas de hielo | freeze | Velo de hielo persistente en la carta |
| destroy | Ascuas ascendentes en la casilla | destroy | — |
| spell | Estallido en el objetivo | spell | scry-top-cards abre el modal |
| reveal | — | reveal | Toast con la carta observada |
| move | (desplazamiento suave de la carta, damp) | move | — |
| draw / resource / mana-flow | — | draw / resource / — | Cristales del HUD |
| turn | Pulso del anillo rúnico | turn | Pancarta «Tu turno / Turno rival» |
| victory | Haz vertical + pulso del anillo | victory/defeat | Modal de resultado al vaciar la cola |

## Tono cromático

`toneOf(effectId)` deduce el color del VFX de la clave declarativa de la
carta (`ember/fury/magma…` → cálido; `frost/glacial…` → hielo;
`arcane/rune/astral…` → azul; resto → dorado). Añadir una carta nueva no
requiere tocar la capa de VFX: basta con nombrar bien sus `vfx.*`.

## Reglas para nuevas animaciones

1. Duración breve (≤ 900 ms) y con `Math.sin(progress·π)` para entrar/salir.
2. Materiales aditivos con `depthWrite: false`; nunca ocultar la carta.
3. Montaje keyed por `event.id`; sin estado compartido entre eventos.
4. Respetar `reducedMotion` (no montar, o devolver null).
5. Presupuesto: las cartas mandan (60/25/15); el efecto acompaña, no tapa.
