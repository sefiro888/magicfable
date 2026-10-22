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
| 34 | Presencia de cartas únicas | A |
| 35 | Entradas por facción | A |
| 36 | Congelación sobre las piezas | A |
| 37 | Escudos y protecciones | A |
| 38 | Contagio, maldición y quemaduras | C |
| 39 | Desgaste de piezas dañadas | A |
| 40 | Solapamiento de nombres y estadísticas | A |
| 41 | Anticipación, impacto y recuperación | A |
| 42 | Familias visuales de ataque | A |
| 43 | Recorrido de hechizos | A |
| 44 | Impactos por facción y material | A |
| 45 | Destrucciones por facción | A |
| 46 | Deterioro de Nexos | A |
| 47 | Caída del Nexo | A |
| 48 | Interfaz de batalla | P |
| 49 | Inspección de cartas | A |
| 50 | Presentación de escenario y comandantes | P |

## Bloque activo

**22 oct, 02:16.** Quinto bloque guardado en `06894eb`; sexto en `8208e5b`.
Séptimo bloque validado: `AttackTrail` ya integrado (ocho estilos y ataque
de contacto), `ImpactDebris` con fragmentos instanciados según material,
metadatos `cardId`/`targetCardId`/facción en eventos resueltos y salida de los
ataques al Nexo (antes no tenían recorrido). No se modificaron reglas.
Temporizadores por montaje integrados en números, marcas y caídas; las caídas
ya respetan duración efectiva, movimiento reducido y cola al saltar eventos.
La copia caída mantiene arte iluminado; sombras/agua se disuelven en vez de
volcar como una estructura. Inspector de batalla conectado con id de copia,
estados reales, foco estable y bloqueo de atajos mientras está abierto.

Prueba real de caducidad de daño en verde (`e2e/combat-effects.spec.ts`).
Pruebas de metadatos, temporizadores y apoyo del tirador en verde.
Capturas de ocho familias: las primeras de `50977` no valían (tablero vacío).
Tras editar el store, Vite añade ?t=… al módulo; importar la ruta desnuda desde
una sonda creaba otro Zustand distinto. `e2e/helpers/matchStoreUrl.ts` encuentra
la URL real cargada en la página. Todas las sondas adaptadas. Ya hay cartas
visibles y se exige comprobarlas antes de fotografiar.
Primera revisión encontró el recorrido oculto por las cartas en columnas:
cresta elevada y curva lateral para despejar las siluetas. Además, el readback
de WebGL por software terminaba fotografiando el final del efecto. La sonda
de proyectiles ahora carga las imágenes con el reloj en marcha y congela el
reloj de Playwright a mitad del vuelo, antes de capturar. La detección de URL
del store usa la respuesta de red real (antes de goto), no Performance, porque
el reloj simulado no conserva esas entradas. Prueba corta de Furia revisada:
trayectoria visible, sin errores. Logger temporal retirado.
Matriz final `7986`: ocho familias y cuatro materiales en ambas resoluciones,
en verde y revisadas en `tools/captures/ataque-review.png` e `impacto-review.png`.
Estelas afinadas en filamentos y destello concentrado al comienzo. Tiradores
con pose `release`, sin embestir medio metro; prueba de apoyo en su casilla.
Revisión adicional Furia/Forja pasó en ambas resoluciones (`83220`). El metal
es discreto en la Ciudadela clara a 1366: revisar contraste en el pulido global,
especialmente tras renovar las luces de escenarios. No marcar 42 como V.
Inspección de batalla ya pasó en ambas
resoluciones con capturas, control de foco y dos copias con estados distintos.

Gate actual: **550 unitarias en verde, 5 omitidas; build y lint verdes**.
Séptimo bloque guardado en `ecc9507`: 70 e2e verdes, 29 omitidas.

Octavo bloque integrado y validado: caída del Nexo,
30 bloques compactos por fractura Voronoi, rig rígido compartiendo cuatro
materiales, caras cerradas con grano propio, fragmentos de cristal, impulso
breve y ruina persistente. Los primeros sectores radiales parecían una rueda;
se descartaron. Los triángulos largos parecían astillas; también se descartaron.
El retrato desaparece, la luz se apaga y la cámara encuadra al Nexo derrotado
antes de devolver exactamente la vista del jugador. Revancha restaura el Nexo.
Movimiento reducido muestra directamente la ruina sin giro ni acercamiento.
Se quitó el haz genérico del centro del tablero; no cambiaron reglas.
Corregidos también el temporizador de impacto que dependía del siguiente evento
y el tamaño inicial del retrato: Drei reiniciaba el portal sin su escala y la
recuperaba solo al mover la cámara. La sonda exige posición y tamaño restaurados.
Sonda de ambos Nexos a ambas resoluciones: 2 pruebas verdes (`78600`).
Victoria real, revancha y movimiento reducido: 3 pruebas verdes (`44427`).
Capturas `nexo-ruptura-*`/`nexo-ruina-*` revisadas. Último ajuste posterior:
menos microfacetas y piedra con polvo más neutro. Unitarias: 550 verdes/5 skip.
Build `61508` y lint `15903` verdes. E2e `55895`: 71 verdes, 31 omitidas,
dos tiempos de espera (inspección y navegación) mientras competían compilación,
análisis y WebGL. Ambos pasaron aislados sin cambios (`39042`, dos verdes).
Las 73 pruebas activas quedaron verificadas. En futuras pasadas, no ejecutar
build junto al navegador: la compilación ocupó 1,8 GB y retrasó el render.
Sin procesos pendientes. Después checkpoint y #38 (maldición/quemadura),
#48/50, escenarios al final. `burnAppearance.ts` y su test son preparación
sin integrar para el bloque siguiente, no parte de la caída del Nexo.

Los cinco sigilos nuevos ya están generados con `imagegen` y copiados a
`tools/art-inbox/ui-sigils` (ignorado): Forja v2, Marea v1, Bestiario v1,
Plaga v1 y Sol v1. Originales RGBA 1254², transparencia real. No hay llamadas
de generación pendientes; no duplicarlas. Optimización a 300² WebP terminada,
lámina `tools/captures/sigilos-reliquia-review.png` revisada a 190 y 38 px.
Aún sin integrar en public. Mantener los once
sigilos existentes; estos completan los cinco huecos. Documentar procedencia
al integrar, conservar originales privados y respaldo SVG.

Resumen del sexto bloque validado:
inspector con ilustración original, alternancia de carta completa,
respaldo hasta SVG y acento para las 16 facciones. Revisado en 1920×1080,
1366×768 y 375×812 con arte vertical de Forja. Dos pruebas nuevas de componente
(545 unitarias en verde en total) y tres e2e del visor en verde.

También integradas entradas físicas según cuatro familias de movimiento,
respetando la cola: las piezas pendientes no se adelantan al sello. Al saltar
animaciones vuelven a su pose normal; movimiento reducido muestra estado
inmediato. Dos e2e específicos en verde. Cartas únicas con crestería biselada
y gemas de facción; mantener distinción de dueño y centro del arte limpio.
Build/lint en verde. Diez capturas de entradas y capturas de los marcos únicos
revisadas en ambas resoluciones. E2e completo: **67 en verde, 27 omitidas**.
Una pasada con `RUN_SHOTS=1` se abortó: esa variable activa también
sondas históricas de coste elevado; usarla solo en el spec visual concreto.
Servidor propio continúa en sesión `35243` (4173). No iniciar otra copia.

Después del séptimo: caída del Nexo (#47) e interfaz (#48/50), antes de escenarios.

## Historial de bloques (las notas de borrador siguientes son históricas)

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

Cuarto bloque en curso: `NexusFractures` integrado. Fisuras en tres superficies
del pedestal, pérdida de energía/desalineación de cristales según integridad,
marco crítico que respeta selección e impacto. Vida máxima del comandante real.
Material de piedra con relieve 0,035 y metalness 0,04 (antes bump 3 y metal alto).
Dos e2e nuevos comprueban crítico → herido al lanzar una curación real en ambas
resoluciones. Capturas `nexo-critico-*` y `nexo-curado-*` revisadas.
Tests 543, build y lint verdes. E2e completo cerrado: 62 en verde y 25 omitidas.
Sin verificaciones pendientes. Tercer bloque guardado en `cb53e19`.

Quinto bloque cerrado: `MaterialEnvironment.tsx` integrado, reflexión de tres
paneles propios sin HDR externo, capturada una vez. Filetes metálicos a 0,6;
piedra y papel sin cambio. Capturas de Ciudadela, Caldera y Fiordo revisadas
a ambas resoluciones (6 pruebas opcionales en verde). El entorno no sustituye
las luces de escenario ni refleja las piezas sobre el suelo: esa tarea sigue
pendiente. Tests 543, build y lint verdes; 62 e2e en verde y 25 omitidas.
Sin verificaciones pendientes. Siguiente: inspección con ilustración original
sin recorte, manteniendo accesibles reglas, estados y vista de carta completa.
