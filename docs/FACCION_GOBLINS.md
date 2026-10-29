# Facción nueva · GOBLINS — «La Chatarrería»

Dosier completo: identidad, mecánica propia, comandante y **31 cartas** con su
prompt de arte. Mismo flujo que los anteriores: tú generas las ilustraciones,
yo doy de alta las cartas.

---

## ⚠️ ANTES DE GENERAR NADA: cómo se nombran los archivos

**Cada imagen tiene que guardarse con el identificador de su carta, tal cual:**

```
pinche-de-polvora.png
jinete-de-jabali.png
fuente-goblin.png
```

En minúsculas, con guiones, sin acentos y sin números de serie. El
identificador va en el encabezado de cada ficha, entre comillas inclinadas.

Con la facción Enjambre llegaron 32 imágenes llamadas `exec-a1bf5c0b-1143.png`
y hubo que identificarlas una a una mirándolas, porque el PNG no traía
metadatos y todas tenían la misma hora. Se perdió una tarde y aun así
aparecieron dos repetidas y dos que faltaban.

Formato: PNG o JPG, **vertical**, mínimo 1024 × 1536.

---

## 1. Por qué esta facción y en qué se diferencia

Las dieciséis facciones actuales son **todas solemnes**. Épicas, rituales o
sombrías, pero ninguna se ríe. Cuando las ves juntas en la pantalla de
selección se nota: parece un juego que nunca se lo pasa bien.

Esta es la que falta. Los goblins no son malvados ni trágicos: son **pequeños,
listísimos y temerarios**. Construyen cosas que funcionan casi siempre, y
cuando no funcionan, funcionan de otra manera.

Y mecánicamente trae lo único que ningún mazo toca: el **azar**. Nadie tira una
moneda en este juego. Eso significa que es la única facción donde una partida
puede torcerse o salvarse por algo que no planeaste — y esa sensación, bien
dosificada, es media gracia de un juego de cartas.

### Cuidado con Forja: son opuestas, no primas

Las dos son máquinas y metal, así que hay que separarlas a propósito.

**Forja es un gremio**: precisión, remaches alineados, piezas a medida, cosas
que funcionan porque están bien hechas. Controlan el calor.

**Los goblins son lo contrario**: nada está a medida, todo va atado con cuerda,
sobran tubos y falta un tornillo. Le prenden fuego para ver qué pasa.

Regla práctica para las ilustraciones: si una máquina goblin parece **bien
construida**, está mal. Tiene que dar la sensación de que vibra demasiado.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (piel cetrina, latón sucio) | `#6f8f3a`, `#b87333` |
| Luz (chispa, soplete) | `#ffd34d`, `#fff0b8` |
| Sombra (hollín, grasa) | `#1a1613` |
| Acento (pintura roja de aviso, cobre) | `#c0392b`, `#c9a227` |

**Materiales**: chatarra remachada mal, latón, cuerda, correas de cuero, tubos
de cobre, calderines, parches soldados encima de parches, pólvora, grasa negra,
cristal de botella.

**Formas**: todo asimétrico. Orejas largas, dientes afilados, ojos enormes
—muchas veces detrás de gafas de soldador—, cuerpos pequeños manejando máquinas
desproporcionadas. Nada está nivelado.

**Tono**: **divertido y peligroso**, nunca asqueroso ni cruel. Un goblin mirando
su invento con orgullo justo antes de que estalle. Si una ilustración da asco en
vez de risa, está mal — eso es territorio de Plaga.

---

## 2. Las mecánicas propias

### CHISPA

> **Chispa** — Al jugar esta carta se lanza una chispa. A cara obtienes un
> efecto; a cruz, el otro.

**La regla de oro: las dos caras son útiles.** Nunca «bueno o nada». Siempre
«una cosa o la otra», y las dos sirven para algo. Un hechizo no hace 4 de daño
o nada: hace 4 de daño a uno, o 2 a todos. Eso convierte el azar en **sorpresa**
en vez de en castigo, que es la diferencia entre divertido y odioso.

Esto no es cosmético: es lo que hace que la facción se pueda jugar. Si la mitad
de tus cartas fallaran, nadie la elegiría dos veces.

### PETARDAZO

> **Petardazo** — Cuando esta carta es destruida, inflige 2 de daño a todas las
> unidades adyacentes, **incluidas las tuyas**.

La segunda seña. Obliga a no amontonarse, que es exactamente lo que el resto
del juego premia, así que los goblins se despliegan distinto a todo el mundo. Y
convierte a tus propias piezas en una amenaza para el rival incluso cuando
pierdes el combate.

> Nota técnica: el motor ya lleva un generador aleatorio sembrado
> (`src/game/random.ts`) y la semilla vive en `MatchState`, así que la Chispa es
> **determinista y reproducible**: la misma partida da los mismos resultados y
> se puede probar. Lo implemento yo.

---

## 3. El comandante

### `bromuro-el-afortunado`
- **Nombre**: Bromuro · **Título**: El Afortunado · **Facción**: Goblins
- **Vida del Nexo**: 35
- **Pasiva**: La primera Chispa de cada turno se lanza dos veces: te quedas con el resultado que prefieras.
- **Poder (una vez por partida, 2 genérico + 1 chispeante)**: «¿Y si…?» — todas tus unidades ganan Petardazo hasta el final del turno.
- **Sabor**: «Ha perdido tres dedos, dos cejas y un ayudante. Dice que va ganando.»
- **Prompt de retrato**: *Retrato en tres cuartos de un goblin viejo y menudo, piel verde cetrina llena de cicatrices pequeñas, una ceja quemada y la otra no, gafas de soldador levantadas sobre la frente con un cristal rajado. Lleva un chaleco de cuero cubierto de herramientas, bolsillos y cables, y sostiene con las dos manos un artefacto de latón lleno de tubos del que ya sale humo. Sonríe enseñando los dientes, encantado. Detrás, un taller caótico con chatarra apilada hasta el techo. Luz cálida de soplete desde abajo. Paleta Goblins.*

---

## 4. Las 31 cartas

**17 de 31 funcionan con lo que ya existe**; 14 usan Chispa o Petardazo.

---

### 4.1 Fuente

#### `fuente-goblin`
- **Nombre**: Fuente Chispeante · **Tipo**: Esencia — Fuente · **Rareza**: Común
- **Coste**: 0 · **Reglas**: Agota esta fuente: genera 1 de Esencia Chispeante.
- **Sabor**: «Funciona. No preguntes por qué, que se enfada.»
- **Prompt**: *Un generador casero hecho con un calderín de cobre abollado, bobinas de cable mal enrolladas y una manivela, con arcos de electricidad amarilla saltando entre dos bornes y chispas cayendo al suelo. Está sujeto con cuerda a un banco de trabajo. Sin figuras, composición vertical centrada. Paleta Goblins.*

---

### 4.2 Unidades (14)

#### `pinche-de-polvora`
- **Tipo**: Unidad — Goblin · **Rareza**: Común · **Coste**: 0 gen + 1 chispeante
- **ATQ/VID**: 1/2 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Petardazo.
- **Sabor**: «Su trabajo es llevar el barril. Solo eso. Llevarlo.»
- **Prompt**: *Un goblin muy pequeño y flaco cargando a la espalda un barril de pólvora casi más grande que él, caminando de puntillas con cara de concentración absoluta. Una mecha asoma del barril, todavía apagada. Fondo de taller en penumbra. Cómico y tenso a la vez. Paleta Goblins.*

#### `buscachatarra`
- **Tipo**: Unidad — Goblin · **Rareza**: Común · **Coste**: 1 gen + 1 chispeante
- **ATQ/VID**: 1/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Al entrar en juego, escruta 1.
- **Sabor**: «Lo que para ti es basura, para él es inventario.»
- **Prompt**: *Un goblin con un saco enorme al hombro rebuscando en una montaña de chatarra, sosteniendo en alto un engranaje oxidado y mirándolo a contraluz con un ojo cerrado, satisfecho. Piezas sueltas por todas partes. Paleta Goblins.*

#### `artillero-chapucero`
- **Tipo**: Unidad — Goblin · **Rareza**: Común · **Coste**: 1 gen + 1 chispeante
- **ATQ/VID**: 2/2 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Chispa — cara: inflige 1 de daño adicional al atacar. Cruz: tu unidad adyacente recibe 1.
- **Sabor**: «Dispara. Luego mira dónde ha dado.»
- **Prompt**: *Un goblin con gafas de soldador disparando un cañón de mano improvisado hecho con un tubo de cobre y correas, el retroceso echándolo hacia atrás, humo saliendo por tres sitios distintos del arma. Expresión de sorpresa, no de puntería. Paleta Goblins.*

#### `jinete-de-jabali`
- **Tipo**: Unidad — Goblin · **Rareza**: Común · **Coste**: 1 gen + 1 chispeante
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Impulso.
- **Sabor**: «El jabalí tampoco sabe a dónde van. Eso los une.»
- **Prompt**: *Un goblin montado a pelo sobre un jabalí enorme y furioso que carga de frente, agarrado a las cerdas del lomo con las dos manos y gritando de emoción. Barro saltando, colmillos del jabalí muy marcados. Movimiento desatado. Paleta Goblins.*

#### `mecanico-de-urgencia`
- **Tipo**: Unidad — Goblin · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 chispeante
- **ATQ/VID**: 1/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al comienzo de tu turno, una estructura aliada recupera 2 de Resistencia.
- **Sabor**: «No lo arregla. Lo deja funcionando, que no es lo mismo.»
- **Prompt**: *Un goblin medio metido dentro del costado abierto de una máquina, solo se le ven las piernas y una mano saliendo a buscar una llave inglesa. Chispas saliendo del hueco. Herramientas desperdigadas por el suelo. Humor físico. Paleta Goblins.*

#### `lanzabombas`
- **Tipo**: Unidad — Goblin · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 chispeante
- **ATQ/VID**: 2/3 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Chispa — cara: al atacar inflige 1 a las unidades adyacentes al objetivo. Cruz: inflige 1 a las adyacentes a sí mismo.
- **Sabor**: «La diferencia entre las dos cosas es el viento.»
- **Prompt**: *Un goblin lanzando con las dos manos una bomba esférica con la mecha encendida, en el instante en que se le escapa de los dedos, con cara de duda. Al fondo, otro goblin agachándose por si acaso. Paleta Goblins.*

#### `cuadrilla-de-sabotaje`
- **Tipo**: Unidad — Goblin · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 chispeante
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Cuando ataca a una estructura, inflige 3 de daño adicional.
- **Sabor**: «Tres minutos. Les basta con tres minutos a solas con la pared.»
- **Prompt**: *Tres goblins trabajando a la vez en la base de un muro de piedra: uno colocando cargas, otro desenrollando mecha y el tercero vigilando con un espejito. Nocturno, linterna tapada con un trapo. Conspirativo y divertido. Paleta Goblins.*

#### `probador-voluntario`
- **Tipo**: Unidad — Goblin · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 chispeante
- **ATQ/VID**: 3/1 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Petardazo. Golpe veloz.
- **Sabor**: «Nadie se ofreció. Él levantó la mano dos veces.»
- **Prompt**: *Un goblin con casco de cuero y gafas, atado con correas a una mochila-cohete humeante, dando el pulgar hacia arriba con una sonrisa enorme mientras otro goblin al fondo se tapa los ojos. Instante antes del despegue. Paleta Goblins.*

#### `coheteador`
- **Tipo**: Unidad — Goblin · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 chispeante
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador.
- **Sabor**: «Volar es fácil. Lo caro es aterrizar.»
- **Prompt**: *Un goblin volando en diagonal con un planeador casero de tela remendada y varillas, propulsado por dos cohetes atados a los lados que escupen llama. Pasa rozando una chimenea. Cielo abierto con nubes bajas. Paleta Goblins.*

#### `acorazado-de-latas`
- **Tipo**: Unidad — Goblin · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 chispeante
- **ATQ/VID**: 1/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «Pesa tanto que ya no puede quitárselo. Ha decidido que es una ventaja.»
- **Prompt**: *Un goblin pequeño dentro de una armadura absurda hecha con cacerolas, tapas de barril y chapas remachadas de distintos colores, apenas asomando los ojos por una rendija. Postura firme y orgullosa. Paleta Goblins.*

#### `capataz-griton`
- **Tipo**: Unidad — Goblin · **Rareza**: Rara · **Coste**: 1 gen + 2 chispeante
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Cuando ataca, tus otras unidades adyacentes ganan +1 de Ataque.
- **Sabor**: «No sabe arreglar nada. Sabe gritar, que a veces basta.»
- **Prompt**: *Un goblin subido a un bidón volcado, con un megáfono de latón enorme, gritando órdenes con la vena del cuello hinchada mientras otros goblins corren alrededor cargando cosas. Energía y ruido. Paleta Goblins.*

#### `ingeniera-jefa`
- **Tipo**: Unidad — Goblin · **Rareza**: Rara · **Coste**: 1 gen + 2 chispeante
- **ATQ/VID**: 3/4 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Tus Chispas se lanzan dos veces: te quedas con el resultado que prefieras.
- **Sabor**: «La suerte es una variable. Ella la ha despejado.»
- **Prompt**: *Una goblin de mediana edad con el pelo recogido en un moño atravesado por un destornillador, delantal de cuero lleno de quemaduras, señalando un plano enorme extendido sobre una mesa mientras dos ayudantes toman nota. Seria y competente en mitad del caos. Paleta Goblins.*

#### `maquina-andante`
- **Tipo**: Unidad — Artefacto · **Rareza**: Rara · **Coste**: 2 gen + 2 chispeante
- **ATQ/VID**: 5/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Petardazo.
- **Sabor**: «Dos pilotos: uno para andar y otro para frenar. Discuten.»
- **Prompt**: *Un caminante bípedo improvisado de dos pisos de alto, hecho con calderas, tubos y patas de chatarra, con una cabina abierta arriba donde se ven dos goblins peleándose por las palancas. Vapor saliendo de las juntas. Visto en contrapicado. Paleta Goblins.*

#### `el-gran-petardo`
- **Tipo**: Unidad — Artefacto · **Rareza**: Mítica · **Coste**: 2 gen + 3 chispeante
- **ATQ/VID**: 4/7 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Petardazo. Cuando es destruido, inflige además 3 de daño al Nexo rival.
- **Sabor**: «Llevan dos generaciones construyéndolo. Nadie sabe para qué sirve hasta que muere.»
- **Prompt**: *Una máquina colosal con forma de bomba rematada en una hélice, cubierta de parches soldados, cables y señales de peligro pintadas a mano en rojo, rodeada de andamios con goblins minúsculos todavía trabajando en ella. Escala monumental y ridícula a la vez. Paleta Goblins.*

---

### 4.3 Hechizos (9)

#### `chispazo`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 0 gen + 1 chispeante
- **Reglas**: Chispa — cara: inflige 3 de daño a una unidad enemiga. Cruz: inflige 1 a todas las unidades enemigas.
- **Sabor**: «Apunta a uno. Da igual.»
- **Prompt**: *Un arco eléctrico amarillo saltando de un borne de cobre y ramificándose en el aire en varias direcciones. Primer plano, fondo oscuro, sin figuras. Abstracto y vibrante. Paleta Goblins.*

#### `a-ver-que-pasa`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 chispeante
- **Reglas**: Chispa — cara: roba 2 cartas. Cruz: roba 1 y una unidad aliada gana +2 de Ataque hasta el final del turno.
- **Sabor**: «La frase más repetida del gremio. También la última de varios.»
- **Prompt**: *Un goblin con el dedo suspendido a un centímetro de un botón rojo grande y sin etiqueta, en un panel lleno de botones igual de rojos y sin etiquetar. Primerísimo plano del dedo y el botón. Tensión cómica. Paleta Goblins.*

#### `remiendo-rapido`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 0 gen + 1 chispeante
- **Reglas**: Una unidad aliada gana un escudo de 3.
- **Sabor**: «Con cinta basta. Con cinta siempre basta.»
- **Prompt**: *Un tubo reventado del que sale vapor a presión, envuelto a toda prisa con varias vueltas de cinta de tela y un trapo atado encima, que casi aguanta. Manos verdes trabajando deprisa. Primer plano. Paleta Goblins.*

#### `doble-o-nada`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 chispeante
- **Reglas**: Chispa — cara: una unidad aliada gana +3/+3 permanentes. Cruz: gana +1/+1 permanentes y Petardazo.
- **Sabor**: «Siempre gana algo. Esa es la trampa.»
- **Prompt**: *Dos goblins jugándose algo a las chapas sobre un barril, con un montón de tuercas y dientes de oro de por medio, justo en el instante en que la moneda está en el aire y los dos miran hacia arriba. Paleta Goblins.*

#### `mecha-corta`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 chispeante
- **Reglas**: Inflige 2 de daño a una unidad enemiga y la aturde.
- **Sabor**: «La cortó para que llegara antes. Llegó antes.»
- **Prompt**: *Una mecha encendida muy corta, con la chispa a punto de entrar en la carga, vista en primerísimo plano macro con el fondo completamente desenfocado. Dramático y simple. Paleta Goblins.*

#### `rebusca-en-la-chatarra`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 chispeante
- **Reglas**: Escruta 2 y roba 1 carta.
- **Sabor**: «Aquí hay de todo. El problema es encontrarlo dos veces.»
- **Prompt**: *Vista cenital de una montaña de chatarra con un goblin diminuto en el centro, excavando un hueco del que sale luz amarilla. Textura densísima de piezas metálicas. Paleta Goblins.*

#### `sabotaje`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Rara · **Coste**: 1 gen + 1 chispeante
- **Reglas**: Destruye todas las estructuras enemigas.
- **Sabor**: «No lo tiraron abajo. Le quitaron el tornillo que importaba.»
- **Prompt**: *Un andamio de madera y metal viniéndose abajo en cadena, con una pieza clave ya caída en primer plano y el resto de la estructura doblándose. Polvo y astillas. Sin figuras visibles. Paleta Goblins.*

#### `invento-sin-probar`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 1 gen + 2 chispeante
- **Reglas**: Chispa — cara: inflige 5 de daño a una unidad enemiga. Cruz: inflige 3 a esa unidad y 3 al Nexo rival.
- **Sabor**: «Lo bueno de no haberlo probado es que las dos cosas son novedad.»
- **Prompt**: *Un artefacto de latón con demasiadas partes móviles encima de un banco, en el momento en que empieza a girar solo y a soltar humo de colores distintos por cada tubo. Un goblin al borde del encuadre retrocediendo. Paleta Goblins.*

#### `fiesta-de-la-polvora`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Mítica · **Coste**: 2 gen + 2 chispeante
- **Reglas**: Inflige 3 de daño a todas las unidades, aliadas incluidas. Roba 1 carta por cada unidad aliada destruida así.
- **Sabor**: «Hubo heridos, hubo premios y hubo que mudar el taller. Repiten el año que viene.»
- **Prompt**: *Un cielo nocturno lleno de fuegos artificiales caóticos de todos los colores, lanzados desde un patio donde se ve chatarra ardiendo y siluetas de goblins celebrando con los brazos en alto. Festivo y claramente fuera de control. Paleta Goblins.*

---

### 4.4 Estructuras (7)

#### `torreta-de-chatarra`
- **Tipo**: Estructura — Torreta · **Rareza**: Común · **Coste**: 1 gen + 1 chispeante · **Resistencia**: 4
- **Reglas**: Al comienzo de tu turno, inflige 1 de daño a la unidad enemiga más cercana.
- **Sabor**: «Dispara sola. Al principio eso parecía bueno.»
- **Prompt**: *Una torreta improvisada montada sobre un trípode torcido, con un cañón de tubo de estufa, una mira hecha con un embudo y una cinta de munición colgando. Atada a un poste con cuerda. Sin figuras. Paleta Goblins.*

#### `taller-de-remiendos`
- **Tipo**: Estructura — Taller · **Rareza**: Común · **Coste**: 1 gen + 1 chispeante · **Resistencia**: 4
- **Reglas**: Al comienzo de tu turno, una unidad aliada dañada recupera 1 de Vida.
- **Sabor**: «Aquí se arregla todo. Peor, pero se arregla.»
- **Prompt**: *Una caseta de taller abierta por delante, con un banco lleno de herramientas, piezas colgando del techo y un yunque pequeño. Luz amarilla saliendo del interior. Sin figuras. Paleta Goblins.*

#### `barril-de-polvora`
- **Tipo**: Estructura — Carga · **Rareza**: Infrecuente · **Coste**: 0 gen + 1 chispeante · **Resistencia**: 2
- **Reglas**: Petardazo. Cuando es destruido, inflige 4 de daño en vez de 2.
- **Sabor**: «No lo pongas ahí. No lo pongas ahí. Lo ha puesto ahí.»
- **Prompt**: *Un barril de pólvora grande con la tapa mal cerrada y una calavera pintada a mano con pintura roja chorreante, apoyado solo en medio de un patio vacío. La mecha enrollada encima. Sin figuras, y eso lo hace peor. Paleta Goblins.*

#### `montana-de-chatarra`
- **Tipo**: Estructura — Depósito · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 chispeante · **Resistencia**: 6
- **Reglas**: Al comienzo de tu turno, escruta 1.
- **Sabor**: «Está todo clasificado. En su cabeza.»
- **Prompt**: *Una montaña de chatarra enorme con un camino en espiral subiendo por fuera y carteles escritos a mano clavados en distintos niveles. Al fondo, más montañas iguales. Sin figuras. Paleta Goblins.*

#### `tobogan-de-tubos`
- **Tipo**: Estructura — Vía · **Rareza**: Rara · **Coste**: 1 gen + 1 chispeante · **Resistencia**: 4
- **Reglas**: Tus unidades tienen +1 de Movimiento.
- **Sabor**: «Se entra por arriba y se sale por donde sea. Es parte de la diversión.»
- **Prompt**: *Una maraña de tubos de gran diámetro cruzándose en todas direcciones entre edificios, con bocas de entrada señalizadas con flechas pintadas y un goblin saliendo disparado por una de ellas. Paleta Goblins.*

#### `maquina-de-la-suerte`
- **Tipo**: Estructura — Artefacto · **Rareza**: Rara · **Coste**: 1 gen + 2 chispeante · **Resistencia**: 5
- **Reglas**: Tus Chispas se lanzan dos veces: te quedas con el resultado que prefieras.
- **Sabor**: «No hace trampas. Insiste, que es distinto.»
- **Prompt**: *Una máquina tragaperras monstruosa hecha con chatarra, con tres tambores de distinto tamaño, una palanca enorme con el mango de hueso y bombillas de colores alrededor. Algunas bombillas fundidas. Sin figuras. Paleta Goblins.*

#### `la-fabrica`
- **Tipo**: Estructura — Fábrica · **Rareza**: Mítica · **Coste**: 2 gen + 2 chispeante · **Resistencia**: 6
- **Reglas**: Al comienzo de tu turno, una unidad aliada gana Petardazo.
- **Sabor**: «Producción récord. Siniestralidad también. El capataz enmarcó los dos gráficos.»
- **Prompt**: *El interior de una nave industrial goblin a pleno rendimiento, con cintas transportadoras cruzándose a varias alturas, chimeneas soltando humo de colores y decenas de goblins diminutos trabajando. Caos organizado, luz naranja de hornos. Paleta Goblins.*

---

## 5. Cómo se juega esta facción

Los goblins no planean: **reaccionan rápido y barato**. Su curva es la más baja
del juego y su mazo el que más cartas mete en la mesa por turno, porque casi
todo cuesta uno o dos.

Lo que de verdad hay que aprender a pilotar es el Petardazo. El resto del juego
premia agrupar unidades —auras, guardias, apoyos— y aquí eso te mata. Los
goblins se despliegan **en diagonal y separados**, y el rival que no se dé
cuenta pierde media mesa al matar tu barril.

La Chispa no se intenta controlar: se asume. Las dos caras sirven, así que lo
que hay que hacer es jugarlas cuando **cualquiera de los dos resultados** te
venga bien. Si necesitas que salga una en concreto, has jugado la carta en mal
momento.

La `maquina-de-la-suerte` y la `ingeniera-jefa` son las que convierten el mazo
de caótico en fiable, porque te dejan elegir. Si el rival las ignora, la
facción deja de ser una tómbola.

Su punto débil es el aguante: casi todo tiene 1, 2 o 3 de Vida. Contra Orden o
los Inmortales, si no cierras pronto, no cierras.

---

## 6. Checklist de entrega

- [ ] 32 ilustraciones (31 cartas + retrato del comandante).
- [ ] **Cada archivo nombrado con el id de su carta**, en minúsculas y con guiones: `pinche-de-polvora.png`, `fuente-goblin.png`, etc. Nada de nombres automáticos.
- [ ] Formato vertical, mínimo 1024 × 1536, PNG o JPG.
- [ ] Dejar todo en una carpeta dentro de `tools/art-inbox/`.
- [ ] Revisar que ninguna máquina parezca **bien construida**: si parece de Forja, repetirla.
- [ ] Revisar que el tono sea de risa y no de asco: si parece Plaga, repetirla.
