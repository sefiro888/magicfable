# SCENARIO_GUIDE — El Santuario de las Runas Quebradas

## Concepto

Antigua arena ritual suspendida sobre el abismo, donde se libraron los
duelos que quebraron las Siete Runas. La plataforma conserva la energía
residual de aquellas batallas: la **Esencia** que hoy alimenta cada carta.
Tres runas del anillo exterior están apagadas — quebradas — como cicatriz
visible del pasado.

## Composición (battle/Sanctuary.tsx) — versión «plataforma celeste»

| Elemento | Implementación | Calidad |
| --- | --- | --- |
| Plataforma | Losa redondeada extruida + 4 lóbulos circulares, piedra cálida con incrustaciones doradas (textura procedural) y roca colgante bajo la base | siempre |
| Círculos rúnicos | Decal azul incandescente (anillos + glifos) sobre cada lóbulo | siempre |
| Anillo de incrustación | Anillo dorado plano alrededor del tablero; **late** en cambios de turno y victoria | siempre |
| Balaustrada | Pasamanos dobles de latón en arco por lóbulo, postes y remates de cristal | siempre (menos postes en bajo) |
| Pilonos de esquina | Poste dorado + cristal flotante con halo; **flare** en golpes al Nexo | siempre |
| Portal arcano | Escalinata, pilares rúnicos, arco con cristal maestro y doble vórtice espiral rotatorio tras el Nexo rival; luz azul con flare | chispas: media+ |
| Telescopio | Latón ceremonial sobre el lóbulo oeste; deriva lenta de orientación | siempre |
| Cielo cósmico | Esfera de nebulosa procedural + 3 planetas con halo + `Stars` (350/900/1600) | siempre |
| Nubes | Bancos de sprites suaves orbitando bajo la plataforma | media+ |
| Islotes lejanos | 3 rocas oscuras flotando con deriva | media+ |
| Partículas ambientales | `Sparkles`: motas arcanas frías + motas doradas | media+ |

Texturas: 100 % procedurales en `battle/textures.ts` (canvas, PRNG sembrado,
cacheadas). No hay assets externos ni peticiones de red.

## Reacciones a la partida

| Suceso | Reacción |
| --- | --- |
| Cambio de turno | Pulso del anillo rúnico + pancarta |
| Golpe al Nexo / daño ≥ 4 | Sacudida sutil de cámara + flare de braseros |
| Invocación | Columna de luz en la casilla |
| Destrucción | Ascuas ascendentes |
| Victoria/derrota | Haz vertical central + pulso del anillo |

Regla: reacciones **breves y discretas**; el escenario nunca compite con la
lectura de las cartas (presupuesto visual 60 cartas / 25 escenario / 15 FX).

## Cómo añadir un segundo escenario

1. Crear `battle/<NuevoEscenario>.tsx` con la misma interfaz que
   `Sanctuary` (`quality`, `reducedMotion`, `event`).
2. Añadir sus texturas procedurales a `textures.ts` (clave de caché propia).
3. Elegir escenario en `Board3D` (prop o preferencia).
4. Mantener las mismas garantías: presupuesto visual, `reducedMotion`,
   partículas acotadas por calidad.
