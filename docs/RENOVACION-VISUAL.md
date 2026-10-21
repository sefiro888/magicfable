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
| 33 | Diferenciación de unidades y estructuras | A |
| 34 | Presencia de cartas únicas | P |
| 35 | Entradas por facción | A |
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

Segundo bloque validado (23:38): cálculo compartido implementado en
`eventTiming.ts`, consumido por director y evento visual memoizado de batalla;
embestida/retroceso reciben su duración real. 543 pruebas, build y lint verdes.
60 e2e en verde y 24 omitidas. Una ejecución se interrumpió porque se cerró el servidor
reutilizado durante su limpieza, no por un fallo de juego. Servidor propio
ahora en sesión `35243`, puerto 4173: reutilizarlo, no duplicarlo.
Sin verificaciones pendientes. El primer bloque está en el commit `65cb37a`.
Borrador de sellos ampliado con 16 vocabularios geométricos y sonda visual
`e2e/ritual-shots.spec.ts` (`RUN_RITUAL_SHOTS=1`), ambos todavía sin integrar
ni validar visualmente. No lanzar esa sonda hasta conectar el sello en EventEffects.

## Siguiente acción concreta

Tercer bloque en curso: `RitualSeal` ya integrado en `EventEffects`, sustituye
la columna genérica por un trazado por capas y motas. Tiene 16 perfiles de forma
según facción y prepara el shader al cargar para reducir el coste de la primera
invocación. La sonda de capturas alarga el evento a 12 s: capturar por software
con 5 s de evento fotografiaba a veces el fotograma posterior al efecto.
Primera pasada de 16 facciones sin errores de render; repetición de capturas
actual en sesión `91970`. Furia ya visible y revisada tras corregir la captura.
Pasada cerrada: 16 capturas y sonda en verde. Revisión conjunta en
`tools/captures/ritual-review.png` generada con `tools/visual-contact-sheet.mjs`.
Los sellos mantienen un estilo común con variación geométrica; la llegada de
las cartas todavía no se ha renovado, así que la tarea 35 sigue parcial.
Además, estructuras sobre zócalo octogonal biselado y orla metálica, anclado
al suelo al seleccionar. Capturas de piezas a ambas resoluciones revisadas.
Build/lint verdes. Tests 543 en verde. E2e normal cerrado: 60 en verde,
25 omitidas (incluye la nueva sonda opcional). Sin verificaciones pendientes.
Borrador siguiente, sin integrar:
`NexusFractures.tsx`, fisuras de los tres niveles del pedestal según daño.

Después integrar deterioro de Nexos y revisar llegadas de las cartas. No saltar a
escenarios todavía. Mantener vivas las 50 tareas; solo la sombra de contacto
está marcada como terminada, el resto de los cambios son avances parciales.
