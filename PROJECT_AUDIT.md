# PROJECT_AUDIT — Crónicas del Nexo

Fecha de auditoría: 2026-07-11.
Auditor: equipo de desarrollo (fase de mejora del vertical slice).

## 1. Resumen del proyecto

**Crónicas del Nexo** es un juego táctico de cartas para PC ya funcional como
vertical slice: dos mazos de 50 cartas (Furia de la Caldera y Secretos del
Arcano) se enfrentan sobre un tablero 3D de 5 × 5. Las cartas permanecen como
piezas físicas sobre el tablero; no se sustituyen por miniaturas. Existe una
partida completa contra IA local, con mulligan, recursos, despliegue,
movimiento, combate, victoria por Nexo y resumen final.

El proyecto NO parte de cero: es una base sólida, con una separación
motor/presentación correcta y verificación automatizada real (47 pruebas
unitarias, e2e Playwright, TypeScript estricto, ESLint, build limpio).

## 2. Tecnologías encontradas

| Área | Tecnología | Versión |
| --- | --- | --- |
| Lenguaje | TypeScript estricto | 6.0.x |
| UI | React | 19.2 |
| Bundler/dev | Vite | 8.1 |
| 3D | three.js + @react-three/fiber + drei | 0.185 / 9.6 / 10.7 |
| Animación DOM | framer-motion (instalada, apenas usada) | 12.x |
| Estado | zustand (+persist para preferencias) | 5.x |
| Validación de datos | zod | 4.x |
| Rutas | react-router-dom | 7.x |
| Tests unitarios | vitest + testing-library | 4.x |
| Tests e2e | @playwright/test | 1.61 |
| Node requerido | >= 20.19 | — |

Comandos: `npm run dev` (puerto 4173), `test`, `test:e2e`, `build`, `lint`,
`format`, `preview`.

## 3. Arquitectura actual

```
Datos validados con Zod (src/game/cards.ts, decks.ts, factions.ts, schemas.ts)
        ↓
Motor puro de reglas (src/game/engine.ts, mana.ts, random.ts) ← IA (src/game/ai.ts)
        ↓  ActionResult + cola AnimationEvent[]
Zustand (src/store/match.ts, preferences.ts)
        ↓
React UI (src/pages/*) ── Tablero R3F (src/battle/Board3D.tsx) ── Audio (src/services/audio.ts)
```

La frontera clave se respeta: **el motor decide el resultado; la presentación
solo lo representa**. El motor no importa React, Three ni DOM. Los datos de
cartas están separados de su representación y se validan al cargar.

## 4. Funcionalidades existentes (verificadas ejecutando el juego)

- Navegación completa: inicio, jugar (selección de mazo), galería filtrable,
  visor de mazos, ajustes persistentes, batalla.
- Motor determinista con semilla: robo, mano inicial de 5, mulligan único,
  una fuente por turno, pago de coste con color + genérico, agotamiento y
  restauración de fuentes, despliegue en fila propia, movimiento ortogonal
  con rutas libres, alcance, ataque a piezas y al Nexo, destrucción,
  descarte, cambio de turno, victoria/derrota, límite de acciones de la IA.
- IA heurística legible: juega fuente, despliega, mueve, ataca, remata Nexo,
  termina turno; solo acciones legales; determinista.
- 24 diseños de carta originales (12 por facción) validados con Zod, con
  rareza, palabras clave, VFX/SFX declarativos, texto narrativo, artista.
- Componente `Card` rico (marco por facción, coste, gemas de rareza, sellos,
  estados, glosario con tooltips) usado en galería/inspector/mazos.
- Inspector de carta modal muy completo.
- Tablero 3D funcional con casillas resaltadas, Nexos, cartas físicas.
- Audio sintetizado sin dependencias externas (placeholders legítimos).
- Preferencias: volúmenes, silencio, movimiento reducido, velocidad de IA.
- 47 pruebas unitarias + spec e2e; build y lint sin errores.

## 5. Funcionalidades incompletas o defectuosas detectadas

### 5.1 Cartas cuyo texto no se cumple (deuda de reglas — prioridad alta)

| Carta | Pasiva declarada | Estado real |
| --- | --- | --- |
| Gólem Azur | `first-damage-reduction` | **No implementada** en el motor |
| Archivo Viviente | `spell-generic-discount` | **No implementada** |
| Niebla Espejada | `draw-scry` | **No implementada** |
| Convergencia Astral | `reposition-friendly` | **No implementada** (la carta se lanza y no hace nada) |
| Temblor Rojo | daño diferido al final del turno | **No implementado** (solo el daño inicial) |
| Centinela de Cristal | `scry 2` (observar y ordenar) | El motor tiene `reorderTopCards` pero **no hay UI**; el efecto solo emite una animación |
| Kaela (comandante) | descuento tras daño al Nexo | **No implementada** |
| Oriel (comandante) | observar tras segundo hechizo | Solo emite un evento de animación, sin efecto real |

Forja Carmesí y Torre del Horizonte SÍ funcionan, pero mediante `cardId`
codificado en el motor en lugar del id de pasiva (deuda menor aceptable).
Altar de Combustión funciona implícitamente (toda pieza bloquea el paso).

### 5.2 Presentación de batalla muy por debajo del resto del juego

- El tablero es una plataforma octogonal plana sin identidad: no hay
  escenario, ni ruinas, ni runas, ni ambiente. Contrasta con la calidad del
  resto de pantallas.
- La mano de batalla usa botones planos propios en lugar del componente
  `Card` rico; sin abanico, sin elevación al pasar el cursor.
- La cola `AnimationEvent[]` del motor **no se consume**: solo se pinta un
  anillo genérico para el último evento. No hay animaciones de invocación,
  ataque, impacto, hechizo ni destrucción diferenciadas, ni sonidos ligados
  a los eventos de la IA.
- Las cartas sobre el tablero no muestran estado de agotamiento
  (movida/atacada), congelación apenas visible, sin daño visual.

### 5.3 Otros problemas

- **Git no estaba inicializado**: el directorio `.git` existía pero vacío
  (corregido: repositorio creado y línea base confirmada).
- El arte de la galería tarda en aparecer (lazy loading) y varios SVG son
  muy oscuros; aceptable como placeholder, documentado en art-direction.
- Terminología del recurso: se usa «maná» genérico; falta la identidad
  propia pedida por dirección creativa («Esencia» y variantes por facción).
- Rendimiento sin niveles de calidad gráfica (solo dpr [1, 1.5] fijo,
  sombras siempre activas, bucle de render continuo).
- El resaltado de fase muestra `fase main` en crudo (texto interno en inglés).

## 6. Riesgos

- Tocar el motor sin tests nuevos podría romper el determinismo (mitigación:
  cada efecto nuevo entra con prueba unitaria; la simulación completa ya
  existe como red de seguridad).
- Recargar la escena 3D con demasiado ambiente puede competir con las cartas
  (mitigación: presupuesto visual 60/25/15 y niveles de calidad).
- Cambios de texto de cartas pueden romper aserciones de tests/e2e
  (mitigación: ejecutar suite completa tras cada bloque).

## 7. Deuda técnica

- Pasivas de Forja/Torre resueltas por `cardId` codificado (aceptable ahora;
  migrar a resolutores por id de pasiva cuando crezca el set).
- `framer-motion` instalada pero casi sin uso (decidir: usarla para la mano
  y HUD, o retirarla más adelante; no se retira todavía).
- `EffectPulse` en Board3D es un placeholder de VFX.
- `relic` es un tipo de carta declarado sin cartas ni reglas (reservado).

## 8. Oportunidades de mejora (priorizadas)

1. **Escenario**: transformar el tablero en «El Santuario de las Runas
   Quebradas» (plataforma rúnica, monolitos rotos, braseros, abismo,
   partículas, reacciones a eventos de partida).
2. **Cola de animaciones real**: consumir `AnimationEvent[]` secuencialmente
   con impactos, sonidos y VFX por tipo, con velocidad ajustable y omisión.
3. **Mano en abanico** con el componente `Card` rico; cartas protagonistas.
4. **Honestidad de reglas**: implementar (o reescribir con honestidad) las
   8 pasivas rotas, con pruebas.
5. **Identidad del recurso**: renombrar a «Esencia» con variantes por facción
   (Carmesí para Furia, Celeste para Arcano) en UI, cartas y documentación.
6. **Niveles de calidad gráfica** (bajo/medio/alto) + accesibilidad.
7. Estados visibles sobre el tablero: agotada, congelada, dañada.

## 9. Plan de actuación priorizado

| Bloque | Contenido | Verificación |
| --- | --- | --- |
| B1 | Motor: implementar pasivas rotas + Esencia en textos | vitest + build |
| B2 | Escenario Santuario + calidad gráfica | captura Playwright |
| B3 | Mano en abanico + estados de carta en tablero | captura + e2e |
| B4 | Director de animaciones (cola secuencial + audio) | captura + partida manual |
| B5 | UI de scry/revelación + modo desarrollador oculto | vitest + manual |
| B6 | Accesibilidad, docs obligatorios, suite completa | test/build/lint/e2e |

## 10. Archivos que se van a modificar

- `src/game/engine.ts`, `types.ts`, `cards.ts`, `schemas.ts` (efectos nuevos)
- `src/game/ai.ts` (que la IA use los efectos nuevos sin ilegalidades)
- `src/battle/Board3D.tsx` + CSS (escenario Santuario, VFX, estados)
- `src/pages/BattlePage.tsx` + CSS (mano abanico, director animaciones, HUD)
- `src/store/preferences.ts`, `src/pages/SettingsPage.tsx` (calidad gráfica)
- `src/services/audio.ts` (cues por familia de evento)
- `src/utils/cardLabels.ts` (terminología Esencia)
- Tests correspondientes.

## 11. Archivos que conviene conservar tal cual

- `src/game/random.ts`, `mana.ts`, `deck-validation.ts` (correctos, probados).
- `src/components/Card.tsx` + módulos CSS (sistema visual excelente; se
  reutiliza, no se reescribe).
- `docs/*` existentes (se conservan; los documentos nuevos de raíz los
  referencian).
- `scripts/generate-card-art.js` y los 26 SVG de arte propio.

## 12. Decisiones que NO deben tomarse todavía

- No migrar Forja/Torre a resolutores genéricos de pasivas (esperar a que el
  set crezca).
- No retirar `framer-motion` ni añadir librerías nuevas de partículas.
- No introducir multijugador, backend, cuentas ni economía.
- No crear más escenarios: uno solo, terminado y espectacular.
- No rediseñar el sistema de recursos (20 fuentes/50 funciona y evita
  «partidas perdidas por no robar tierras» gracias al mulligan y a la
  densidad 40 %); solo se le da identidad propia (Esencia).

## 13. Estado de verificación al inicio de la fase

- `npm run test`: 47/47 en verde.
- `npm run build`: sin errores (bundle batalla ~925 kB por three.js, normal).
- `npm run lint`: sin avisos.
- Ejecución en dev: sin errores de consola en inicio, galería ni batalla.
- Revisión visual con Playwright: capturas de inicio, galería, inspector,
  batalla (mulligan, tablero, fuente jugada) registradas.
