# SCENARIO_GUIDE — Escenarios de batalla

El juego incluye dos escenarios seleccionables en Ajustes → Gráficos.

---

# 1. AETHER CITADEL (predeterminado)

## Concepto

Ciudadela flotante de piedra gris azulada con incrustaciones doradas,
suspendida sobre un mar de nubes al amanecer. Plaza central de batalla
(donde vive el tablero 8×8), plazas laterales con círculos rúnicos,
gran portal arcano al noroeste, cristales azules monumentales, torres,
puentes con arcos y acantilados flotantes.
Referencia visual: `docs/references/aether-citadel-reference.png`.

## Pipeline (Blender → GLB → R3F)

- **Fuente**: `tools/blender/generate_aether_citadel.py` — script Python
  100 % reproducible; construye 14 colecciones modulares con nombre
  (CentralBattlePlatform, LeftPortalPlatform, RightCrystalPlatform,
  FrontPlatform, RearPlatform, MainBridges, SecondaryBridges, PortalFrame,
  CrystalPedestals, Columns, DistantTowers, FloatingCliffs,
  DecorativeRuins, GoldenInlays), materiales PBR, cámara de control y
  render de comparación.
- **Regenerar**:
  `"C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" --background --python tools/blender/generate_aether_citadel.py`
- **Salidas**: `public/assets/scenarios/aether-citadel.glb` (~1,8 MB),
  `assets-source/blender/aether-citadel.blend`,
  `artifacts/blender/aether-citadel-render.png`.
- **Convención**: 1 unidad = 1 unidad de juego; el «norte» del juego
  (lado IA, three −Z) es Blender +Y; la tapa de la plaza central queda
  en y=0 para que las casillas se apoyen sobre ella.

## Capa dinámica (src/battle/scenarios/AetherCitadel.tsx)

Sobre el GLB estático, React Three Fiber añade: cielo de amanecer
procedural (canvas), sol cálido con sombras, vórtice doble del portal en
rotación, halos pulsantes sobre los cristales, mar de nubes a la deriva,
motas doradas y niebla de profundidad. Reacciona a los golpes al Nexo
(flare de portal y cristales) y respeta calidad gráfica y movimiento
reducido. Si el GLB no puede cargarse, cae al Santuario automáticamente.

## Presupuesto técnico verificado

GLB 1,8 MB · 246 mallas · 8 materiales · 49 FPS en calidad alta a
1600×900 (Chromium/ANGLE) · cero errores de consola.

---

# 2. EL SANTUARIO DE LAS RUNAS QUEBRADAS

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
