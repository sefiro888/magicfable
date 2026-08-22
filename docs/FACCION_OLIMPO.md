# Facción nueva · OLIMPO — «La medida y el exceso»

Dosier completo de la facción griega: mitología helena, héroes, monstruos y el
castigo de la desmesura. Identidad, mecánica propia, comandante y **31 cartas**
con su prompt de arte.

---

## 1. Por qué esta facción y en qué se diferencia

Grecia tiene dos trampas evidentes y las dos se esquivan a propósito:

- **No es Orden con columnas.** Orden es simetría, escudo y protección: cuida
  lo que tiene. Olimpo **no se cuida**: sus héroes crecen cada vez que golpean
  el Nexo enemigo, y crecen sin frenos hasta que la desmesura se les vuelve en
  contra. Orden defiende; Olimpo *se envalentona*.
- **No es Furia con cascos de bronce.** Furia gasta todo y espera ganar antes
  de quedarse sin nada. Olimpo no se queda sin nada: **se pasa**, que es
  distinto y más difícil de gestionar.

Ninguna facción del juego se castiga hoy a sí misma por ir ganando. Ese es el
hueco: la única cuyo mayor peligro es su propio impulso.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (mármol pentélico, cal) | `#e8e2d4` |
| Luz (bronce pulido, oro de ofrenda) | `#cf9b3f`, `#ffe6a8` |
| Sombra (basalto, ánfora de figuras negras) | `#17171b` |
| Acento (azul egeo, púrpura tiria) | `#2f6fa8`, `#7d2b52` |

**Materiales**: mármol veteado, bronce, terracota, lino plisado, oro repujado,
madera de olivo, cerámica pintada. **Formas**: columnas acanaladas, frontones,
grecas, drapeados que caen en pliegues largos, coronas de laurel, cascos
corintios. **Tono**: luminoso y de contornos limpios, con la sombra muy marcada
por el sol del Egeo. Nada de mármol blanco inmaculado —esto iba pintado de
colores vivos— ni de dioses de peplum: son personajes con carácter y mal genio.

---

## 2. Las mecánicas propias

### Hybris

> **Hybris** — Cada vez que una unidad tuya daña al Nexo enemigo, gana **+1/+1
> permanente** y tu contador de Hybris sube en uno.
>
> Al final de tu turno, si tu Hybris es **6 o más**, tu Nexo pierde tanta Vida
> como la mitad de tu Hybris, redondeando hacia abajo.

Es la mecánica insignia y es un pacto con letra pequeña: cada golpe que das te
hace más fuerte de forma permanente, y cada golpe te acerca al momento en que
empiezas a pagarlo tú. Un héroe de Olimpo que lleva cinco turnos pegando es
enorme *y* es la razón por la que estás perdiendo Vida cada turno.

No se puede bajar. Solo se puede decidir cuándo dejas de golpear, y eso es
exactamente lo que la facción no quiere hacer.

### Metamorfosis

> **Metamorfosis** — Al final de tu turno, si esta unidad cumple la condición
> que diga su carta, se transforma: gana permanentemente el segundo bloque de
> reglas y sus nuevas estadísticas.

La válvula de escape. Varias de sus criaturas dejan de ser mortales y se
convierten en monstruo o en constelación, y la forma transformada suele
resolver el problema que la Hybris ha creado —cura, protege o cierra la
partida antes de que el contador te alcance.

> Nota técnica: Hybris es un contador por jugador que no se reinicia con el
> turno, como la Cuenta del Sol azteca, más un disparador en el daño al Nexo,
> donde el motor ya distingue quién pegó. La Metamorfosis sustituye el `cardId`
> de la pieza por otro conservando su instancia: es lo mismo que hace un
> despliegue, pero sobre una pieza que ya está en el tablero.

---

## 3. El comandante

### `nemesis-la-que-mide`

- **Nombre**: Némesis · **Título**: La que Mide
- **Facción**: Olimpo · **Vida del Nexo**: 35
- **Pasiva**: Mientras tu Hybris sea 5 o menos, tus unidades tienen +1 de Vida.
- **Poder (una vez por partida, 2 genérico + 1 bronce)**: «Restitución» — pon
  tu Hybris a cero y cura a tu Nexo tanta Vida como el contador que has
  borrado.
- **Sabor**: «No castiga la maldad. Castiga la desproporción, que es más común.»
- **Prompt de retrato**: *Retrato en tres cuartos de una mujer de expresión
  impasible y mirada directa, con alas de plumas oscuras plegadas a la espalda,
  peplo azul profundo con cinturón de bronce, sosteniendo una vara de medir y
  una brida corta. Corona sencilla de laurel. Fondo: templo de columnas
  acanaladas con el mar Egeo detrás y cielo de mediodía. Serena, implacable,
  sin gesto de ira. Paleta Olimpo.*

---

## 4. Las 31 cartas

Cada ficha trae: **id** (nombre de archivo), datos de juego y el prompt de arte.
La columna «motor» avisa de si la carta usa mecánica que el juego ya sabe
resolver o si hay que programar algo.

---

### 4.1 Fuente

#### `fuente-olimpo`
- **Tipo**: Esencia — Fuente · **Rareza**: Común · **Coste**: 0
- **Reglas**: Agota esta fuente: genera 1 de Esencia de Bronce.
- **Sabor**: «Aceite, sal y una moneda. Con eso se abre cualquier puerta.»
- **Motor**: ya soportado
- **Prompt**: *Una crátera de cerámica de figuras negras junto a un cuenco de
  aceite de oliva y unas monedas de plata, sobre un pedestal de mármol al pie
  de una columna. Luz dura de mediodía. Sin figuras. Paleta Olimpo.*

---

### 4.2 Unidades (15)

#### `hoplita-de-la-falange`
- **Tipo**: Unidad — Soldado · **Rareza**: Común · **Coste**: 1 gen + 1 bronce
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «Su escudo cubre el costado del de al lado. Por eso funciona.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Un hoplita con casco corintio bajado, coraza de lino
  endurecido y gran escudo redondo con un emblema pintado, en posición cerrada.
  Lanza vertical. Fondo de polvo y sol. Paleta Olimpo.*

#### `corredor-de-maraton`
- **Tipo**: Unidad — Humanoide · **Rareza**: Común · **Coste**: 0 gen + 1 bronce
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Impulso.
- **Sabor**: «Llegó, dio la noticia y se cayó redondo. Nadie discutió el mensaje.»
- **Motor**: ya soportado (`impulse`)
- **Prompt**: *Un corredor desnudo y polvoriento a media zancada por un camino
  de tierra entre olivos, con el pecho hinchado y el gesto de agotamiento
  extremo. Luz de última hora. Paleta Olimpo.*

#### `arquera-de-creta`
- **Tipo**: Unidad — Soldado · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 bronce
- **ATQ/VID**: 2/3 · **Alcance** 3 · **Movimiento** 1
- **Reglas**: Ninguna.
- **Sabor**: «En su isla se aprende antes a tensar que a leer.»
- **Motor**: ya soportado
- **Prompt**: *Una arquera con túnica corta y sandalias trenzadas, tensando un
  arco desde lo alto de un muro ciclópeo, con el mar azul intenso al fondo y el
  viento en el pelo. Paleta Olimpo.*

#### `oraculo-de-delfos`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 bronce
- **ATQ/VID**: 1/4 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Al final de tu turno, escruta 1. Si tu Hybris es 6 o más, además robas 1 carta.
- **Sabor**: «Responde siempre. Entenderla es cosa tuya.»
- **Motor**: nueva (Hybris)
- **Prompt**: *Una sacerdotisa sentada en un trípode de bronce sobre una grieta
  en la roca de la que sale vapor, con los ojos en blanco y una rama de laurel
  en la mano, en la penumbra de un santuario excavado. Paleta Olimpo.*

#### `escultor-de-marmol`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 bronce
- **ATQ/VID**: 1/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al final de tu turno, una unidad aliada gana un escudo de 2.
- **Sabor**: «Dice que la figura ya estaba dentro. Él solo quita lo que sobra.»
- **Motor**: ya soportado (mantenimiento de escudo)
- **Prompt**: *Un escultor con mandil de cuero y polvo blanco en los brazos,
  golpeando con maza y cincel un bloque de mármol del que emerge media figura,
  en un taller abierto con virutas de piedra en el suelo. Paleta Olimpo.*

#### `centauro-del-pelion`
- **Tipo**: Unidad — Bestia · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 bronce
- **ATQ/VID**: 4/4 · **Alcance** 2 · **Movimiento** 2
- **Reglas**: Ninguna.
- **Sabor**: «Enseñó a media docena de héroes. Se arrepiente de la mitad.»
- **Motor**: ya soportado
- **Prompt**: *Un centauro de torso canoso y barba cuidada, con un arco a la
  espalda y una hierba medicinal en la mano, entre pinos de montaña con el mar
  lejano abajo. Sabio, no salvaje. Paleta Olimpo.*

#### `pegaso-de-corinto`
- **Tipo**: Unidad — Bestia · **Rareza**: Rara · **Coste**: 1 gen + 2 bronce
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador. Metamorfosis: si tu Hybris es 8 o más, se convierte en constelación — 5/5 y ya no puede recibir daño de hechizos.
- **Sabor**: «Lo montaron una vez de más. Ahora está donde no le alcanzan.»
- **Motor**: nueva (Metamorfosis)
- **Prompt**: *Un caballo blanco alado galopando sobre las olas con las alas
  extendidas y la espuma salpicando bajo los cascos, con un acantilado y un
  templo pequeño al fondo. Luz dorada de tarde. Paleta Olimpo.*

#### `sirena-de-las-rocas`
- **Tipo**: Unidad — Horror · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 bronce
- **ATQ/VID**: 2/3 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Al entrar en juego, congela una unidad enemiga 1 turno.
- **Sabor**: «No canta bonito. Canta lo que cada uno necesita oír.»
- **Motor**: ya soportado (`freeze` de entrada)
- **Prompt**: *Una criatura de cuerpo de ave y rostro de mujer posada en un
  islote rocoso, con la boca abierta cantando y restos de un naufragio en el
  agua a sus pies. Bella e incorrecta a la vez. Paleta Olimpo.*

#### `medusa-de-mirada-fija`
- **Tipo**: Unidad — Horror · **Rareza**: Rara · **Coste**: 2 gen + 1 bronce
- **ATQ/VID**: 3/4 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Cuando ataca, congela al objetivo 1 turno.
- **Sabor**: «Fue castigada por algo que le hicieron a ella. Así fue siempre.»
- **Motor**: ya soportado (congelar al atacar)
- **Prompt**: *Una figura femenina de mirada intensa con serpientes vivas en
  lugar de cabello, entre estatuas de piedra a medio terminar que en realidad
  son personas, en un templo en ruinas. Trágica, no monstruosa. Paleta Olimpo.*

#### `minotauro-del-laberinto`
- **Tipo**: Unidad — Bestia · **Rareza**: Rara · **Coste**: 2 gen + 2 bronce
- **ATQ/VID**: 5/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Perforar. No puede ser aturdido.
- **Sabor**: «Encerrado desde que nació por algo que hizo su madre.»
- **Motor**: nueva (inmunidad a estado; ya existe en Duna)
- **Prompt**: *Una figura enorme de cuerpo humano musculoso y cabeza de toro,
  de pie en un corredor de piedra estrecho iluminado por una antorcha lejana,
  con la cabeza gacha rozando el techo. Encierro, no furia. Paleta Olimpo.*

#### `quimera-de-licia`
- **Tipo**: Unidad — Horror · **Rareza**: Rara · **Coste**: 2 gen + 2 bronce
- **ATQ/VID**: 5/4 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Al entrar en juego, inflige 2 de daño a todas las unidades enemigas.
- **Sabor**: «Tres animales que no se ponen de acuerdo en nada salvo en esto.»
- **Motor**: ya soportado (`damage-all-enemies`)
- **Prompt**: *Una criatura con cuerpo de león, una cabeza de cabra saliendo
  del lomo y cola de serpiente, escupiendo fuego sobre una ladera seca. Las
  tres cabezas mirando en direcciones distintas. Paleta Olimpo.*

#### `heroe-de-los-doce-trabajos`
- **Tipo**: Unidad — Soldado · **Rareza**: Mítica · **Coste**: 3 gen + 2 bronce
- **ATQ/VID**: 6/6 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Golpe veloz. Cada vez que daña al Nexo enemigo, gana +2/+2 permanentes en lugar de +1/+1.
- **Sabor**: «Le pusieron doce tareas imposibles para que aprendiera humildad. No funcionó.»
- **Motor**: nueva (Hybris)
- **Prompt**: *Un héroe corpulento con una piel de león como capa y capucha,
  apoyado en una maza de olivo, de pie sobre una escalinata con el pecho
  descubierto y cicatrices. Seguro de sí hasta lo insoportable. Paleta Olimpo.*

#### `hidra-de-lerna`
- **Tipo**: Unidad — Horror · **Rareza**: Mítica · **Coste**: 3 gen + 2 bronce
- **ATQ/VID**: 4/7 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Metamorfosis: si sobrevive a un turno herida, gana +2/+2 permanentes. Puede repetirse.
- **Sabor**: «Por cada cabeza que le quitas le salen dos. Nadie trae suficiente fuego.»
- **Motor**: nueva (Metamorfosis)
- **Prompt**: *Una serpiente acuática enorme con varias cabezas saliendo de un
  pantano entre juncos y niebla baja, con dos cuellos recién cortados de los
  que brotan otros nuevos. Verdes oscuros, agua estancada. Paleta Olimpo.*

#### `sacerdotisa-de-eleusis`
- **Tipo**: Unidad — Humanoide · **Rareza**: Rara · **Coste**: 1 gen + 2 bronce
- **ATQ/VID**: 2/5 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Al final de tu turno, cura a tu Nexo tanta Vida como la mitad de tu Hybris, redondeando hacia abajo.
- **Sabor**: «Lo que se ve dentro no se cuenta fuera. Por eso no sabemos nada.»
- **Motor**: nueva (Hybris)
- **Prompt**: *Una sacerdotisa con antorcha en cada mano y corona de espigas de
  trigo, de pie en la boca de un santuario subterráneo con una procesión de
  siluetas encapuchadas esperando fuera. Noche, luz de fuego. Paleta Olimpo.*

#### `titan-encadenado`
- **Tipo**: Unidad — Gigante · **Rareza**: Mítica · **Coste**: 4 gen + 2 bronce
- **ATQ/VID**: 8/8 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: No puede atacar mientras tu Hybris sea 3 o menos.
- **Sabor**: «Le dio el fuego a la gente. Lleva pagándolo desde entonces.»
- **Motor**: nueva (Hybris)
- **Prompt**: *Un titán colosal encadenado por las muñecas a la pared de un
  acantilado, con la cabeza gacha y las cadenas de bronce tensas, y un águila
  volando en círculos arriba. Escala monumental, vista desde abajo. Paleta
  Olimpo.*

---

### 4.3 Hechizos (9)

#### `rayo-del-olimpo`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 bronce
- **Reglas**: Inflige 4 de daño a una unidad enemiga.
- **Sabor**: «No discute. Zanja.»
- **Motor**: ya soportado (`damage`)
- **Prompt**: *Un rayo ramificado cayendo vertical sobre la cima de una montaña
  entre nubes negras, iluminando por un instante un templo diminuto en la
  ladera. Sin figuras. Paleta Olimpo.*

#### `hilo-de-las-moiras`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 1 gen + 2 bronce
- **Reglas**: Destruye una unidad enemiga con 5 o menos de Vida.
- **Sabor**: «Una lo hila, otra lo mide y la tercera trae las tijeras.»
- **Motor**: ya soportado (destrucción condicionada)
- **Prompt**: *Tres pares de manos ancianas trabajando sobre un mismo hilo
  dorado tenso —una hilando, otra midiendo con una vara, otra con unas tijeras
  abiertas—, sobre fondo oscuro. Solo las manos. Paleta Olimpo.*

#### `ambrosia`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 bronce
- **Reglas**: Cura 6 de Vida a tu Nexo.
- **Sabor**: «Un sorbo cura cualquier cosa. Dos, y ya no eres del todo tú.»
- **Motor**: ya soportado (`heal-nexus`)
- **Prompt**: *Una copa de oro repujado rebosando de un líquido dorado
  luminoso, sostenida por una mano, con vapor dulce subiendo en el aire de un
  salón de columnas. Paleta Olimpo.*

#### `canto-de-las-musas`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 bronce
- **Reglas**: Robas 2 cartas.
- **Sabor**: «Se les pide ayuda al empezar. Casi nunca contestan a tiempo.»
- **Motor**: ya soportado (`draw`)
- **Prompt**: *Un grupo de mujeres con instrumentos —lira, flauta doble,
  tablilla— sentadas en las gradas de un teatro de piedra vacío al atardecer.
  Composición serena. Paleta Olimpo.*

#### `laberinto`
- **Tipo**: Hechizo inmediato — Encantamiento · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 bronce
- **Reglas**: Congela una unidad enemiga 2 turnos.
- **Sabor**: «No tiene trampas. Con la planta basta.»
- **Motor**: ya soportado (`freeze`)
- **Prompt**: *Vista cenital de un laberinto de muros de piedra de planta
  circular con un único camino enrevesado, con la sombra del mediodía marcando
  los pasillos. Sin figuras. Paleta Olimpo.*

#### `caja-de-pandora`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 2 gen + 1 bronce
- **Reglas**: Inflige 3 de daño a todas las unidades, incluidas las tuyas. Robas 1 carta.
- **Sabor**: «Salió todo lo malo y se quedó dentro lo único que servía.»
- **Motor**: ya soportado (barrido que incluye aliados)
- **Prompt**: *Una tinaja de barro entreabierta en el suelo de una habitación,
  con humo oscuro saliendo en volutas hacia el techo y una tenue luz dorada aún
  atrapada dentro. Sin figuras. Paleta Olimpo.*

#### `tempestad-del-egeo`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Rara · **Coste**: 2 gen + 1 bronce
- **Reglas**: Inflige 3 de daño a todas las unidades enemigas y les resta 1 de Movimiento este turno.
- **Sabor**: «Diez años para volver a casa. Casi todos fueron por esto.»
- **Motor**: ya soportado (`damage-all-enemies` + ralentización)
- **Prompt**: *Un mar embravecido con olas enormes rompiendo contra un islote
  rocoso y una vela desgarrada asomando entre la espuma, bajo un cielo negro.
  Sin figuras nítidas. Paleta Olimpo.*

#### `hybris`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Mítica · **Coste**: 1 gen + 2 bronce
- **Reglas**: Todas tus unidades ganan +2/+2 permanentes. Tu Hybris sube en 3.
- **Sabor**: «El error no es creerse grande. Es decirlo en voz alta.»
- **Motor**: nueva (Hybris)
- **Prompt**: *Una estatua colosal de bronce a medio erigir sobre un pedestal
  desproporcionado, con andamios y obreros diminutos alrededor, contra un cielo
  amenazante. La escultura mira hacia arriba. Paleta Olimpo.*

#### `juicio-de-paris`
- **Tipo**: Hechizo inmediato — Decreto · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 bronce
- **Reglas**: Escruta 3. Una unidad aliada gana +2 de Ataque hasta el final del turno.
- **Sabor**: «Le dieron a elegir entre tres cosas buenas. Empezó una guerra de diez años.»
- **Motor**: ya soportado (`scry` + bono temporal)
- **Prompt**: *Una manzana de oro sobre la hierba de una ladera, con tres
  sombras alargadas convergiendo hacia ella desde fuera del encuadre. Nadie
  visible. Tensión contenida. Paleta Olimpo.*

---

### 4.4 Estructuras (6)

#### `templo-de-columnas`
- **Tipo**: Estructura — Templo · **Rareza**: Rara · **Coste**: 2 gen + 1 bronce · **Resistencia**: 6
- **Reglas**: Al final de tu turno, si tu Hybris es 6 o más, tu Nexo pierde 1 de Vida menos por la desmesura.
- **Sabor**: «Se paga un templo cuando ya se ha ofendido a alguien.»
- **Motor**: nueva (Hybris)
- **Prompt**: *Un templo dórico de columnas acanaladas con el frontón pintado
  en rojo, azul y oro —no mármol blanco—, visto en escorzo bajo el sol de
  mediodía con sombras muy marcadas. Paleta Olimpo.*

#### `muralla-ciclopea`
- **Tipo**: Estructura — Fortaleza · **Rareza**: Rara · **Coste**: 2 gen + 1 bronce · **Resistencia**: 8
- **Reglas**: Guardia.
- **Sabor**: «Nadie recuerda quién movió esas piedras. De ahí el nombre.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Un muro de bloques de piedra irregulares y colosales encajados
  sin argamasa, con una puerta triangular estrecha, sobre una colina seca.
  Escala impresionante. Paleta Olimpo.*

#### `teatro-de-piedra`
- **Tipo**: Estructura — Teatro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 bronce · **Resistencia**: 5
- **Reglas**: Al final de tu turno, si tienes 3 o menos cartas en la mano, robas 1.
- **Sabor**: «Desde la última grada se oye una moneda caer en la orquesta.»
- **Motor**: ya soportado (mismo patrón que la Biblioteca Sumergida)
- **Prompt**: *Un teatro semicircular excavado en la ladera con las gradas de
  piedra vacías y el valle abriéndose al fondo, visto desde el escenario. Luz
  de primera hora. Paleta Olimpo.*

#### `agora`
- **Tipo**: Estructura — Plaza · **Rareza**: Común · **Coste**: 1 gen + 1 bronce · **Resistencia**: 5
- **Reglas**: Al final de tu turno, cura 2 a tu Nexo.
- **Sabor**: «Aquí se compra, se vota y se discute. Sobre todo lo tercero.»
- **Motor**: ya soportado (mantenimiento de curación)
- **Prompt**: *Una plaza porticada con puestos de mercado bajo toldos de lino,
  gente conversando en grupos y una fuente de piedra en el centro. Vida
  cotidiana, mucho color. Paleta Olimpo.*

#### `faro-del-puerto`
- **Tipo**: Estructura — Faro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 bronce · **Resistencia**: 5
- **Reglas**: Tus unidades a distancia infligen 1 de daño adicional.
- **Sabor**: «Se ve desde una jornada de mar. Esa es toda su función.»
- **Motor**: ya soportado (`ranged-attack-bonus`)
- **Prompt**: *Una torre de piedra de tres cuerpos escalonados con una hoguera
  encendida en la cima y un espejo de bronce detrás, sobre un espigón, al
  anochecer con barcos entrando a puerto. Paleta Olimpo.*

#### `altar-de-los-doce`
- **Tipo**: Estructura — Altar · **Rareza**: Mítica · **Coste**: 2 gen + 2 bronce · **Resistencia**: 7
- **Reglas**: Al final de tu turno, una unidad aliada gana +1 de Ataque y +1 de Vida permanentes. Tu Hybris sube en 1.
- **Sabor**: «Se les ofrece a los doce a la vez, por si acaso alguno se ofende.»
- **Motor**: nueva (Hybris)
- **Prompt**: *Un altar circular de mármol con doce hornacinas talladas
  alrededor, cada una con una ofrenda distinta, y humo de incienso subiendo
  recto. Rodeado de olivos. Paleta Olimpo.*

---

## 5. Cómo se juega esta facción

Olimpo empieza pegando al Nexo en cuanto puede, porque cada golpe deja a la
criatura permanentemente mayor. Hacia el turno seis tiene un héroe que ningún
otro mazo puede pelear de frente… y un contador de Hybris que ya le está
quitando Vida cada turno. A partir de ahí es una carrera contra sí misma: o
cierra la partida, o la Sacerdotisa y el Templo aguantan lo suficiente, o
Némesis borra el contador y se empieza otra vez.

Es la facción de las partidas **cortas y decididas**, y la única en la que el
jugador tiene que elegir voluntariamente dejar de atacar.

Sus dos debilidades, deliberadas:

1. **Se mata sola.** Un mazo que no sabe frenar llega al turno diez con
   criaturas enormes y quince de Vida. Contra Duna o Anunna, que alargan, eso
   es perder.
2. **Arranque flojo.** El Titán no puede atacar hasta que la Hybris sube, y sus
   cuerpos baratos son normales. Los primeros turnos no dan miedo.

Mazo inicial sugerido (50 cartas): 20 Fuente de Olimpo, 3 Hoplita de la Falange,
3 Corredor de Maratón, 2 Arquera de Creta, 2 Oráculo de Delfos,
2 Sirena de las Rocas, 1 Escultor de Mármol, 1 Centauro del Pelión,
1 Pegaso de Corinto, 1 Medusa de Mirada Fija, 1 Minotauro del Laberinto,
1 Quimera de Licia, 1 Sacerdotisa de Eleusis, 1 Héroe de los Doce Trabajos,
1 Hidra de Lerna, 1 Titán Encadenado, 2 Rayo del Olimpo, 1 Ambrosía,
1 Hilo de las Moiras, 1 Canto de las Musas, 1 Tempestad del Egeo, 1 Hybris,
1 Templo de Columnas, 1 Muralla Ciclópea, 1 Ágora, 1 Altar de los Doce.

---

## 6. Checklist de entrega

Nombres de archivo exactos para `tools/art-inbox/` (sin tildes ni ñ):

```
fuente-olimpo               hoplita-de-la-falange      corredor-de-maraton
arquera-de-creta            oraculo-de-delfos          escultor-de-marmol
centauro-del-pelion         pegaso-de-corinto          sirena-de-las-rocas
medusa-de-mirada-fija       minotauro-del-laberinto    quimera-de-licia
heroe-de-los-doce-trabajos  hidra-de-lerna             sacerdotisa-de-eleusis
titan-encadenado            rayo-del-olimpo            hilo-de-las-moiras
ambrosia                    canto-de-las-musas         laberinto
caja-de-pandora             tempestad-del-egeo         hybris
juicio-de-paris             templo-de-columnas         muralla-ciclopea
teatro-de-piedra            agora                      faro-del-puerto
altar-de-los-doce           nemesis-la-que-mide
```

Aviso de estilo para toda la facción: **el mármol iba pintado**. Los templos,
las estatuas y los frontones estaban cubiertos de rojo, azul, ocre y oro, y
así deben salir: el blanco impoluto es una equivocación de hace dos siglos.
Nada de dioses de peplum ni de poses de museo. Las figuras llevan lino plisado
y bronce, tienen cuerpo de gente real y mal genio, y la luz es la del Egeo a
mediodía: dura, con sombras cortas y contornos muy limpios. La referencia es la
cerámica de figuras rojas y la escultura policromada, no el neoclasicismo.
