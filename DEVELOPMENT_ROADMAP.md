# DEVELOPMENT_ROADMAP — Hoja de ruta

Complementa a `docs/roadmap.md` (hitos M0–M4 originales).

## Hecho — fase «Aether Citadel + 8×8» (2026-07-12)

- ✅ Tablero migrado a **8×8** (64 casillas): configuración lógica única en
  `src/game/board.ts`, IA sin valores codificados, coordenadas visuales
  compartidas en `battle/grid/gridCoordinates.ts`, 70 pruebas.
- ✅ **Aether Citadel**: escenario GLB generado con Blender 5.1 desde
  script reproducible (3 iteraciones documentadas), integrado con
  useGLTF + Suspense + fallback, portal animado, cristales, nubes y
  amanecer; 1,8 MB; 49 FPS en alta.
- ✅ Selector de escenario en Ajustes; el Santuario se conserva íntegro.
- ✅ Capturas deterministas en 3 resoluciones y 3 calidades
  (`artifacts/visual-comparison/`, no versionadas).

### Balance del 8×8 — recomendación 1 APLICADA (2026-07-12)

El tablero grande alargaba la marcha (~7 turnos hasta el contacto). Se
aplicó la opción de menor impacto y mayor sabor:

- ✅ **MOV 2** para las unidades ágiles: Sabueso, Berserker, Dragón,
  Fénix, Tejedora y Duelista (la Lancera ya lo tenía).
- ✅ **MOV 1 conservado** como rasgo de peso: Ariete, Gólem, Centinela y
  Archivo Viviente.
- El movimiento sigue siendo en línea recta ortogonal con ruta libre
  (sin diagonales), verificado con prueba dedicada.

Pendientes de una futura pasada de balance (no aplicadas): Impulso a
«mueve hasta 2», alcance +1 en tiradoras, o filas de despliegue en
y=1/y=6.

## Hecho — fase «Santuario» (2026-07-11)

- ✅ Auditoría completa y documentación de raíz (10 documentos).
- ✅ Motor honesto: las 8 pasivas/efectos rotos implementados con pruebas.
- ✅ Identidad del recurso: Esencia (Carmesí/Celeste) en cartas, HUD y glosario.
- ✅ Escenario «El Santuario de las Runas Quebradas» completo y reactivo.
- ✅ Director de animaciones sobre la cola de eventos del motor, con
  velocidad ajustable, omisión y movimiento reducido.
- ✅ IA paso a paso (una acción visible por vez) determinista y acotada.
- ✅ Mano en abanico con el marco rico; estados visuales sobre el tablero.
- ✅ UI de escrutinio (scry) y revelación de Oriel.
- ✅ Calidad gráfica baja/media/alta; modo desarrollador oculto.
- ✅ Suite completa: 59 pruebas unitarias + e2e Playwright + lint + build.

## Siguiente hito recomendado (H1 — Profundidad táctica)

1. Fatiga o condición de fin para mazo agotado (decisión de balance).
2. Bloqueo activo / provocación real para la palabra clave Guardia.
3. `swift-strike` y `flying` con reglas jugables (hoy reservadas).
4. Efectos de casilla abrasada con daño real al pisar (hoy es marca visual).
5. 2-3 cartas nuevas por facción que usen los efectos ya soportados.
6. IA: evaluación de intercambios (hoy ataca al mejor objetivo local).

## H2 — Contenido y presentación

- Arte final WebP para las 26 ilustraciones (pipeline ya preparado).
- Audio real (archivos con licencia en `public/assets/audio/`), música
  ambiental del Santuario y mezcla por canal (ya hay volúmenes separados).
- Animación de robo hacia la mano y pila de descarte visible/clicable.
- Repetición de partida (los eventos + semilla ya lo permiten).
- Tercera facción jugable (Naturaleza) con variante de Esencia Verde.

## H3 — Estructura de juego

- Segundo escenario (mismo contrato que Sanctuary).
- Editor de mazos completo con validación en vivo (base en DecksPage).
- Campaña corta de 3 duelos con modificadores de escenario.
- Guardado/carga de partida (serializar MatchState es trivial: es JSON puro).

## Deuda técnica registrada

- Migrar Forja/Torre de `cardId` codificado a resolutores por pasiva cuando
  el set crezca (>40 cartas).
- `framer-motion` instalada y aún sin uso significativo: adoptarla para HUD
  o retirarla en H2.
- Etiquetas HTML sobre el tablero 3D (drei Html): si el rendimiento en
  equipos modestos lo pide, migrar a sprites.
- El e2e cubre el flujo feliz; añadir un spec de combate completo cuando la
  IA gane variedad.
