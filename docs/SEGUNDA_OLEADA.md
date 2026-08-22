# Segunda oleada · NEX-02 «Fractura»

Documento de trabajo para generar el **arte** de 24 cartas nuevas y 6 comandantes
alternativos. El diseño de juego (costes, estadísticas y reglas) ya está cerrado
aquí: tú solo tienes que producir las ilustraciones y meterlas en la carpeta de
entrada; el resto lo implemento yo.

---

## 1. Cómo se usa este documento

1. Abre ChatGPT o Gemini y pega **el prompt maestro** (sección 2) al empezar la
   sesión. Fija el estilo común para toda la oleada.
2. Para cada carta, pega su **prompt individual**. Genera la imagen en formato
   cuadrado (1:1). Si la herramienta no deja elegir proporción, no pasa nada: el
   importador recorta al centro.
3. Guarda cada imagen en `tools/art-inbox/` **con el id exacto de la carta como
   nombre de archivo**. Ejemplo: `tools/art-inbox/coloso-de-escoria.png`.
   Vale png, jpg o webp.
4. Cuando tengas un lote listo, ejecuta:

   ```bash
   python tools/import_art.py
   ```

   El script recorta, escala, guarda el WebP definitivo y genera el respaldo SVG.

5. Avísame y yo doy de alta las cartas en el motor, las reparto por los mazos y
   ajusto el equilibrio con el simulador.

**Importante:** el id del archivo tiene que ser exacto (minúsculas, guiones, sin
acentos). Es lo único que conecta tu imagen con la carta.

---

## 2. Prompt maestro (pegar una vez al empezar)

> Vas a ilustrar cartas para «Crónicas del Nexo», un juego de cartas de fantasía
> oscura elegante. Estilo: pintura digital de alto acabado, como arte de carta
> coleccionable profesional. Fantasía oscura pero **no lúgubre ni sucia**:
> materiales antiguos, luz mágica de alto contraste, elegancia ceremonial.
>
> Reglas fijas para todas las imágenes:
> - Composición **vertical centrada**, con el sujeto claramente legible en
>   miniatura. Debe leerse como una silueta reconocible incluso a tamaño pequeño.
> - **Sin texto, sin marcos, sin bordes, sin firmas, sin logotipos, sin interfaz.**
>   Solo la ilustración.
> - Fondo ambiental que sitúe la escena pero sin robar protagonismo al sujeto.
> - Luz: una fuente mágica dominante que define el color de la facción, más una
>   luz fría de relleno. Contraste alto, negros profundos pero con detalle.
> - Nada de estética anime, cel-shading, cómic ni 3D de videojuego moderno. Óleo
>   digital / pintura de fantasía clásica.
> - Sin marcas de agua ni bordes redondeados.
>
> Paleta por facción (respétala en cada carta):
> - **Furia**: base carmesí `#9f261f`, luz `#ffb13b` y `#fff0a0`, sombra `#120a0e`.
>   Materiales: basalto, hierro quemado, brasa, grietas incandescentes.
> - **Arcano**: base azul `#245aa8`, luz `#78e9f5` y `#d9ffff`, sombra `#071321`.
>   Materiales: cristal, hielo, prismas, agua helada, geometría precisa.
> - **Naturaleza**: base verde `#337a47`, luz `#a8dc65`, sombra `#102018`.
>   Materiales: madera viva, jade, raíces, musgo, savia luminosa.
> - **Orden**: base marfil `#d6c9a2`, luz dorada `#f2cf71`, sombra `#353128`.
>   Materiales: mármol, latón, simetría, arcos, estandartes.
> - **Sombra**: base violeta oscuro `#241b2f`, luz `#8754ad`, sombra `#070609`.
>   Materiales: obsidiana, humo, velos, hueso pulido.
> - **Vacío**: base púrpura `#6435a1`, luz `#cb79ff`, sombra `#100821`.
>   Materiales: vidrio iridiscente, portales rotos, geometría imposible.

---

## 3. Las 24 cartas

Cada ficha trae: **id** (nombre de archivo), datos de juego y el prompt.

La columna «motor» avisa de si la carta usa mecánica que el juego ya sabe
resolver o si tengo que programar algo nuevo. Todas las de esta oleada están
elegidas para que **21 de 24 funcionen con lo que ya existe**; las tres marcadas
como «nueva» son deliberadas, para estrenar mecánica con la oleada.

---

### 3.1 Furia — el precio de la potencia

Furia ya tiene la mayor cantidad de unidades agresivas del juego. Estas cuatro
añaden lo que le falta: alcance real, castigo por acumular unidades y un cierre
tardío.

#### `coloso-de-escoria`
- **Nombre**: Coloso de Escoria · **Tipo**: Unidad — Gigante · **Rareza**: Mítica
- **Coste**: 4 genérico + 2 carmesí · **ATQ/VID**: 8/8 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Perforar. Al entrar en juego, inflige 2 de daño a todas las unidades enemigas.
- **Sabor**: «La Caldera no forja soldados: forja consecuencias.»
- **Motor**: ya soportado (`pierce` + `damage-all-enemies`)
- **Prompt**: *Un coloso humanoide colosal hecho de escoria volcánica y hierro fundido, brazos desproporcionados y puños como yunques, grietas de lava recorriendo su torso, vapor saliendo de las juntas. Está de pie en una fundición en ruinas, visto desde abajo para exagerar su escala. Luz naranja incandescente desde su propio interior, contraluz de humo negro. Paleta Furia.*

#### `lanza-de-obsidiana`
- **Nombre**: Lanza de Obsidiana · **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente
- **Coste**: 1 genérico + 1 carmesí
- **Reglas**: Inflige 5 de daño a una unidad enemiga. Si la destruye, tu Nexo se cura 2.
- **Sabor**: «Se lanza una vez. No hace falta más.»
- **Motor**: ya soportado (`damage` + `heal-nexus`)
- **Prompt**: *Una lanza de obsidiana negra al rojo vivo atravesando el aire en el momento del impacto, estela de chispas y esquirlas de cristal volcánico, onda de calor deformando el fondo. Composición diagonal dinámica sobre un campo de ceniza. Sin figura humana. Paleta Furia.*

#### `pira-de-los-caidos`
- **Nombre**: Pira de los Caídos · **Tipo**: Estructura — Pira · **Rareza**: Rara
- **Coste**: 2 genérico + 1 carmesí · **Resistencia**: 5
- **Reglas**: Al final de tu turno, inflige 1 de daño a la unidad enemiga más débil.
- **Sabor**: «Arde por los que ya no pueden arder.»
- **Motor**: ya soportado (`splash-weakest-enemy` como pasiva de estructura)
- **Prompt**: *Una pira funeraria ceremonial de hierro negro sobre un pedestal de basalto agrietado, llamas altas de color ámbar con brasas ascendiendo, armas rotas apiladas en la base como ofrenda. Escena nocturna, el fuego es la única fuente de luz. Sin figuras. Paleta Furia.*

#### `heraldo-de-la-ruina`
- **Nombre**: Heraldo de la Ruina · **Tipo**: Unidad — Guerrero · **Rareza**: Rara
- **Coste**: 2 genérico + 1 carmesí · **ATQ/VID**: 4/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Golpe veloz. Cuando ataca, gana +1 de Ataque hasta el final del turno.
- **Sabor**: «Cada golpe le enseña dónde duele el siguiente.»
- **Motor**: ya soportado (`swift-strike` + `buff-self-on-attack`)
- **Prompt**: *Un guerrero cubierto de placas de hierro ennegrecido y capa carbonizada, avanzando a paso rápido con dos hachas cortas, rastro de ceniza levantándose tras él. Rostro oculto bajo un yelmo con visera estrecha por la que se ve brasa. Fondo: llanura quemada al atardecer. Paleta Furia.*

---

### 3.2 Arcano — negar antes que responder

Arcano controla el tablero, pero no tiene forma de negar un turno entero ni
presencia aérea. Estas cuatro lo arreglan.

#### `custodio-del-solsticio`
- **Nombre**: Custodio del Solsticio · **Tipo**: Unidad — Constructo · **Rareza**: Mítica
- **Coste**: 3 genérico + 2 azur · **ATQ/VID**: 5/7 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Guardia. Al entrar en juego, congela a una unidad enemiga durante 2 turnos.
- **Sabor**: «Custodia el instante en que el año se detiene.»
- **Motor**: ya soportado (`guard` + `freeze`)
- **Prompt**: *Un constructo majestuoso de cristal azul y armazón de plata antigua, con un núcleo de luz helada en el pecho y anillos concéntricos flotando a su alrededor, en una sala circular de hielo tallado. Postura defensiva, brazos abiertos. Reflejos prismáticos, vaho helado. Paleta Arcano.*

#### `silencio-prismatico`
- **Nombre**: Silencio Prismático · **Tipo**: Hechizo inmediato — Encantamiento · **Rareza**: Rara
- **Coste**: 1 genérico + 1 azur
- **Reglas**: Aturde a una unidad enemiga y roba 1 carta.
- **Sabor**: «El eco se apagó antes de existir.»
- **Motor**: ya soportado (`stun` como estado + `draw`)
- **Prompt**: *Un prisma flotante de hielo que fractura la luz en un abanico de haces cian, y a su alrededor el aire congelado en cristales suspendidos e inmóviles, como si el tiempo se hubiera detenido. Sin figuras. Composición central simétrica. Paleta Arcano.*

#### `garza-de-escarcha`
- **Nombre**: Garza de Escarcha · **Tipo**: Unidad — Ave · **Rareza**: Infrecuente
- **Coste**: 1 genérico + 1 azur · **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador. Cuando ataca, escruta 1.
- **Sabor**: «Ve el invierno tres días antes que nadie.»
- **Motor**: ya soportado (`flying` + `scry`)
- **Prompt**: *Una garza estilizada de plumaje blanco azulado con las puntas heladas, en pleno vuelo sobre un lago congelado, dejando una estela de cristales de escarcha. Alas extendidas, silueta elegante y muy legible. Cielo crepuscular frío. Paleta Arcano.*

#### `biblioteca-sumergida`
- **Nombre**: Biblioteca Sumergida · **Tipo**: Estructura — Archivo · **Rareza**: Rara
- **Coste**: 2 genérico + 1 azur · **Resistencia**: 6
- **Reglas**: Al final de tu turno, escruta 1. Tus hechizos cuestan 1 genérico menos, hasta un mínimo de 0.
- **Sabor**: «El agua conservó lo que el fuego quiso borrar.»
- **Motor**: **nueva** — hay que añadir el descuento a hechizos como pasiva de estructura (ya existe algo parecido en Archivo Viviente, así que es una extensión, no mecánica desde cero)
- **Prompt**: *Una biblioteca antigua parcialmente sumergida, estanterías de piedra bajo agua clarísima, libros flotando abiertos con páginas que emiten luz cian, columnas rotas y peces atravesando los pasillos. Vista desde dentro, luz filtrada desde arriba. Sin figuras. Paleta Arcano.*

---

### 3.3 Naturaleza — crecer y volver

Naturaleza es la facción con menos cartas y la que peor cierra las partidas.
Recibe un final grande y herramientas de recuperación.

#### `ancestro-del-bosque`
- **Nombre**: Ancestro del Bosque · **Tipo**: Unidad — Treant · **Rareza**: Mítica
- **Coste**: 4 genérico + 2 verde · **ATQ/VID**: 6/9 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Al entrar en juego, cura 4 a tu Nexo.
- **Sabor**: «Ya estaba aquí cuando el Nexo era una grieta.»
- **Motor**: ya soportado (`guard` + `heal-nexus`)
- **Prompt**: *Un árbol ancestral animado, tronco enorme cubierto de musgo y jade, raíces como piernas levantando tierra, rostro apenas sugerido en la corteza, savia luminosa recorriendo las grietas. Bosque profundo con rayos de sol filtrándose. Escala monumental. Paleta Naturaleza.*

#### `manada-en-celo`
- **Nombre**: Manada en Celo · **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente
- **Coste**: 1 genérico + 1 verde
- **Reglas**: Una unidad aliada gana +2 de Ataque hasta el final del turno y puede volver a moverse.
- **Sabor**: «Corre porque el bosque corre con ella.»
- **Motor**: ya soportado (`buff` + `refresh-move`)
- **Prompt**: *Una manada de lobos y ciervos corriendo juntos entre la maleza en la misma dirección, motas de polen dorado levantadas a su paso, movimiento intenso con desenfoque de velocidad. Luz verde dorada de amanecer entre troncos. Paleta Naturaleza.*

#### `corazon-del-manantial`
- **Nombre**: Corazón del Manantial · **Tipo**: Estructura — Manantial · **Rareza**: Rara
- **Coste**: 1 genérico + 1 verde · **Resistencia**: 6
- **Reglas**: Al final de tu turno, cura 2 a tu Nexo.
- **Sabor**: «Bebe despacio: el manantial no tiene prisa.»
- **Motor**: ya soportado (pasiva de estructura + `heal-nexus`)
- **Prompt**: *Un manantial sagrado brotando de una roca cubierta de musgo, con un corazón de jade luminoso visible en el fondo del agua, helechos y flores blancas alrededor, vapor suave. Composición íntima y central. Sin figuras. Paleta Naturaleza.*

#### `guardabosques-tenaz`
- **Nombre**: Guardabosques Tenaz · **Tipo**: Unidad — Humanoide · **Rareza**: Común
- **Coste**: 1 genérico + 1 verde · **ATQ/VID**: 3/4 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Vínculo vital.
- **Sabor**: «Conoce cada senda porque las ha defendido todas.»
- **Motor**: ya soportado (`lifelink`)
- **Prompt**: *Una guardabosques con capa de hojas y arco largo de madera viva, apuntando entre dos árboles, rostro sereno y curtido, alrededor luciérnagas verdes. Bosque al atardecer, luz cálida filtrada. Paleta Naturaleza.*

---

### 3.4 Orden — la muralla que también castiga

Orden defiende bien pero remata mal. Estas cuatro convierten la defensa en
ventaja.

#### `arcangel-del-veredicto`
- **Nombre**: Arcángel del Veredicto · **Tipo**: Unidad — Celestial · **Rareza**: Mítica
- **Coste**: 4 genérico + 2 dorado · **ATQ/VID**: 6/6 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Volador, Vínculo vital. Al entrar en juego, aturde a una unidad enemiga.
- **Sabor**: «No juzga: recuerda la sentencia que ya estaba escrita.»
- **Motor**: ya soportado (`flying` + `lifelink` + estado `stunned`)
- **Prompt**: *Un arcángel de armadura de mármol y latón con cuatro alas de luz dorada, sosteniendo una balanza rota en una mano y una espada de luz en la otra, descendiendo desde un cielo de nubes altas. Simetría casi perfecta, halo geométrico. Paleta Orden.*

#### `muro-de-plegarias`
- **Nombre**: Muro de Plegarias · **Tipo**: Estructura — Fortaleza · **Rareza**: Rara
- **Coste**: 2 genérico + 1 dorado · **Resistencia**: 8
- **Reglas**: Guardia. Al final de tu turno, una unidad aliada gana un escudo de 2.
- **Sabor**: «Cada piedra lleva un nombre grabado.»
- **Motor**: ya soportado (`guard` + estado `shielded` como pasiva)
- **Prompt**: *Una muralla de mármol claro con cientos de inscripciones grabadas que brillan tenuemente en dorado, arcos ojivales y estandartes colgando, niebla baja al pie. Vista frontal imponente, luz de amanecer. Sin figuras. Paleta Orden.*

#### `sentencia-solar`
- **Nombre**: Sentencia Solar · **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Rara
- **Coste**: 2 genérico + 1 dorado
- **Reglas**: Inflige 3 de daño a todas las unidades enemigas. Cura 3 a tu Nexo.
- **Sabor**: «La luz no distingue: por eso es justa.»
- **Motor**: ya soportado (`damage-all-enemies` + `heal-nexus`)
- **Prompt**: *Una columna vertical de luz dorada cegadora cayendo del cielo sobre un campo de batalla de mármol, disipando sombras, con partículas doradas ascendiendo en contrasentido. Sin figuras claras, solo siluetas retrocediendo. Paleta Orden.*

#### `escudera-del-alba`
- **Nombre**: Escudera del Alba · **Tipo**: Unidad — Soldado · **Rareza**: Común
- **Coste**: 0 genérico + 1 dorado · **ATQ/VID**: 1/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Al entrar en juego, gana un escudo de 2.
- **Sabor**: «Primero en pie, última en caer.»
- **Motor**: ya soportado (`guard` + estado `shielded`)
- **Prompt**: *Una escudera joven con armadura sencilla de latón y un escudo torre grabado con un sol naciente, plantada firme en un puente de piedra al amanecer. Postura defensiva, mirada decidida. Paleta Orden.*

---

### 3.5 Sombra — quitarle al rival lo que aún no ha jugado

Sombra drena vida, pero no ataca la mano del rival, que es su fantasía natural.

#### `senora-de-la-mortaja`
- **Nombre**: Señora de la Mortaja · **Tipo**: Unidad — Humanoide · **Rareza**: Mítica
- **Coste**: 3 genérico + 2 violeta · **ATQ/VID**: 5/5 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Vínculo vital. Al entrar en juego, el rival descarta 1 carta.
- **Sabor**: «Cose los nombres de los que aún respiran.»
- **Motor**: ya soportado (`lifelink` + `discard` con objetivo `enemy-hand`)
- **Prompt**: *Una figura femenina alta envuelta en una mortaja de gasa negra que flota como humo, sosteniendo una aguja de hueso y un hilo violeta luminoso, rostro cubierto salvo la boca. Cementerio nocturno con niebla baja. Elegante, no monstruosa. Paleta Sombra.*

#### `diezmo-de-sangre`
- **Nombre**: Diezmo de Sangre · **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente
- **Coste**: 1 genérico + 1 violeta
- **Reglas**: El rival descarta 1 carta. Tu Nexo se cura 3.
- **Sabor**: «Todo el mundo paga; casi nadie elige cuándo.»
- **Motor**: ya soportado (`discard` + `heal-nexus`)
- **Prompt**: *Un cáliz de obsidiana sobre un altar bajo, recogiendo gotas de un hilo de sangre que cae del aire sin origen visible, sellos violetas ardiendo alrededor en el suelo de piedra. Escena ritual, luz tenue violeta. Sin figuras. Paleta Sombra.*

#### `carroñero-del-osario`
- **Nombre**: Carroñero del Osario · **Tipo**: Unidad — No muerto · **Rareza**: Común
- **Coste**: 0 genérico + 1 violeta · **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Impulso. Cuando destruye una unidad, tu Nexo se cura 1.
- **Sabor**: «Llega tarde a la batalla y temprano al banquete.»
- **Motor**: **nueva** — «cuando destruye» necesita un disparador de muerte que no existe todavía; es la mecánica que quiero estrenar con la oleada
- **Prompt**: *Una criatura no muerta encorvada y delgada, envuelta en vendas grises y con una máscara de pico de hueso, avanzando entre osamentas con dedos largos. Cripta iluminada por hongos violetas. Inquietante pero elegante, sin gore. Paleta Sombra.*

#### `mausoleo-hambriento`
- **Nombre**: Mausoleo Hambriento · **Tipo**: Estructura — Mausoleo · **Rareza**: Rara
- **Coste**: 2 genérico + 1 violeta · **Resistencia**: 6
- **Reglas**: Al final de tu turno, inflige 1 de daño al Nexo enemigo y cura 1 al tuyo.
- **Sabor**: «Se alimenta despacio, pero nunca deja de comer.»
- **Motor**: ya soportado (pasiva de estructura, mismo patrón que el drenaje de Malachar)
- **Prompt**: *Un mausoleo de piedra negra con la puerta entreabierta, de la que sale una respiración de humo violeta, estatuas de plañideras erosionadas a los lados, hiedra muerta. Noche cerrada, luna oculta. Sin figuras vivas. Paleta Sombra.*

---

### 3.6 Vacío — mover el tablero, no solo las piezas

Vacío distorsiona el espacio pero no tiene teletransporte propio, que es
exactamente lo que promete su identidad.

#### `arquitecta-del-vacio`
- **Nombre**: Arquitecta del Vacío · **Tipo**: Unidad — Humanoide · **Rareza**: Mítica
- **Coste**: 3 genérico + 2 púrpura · **ATQ/VID**: 4/6 · **Alcance** 2 · **Movimiento** 2
- **Reglas**: Al entrar en juego, una unidad aliada puede volver a moverse. Golpe veloz.
- **Sabor**: «Dibuja la puerta y después decide dónde estaba.»
- **Motor**: ya soportado (`refresh-move` + `swift-strike`)
- **Prompt**: *Una figura femenina de piel pálida con un compás de vidrio iridiscente flotando ante ella, trazando en el aire un arco de geometría imposible que se abre como una grieta púrpura. Vestimenta de tiras oscuras que se deshacen en partículas. Fondo de arquitectura fracturada. Paleta Vacío.*

#### `salto-de-umbral`
- **Nombre**: Salto de Umbral · **Tipo**: Hechizo inmediato — Portal · **Rareza**: Rara
- **Coste**: 1 genérico + 1 púrpura
- **Reglas**: Una unidad aliada puede volver a moverse y gana Perforar hasta el final del turno.
- **Sabor**: «Dos pasos: uno aquí, otro donde haga falta.»
- **Motor**: **nueva** — dar una palabra clave temporal a una unidad; el motor ya sabe de buffs temporales, pero no de palabras clave prestadas
- **Prompt**: *Un portal ovalado de borde iridiscente abriéndose en mitad del aire sobre un suelo agrietado, con la silueta de alguien entrando por un lado y saliendo por otro simultáneamente. Distorsión del espacio alrededor, esquirlas de vidrio suspendidas. Paleta Vacío.*

#### `faro-de-la-fractura`
- **Nombre**: Faro de la Fractura · **Tipo**: Estructura — Portal · **Rareza**: Rara
- **Coste**: 2 genérico + 1 púrpura · **Resistencia**: 5
- **Reglas**: Al final de tu turno, roba 1 carta y descarta 1.
- **Sabor**: «Enseña todos los caminos y no recomienda ninguno.»
- **Motor**: ya soportado (`draw` + `discard` como pasiva de estructura)
- **Prompt**: *Un faro imposible construido con losas flotantes que no se tocan, coronado por una esfera de luz púrpura que proyecta haces en direcciones contradictorias. Sobre un mar de vidrio negro inmóvil. Sin figuras. Paleta Vacío.*

#### `devorador-de-ecos`
- **Nombre**: Devorador de Ecos · **Tipo**: Unidad — Horror · **Rareza**: Infrecuente
- **Coste**: 1 genérico + 1 púrpura · **ATQ/VID**: 3/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Cuando ataca, el rival descarta 1 carta.
- **Sabor**: «Se come lo que ibas a hacer.»
- **Motor**: ya soportado (disparador de ataque + `discard`)
- **Prompt**: *Un horror sin rostro formado por capas de vidrio púrpura translúcido superpuestas, con varias siluetas de sí mismo desfasadas alrededor como ecos visuales. Avanza sobre un suelo que se fragmenta a su paso. Paleta Vacío.*

---

## 4. Comandantes alternativos

Un segundo líder por facción. **Cambian el mazo entero sin una sola carta nueva**:
la pasiva reorienta cómo se juega la facción. Son los seis retratos más
importantes de la oleada, así que conviene generarlos con más cuidado y a mayor
resolución.

Formato de retrato: **busto o tres cuartos**, mirada al frente, fondo trabajado
pero sin distraer. Deben poder ponerse uno al lado del otro y verse como una
galería coherente.

| id | Nombre | Facción | Pasiva |
| --- | --- | --- | --- |
| `borran-yunque-vivo` | Borrán, Yunque Vivo | Furia | Tus estructuras entran con +2 de Resistencia. La primera unidad que destruyas cada turno cura 1 a tu Nexo. |
| `sialu-lengua-de-hielo` | Síalu, Lengua de Hielo | Arcano | La primera vez que congelas o aturdes cada turno, robas 1 carta. |
| `marnak-raiz-profunda` | Márnak, Raíz Profunda | Naturaleza | Tus unidades con Guardia entran con un escudo de 2. |
| `veyra-espada-consagrada` | Veyra, Espada Consagrada | Orden | Tus unidades voladoras tienen Vínculo vital. |
| `oren-el-tercer-luto` | Orén, el Tercer Luto | Sombra | Cada vez que tu Nexo se cura, el enemigo pierde 1 de Vida (máximo 2 por turno). |
| `zeph-sin-orilla` | Zeph, Sin Orilla | Vacío | La primera unidad que despliegues cada turno puede moverse el turno en que entra. |

### Prompts de retrato

- **`borran-yunque-vivo`** — *Retrato en tres cuartos de un herrero gigantesco de piel curtida y barba trenzada con anillos de hierro, un brazo sustituido por un yunque vivo de metal incandescente injertado en la carne, delantal de cuero quemado. Fondo: fragua en penumbra con chispas suspendidas. Expresión de calma pesada, no de furia. Paleta Furia.*
- **`sialu-lengua-de-hielo`** — *Retrato de una hechicera de rasgos afilados y piel azulada, con el aliento visiblemente helado saliendo de sus labios entreabiertos y cristales de escarcha formándose en el aire ante ella. Manto de escamas de hielo, ojos casi blancos. Fondo: sala de cristal con eco de reflejos. Paleta Arcano.*
- **`marnak-raiz-profunda`** — *Retrato de un guardián anciano medio humano medio árbol, corteza cubriendo hombros y mandíbula, barba de líquenes colgantes, ojos ámbar profundos. Sostiene un bastón que es una raíz aún viva con brotes. Fondo: bosque antiguo con luz filtrada. Paleta Naturaleza.*
- **`veyra-espada-consagrada`** — *Retrato de una caballero de armadura de mármol y latón, sin yelmo, pelo corto y cicatriz limpia en la mejilla, sosteniendo verticalmente una espada de luz dorada ante el rostro en gesto de juramento. Fondo: vitral roto con luz atravesándolo. Paleta Orden.*
- **`oren-el-tercer-luto`** — *Retrato de un hombre enjuto vestido de luto ceremonial con tres velos superpuestos, el rostro parcialmente visible bajo el más fino, sosteniendo una vela negra encendida cuya llama es violeta. Fondo: velatorio en penumbra con espejos cubiertos. Elegante, contenido. Paleta Sombra.*
- **`zeph-sin-orilla`** — *Retrato de una figura andrógina cuyo contorno se deshace en fragmentos de vidrio púrpura flotantes por el lado izquierdo, mientras el derecho es sólido y sereno. Ojos sin pupila, luz interior. Fondo: horizonte imposible donde el mar está arriba. Paleta Vacío.*

---

## 5. Checklist de entrega

Nombres de archivo exactos que espera `tools/art-inbox/`:

```
coloso-de-escoria          custodio-del-solsticio    ancestro-del-bosque
lanza-de-obsidiana         silencio-prismatico       manada-en-celo
pira-de-los-caidos         garza-de-escarcha         corazon-del-manantial
heraldo-de-la-ruina        biblioteca-sumergida      guardabosques-tenaz

arcangel-del-veredicto     senora-de-la-mortaja      arquitecta-del-vacio
muro-de-plegarias          diezmo-de-sangre          salto-de-umbral
sentencia-solar            carroñero-del-osario      faro-de-la-fractura
escudera-del-alba          mausoleo-hambriento       devorador-de-ecos

borran-yunque-vivo         sialu-lengua-de-hielo     marnak-raiz-profunda
veyra-espada-consagrada    oren-el-tercer-luto       zeph-sin-orilla
```

**Ojo con `carroñero-del-osario`**: lleva ñ. Si tu sistema de archivos o la
herramienta de generación te da problemas con el acento, guárdalo como
`carronero-del-osario` y me lo dices para usar ese id en el motor.

No hace falta que entregues los 30 de golpe: en cuanto tengas un lote (por
ejemplo, una facción entera), pásalo por el importador y avísame. Voy dando de
alta las cartas por tandas y ajustando el equilibrio con el simulador.
