# Facción nueva · ANUNNA — «Las Tablillas del Destino»

Dosier completo de la facción mesopotámica: Sumeria y Babilonia, escritura,
presagios y el descenso al inframundo. Identidad, mecánica propia, comandante y
**31 cartas** con su prompt de arte.

---

## 1. Por qué esta facción y en qué se diferencia

Mesopotamia tiene dos trampas evidentes y las dos se esquivan a propósito:

- **No es Duna con otro río.** Egipto y Sumeria se parecen por fuera y no se
  parecen en nada por dentro. Duna administra la muerte y cobra intereses.
  Anunna **no mira atrás, mira adelante**: escribe lo que va a pasar y después
  se encarga de que pase.
- **No es Arcano con cuneiforme.** Arcano niega lo que el rival hace. Anunna
  **no niega nada**: deja escrito de antemano lo que hará ella, paga barato por
  adelantado y revela más tarde. Donde Arcano reacciona, Anunna *madruga*.

Ninguna facción del juego juega hoy cartas para el futuro. Ese es el hueco: la
única que gasta un turno flojo a cambio de tener dos turnos gratis después.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (ladrillo cocido, arcilla cruda) | `#b5714a` |
| Luz (oro de Ur, alabastro) | `#e8c26a`, `#f6e6c4` |
| Sombra (betún negro, noche del desierto) | `#12100e` |
| Acento (lapislázuli, cornalina) | `#2a4d9b`, `#c1462e` |

**Materiales**: arcilla cruda y cocida, ladrillo vidriado, lapislázuli,
cornalina, betún, oro batido, concha incrustada. **Formas**: barbas rizadas en
espiral, ojos enormes y fijos, alas de plumas escalonadas, escaleras exteriores
de zigurat, cilindros grabados, palmeras datileras. **Tono**: austero y
majestuoso, todo ladrillo y sombra dura, con el color concentrado en los
detalles. Nada de arena vacía ni de tumbas malditas: aquí hay ciudades con
canales, mercados y funcionarios.

---

## 2. Las mecánicas propias

### Tablilla

> **Tablilla** — Al jugar una carta puedes ponerla boca abajo por **1 de
> Esencia** en lugar de pagar su coste. Queda como *tablilla sellada* junto a
> tu Nexo. En cualquier turno posterior puedes **revelarla gratis** para
> jugarla con normalidad.

Es la mecánica insignia y es de tempo puro: cambia potencia ahora por potencia
después. Un turno 3 en el que solo sellas dos tablillas parece un turno
perdido; el turno 6 en el que revelas las dos y juegas otra cosa encima es el
que gana la partida.

El rival ve cuántas tablillas tienes, pero no qué son. Y sabe que están ahí.

### Presagio

> **Presagio** — Algunas cartas dicen «Presagio: …». Ese efecto se resuelve al
> final de tu turno **solo si has revelado una tablilla ese turno**.

La contrapartida que le da ritmo: premia el momento en que la facción deja de
guardar y empieza a gastar. Sin Presagio, sellar tablillas sería siempre lo
correcto y la facción se jugaría sola; con él, hay que elegir el turno en que
se abre la mano.

> Nota técnica: las tablillas son una zona nueva por jugador —una lista de
> cartas boca abajo, como el descarte pero visible en número— y revelarlas es
> una acción más. El Presagio funciona igual que el Juicio de Duna: una
> condición que se comprueba en el mantenimiento del final del turno.

---

## 3. El comandante

### `enheduanna-la-primera-voz`

- **Nombre**: Enheduanna · **Título**: La Primera Voz
- **Facción**: Anunna · **Vida del Nexo**: 35
- **Pasiva**: La primera tablilla que sellas cada turno es gratis.
- **Poder (una vez por partida, 2 genérico + 1 lapislázuli)**: «El Himno que
  Nadie Había Firmado» — revela todas tus tablillas gratis y robas 1 carta.
- **Sabor**: «Es la primera persona de la historia que firmó lo que escribió.»
- **Prompt de retrato**: *Retrato en tres cuartos de una sacerdotisa de mirada
  fija y serena, tocado circular de lana con vuelta y un vestido de vellón
  escalonado, sosteniendo un punzón de caña y una tablilla de arcilla a medio
  escribir. Collares de lapislázuli y cornalina. Fondo: terraza de zigurat con
  el cielo del atardecer y una luna creciente. Autoridad intelectual, nada
  guerrera. Paleta Anunna.*

---

## 4. Las 31 cartas

Cada ficha trae: **id** (nombre de archivo), datos de juego y el prompt de arte.
La columna «motor» avisa de si la carta usa mecánica que el juego ya sabe
resolver o si hay que programar algo.

---

### 4.1 Fuente

#### `fuente-anunna`
- **Tipo**: Esencia — Fuente · **Rareza**: Común · **Coste**: 0
- **Reglas**: Agota esta fuente: genera 1 de Esencia de Lapislázuli.
- **Sabor**: «Arcilla del río, caña del cañaveral. Con eso se inventó la historia.»
- **Motor**: ya soportado
- **Prompt**: *Un cuenco de arcilla húmeda con varios punzones de caña
  clavados, junto a tablillas apiladas a medio secar sobre una estera, en un
  patio con luz de tarde. Sin figuras. Paleta Anunna.*

---

### 4.2 Unidades (15)

#### `escriba-de-tablillas`
- **Tipo**: Unidad — Humanoide · **Rareza**: Común · **Coste**: 0 gen + 1 lapislázuli
- **ATQ/VID**: 1/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al entrar en juego, sella la primera carta de tu mazo como tablilla.
- **Sabor**: «Copia listas de cebada. Alguna vez copia algo importante.»
- **Motor**: nueva (Tablilla)
- **Prompt**: *Un escriba sentado con las piernas cruzadas y una tablilla
  apoyada en la palma, marcando cuñas con un punzón de caña, rodeado de cestos
  de tablillas clasificadas. Cabeza rapada, túnica sencilla. Paleta Anunna.*

#### `soldado-de-la-falange`
- **Tipo**: Unidad — Soldado · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «Seis filas de escudos. La primera no es la que importa.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Una formación cerrada de soldados con escudos rectangulares
  enormes y lanzas asomando por encima, avanzando en bloque sobre tierra seca,
  vista lateral como en un relieve. Cascos de cobre. Paleta Anunna.*

#### `pastor-de-uruk`
- **Tipo**: Unidad — Humanoide · **Rareza**: Común · **Coste**: 0 gen + 1 lapislázuli
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Presagio: gana +1 de Ataque y +1 de Vida permanentes.
- **Sabor**: «Cuenta el rebaño cada noche. Nunca le falla la cuenta.»
- **Motor**: nueva (Presagio)
- **Prompt**: *Un pastor con un cayado y una capa de lana, rodeado de ovejas
  de cuernos rizados, junto a un abrevadero de ladrillo al atardecer, con la
  muralla de la ciudad al fondo. Tranquilo. Paleta Anunna.*

#### `arquero-de-lagash`
- **Tipo**: Unidad — Soldado · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/3 · **Alcance** 3 · **Movimiento** 1
- **Reglas**: Ninguna.
- **Sabor**: «Dispara sobre la cabeza de los suyos. Nunca ha fallado hacia abajo.»
- **Motor**: ya soportado
- **Prompt**: *Un arquero de barba rizada tensando un arco desde detrás de un
  parapeto de ladrillo, con el carcaj a la espalda y la mirada fija en el
  horizonte llano. Relieve vuelto tridimensional. Paleta Anunna.*

#### `adivino-del-higado`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 1/4 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Al final de tu turno, escruta 1. Presagio: escruta 2 y robas 1.
- **Sabor**: «Lo lee todo en las vísceras. Casi siempre acierta.»
- **Motor**: nueva (Presagio)
- **Prompt**: *Un adivino inclinado sobre una mesa baja examinando un modelo
  de hígado de arcilla dividido en casillas con inscripciones, con lámparas de
  aceite alrededor y sombras largas. Concentración total. Sin vísceras reales.
  Paleta Anunna.*

#### `salvaje-de-las-estepas`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 4/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: No puede ser aturdido.
- **Sabor**: «Comía hierba con las gacelas. Aprendió modales por las malas.»
- **Motor**: nueva (inmunidad a estado; ya existe en Duna)
- **Prompt**: *Un hombre corpulento de melena y barba enmarañadas, cubierto
  solo con una piel, de pie entre gacelas que no huyen de él, en una llanura de
  hierba alta al amanecer. Salvaje pero noble. Paleta Anunna.*

#### `heroe-de-uruk`
- **Tipo**: Unidad — Soldado · **Rareza**: Rara · **Coste**: 2 gen + 1 lapislázuli
- **ATQ/VID**: 4/4 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Golpe veloz. Presagio: cura 3 a tu Nexo.
- **Sabor**: «Dos tercios dios y un tercio hombre. El tercio es el problema.»
- **Motor**: nueva (Presagio)
- **Prompt**: *Un rey guerrero de barba rizada y musculatura marcada,
  sujetando un león bajo el brazo como si no pesara, con brazaletes de oro y
  una falda de vellón escalonada. Pose de relieve monumental. Paleta Anunna.*

#### `lamassu-de-la-puerta`
- **Tipo**: Unidad — Constructo · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli
- **ATQ/VID**: 3/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Volador.
- **Sabor**: «Cinco patas para que esté quieto de frente y andando de lado.»
- **Motor**: ya soportado (`guard` + `flying`)
- **Prompt**: *Un toro alado colosal con cabeza humana barbada y tiara de
  cuernos, tallado en piedra clara, flanqueando una puerta monumental. Alas
  plegadas de plumas escalonadas. Vista de tres cuartos. Paleta Anunna.*

#### `sacerdotisa-del-zigurat`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/3 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Tus tablillas cuestan 1 de Esencia menos al sellarse (mínimo 0).
- **Sabor**: «Sube al último piso una vez al mes. Nadie sube con ella.»
- **Motor**: nueva (Tablilla)
- **Prompt**: *Una sacerdotisa con vestido de vellón y tocado de lana subiendo
  la escalera exterior de un zigurat con una lámpara, con la ciudad diminuta
  abajo y el cielo violeta del anochecer. Vista desde arriba. Paleta Anunna.*

#### `anzu-pajaro-tormenta`
- **Tipo**: Unidad — Ave · **Rareza**: Rara · **Coste**: 2 gen + 1 lapislázuli
- **ATQ/VID**: 4/3 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador. Al entrar en juego, roba una tablilla sellada del rival, si la tiene.
- **Sabor**: «Robó las Tablillas del Destino. Casi le sale bien.»
- **Motor**: nueva (Tablilla)
- **Prompt**: *Un ave rapaz gigantesca con cabeza de león y plumaje de tonos
  tormenta, con las alas desplegadas entre nubes negras y relámpagos, sujetando
  una tablilla de arcilla en las garras. Dramático. Paleta Anunna.*

#### `mushussu-de-babilonia`
- **Tipo**: Unidad — Dragón · **Rareza**: Rara · **Coste**: 2 gen + 2 lapislázuli
- **ATQ/VID**: 5/5 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Perforar.
- **Sabor**: «Serpiente, león y águila. Lo dibujaron en la puerta por si acaso.»
- **Motor**: ya soportado (`pierce`)
- **Prompt**: *Una criatura esbelta de cuerpo escamado de serpiente, patas
  delanteras de felino y traseras de ave rapaz, con cuernos y lengua bífida,
  caminando ante un muro de ladrillo vidriado azul. Como el relieve pero vivo.
  Paleta Anunna.*

#### `barquero-de-los-muertos`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Vínculo vital.
- **Sabor**: «Cobra por cruzar. No acepta promesas.»
- **Motor**: ya soportado (`lifelink`)
- **Prompt**: *Un barquero encapuchado empujando con una pértiga una barca de
  juncos por un canal de aguas negras entre cañaverales, con una lámpara en la
  proa. Niebla baja, silencio. Paleta Anunna.*

#### `coloso-de-ladrillo`
- **Tipo**: Unidad — Constructo · **Rareza**: Rara · **Coste**: 2 gen + 2 lapislázuli
- **ATQ/VID**: 5/7 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. No puede moverse el turno en que entra en juego.
- **Sabor**: «Lo levantaron con el mismo barro que la muralla. Se nota.»
- **Motor**: ya soportado (unidad sin Impulso)
- **Prompt**: *Un gigante hecho de ladrillos de adobe encajados, con betún
  negro rezumando por las juntas y hierba creciendo en los hombros,
  incorporándose junto a una muralla. Pesado, tosco, imponente. Paleta Anunna.*

#### `senora-de-los-siete-portales`
- **Tipo**: Unidad — Celestial · **Rareza**: Mítica · **Coste**: 3 gen + 2 lapislázuli
- **ATQ/VID**: 6/5 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Al entrar en juego, el rival descarta 1 carta por cada tablilla que tengas sellada, hasta un máximo de 3.
- **Sabor**: «En cada puerta le quitaron una joya. Llegó abajo sin nada y aun así ganó.»
- **Motor**: nueva (Tablilla)
- **Prompt**: *Una figura femenina majestuosa descendiendo una escalera entre
  siete puertas sucesivas de ladrillo vidriado, cada una más oscura, dejando
  una joya en cada umbral. Corona de cuernos, alas de plumas. Paleta Anunna.*

#### `toro-del-cielo`
- **Tipo**: Unidad — Bestia · **Rareza**: Mítica · **Coste**: 4 gen + 2 lapislázuli
- **ATQ/VID**: 7/7 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Perforar. Al entrar en juego, inflige 3 de daño a todas las unidades enemigas.
- **Sabor**: «Lo soltaron para castigar una ciudad. Se bebió el río de camino.»
- **Motor**: ya soportado (`pierce` + `damage-all-enemies`)
- **Prompt**: *Un toro colosal de pelaje oscuro con cuernos de oro y una
  constelación brillando débilmente en el lomo, bajando del cielo entre nubes
  sobre unos campos agrietados. Escala monumental. Paleta Anunna.*

---

### 4.3 Hechizos (9)

#### `tablilla-sellada`
- **Tipo**: Hechizo inmediato — Decreto · **Rareza**: Común · **Coste**: 0 gen + 1 lapislázuli
- **Reglas**: Sella las dos primeras cartas de tu mazo como tablillas.
- **Sabor**: «Se escribe húmeda, se guarda seca y se rompe para leerla.»
- **Motor**: nueva (Tablilla)
- **Prompt**: *Una tablilla de arcilla dentro de su sobre de barro también
  escrito, con un sello cilíndrico rodado sobre la superficie dejando su
  impresión. Primer plano cenital, luz lateral. Paleta Anunna.*

#### `presagio-del-higado`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Revela una tablilla gratis. Presagio: robas 2 cartas.
- **Sabor**: «Si el lóbulo está partido, el rey no debería salir de campaña.»
- **Motor**: nueva (Tablilla + Presagio)
- **Prompt**: *Un modelo de hígado de arcilla dividido en casillas numeradas
  con inscripciones cuneiformes, sobre un paño, con una lámpara al lado y una
  mano señalando una casilla. Sin sangre. Paleta Anunna.*

#### `ley-del-talion`
- **Tipo**: Hechizo inmediato — Decreto · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Inflige a una unidad enemiga daño igual a su propio Ataque.
- **Sabor**: «Artículo 196. No hay artículo que lo suavice.»
- **Motor**: nueva (daño en función del objetivo)
- **Prompt**: *Una estela de basalto negro pulido cubierta de escritura
  cuneiforme apretada, con un relieve en la parte alta de un rey de pie ante un
  dios sentado. Luz rasante que marca los surcos. Paleta Anunna.*

#### `diluvio`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Mítica · **Coste**: 2 gen + 2 lapislázuli
- **Reglas**: Inflige 4 de daño a todas las unidades, incluidas las tuyas. Sella una tablilla por cada unidad destruida así.
- **Sabor**: «Le avisaron a uno. Le dijeron que construyera algo y no preguntara.»
- **Motor**: nueva (Tablilla)
- **Prompt**: *Una llanura entera bajo el agua con solo los tejados y las
  palmeras asomando, bajo un cielo negro descargando, y una barca redonda de
  juncos flotando en primer término. Vista amplia. Paleta Anunna.*

#### `descenso-al-kur`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli
- **Reglas**: Destruye una unidad enemiga con 4 o menos de Vida. Presagio: sin límite de Vida.
- **Sabor**: «Del país sin retorno se vuelve. Pero no gratis y no igual.»
- **Motor**: nueva (Presagio)
- **Prompt**: *Una escalera de ladrillo descendiendo hacia una oscuridad total
  bajo una puerta de arco, con polvo suspendido en el haz de luz que entra
  desde arriba. Sin figuras. Opresivo. Paleta Anunna.*

#### `sello-cilindrico`
- **Tipo**: Hechizo inmediato — Decreto · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Congela una unidad enemiga 2 turnos.
- **Sabor**: «Mientras el sello esté intacto, eso no se abre y ese no se mueve.»
- **Motor**: ya soportado (`freeze`)
- **Prompt**: *Un sello cilíndrico de lapislázuli grabado, rodando sobre una
  banda de arcilla fresca y dejando una escena continua de figuras y animales.
  Primer plano, luz dura. Paleta Anunna.*

#### `cosecha-del-eufrates`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Cura 6 de Vida a tu Nexo.
- **Sabor**: «Treinta granos por cada uno sembrado. El río hace el trabajo.»
- **Motor**: ya soportado (`heal-nexus`)
- **Prompt**: *Campos de cebada dorada segados en franjas junto a un canal de
  riego recto, con haces atados y palmeras datileras al fondo. Luz plena de
  mediodía. Sin figuras protagonistas. Paleta Anunna.*

#### `maldicion-de-akkad`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 2 gen + 1 lapislázuli
- **Reglas**: Una unidad enemiga pierde 3 de Vida al final de cada turno hasta que muere. El rival descarta 1 carta.
- **Sabor**: «La ciudad se maldijo por escrito. Y por escrito dejó de existir.»
- **Motor**: ya soportado (desgaste + descarte)
- **Prompt**: *Una ciudad abandonada de ladrillo con las puertas abiertas y el
  viento arrastrando polvo por las calles vacías, bajo un cielo ocre. Ni una
  sola figura. Desolación limpia. Paleta Anunna.*

#### `lamento-por-la-ciudad`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Robas 1 carta por cada tablilla que tengas sellada, hasta un máximo de 3.
- **Sabor**: «Se escribió llorando y se copió durante mil años.»
- **Motor**: nueva (Tablilla)
- **Prompt**: *Un arpa de caja con cabeza de toro dorada y barba de
  lapislázuli, apoyada sola en una sala de ladrillo, con la luz entrando por
  una tronera alta. Silencio, ausencia. Paleta Anunna.*

---

### 4.4 Estructuras (6)

#### `zigurat`
- **Tipo**: Estructura — Zigurat · **Rareza**: Mítica · **Coste**: 2 gen + 2 lapislázuli · **Resistencia**: 7
- **Reglas**: Presagio: al final de tu turno, una unidad aliada gana +1 de Ataque y +1 de Vida permanentes.
- **Sabor**: «Siete pisos para acercarse. Nunca ha sido suficiente.»
- **Motor**: nueva (Presagio)
- **Prompt**: *Un zigurat de tres cuerpos escalonados de ladrillo con tres
  escaleras convergiendo en la fachada principal y un santuario en la cima,
  visto de frente al atardecer con la sombra proyectada. Paleta Anunna.*

#### `puerta-de-ishtar`
- **Tipo**: Estructura — Fortaleza · **Rareza**: Rara · **Coste**: 2 gen + 1 lapislázuli · **Resistencia**: 8
- **Reglas**: Guardia.
- **Sabor**: «Azul de arriba abajo. Se ve desde una jornada de camino.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Una puerta monumental de ladrillo vidriado azul intenso,
  cubierta de filas de toros y dragones en relieve amarillo y blanco, con dos
  torres a los lados. Cielo despejado que contrasta con el azul del muro.
  Paleta Anunna.*

#### `biblioteca-de-arcilla`
- **Tipo**: Estructura — Archivo · **Rareza**: Rara · **Coste**: 2 gen + 1 lapislázuli · **Resistencia**: 6
- **Reglas**: Al final de tu turno, sella la primera carta de tu mazo como tablilla.
- **Sabor**: «Treinta mil tablillas ordenadas por tema. Ardió, y por eso se conservan.»
- **Motor**: nueva (Tablilla)
- **Prompt**: *Una sala con estanterías de obra llenas de tablillas de arcilla
  colocadas de canto y etiquetadas, con cestos numerados en el suelo y luz
  entrando por una claraboya. Orden absoluto. Paleta Anunna.*

#### `canal-de-riego`
- **Tipo**: Estructura — Canal · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli · **Resistencia**: 5
- **Reglas**: Al final de tu turno, cura 2 a tu Nexo.
- **Sabor**: «El que lo mande cegar responde ante el rey. Está escrito.»
- **Motor**: ya soportado (mantenimiento de curación)
- **Prompt**: *Un canal de riego recto de orillas de ladrillo cruzando campos
  verdes, con compuertas de madera y una noria de cangilones girando. Palmeras
  alineadas. Luz de media mañana. Paleta Anunna.*

#### `muralla-de-uruk`
- **Tipo**: Estructura — Muralla · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli · **Resistencia**: 6
- **Reglas**: Tus unidades a distancia infligen 1 de daño adicional.
- **Sabor**: «Nueve kilómetros y novecientas torres. Las contó él mismo.»
- **Motor**: ya soportado (`ranged-attack-bonus`)
- **Prompt**: *Un tramo de muralla de adobe con torres semicirculares
  regulares perdiéndose hacia el horizonte llano, con arqueros diminutos en las
  almenas. Vista en escorzo. Paleta Anunna.*

#### `jardin-colgante`
- **Tipo**: Estructura — Jardín · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli · **Resistencia**: 5
- **Reglas**: Al final de tu turno, si tienes 3 o menos cartas en la mano, robas 1.
- **Sabor**: «Nadie se pone de acuerdo en si existió. Aquí sí.»
- **Motor**: ya soportado (mismo patrón que la Biblioteca Sumergida)
- **Prompt**: *Terrazas escalonadas de piedra cubiertas de vegetación densa
  cayendo en cascada por los bordes, con tornillos de riego y canalillos de
  agua entre los arriates, sobre un patio de ladrillo. Verde imposible en
  mitad del ocre. Paleta Anunna.*

---

## 5. Cómo se juega esta facción

Anunna empieza despacio y a propósito. Sus primeros turnos son escribas y
tablillas: nada que dé miedo, un tablero casi vacío y una pila de cartas boca
abajo creciendo junto al Nexo. El rival tiene que decidir si acelera para
castigar ese arranque o si se guarda, sabiendo que en algún momento se abre
todo de golpe.

Es la facción con más **información oculta** del juego y la única que puede
gastar un turno entero preparando el siguiente.

Sus dos debilidades, deliberadas:

1. **El turno tres es de verdad flojo.** Contra Furia o Quinto Sol, que
   presionan desde el principio, puede no llegar viva al turno en que su plan
   funciona.
2. **Todo el plan está en un sitio.** El Anzu del rival —o cualquier carta que
   toque tus tablillas— convierte dos turnos de preparación en nada.

Mazo inicial sugerido (50 cartas): 20 Fuente de Anunna, 3 Escriba de Tablillas,
3 Soldado de la Falange, 2 Pastor de Uruk, 2 Arquero de Lagash,
2 Sacerdotisa del Zigurat, 1 Adivino del Hígado, 1 Salvaje de las Estepas,
1 Barquero de los Muertos, 1 Héroe de Uruk, 1 Lamassu de la Puerta,
1 Anzu Pájaro Tormenta, 1 Mushussu de Babilonia, 1 Coloso de Ladrillo,
1 Señora de los Siete Portales, 1 Toro del Cielo, 2 Tablilla Sellada,
1 Presagio del Hígado, 1 Ley del Talión, 1 Sello Cilíndrico,
1 Cosecha del Éufrates, 1 Descenso al Kur, 1 Diluvio, 1 Zigurat,
1 Puerta de Ishtar, 1 Biblioteca de Arcilla, 1 Canal de Riego.

---

## 6. Checklist de entrega

Nombres de archivo exactos para `tools/art-inbox/` (sin tildes ni ñ):

```
fuente-anunna               escriba-de-tablillas       soldado-de-la-falange
pastor-de-uruk              arquero-de-lagash          adivino-del-higado
salvaje-de-las-estepas      heroe-de-uruk              lamassu-de-la-puerta
sacerdotisa-del-zigurat     anzu-pajaro-tormenta       mushussu-de-babilonia
barquero-de-los-muertos     coloso-de-ladrillo         senora-de-los-siete-portales
toro-del-cielo              tablilla-sellada           presagio-del-higado
ley-del-talion              diluvio                    descenso-al-kur
sello-cilindrico            cosecha-del-eufrates       maldicion-de-akkad
lamento-por-la-ciudad       zigurat                    puerta-de-ishtar
biblioteca-de-arcilla       canal-de-riego             muralla-de-uruk
jardin-colgante             enheduanna-la-primera-voz
```

Aviso de estilo para toda la facción: **ladrillo y sombra dura**. Mesopotamia
no es Egipto: aquí no hay piedra tallada ni oro por todas partes, hay barro
cocido, adobe y betún, y el color se concentra en unos pocos sitios —el azul
del vidriado, el lapislázuli de un collar, el oro de una lira—. Las figuras se
representan como en los relieves: de perfil, con los ojos enormes y de frente,
la barba en espiral y la mirada fija. Nada de arena vacía, nada de tumbas
malditas, nada de aventureros: estas son ciudades con canales, mercados,
archivos y funcionarios trabajando.
