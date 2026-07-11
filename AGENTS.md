# Guía de trabajo del repositorio

## Principios

- Mantén TypeScript estricto y evita `any`.
- El motor de reglas vive en `src/game` y no puede depender de React, Three.js ni del DOM.
- Los datos de cartas se validan mediante Zod al cargarse.
- Las animaciones consumen eventos ya resueltos: nunca deciden resultados del juego.
- Conserva la carta como representación de cada unidad y estructura sobre el tablero.
- No introduzcas arte, audio, marcas o textos de terceros sin licencia verificable.

## Contenido

- Los mazos iniciales deben seguir teniendo 50 cartas: 20 de maná y 30 no maná.
- Una carta normal admite como máximo cuatro copias; una única, una copia.
- Todo `card.id` necesita un SVG en `public/assets/cards/art/<card-id>.svg`.
- El WebP definitivo usa el mismo nombre y tiene prioridad automática sobre el SVG.
- Actualiza `docs/art-direction.md` y las pruebas cuando añadas cartas.

## Verificación mínima

Antes de entregar cambios ejecuta:

```bash
npm run test
npm run build
npm run lint
```

Si el cambio toca navegación o batalla, ejecuta también `npm run test:e2e` y revisa a 1920 × 1080 y 1366 × 768.
