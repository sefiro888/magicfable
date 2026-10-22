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
| 2 | Ciudadela: renovación integral | A |
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
| 13 | Elemento protagonista por escenario | C |
| 14 | Composición y decorado desde cámara real | C |
| 15 | Transición entre tablero y entorno | C |
| 16 | Materiales de piedra | C |
| 17 | Materiales metálicos | P |
| 18 | Materiales de hielo | P |
| 19 | Agua | P |
| 20 | Lava | P |
| 21 | Arena, tierra y nieve | P |
| 22 | Iluminación propia por escenario | C |
| 23 | Sombras del escenario | C |
| 24 | Sombras de contacto de cartas | V |
| 25 | Reflejos apropiados al material | P |
| 26 | Niebla y separación de planos | C |
| 27 | Humo y vapor por capas | P |
| 28 | Partículas ambientales | C |
| 29 | Movimiento del entorno | C |
| 30 | Evolución ambiental durante la partida | C |
| 31 | Marcos de las cartas desplegadas | A |
| 32 | Integración de iluminación de las piezas | A |
| 33 | Diferenciación de unidades y estructuras | A |
| 34 | Presencia de cartas únicas | A |
| 35 | Entradas por facción | A |
| 36 | Congelación sobre las piezas | A |
| 37 | Escudos y protecciones | A |
| 38 | Contagio, maldición y quemaduras | A |
| 39 | Desgaste de piezas dañadas | A |
| 40 | Solapamiento de nombres y estadísticas | A |
| 41 | Anticipación, impacto y recuperación | A |
| 42 | Familias visuales de ataque | A |
| 43 | Recorrido de hechizos | A |
| 44 | Impactos por facción y material | A |
| 45 | Destrucciones por facción | A |
| 46 | Deterioro de Nexos | A |
| 47 | Caída del Nexo | A |
| 48 | Interfaz de batalla | A |
| 49 | Inspección de cartas | A |
| 50 | Presentación de escenario y comandantes | A |

## Bloque activo

**22 oct, 07:31.** Integración panorámica verificada. `41994`: 77 verdes/37
omitidas y una observación transitoria fallida; caso corregido verificado en
`71625` junto con interfaz y dos navegadores: **tres verdes**. Quedaron
verificadas las 78 pruebas activas con la versión actual; no presentar esta
combinación como una única pasada completa limpia. Build `52249`, unitarias
`11729` 555/5, revisión visual `81964` y lint final `79176`, verdes.
Sin verificaciones ni generaciones en ejecución; servidor 4173 conservado.
Guardar checkpoint de vista/prompt/observador; excluir los tres borradores
de Caldera. Después integrar LavaSurface en Caldera y comprobar GLSL real,
continuar con yunque/roca/humo y su panorámica preparada.
Los estados C de 13–16/22–23/26/28–30 representan trabajo aplicado a Ciudadela,
no que el resto de escenarios tenga ya esos acabados.

**22 oct, 07:29.** `41994` terminó: **77 verdes, 37 omitidas y el fallo de
observación transitoria descrito debajo**. Sin otros fallos, incluidos caída,
revancha, navegación y modo foto. Validación del observador nuevo en curso,
junto con las dos pruebas de interfaz y dos navegadores, para repetir una
carga comparable a la suite completa. Ningún cambio en fuentes de aplicación
desde la última matriz visual; no ampliar tiempos ni vida del efecto.

**22 oct, 07:24.** `41994` continúa. Un fallo en combat-effects no era un
número inmortal: la traza muestra ataque resuelto (víctima retirada/Nexo
dañado) y órdenes de teclado de 3 s, más largas que la vida de 1,2 s del
número. La prueba buscaba su aparición después de que hubiera desaparecido.
Se instala ahora un MutationObserver antes de atacar que registra aparición;
se conserva la exigencia de cero números al caducar, sin aumentar tiempos ni
tocar duración/producción. Cambiado solo el test ya terminado; el resto de la
suite sigue con fuentes de aplicación estables. Al terminar ejecutar ese
caso aislado y registrar el resultado; no afirmar que `41994` quedó toda verde.
La panorámica de Caldera tiene su prompt exacto conservado junto al maestro,
en `tools/art-inbox/scenery/caldera-vista-v1.prompt.txt`, ambos ignorados.

**22 oct, 07:18.** Integración panorámica: matriz final `81964`, **cuatro
verdes**, revisadas calidad alta/baja, ambas resoluciones y dos poses amplias
de modo foto. El plano se ha sustituido por cúpula; el desvanecido termina
dentro del mapa para que el clamp no estire torres hacia el cénit. Métrica
alta final: 365 llamadas, 301666 triángulos y 44 texturas (una llamada adicional
frente a la Ciudadela sin panorámica). Fuente y prompt en `arte-escenarios.md`.
Unitarias `11729` **555/5**, build `52249` y lint `48123`, verdes. Nueva pasada
e2e completa `41994` en ejecución; no editar fuentes importadas hasta terminar.
Después guardar el bloque de panorámica excluyendo borradores de Caldera.
Preparado también `architecture/greatAnvilGeometry.ts` (sin importar): cuerpo
curvo biselado, mesa con hueco real y cuerno horizontal de sección decreciente.
Los tres borradores compilan pero necesitan revisión real al integrarse.
También generada y revisada una panorámica original para Caldera con imagegen:
basalto estratificado, rift profundo, arco natural, lava distante y humo frío.
Maestro privado copiado en `tools/art-inbox/scenery/caldera-vista-v1.png`;
original conservado en `C:/Users/sefir/.codex/generated_images/01a15f74-4873-70a2-aef0-32c6e37aa3d4/exec-0910ca0f-0aae-4035-8f9a-cfd4a3395119.png`.
Sin referencias externas, marcas ni estilos de artistas. Todavía sin convertir
ni integrar: conservarla para el próximo bloque y documentar su prompt en arte-escenarios.

**22 oct, 07:08.** Arquitectura de Ciudadela guardada en `50a6212`.
Panorámica original copiada al workspace (maestro privado) y optimizada en
dos WebP versionados: 272868/87132 bytes. Prompt completo y procedencia en
`docs/arte-escenarios.md`. La primera integración en un plano se rechazó:
la prueba de órbita reveló un cartel inclinado, aunque la vista normal era
correcta. `DistantVista` pasa a cinturón esférico con orientación mundial y
desvanecido al cielo en latitudes extremas; la repetición reflejada evita
juntas de píxel. La cúpula sigue traslación, nunca giro de cámara.

La primera sonda ampliada `22808` agotó 120 s en la cuarta captura. Traza:
el arrastre de órbita consumió 41 s por rasterizado de software. No había
una comprobación fallida del juego. Las sondas artísticas ahora fijan poses
repetibles por la cámara y OrbitControls públicos (`poseCamera`), exigen su
posición real y mantienen intacta la prueba funcional de modo foto.
Sonda posterior `60833` pasó y reveló visualmente el defecto del plano.
Sonda actual `3671` revisa la versión esférica; no editar fuentes importadas
hasta terminar. Build/lint/unitarias `72310`/`74288`/`41022` estaban verdes
antes del cambio a cúpula. Repetir build/lint tras la revisión final; no dar
por cerrado aún el gate de esta integración. LavaSurface/AtmosphericPlumes
siguen sin importar; solo quedaron compilados, no revisados en WebGL.

**22 oct, 06:55.** Gate de Ciudadela cerrado: `90321`, **78 e2e verdes y
37 omitidas**. Unitarias 555/5, build `26575`, lint `32033` verdes. Capturas
finales revisadas, tanto con mano visible como recogida. Guardar checkpoint
de arquitectura/materiales; excluir LavaSurface y AtmosphericPlumes (borradores
sin integrar). #2 pasa a A, pendiente de pulido global junto al resto.

Para reforzar escala se acaba de generar con `imagegen` una panorámica
original de ciudad suspendida/nubes, sin referencias externas, no integrada.
Resultado: `C:/Users/sefir/.codex/generated_images/01a15f74-4873-70a2-aef0-32c6e37aa3d4/exec-c808739c-7def-436c-8a16-909f447cd523.png`.
Se ha revisado: composición compatible con cámara en picado, arquitectura
distante en tercio superior y mar de nubes abierto. Conservar el original y
copiar al workspace antes de usar. Si se integra, hacerlo como vista distante
con geometría/oclusión reales delante y probar también zoom y modo foto;
evitar una imagen pegada a la cámara que gire con el tablero. Documentar
procedencia y prompt en `docs/arte-escenarios.md`. Todavía NO es parte del gate.

**22 oct, 06:42.** Matriz final `27747`: **cuatro verdes**, capturas revisadas
a ambas resoluciones/calidades y con mano recogida. Ciudad a cota inferior
visible a través del arco; frisos azul/púrpura y nubes con más separación de
valores. Mármol sin el antiguo damero acolchado. Medida alta final: 364 llamadas,
289570 triángulos, 127 geometrías y 41 texturas. La calidad baja conserva
arquitectura y legibilidad, sin sombras dinámicas. El recorte superior del
remate se comprueba además por proyección real en la sonda.
Unitarias `20215`: **555 verdes/5 omitidas**. Build `26575` y lint `32033`
verdes tras el ajuste final. E2e completo `90321` recién lanzado, 115 pruebas (78
activas/37 omitidas). No tocar fuentes importadas hasta terminar. Preparar
solo archivos nuevos sin integrar para Caldera si se trabaja durante la suite.
Preparado `materials/LavaSurface.tsx`, todavía **sin importar ni validar**:
campo térmico advectado, balsas oscuras y canales calientes; ruido propio
horneado y tres/cuatro consultas por píxel, sin fBm iterativo por fragmento.
No incluir en el checkpoint de Ciudadela. Compilar/revisar GLSL en navegador
solo cuando se integre en Caldera; la compilación TS no comprueba un shader.
También `materials/AtmosphericPlumes.tsx`, sin integrar: capas de sprites con
profundidad, ascenso/ensanchamiento/extinción y pose estática al reducir
movimiento. No compilar junto al navegador para comprobar estos borradores.
Los dos se excluyen del checkpoint de Ciudadela.

Dirección inmediata de Caldera: mantener identidad volcánica frente al Patio
industrial. Cambiar el radio 4,83 (menor que la media diagonal del tablero),
el disco artificial con vigas radiales y los cilindros repetidos por roca
estratificada y columnas basálticas en flancos/cotas inferiores. El yunque
necesita silueta continua biselada y cuerno horizontal, no cajas y un cono
vertical; conservar su función de hito y situarlo desde la cámara medida.
Iluminar la roca con clave legible/relleno frío; las luces de lava no deben
bañar todo en naranja ni borrar el volumen (hay puntos antiguos de 46/26).
Integrar/probar primero LavaSurface, luego humo y arquitectura, con capturas
a ambas resoluciones antes de dar por renovada la escena. Ningún cambio de reglas.
Después del gate: checkpoint de Ciudadela y renovación de Caldera; tareas
2/16/22/23/29/30 conservan su condición parcial hasta cerrar el bloque.
En el pulido global de #30, sustituir el contador de eventos vistos desde
montaje por `match.turn` como dato de presentación: una partida restaurada o
una revancha deben recuperar el ciclo ambiental correcto sin depender de
cuántos eventos se hayan mostrado. El ciclo actual solo avanza durante esta
sesión; no marcar #30 como terminado todavía.

**22 oct, 06:34.** Undécimo bloque guardado en `2cf1135`.
Duodécimo en curso: Ciudadela reconstruida con basílica en terraza inferior,
arco de dovelas, columnas acanaladas, entablamento dentado, balcones y estandartes
de lino plegado con bordado original. Sillares instanciados por tamaño y
geometrías cacheadas. Plaza de radio 5,68: sus esquinas ya sostienen el tablero;
roca estratificada bajo ella, puentes y escalones reales. Islas con pequeños
pórticos dentro del encuadre. Clave frontal cálida, relleno frío y sombras
con frustum explícito; el sol varía suavemente tras turnos ya resueltos.
No cambiaron reglas. El primer arco blanco y alto fuera de cuadro se retiró.

Primera sonda `37773`: una verde, captura revisada. 332 llamadas, 185838
triángulos a calidad alta. Detectó el acabado acolchado del tablero, mármol
con vetas demasiado gruesas y un cielo antiguo con manchas planas. Corregidos:
`materials/stoneMaterial.ts` ahora compartido por arquitectura y losas;
microrelieve separado y vetas estrechas; bisel geométrico en las losas de
Ciudadela y sombra pintada muy contenida. El Nexo de piedra usa caliza neutra
y una luz local menor solo en este escenario, sin el baño de oro anterior.
El resto de escenarios conserva su iluminación de Nexo por ahora.
Nuevo cielo propio horneado con campo de nubes coherente, sin ruido por frame.
Build `99173` y lint `84295` verdes. Sonda `32774` ejecutándose: alta/baja a
1920×1080 y 1366×768, con mano visible/oculta. No editar fuentes importadas
hasta terminar. Revisar imágenes y luego gate completo; aún no guardar este
bloque como validado. El escenario es C, no terminado.

`e2e/scenery-renewal.spec.ts` es opcional (`RUN_SCENERY_SHOTS=1`) y añade
cuatro omitidas al gate normal (37 en total). Verifica los remates contra
las matrices reales, guarda métricas y captura en las dos configuraciones.

**22 oct, 06:21.** Presentación validada: e2e completo `51288`, **78 verdes y
33 omitidas**, sin fallos. Unitarias 555/5; build/lint verdes (`26712`/`60029`).
Recaptura `49991`: **tres verdes**, imágenes revisadas a 1920×1080, 1366×768
y 375×812; rostros completos y confirmación accesible en las tres. Sin fuentes
modificadas durante ella. Build adicional `43594` verde, también con los
borradores de arquitectura presentes. Lint detectó solo una inicialización
sobrante en esos borradores, retirada; repetición `79939` verde.
Undécimo bloque listo para checkpoint, excluyendo architecture.
Sin verificaciones ni generaciones de imágenes en ejecución. Servidor propio
4173 conservado; automatización conservada porque faltan los escenarios y el
pulido global, y aún no se ha alcanzado la fecha límite.
Siguiente bloque: integrar la basílica de Ciudadela, renovar plaza/materiales,
luz, nubes y banderas, y comprobar ambos tamaños desde la cámara real. No basta
con sustituir el portal: el suelo y la transición al vacío también necesitan
acabado. En el dosier de Olimpo se exige mármol vivido, bronce, lino plisado y
acentos azul egeo/púrpura; evitar convertir todo el lugar en blanco y oro.
Las tareas 1–23 siguen pendientes hasta integrar y revisar sus escenas.

**22 oct, 06:16.** Retomado tras avisos acumulados. La suite `1663` terminó
con 76 verdes, 33 omitidas y dos fallos. No era un fallo del arrastre: su traza
mostró 74 s intentando pulsar «Saltar guía», que alternaba entre posición
flotante y anclada. El getter del objetivo era una función nueva en cada
render: reiniciaba el efecto y borraba su medida. Getter estabilizado y medidas
idénticas conservadas, sin subir tiempos ni forzar clics. La prueba exige ahora
pulsar la guía en 8 s. El otro fallo era el selector genérico `header`: la nueva
presentación tiene su propia cabecera; la prueba del rival apunta a la primera,
la de batalla. Ambas regresiones pasan juntas (`5640`, dos verdes).
Nuevo gate: unitarias `24403` **555/5**, build `26712` y lint `60029`, verdes.
E2e completo `51288` en ejecución, dos navegadores, sin compilación simultánea.
No editar fuentes importadas hasta terminarlo.

Preparación de escenarios, todavía **sin importar ni dar por validada**:
`architecture/stoneGeometry.ts` (sillares biselados, dovelas y columnas
acanaladas), `stoneMaterial.ts` (mármol, caliza, basalto y arenisca propios,
mapas de color/relieve/rugosidad separados), `StoneArchitecture.tsx` (instancias
por tamaño) y `CitadelBasilica.tsx` (patio a nivel inferior y arquería). Falta
integrar, compilar, fotografiar y revisar. No incluir estos borradores en el
checkpoint de presentación ni marcar escenarios terminados.

**22 oct, 03:24.** Décimo bloque guardado en `b42e300` (555 unitarias,
75 e2e, build/lint verdes). Undécimo en curso: `CommanderDuel` integrado en
el mulligan, con ambos retratos, emblemas y nombre/contexto del escenario.
No hay espera extra ni nueva pantalla. `MulliganPresentation` adapta el
diálogo a desktop y móvil. Foco inicial, Tab cíclico y atajos del campo
bloqueados dentro del diálogo; guía inicial y mulligan ya no se superponen.
Texto condensado y singular de «Cambiar 1 carta» corregido.
Build `53031` y lint `42501` verdes. Sonda nueva de presentación y teclado
en marcha: `RUN_SHOTS=1` solo en mulligan-presentation.spec, tres resoluciones.
Esperar y revisar imágenes antes de tocar fuentes. Esta sonda usa
`e2e/helpers/cameraSnapshot.ts` para capturar matrices reales de R3F al
terminar, útiles para no colocar decorado fuera del encuadre.
Herramienta preparada: `node tools/world-projection.mjs <JSON> [X Y Z ...]`;
validarla contra los JSON de la sonda. Sin nuevos recursos externos.
Sonda `25312`: tres verdes y capturas revisadas; `33899`: revisión del rostro
de Torvald tras alinear el arte arriba, una verde. Cámara real exportada en
`tools/captures/camera-foundry-*.json`; world-projection validado con ellas.
Ejemplo medido: (0, 4, -8) queda FUERA del lienzo; ni siquiera (0, 2.8, -5.8)
cabe completo. Para edificios altos, usar niveles inferiores reales o los
flancos más próximos, y medir, en vez de repetir decorado invisible.
Gate de presentación: unitarias `89613` 555/5 skip, build `57651`, lint
`99177`, verdes. E2e completo `1663` ejecutándose: 111 pruebas, 78 activas,
33 omitidas. No editar fuentes importadas hasta que termine. Se puede preparar
arquitectura nueva SIN importar para el bloque de escenarios.

**22 oct, 03:21.** Décimo bloque validado. Gate completo: **555 unitarias
verdes/5 omitidas**, build y lint verdes; e2e `20002` **75 verdes/33 omitidas**.
La pasada con dos navegadores pasó completa, incluidos navegación, modo foto,
inspección y controles. Capturas de interfaz/piezas revisadas a ambas resoluciones.
Guardar checkpoint de interfaz. No incluir aún los archivos preparados de
CommanderDuel/MulliganPresentation/scenarioPresentation ni cameraSnapshot y
world-projection: pertenecen al bloque siguiente y siguen sin integrar.
No hay procesos de verificación pendientes. Siguiente: conectar presentación
al mulligan, verificar desktop/móvil y luego renovar los escenarios.

**22 oct, 02:48.** Noveno avance guardado en `f741055`.
Actualización 02:58: e2e completo `74949` detenido, no cerrado en verde.
Las dos inspecciones agotaron 60 s. Traza leída: todas las comprobaciones
del primer inspector pasaban, pero cada pulsación tardaba 3–8 s mientras tres
campos WebGL se rasterizaban continuamente. Se detuvo solo el árbol del
proceso de Playwright verificado (PID 11388); servidor 4173 conservado.
`Canvas` pasa a `demand` con movimiento reducido o bajo modal opaco; React y
OrbitControls solicitan los fotogramas necesarios. Los relojes de reglas no
se paran. La pose reducida ahora es exacta, sin amortiguado residual de un
solo fotograma. Matriz de tres navegadores `55536`: cinco verdes; inspecciones
en 23/16 s en lugar de agotar 60 s. Build `96147` y lint `36383` verdes antes
del ajuste mínimo de pose. Repetir gate tras ese ajuste.
Gate de pose exacta: unitarias `82496` **555/5 omitidas**, build `58329` y
lint `28068`, todos verdes. E2e completo relanzado a las 03:03 sin trabajos
pesados paralelos. Esperar antes de integrar CommanderDuel o tocar fuentes.
Esa pasada es `51230`: inspecciones ya verdes con tres workers; queda un
tiempo de espera de navegación galería → Jugar. La traza confirma URL /play
pero el DOM anterior sigue mientras carga el módulo. No se alteran límites
de los tests: `playwright.config.ts` pasa a dos navegadores por la contención
de rasterizado software del campo ampliado. Terminar `51230` y repetir suite
completa con dos; no afirmar gate cerrado todavía. Sin compilaciones paralelas.
`51230` terminó: 73 verdes/33 omitidas, navegación y modo foto por tiempo de
espera. La configuración de dos workers aún no estaba aplicada a ese proceso.
`CommanderDuel.tsx`, su CSS y `scenarioPresentation.ts` están preparados pero
SIN importar ni integrar. No incluirlos en el checkpoint de interfaz hasta
la fase de presentación. No hay generación de imágenes pendiente.
Décimo en curso, sin commit: interfaz de batalla. Paneles con más contraste,
retrato de comandante, emblema, jerarquía de textos y poder legible aun sin
Esencia. El panel derecho vacío ya no es un rectángulo de alto completo.
Iconos de trazo propio para ataque/vida/esencia/mano/mazo y chapas más sobrias.
Recoger la mano o agotarla libera realmente alto para el tablero. El lienzo
3D llega bajo los paneles con `--scene-bleed`, pero `ResponsiveCamera` calcula
el encuadre con el ancho seguro: el contenedor de pruebas/interacción conserva
sus coordenadas. Se corrigió además el desplazamiento programático de toda
la batalla al enfocar una carta alta (`overflow: clip`): la primera captura
había perdido la cabecera. Una prueba exige ahora cabecera completa y scroll 0.
La mano distingue jugable/seleccionada mediante filetes verde/dorado; se han
reducido los halos gruesos. `Card` recibe el movimiento reducido de la app,
no solo el del sistema operativo; prueba de inclinación/selección añadida.
Unitarias `11164`: **555 verdes, 5 omitidas**. Build `3915` y lint `99500`
verdes. UI específica `92233`: dos verdes y capturas revisadas con cabecera.
Último ajuste: estadísticas del panel separadas en dos columnas y etiqueta
de mano vacía coherente. Revisión conjunta `43630`: cuatro pruebas verdes,
capturas de interfaz y piezas revisadas en ambas resoluciones. Encabezado y
selección siguen visibles; contador de vida/ataque ya sin emojis de plataforma.
E2e completo recién lanzado, sin build simultáneo; cierra también la
verificación del noveno avance. Las sondas nuevas elevan los omitidos a 33; UI añade dos
pruebas activas (75 activas en total, 108 en la suite).
Siguiente: presentación de escenario/comandantes #50, preferiblemente renovar
la cabecera del mulligan existente sin añadir una espera/modal obligatorio.
Después renovación de escenarios y materiales. No marcar escenarios como hechos.

**22 oct, 02:32.** Octavo bloque guardado en `c180eec`.
Noveno avance: maldición con tinta y filamentos en los bordes de ambas caras,
sin el círculo violeta plano. Quemaduras tras daño real con VFX de fuego:
brasas de 1,5 s y hollín que desaparece a los 8 s, independientes de la cola.
No se inventó un estado de quemadura ni se usa la casilla abrasada para
marcar a su ocupante. Las protecciones que absorben todo el daño no chamuscan.
El reconocedor separa palabras para que `slash`/`flash` no se confundan con `ash`.
Movimiento reducido conserva hollín estático y omite brasas.
Cinco emblemas integrados en public, originales privados conservados y
procedencia documentada en `docs/arte-interfaz.md`. Sin recorte circular de
las siluetas nuevas. Fallar una imagen ya no contagia el respaldo SVG a la
siguiente facción del mismo hueco. Cuatro pruebas nuevas de clasificación,
caducidad y cambio de emblema. Unitarias: **554 verdes, 5 omitidas**.
Build `60250` y lint `76109` verdes. Sonda `87521`: dos verdes y seis capturas
revisadas de brasas, hollín y extinción a ambas resoluciones. La revisión
normal de acabados ahora incluye maldición. Falta la pasada e2e completa del
noveno avance: agruparla con la renovación inmediata de interfaz, antes de
entregar. No afirmar que la suite completa ya se ejecutó con estos cambios.
Sin procesos pendientes. Siguiente: jerarquía y legibilidad de la interfaz,
quitar el vacío del panel derecho y preparar el escenario a ancho completo
conservando el encuadre seguro y los puntos interactivos del tablero.

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
