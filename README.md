# Crónicas del Nexo

**▶ Juega ahora en el navegador: https://sefiro888.github.io/magicfable/**

Vertical slice para PC de un juego táctico de cartas de fantasía oscura.
Dos mazos de 50 cartas —**Furia de la Caldera** y **Secretos del Arcano**—
se enfrentan en **El Santuario de las Runas Quebradas**: una arena rúnica
de 5 × 5 suspendida sobre el abismo. La carta permanece como pieza física
sobre la casilla; nunca se sustituye por una miniatura.

## Puesta en marcha

Requiere Node.js 20.19 o superior.

```bash
npm install
npm run dev        # http://localhost:4173
```

```bash
npm run test       # pruebas unitarias y de componentes (59)
npm run build      # TypeScript estricto + bundle de producción
npm run lint       # análisis estático (0 avisos permitidos)
npm run test:e2e   # flujo completo con Playwright (requiere: npx playwright install chromium)
```

## Qué incluye

- Partida completa contra IA: mulligan, Esencia, despliegue, movimiento,
  combate, victoria por Nexo y resumen final.
- **El Santuario de las Runas Quebradas**: plataforma rúnica procedural,
  anillo de runas reactivo, monolitos quebrados, braseros, ruinas
  flotantes, estrellas y partículas — todo generado por código, sin assets
  externos.
- **Director de animaciones**: la cola de eventos del motor se reproduce en
  secuencia (invocación, proyectiles, impactos, hielo, destrucción, ondas
  de Nexo, victoria) con sonido por evento, velocidad ajustable y omisión.
- **IA paso a paso**: cada acción rival se ve y se oye por separado;
  determinista, legal y acotada.
- Mano en abanico con el marco de carta completo (coste, arte, reglas,
  rareza, estados); elevación al cursor y ampliación legible.
- **Esencia** como recurso con identidad: Carmesí (Furia) y Celeste
  (Arcano), con reserva visual, gasto previsto y agotamiento.
- Efectos honestos: toda carta cumple su texto (Gólem, Archivo, Niebla,
  Convergencia, Temblor, pasivas de Kaela y Oriel, escrutinio con modal).
- 24 diseños originales validados con Zod, dos comandantes, dos mazos
  legales de 50.
- Calidad gráfica baja/media/alta, movimiento reducido, velocidad de
  animaciones y volúmenes separados.
- 59 pruebas unitarias + e2e Playwright; TypeScript estricto, ESLint y
  build limpios.

## Controles de batalla

- Al comenzar, conserva la mano o marca cartas para el mulligan único.
- Pulsa una carta de Esencia de la mano para colocar una fuente (una por turno).
- Selecciona una unidad/estructura jugable y una casilla iluminada de tu fila.
- Selecciona una unidad aliada para ver movimientos y objetivos válidos.
- Pulsa una casilla para mover; una carta enemiga o su Nexo para atacar.
- `Esc` cancela · clic derecho o `I` inspecciona · «Saltar animaciones»
  aparece cuando la cola es larga.
- Modo desarrollador (solo build de desarrollo): `Ctrl+Mayús+D`.

## Estructura

```text
src/game/          datos, esquemas, motor puro, efectos e IA (sin React/DOM)
src/components/    carta, inspector y componentes reutilizables
src/battle/        Board3D, Sanctuary (escenario), EventEffects (VFX), texturas
src/pages/         pantallas; BattlePage aloja el director de animaciones
src/store/         partida (cola de presentación) y preferencias persistentes
public/assets/     arte SVG propio; el WebP homónimo tiene prioridad
docs/              documentación original del slice
*.md (raíz)        auditoría, reglas, arquitectura, animación, escenario…
```

Documentos de referencia: `PROJECT_AUDIT.md`, `GAME_RULES.md`,
`GAME_DESIGN_ANALYSIS.md`, `ARCHITECTURE.md`, `ANIMATION_SYSTEM.md`,
`ART_DIRECTION.md`, `CARD_DATA_GUIDE.md`, `SCENARIO_GUIDE.md`,
`DEVELOPMENT_ROADMAP.md`.

## Alcance honesto del prototipo

Pensado para escritorio y partidas locales contra IA. Las cuatro facciones
futuras están definidas y bloqueadas. Sin multijugador, backend, cuentas ni
tienda. El audio es síntesis local como marcador de posición legal; el arte
de cartas es placeholder propio en SVG con sustitución automática por WebP.
