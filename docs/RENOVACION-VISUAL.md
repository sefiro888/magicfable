# Renovación visual — registro de continuidad

Autorizada el 21 de octubre de 2026. Fecha límite: **22 de octubre de 2026,
20:00 Europe/Madrid**. Automatización: `renovaci-n-visual-de-cr-nicas-del-nexo`,
cada cinco minutos. No publicar ni hacer push automáticamente.

## Dirección y orden

Fantasía madura, materiales antiguos convincentes, iluminación con volumen,
efectos con intención y cartas legibles. Conservar ilustraciones y carta como
representación de las piezas. Sin recursos externos sin licencia verificable.
Primero elementos compartidos, después escenarios. No confundir añadir un
efecto con completar el acabado: verificar imágenes reales y movimiento.

Orden: dirección artística → cartas/tablero → combate → interfaz → integración
→ escenarios → revisión global. Los números siguientes conservan las 50 tareas
acordadas; no representan orden de ejecución.

## Lista individual

Estados: **P** pendiente, **C** en curso, **A** avance validado (falta revisión
global), **V** terminada y verificada.

| Nº | Mejora | Estado |
| --- | --- | --- |
| 1 | Caldera: renovación integral | P |
| 2 | Ciudadela: renovación integral | P |
| 3 | Santuario: renovación integral | P |
| 4 | Duna: renovación integral | P |
| 5 | Fiordo: renovación integral | P |
| 6 | Claro: renovación integral | P |
| 7 | Rompiente: pulido integral | P |
| 8 | Gremio: pulido integral | P |
| 9 | Jade: pulido integral | P |
| 10 | Escalinata: pulido integral | P |
| 11 | Escenario propio de Quinto Sol | P |
| 12 | Escenario propio de Bestiario | P |
| 13 | Elemento protagonista por escenario | P |
| 14 | Composición y decorado desde cámara real | P |
| 15 | Transición entre tablero y entorno | P |
| 16 | Materiales de piedra | P |
| 17 | Materiales metálicos | P |
| 18 | Materiales de hielo | P |
| 19 | Agua | P |
| 20 | Lava | P |
| 21 | Arena, tierra y nieve | P |
| 22 | Iluminación propia por escenario | P |
| 23 | Sombras del escenario | P |
| 24 | Sombras de contacto de cartas | V |
| 25 | Reflejos apropiados al material | P |
| 26 | Niebla y separación de planos | P |
| 27 | Humo y vapor por capas | P |
| 28 | Partículas ambientales | P |
| 29 | Movimiento del entorno | P |
| 30 | Evolución ambiental durante la partida | P |
| 31 | Marcos de las cartas desplegadas | A |
| 32 | Integración de iluminación de las piezas | A |
| 33 | Diferenciación de unidades y estructuras | P |
| 34 | Presencia de cartas únicas | P |
| 35 | Entradas por facción | P |
| 36 | Congelación sobre las piezas | A |
| 37 | Escudos y protecciones | A |
| 38 | Contagio, maldición y quemaduras | C |
| 39 | Desgaste de piezas dañadas | A |
| 40 | Solapamiento de nombres y estadísticas | A |
| 41 | Anticipación, impacto y recuperación | A |
| 42 | Familias visuales de ataque | P |
| 43 | Recorrido de hechizos | P |
| 44 | Impactos por facción y material | P |
| 45 | Destrucciones por facción | P |
| 46 | Deterioro de Nexos | P |
| 47 | Caída del Nexo | P |
| 48 | Interfaz de batalla | P |
| 49 | Inspección de cartas | P |
| 50 | Presentación de escenario y comandantes | P |

## Bloque activo

Primer bloque implementado:

- Sombra fuera de la jerarquía móvil: permanece en la losa y se suaviza con la altura.
- Marcos biselados con remaches fusionados, dos caras, rugosidad y metalness 0,04.
- Desgaste, fractura, escarcha y contagio mediante shader localizado en los bordes.
- Escudo Fresnel segmentado que deja visible el centro de la ilustración.
- Filas densas conservan cifras y recuperan nombres al señalar o seleccionar.
- Ataque con carga, aceleración y recuperación. Corrección del signo del
  retroceso: antes desplazaba la defensora hacia el atacante.

Capturas revisadas: `e2e/__shots__/renovacion-{piezas,detalle,seleccion}-`
`{1920x1080,1366x768}.png`. Se ven bien escarcha y contagio; faltan pruebas
artísticas en escenarios oscuros y batalla muy poblada antes de cerrar las tareas.

Siguiente bloque: invocación por facción y desgaste del Nexo. Existe un borrador
**sin integrar** en `src/battle/RitualSeal.tsx`: trazado de sello de invocación,
todavía no representa 16 identidades distintas. No darlo por implementado.

## Verificación y recuperación

La mejora anterior de IA está guardada en el commit local `2134dc9`.
Su gate pasó (537 pruebas, build, lint) y 58 e2e. No se ha hecho push.
Para cada bloque visual: test/build/lint, e2e de batalla y capturas reales a
1920×1080 y 1366×768. Capturas en `e2e/__shots__/` y `tools/captures/`, ignoradas.
Primer bloque (21 oct 23:29): 540 pruebas, build y lint en verde; prueba visual
de estados y selección a ambas resoluciones en verde. Batería e2e completa:
60 pruebas en verde y 24 omitidas. Sin procesos de verificación pendientes.

Hallazgo para el siguiente bloque: `useEventDirector` acorta los eventos según
`animationSpeed`, pero el render recibe la duración original. Los efectos
se cortan a media trayectoria al acelerar. Unificar el cálculo de duración
entre director y render antes de elaborar las invocaciones.
