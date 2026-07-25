# Crónicas del Nexo

**▶ Juega ahora en el navegador: https://sefiro888.github.io/magicfable/**

Juego táctico de cartas de fantasía épica para PC (también instalable como
PWA). **Seis facciones** —Furia, Arcano, Naturaleza, Orden, Sombra y
Vacío—, cada una con su comandante y su mazo de 50 cartas, se enfrentan
sobre un tablero de **8 × 8** en **Aether Citadel**, una ciudadela flotante
al amanecer (o en el escenario alternativo **El Santuario de las Runas
Quebradas**). La carta permanece como pieza física sobre la casilla; nunca
se sustituye por una miniatura.

Se puede jugar en solitario contra la IA o en **multijugador PvP en tiempo
real** contra un amigo, creando una sala y compartiendo un código de
cinco letras.

## Puesta en marcha

Requiere Node.js 20.19 o superior.

```bash
npm install
npm run dev        # http://localhost:4173
```

```bash
npm run test       # pruebas unitarias y de componentes (198)
npm run build      # TypeScript estricto + bundle de producción
npm run lint       # análisis estático (0 avisos permitidos)
npm run test:e2e   # flujo completo con Playwright (requiere: npx playwright install chromium)
```

## Qué incluye

- **90 cartas originales + 6 comandantes**, repartidos en seis facciones
  (Kaela/Furia, Oriel/Arcano, Verdania/Naturaleza, Asterin/Orden,
  Malachar/Sombra, Nyxaris/Vacío), validados con Zod y con mazos legales
  de 50 cartas cada uno.
- Partida completa contra IA: mulligan, Esencia, despliegue, movimiento,
  combate, victoria por Nexo y resumen final. IA determinista, legal y
  acotada, con cada acción reproducida por separado.
- **Multijugador PvP en tiempo real** (Supabase Realtime): crea una sala,
  comparte el código con un amigo, elige mazo/facción cada uno y jugad
  la partida sincronizada — con detección de desconexión, aviso de
  jugadas rechazadas y revancha.
- **Selector de mazo y galería**: elige tu facción antes de jugar
  (también en la sala multijugador) y explora las 90 cartas ilustradas
  en la Galería.
- **Historial y estadísticas**: partidas contra IA y PvP se registran
  por separado, con racha de victorias, daño medio y desglose por mazo;
  logros que se desbloquean al cumplir hitos y un reto diario distinto
  cada día.
- **Instalable y jugable sin conexión** (PWA): manifest + service worker
  precachean el shell de la app.
- **Aether Citadel** (escenario predeterminado): ciudadela flotante
  generada con Blender desde un script reproducible
  (`tools/blender/generate_aether_citadel.py`) y exportada a GLB (1,8 MB):
  plaza de batalla con anillo rúnico dorado, portal arcano animado,
  cristales monumentales, torres, puentes y mar de nubes al amanecer.
- **El Santuario de las Runas Quebradas** (escenario alternativo):
  plataforma rúnica 100 % procedural con anillo reactivo, braseros y
  cielo cósmico — seleccionable en Ajustes.
- **Director de animaciones**: la cola de eventos del motor se reproduce en
  secuencia (invocación, proyectiles, impactos, hielo, destrucción, ondas
  de Nexo, victoria) con sonido por evento, velocidad ajustable y omisión.
- Mano en abanico con el marco de carta completo (coste, arte, reglas,
  rareza, estados); elevación al cursor y ampliación legible.
- **Esencia** como recurso con identidad propia por facción, con reserva
  visual, gasto previsto y agotamiento (sin penalización por robar con
  el mazo vacío).
- **Efectos honestos**: las 90 cartas están auditadas contra su propio
  texto de reglas — cada efecto se comprueba con un test dedicado
  (`docs/CARD_AUDIT.md`), con los bugs encontrados corregidos.
- Calidad gráfica baja/media/alta, movimiento reducido, velocidad de
  animaciones y volúmenes separados.
- 198 pruebas unitarias + e2e Playwright; TypeScript estricto, ESLint y
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
src/multiplayer/   sincronización de partida en tiempo real (Supabase Realtime)
src/components/    carta, inspector y componentes reutilizables
src/battle/        Board3D, Sanctuary (escenario), EventEffects (VFX), texturas
src/pages/         pantallas: inicio, jugar, multijugador, galería, mazos, ajustes, batalla
src/store/         partida, preferencias, historial, logros y reto diario (persistentes)
public/assets/     arte SVG propio; el WebP homónimo tiene prioridad
docs/              documentación original del slice + auditoría de cartas
*.md (raíz)        auditoría, reglas, arquitectura, animación, escenario…
```

Documentos de referencia: `PROJECT_AUDIT.md`, `GAME_RULES.md`,
`GAME_DESIGN_ANALYSIS.md`, `ARCHITECTURE.md`, `ANIMATION_SYSTEM.md`,
`ART_DIRECTION.md`, `CARD_DATA_GUIDE.md`, `SCENARIO_GUIDE.md`,
`DEVELOPMENT_ROADMAP.md`, `docs/CARD_AUDIT.md`.

## Alcance honesto del prototipo

Pensado para PC (escritorio o navegador con Node 20.19+). El multijugador
usa salas efímeras por código (Supabase Realtime): no hay cuentas,
emparejamiento, clasificación ni backend propio más allá de esas salas.
El audio es síntesis local como marcador de posición legal; el arte de
cartas es placeholder propio en SVG con sustitución automática por WebP.
