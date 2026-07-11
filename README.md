# Crónicas del Nexo

Vertical slice para PC de un juego táctico de cartas de fantasía. Dos mazos de 50 cartas —Furia de la Caldera y Secretos del Arcano— se enfrentan en un tablero 3D de 5 × 5. La carta permanece como unidad física sobre la casilla; no se sustituye por una miniatura.

## Puesta en marcha

Requiere Node.js 20.19 o superior.

```bash
npm install
npm run dev
```

La aplicación se sirve por defecto en `http://localhost:4173`.

```bash
npm run test       # pruebas unitarias y de componentes
npm run build      # TypeScript estricto + bundle de producción
npm run lint       # análisis estático
npm run test:e2e   # flujo básico con Playwright
```

## Qué incluye

- Inicio, selección de mazo, galería filtrable, visor/editor de mazos y ajustes persistentes.
- 24 diseños originales validados con Zod, 12 por cada facción jugable.
- Dos comandantes y dos mazos iniciales válidos de exactamente 50 cartas (20 fuentes + 30 cartas de acción).
- Motor puro separado de React: semilla determinista, robo, maná coloreado, despliegue, movimiento, alcance, combate, destrucción, turnos y victoria por Nexo.
- Tablero React Three Fiber de 5 × 5 con cartas físicas, iluminación, sombras, objetivos y cola de eventos visuales.
- IA heurística local y determinista capaz de jugar recursos, desplegar, moverse, atacar y terminar turno.
- Arte provisional SVG propio en `public/assets/cards/art/` y sustitución automática por WebP cuando exista.
- Preferencias locales para volumen, silencio, movimiento reducido, velocidad de la IA y mazo elegido.

## Controles de batalla

- Al comenzar, conserva la mano o marca las cartas que quieras cambiar en el mulligan único.
- Pulsa una carta de maná en la mano para colocar una fuente (una por turno).
- Selecciona una unidad o estructura jugable y después una casilla resaltada de tu fila de despliegue.
- Selecciona una unidad aliada sobre el tablero para ver movimientos y objetivos válidos.
- Pulsa una casilla resaltada para mover; pulsa una carta enemiga o su Nexo para atacar.
- `Esc` cancela la selección. Clic derecho o la tecla de inspección abre el detalle de una carta.

## Estructura

```text
src/game/          datos, esquemas, motor, efectos e IA
src/components/    carta, inspector y componentes reutilizables
src/battle/        tablero 3D y presentación de partida
src/pages/         pantallas de aplicación
src/store/         Zustand y preferencias persistentes
public/assets/     arte y recursos sustituibles
docs/              diseño, arquitectura, esquema, arte y hoja de ruta
e2e/               prueba de recorrido principal
```

Consulta `docs/art-direction.md` antes de sustituir ilustraciones. El nombre del SVG y del WebP debe coincidir con el `id` de la carta; no es necesario modificar código.

## Estado de verificación

- 47 pruebas unitarias/de componentes, incluida una partida completa simulada.
- Flujo Playwright preparado en `e2e/game-flow.spec.ts` y descubierto correctamente por el runner.
- TypeScript estricto, ESLint y build de producción sin errores.
- Revisión visual realizada a 1920 × 1080 en inicio, galería, inspector, selección de mazo y tablero 3D.

## Alcance honesto del prototipo

La versión actual está pensada para escritorio y partidas locales contra IA. Las cuatro facciones futuras aparecen definidas y bloqueadas. No incluye multijugador, backend, cuentas, tienda ni contenido comercial. El audio usa señales sintetizadas libres de recursos externos; la música y el arte final forman parte del siguiente hito.
