# Renovación visual — registro de continuidad

## Retoma del 28 de octubre de 2026

Retoma posterior: el usuario pide fases largas que agrupen varias mejoras y
continuar hasta completar el listado. La automatización vuelve a estar activa;
sus avisos no deben interrumpir una fase en curso. El avance hasta `83a4c8b`
se subió a GitHub; las siguientes publicaciones requieren nueva petición.
Primer objetivo conjunto: revisar ataques, impactos y destrucciones por familia
y caída del Nexo mediante eventos reales, a ambas resoluciones, antes de
integrar y verificar un bloque coherente. Los 39 puntos parciales siguen abiertos.
Revisión inicial: prueba de caída de ambos Nexos 2/2 verde a 1920 y 1366;
captura de ruptura rival a 1366 revisada. Combate real 1/1 verde (1280):
captura de impacto revisada. La destrucción ya recibe la facción y el tipo de
pieza, pero sus pavesas mantienen una trayectoria común; falta contrastar
familias y materiales en capturas antes de rediseñarla. Ningún punto cerrado.
Comparación de impactos Arcano/Naturaleza/Orden/Forja en Santuario: 1366 verde;
1920 pasó al repetirlo tras un `ERR_NETWORK_CHANGED` durante la primera carga.
Captura Forja a 1366 revisada: el golpe es legible pero el material apenas se
distingue. Revisar el instante y la escala de fragmentos antes de cambiarlos.
Sonda opcional nueva `e2e/destruction-shots.spec.ts`: seis facciones sobre
Santuario a ambas resoluciones, 2/2 verdes. Primer montaje descartado: el reloj
avanzaba antes de inyectar el evento y fotografiaba el tablero vacío; corregido
y captura de Sombra a 1366 revisada, con anillo y motas visibles. Falta poner
una ficha real en escena y comparar materiales/instantes antes de aplicar cambios.
La sonda ahora incorpora una pieza y dos instantes: 2/2 verdes, imagen inicial
de Forja revisada a 1366. Prototipo local reduce la luz de destrucción de 22
a 8 para no blanquear el arte; repetición 2/2 verde y comparación visual en
1366. Es parcial, faltan gate completo y contraste con otras facciones/escenas;
la sonda inyecta el evento y no reemplaza una comprobación de muerte real.
Unitarias 589/5, build y lint verdes. E2E completo: 85 verdes y 39 omitidas
(incluye la sonda opcional nueva). Capturas de Forja a 1920 y 1366 revisadas.
Queda contrastar otros escenarios y destrucciones reales antes de cerrar #45.
Combate real tras el ajuste: 1/1 verde a 1280; la destrucción por familias y
otros escenarios siguen pendientes. El avance de luz se guardó en `9ad3d80`.
Se probó una trayectoria helicoidal para Marea y ascendente para Sombra sin
añadir partículas: capturas 2/2 verdes, pero en 1366 la diferencia apenas se
percibe y sigue dependiendo del color. Prototipo retirado. Antes de insistir,
comparar secuencias completas con pieza en caída y diseñar siluetas distintivas
que se lean a velocidad real; #45 continúa parcial.
También se ensayaron esquirlas de metal y cristal más alargadas; la captura de
Forja a 1366 seguía dominada por motas y el material no se distinguía. Retirado
tras 2/2 capturas verdes. El siguiente diseño debe jerarquizar fragmentos y
resplandor juntos, no ampliar por separado partículas que ya quedan ocultas.
Hallazgo de integración: una carta reciclada conserva su identificador y la
lista de fichas ya caídas no lo olvidaba; al morir de nuevo se omitía su caída.
Corregido localmente al reconocer el regreso de la pieza, con regresión del
ciclo morir/reaparecer/morir. Unitarias 590/5, build y lint verdes; capturas de
destrucción 2/2 verdes y revisadas a ambas resoluciones. E2E completo 85 verdes,
39 omitidas. Sin verificaciones activas. Sigue pendiente la dirección de #45.
Nuevo prototipo coordinado para piezas metálicas y cristalinas: menos pavesas
brillantes y fragmentos algo mayores, manteniendo instanciado y sin partículas
extra. Se redujo el tamaño de cristal tras observar que tapaba el arte. Sonda
2/2 verde, imágenes de cristal a 1920/1366 y Forja a 1366 revisadas; falta
comparar una muerte real y un escenario claro. Unitarias 592/5, build y lint
verdes. E2E completo 85 verdes y 39 omitidas. La comparación de Ciudadela 2/2
verde se revisó a 1366 para metal y cristal; combate real 1/1 verde a 1280.
Lint de la sonda actualizada verde. Es un avance localizado: falta dirección
para el resto de materiales y facciones; no marcar #44/45 terminados.
Revisión conjunta de carta única y normal: nueva sonda opcional
`e2e/unique-frame-shots.spec.ts` 2/2 verde tras corregir la expectativa de los
nombres compactos (pueden estar ocultos). Se ensanchó el marco central de la
única y se comparó a 1366, pero seguía sin distinguirse claramente; prototipo
retirado. Conservar la sonda para rediseñar jerarquía de silueta y chapa; #34
sigue parcial. Las estadísticas contiguas requieren respetar su espacio.
Nuevo distintivo junto a las estadísticas de la única, con etiqueta accesible
y sin ensanchar la chapa: sonda 2/2 verde, comprobación de distancia a las cifras
vecinas e imágenes 1920/1366 revisadas. Es un avance de legibilidad, no una
renovación completa del marco. Unitarias 592/5, build y lint verdes; E2E
completo 85 verdes/41 omitidas. Sonda con texto al 140 % y selección de la
única 2/2 verde. A 1366 las cifras contiguas se solapan con texto grande,
problema previo que requiere resolver la disposición de etiquetas sin atribuir
una cifra a otra pieza. El nuevo distintivo no corrige ese problema; #34 parcial.
Prototipo para cifras compactas: reduce solo márgenes, conserva el tamaño de
texto y los iconos. Sonda con dos fichas contiguas y texto al 140 % comprueba
que las cifras no se solapen: 2/2 verde; captura 1366 revisada. Texto normal
2/2 verde. Falta probar cifras de dos dígitos y más posiciones: no considerar
cerrado el solapamiento general. Unitarias 592/5, build y lint verdes; E2E
completo 85 verdes/41 omitidas. Ensayo de cifras de dos dígitos y texto al
140 %: 1920 verde, 1366 aún solapa; se retiró el parámetro experimental de la
sonda. Se necesita distribución por colisiones reales, no mover indiscriminadamente
las chapas. El ajuste guardado resuelve el caso probado de cifras simples.
Para #43 se amplió la sonda de trayectorias para simular hechizos de cuatro
familias: 2/2 capturas verdes. Se ensayó un arco alrededor del proyectil,
pero a 1366 parecía una órbita planetaria ajena al lenguaje del juego; retirado.
La comparación es sintética y falta comprobar hechizos reales y movimiento,
así que el recorrido sigue parcial. La sonda admite `COMBAT_SPELLS=1`.
Nuevo prototipo de hechizo: dos filamentos sobre la estela existente y mayor
anchura, sin mallas adicionales y sin modificar destino ni duración. Capturas
sintéticas de cuatro familias 2/2 verdes en Santuario y 2/2 en Ciudadela;
Sombra a 1366 y Arcano a 1920 revisados. Unitarias 592/5, build/lint verdes.
E2E completo 85 verdes/41 omitidas, incluidos hechizos reales dirigidos de
Marea a ambas resoluciones y movimiento reducido. La dirección de #43 sigue
parcial: falta revisar más facciones y el movimiento en una partida poblada.

El usuario autorizó continuar hasta el 29 de octubre a las 19:00 Europe/Madrid.
Primer bloque completado: radio del cielo de Ciudadela ajustado de 70 a 105 para
evitar el recorte del panorama en modo foto.
Las unitarias terminaron: 588 aprobadas y 5 omitidas; build y lint pasaron.
E2E finalizó con 85 pruebas aprobadas y 37 omitidas. La pose de foto que
mostraba el arco se revisó a 1920×1080 y 1366×768: el panorama ya no queda
recortado en esa pose. El arreglo está verificado localmente, sin publicar;
Ciudadela sigue pendiente de pulido artístico global. Próximo bloque: revisar
materiales y composición de arquitectura, sin añadir decorado que tape tablero.

Prueba descartada: molduras y pilastras de la ciudad inferior compilaban pero
en la captura amplia de 1920 apenas se distinguían. Se retiraron; no se cuentan
como mejora. Próximo bloque: examinar la cámara de juego y trabajar sobre las
superficies visibles de la basílica, contrastando capturas antes y después.
Captura de juego a 1920 realizada: la arquitectura principal y el entablamento
son visibles, mientras el frente de ciudad inferior queda parcialmente oculto.
Priorizar relieve y materiales de la estructura principal sin tapar el Nexo.

Nuevo bloque parcial: friso articulado de la basílica, visible en la cámara de
juego a 1920 y 1366 y en modo foto a 1920. Unitarias 588/5, lint, build y
E2E 85/37 verdes. Es un avance pequeño: Ciudadela no está finalizada.
Siguiente: trabajar el aspecto del arco y apoyos visibles con relieve y
materiales de piedra, evitando que el detalle distraiga de las cartas.
Se probó y descartó una clave rectangular: desde juego parecía un bloque
superpuesto. La mejora del arco requiere geometría de dovela integrada.
También se descartó una dovela curva añadida: seguía pareciendo superpuesta
en la captura. Evitar acumular pequeños adornos; pasar al siguiente bloque
compartido de cartas y estados, y volver al arco con un rediseño completo.
Revisión visual existente de hielo, infección, maldición y huella ígnea en
ambas resoluciones: 2/2 verdes. En 1366 la diferencia de contagio y maldición
depende demasiado del pequeño icono; el tratamiento de superficie apenas se
lee. Siguiente bloque: reforzar la identidad de ambos bordes conservando arte
y legibilidad, comparar capturas antes/después y verificar movimiento reducido.
Prototipo de pátina de contagio e hilo de maldición: capturas 2/2 verdes y
revisión de 1366; es un avance sutil, no finaliza el punto 38. Unitarias 588/5,
lint, build y E2E 85/37 verdes. Movimiento reducido: capturas 2/2 verdes y
revisión de 1366; archivo temporal eliminado. Siguiente: revisar las entradas
por facción y el relieve de cartas únicas para mejorar su presencia sin tapar
las ilustraciones. Contagio y maldición siguen pendientes de pulido global.
Revisión de entradas por facción 2/2 verde; imágenes de Furia y Vacío a 1366
revisadas: ambos sellos se distinguen principalmente por color, por lo que
falta examinar movimiento en varios instantes antes de decidir una mejora.
Pendiente comparar carta única y normal con la misma cámara y resolución.
Comparaciones 2/2 verdes: el marco único apenas destaca a 1366. La ampliación
pequeña de corona y esquinas tampoco resolvió el problema; se descartó y se
eliminó la prueba temporal. Se necesita un diseño más reconocible sin tapar
estadísticas ni ilustración; no marcar el punto 34 como terminado.
Prototipo de perfiles laterales: pruebas 2/2 verdes pero casi imperceptible a
1366, se descartó y se retiró la prueba temporal. La solución necesita una
revisión más amplia de silueta y jerarquía visual, no adornos diminutos.
Nuevo bloque parcial Fiordo: extremos de los bancos descienden bajo el lago
gradualmente para reducir los cortes rectos. Unitarias 588/5, lint y build
verdes; capturas orbitales 1920 y 1366 revisadas. E2E 85/37 verde.
La orilla sigue teniendo aspecto redondeado y separada del tablero: se necesita
más integración y detalle; no considerar Fiordo terminado por este ajuste.
La misma vista orbital muestra el barco separado de la placa; revisar su
anclaje y la orilla de forma conjunta antes de desplazarlo o añadir nieve.
Desplazarlo a z=-6,9 se descartó: en la vista orbital se pega al Nexo rival y
amenaza su legibilidad. La unión exige un ensanche de hielo, no acercar casco.
Se descartó un primer ensanche de placa: la rotación de la geometría coloca el
signo de la coordenada longitudinal invertido y salió al lado contrario del
barco. Antes de repetir, contrastar las coordenadas en mundo y forma/reflejo.
En el lado correcto, el ensanche rectangular del hielo tapó parte del casco y
pareció una plataforma artificial; también descartado. Necesita geometría
de ribera independiente y transición orgánica, no ampliar toda la placa.
Añadida regresión geométrica para que ambos extremos permanezcan bajo el lago
y el centro conserve relieve; 3/3 pruebas específicas verdes. Pendiente gate
completo: unitarias 589/5, lint y build verdes. E2E 85/37 ya pasó sobre la
misma geometría.
Revisión de combate real 1/1 verde. Las capturas a 1280 muestran que durante
el ataque la ficha y su chapa pueden solaparse con la defensora, dificultando
leer quién recibe el golpe. Analizar desplazamiento y ubicación de chapas en
ambas resoluciones, con ataques adyacentes y a distancia; no corregirlo
ocultando información ni alterando el resultado resuelto por el motor.
Prototipo: separar horizontalmente chapas propias y enemigas cuando ambas
están expandidas y próximas. Captura de combate real en sesión 72329; verificar
que no se atribuyan cifras a otra ficha y que no invadan otras casillas. Falta
gate completo y revisión a 1920 y 1366 antes de conservarlo.
Captura inicial a 1280 separa correctamente atacante y objetivo. En curso
revisión de ambas resoluciones en sesión 72602 mediante archivos temporales
e2e/combate-1920-temporal.spec.ts y e2e/combate-1366-temporal.spec.ts;
eliminarlos tras recoger las capturas. No ejecutar otro proceso WebGL aún.
El primer intento alteró por error las claves locales al cambiar nombres de
capturas y falló la preparación; corregido. Reintento en sesión 90912.
El segundo intento pasó pero la prueba original sobrescribía las resoluciones
con 1280×800; se corrigió el temporal y se relanzó en sesión 24309. No contar
esas imágenes anteriores como revisión de las resoluciones requeridas.
Reintento correcto 2/2 verde; 1366 revisado: nombres y cifras se separan en el
duelo. Archivos temporales eliminados. Captura 1920 también revisada; faltan
condiciones con varias unidades. Unitarias 589/5, lint y build verdes; E2E
85/37 verde. Comparación con varias unidades y selección en sesión 91881;
verificar especialmente que ninguna chapa desplazada parezca de otra ficha.
Comparación 2/2 verde pero la ficha seleccionada sin rival próximo desplaza su
chapa innecesariamente y puede confundirse con una casilla vecina. Prototipo
descartado: hace falta resolver la colisión real por posiciones de pantalla y
conectar cada chapa a su ficha, no desplazar todas según el bando.
Inspección de Santuario a 1920 en cámara real: los monolitos sí emplean perfil
erosionado y runas, pero se leen como bloques oscuros y la portada queda poco
integrada. Priorizar composición y contraste localizado sin aclarar todo el
tablero ni tapar las casillas; contrastar captura de juego antes/después.
Se descartó luz puntual frontal: aclaraba más el Nexo y suelo que la portada.
La solución requiere luz orientada o material específico de la estructura,
comprobando su efecto en ambas caras y sin sacrificar la atmósfera.
Prototipo de piedra ligeramente más clara solo en la portada: captura 1920 de
juego revisada; efecto moderado, sin alterar el suelo. Unitarias 589/5, lint y
build verdes; juego a 1366 y modo foto a 1920 revisados. E2E 85/37 verde.
En la órbita, los apoyos de la portada parecen suspendidos: necesita una
cimentación visible integrada con el lago; este ajuste no termina Santuario.
Primer basamento de piedra descartado: desde la órbita permanecía oculto y no
resolvía la suspensión aparente. Medir el nivel del agua y apoyos antes de
rehacerlo; no contar un objeto invisible como mejora.
Segundo prototipo: basamento elevado por encima del lago (-0,72) visible en
foto 1920 y conectado a los apoyos. Unitarias 589/5, lint y build verdes. Juego y foto
revisados a ambas resoluciones; E2E 85/37 verde. Sonda de reflejo del Santuario
1/1 verde (cambio de píxeles 0→14→0, resolución 512).
El basamento aún resulta geométrico; mantener Santuario como parcial.
Siguiente bloque: diferenciar visualmente los ataques por familia; revisar
proyectiles e impactos existentes y capturar una línea base antes de editar.
Capturas de ocho familias 2/2 verdes; Furia y Marea se distinguían casi solo
por color en 1366. Núcleo alargado de Marea 2/2 capturas verdes: silueta
distinta visible a 1366, aunque el aspecto acuático requiere más pulido.
Unitarias 589/5, lint y build verdes; E2E completo 85/37 verde.
Comparación de Sombra en Ciudadela clara 2/2 verde; captura 1366 revisada, la
estela es visible sin ocultar estadísticas. Queda diseño más distintivo por
familia. Siguiente: revisar destrucciones y caída del Nexo desde eventos reales.
Siguiente: revisar estelas e impactos en el escenario oscuro y evaluar que el
nuevo proyectil de Marea se distinga con iluminación, efectos y movimiento
reducido; el punto 42 sigue parcial hasta integrar todas las familias.
Capturas de cuatro familias sobre Santuario oscuro 2/2 verdes: el proyectil de
Marea se distingue, pero parecía sólido. Material translúcido revisado en 1366,
capturas 2/2 verdes. Unitarias 589/5, lint y build verdes; E2E 85/37 verde.
En movimiento reducido los trayectos de ataque y hechizo no se montan, según
EventEffects; el test existente de movimiento reducido pasó en E2E.
Siguiente: en Santuario oscuro el proyectil de Sombra es un punto pequeño
y su estela apenas contrasta (captura 1366); reforzar su silueta sin convertir
la oscuridad en un destello que tape piezas, comparar también sobre Ciudadela.
Prototipo de núcleo oscuro facetado 2/2 verde, pero el contorno de alambre se
veía como un marcador geométrico ajeno a la fantasía del juego; descartado.
El proyectil de Sombra sigue pendiente de un lenguaje visual más orgánico.
Bruma en capas 2/2 verde pero en 1366 apenas se distingue y añade dos sprites;
descartada por escasa mejora frente a su coste. Sombra necesita un rediseño
de trayectoria y lenguaje, no acumular luces débiles.
Estela de Sombra sin nuevas partículas: evita valores de alpha negativos y
aumenta su radio. Capturas 2/2 verdes, 1366 oscuro revisado; detalle parcial.
Unitarias 589/5, lint y build verdes; E2E completo 85/37 verde.

Autorizada el 21 de octubre de 2026. Fecha límite: **22 de octubre de 2026,
20:00 Europe/Madrid**. Automatización: `renovaci-n-visual-de-cr-nicas-del-nexo`,
cada cinco minutos. El usuario autorizó el 22 oct a las16:41 publicar el avance
verificado para jugar y continuar hasta las20:00. Publicaciones posteriores
requieren nueva petición; la automatización conserva su alcance local.

Prioridad humana posterior (22 oct,19:00): mano inicial de10 cartas para ambos
bandos, conservar el robo normal y reciclar/barajar el cementerio al agotarse
el mazo. El usuario confirmó expresamente que no quiere rellenar la mano
automáticamente y pidió publicar todo de nuevo tras verificar. Cambio
TERMINADO y PUBLICADO en2a028a5: regresiones588/5 y85/37 e2e, más48/48
escenarios verdes. La web real abrió mano10 sin errores. No repetir esta
petición ni volver a publicar sin nueva autorización humana. El gate encontró colisión de ids de zombis al
reciclar una carta infectada; se asigna id determinista por conversión.

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
| 1 | Caldera: renovación integral | A |
| 2 | Ciudadela: renovación integral | A |
| 3 | Santuario: renovación integral | A |
| 4 | Duna: renovación integral | A |
| 5 | Fiordo: renovación integral | A |
| 6 | Claro: renovación integral | A |
| 7 | Rompiente: pulido integral | A |
| 8 | Gremio: pulido integral | A |
| 9 | Jade: pulido integral | A |
| 10 | Escalinata: pulido integral | A |
| 11 | Escenario propio de Quinto Sol | A |
| 12 | Escenario propio de Bestiario | A |
| 13 | Elemento protagonista por escenario | A |
| 14 | Composición y decorado desde cámara real | A |
| 15 | Transición entre tablero y entorno | A |
| 16 | Materiales de piedra | A |
| 17 | Materiales metálicos | A |
| 18 | Materiales de hielo | A |
| 19 | Agua | A |
| 20 | Lava | A |
| 21 | Arena, tierra y nieve | A |
| 22 | Iluminación propia por escenario | A |
| 23 | Sombras del escenario | A |
| 24 | Sombras de contacto de cartas | V |
| 25 | Reflejos apropiados al material | A |
| 26 | Niebla y separación de planos | A |
| 27 | Humo y vapor por capas | A |
| 28 | Partículas ambientales | A |
| 29 | Movimiento del entorno | A |
| 30 | Evolución ambiental durante la partida | A |
| 31 | Marcos de las cartas desplegadas | V |
| 32 | Integración de iluminación de las piezas | V |
| 33 | Diferenciación de unidades y estructuras | V |
| 34 | Presencia de cartas únicas | A |
| 35 | Entradas por facción | A |
| 36 | Congelación sobre las piezas | V |
| 37 | Escudos y protecciones | V |
| 38 | Contagio, maldición y quemaduras | A |
| 39 | Desgaste de piezas dañadas | V |
| 40 | Solapamiento de nombres y estadísticas | V |
| 41 | Anticipación, impacto y recuperación | A |
| 42 | Familias visuales de ataque | A |
| 43 | Recorrido de hechizos | A |
| 44 | Impactos por facción y material | A |
| 45 | Destrucciones por facción | A |
| 46 | Deterioro de Nexos | A |
| 47 | Caída del Nexo | A |
| 48 | Interfaz de batalla | V |
| 49 | Inspección de cartas | V |
| 50 | Presentación de escenario y comandantes | V |

## Bloque activo

**20:00, bloque CERRADO por la fecha límite acordada.** Automatización
`renovaci-n-visual-de-cr-nicas-del-nexo` eliminada. No queda ningún proceso
de prueba o captura activo ni parche de juego sin verificar. Código publicado
y comprobado en481a373; revisión artística local en el checkpoint posterior.
Estado final:11 tareas V y39 avances A. Pendientes concretos y sonda del cielo
en `docs/REVISION-VISUAL-2026-10-22.md`. No continuar ni publicar automáticamente
después de esta hora; esperar nuevas instrucciones del usuario. Preservar«ç».

**19:58, revisión artística de cierre local.** Ver
`docs/REVISION-VISUAL-2026-10-22.md`: las50 no están terminadas (11 V/39 A).
La foto orbital de Ciudadela revela un arco de cielo en primer plano. Sonda
reversible y cerrada confirma que la esfera70 corta el panorama; radio
efectivo105 elimina el arco con la misma cámara[20,12,8]. Solo memoria del
navegador, sin parche de producción ni publicación. Antes/después y script
en tools/captures; el primer intento se descartó por cámara aún en transición.
Pendiente aplicar corrección con regresión, gate completo y capturas.
No iniciar fuentes cerca del límite: la suite anterior tardó7,2min.
Último HEAD publicado481a373, Actions39826131837 y deployment7259487818 success.
No hay pruebas ni capturas activas. Guardar este bloque local sin push.
Al llegar a20:00 cerrar y eliminar la automatización, preservando«ç».

**19:50, PUBLICACIÓN CONFIRMADA y petición del mazo CUMPLIDA.**
Origin/main contiene3f7b88d (reglas/mano) y2a028a5 (panoramas/bronce).
Actions39825636655 success y deployment7259414952 success para2a028a5.
Comprobación con Chromium en la web pública: abrir Jugar, comenzar partida,
contar10 cartas en el mulligan y10 en la mano, sin errores de JavaScript.
Captura `tools/captures/publicado-mano-diez-1366x768.png`; script y recibo
en la carpeta de capturas ignorada. Usuario avisado del enlace jugable.
No hay suites ni capturas activas. Solo queda revisión/documentación visual
hasta20:00, sin ampliar reglas ni publicar más cambios de juego. Al llegar
a20:00 guardar el cierre y eliminar la automatización. Las50 siguen con
39 avances y11 terminadas: no confundir los48 casos de escenarios con50
mejoras completadas. Conservar el PNG ajeno«ç» sin añadirlo.

**19:46, pipeline49114 CERRADO en verde.**588/5 unitarias, build/lint,
85/37 e2e completos,4/4 capturas de mano y48/48 escenarios:12 lugares en
alta/baja a1920/1366, mano visible/recogida, fotos amplias y sondas de reflejo.
Imágenes nativas de batalla de los12 revisadas, sin juntas ni cantos nuevos.
Banda reduce11840 triángulos de la vista distante sin añadir mapas/luces.
Bronce del Nexo y fisuras conservan volumen. Reglas guardadas en3f7b88d;
se prepara checkpoint visual y push explícitamente pedido, seguido de CI
y comprobación real de la web publicada. Ningún navegador local sigue activo.
Las50 mejoras conservan39 avances y11 terminadas: todavía falta oficio y
pulido de protagonistas/materiales y composición global; no declararlas50 V.
Preservar sin añadir el PNG ajeno«ç».

**19:36, reglas terminadas y guardadas en3f7b88d.**588/5 unitarias,
build/lint y85/37 e2e completos verdes (7,2min). Pipeline49114 sigue ACTIVO:
4 capturas de preparación/mano y después48 casos de12 escenarios. No editar
aplicación ni abrir otro navegador. Falta revisar la matriz y publicar ambos
bloques por la petición humana expresa;3f7b88d todavía no está en origin.
Conservar el PNG ajeno«ç» fuera del commit. Las50 mejoras aún tienen39 A y11 V.

**19:32, pipeline49114 sigue ACTIVO.**588/5, build/lint y5/5 foco/flujo/mano
verdes; suite completa en progreso (game-flow y gesto táctil ya verdes).
Después encadena4 capturas y48 escenarios. No tocar fuentes ni compilar.
La prioridad sigue siendo publicar reglas y avance verificado; no abrir
mejoras nuevas ni afirmar que las50 están terminadas.

**19:27, centro pulsable del abanico.** Pipeline49114 ACTIVO: unitarias,
build/lint,5 e2e de mano/flujo, suite completa,4 capturas y matriz48 escenarios.
No duplicar ni editar fuentes.79559 se detuvo tras detectar un fallo REAL en
game-flow: con10 cartas y50px de margen por lado, la siguiente carta tapaba
el centro de la fuente; no se forzó el clic ni se relajó la prueba. Solape40
hasta12 cartas deja el centro descubierto; manos mayores conservan compresión.
Móvil recto evita títulos cortados por el carril. Reglas ya pasan588/5 y
40 semillas; aún falta terminar estos gates antes de publicar por petición humana.

**19:22, cierre de reglas y revisión global.** Pipeline79559 ACTIVO: unitarias,
build/lint, suite completa con máximo1 fallo,4 capturas móvil/preparación y
matriz48 casos de12 escenarios (alta/baja,1920/1366), en ese orden. No editar
fuentes importadas, compilar ni duplicar Playwright mientras siga ejecutándose.
62693 cerró4/4 y588/5 + build/lint verdes: gesto táctil real no juega ni arrastra
fuentes, y foco alcanza ambos extremos. Corregidos1,7px de marco fuera con
64px de resguardo. Revisión de foto encontró títulos ocultos al elevarse contra
el recorte móvil: en móvil las cartas ahora quedan rectas y se superponen
al seleccionar; escritorio conserva su abanico.35181 se detuvo de forma segura
para este pulido antes de completar la suite. Ver los logs actuales, no contar
una suite interrumpida como aprobada. Publicación solicitada aún pendiente.

**19:16, acceso a las10 cartas en móvil.** Pipeline91078 ACTIVO:588/5,
build/lint verdes; ahora30 e2e (móvil, arrastre, mulligan y reciclaje). No editar
aplicación ni abrir otro navegador hasta que cierre. La anterior61268 cerró5/5:
reciclaje real y persistencia1920/1366, presentación1920/1366/375 revisada.
La captura móvil reveló extremos inaccesibles en el abanico largo: carril
horizontal propio, escala con geometría de scroll coherente y gesto horizontal
para consultar cartas; subir mantiene arrastre. Regresión de foco exige llegar
a primera/última/primera carta dentro del viewport. Falta suite completa y
matriz restante de panoramas antes de la publicación autorizada.

**19:10, petición de mazo en verificación.** Mano inicial10 por bando; robo
normal sin rellenar la mano, reciclaje determinista del cementerio solo al
intentar robar con mazo vacío. Conserva instancias, fuentes y piezas; sin
cementerio tampoco hay fatiga. Regresiones: robo ambos bandos, varios ciclos,
efecto de robo múltiple, cambio de turno y mulligan de las10 cartas.
Se encontraron ids repetidos de zombis en la semilla4 al reutilizar la misma
unidad: conversiones y copias de Renacer reciben id único determinista.
588 unitarias/5 omitidas verdes; simulación adicional con40 semillas verde.
Pipeline4903 ACTIVO: build/lint y suite e2e completa con2 casos nuevos de
reciclaje real/recarga a1920/1366. No tocar fuentes ni compilar hasta que cierre.
Banda y bronce:56426 cerrado,579/5, build/lint y Gremio4/Solar4 verdes; imágenes
nativas revisadas. Falta matriz de los otros10 escenarios antes de publicar
todo por nueva autorización humana. No añadir el PNG ajeno«ç».

### Historial de bloques

**18:52, revisión real del bronce. Pipeline `56426` ACTIVO:** test/build/lint
y matriz Gremio en tensión4 + Solar4; detener al primer fallo. NO editar
aplicación, compilar ni duplicar navegador mientras siga activo.

Revisión anterior: `93256` cerrado:579/5, build/lint y8/8
matrices Gremio/Sol verdes. Banda sin cantos visibles, pero el bronce crítico
seguía demasiado oscuro pese a entorno2,2. Se rechazó ese acabado: tinte gris
oscuro multiplicaba dos veces el mapa de bronce; aclarado solo ese tinte y
reducido su bump0,035→0,012. Fisuras subpíxel parecían motas doradas: cobertura
por fwidth y alfa acotada mantienen trazos estables. Pendientes gates y nueva
revisión antes de ampliar matriz global. Publicación7a7b74f sigue intacta.

**18:48, segunda publicación CONFIRMADA.** `7a7b74f` en main/origin/main;
Actions39816420383 build/deploy success, deployment7258035569 success.
Portada, Sol, Bestiario y Escalinata responden200 en
https://sefiro888.github.io/magicfable/ . Usuario avisado del enlace jugable.
Última petición de subir cumplida; no publicar de nuevo automáticamente.
Trabajo local siguiente ACTIVO en `93256`: banda panorámica ya conectada tras
prototipo8/8 Sol/Jade revisado, y bronce del Nexo Gremio con entorno2,2 para
que no resulte negro. Encadena test/build/lint y matriz Gremio en tensión4 +
Solar4. NO editar aplicación, compilar ni duplicar Playwright mientras siga.
Logs `band-bronze-foundry-20261022.log`, `band-final-sol-20261022.log`.
Después revisar imágenes, completar otros10 escenarios y suite completa
antes de checkpoint. No hay helper experimental sobrante: eliminado su propio
archivo no publicado tras integrar banda. Unidad geométrica permanece (579).
No afirmar revisión nueva validada todavía. Conservar PNG ajeno«ç».

**18:44, publicación pedida de nuevo por el usuario.** Push explícito realizado
`a182100..7a7b74f` a main (5 commits: Jade, Escalinata, Sol/Bestiario, invitado/
patios y oficio/clima/daño). Solo checkpoint verificado578/5 y82/37 e2e.
Actions `39816420383` en progreso para SHA7a7b74fe36de1b95ae14273150ed47f00b8a6d9e.
Pendiente confirmar deploy y recursos nuevos200 antes de informar disponible.
Prototipo de banda panorámica SIN publicar:579/5, build/lint y8/8 comparaciones
Sol/Jade verdes (`6432` cerrado). Fotos nativas comparadas: mejora de verticales
sin cantos visibles; aún no integrado. No otras suites activas. Preservar PNG
ajeno «ç», no añadirlo. Continuar hasta20:00 tras verificar publicación.

**18:39, oficio/clima/daño validados.** `99650` cerrado:578/5, build/lint,
82/37 e2e en5,5min verdes. Impactos4/4 con golpes3/8 y margen DOM estricto;
Solar4/4, tensión Gremio/Caldera/Fiordo12/12 y curación real2/2. Imágenes
revisadas en ambas resoluciones. Guardar checkpoint local sin push, excluyendo
los3 prototipos panorámicos aún no verificados y el PNG ajeno «ç» de la raíz.
#40 pasa V; #13/16/17/30 pasan A (avances con pulido global pendiente).
No hay verificaciones activas. Siguiente: comparar esfera/cilindro sin cambiar
aplicación, y corregir bronce demasiado oscuro del Nexo del Gremio en revisión
de materiales. No afirmar50 terminadas. Fecha límite20:00 CEST.

**18:35, matrices corregidas verdes.** `99650`:578/5, build/lint verdes;
impactos grandes8 Sol y normales3 Santuario4/4, Solar4/4, tensión alta
Gremio/Caldera/Fiordo12/12. Suite completa119 casos activa, sin fallos hasta
ahora (82activas/37omitidas esperadas). Revisados daño grande Sol1366 sin
solape, oficio Solar1920/1366, tensión Gremio1366/Caldera1920/Fiordo1366.
NO editar aplicación ni compilar mientras siga99650.
Preparados SIN importar tres archivos para comparar distorsión del panorama:
`panoramaBandGeometry.ts`, `.test.ts`, `e2e/helpers/panoramaBandProbe.ts`.
Prototipo cilíndrico (verticales rectas, radio50, alturas−8..−70 respecto a
cámara), máscara propia, helper restaura geometría/texturas tras captura.
Aún NO conectado ni probado; excluir esos3 del checkpoint Solar/Clima578.
Su prueba llevaría workspace579 cuando se valide. Tras cierre guardar bloque
actual y luego comparar esfera/banda en Sol/Jade a ambas resoluciones antes
de cambiar proyección del juego. No aceptar una banda con cantos visibles.

**18:29, pipeline de reparación `99650` ACTIVO.** `20760` cerró578/5,
build/lint verdes con altura2,0. Se quitó además acelerar humo multiplicando
el reloj por presión (saltarían las fases al curar); evoluciona densidad y
mantiene advección continua. `99650` repite test/build/lint de esa fuente final
y encadena impactos grandes Sol2/normales Santuario2 con aserción sin relajar,
Solar4, tensión alta Gremio/Caldera/Fiordo12 y suite completa (esperada82/37,
incluye las2 nuevas curaciones reales). Se detiene al primer fallo.
Logs `damage-label-*-fixed-20261022.log`, `solar-craft-20261022.log`,
`climate-tension-*.log`, `solar-climate-full-20261022.log`.
NO editar aplicación, compilar/lint ni lanzar otro navegador mientras99650
siga activo. `5019` y `81036` están cerradas. `aa71673` último checkpoint.
Revisar imágenes reales; luego registrar/guardar sin push. Deadline20:00 CEST.
Tras este bloque queda principalmente distorsión panorámica en foto y pulido
de protagonistas/materiales; #30/#40 aún no V hasta revisión y gates finales.

**18:27, ajuste por evidencia.** `5019` se detuvo correctamente: clima2/2
verde, impacto grande1920 verde;1366 detectó caja del número5,6px sobre nombre.
La imagen confirma mejora pero margen insuficiente. Altura2,0 sustituye1,7,
sin relajar aserción. Revisadas también nuevas molduras/calendario/cuenco en
captura de fallo: relieve y pared reales presentes. Repetir gate y pipeline;
no continuar sobre ese fallo ni declarar #40 cerrado. No hay navegador activo.

**18:25, verificación activa `5019`.** 578/5 unitarias (`4768`), build
(`57609`) y lint (`72674`, más lint dirigido11336 tras flags QA) verdes.
`5019` encadena: curación real/clima2, impactos grandes8 en Sol2 y normales3
Santuario2 con separación DOM obligatoria; oficio Solar4; presión alta
Gremio/Caldera/Fiordo12; suite completa sin flags. Se detiene al primer fallo.
Logs `climate-healing-20261022.log`, `damage-label-*.log`,
`solar-craft-20261022.log`, `climate-tension-*.log`, `solar-climate-full-20261022.log`.
No editar aplicación importada, compilar/lint ni iniciar otro Playwright
mientras siga activo. Revisar imágenes antes de aceptar, especialmente
calendario claro/cuenco y margen de daño grande sobre nombre/estadísticas.
Estado estable anterior en `aa71673`, sin push. El checkpoint nuevo aún NO
validado y #30/#40 no terminados. Corte sigue20:00 CEST (UTC18:00).

**18:24, oficio solar y clima integrados.** Checkpoint compartido `aa71673`,
sin push. SolarCarvings/solarCraftGeometry conectados: cuenco de pared/labio
reales, molduras de portal y cantos/pétalos físicos del calendario; piedra más
clara y pigmentación de incisión menos impresa. Crestas ahora piedra neutra.
BattleClimate conectado solo al escenario: lectura de turnos y Nexo más herido,
máximos de comandantes reales. Vapor gana densidad acotada; horno gana calor;
lava conserva presión incluso en pose reducida, sin animar ni cambiar nivel.
Curar revierte presión. No nuevos focos, capturas o estado de reglas.
Números de daño elevados1,0→1,7 para no atravesar chapas; sonda de impactos
comprueba rectángulos DOM. Test causal nuevo cura con Bendición de la Luna y
exige que horno se calme y siga quieto en reducido. Pendiente ejecutar en UI.
Unitarias `4768`:578/5 verdes; build activo `57609`; después lint y matrices.

**18:20, revisión compartida validada.** `81036`:4/4 impactos adicionales
con COMBAT_HITS, ambos escenarios y resoluciones, sin errores. Revisados
impacto metálico Sol1366 y cristal Santuario1920. Junto a `46577` (80/37,
9,3min), 575/5 y build/lint, permite guardar checkpoint compartido sin push.
Revisión global de marcos/luz/estructuras/congelación/escudo/desgaste y UI/
inspección/presentación cerrada: #31,32,33,36,37,39,48,49,50 pasan V. Nombres
estadísticas (#40) sigue A: el número flotante -3 invade la chapa al impactar;
corregir antes de darlo por terminado. #14–29 indicados A conservan pulido.
No afirmar50 completas: quedan distorsión, protagonistas, materiales y clima.
Cinco archivos borrador Solar/Climate excluidos. Sin procesos e2e activos.

**18:17, gate compartido cerrado.** `46577`:80/37 e2e verdes en9,3min;
575/5, build/lint previos verdes. Sonda adicional activa `81036` para impactos
reales con COMBAT_HITS=1 y cuatro materiales en Sol/Santuario, ambas resoluciones.
Aún no editar fuentes importadas ni compilar. Preparado también SIN importar
`BattleClimate.tsx` y `.test.ts`: presión visual derivada de turno y Nexo más
herido, máximos reales, cura reversible, sin estado de reglas nuevo. Excluir
estos dos y los tres borradores Solar del checkpoint compartido575. Tras
integrar ambos, el workspace esperado será578, pendiente ejecutar pruebas.

**18:14, suite completa sin incidencias.** `46577` sigue activo (hasta84).
No se ha duplicado ni alterado aplicación. Solar/Fiordo invitado1366 y
proyectiles Furia/Santuario1366 y Forja/Sol1366 revisados; no oclusiones nuevas.
Preparación siguiente de oficio solar completada en tres archivos no importados:
`solarCraftGeometry.ts`, `.test.ts`, `SolarCarvings.tsx`. Preservarlos, excluir
los tres del checkpoint compartido. No están verificados aún.
Tras gate completo: sonda impactos con COMBAT_HITS=1, actualizar ESTADO575/5
y guardar checkpoint compartido. Luego integrar oficio solar, aclarar el
calendario (evitar aspecto impreso marrón), sustituir el falso cuenco por
pared real y enriquecer molduras; revisar ambas resoluciones/calidades.
Evolución ambiental: pendiente diseñar respuesta persistente desde turno y
vida de Nexos resueltos (sin tocar motor). Evitar cambiar niveles de agua o
oscurecer cartas. Posible presión acotada en vapor/horno, con pose estática
reducida y sin nuevas capturas ni luces; aún NO implementado.

**18:10, continuidad.** `46577`:16/16 matrices de invitado y4/4 familias
proyectiles en Sol/Santuario verdes; suite completa activa, sin fallos hasta
ahora. OJO: no se activó `COMBAT_HITS`, por tanto impactos NO revisados en ese
bloque; hacer sonda corta con ese flag después del cierre. Revisadas vistas
invitado Sol/Fiordo1366 y vuelo arcano Sol1920. Preparados SIN importar:
`solarCraftGeometry.ts`, su prueba y `SolarCarvings.tsx` (cuenco con pared/labio
reales, molduras del portal y relieve físico del calendario). Excluir del
checkpoint compartido; aún no compilar/probar estos borradores. El workspace
contará576 cuando se valide la prueba nueva, checkpoint compartido575.
No editar fuentes importadas ni duplicar procesos mientras46577 esté activo.

**18:02, continuidad sin duplicar procesos.** `46577` sigue activo: Jade4/4
verde, Sol iniciado. Revisadas fotos corregidas Jade invitado1366/baja y
1920/alta orbital: tejado queda detrás y Nexo cercano completamente visible.
La separación de decorado resuelve la oclusión observada. Aún pendientes
los otros escenarios, combate y suite completa encadenados en esa sesión.
No editar aplicación ni compilar; conservar todos los cambios y el servidor.

**18:00, pipeline activo `46577`.** 575/5 unitarias (`94017`), build (`73596`)
y lint (`61496`) verdes tras separar decorado y táctica y corregir salida.
`80586` cerrado: 8 capturas Sol/Jade verdes +24 estados en12 escenarios,
contactos nativos revisados a ambas resoluciones (incluidos frío/noche/mediodía).
`46577` ahora repite invitado corregido en Jade/Sol/Ciudadela/Fiordo, alta/baja
ambas resoluciones (16), luego familias de ataque/impacto en Sol/Santuario a
ambas resoluciones (4), y suite completa con variables opcionales limpias.
Se detiene al primer fallo. Logs `tools/captures/global-guest-fixed-*.log`,
`global-combat-*.log` y `global-guest-full-20261022.log`.
NO modificar aplicación importada, compilar/lint o iniciar otro Playwright
mientras sigue activa. Revisar fotos invitado1366: el tejado debe quedarse
atrás y no tapar el Nexo cercano. Después fotos de combate claro/oscuro y gate
completo antes del checkpoint, sin push. Hora límite sigue20:00 (UTC18:00).
Siguiente bloque tras cierre: detalle del protagonista solar y evolución
ambiental persistente; quedan mejoras parciales, no declarar las50 terminadas.

**17:57, revisión cruzada cerrada y corrección de invitado.** `80586`: Sol4/4,
Jade4/4 y piezas/estados/selección en los12 escenarios24/24. La revisión de
invitado encontró un defecto real: tejado de Jade sobre Nexo cercano. Separada
arquitectura/luz en `scenario-stage`, solo táctica en `battle-view` gira180°.
Sonda exige decorado inmóvil y coordenadas tácticas invertidas. Rotación
React real usa ese mismo grupo. Rótulo de salida ahora «Abandonar batalla»,
antes decía Santuario incluso en el resto. Pendientes build/lint/test y repetir
matriz invitado, después suite completa. No publicar automáticamente.

**Hallazgo global prioritario (17:54).** La foto de invitado Jade1366/baja
muestra el tejado trasladado al primer plano y tapando el Nexo: no basta
centrar el paisaje. Tras cerrar `80586`, sacar el decorado/luz de escenario
fuera del grupo que gira el contenido jugable; nombrar escenario y grupo
jugable para verificar posiciones reales. Solo cartas/celdas/Nexos/efectos
cambian180°, la composición arquitectónica debe mantenerse desde ambos lados.
Adaptar panoramaProbe para girar `battle-view`, nunca Scene, y revisar fotos
invitado de Jade/Sol/otros protagonistas. Suite completa después del arreglo.

**17:52, revisión compartida en curso.** Sol/Bestiario guardados `d4f9ad9`,
sin push. Conectado centrado mundial del paisaje para invitado: la cámara
está fuera del grupo rotado; convertir mundo→local evita desplazar la cúpula.
Prueba con padre trasladado/girado y cámara anidada, 575/5 verdes. Build/lint
verdes. Patios de Jade/Sol con juntas y variación de bloque en mapas propios,
Bestiario conserva grava natural. Matriz activa `80586`: Sol4/4; Jade en curso,
luego24 pruebas de piezas/estados/selección en12 escenarios a ambas resoluciones.
No modificar aplicación importada, compilar ni duplicar Playwright hasta cerrar.
Fotos Sol/Jade1920 y Sol invitado orbital revisadas; falta1366/baja y repaso
conjunto de estados. Después suite completa antes del checkpoint compartido.
La prueba invitado exige centro mundial=cámara al girar180° y al restaurar.
Pendiente: más detalle de protagonistas cercanos (especialmente Sol), distorsión
esférica del paisaje en foto, evolución ambiental persistente y pulido global.
No confundir composición validada con acabado final; #1–23 siguen avances.

**17:45, Sol/Bestiario validados.** Suite completa `78543`: 80 activas verdes,
37 omitidas en 8 minutos. Matrices alta/baja, media y alta reducida a ambas
resoluciones verdes y revisadas; 574 unitarias del bloque, build/lint verdes.
Se guarda checkpoint local de los 12 escenarios y catálogo compartido.
Continúa revisión global; no nueva publicación automática.

**17:39, suite activa sin fallos.** `78543` por comprobaciones de Nexos;
media/alta reducida de ambos escenarios revisadas en imágenes nativas a ambas
resoluciones. Sin modificar aplicación ni lanzar otra verificación. Preparado
sin importar `materials/pavingMaterial.ts`: juntas de bloques en mapas propios
de color/altura/rugosidad para patios Jade/Sol; no aplicarlo al terreno natural
de Bestiario. Pendiente compilar y comparar antes/después en revisión global.
Excluir también este borrador del checkpoint Sol/Bestiario. PanoramaPosition
y panoramaProbe siguen sin conectar. Cerrar primero80/37 y guardar escenarios.

**17:34, continuidad.** Sesión `78543` ejecuta media/alta reducida de Sol y
Bestiario y después suite completa. No duplicar procesos ni editar fuentes
importadas/compilar hasta su cierre. `89245` terminó con ocho capturas verdes
y dos pruebas de selector verdes; imágenes corregidas de ambos escenarios
revisadas a ambas resoluciones. Preparado SIN importar e2e/helpers/panoramaProbe.ts
para girar el grupo real y medir centrado mundial del paisaje en vista invitada.
Junto a panoramaPosition.ts/test, excluirlo del checkpoint de escenarios.
Falta revisar media/reducida y resultado80activos/37omitidos esperado tras
añadir dos pruebas de selector. Las50 siguen incompletas; automatización vigente
hasta20:00. Publicación anterior ya comprobada, no push nuevo.

**17:32, Sol/Bestiario superan revisión corregida.** `89245`: ocho verdes
alta/baja ambas resoluciones, fotos nativas revisadas. Dos pruebas de catálogo
común/persistencia entre Ajustes y Jugar verdes.575/5, build/lint verdes.
Sol341calls55726tri y Bestiario253calls50074tri en pase principal (sin sumar
reflejos/sombras). Arquitectura y materiales siguen admitiendo pulido global.
Media/alta reducida de ambos sitios y suite completa encadenadas en curso,
detienen al primer fallo. No editar fuentes importadas ni compilar durante
el proceso. Log final sol-bestiario-full-hardware-20261022.log.
Antes de11/12=A revisar imágenes de media/reducida y el cierre completo.
Después checkpoint sin push excluyendo panoramaPosition.ts/test sin conectar.
Si se excluye esa prueba del commit quedan574 unitarias del bloque;575 es la
cuenta del workspace actual. Siguiente: corrección del paisaje para invitado y
pulido compartido, conservando el avance recuperable de los doce escenarios.

**17:29, segunda revisión Sol/Bestiario.** Primera matriz `33022` pasó ocho
casos, pero las imágenes mostraron templos demasiado simples y rocas como
bloques: no se aceptó ese acabado. Sol gana escalinata elevada, jambas de
mosaico y crestería; remate proyectado en y66, dentro de cámara segura, tras
acercar el conjunto. Bestiario sustituye bloques por roca estratificada
irregular y los colmillos lisos por hueso de base articular, punta roma,
mineralización y grietas capilares propias. `89466`:575/5 (incluye una prueba
de centrado panorámico preparada sin conectar); build `46293`, lint `1680`
verdes. Nueva matriz alta/baja de ambos sitios, seguida de dos pruebas del
selector compartido, en sesión `89245`; no editar fuentes ni compilar durante ella.
Quedan media/alta reducida y suite completa antes de validar11/12.
Global preparado sin integrar: panoramaPosition.ts y su test. Centra en
coordenadas del padre para corregir el giro de invitado; aún NO está conectado
en DistantVista ni verificado en navegador. Mantenerlo pendiente.

**17:22, Sol/Bestiario integrados para primera revisión.** Escalinata guardada
en `8ba2671`, sin push. Nuevos IDs solar-court/bestiary-ravine, presentación,
atmósfera y selección automática por facción. Los selectores de Jugar y Ajustes
comparten ahora catálogo: Ajustes solo tenía tres sitios. Dos e2e de persistencia
del selector añadidos; aún sin ejecutar. Se conservan diez estilos de losa:
Sol comparte piedra clara, Bestiario suelo forestal; son doce escenarios.
Ambiente sonoro propio pendiente: reutilizan Duna/Bosque sin cambiar el audio.
Solar: estuco, santuarios gemelos con vano profundo, mosaico y disco tallado.
Bestiario: caliza y costillas continuas afinadas y cerradas, con piedras bajas.
`14908`:574/5, build `18168`, lint `74854` verdes. Primera matriz alta/baja
de Sol seguida de Bestiario en curso, detiene al primer fallo; no editar fuentes
importadas ni compilar durante ella. Revisar imágenes reales antes de aceptar.
No marcar11/12=A y no publicar. Tras revisión: media/reducida y suite completa.

**17:19, Escalinata validada como avance.** `13695` cerrado:78/37 e2e verdes
en6,3min, media/alta reducida ambas resoluciones verdes. Imágenes nativas
revisadas. Reflejo real0→693→0,512px; uno en alta/media, ninguno en baja.
Movimiento de lámparas y quietud reducida comprobados.571/5, build/lint verdes.
Guardar checkpoint local sin push. Falta pulido global: enriquecer arquitectura
y continuidad del río sin perder legibilidad. Siguiente: escenarios propios
Sol y Bestiario, preparados sin importar. No hay navegadores de prueba activos.

**17:16, continuidad sin duplicar verificación.** `13695` sigue ejecutando
suite completa de Escalinata; hasta70 sin fallos. Alta/media/alta reducida ya
verdes; imágenes nativas de media y reducida revisadas en ambas resoluciones.
Sonda de reflejo real de la cúpula0→693→0,512px, también reducida. No editar
aplicación ni compilar hasta finalizar. Aún no marcar #10=A ni hacer commit.
Durante la espera se prepararon SIN importar: SolarCourtArchitecture,
solarCourtGeometry, solarRelief; BestiaryRemains y bestiaryGeometry; pruebas
geométricas de vano solar y cierre de costilla. NO están compilados/probados.
Todo queda en archivos recuperables; excluir esos módulos/tests y cuatro
WebP sol/bestiary del checkpoint de Escalinata. Después integrarlos en sus
propios bloques. Escenarios propios requieren ScenarioId, presentación,
atmósfera, selector de Jugar/Ajustes, resolución de facción y Board3D. Mantener
motor puro, catálogo/mazos sin cambios. Hay un selector antiguo de Ajustes con
solo tres escenarios: unificarlo con el catálogo completo al integrar nuevos.
Se conserva servidor4173 PID38452. Publicación ya verificada, no nuevo push.

**17:11, Escalinata en verificación final.** Sesión activa `13695`: alta con
sonda de reflejo real, media, alta reducida y suite completa encadenadas; se
detiene al primer fallo. Logs `tools/captures/escalinata-final-high-20261022.log`
y `escalinata-full-hardware-20261022.log`. NO editar fuentes importadas,
compilar/lint ni iniciar otro Playwright mientras siga activa. Servidor4173
PID38452 conservado. Matriz corregida `90465`: cuatro verdes alta/baja; imágenes
revisadas. Se rechazó el primer río como panel rectangular y apoyos flotantes:
ahora se desvanece antes de los cantos, terraza y basamentos llegan bajo agua,
mapas de piedra en unidades reales, paleta rosada menos naranja. Unitarias
`6262`:571/5; build `89943`, lint `62086` verdes tras retoque de UV y fuentes.
Antes de #10=A revisar fotos finales/media/reducida y cierre completo.
Publicación solicitada ya cumplida: `a182100`, Pages verificado200 y Actions
success. Jade posterior validado y guardado `08ad9d9`, sin push. No publicar
automáticamente otro bloque. Siguiente: integrar escenarios propios Sol y
Bestiario. Paisajes de ambos preparados y documentados; `solarRelief.ts` es
borrador SIN importar (excluir sus4WebP y módulo del commit de Escalinata).
Después revisión global: distorsión y traslación de DistantVista con invitado,
detalle de materiales/arquitectura, contraste de efectos en escenarios y
composición conjunta. Las50 siguen incompletas, no cerrar automatización aún.

**17:04, Escalinata integrada en primera revisión.** Jade guardado en `08ad9d9`
sin push. Nuevo ghat con siete peldaños hacia río índigo con un reflejo planar,
rueda tallada continua de ocho radios y vanos reales, chhatri de columnas
perfiladas y cúpula curva, lámparas pequeñas flotando por ambos márgenes y
bruma localizada. Ya no hay bump2m, disco de terraza ni gigantescos halos.
Unitarias `55087`:571/5; build `76402` y lint `59512` verdes (un import de
tipo corregido). Matriz alta/baja en curso; no editar aplicación ni compilar.
Sol y Bestiario tienen paisajes originales preparados con procedencia completa,
sin integrar. Excluir sus cuatro WebP del checkpoint de Escalinata.

**17:00, Jade validado como avance local.** `16510`: media/alta reducida en
ambas resoluciones y suite completa78/37 verdes en6,4min. Capturas nativas
de todas las calidades revisadas, mano visible/recogida y poses de foto.
569/5, build/lint verdes. Guardar checkpoint sin push; publicación autorizada
ya cumplida con `a182100`, accesible en Pages. Pendiente pulido global.
Siguiente: Escalinata. GhatArchitecture, GhatLamps, wheelGeometry y su test
preparados SIN importar; excluir del checkpoint, igual que vistas de wheel,
sol y bestiary. Los tres paisajes originales tienen maestro/prompt privados
y WebP públicos preparados, procedencia en arte-escenarios. No hay suites
activas. Servidor4173 PID38452 conservado; no duplicarlo.

**16:52, Jade supera la matriz corregida.** `13649`: cuatro verdes alta/baja
a ambas resoluciones. Imágenes nativas y foto orbital revisadas: aleros ya
visibles, puerta con dovelas, bronce legible y cuatro cartas preservadas.
569/5, build/lint verdes. Media, alta reducida y suite completa en curso:
no editar aplicación importada ni compilar durante ese proceso. La terraza
y el bronce admiten más detalle en el pulido global; no marcar #9 como V.
Escalinata: WebP2048×768428110bytes y baja1024×38498032bytes preparados
sin importar. No incluirlos en el checkpoint de Jade.

**16:50, publicación comprobada.** `a182100` publicado en
https://sefiro888.github.io/magicfable/ . Despliegue `39798109358` con build
y deploy verdes; estado de deployment7255236549 success. Portada y WebP nuevo
de Gremio responden200. Usuario avisado. Se continúa localmente hasta20:00.
Jade:569/5, build/lint verdes. Primera matriz detectó remate1,5px fuera de
cámara segura; pabellón acercado, bronce aclarado y puerta con dovelas/remate.
Segunda matriz en curso. No editar fuentes importadas mientras se captura.
Escalinata tiene panorama original generado con imagegen, maestro copiado a
tools/art-inbox/scenery/wheel-vista-v1.png y prompt al lado, sin integrar.

**16:46, subida y Jade en primera revisión.** El usuario autorizó publicar
el avance jugable; push a main de `a182100` realizado. Incluye los20 commits
anteriores (IA, cartas, combate, interfaz y ocho escenarios), no los borradores
de Jade. Despliegue GitHub Actions `39798109358` aún en cola: no decir que la
web esté actualizada hasta verificar Pages y el nuevo WebP con respuesta200.
Jade integrado después del push: aleros curvos con tejas, soportes dougong,
puerta con hueco circular real, bronce hueco con tres patas, patio y paisaje.
Dos pruebas geométricas nuevas, build/lint en curso. No hay navegador activo.
Falta primera revisión visual; no marcar #9 como validada ni publicar Jade.

**16:44, Gremio validado y publicación solicitada.** `87625`: media y alta
reducida verdes a ambas resoluciones; imágenes nativas revisadas. Suite completa:
78 activas verdes,37 omitidas en6,7min. Unitarias567/5, build/lint verdes.
Engranajes24/12 con transmisión2:1 comprobada, colada en movimiento y estado
estático reducido. Falta pulido global, incluido encuadre superior del horno.
El usuario pide subir este avance para jugar y después continuar hasta20:00.
Excluir las dos vistas WebP de Jade y sus dos módulos de arquitectura sin
integrar del commit/publicación. Siguiente: Jade. No hay suites activas.

**16:32, Gremio en gate final.** Primera imagen demasiado oscura sobre acero:
aclarados albedo y reflejo local, conservando la clave fría. Horno acercado para
que su boca y dovelas entren en encuadre. Matriz `14487`: cuatro verdes con
sonda de transmisión2:1 y colada, quietas con movimiento reducido, e hitos
dentro de cámara segura. Imágenes nativas revisadas. Unitarias `90355`:
567/5; build `76269`, lint `18004`, verdes. Faltan media/alta reducida y suite
completa antes de pasar #8 a A. Jade tiene paisaje original preparado, sin
importar; excluir sus dos WebP del checkpoint. No duplicar procesos.

**16:24, revisión de continuidad.** Gremio ya integrado, todavía sin validar:
horno profundo de ladrillo y dovelas, engranajes24/12 acoplados, colada estrecha,
patio de acero y materiales propios de hierro/bronce. Build `69009` y lint
`33412` completados en verde. Se conservan todos los cambios. Primera matriz
alta/baja en curso; no editar aplicación ni compilar durante sus capturas.
Los tres escenarios siguientes y dos propios continúan pendientes: no afirmar
que las50 estén terminadas. Fecha límite sigue20:00Europe/Madrid.

**14:00, Rompiente validado como avance.** Matriz `47320`: cuatro verdes
alta/baja ambas resoluciones. `74848`: media y alta reducida ambas resoluciones,
regresión Santuario/Fiordo y suite completa78/37 verdes (5,9min). Imágenes
nativas de todas las calidades revisadas: mar oscuro con oleaje irregular,
espuma fina fragmentada y linterna visible. Sonda de mar0→631→0,512px;
Santuario0→14→0 y Fiordo0→234→0. Se comprueba una sola captura planar en
media/alta, ninguna en baja. Unitarias565/5, build `58806`, lint `33636`,
verdes. No confundir con acabado global: roca/faro aún admiten más detalle y
la banda panorámica compartida necesita revisar distorsión e invitado.
Se guarda checkpoint local sin push. Siguiente: integrar Gremio; panorama,
materiales propios de hierro/bronce/ladrillo y auxiliares de horno, engranajes,
patio y colada están preparados sin importar ni compilar todavía. Excluirlos
del checkpoint de costa. No hay suites activas; servidor `55450` conservado.

**13:51, costa aún en revisión, no aceptar la primera captura.** `33681`
pasó cuatro casos pero la imagen mostró agua plana cian, espuma como pista
y arco demasiado extruido. Se añadió malla de oleaje real, normales de varias
escalas con desfase irregular, reflejo roto y crestas finas; espuma ahora de
frentes oblicuos fragmentados, no dos contornos del islote. El arco se erosiona
tras subdividir y suelda normales para evitar facetas de cristal. Faro abierto
para que su linterna sea visible. Dos errores estrictos de tipado al elegir
geometría se corrigieron sin aserciones ni any; build `58806` verde, lint
`33636` verde, unitarias `75582`:565/5. Matriz final `47320` en curso, no
editar fuentes importadas ni compilar. Después media/alta reducida, regresión
Santuario/Fiordo por compartir agua y suite completa. Gremio tiene paisaje
optimizado; todavía sin importar. Servidor `55450` conservado.

**Rompiente integrado para primera revisión.** Claro guardado en `04c11e5`,
sin push. Nueva pizarra de estratos con plataforma que sostiene la diagonal,
arco marino con apertura real y faro próximo de costillas de hueso con linterna
de bronce. Mar de oleaje cruzado y reflejo planar único512/256/0; espuma de
frentes rotos que sigue la costa, responde a eventos ya resueltos y se aquieta
con movimiento reducido. Panorama original conectado; retirados aro blanco,
faro moderno invisible y cono sólido de luz. Losas con bisel físico y relieve
fino. Build `26267` verde; lint detectó mutación de un material fuera de ref,
corregida siguiendo ReflectiveWater, `9293` verde. Unitarias y primera matriz
en curso: todavía no validar #7 ni guardar como acabado. Gremio solo tiene
panorama preparado, excluir sus dos WebP del checkpoint.

**13:37, Claro validado.** `68073`: media y alta reducida a ambas
resoluciones verdes; capturas nativas revisadas. Suite completa78 activas
verdes en6,2min. Hay35 omitidas en esta ejecución porque SCENERY_QUALITY
seguía enhigh y registra dos capturas opcionales en vez de cuatro; ninguna
prueba activa se eliminó. Limpiar variables SCENERY al próximo gate completo.
Unitarias563/5, build `90346`, lint `95290`, verdes. #6 pasa a A, con
pulido global pendiente. Se guarda checkpoint local sin recursos de costa
ni Gremio. Siguiente: integrar Rompiente usando su paisaje, estratos, arco,
faro de hueso, espuma fragmentada y shader de mar ya preparados sin importar.
No hay suites activas. Servidor `55450` conservado.

**13:30, Claro corregido tras revisar imágenes reales.** La primera raíz
de ocho tubos se rechazó por uniones cortadas; sustituida por superficie
implícita continua con contrafuertes y hueco excavado. Copa de hojas lobuladas
instanciadas, helechos desalineados que siguen el suelo y hojarasca plegada.
Luz moteada real mediante máscara original y proyección con oclusión, sin
conos sólidos. Unitarias563/5, build `90346`/lint `95290` verdes. Matriz final
`54581`: cuatro verdes, alta/baja ambas resoluciones, fotografías revisadas;
la sonda confirma viento activo y quieto con movimiento reducido, luz filtrada
solo en media/alta y protagonista dentro de cámara segura. En foto se ve la
copa completa. Media/alta reducida y suite completa en curso; no editar
aplicación ni compilar hasta terminar. Corteza y mantillo aún admiten más
variación de detalle en pulido global. Shore tiene panorama original ya
preparado y geometría sin importar; excluirlos de checkpoint Claro.

**13:15, Claro integrado para primera revisión.** Checkpoint Fiordo
`897d10a` local, sin push. El Claro conecta panorama original, raíz de roble
con hueco real, corteza propia, helechos instanciados y terraza continua de
mantillo. Retirados cilindros, parches rectangulares de musgo y conos sólidos
de luz; clave cálida/relleno frío, bruma fina y polen. Losas con bisel real,
Nexo calizo y luz contenida. Nueva prueba de apoyo de las cuatro esquinas.
Build `62321`/lint `70508` en curso; todavía no revisado en WebGL.

**13:16, Fiordo validado y Claro siguiente.** Regresión `56191`: ocho verdes
en AMD para Ciudadela/Caldera/Santuario/Duna en alta y ambas resoluciones;
capturas nativas revisadas. Santuario mantiene reflejo real 0→14→0,512px.
Con la matriz Fiordo, el gate561/5 y78/37, #5 pasa a A: aún falta cohesión y
detalle final global. Se guarda checkpoint local sin push. Integrar ahora
los seis auxiliares del Claro; su nueva tierra aún necesita build/lint y
revisión. No hay ninguna suite activa. Servidor `55450` sigue en4173.

**13:12, gate completo en GPU verde.** `19671`: 78 activas, 37 omitidas,
seis minutos; unitarias561/5, build/lint verdes. Matriz Fiordo `54987`:
cuatro verdes en45,8s (alta/baja, ambas resoluciones), capturas nativas
revisadas, incluidas poses de foto. Fondo continuo y cartas legibles; los
bancos de nieve y el casco aún admiten más detalle en el pulido global.
Sonda de reflejo 0→234→0,512px. Regresión alta de los cuatro escenarios
anteriores en curso `56191`, sin editar aplicación. El nuevo headless usa
AMD real con trazas completas. Después checkpoint Fiordo/atmósfera/guía y
continuación de Claro. Sus seis borradores y dos WebP se excluyen del checkpoint.

**13:03, suite completa en hardware recién lanzada.** Unitarias561/5,
build `88226`, lint `48311`, verdes. Tres casos críticos en AMD (`62377`)
pasan en32,2s, frente a3,4min del emulador. Sin reducir gráficos ni tiempos;
trazas completas restauradas. Registro recuperable
`tools/captures/fiordo-full-hardware-20261022.log`. No editar aplicación,
compilar ni lanzar otro Playwright mientras siga. Después repetir matriz de
escenarios en AMD, cerrar checkpoint Fiordo/atmósfera/guía y continuar Claro.
Los cinco borradores de Claro siguen sin importar, compilados/lintados, sin
revisión visual; excluirlos del checkpoint. Servidor `55450`, 4173, conservado.

**GPU real confirmada en `62377`: tres verdes en32,2s.** Nexo14,2s frente a
~90s emulados; entrada4,2s frente a~60s; foto12,2s frente a49–57s. Mismos
gráficos, aserciones y tiempos, **grabación completa de trazas restaurada**.
El cuello era headless_shell/SwiftShader. `channel: chromium` usa el Chromium
moderno ya instalado y devuelve AMD Radeon Direct3D11 en esta máquina. No se
han cerrado navegadores del usuario ni instalado controladores. Se mantiene
un worker para equipos/CI sin GPU. Gate final de config en curso; después
suite completa y matriz visual en hardware. Los avances siguen sin push.

**Cuello de botella identificado, no rebajar calidad.** Comparativa `89944`
sin película: tres verdes, pero Nexo1,5min y entrada1min, apenas mejora. Se ha
retirado esa reducción de diagnóstico: vuelve `trace: retain-on-failure` con
película. Proceso inspeccionado: headless_shell imponía **SwiftShader**. El
equipo tiene AMD Radeon; Chromium completo ya estaba instalado. Sonda real
del nuevo headless devuelve **ANGLE AMD Radeon Direct3D11**, no emulación.
La opción `channel: chromium` está documentada en los tipos locales de Playwright
y ya configurada, con un worker y las mismas aserciones/tiempos/calidad.
Sonda de Nexo/entrada/foto recién lanzada en GPU, log
`tools/captures/fiordo-hardware-check-20261022.log`. Cámara registra ahora el
renderer real en sus métricas. Después suite completa y nueva matriz visual.
No editar aplicación ni compilar mientras siga. Servidor `55450` conservado.

**Seis fallidas repetidas en `86621`: seis verdes (4,9 min), mismos tiempos.**
La prueba de foto conserva el coach abierto y ya pasa. Aun con un worker,
Nexo/entrada quedan cerca del límite. Se ha aislado otro coste de diagnóstico:
las trazas filmaban continuamente el lienzo (88 fotogramas en Nexo, 56 en
entrada, hasta302 en foto), forzando lecturas de WebGL. Métricas preservadas
en `tools/captures/fiordo-serial-trace-metrics.json`. Configuración de trace
ahora conserva DOM/pasos/red/fuentes y PNG del fallo, **sin película continua**;
capturas artísticas explícitas intactas. No se cambian gráficos ni aserciones.
Prueba comparativa de Nexo/entrada/foto **`89944` en curso**, log
`tools/captures/fiordo-diagnostics-cost-20261022.log`. Después suite completa
serial. No editar aplicación ni compilar mientras siga.

**Gate de la corrección de guía:** unitarias `88789`, **561 verdes/5 omitidas**;
build `75195`, lint `35969`, verdes. Se conservan las seis pruebas previas de
GuidedTutorial y se añade la nueva: el diff del test es **16 líneas añadidas,
cero borradas**. La primera edición había reemplazado ese archivo por error;
recuperado desde el checkpoint sin perder pruebas. No usar el recuento555 de
la ejecución intermedia como gate válido.

Repetición de las seis fallidas con un worker y trazas activas recién lanzada;
log `tools/captures/fiordo-failed-serial-20261022.log`. No editar aplicación,
compilar ni lanzar otra suite mientras siga. Después suite completa serial.
Sin intervención necesaria; servidor `55450`, puerto4173, conservado.

**12:35, suite `45590` terminada: 72 verdes, 6 fallos, 37 omitidas (15,5 min).**
Trazas preservadas en `tools/captures/fiordo-e2e-failures-v1/`, antes de cualquier
repetición. Se confirma Resaca devuelve y=1 con respuesta4126ms. El módulo de
Jugar llegó en3ms: no hubo descarga fallida; su presentación se retrasó.
Además hay fallo concreto de interfaz: la guía interceptaba el clic del
tablero en modo foto. Corregido: guía suspendida al fotografiar **sin desmontar
su estado**, texto deja pasar clics y solo «Saltar guía» los recibe. Test de
componente verifica recuperar un paso ya avanzado; e2e de foto mantiene la
guía abierta deliberadamente, exige ocultarla/reponerla y comprueba despliegue.

Playwright pasa a **un worker**, sin ampliar tiempos, omitir pruebas ni cambiar
calidad. Gate en curso: unitarias `39726`, build `75195`, lint `58498`.
Después repetir las seis fallidas (`--last-failed`) y suite completa.
No hay navegadores de pruebas activos ahora. Servidor `55450` conservado.

**Suite completa `45590` con fallos, todavía en curso.** No dar Fiordo por
cerrado ni hacer checkpoint final todavía. Fallan flujo Galería→Jugar,
Resaca1920 y repetición de caída del Nexo1920. Trazas revisadas: en Resaca,
la lectura devuelve la posición **correcta y=1**, pero tarda **4126 ms** y
la espera de 5 s caduca por coste total; varias pulsaciones duran 3–6 s.
El Nexo llega al resumen pero la vuelta al mulligan se retrasa. Apunta a
contención de rasterizado con dos contextos WebGL, no cambiar reglas ni
ampliar esperas para ocultarlo. Al acabar, guardar trazas y repetir esos tres
casos con un solo worker, mismos criterios. Revisar también navegación de
galería antes de asumir que sea solo carga. No editar fuentes importadas ni
lanzar otro navegador mientras esta suite continúe.

**22 oct, cierre Fiordo.** Matriz final `10120` cuatro verdes; regresión
`26923` 14 verdes y **todas sus imágenes revisadas**. Media/alta reducida
`12053`: cuatro verdes a ambas resoluciones; registro en
`tools/captures/fiordo-quality-20261022.log`. Unitarias `66698`: 560/5. Build
final `87502`, lint `19658`, verdes, incluidos los borradores sin importar de
Claro. **Suite completa `45590` en curso**, registro recuperable
`tools/captures/fiordo-full-e2e-20261022.log`. No editar fuentes importadas,
compilar ni lanzar otro Playwright mientras siga. Después checkpoint Fiordo
y empezar Claro. El aspecto nativo aún necesita el pulido global comparado;
no afirmar las 50 tareas terminadas.

Preparación Claro: `AncientOak.tsx`, `ancientRootGeometry.ts`, `barkMaterial.ts`,
`fernGeometry.ts` y `FernUnderstory.tsx` **sin importar**, compilados/lintados
pero sin comprobar en WebGL. Excluirlos del checkpoint Fiordo, igual que sus
dos WebP. Panorama optimizado: alta685636 bytes, baja174186 bytes; maestro y
prompt conservados, procedencia en `docs/arte-escenarios.md`. No regenerarlo.
No hay generaciones activas. Servidor `55450`, 4173, conservado; ningún push.

**Regresión de atmósfera `26923` cerrada: 14 verdes.** Ciudadela/Caldera/
Santuario/Duna en alta con modo foto; Claro/Rompiente/Gremio/Jade/Escalinata
en baja a ambas resoluciones. Fondo y niebla reales no nulos. Reflejo del
Santuario conserva **0→12→0 píxeles** tras activar la niebla. Sin errores de
consola. Fiordo final conserva **0→234→0**, RT512; pasada principal 323
llamadas/60880 triángulos (no suma captura). Falta revisar todas las imágenes
de esta regresión. Media/alta reducida Fiordo se ejecutan a continuación;
registro `tools/captures/fiordo-quality-20261022.log`. Después suite completa.
No editar fuentes importadas ni compilar hasta acabar los navegadores.

Claro: añadidos borradores sin importar `fernGeometry.ts` y `FernUnderstory.tsx`,
frondes pinnadas con raquis, foliolos plegados e instancias, viento contenido
a 12 Hz, quieto en baja/reducido. Aún sin compilar ni ver en WebGL. Excluir
del checkpoint Fiordo junto con raíz y corteza. No hay generación activa.

**22 oct, 12:06. Fiordo, matriz final `10120`: cuatro verdes.** Revisadas
imágenes alta/baja, ambas resoluciones, mano visible/recogida y modo foto.
Nieve sin recorte de triángulos también en baja; losas sin sombra ancha pintada.
Gate `66698`: **560 verdes/5 omitidas**, build `15912`, lint `3758`, verdes.
Regresión atmosférica **`26923` en curso**: cuatro escenarios renovados en
alta a 1920 con modo foto y reflejo del Santuario; después los otros cinco
en baja a ambas resoluciones (14 casos en total). Registro recuperable en
`tools/captures/atmosphere-regression-20261022.log`. **No editar fuentes
importadas ni compilar mientras siga.** No lanzar otro Playwright en paralelo.
Después: media y alta reducida Fiordo, suite completa, checkpoint y Claro.
Servidor `55450`, puerto 4173, conservado. Ningún push.

Preparación de Claro durante la regresión: `architecture/ancientRootGeometry.ts`
y `materials/barkMaterial.ts` son borradores **sin importar ni compilar**.
Curvas de raíces con contrafuertes, variación de radio y corteza longitudinal
propia con mapas de color/relieve/rugosidad separados. Excluir del checkpoint
Fiordo. No integrar hasta acabar las verificaciones en curso. El panorama de
Claro está preservado, con prompt y procedencia en `docs/arte-escenarios.md`.

**Fiordo, revisión final en curso.** Matriz `77339`: cuatro verdes, pero las
crestas de nieve mostraban recortes de triángulo. Corregido con alfa por vértice
según altura/pendiente y desvanecido granular; las orillas se estrechan hacia
primer plano. No ocultar el defecto solo aumentando resolución. Gate actual:
unitarias `66698`, build `15912`, lint `3758`. Después repetir matriz Fiordo,
cerrar aspecto y lanzar las regresiones de atmósfera enumeradas abajo.
Unitarias anteriores `17927`: **560 verdes/5 omitidas**. Las dos orillas se
comprueban por raycast con caras superiores visibles en alta y baja.

**22 oct, 12:00. Tercera matriz `55338`: cuatro verdes, pero hielo lateral
rechazado por acabado.** Las seis piezas aisladas seguían pareciendo prismas,
aunque estuvieran volcadas. Sustituidas por **dos orillas continuas** de hielo
roto por presión: superficie transversal elevada, frente irregular, nieve
solo en crestas de pendiente apta y costura sumergida en el lago. Nuevo
`glacierBankGeometry.ts`, menor número de objetos y topología escalada por
calidad. La sonda de reflejo altera ahora una orilla; los hitos salen de sus
coordenadas reales. Build `69227` y lint `25127` verdes. Unitarias `17927` en
curso, añaden comprobación de caras superiores en ambas orillas/ambas calidades.
Después repetir matriz antes de aceptar #5. No hay navegadores activos ahora.
Fuentes importadas libres hasta arrancar esa matriz. Servidor `55450` conservado.

**22 oct, 11:58. Segunda matriz Fiordo `89595`: cuatro verdes.** Fondo real
`17232e`, estable en modo foto; reflejo probado **0→145→0 píxeles**. Alta:
334 llamadas/50894 triángulos en pasada principal, sin sumar captura planar.
Imágenes revisadas: queda demasiado uniforme la nieve y demasiado vertical
la alineación de hielo. No subir #5 a A todavía. Ajuste posterior ya escrito:
escarcha de ruido periódico multiescala (sin ondas sinusoidales visibles),
bloques volcados de tamaños distintos, estratos más finos, textura granular
de nieve y sombra de contacto para el casco. Nuevos hitos proyectados desde
la transformación real de los bloques. Sonda preparada para los diez escenarios
y ahora exige también niebla real no nula. **Gate actual**: unitarias `4272`,
build `22214`, lint `7771`, en curso; después nueva matriz Fiordo.

Regresión obligatoria pendiente antes de guardar: Ciudadela/Caldera/Santuario/
Duna en alta, con dos poses de foto y reflejo del Santuario; los otros cinco
escenarios en baja a ambas resoluciones para comprobar la niebla recién activa.
Después media/alta reducida Fiordo y suite completa. No hay WebGL en ejecución
ahora. Servidor `55450` conservado, puerto 4173. Ningún push.

**22 oct, 11:55. Primera matriz Fiordo `51482`, cuatro fallos útiles:** fondo
real null en las cuatro variantes. No se han validado estas capturas. Causa
encontrada: todos los escenarios adjuntaban color/niebla al Group que rota para
el invitado, no a Scene. No era una limpieza del fallback. La primera hipótesis
se ha retirado. `ScenarioAtmosphere.tsx` centraliza perfiles y se monta como
hijo directo de Scene; retirados los veinte attach locales ineficaces. Esto
activa también la niebla prevista, así que revisar **los diez escenarios**.
Sonda exige fondo no nulo y estable al girar, sin relajar la comprobación.

Fiordo ajustado tras la imagen fallida: menos contorno de celdas en el hielo,
fisuras finas discontinuas, escarcha interrumpida por viento en vez de marco
blanco continuo, fracturas laterales sin escalones de caja y mapa estratificado,
barco más visible y madera aclarada. Build `68301`, lint `77742` en curso.
Unitarias anteriores `59587`: **559 verdes/5 omitidas**, incluido apoyo de la
diagonal y nieve fuera del tablero. Servidor `55450`, puerto 4173, conservado.

Claro preparado mientras se verificaba Fiordo: nuevo paisaje original visto
y copiado a `tools/art-inbox/scenery/grove-vista-v1.png`, prompt junto a él.
Original `exec-f51c32ad-438f-4a77-b55f-a8f6ccef853c.png` en la carpeta imagegen
del chat. **Sin optimizar ni integrar**, no regenerarlo. Sin generaciones activas.

**22 oct, 11:48. Checkpoint Duna `b44c165`, sin push. Fiordo integrado.**
Placa irregular con nieve solo en la orla, fracturas laterales de hielo,
barco abierto de tracas/costillas/proas con madera propia y paisaje original.
ReflectiveWater admite superficie congelada sin ondas: textura de datos de
fisuras/escarcha/aire, captura única512/256 en alta/media y baja sin captura.
El lago exterior usa material congelado mate y no crea otra captura.
Casillas de hielo biseladas y punto del Nexo contenido, piedra de granito.

El fallback de carga ya usa una cúpula temporal en vez de adjuntar otro
scene.background: su desmontaje podía restaurar null después del color del
escenario. Hipótesis implementada, **todavía por comprobar en WebGL**. Las
sondas miden color real de fondo y lo exigen estable tras dos poses de foto.
Build `77896`, lint `36343`, unitarias `59587` en curso. Después matriz Fiordo,
ajustes y regresión Ciudadela/Caldera/Santuario/Duna (fondo/reflejo de agua).
No hay navegadores de prueba activos ahora. Servidor `55450` en 4173.

**22 oct, 11:43. Duna verificada.** Gate 558 unitarias/5 omitidas, build y
lint verdes; suite completa `68781`: **78/37**. Matriz alta/baja `23402`:
cuatro verdes, imágenes revisadas; alta reducida `69727`: dos verdes;
media `53662`: dos verdes, ambas resoluciones, mano visible/recogida. #4 pasa
a A, pendiente de cohesión global y del fondo al abrir mucho el modo foto.
Pasada principal: alta 367 llamadas/97916 triángulos; baja 196/49300.

Siguiente: Fiordo. Los borradores citados abajo siguen sin importar y se
excluyen del checkpoint Duna. Integrar superficie congelada con captura única,
placa que apoya esquinas, borde nevado, fracturas laterales y barco varado.
Antes del siguiente gate, resolver/medir el fondo negro causado posiblemente
por el color del fallback de Suspense. Servidor `55450` en 4173 conservado.
No hay verificaciones ni generaciones activas; ningún push.

**22 oct, 11:40. Suite Duna cerrada:** `68781`, **78 verdes/37 omitidas**.
Unitarias 558/5 y build/lint verdes sin cambios posteriores en aplicación.
Revisión alta con movimiento reducido **`69727` en curso**, ambas resoluciones.
No editar fuentes importadas. Después comprobar media, guardar checkpoint Duna
y pasar a integrar Fiordo. Los borradores de Fiordo siguen sin importar.

**22 oct, 11:34. Reanudado tras disponibilidad de cuota.** La segunda matriz
Duna `23402` terminó y dejó `test-results/.last-run.json` en passed; capturas
de alta/baja a ambas resoluciones hasta las 08:53, ya revisadas. Las casillas
son piedra de relieve discreto, no arena ondulada. Unitarias `12256`: 558/5;
build `96154`, lint `26442`, verdes. Suite completa **`68781` en curso**;
no editar fuentes importadas ni compilar. El servidor anterior dejó de existir
durante la interrupción; comprobado puerto libre y procesos. Nuevo servidor
propio **`55450`**, mismo puerto 4173. No duplicarlo ni cerrarlo.

Preparación de Fiordo sin integrar: paisaje original `fimbul-vista-v1.png`
copiado al workspace, prompt junto al maestro, WebP alta/baja exportados.
`iceField.ts` y `floeGeometry.ts` son borradores sin importar ni compilar:
datos de fisuras/escarcha/aire y placa irregular que sostiene las esquinas,
nieve solo en la orla. No incluirlos en el checkpoint de Duna. Primero acabar
suite, revisión media/reducida y checkpoint Duna; después integrarlos.
Otros borradores sin importar: `FrozenLongship.tsx`, casco abierto de tracas,
costillas y proas talladas, `GlacierFlanks.tsx` y `frozenIceShader.ts`. Sin
compilar/revisar aún. La superficie congelada debe usar una sola captura,
sin ondas, y escarcha que atenúe el reflejo. No duplicar el lago por losa.

Hallazgo de pulido compartido: en la foto orbital de Duna se ve negro más allá
de la banda de pintura. Comprobar `scene.background` real tras Suspense y la
limpieza del fallback; la foto principal queda cubierta y no lo revela.
Posible respaldo de color en otra cúpula dentro de DistantVista, todavía sin
implementar. Revisar los cuatro escenarios si se modifica ese componente.

**22 oct, 08:49. Duna en integración.** Pilono en talud con gola cóncava,
relieves propios sin emisión, seis columnas papiriformes de fustes en haces,
obeliscos, lino tejido y patio rectangular con escalinata hacia la cota baja.
Arena con relieve y máscara independiente, panorama original ya conectado.
Build `1972` y lint `73736`, verdes. Matriz visual `85072` en curso: no editar
fuentes importadas. Primera imagen muestra demasiado relieve en las casillas
de arena: corregir tras esta matriz, antes del gate. #4 sigue C, sin validar.
Servidor 4173 conservado, ningún push.

**22 oct, 08:36. Santuario verificado.** Suite completa `72743`: **78 verdes,
37 omitidas**. Unitarias `2678`: **558 verdes/5 omitidas**. Build final `82911`,
lint final `56795`, verdes, incluidos los dos borradores sin importar de Duna.
Matriz `29860` cuatro verdes (alta/baja), `77437` dos verdes (media), `16746`
dos verdes (alta con movimiento reducido). Ambas resoluciones, mano visible/
recogida y dos poses amplias de foto. Reflejo real probado: **0→12→0 píxeles**
al cambiar/restaurar una piedra; ondas en tiempo cero con movimiento reducido.
Comprobación explícita final de baja sin RT a 1366: `42372`, una verde;
fuente de juego sin cambios, solo nuevas aserciones de calidad. #3 pasa a A: falta pulido
global, no afirmar las 50 terminadas. Agua/reflejos siguen C por otros escenarios.

**Siguiente acción: Duna.** Sin verificaciones ni generaciones en curso. Panorama original
ya preparado y documentado en `docs/arte-escenarios.md`, no regenerarlo.
`architecture/egyptianGeometry.ts` y `architecture/DesertGround.tsx` son
borradores **sin importar**, compilados/lintados pero sin revisar en WebGL.
Excluirlos del checkpoint de Santuario. Empezar por terreno y patio posterior
excavado, después pilono en talud/gola y columnas papiriformes. El patio actual
circular vuelve a dejar esquinas sin apoyo; esfinges de cajas/columnas lisas,
oro emisivo y altas puntas fuera de cámara deben reemplazarse. Mantener la
identidad luminosa/solemne del dosier y el centro despejado. Servidor 4173 en
sesión `35243` conservado; ningún push.

Posible pulido global, todavía **no probado**: comparar el cinturón esférico
de paisajes con un cinturón cilíndrico que conserve rectas las verticales de
las pinturas al orbitar. La repetición reflejada actual no equivale a una
pintura única de 360°. No cambiar los tres escenarios sin revisar sus matrices.

**22 oct, 08:32.** Suite completa `72743` terminada: **78 verdes/37 omitidas**,
sin fallos. Unitarias 558/5, build `92859`, lint `85916` verdes. Fuentes de
aplicación sin cambios desde la matriz visual `29860`. Se ampliaron solo las
sondas opcionales de escenarios: verifican RT512/256/0 y tiempo de ondas
cero con movimiento reducido, además de restauración tras la prueba de color.
Revisión de calidad media en curso; después alta reducida. No compilar aún.
Los borradores nuevos de Duna siguen sin importar; al acabar las capturas,
compilarlos/lintarlos pero excluirlos del checkpoint de Santuario.

**22 oct, 08:24.** Matriz final Santuario `29860`: **cuatro verdes**, imágenes
revisadas a ambas resoluciones, alta/baja y mano visible/recogida, dos poses de
foto. Sonda planar **0→12 píxeles** al alterar una piedra; restauración correcta.
La pasada principal de alta registra 299 llamadas/106520 triángulos; baja,
165/57990. Son métricas de la pasada principal, no suman la captura de reflejo.
Suite completa **`72743` en curso**, sin fallos hasta ahora. No editar fuentes
importadas ni compilar mientras siga. Unitarias 558/5, build/lint verdes antes
de esta suite. Después: comprobar media y movimiento reducido alto, guardar
checkpoint local y seguir con Duna. Pulido global de roca/agua/pintura pendiente.

Preparación de Duna, **sin integrar**: leído dosier `docs/FACCION_DUNA.md` y
fuentes. Panorama original generado con imagegen, sin referencias externas,
revisado como imperio funerario luminoso/solemne, arenisca y lapislázuli,
mediodía y arena abierta; maestro copiado en
`tools/art-inbox/scenery/duna-vista-v1.png`, prompt junto a él. Original:
`C:/Users/sefir/.codex/generated_images/01a15f74-4873-70a2-aef0-32c6e37aa3d4/exec-f978b26a-2df2-4fe1-8abb-fb77ac1b1b93.png`.
No regenerarlo. Borrador `architecture/egyptianGeometry.ts` (pilono en talud,
gola cóncava y capitel papiriforme) sin importar; no compilado ni revisado aún.
Otro borrador sin importar: `architecture/DesertGround.tsx`, arena con mapas
propios/grano/crestas, UV independiente de máscara y patio posterior excavado
para alojar el pilono (altura exportada para apoyar la arquitectura). Tampoco
compilado ni revisado en WebGL. Excluir ambos del checkpoint de Santuario.
Evitar esfinges de cajas, patio circular
sin apoyo en esquinas, oro emisivo y limitarse al muro bajo: el pilono puede
ser monumental en un patio inferior, como se resolvió en Ciudadela/Santuario.
No hay generaciones activas; servidor 4173 conservado.

**22 oct, 08:20.** Reparaciones de tipado/lint resueltas. `2678`: **558
verdes/5 omitidas**, incluye apoyo de las cuatro esquinas de isla. Build
`92859`, lint `85916`, verdes. Matriz final **`29860` en curso**, no editar
fuentes importadas. Granito ahora tiene mapas propios de microcristal,
rugosidad y fractura; perfil de monolitos más erosionado, deriva lateral y
coronación irregular. Los grabados comparten perfil, no flotan. El agua añade
crestas tenues y limita captura alta/media a 24/12 Hz, 512/256 px; baja sin RT.
Matriz anterior `11188` cuatro verdes, sonda de reflejo **0→16 píxeles** con
cambio real de material, restaurado al terminar. Sin generaciones activas.
Después de revisar imágenes finales: suite completa y checkpoint local.

**22 oct, 08:17. Santuario integrado, todavía sin gate cerrado.** Primer
reflejo/GLSL `52279` sin errores; arquitectura completa `58806` cuatro verdes.
Capturas revelaron piedra cercana demasiado regular y agua demasiado plana.
En la siguiente versión: coronación erosionada, variación de perfil, dintel
partido en dos masas con junta real, andén con pavimento periférico, grabado
adaptado a la cara del granito y reflexión más legible. El dolmen está en
cota inferior y entra entero desde cámara real; baja no crea render target.

Matriz **`11188` en curso**, incluye sonda de reflejo real: se cambia
provisionalmente el material de una piedra y se exige cambio de píxeles de
la captura planar; se restaura al terminar. No editar fuentes importadas ni
compilar durante esta prueba. Build `34344` detectó ensanchamiento de tuplas
en PAVING: reconstruir el array con objetos contextualmente tipados como
StoneBlock, sin cast doble. Lint `96184`: quitar inicialización inútil de
`after` en reflectionProbe. Son reparaciones pendientes para DESPUÉS de la
matriz; no afirmar gate verde. Unitarias/build/lint y suite completa pendientes.
Panorama original ya optimizado: 1916×821 WebP90 240462 bytes y 1024×439
WebP86 64640 bytes. No hay generaciones activas. Servidor 4173 conservado.

**22 oct, 08:02. Bloque Caldera verificado.** Suite completa `28204`:
**78 verdes/37 omitidas**, sin fallos. Unitarias `41316`: **557/5**; build
final `6576`, lint final `51603`, verdes, incluidos los dos borradores sin
importar. Matriz visual final `91240` cuatro verdes y capturas revisadas a
1920×1080/1366×768, alta/baja, mano visible/oculta y dos poses de modo foto.
#1 y #20 pasan a **A**, avance validado pendiente de pulido global: no dar
por acabadas las 50. Metal/humo siguen C porque faltan otros escenarios.
Guardar checkpoint local de Caldera, sin publicar ni hacer push.

**Siguiente acción:** renovar Santuario. Leer `RunicSanctuary.tsx`; evitar el
lago plano de radio 46 que taparía el nuevo paisaje, dolmen alto fuera de
cámara y monolitos de caja. Panorámica original ya preparada (véase debajo y
`docs/arte-escenarios.md`), no regenerarla. Dos archivos sin importar:
`materials/ReflectiveWater.tsx` y `architecture/megalithGeometry.ts` quedaron
compilados/lintados, **no verificados en WebGL**. Excluirlos del checkpoint
actual. Integrar y probar primero el reflejo/GLSL real; si funciona, renovar
piedra, grabados, dolmen protagonista, isla/agua/niebla y cámara. Mantener baja
sin pasada de reflejo, alta/media con una sola captura compartida. No afirmar
que #19/25 estén hechas hasta verlo. Sin verificaciones ni generaciones en
curso; servidor propio 4173 en sesión `35243` conservado.

**22 oct, 07:54.** Matriz final de Caldera `91240`: **cuatro verdes**,
imágenes reales revisadas a ambas resoluciones, alta/baja, mano visible/oculta
y dos poses de foto. GLSL sin errores. Basalto cercano con fractura fina,
prismas asimétricos con juntas/cortes y Nexo menos lavado por luz local.
Dos pruebas geométricas nuevas detectan esquinas sin apoyo, caras invertidas,
hueco tapado y cuerno vertical. Gate `41316`: **557 verdes/5 omitidas**;
build `69230`, lint `31056`, verdes. Batería e2e completa **`28204` en curso**,
no editar fuentes importadas ni compilar hasta terminar. Último estado sin fallos.
Registro de coste: alta 1920, 266 llamadas/66992 triángulos; baja 1366,
134/35322. Revisar luego pulido global de roca cercana frente a pintura;
la panorámica reflejada no es una pintura única de 360 grados.

Preparación del siguiente bloque, **sin integrar**: panorama original de
Santuario generado con imagegen y copiado a
`tools/art-inbox/scenery/sanctuary-vista-v1.png`; prompt junto a él. Original
`C:/Users/sefir/.codex/generated_images/01a15f74-4873-70a2-aef0-32c6e37aa3d4/exec-56c310d6-f1a6-42f9-abb9-c57d1b910389.png`.
Revisado como lago nocturno/ruinas/niebla, sin referencia de terceros.
`src/battle/materials/ReflectiveWater.tsx` es otro **borrador sin importar**:
reflejo planar único con resolución/frecuencia según calidad y liberación de
recursos; baja sin pasada adicional. No está compilado ni validado en WebGL.
Excluirlo del checkpoint de Caldera y verificar antes de usarlo. No afirmar
que #19/25 estén implementadas. Otro borrador sin importar:
`architecture/megalithGeometry.ts`, granito biselado/roto con base húmeda y
variación de coronación. Ambos quedan fuera del checkpoint de Caldera. Servidor 4173 conservado. Sin generaciones activas.

**22 oct, 07:43.** Caldera integrada, todavía en revisión artística. Meseta
volcánica que sostiene las esquinas, estratos hasta debajo de la lava, prismas
instanciados, yunque continuo con cuerno horizontal/hueco real, herramientas,
metal y humo por capas. Panorámica original preparada ya optimizada en WebP
alto/bajo; procedencia en `docs/arte-escenarios.md`.
Build `73181` y lint `75869` verdes en la primera integración. Matriz `56574`:
cuatro verdes y GLSL real sin errores, pero la imagen reveló lava demasiado
extensa/luminosa y prismas regulares. No aceptarla como acabado final.
Segunda revisión `5201` en ejecución: colada limitada/desvanecida al paisaje,
canales más estrechos/oscuros, basalto con cantos fracturados y menor altura,
metal sin mapa de color que lo volvía negro; corregido sentido exterior de
triángulos de la meseta. Losas de basalto con bisel físico y junta estrecha,
normal suave sin abombamiento. No editar fuentes importadas durante la sonda.
Después revisar capturas y repetir gate final; no hay procesos de generación.
Servidor propio 4173 conservado. Ningún push.

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

## Archivo de los primeros bloques (ya completados)

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
