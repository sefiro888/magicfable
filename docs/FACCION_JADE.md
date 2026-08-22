# Facción nueva · JADE — «El Mandato del Cielo»

Dosier completo de la facción china: mitología, burocracia celestial y los
cinco elementos. Identidad, mecánica propia, comandante y **31 cartas** con su
prompt de arte.

---

## 1. Por qué esta facción y en qué se diferencia

China tiene dos trampas evidentes y las dos se esquivan a propósito:

- **No es Orden con dragones.** Orden defiende una posición: escudos, muros,
  simetría. Jade **no defiende, gobierna**: su fuerza no está en aguantar sino
  en tener la razón, y la razón es un objeto que se puede perder y arrebatar.
- **No es Arcano con farolillos.** Arcano niega y congela. Jade **legitima**:
  no impide que hagas cosas, sino que decide cuál de los dos las hace mejor.

Ninguna facción del juego tiene hoy un recurso único que cambie de dueño
durante la partida. Ese es el hueco: un solo objeto en la mesa que los dos
quieren, y media facción que rinde según quién lo tenga.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (laca roja, cinabrio) | `#b8322c` |
| Luz (oro imperial, seda amarilla) | `#f2c14e`, `#fff0c2` |
| Sombra (tinta china, madera de ébano) | `#141210` |
| Acento (jade, azul martín pescador) | `#4aa88a`, `#2f7fb5` |

**Materiales**: jade tallado, laca roja, bronce ritual, seda bordada, papel de
arroz, porcelana azul y blanca, tejas vidriadas. **Formas**: aleros curvos,
nubes enroscadas, dragones sin alas y serpentinos, sellos cuadrados, biombos,
grullas. **Tono**: ceremonioso y ordenado, con el color muy saturado sobre
fondos de tinta. Nada de chinoiserie de restaurante ni de artes marciales de
película: esto es una corte celestial funcionando, con su papeleo al día.

---

## 2. Las mecánicas propias

### El Mandato

> **El Mandato Celestial** es un único favor que está siempre en poder de uno
> de los dos jugadores, o de ninguno. Algunas cartas lo **reclaman** al entrar
> en juego; otras dicen «**Mandato:** …» y solo hacen esa parte mientras lo
> tengas tú.

Es la mecánica insignia y no se parece a nada del juego: no es un recurso que
se gasta ni un contador que sube, es **una sola cosa que cambia de bando**. El
rival puede quitártelo, y en el momento en que lo hace media docena de tus
cartas se apagan de golpe.

Se pierde también solo: si al final de tu turno no controlas ninguna unidad, el
Mandato se te cae. El Cielo no respalda a quien no tiene nada sobre la mesa.

### Los cinco elementos

> **Generación** — Cada carta de Jade lleva uno de los cinco elementos (Madera,
> Fuego, Tierra, Metal, Agua). Si al desplegar una unidad ya controlas otra del
> elemento que la **genera**, entra con +1/+1.

El ciclo es fijo y siempre el mismo: **Madera alimenta al Fuego, el Fuego hace
Tierra, la Tierra da Metal, el Metal recoge Agua, el Agua nutre la Madera.**

No es una segunda moneda: es una razón para pensar el **orden** en que juegas
lo que ya tenías en la mano. Bien encadenado, un mazo de Jade despliega
criaturas un punto por encima de su coste durante toda la partida.

> Nota técnica: el Mandato es un campo más en el estado de la partida
> (`mandate?: PlayerId`), del mismo tipo que el ganador, y las cartas que lo
> consultan funcionan igual que Juicio en Duna. Generación necesita un campo
> `element` en la carta y una tabla fija de cinco entradas.

---

## 3. El comandante

### `xiwangmu-la-reina-madre`

- **Nombre**: Xiwangmu · **Título**: La Reina Madre de Occidente
- **Facción**: Jade · **Vida del Nexo**: 35
- **Pasiva**: Mientras tengas el Mandato, la primera carta que juegas cada
  turno cuesta 1 genérico menos.
- **Poder (una vez por partida, 2 genérico + 1 jade)**: «Melocotón de la
  Inmortalidad» — cura 8 a tu Nexo, robas 1 carta y reclamas el Mandato.
- **Sabor**: «Su jardín da fruta cada tres mil años. Sabe esperar.»
- **Prompt de retrato**: *Retrato en tres cuartos de una mujer de rasgos
  serenos y edad indefinida, tocado alto de jade y oro con colgantes que caen
  sobre la frente, túnica de seda roja con bordado de nubes y grullas. Sostiene
  un melocotón en la palma abierta. Fondo: jardín de melocotoneros en flor con
  niebla baja y un pabellón de aleros curvos. Autoridad tranquila, ni cruel ni
  maternal. Paleta Jade.*

---

## 4. Las 31 cartas

Cada ficha trae: **id** (nombre de archivo), datos de juego, elemento y el
prompt de arte. La columna «motor» avisa de si la carta usa mecánica que el
juego ya sabe resolver o si hay que programar algo.

---

### 4.1 Fuente

#### `fuente-jade`
- **Tipo**: Esencia — Fuente · **Rareza**: Común · **Coste**: 0
- **Reglas**: Agota esta fuente: genera 1 de Esencia de Jade.
- **Sabor**: «El sello se moja en cinabrio y la orden ya existe.»
- **Motor**: ya soportado
- **Prompt**: *Un sello imperial cuadrado de jade verde con un dragón tallado
  en la empuñadura, junto a una almohadilla de pasta de cinabrio roja y una
  hoja de papel de arroz, sobre una mesa de madera lacada. Luz lateral suave.
  Sin figuras. Paleta Jade.*

---

### 4.2 Unidades (15)

#### `guardia-de-terracota`
- **Tipo**: Unidad — Constructo · **Rareza**: Común · **Coste**: 1 gen + 1 jade
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1 · **Elemento**: Tierra
- **Reglas**: Guardia.
- **Sabor**: «Lleva dos mil años en formación. No ha roto filas.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Un guerrero de terracota de tamaño real, con armadura de placas
  esculpida y restos de pintura original en rojo y verde, de pie en formación
  con otros que se pierden en la penumbra de una fosa. Grave, inmóvil. Paleta
  Jade.*

#### `grulla-mensajera`
- **Tipo**: Unidad — Ave · **Rareza**: Común · **Coste**: 1 gen + 1 jade
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 3 · **Elemento**: Metal
- **Reglas**: Volador. Al entrar en juego, escruta 1.
- **Sabor**: «Lleva la respuesta antes de que termines la pregunta.»
- **Motor**: ya soportado (`flying` + `scry`)
- **Prompt**: *Una grulla de corona roja en vuelo sobre un mar de nubes al
  amanecer, con un pequeño rollo de papel atado a la pata con hilo rojo. Cuello
  estirado, alas amplias. Composición vertical de pintura sobre seda. Paleta
  Jade.*

#### `jinete-de-la-estepa`
- **Tipo**: Unidad — Soldado · **Rareza**: Común · **Coste**: 1 gen + 1 jade
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 3 · **Elemento**: Madera
- **Reglas**: Impulso.
- **Sabor**: «Llegó desde el norte y no piensa explicar cómo.»
- **Motor**: ya soportado (`impulse`)
- **Prompt**: *Un jinete de las estepas galopando con el cuerpo girado hacia
  atrás para disparar el arco, caballo pequeño y robusto, capa de fieltro
  ondeando. Hierba alta y cielo enorme. Movimiento congelado. Paleta Jade.*

#### `funcionario-del-censo`
- **Tipo**: Unidad — Humanoide · **Rareza**: Común · **Coste**: 0 gen + 1 jade
- **ATQ/VID**: 1/3 · **Alcance** 1 · **Movimiento** 1 · **Elemento**: Agua
- **Reglas**: Al entrar en juego, robas 1 carta y descartas 1.
- **Sabor**: «Anota a los vivos, a los muertos y a los que están en ello.»
- **Motor**: ya soportado (robar + descartar)
- **Prompt**: *Un funcionario con toga oscura y gorro alado de erudito,
  sentado ante una mesa baja llena de rollos y un ábaco, mojando el pincel en
  la tinta. Concentrado, indiferente al alboroto del patio tras él. Paleta
  Jade.*

#### `arquero-de-la-muralla`
- **Tipo**: Unidad — Soldado · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 jade
- **ATQ/VID**: 2/3 · **Alcance** 3 · **Movimiento** 1 · **Elemento**: Metal
- **Reglas**: Ninguna.
- **Sabor**: «Ve venir el problema con dos días de antelación.»
- **Motor**: ya soportado
- **Prompt**: *Un arquero apostado en una almena de piedra de la Gran Muralla,
  ballesta apoyada en el parapeto, mirando hacia unas colinas que se pierden en
  la bruma. Uniforme acolchado, gorro cónico. Amanecer frío. Paleta Jade.*

#### `alquimista-del-cinabrio`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 jade
- **ATQ/VID**: 2/3 · **Alcance** 2 · **Movimiento** 1 · **Elemento**: Fuego
- **Reglas**: Mandato: al final de tu turno, cura 2 a tu Nexo.
- **Sabor**: «Busca la vida eterna. De momento ha encontrado la pólvora.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Un alquimista anciano de barba fina soplando un fuelle bajo un
  horno de crisol, con frascos de cinabrio rojo y polvos de colores alineados
  en un estante. Vapores densos, luz naranja desde abajo. Paleta Jade.*

#### `tigre-blanco-del-oeste`
- **Tipo**: Unidad — Bestia · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 jade
- **ATQ/VID**: 4/3 · **Alcance** 1 · **Movimiento** 2 · **Elemento**: Metal
- **Reglas**: Golpe veloz.
- **Sabor**: «Uno de los cuatro. El que no espera su turno.»
- **Motor**: ya soportado (`swift-strike`)
- **Prompt**: *Un tigre de pelaje blanco puro con rayas negras, saltando entre
  bambúes bajo una luna llena, con vetas de niebla plateada alrededor. Elegante
  y letal. Composición de pintura sobre seda. Paleta Jade.*

#### `tortuga-negra-del-norte`
- **Tipo**: Unidad — Bestia · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 jade
- **ATQ/VID**: 1/7 · **Alcance** 1 · **Movimiento** 1 · **Elemento**: Agua
- **Reglas**: Guardia. No puede ser aturdida.
- **Sabor**: «Otro de los cuatro. Este sí espera.»
- **Motor**: nueva (inmunidad a estado; ya existe en Duna)
- **Prompt**: *Una tortuga colosal de caparazón negro cubierto de musgo, con
  una serpiente enroscada al cuello y a la cola, medio sumergida en un lago
  helado con vapor sobre el agua. Ancestral, tranquila. Paleta Jade.*

#### `ave-bermeja-del-sur`
- **Tipo**: Unidad — Ave · **Rareza**: Rara · **Coste**: 1 gen + 2 jade
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 3 · **Elemento**: Fuego
- **Reglas**: Volador. Al entrar en juego, inflige 2 de daño a todas las unidades enemigas.
- **Sabor**: «El tercero de los cuatro. Trae el verano de golpe.»
- **Motor**: ya soportado (`flying` + `damage-all-enemies`)
- **Prompt**: *Un ave fénix de plumaje bermellón y dorado con cola de cintas
  larguísimas, ascendiendo entre llamas y nubes de tinta. Alas desplegadas del
  todo, cabeza alta. Paleta Jade.*

#### `qilin-de-buen-augurio`
- **Tipo**: Unidad — Bestia · **Rareza**: Rara · **Coste**: 2 gen + 1 jade
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 2 · **Elemento**: Madera
- **Reglas**: Al entrar en juego, reclama el Mandato.
- **Sabor**: «Solo aparece cuando el que gobierna lo merece. Lleva siglos sin salir.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Un qilin —cuerpo de ciervo con escamas de dragón, un solo
  cuerno, melena de fuego— pisando sobre un prado sin doblar una brizna de
  hierba, con pequeñas llamas flotando a su alrededor. Amanecer dorado.
  Majestuoso y apacible. Paleta Jade.*

#### `monje-de-la-montana`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 jade
- **ATQ/VID**: 3/3 · **Alcance** 1 · **Movimiento** 2 · **Elemento**: Tierra
- **Reglas**: Mandato: gana +2 de Ataque.
- **Sabor**: «Baja del monasterio una vez al año, y nunca por gusto.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Un monje de hábito azafrán y cabeza rapada en postura de
  combate sobre un puente de piedra, con un bastón largo, entre picos de
  montaña envueltos en niebla. Calma total en la cara. Paleta Jade.*

#### `zorra-de-nueve-colas`
- **Tipo**: Unidad — Horror · **Rareza**: Rara · **Coste**: 2 gen + 1 jade
- **ATQ/VID**: 4/3 · **Alcance** 1 · **Movimiento** 2 · **Elemento**: Fuego
- **Reglas**: Al entrar en juego, el rival descarta 1 carta. Mandato: descarta 2 en su lugar.
- **Sabor**: «Entró en palacio como concubina. Salió como dinastía.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Una mujer elegantísima de kimono cortesano rojo y dorado, con
  nueve colas de zorro blancas desplegadas tras ella como un abanico y los ojos
  ambarinos. Interior de palacio con biombos y farolillos. Bella e inquietante.
  Paleta Jade.*

#### `leon-guardian-de-bronce`
- **Tipo**: Unidad — Constructo · **Rareza**: Rara · **Coste**: 2 gen + 2 jade
- **ATQ/VID**: 4/6 · **Alcance** 1 · **Movimiento** 1 · **Elemento**: Metal
- **Reglas**: Guardia. Perforar.
- **Sabor**: «Uno a cada lado de la puerta. Nadie ha comprobado si se mueven.»
- **Motor**: ya soportado (`guard` + `pierce`)
- **Prompt**: *Un león guardián de bronce dorado con melena de rizos tallados
  y una pata sobre una esfera labrada, sobre un pedestal de mármol a la entrada
  de un palacio. Boca abierta, expresión feroz. Detalle de orfebrería. Paleta
  Jade.*

#### `dragon-del-rio-amarillo`
- **Tipo**: Unidad — Dragón · **Rareza**: Mítica · **Coste**: 3 gen + 2 jade
- **ATQ/VID**: 6/6 · **Alcance** 2 · **Movimiento** 2 · **Elemento**: Agua
- **Reglas**: Volador. Mandato: además, al entrar, congela 2 turnos a la unidad enemiga con más Ataque.
- **Sabor**: «El río lleva su nombre porque él llegó primero.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Un dragón chino largo y serpentino de escamas doradas y verdes,
  sin alas, emergiendo entre nubes y agua revuelta sobre un río ancho de aguas
  ocres. Barbas largas, garras de cuatro dedos, perla flotando ante el hocico.
  Paleta Jade.*

#### `general-de-los-mil-estandartes`
- **Tipo**: Unidad — Soldado · **Rareza**: Mítica · **Coste**: 4 gen + 2 jade
- **ATQ/VID**: 6/7 · **Alcance** 1 · **Movimiento** 2 · **Elemento**: Tierra
- **Reglas**: Al entrar en juego, reclama el Mandato. Mandato: tus otras unidades ganan +1 de Ataque.
- **Sabor**: «No pierde batallas. Las aplaza hasta que las gana.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Un general con armadura de escamas laminadas rojas y doradas,
  yelmo con plumas de faisán larguísimas, de pie sobre un promontorio con
  cientos de estandartes tras él perdiéndose en el polvo. Barba larga, gesto
  sereno. Paleta Jade.*

---

### 4.3 Hechizos (9)

#### `sello-imperial`
- **Tipo**: Hechizo inmediato — Decreto · **Rareza**: Común · **Coste**: 0 gen + 1 jade
- **Reglas**: Reclama el Mandato y escruta 1.
- **Sabor**: «No hace falta que estés de acuerdo. Solo que esté sellado.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Un sello de jade estampándose sobre un documento desplegado,
  con la marca roja recién impresa y aún brillante, manos de funcionario
  sujetando el papel. Primer plano cenital. Paleta Jade.*

#### `mandato-revocado`
- **Tipo**: Hechizo inmediato — Decreto · **Rareza**: Rara · **Coste**: 1 gen + 1 jade
- **Reglas**: Reclama el Mandato. Si lo tenía el rival, además robas 2 cartas.
- **Sabor**: «El Cielo no destituye a nadie. Simplemente deja de mirarle.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Un edicto de seda amarilla ardiendo por una esquina en el
  suelo de un salón vacío del trono, con el sello roto en dos mitades junto a
  él. Nadie a la vista. Dramático y silencioso. Paleta Jade.*

#### `fuegos-de-artificio`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 jade
- **Reglas**: Inflige 3 de daño a una unidad enemiga.
- **Sabor**: «Se inventaron para espantar espíritus. Funcionan con casi todo.»
- **Motor**: ya soportado (`damage`)
- **Prompt**: *Una explosión de fuegos artificiales rojos y dorados sobre los
  tejados vidriados de una ciudad amurallada de noche, con las chispas
  reflejadas en un canal. Sin figuras protagonistas. Paleta Jade.*

#### `viento-del-este`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 jade
- **Reglas**: Una unidad aliada puede volver a moverse y gana +2 de Ataque hasta el final del turno.
- **Sabor**: «Todo estaba listo. Solo faltaba que soplara.»
- **Motor**: ya soportado (refrescar movimiento + bono temporal)
- **Prompt**: *Una ráfaga de viento doblando un bosque de bambú entero hacia
  un lado, con hojas y pétalos arrastrados en diagonal y niebla desplazándose.
  Sin figuras. Sensación de fuerza invisible. Paleta Jade.*

#### `seda-y-veneno`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 jade
- **Reglas**: Una unidad enemiga pierde 3 de Vida al final de cada turno hasta que muere.
- **Sabor**: «En la corte, el regalo más caro es el que no se puede rechazar.»
- **Motor**: ya soportado (maldición de desgaste)
- **Prompt**: *Una bandeja lacada con una copa de porcelana y una tira de seda
  blanca doblada, presentada por unas manos con guantes en un salón en
  penumbra. Elegante y siniestro por lo que no se ve. Paleta Jade.*

#### `inundacion-del-rio`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Rara · **Coste**: 2 gen + 1 jade
- **Reglas**: Inflige 3 de daño a todas las unidades enemigas y les resta 1 de Movimiento este turno.
- **Sabor**: «Se le puso nombre de dolor: el Pesar de China.»
- **Motor**: ya soportado (`damage-all-enemies` + ralentización)
- **Prompt**: *Un río desbordado cubriendo campos de arroz aterrazados, con
  diques rotos y agua marrón arrastrando ramas, bajo un cielo cargado. Vista
  amplia desde una colina. Sin figuras. Paleta Jade.*

#### `examen-imperial`
- **Tipo**: Hechizo inmediato — Decreto · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 jade
- **Reglas**: Robas 2 cartas. Mandato: robas 3 en su lugar.
- **Sabor**: «Tres días encerrado en una celda con papel y tinta. Casi todos fallan.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Un patio enorme con cientos de celdas de examen idénticas en
  hileras, cada una con un candidato inclinado sobre su papel, vistas desde
  arriba. Orden abrumador. Paleta Jade.*

#### `eclipse-del-dragon`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Rara · **Coste**: 2 gen + 2 jade
- **Reglas**: Congela todas las unidades enemigas 1 turno.
- **Sabor**: «Se golpean tambores hasta que lo suelta. Siempre acaba soltándolo.»
- **Motor**: nueva (congelación masiva)
- **Prompt**: *Un eclipse solar con la corona brillando alrededor del disco
  negro, y en las nubes la silueta apenas insinuada de un dragón enroscado
  mordiendo el sol. Multitud diminuta abajo golpeando tambores. Paleta Jade.*

#### `decreto-de-jade`
- **Tipo**: Hechizo inmediato — Decreto · **Rareza**: Mítica · **Coste**: 2 gen + 2 jade
- **Reglas**: Mandato: destruye la unidad enemiga con más Ataque. Si no, inflige 4 de daño a una unidad enemiga y reclamas el Mandato.
- **Sabor**: «Una línea de tinta. Y una familia entera deja de existir.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Un rollo de decreto desplegado en el aire con caracteres
  caligrafiados en tinta negra brillante y el sello rojo al final, con luz
  verde de jade emanando de los trazos. Fondo de nubes estilizadas. Paleta
  Jade.*

---

### 4.4 Estructuras (6)

#### `gran-muralla`
- **Tipo**: Estructura — Fortaleza · **Rareza**: Rara · **Coste**: 2 gen + 1 jade · **Resistencia**: 9
- **Reglas**: Guardia.
- **Sabor**: «No se construyó para detener ejércitos, sino para que costara explicarlos.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Un tramo de muralla de piedra serpenteando por la cresta de
  montañas escarpadas hasta perderse en la niebla, con una torre de vigilancia
  en primer término. Amanecer, luz rasante. Paleta Jade.*

#### `torre-del-tambor`
- **Tipo**: Estructura — Torre · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 jade · **Resistencia**: 5
- **Reglas**: Tus unidades a distancia infligen 1 de daño adicional.
- **Sabor**: «Marca las horas. Y, si hace falta, el final de algunas.»
- **Motor**: ya soportado (`ranged-attack-bonus`)
- **Prompt**: *Una torre de tambor de tres pisos con aleros curvos y tejas
  vidriadas verdes, con un tambor enorme de piel visible en el piso superior y
  faroles rojos colgando. Atardecer. Paleta Jade.*

#### `altar-del-cielo`
- **Tipo**: Estructura — Altar · **Rareza**: Rara · **Coste**: 2 gen + 1 jade · **Resistencia**: 6
- **Reglas**: Mandato: al final de tu turno, robas 1 carta.
- **Sabor**: «Se sube una vez al año a rendir cuentas. Conviene llevarlas bien.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Un altar circular de mármol blanco de tres terrazas concéntricas
  con balaustradas talladas, vacío, bajo un cielo azul intenso. Simetría
  perfecta, vista ligeramente elevada. Paleta Jade.*

#### `horno-de-porcelana`
- **Tipo**: Estructura — Horno · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 jade · **Resistencia**: 4
- **Reglas**: Al final de tu turno, una unidad aliada gana un escudo de 2.
- **Sabor**: «Mil piezas entran. Salen nueve.»
- **Motor**: ya soportado (mantenimiento de escudo)
- **Prompt**: *Un horno de leña abovedado con la boca al rojo vivo y estantes
  de piezas de porcelana azul y blanca esperando fuera, en un taller con polvo
  de caolín en el aire. Luz naranja contra sombras. Paleta Jade.*

#### `pagoda-de-los-vientos`
- **Tipo**: Estructura — Pagoda · **Rareza**: Común · **Coste**: 1 gen + 1 jade · **Resistencia**: 5
- **Reglas**: Al final de tu turno, cura 2 a tu Nexo.
- **Sabor**: «Cada piso pesa menos que el de abajo. Por eso no se cae.»
- **Motor**: ya soportado (mantenimiento de curación)
- **Prompt**: *Una pagoda de siete pisos de madera roja y aleros curvos con
  campanillas colgando en cada esquina, entre pinos retorcidos y niebla, con
  las campanillas movidas por el viento. Paleta Jade.*

#### `palacio-de-jade`
- **Tipo**: Estructura — Palacio · **Rareza**: Mítica · **Coste**: 2 gen + 2 jade · **Resistencia**: 7
- **Reglas**: Mandato: al final de tu turno, una unidad aliada gana +1 de Ataque y +1 de Vida permanentes. Si no tienes el Mandato, esta estructura lo reclama.
- **Sabor**: «El Emperador de Jade no gobierna desde aquí. Gobierna esto.»
- **Motor**: nueva (Mandato)
- **Prompt**: *Un palacio flotante de jade verde traslúcido y oro suspendido
  sobre un mar de nubes, con puentes curvos que no llegan a ninguna parte y
  grullas volando entre los pabellones. Irreal, luminoso. Paleta Jade.*

---

## 5. Cómo se juega esta facción

Jade juega a tener razón. Sus primeras cartas reclaman el Mandato, y a partir
de ahí media facción rinde por encima de su coste: el monje pega el doble, la
zorra descarta dos, el dragón congela al entrar. El rival tiene que decidir si
gasta cartas en quitárselo o si acepta jugar por debajo el resto de la partida.

El ciclo de los elementos es la capa de abajo: no cambia lo que puedes hacer,
cambia **el orden** en que conviene hacerlo. Una mano bien encadenada despliega
criaturas un punto por encima durante toda la partida sin gastar nada extra.

Sus dos debilidades, deliberadas:

1. **Todo o nada.** Sin el Mandato, media facción son criaturas del montón a
   precio de criatura buena. Un rival que lo reclame dos veces seguidas la deja
   plana.
2. **Se le cae solo.** Si te barren el tablero y acabas el turno sin unidades,
   pierdes el Mandato aunque el rival no haya hecho nada por quitártelo.

Mazo inicial sugerido (50 cartas): 20 Fuente de Jade, 3 Guardia de Terracota,
2 Grulla Mensajera, 2 Jinete de la Estepa, 2 Funcionario del Censo,
2 Arquero de la Muralla, 2 Monje de la Montaña, 1 Alquimista del Cinabrio,
1 Tigre Blanco del Oeste, 1 Tortuga Negra del Norte, 1 Ave Bermeja del Sur,
1 Qilin de Buen Augurio, 1 Zorra de Nueve Colas, 1 León Guardián de Bronce,
1 Dragón del Río Amarillo, 1 General de los Mil Estandartes, 2 Sello Imperial,
1 Mandato Revocado, 2 Fuegos de Artificio, 1 Viento del Este,
1 Inundación del Río, 1 Examen Imperial, 1 Decreto de Jade, 1 Gran Muralla,
1 Torre del Tambor, 1 Altar del Cielo, 1 Palacio de Jade.

---

## 6. Checklist de entrega

Nombres de archivo exactos para `tools/art-inbox/` (sin tildes ni ñ):

```
fuente-jade                 guardia-de-terracota       grulla-mensajera
jinete-de-la-estepa         funcionario-del-censo      arquero-de-la-muralla
alquimista-del-cinabrio     tigre-blanco-del-oeste     tortuga-negra-del-norte
ave-bermeja-del-sur         qilin-de-buen-augurio      monje-de-la-montana
zorra-de-nueve-colas        leon-guardian-de-bronce    dragon-del-rio-amarillo
general-de-los-mil-estandartes  sello-imperial         mandato-revocado
fuegos-de-artificio         viento-del-este            seda-y-veneno
inundacion-del-rio          examen-imperial            eclipse-del-dragon
decreto-de-jade             gran-muralla               torre-del-tambor
altar-del-cielo             horno-de-porcelana         pagoda-de-los-vientos
palacio-de-jade             xiwangmu-la-reina-madre
```

Aviso de estilo para toda la facción: **ceremonioso, no exótico**. La
referencia es la pintura china de corte —tinta y color sobre seda, líneas
finísimas, composición vertical, nubes estilizadas— llevada a un acabado
tridimensional. Nada de chinoiserie de restaurante, nada de artes marciales de
película, nada de farolillos por decorar. Los colores van muy saturados y
planos sobre fondos de tinta y niebla, y todo lo que aparece está hecho por
alguien con oficio: la seda está bordada, el bronce está fundido, el jade está
tallado.
