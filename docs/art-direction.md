# Dirección artística — Crónicas del Nexo

## Propósito visual

Los cinco emblemas de relieve nuevos (Forja, Marea, Bestiario, Plaga y Quinto
Sol) completan los huecos de la interfaz. Procedencia y conservación de los
originales: [arte de interfaz](arte-interfaz.md). Mantener sus siluetas enteras.

`Crónicas del Nexo` combina fantasía oscura elegante, materiales antiguos y magia de alto contraste. La carta es siempre la miniatura, la interfaz y la pieza de juego: el tablero, los efectos y el entorno deben enmarcarla, nunca competir con ella. La imagen debe poder leerse en tres escalas: una masa cromática inequívoca en mano, una escena reconocible sobre el tablero y una narración rica al inspeccionarla.

Las ilustraciones provisionales son vectores originales de 800 × 560. No contienen texto ni marcos y se pueden sustituir individualmente por arte final WebP manteniendo el mismo identificador.

## Dirección de atelier

Cada carta debe sentirse como una pieza comisionada a un pequeño equipo, no como una plantilla repetida. El crédito visible puede incluir dos artistas ficticios y un taller de especialidad: dirección de criatura, color script, composición, acabado pictórico o iluminación. La intención no es imitar artistas reales vivos, sino dar variedad de oficio dentro de una biblia visual común.

Los respaldos SVG de prototipo siguen esta lógica:

- Furia alterna mural épico, óleo heroico, pintura ritual íntima, paisaje cataclísmico y perspectiva baja.
- Arcano alterna acuarela lumínica, retrato simbolista, arquitectura fría, geometría cósmica y criatura mineral.
- Las cartas míticas y comandantes reciben composición más central, más halo y lectura de escala.
- Las cartas comunes mantienen silueta rápida, pero con mejor luz, grano, profundidad y formas menos infantiles.

## Lenguaje de facción

| Facción | Base | Luz mágica | Sombra | Forma y material | Estado en este slice |
| --- | --- | --- | --- | --- | --- |
| Furia | `#9f261f` | `#ffb13b`, `#fff0a0` | `#120a0e` | diagonales, grietas, hierro quemado, basalto | jugable |
| Arcano | `#245aa8` | `#78e9f5`, `#d9ffff` | `#071321` | círculos, prismas, cristal, agua y hielo | jugable |
| Naturaleza | `#337a47` | `#a8dc65` | `#102018` | espirales, raíces, madera y jade | preparada, bloqueada |
| Orden | `#d6c9a2` | `#f2cf71` | `#353128` | simetría, arcos, mármol y latón | preparada, bloqueada |
| Sombra | `#241b2f` | `#8754ad` | `#070609` | velos, puntas, obsidiana y humo | preparada, bloqueada |
| Vacío | `#6435a1` | `#cb79ff` | `#100821` | elipses rotas, portales y vidrio iridiscente | preparada, bloqueada |

El oro envejecido de interfaz usa `#b99754`; el pergamino frío, `#d8ccb2`; la piedra de fondo, `#0c1015`. El blanco puro se reserva para el punto de máxima emisión mágica.

## Escenarios 3D

### Horizonte compartido

Las pinturas distantes usan una banda cilíndrica abierta centrada en la
posición mundial de cámara, sin acompañar su giro. La esfera anterior curvaba
las columnas; la banda conserva generatrices verticales y pierde ambos
extremos dentro de la imagen. La costura reflejada y el desvanecido evitan
cantos al orbitar. La cámara del invitado gira las piezas, no el decorado.

La banda pasa de 12.096 a 256 triángulos. En la misma captura de Ciudadela alta
a 1366 × 768, la escena pasa de 301.666 a 289.826 con 365 llamadas y 44 texturas:
reduce geometría sin añadir luces, capturas ni mapas. Son recuentos del
renderizador, no una medición de FPS. Alta y baja conservan la composición.

### Duna: Tribunal luminoso de arenisca

Imperio funerario intacto, solemne y vivo según el dosier. El pilono conserva
talud y gola cóncava reales en un patio posterior excavado; la terraza alta
sostiene la diagonal completa del tablero. Las columnas tienen fustes en
haces, capiteles papiriformes y ábacos, con filetes de lapislázuli y oro viejo
contenido. El lino cuelga de travesaños y se mueve por pliegues, con pose
estática cuando se pide movimiento reducido. Los relieves originales de sol,
balanza y papiro siguen la cara inclinada y reciben luz, sin emisión.

Mediodía con sombras cortas, relleno frío y arenisca mate con microporo.
Reservar las crestas de arena para el exterior; en las casillas parecían
madera abombada. El centro conserva juntas estrechas, bisel físico y bandos
distinguibles. Evitar esfinges de cajas, columnas griegas recoloreadas, oro
luminoso y necrópolis nocturna embrujada. Panorama original y prompt en
[arte de escenarios](arte-escenarios.md). Pendiente pulido global comparado.

### Ciudadela y piedra del campo

La Ciudadela se compone desde la cámara de batalla: una plaza elevada con
basílica en un patio inferior, pórticos laterales y ciudad distante vista a
través de los arcos. Los edificios conservan apoyos reales y cotas distintas.
El mármol usa vetas finas, poro y rugosidad separados; las dovelas, columnas
acanaladas y molduras tienen geometría. Los frisos azul egeo y púrpura rompen
el blanco, acompañados por lino plegado y bordado propio. Evitar pilares de
caja lisos, enormes bandas de oro emisivo y estandartes que giran como cartón.

La luz cálida frontal conserva volumen sobre la fachada; el relleno es frío.
El Nexo de este lugar recibe un punto de energía contenido, que deja ver la
caliza. Las losas tienen bisel real y una junta estrecha: no volver a pintar
una sombra ancha que abombe cada cuadrado. La evolución del sol consume
eventos de turno resueltos y respeta movimiento reducido. Las nubes distantes
se hornean una vez; los bancos cercanos se desplazan con discreción.
La vista distante incorpora una panorámica original en una banda de cúpula,
con orientación mundial y transición al cielo. Evitar planos que revelen
un borde de cartel al orbitar. Maestro, versiones optimizadas y prompt:
[arte de escenarios](arte-escenarios.md).

### Caldera: garganta volcánica

Basalto frío gris carbón con caras fracturadas, masa geológica por debajo del
magma y canales estrechos de lava entre costras oscuras. La colada cercana
se desvanece hacia la garganta distante: no llenar el encuadre con un disco
plano luminoso. Evitar vigas radiales, zunchos industriales y lavados naranja.
Las formaciones de columnas tienen juntas, roturas y alturas asimétricas;
los elementos cercanos preservan el centro de juego. El yunque es una masa
continua de cintura curvada, mesa con hueco real y cuerno horizontal; la pieza
al rojo y la herramienta apoyada se leen desde la cámara de batalla. Hierro
con reflejo contenido, sin emisión general ni mapa de color que lo haga negro.

La clave cálida contrasta con relleno frío. Vapor en capas con profundidad,
brasa escasa y quietud real con movimiento reducido. Los Nexos mantienen
la distinción ámbar/azul en cristal y retrato; la roca conserva su material.
Las losas de basalto reciben bisel físico, junta estrecha y normales sin el
antiguo abombamiento. Panorámica original y prompt documentados en
[arte de escenarios](arte-escenarios.md). Pendiente pulido global comparado.

### Santuario: granito, lago y grabado

Granito frío, mineral y mate; evitar caras lisas de caja y emisivos sobre el
bloque entero. Las piedras tienen coronación rota, perfiles erosionados,
base húmeda y líquenes discretos. El grabado es fino, con máscara y surco
independientes, adaptado a la cara. El dintel está partido en dos masas que
siguen apoyadas en los pilares. El dolmen nace en una cota inferior: su remate
entra completo en la cámara de batalla y se conserva la escala monumental.
La isla tiene costa de esquinas cortadas, pavimento irregular y escaleras
hacia el lago. Carta y estados siguen dominando el centro.

Agua nocturna de ondas finas, Fresnel y reflejo planar único para toda la
superficie; alta/media con captura limitada, baja sin render adicional.
La piedra reflejada debe responder a cambios de la escena. Probar reflejo,
órbita y liberación de recursos, no aceptar un mapa fijo como reflejo.
Bruma por planos de profundidad, luces frías pequeñas en cuencos de piedra
y pocas partículas. Evitar conos blancos y rectángulos luminosos de portal.
Arte distante original y prompt en [arte de escenarios](arte-escenarios.md).
Pendiente pulido global de cohesión entre geometría y pintura.

## Marco de carta

### Preparación de la batalla

El mulligan presenta el lugar y a ambos comandantes en una misma composición:
retratos originales sin espejar, emblemas de facción, nombres y títulos sobre
una vitrina oscura. El recorte conserva los rostros; la ornamentación deja
espacio al arte y a las diez decisiones de mano. La presentación no añade
esperas ni una pantalla que deba saltarse. En móvil se condensan los retratos
y las diez cartas se distribuyen en columnas legibles con desplazamiento vertical cuando hace falta. Movimiento reducido conserva
la composición sin acercamiento; teclado y foco pertenecen al diálogo hasta
confirmar la mano.

La mano de batalla conserva el abanico en escritorio. En móvil, las diez
cartas usan un carril horizontal propio: gesto lateral para consultar, hacia
el tablero para arrastrar. Las cartas quedan rectas en ese carril para que
el recorte no esconda sus nombres al enfocar; la seleccionada se superpone.
El foco puede recorrer los dos extremos sin desplazar el resto de la interfaz.

### Inspección y presencia

- La inspección prioriza el original `art-full`, sin recortar ni ampliar por
  encima de su composición. Alternar con la carta completa conserva reglas
  y estados. El respaldo debe llegar hasta el SVG en importaciones antiguas.
- Vitrina oscura, filetes finos y esquinas contenidas; el acento procede de
  la facción real, también en las diez facciones añadidas después del set base.
- Las únicas incorporan crestería biselada y gemas pequeñas de facción.
  La ornamentación no crece sobre el centro del arte ni cambia la casilla.
- La invocación reserva primero un breve tiempo al sello. Peso, crecimiento,
  velo y oleaje comparten un asentamiento preciso y discreto. Los zócalos
  permanecen en el suelo; con movimiento reducido las piezas aparecen listas.

### Acabado de las piezas 3D (renovación de octubre de 2026)

El combate conserva carta, víctima y facción en los eventos ya resueltos:
los impactos compartidos no sirven para adivinar materiales. Los tiradores
se afianzan en su casilla, mientras el cuerpo a cuerpo mantiene embestida.
Ocho familias de estela: ascuas, cristal, tendril, luz, velo, arena, agua y
metal. Su sección se estrecha en filamentos; evitar barras opacas y aditivos
que vuelvan blancas todas las facciones en escenarios claros. Un destello
de impacto concentra la luz al principio y deja leer después la ilustración.
Fragmentos instanciados según material de la víctima, sin gore. Las colas de
presentación no cancelan el desvanecido ni la limpieza del efecto anterior.

- Metal envejecido con bisel real, remaches geométricos y rugosidad irregular.
  Los filetes usan metalness 0,6 con un entorno de tres paneles de luz propios,
  capturado una sola vez y sin HDR externo. Piedra y papel permanecen en 0,04.
  Sin ese entorno no subir metalness: el metal se vuelve negro.
- El marco recibe luz del escenario; el arte conserva su componente emisiva
  para no perder identidad en escenarios oscuros. No teñir toda la ilustración.
- Daño: muescas y fractura localizada; escarcha: crecimiento irregular desde
  el borde; contagio: venas orgánicas. El centro narrativo permanece abierto.
- Escudos con Fresnel, borde luminoso y superficie segmentada casi transparente
  en el centro. Con movimiento reducido no se anima el barrido de luz.
- La sombra de contacto pertenece al suelo y se suaviza al elevar la carta.
  Nunca rota con el estado de agotada ni salta con la embestida.
- Las filas densas priorizan ataque y vida; nombre al señalar, seleccionar o
  apuntar, con una placa oscura que mantiene contraste sobre cualquier fondo.
- Compartir geometrías y texturas entre piezas. La decoración del marco se
  fusiona en una geometría para no multiplicar draw calls por remache.
- Las estructuras se asientan en un zócalo octogonal de piedra con orla
  metálica biselada. Se queda sobre el suelo al elevar la carta seleccionada.

### Invocaciones

El sello aparece trazado por capas sobre la losa y levanta motas pequeñas.
La geometría central distingue familias (prismas, simetría, crecimiento,
torsión, discontinuidad, dientes de forja) y el tono procede de la facción.
Las 16 variantes se comparan a escala real, además de comprobarlas dentro
de la batalla. No tapar la ilustración con columnas opacas ni iluminar todo
el tablero de blanco: la luz local acompaña el trazado y se desvanece.
Director y render usan la misma duración al cambiar velocidad.

### Integridad del Nexo

Las fisuras siguen los tres cuerpos del pedestal. Son oscuras al principio y
dejan ver energía cálida al aproximarse al colapso; el color del dueño permanece
en sus cristales y en la identidad del comandante. Los cristales pierden energía
y alineación con el desgaste. La curación repara la representación usando la
Vida máxima del comandante, sin guardar un segundo estado visual de salud.

- Silueta vertical original con esquinas biseladas, borde exterior de piedra oscura y filete interior de metal envejecido.
- Banda de nombre horizontal y estable. La facción se expresa en el filete, el cristal de coste y una filigrana secundaria; nunca mediante un baño de color que reduzca la legibilidad del arte.
- El arte ocupa aproximadamente el 48 % superior. La ventana tiene un arco muy leve y un corte inferior recto para no recordar marcos comerciales concretos.
- Común: un remache; infrecuente: dos incisiones; rara: tres piezas de metal; mítica: halo fino animado. La rareza no cambia el tamaño de la información.
- Ataque, vida o resistencia se presentan en medallones separados del coste. La forma es angular para Furia y facetada/circular para Arcano.
- La selección añade contorno exterior y elevación. Los estados se dibujan fuera de la caja de reglas o en una tira compacta, sin cubrir nombre, coste ni estadísticas.

## Iconos

Los iconos se construyen en una retícula de 24 unidades, con trazo aparente de 1.75–2 unidades y un área respirable mínima de 2 unidades.

- Furia: una grieta triangular que rodea una brasa central; no es una llama genérica.
- Arcano: una lente hexagonal cruzada por una órbita incompleta.
- Naturaleza: tres nervaduras que nacen de una semilla.
- Orden: un arco cerrado por una barra de horizonte.
- Sombra: un eclipse mordido por dos agujas.
- Vacío: dos umbrales desalineados.
- Rareza: remache, doble incisión, tríada o corona radial; siempre distinguible sin color.
- Estados: hielo = facetas y candado; abrasado = grieta ondulante; agotado = icono inclinado 35° y menor luminancia.

No se usan letras dentro de iconos. Todos deben conservar su significado en monocromo y con deuteranopia.

## Luz y atmósfera

Cada escena emplea tres estratos: fondo oscuro con silueta legible, luz de facción sobre el sujeto y un acento cálido o frío de contraste. Furia ilumina desde abajo o desde grietas internas; Arcano ilumina lateralmente y desde núcleos de cristal. La niebla debe separar planos, no ocultar la silueta. Se permiten bloom y partículas, pero ningún punto secundario debe superar en luminancia el rostro, núcleo u objeto narrativo principal.

En el tablero, los efectos duran normalmente 180–480 ms. Un efecto persistente respira con baja amplitud y no atraviesa la caja de texto. Con movimiento reducido se eliminan sacudidas, órbitas rápidas y traslaciones amplias; se conserva un fundido de estado.

## Composición y lectura

- Relación de aspecto de ilustración: 10:7.
- Una silueta principal ocupa entre el 38 % y el 68 % del ancho.
- El foco primario queda en el tercio central; las diagonales conducen hacia él.
- Unidades: gesto o dirección de mirada hacia el interior de la carta.
- Hechizos: causa y consecuencia visibles en una misma lectura.
- Estructuras: base clara y escala indicada por figuras, puertas o paisaje.
- Maná: fuente inequívoca, monumental y sin personaje dominante.
- Evitar más de tres focos de igual peso, microdetalle uniforme y fondos de valor medio sin separación.

### Zona segura

El archivo maestro debe incluir un 8 % de sangrado visual en los cuatro lados. El sujeto esencial, rostros, manos, armas y núcleos se mantienen dentro del rectángulo central comprendido entre `x=96…704` y `y=56…504` en el lienzo 800 × 560. La franja inferior de 70 px puede quedar parcialmente oculta por tratamientos de marco; no debe contener información narrativa indispensable. No colocar detalles únicos a menos de 40 px de un borde.

## Formatos y entrega

| Uso | Formato | Tamaño recomendado | Perfil |
| --- | --- | --- | --- |
| Arte final maestro | PNG/TIFF sin pérdida | 3200 × 2240 o mayor | Display P3 o Adobe RGB, archivado |
| Juego | WebP | 1600 × 1120, calidad 82–88 | sRGB, metadatos eliminados |
| Respaldo/prototipo | SVG | `viewBox="0 0 800 560"` | vectores y gradientes propios |
| Miniatura QA | PNG | 400 × 280 | sRGB |

Los WebP no deben incluir marco, nombre, coste ni símbolos de interfaz. Peso objetivo: 180–450 KB por carta; máximo recomendado: 700 KB. No ampliar imágenes generadas pequeñas para cumplir la resolución: regenerar o repintar el maestro.

## Criterios de escenarios renovados

Escalinata: arenisca rosada neutra, río índigo y pequeñas lámparas de aceite.
Rueda tallada con ocho radios unidos a cubo y llanta, vanos reales y pétalos.
Escaleras descendentes y cimientos bajo agua. Una captura planar de512/256px,
ninguna en baja. Evitar paneles rectangulares de agua, apoyos flotantes,
grandes halos y el baño naranja que borra la diferencia de piedra y río.

Jade: laca cinabrio, celadón y caliza con amanecer cálido/sombra fría.
Aleros continuos de cuatro faldones con caballete, tejas de relieve físico,
apoyos dougong y puerta de hueco circular con dovelas, sin pagodas cónicas.
Bronce ritual con pared interior y tres patas. El patio deja visibles las
cartas y sostiene las cuatro esquinas del tablero; no usar faroles gigantes
para sustituir arquitectura. Paisaje original documentado en arte-escenarios.

Gremio: calor industrial contenido, acero envejecido y bronce con poros y
aceite separados del color. Horno de ladrillo refractario con dovelas y hogar
profundo; transmisión de engranajes con módulo común y relación2:1. Colada
estrecha protegida por acero. La luz fría mantiene legible el metal frente al
ámbar del hogar. Evitar lava libre, ruedas lisas, dientes que se atraviesan y
metal negro sin entorno suficiente.

Rompiente: costa de pizarra, agua profunda azul gris, oleaje irregular y espuma
rota en frentes oblicuos. Faro de costillas de hueso y bronce erosionado con
linterna ámbar contenida. Reflejo planar único y roca con cavidades reales.
Evitar faros modernos a franjas, arcos lisos como piezas de puzle, agua cian
uniforme, reflejos como un patrón de chapa ondulada y aros blancos continuos.

Claro: bosque templado antiguo, roble con contrafuertes continuos y cavidad
real, hojas lobuladas, frondes pinnadas, mantillo y hojarasca plegada. Clave
cálida filtrada por dosel y relleno frío contenido. No usar cilindros abiertos,
copas esféricas, helechos como palos, musgo como paneles ni haces sólidos.

Fiordo: fantasía polar sobria, hielo azul gris con aire y fracturas finas,
nieve mate en la orla, casco naval de tablas abiertas y bruma localizada.
Un solo reflejo planar de la placa en alta/media; lago exterior mate y baja
sin captura. Evitar prismas de cristal repetidos, auroras como paneles y
superficies blancas emisivas. Panorama original en `docs/arte-escenarios.md`.
La atmósfera de todos los escenarios se aplica a Scene: unir niebla/fondo al
grupo giratorio no los hacía efectivos y abría negro al salir de la pintura.

## Convención de nombres

- Arte: `public/assets/cards/art/<card-id>.webp`.
- Respaldo: `public/assets/cards/art/<card-id>.svg`.
- El `card-id` usa minúsculas ASCII y guiones, coincide exactamente con `CardDefinition.id` y no lleva versión.
- Maestros y revisiones viven fuera del runtime: `<card-id>_master_v003.psd`, `<card-id>_review_v003.png`.
- No usar espacios, tildes, sufijos `final`, nombres de artista ni dimensiones en el archivo servido.

## Sustitución SVG → WebP

1. Crear o aprobar el maestro con la zona segura y la relación 10:7.
2. Convertir a sRGB y exportar a 1600 × 1120 WebP, calidad 85 como punto de partida.
3. Guardarlo junto al SVG con el mismo `card-id`; por ejemplo, `sabueso-brasa.webp` al lado de `sabueso-brasa.svg`.
4. No borrar el SVG: es el respaldo de carga y mantiene el prototipo autónomo.
5. Abrir galería, inspección, mano y tablero a 1920 × 1080 y 1366 × 768. Confirmar recorte, contraste y ausencia de texto incrustado.
6. Verificar que el WebP responde con MIME `image/webp`, que no supera el presupuesto y que su canal de color es sRGB.
7. Si el WebP falla, el componente de arte usa `art.fallback`; por ello la sustitución no requiere modificar TypeScript ni el registro de cartas.

## Prompts específicos de producción

Prefijo común sugerido para todos: **Ilustración original para juego de cartas de fantasía oscura elegante, composición cinematográfica 10:7, pintura digital detallada, sujeto central legible en miniatura, materiales creíbles, profundidad atmosférica, alto contraste controlado, sin marco ni interfaz**.

### Furia

1. **`fuente-furia` — Fuente de Furia.** Cámara bajo una montaña, pozo circular de basalto que contiene un corazón de magma blanco-naranja, ríos de lava salen por grietas radiales, arcos de roca negra y diminutas brasas suspendidas, luz ascendente que revela escala monumental, sin personajes dominantes.
2. **`sabueso-brasa` — Sabueso de Brasa.** Bestia cuadrúpeda de carbón vivo corriendo de izquierda a derecha, anatomía ágil y claramente canina, costillas iluminadas por brasas internas, melena convertida en chispas, suelo volcánico quebrado y rastro de ceniza, mirada amarilla enfocada hacia el interior.
3. **`berserker-ignivoro` — Berserker Ignívoro.** Guerrero curtido con armadura de hierro ennegrecido, dos hojas pesadas y cicatrices incandescentes, absorbe fuego hacia el pecho mientras avanza, gesto feroz no grotesco, ruinas de una forja al fondo, contraluz rojo y bordes dorados.
4. **`dragon-caldera` — Dragón de la Caldera.** Dragón ancestral de placas basálticas emerge del cráter, alas abiertas como paredes volcánicas, garganta y uniones llenas de magma, onda de choque que empuja roca y ceniza, escala colosal, cámara baja, ojos como hornos.
5. **`lluvia-ceniza` — Lluvia de Ceniza.** Ciudadela oscura bajo nubes densas, ceniza caliente cae en diagonales y enciende tejados aislados, una unidad pequeña busca refugio mientras su casilla se agrieta, cielo gris carbón con resplandor rojo distante, sensación de daño persistente.
6. **`forja-carmesi` — Forja Carmesí.** Forja ritual monumental, horno con forma de mandíbula abstracta, gran yunque central y armas al rojo flotando sobre cadenas, artesanos diminutos como escala, luz naranja desde el interior, hierro, cobre envejecido y humo estratificado.
7. **`lancera-magma` — Lancera de Magma.** Guerrera de silueta atlética cruza un puente estrecho sobre lava, lanza larga con filo de obsidiana y vena ígnea, armadura asimétrica de escoria, capa llevada por el calor, postura de avance veloz, diagonales fuertes y chispas laterales.
8. **`fenix-pavesa` — Fénix de Pavesa.** Ave ígnea renace de un montón de ceniza oscura, alas extendidas compuestas por plumas de carbón con bordes naranja y oro pálido, corriente de pavesas forma una corona incompleta, ruinas nocturnas debajo, majestuoso y no ornamental.
9. **`temblor-rojo` — Temblor Rojo.** Fortaleza dividida por una falla recién abierta, placas de terreno elevándose, grieta central de magma que serpentea hacia el espectador, bloques y estandartes suspendidos en el impacto, polvo rojo, lectura clara de cataclismo localizado.
10. **`altar-combustion` — Altar de Combustión.** Altar de piedra negra en una nave subterránea, llama vertical contenida por un sigilo original de cinco cortes, dos acólitos de espaldas aportan escala, ofrendas convertidas en luz, simetría tensa y sombras profundas.
11. **`ariete-volcanico` — Ariete Volcánico.** Máquina de asedio baja y pesada construida con basalto, hierro remachado y ruedas masivas, cabeza del ariete incandescente a punto de golpear una puerta, tripulación protegida bajo placas, vapor y grava expulsados, perspectiva dinámica a ras de suelo.
12. **`pacto-ascuas` — Pacto de Ascuas.** Dos manos con guanteletes distintos se encuentran sobre un brasero, una brasa brillante flota entre ambas y dibuja un sello angular en el aire, rostros apenas sugeridos a ambos lados, intimidad ritual, rojo oscuro, oro caliente y humo fino.

### Arcano

13. **`fuente-arcana` — Fuente Arcana.** Gruta azul profunda con estanque circular luminoso, cristal central se eleva desde el agua y contiene una pregunta visual en forma de órbita incompleta, prismas flotantes, reflejos turquesa sobre roca húmeda, calma monumental sin personaje dominante.
14. **`centinela-cristal` — Centinela de Cristal.** Constructo guardián alto formado por facetas de cuarzo azul y un núcleo hexagonal, quieto ante una puerta rúnica, dos posibles futuros reflejados en sus hombros, postura protectora, luz fría interna y bordes translúcidos.
15. **`tejedora-escarcha` — Tejedora de Escarcha.** Hechicera de túnica azul teje con ambas manos filamentos de hielo sobre un campo, la red geométrica inmoviliza los pies de un adversario distante, copos como agujas, expresión serena, perspectiva lateral y luna fría difusa.
16. **`prision-glacial` — Prisión Glacial.** Unidad atrapada dentro de un poliedro de hielo translúcido, placas cruzadas como barrotes y runas detenidas a mitad de giro, aire congelado alrededor, sujeto visible pero inmóvil, luz cian blanca y cavernas azul marino.
17. **`cometa-arcano` — Cometa Arcano.** Cometa mágico blanco-cian atraviesa un cielo estrellado y desciende hacia un objetivo helado, cola compuesta por glifos y fragmentos prismáticos, observatorio en primer plano, enorme escala y trayectoria diagonal inequívoca.
18. **`torre-horizonte` — Torre del Horizonte.** Torre-observatorio esbelta sobre acantilados y nubes, gran lente orbital en la cúspide muestra varios horizontes superpuestos, ventanas cian, amanecer azul pálido, verticalidad majestuosa y pequeñas figuras en balcones.
19. **`duelista-prisma` — Duelista del Prisma.** Duelista místico con abrigo estructurado divide un rayo mediante una hoja de cristal, el haz se separa en tres colores suaves que iluminan una arena oscura, postura precisa y ligera, rostro concentrado, movimiento contenido.
20. **`golem-azur` — Gólem Azur.** Gólem ancho tallado en piedra azul y cristal húmedo, núcleo que encierra un pequeño mar con oleaje, se incorpora en una cantera, brazos como contrafuertes y postura de guardia, niebla de agua y reflejos cian.
21. **`niebla-espejada` — Niebla Espejada.** Lago nocturno cubierto por bancos de niebla, dos figuras en la orilla tienen reflejos que miran en direcciones imposibles, fragmentos de espejo suspendidos revelan cartas o caminos alternativos sin texto, atmósfera ambigua y elegante.
22. **`eco-cronomante` — Eco Cronomante.** Cronomante encapuchado repetido en tres exposiciones temporales, círculo mecánico-rúnico detrás, gesto de lanzar un hechizo capturado antes y después, transparencias cian y violeta, partículas inmóviles y fondo oscuro sin relojes modernos.
23. **`archivo-viviente` — Archivo Viviente.** Biblioteca imposible cuyo archivista está formado por libros abiertos, páginas y constelaciones, pasillos curvos desaparecen en un cielo interior, dos volúmenes vuelan hacia el espectador, sabiduría antigua, azul profundo y luz de pergamino frío.
24. **`convergencia-astral` — Convergencia Astral.** Varias órbitas y constelaciones se alinean alrededor de un portal circular, dos posiciones del mismo viajero unidas por un pliegue de espacio, planetas pequeños indican escala, blanco-cian en el núcleo, azul y violeta en el borde, geometría limpia.

## Prompt negativo común

**texto legible, letras, números, tipografía, logotipo, firma, marca de agua, marco de carta, interfaz, medallones, barras de estadísticas, composición de póster, borde decorativo, personaje recortado por el borde, foco fuera de la zona segura, arte de franquicia, personaje reconocible, símbolo comercial, estilo de artista vivo, fotografía, 3D plástico, render de juguete, colores neón uniformes, sobreexposición, negros empastados, manos deformes, dedos extra, extremidades extra, anatomía rota, rostros duplicados, armas fusionadas, perspectiva incoherente, detalle caótico, ruido, baja resolución, compresión**.

## Lista de comprobación de aprobación

- El concepto se identifica sin leer el nombre.
- La facción se reconoce por forma, luz y material, no solo por color.
- El foco sobrevive a una miniatura de 200 × 140.
- Rostros, manos, núcleos y armas quedan dentro de la zona segura.
- No hay texto, firma, marco, logotipo ni iconos de interfaz incrustados.
- Existe separación clara de valores entre sujeto y fondo.
- El WebP y el SVG comparten exactamente el mismo `card-id`.

Quinto Sol: estuco calizo, mosaicos turquesa y cochinilla, templos gemelos con
vanos auténticos, calendario inciso sobrio. Evitar lava y pirámides de juguete.
Bestiario: caliza estratificada y hueso mineralizado con fisuras longitudinales,
articulaciones romas y apoyos enterrados. Sin bloques rectangulares ni colmillos
plásticos; terreno natural, cartas y estadísticas legibles sobre verde apagado.

El decorado conserva composición y luces desde ambos puestos: girar también
el pabellón al mirar como invitado tapaba el Nexo próximo. Solo se orientan
las piezas, casillas, Nexos y efectos tácticos. Los patios arquitectónicos de
Jade/Sol llevan juntas a escala real; Bestiario conserva suelo natural.

El clima responde al desgaste resuelto sin alterar reglas: más presión en el
horno y los canales de lava, vapor algo más denso, sin cambiar nivel de agua
ni velocidad por reloj multiplicado (provocaba saltos de fase al curar). En
movimiento reducido se conserva el estado ambiental, pero no la oscilación.
El calendario solar lleva cantos de relieve real y pigmentación de incisión
discreta; el cuenco tiene labio, pared y fondo interiores, sin disco negro.
