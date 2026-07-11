# SCENARIO_GUIDE — El Santuario de las Runas Quebradas

## Concepto

Antigua arena ritual suspendida sobre el abismo, donde se libraron los
duelos que quebraron las Siete Runas. La plataforma conserva la energía
residual de aquellas batallas: la **Esencia** que hoy alimenta cada carta.
Tres runas del anillo exterior están apagadas — quebradas — como cicatriz
visible del pasado.

## Composición (battle/Sanctuary.tsx)

| Elemento | Implementación | Calidad |
| --- | --- | --- |
| Plataforma | Cilindro de piedra + tapa circular con textura procedural (losas, vetas, grietas de energía, anillo rúnico grabado con huecos «quebrados») | siempre |
| Anillo rúnico | `ringGeometry` dorada flotante; rota despacio y **late** en cambios de turno y victoria | siempre |
| Monolitos | 7 estelas talladas (textura de runas emisivas) en círculo roto; 3 con fragmento superior flotando (`Float`) | fragmentos: media+ |
| Braseros | 4 cuencos sobre la plataforma: llama de planos cruzados (sprite radial), chispas y `pointLight` con parpadeo; **flare** en golpes al Nexo | chispas: media+ |
| Ruinas lejanas | 5 losas oscuras flotando con deriva lenta | media+ |
| Abismo | Fog + fondo negro azulado + resplandor arcano bajo la plataforma | siempre |
| Estrellas | `Stars` de drei (300/800/1500 según calidad) | siempre |
| Partículas ambientales | `Sparkles`: motas arcanas frías + ascuas cálidas | media+ |

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
