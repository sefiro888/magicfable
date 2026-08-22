# Facción nueva · QUINTO SOL — «El que hay que alimentar»

Dosier completo de la facción azteca (mexica): mitología solar, sacrificio y
cuenta de los días. Identidad, mecánica propia, comandante y **31 cartas** con
su prompt de arte.

---

## 1. Por qué esta facción y en qué se diferencia

Mesoamérica tiene dos trampas evidentes y las dos se esquivan a propósito:

- **No es Duna con otro color.** Duna paga con la Vida de su Nexo y cobra
  después, cuando va por detrás: es contabilidad. Quinto Sol **paga con sus
  propias criaturas** y cobra en el acto, aquí y ahora. Duna invierte; Quinto
  Sol *quema*.
- **No es Samsara al revés.** Samsara pierde piezas para recuperarlas mayores:
  su muerte es un préstamo. En Quinto Sol la muerte es definitiva y por eso
  vale: lo que se ofrece **no vuelve**, se convierte en otra cosa.

Ninguna facción del juego destruye hoy sus propias unidades a voluntad como
recurso. Ese es el hueco, y el que la separa de las otras dos que rondan la
idea.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (ocre, estuco, piedra volcánica) | `#c98b4b` |
| Luz (turquesa ritual, verde quetzal) | `#2fbfae`, `#4fd18b` |
| Sombra (obsidiana pulida) | `#0e0d12` |
| Acento (rojo de cochinilla, amarillo sol) | `#c8242a`, `#f5c33b` |

**Materiales**: obsidiana pulida, mosaico de turquesa, plumas de quetzal, jade,
estuco pintado, papel amate, piedra volcánica. **Formas**: escalinatas
empinadas, serpientes emplumadas, glifos en cartucho, discos calendáricos,
narigueras y orejeras, penachos enormes. **Tono**: monumental y saturado, con el
sol siempre alto y el color a plena intensidad. Nada de ruinas cubiertas de
selva ni de exploradores: la ciudad está encalada, viva y llena de gente.

---

## 2. Las mecánicas propias

### Sacrificio

> **Sacrificio** — Algunas cartas piden, como coste adicional, destruir una
> unidad aliada. Si no tienes ninguna, la carta no se puede jugar.

Es la mecánica insignia y es un coste de verdad, no un adorno: le entregas al
rival la ventaja de tablero que él estaba intentando conseguir, y a cambio
recibes algo que normalmente costaría el doble.

Sus criaturas baratas no son relleno: son **munición**. Media facción existe
para ser gastada por la otra media.

### La Cuenta del Sol

> **La Cuenta** sube en uno cada vez que sacrificas una unidad. No baja nunca.
> Al llegar a **5** y a **10**, se dispara la recompensa que digan tus cartas.

Es lo que impide que la facción sea solo «cambio criaturas por efectos»: cada
sacrificio, además de su beneficio inmediato, **acerca el final**. Una partida
larga contra Quinto Sol es una cuenta atrás visible para los dos jugadores, y
eso cambia cómo se juega mucho antes de que llegue a diez.

> Nota técnica: Sacrificio es un coste adicional en la acción de jugar carta,
> del mismo tipo que la Ofrenda de Duna pero pagado con una pieza del tablero
> en lugar de con Vida. La Cuenta es un contador por jugador que no se reinicia
> al cambiar de turno, a diferencia de todos los que existen hoy.

---

## 3. El comandante

### `itzpapalotl-mariposa-obsidiana`

- **Nombre**: Itzpapálotl · **Título**: Mariposa de Obsidiana
- **Facción**: Quinto Sol · **Vida del Nexo**: 35
- **Pasiva**: El primer Sacrificio de cada turno también inflige 1 de daño al
  Nexo enemigo.
- **Poder (una vez por partida, 2 genérico + 1 turquesa)**: «Caída de las
  Estrellas» — inflige a todas las unidades enemigas daño igual a tu Cuenta del
  Sol.
- **Sabor**: «No pide nada que no vaya a devolver convertido en amanecer.»
- **Prompt de retrato**: *Retrato en tres cuartos de una figura femenina
  imponente con alas de mariposa cuyos bordes son hojas de obsidiana negra
  afiladas y brillantes, cara pintada mitad turquesa mitad negra, tocado de
  plumas de quetzal larguísimas y nariguera de jade. Fondo: cielo nocturno con
  estrellas cayendo sobre la silueta de una pirámide escalonada. Fiera, digna,
  nada monstruosa. Paleta Quinto Sol.*

---

## 4. Las 31 cartas

Cada ficha trae: **id** (nombre de archivo), datos de juego y el prompt de arte.
La columna «motor» avisa de si la carta usa mecánica que el juego ya sabe
resolver o si hay que programar algo.

---

### 4.1 Fuente

#### `fuente-sol`
- **Tipo**: Esencia — Fuente · **Rareza**: Común · **Coste**: 0
- **Reglas**: Agota esta fuente: genera 1 de Esencia de Turquesa.
- **Sabor**: «Cada mañana hay que convencerlo otra vez.»
- **Motor**: ya soportado
- **Prompt**: *Un disco solar de mosaico de turquesa y obsidiana sobre un
  pedestal de piedra volcánica, con el sol real saliendo justo detrás y
  alineándose con él. Sin figuras. Paleta Quinto Sol.*

---

### 4.2 Unidades (15)

#### `cargador-de-tributo`
- **Tipo**: Unidad — Humanoide · **Rareza**: Común · **Coste**: 0 gen + 1 turquesa
- **ATQ/VID**: 1/2 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Cuando esta unidad es sacrificada, robas 1 carta.
- **Sabor**: «Trae cacao, plumas y sal desde la costa. Y algo más, si hace falta.»
- **Motor**: nueva (Sacrificio)
- **Prompt**: *Un porteador con un fardo enorme sujeto con una cinta a la
  frente, subiendo por una calzada elevada sobre el agua, con la ciudad al
  fondo. Ropa sencilla de algodón, sandalias. Esfuerzo digno. Paleta Quinto
  Sol.*

#### `guerrero-aguila`
- **Tipo**: Unidad — Soldado · **Rareza**: Común · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Impulso.
- **Sabor**: «El sol lo eligió por la mañana. Por la tarde ya había cumplido.»
- **Motor**: ya soportado (`impulse`)
- **Prompt**: *Un guerrero con casco en forma de cabeza de águila con el
  rostro asomando por el pico abierto, traje de plumas doradas, escudo redondo
  con mosaico y macuahuitl en la mano. En carrera. Paleta Quinto Sol.*

#### `guerrero-jaguar`
- **Tipo**: Unidad — Soldado · **Rareza**: Común · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «El otro lado del mismo trato.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Un guerrero cubierto con una piel de jaguar completa, cabeza
  del animal como casco, cuerpo pintado con manchas, en posición de guardia con
  escudo y garrote. Selva y escalinata al fondo. Paleta Quinto Sol.*

#### `perro-guia-del-inframundo`
- **Tipo**: Unidad — Bestia · **Rareza**: Común · **Coste**: 0 gen + 1 turquesa
- **ATQ/VID**: 2/1 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Impulso. Cuando esta unidad es sacrificada, cura 2 a tu Nexo.
- **Sabor**: «Cruza el río con quien sea. Solo hay que caerle bien.»
- **Motor**: nueva (Sacrificio)
- **Prompt**: *Un perro xoloitzcuintle sin pelo, de piel gris oscura, junto a
  la orilla de un río subterráneo con una brasa en la boca que ilumina la
  cueva. Atento, sereno. Paleta Quinto Sol.*

#### `arquero-de-chinampa`
- **Tipo**: Unidad — Soldado · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 2/3 · **Alcance** 3 · **Movimiento** 1
- **Reglas**: Ninguna.
- **Sabor**: «Dispara desde el maíz, y el maíz no se mueve de sitio.»
- **Motor**: ya soportado
- **Prompt**: *Un arquero agazapado entre plantas de maíz altas en una isla
  de cultivo flotante rodeada de canales, tensando el arco con un pie apoyado
  en el borde de una canoa. Amanecer con bruma sobre el agua. Paleta Quinto
  Sol.*

#### `portador-del-cuchillo`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 3/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Sacrificio: al entrar en juego, inflige 4 de daño a una unidad enemiga.
- **Sabor**: «El filo entra sin que lo notes. Está hecho de cristal.»
- **Motor**: nueva (Sacrificio)
- **Prompt**: *Un sacerdote con el pelo largo apelmazado y el cuerpo pintado
  de negro, sosteniendo en alto un cuchillo ceremonial de obsidiana con
  empuñadura de mosaico, en lo alto de una escalinata. Contraluz al atardecer.
  Sin violencia explícita. Paleta Quinto Sol.*

#### `tejedora-de-plumas`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 1/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al final de tu turno, una unidad aliada gana un escudo de 2.
- **Sabor**: «Cada pluma va en su sitio. Tarda un año en hacer un escudo.»
- **Motor**: ya soportado (mantenimiento de escudo)
- **Prompt**: *Una artesana sentada rodeada de manojos de plumas de colores
  clasificadas por tonos, montando un mosaico de plumas sobre un armazón de
  escudo, con pinzas finas. Luz de patio, concentración absoluta. Paleta
  Quinto Sol.*

#### `mensajero-de-obsidiana`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Golpe veloz.
- **Sabor**: «De la costa a la ciudad en un día. Se reparten el camino.»
- **Motor**: ya soportado (`swift-strike`)
- **Prompt**: *Un corredor a toda velocidad por un camino de tierra entre
  magueyes, con un tocado ligero y un pequeño estandarte de plumas a la
  espalda, el cuerpo inclinado hacia delante. Polvo levantado. Paleta Quinto
  Sol.*

#### `sacerdote-del-templo-mayor`
- **Tipo**: Unidad — Humanoide · **Rareza**: Rara · **Coste**: 1 gen + 2 turquesa
- **ATQ/VID**: 2/5 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Tus Sacrificios cuentan doble para la Cuenta del Sol.
- **Sabor**: «Lleva la cuenta de todo. Sobre todo de lo que falta.»
- **Motor**: nueva (Cuenta del Sol)
- **Prompt**: *Un sacerdote de alto rango con manto negro bordado, tocado de
  papel plegado y el rostro pintado con franjas, alzando los brazos en lo alto
  de una pirámide gemela al amanecer. Vista desde abajo. Paleta Quinto Sol.*

#### `danzante-del-fuego-nuevo`
- **Tipo**: Unidad — Humanoide · **Rareza**: Rara · **Coste**: 2 gen + 1 turquesa
- **ATQ/VID**: 4/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Cuando ataca, gana +1 de Ataque hasta el final del turno por cada punto de Cuenta del Sol por encima de 5.
- **Sabor**: «Baila cada cincuenta y dos años. Se prepara los otros cincuenta y uno.»
- **Motor**: nueva (Cuenta del Sol)
- **Prompt**: *Un danzante girando con antorchas en ambas manos, cascabeles en
  los tobillos y un penacho de plumas enorme, en una plaza nocturna con la
  gente formando círculo alrededor. Estelas de fuego. Paleta Quinto Sol.*

#### `colibri-del-sur`
- **Tipo**: Unidad — Ave · **Rareza**: Rara · **Coste**: 1 gen + 2 turquesa
- **ATQ/VID**: 4/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador. Sacrificio: al entrar en juego, gana +2/+2 permanentes.
- **Sabor**: «Los guerreros muertos vuelven así. Pequeños y furiosos.»
- **Motor**: nueva (Sacrificio)
- **Prompt**: *Un colibrí de plumaje iridiscente verde y azul, enorme respecto
  al encuadre, suspendido en el aire con las alas desdibujadas por la
  velocidad, ante una flor roja. Detalle de joyería en el pico. Paleta Quinto
  Sol.*

#### `monolito-viviente`
- **Tipo**: Unidad — Constructo · **Rareza**: Rara · **Coste**: 2 gen + 2 turquesa
- **ATQ/VID**: 5/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Perforar.
- **Sabor**: «Lo tallaron tumbado. Nadie recuerda haberlo puesto de pie.»
- **Motor**: ya soportado (`guard` + `pierce`)
- **Prompt**: *Una escultura colosal de piedra volcánica gris con rasgos
  geométricos y restos de pintura roja y turquesa en los relieves, incorporada
  y caminando, con polvo cayendo de las juntas. Vista desde abajo. Paleta
  Quinto Sol.*

#### `serpiente-emplumada`
- **Tipo**: Unidad — Dragón · **Rareza**: Mítica · **Coste**: 3 gen + 2 turquesa
- **ATQ/VID**: 6/6 · **Alcance** 2 · **Movimiento** 2
- **Reglas**: Volador. Al entrar en juego, robas 1 carta por cada 3 puntos de Cuenta del Sol.
- **Sabor**: «Se fue prometiendo que volvería. Lo dijo en serio.»
- **Motor**: nueva (Cuenta del Sol)
- **Prompt**: *Una serpiente colosal cubierta de plumas de quetzal verdes y
  azules ondulando por el aire sobre una pirámide escalonada, con la cabeza
  descendiendo por la escalinata como en los relieves. Cielo de tormenta con
  claros de sol. Paleta Quinto Sol.*

#### `tzitzimitl-estrella-caida`
- **Tipo**: Unidad — Horror · **Rareza**: Mítica · **Coste**: 4 gen + 2 turquesa
- **ATQ/VID**: 7/5 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Sacrificio: al entrar en juego, destruye la unidad enemiga con más Ataque.
- **Sabor**: «Baja cuando el sol se apaga. A comprobar si vuelve.»
- **Motor**: nueva (Sacrificio)
- **Prompt**: *Una figura descarnada con falda de serpientes entrelazadas,
  collar de manos y corazones estilizados, garras largas y cara de calavera con
  ojos vivos, descendiendo del cielo durante un eclipse. Terrible pero
  ceremonial, sin gore. Paleta Quinto Sol.*

#### `senora-de-la-falda-de-jade`
- **Tipo**: Unidad — Celestial · **Rareza**: Rara · **Coste**: 1 gen + 2 turquesa
- **ATQ/VID**: 2/5 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Al final de tu turno, cura 2 a tu Nexo por cada unidad tuya sacrificada este turno.
- **Sabor**: «Los canales de la ciudad son suyos. Los presta.»
- **Motor**: nueva (Sacrificio)
- **Prompt**: *Una figura femenina con falda larga de mosaico de jade verde
  que se confunde con el agua de un canal, tocado de nenúfares y caracolas,
  vertiendo agua de un cántaro. Reflejos, libélulas. Serena. Paleta Quinto
  Sol.*

---

### 4.3 Hechizos (9)

#### `corazon-ofrecido`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Común · **Coste**: 0 gen + 1 turquesa
- **Reglas**: Sacrificio. Robas 2 cartas y curas 3 a tu Nexo.
- **Sabor**: «Lo que se da no se pierde. Cambia de sitio.»
- **Motor**: nueva (Sacrificio)
- **Prompt**: *Un cuenco ceremonial de piedra tallada sobre un altar, con
  humo de copal subiendo en volutas y pétalos de cempasúchil alrededor, bajo
  el sol de mediodía. Sin figuras, sin sangre. Paleta Quinto Sol.*

#### `lluvia-de-obsidiana`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Rara · **Coste**: 2 gen + 1 turquesa
- **Reglas**: Inflige 3 de daño a todas las unidades enemigas.
- **Sabor**: «Cae del cielo y corta al caer. Después hay que barrerla.»
- **Motor**: ya soportado (`damage-all-enemies`)
- **Prompt**: *Miles de esquirlas de obsidiana negra cayendo del cielo como
  lluvia oblicua, clavándose en el suelo de una plaza empedrada y reflejando la
  luz. Sin figuras. Dramático. Paleta Quinto Sol.*

#### `fuego-nuevo`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 1 gen + 2 turquesa
- **Reglas**: Sacrificio. Todas tus unidades ganan +1 de Ataque y +1 de Vida permanentes.
- **Sabor**: «Se apagan todos los fuegos de la ciudad. Y se enciende uno.»
- **Motor**: nueva (Sacrificio)
- **Prompt**: *Una hoguera única encendiéndose en lo alto de un cerro de
  noche, con la ciudad entera a oscuras abajo y antorchas empezando a
  encenderse en cadena calle por calle. Vista amplia. Paleta Quinto Sol.*

#### `sequia-del-quinto-sol`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **Reglas**: Una unidad enemiga pierde 3 de Vida al final de cada turno hasta que muere.
- **Sabor**: «El maíz se seca de arriba abajo, despacio, sin remedio.»
- **Motor**: ya soportado (maldición de desgaste)
- **Prompt**: *Un campo de maíz seco y quebradizo con la tierra agrietada en
  placas, bajo un sol blanco y un cielo sin una nube. Un solo tallo aún verde
  en el centro. Sin figuras. Paleta Quinto Sol.*

#### `canto-de-guerra`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 turquesa
- **Reglas**: Una unidad aliada gana +3 de Ataque hasta el final del turno y puede volver a moverse.
- **Sabor**: «No es para asustar al enemigo. Es para que el nuestro no dude.»
- **Motor**: ya soportado (bono temporal + refrescar movimiento)
- **Prompt**: *Una fila de guerreros con caracolas y tambores de madera
  tocando al unísono en formación, con los penachos alineados y la boca abierta
  en un grito. Vista lateral, movimiento. Paleta Quinto Sol.*

#### `espejo-humeante`
- **Tipo**: Hechizo inmediato — Encantamiento · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **Reglas**: Congela una unidad enemiga 2 turnos y el rival descarta 1 carta.
- **Sabor**: «Enseña lo que vas a hacer. Por eso ya no lo haces.»
- **Motor**: ya soportado (`freeze` + descarte)
- **Prompt**: *Un espejo circular de obsidiana pulida sostenido en una mano,
  con humo saliendo de la superficie y un reflejo que no corresponde a lo que
  hay delante. Fondo oscuro. Inquietante. Paleta Quinto Sol.*

#### `plumas-de-quetzal`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 turquesa
- **Reglas**: Una unidad aliada gana un escudo de 3 y Volador hasta el final del turno.
- **Sabor**: «Valen más que el oro. El oro no vuela.»
- **Motor**: nueva (palabra clave temporal; ya existe en Vacío)
- **Prompt**: *Un manojo de plumas de quetzal larguísimas, verdes iridiscentes,
  atadas con hilo rojo y flotando en el aire con una corriente ascendente.
  Fondo neutro oscuro para que resalte el color. Paleta Quinto Sol.*

#### `red-de-chinampas`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **Reglas**: Robas 2 cartas.
- **Sabor**: «La ciudad come tres veces al día porque alguien pensó en esto.»
- **Motor**: ya soportado (`draw`)
- **Prompt**: *Vista cenital de un damero de islas de cultivo verdes separadas
  por canales de agua brillante, con canoas cargadas navegando entre ellas y la
  ciudad al fondo. Ordenado y fértil. Paleta Quinto Sol.*

#### `cuenta-de-los-dias`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Mítica · **Coste**: 2 gen + 2 turquesa
- **Reglas**: Inflige a cada unidad enemiga daño igual a tu Cuenta del Sol, hasta un máximo de 6.
- **Sabor**: «Todos los días están contados desde antes de empezar.»
- **Motor**: nueva (Cuenta del Sol)
- **Prompt**: *Un disco calendárico de piedra tallado con glifos concéntricos y
  la cara central con la lengua fuera, girando lentamente con luz saliendo de
  las hendiduras. Vista frontal. Paleta Quinto Sol.*

---

### 4.4 Estructuras (6)

#### `templo-mayor`
- **Tipo**: Estructura — Templo · **Rareza**: Mítica · **Coste**: 2 gen + 2 turquesa · **Resistencia**: 7
- **Reglas**: Al final de tu turno, si has sacrificado una unidad este turno, inflige 2 de daño al Nexo enemigo.
- **Sabor**: «Dos escalinatas, dos santuarios, dos motivos. El mismo edificio.»
- **Motor**: nueva (Sacrificio)
- **Prompt**: *Una pirámide escalonada doble con dos santuarios en la cima, uno
  pintado de rojo y otro de azul, escalinatas empinadísimas y braseros
  encendidos en las terrazas. Vista frontal desde la plaza. Paleta Quinto Sol.*

#### `piedra-del-sol`
- **Tipo**: Estructura — Monolito · **Rareza**: Rara · **Coste**: 2 gen + 1 turquesa · **Resistencia**: 6
- **Reglas**: Tu Cuenta del Sol empieza en 2. Al final de tu turno, escruta 1.
- **Sabor**: «No es un calendario. Es un recibo.»
- **Motor**: nueva (Cuenta del Sol)
- **Prompt**: *Un monolito circular de basalto de tres metros apoyado
  verticalmente, cubierto de glifos concéntricos, con luz rasante de tarde
  marcando cada relieve. Andamios de madera y cuerdas a un lado. Paleta Quinto
  Sol.*

#### `juego-de-pelota`
- **Tipo**: Estructura — Recinto · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa · **Resistencia**: 5
- **Reglas**: Tus unidades a distancia infligen 1 de daño adicional.
- **Sabor**: «Se juega con la cadera. Se pierde con todo lo demás.»
- **Motor**: ya soportado (`ranged-attack-bonus`)
- **Prompt**: *Un patio de juego de pelota en forma de doble T con muros
  inclinados y dos anillos de piedra enfrentados en lo alto, vacío, con las
  gradas a los lados y luz de última hora. Paleta Quinto Sol.*

#### `muro-de-craneos`
- **Tipo**: Estructura — Fortaleza · **Rareza**: Rara · **Coste**: 2 gen + 1 turquesa · **Resistencia**: 8
- **Reglas**: Guardia.
- **Sabor**: «Cada uno tuvo un nombre. La pared entera es una lista.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Un muro ceremonial formado por hileras ordenadas de calaveras
  de piedra tallada, encalado y con restos de pintura roja, con braseros
  humeando delante. Solemne y ordenado, sin morbo. Paleta Quinto Sol.*

#### `calzada-de-la-laguna`
- **Tipo**: Estructura — Calzada · **Rareza**: Común · **Coste**: 1 gen + 1 turquesa · **Resistencia**: 5
- **Reglas**: Al final de tu turno, cura 2 a tu Nexo.
- **Sabor**: «Tres calzadas y un acueducto. La ciudad respira por ahí.»
- **Motor**: ya soportado (mantenimiento de curación)
- **Prompt**: *Una calzada ancha de piedra atravesando una laguna en línea
  recta hasta la ciudad, con un puente de madera desmontable en el centro y
  canoas a los lados. Amanecer con niebla sobre el agua. Paleta Quinto Sol.*

#### `chinampa-flotante`
- **Tipo**: Estructura — Cultivo · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa · **Resistencia**: 4
- **Reglas**: Al final de tu turno, si tienes 3 o menos cartas en la mano, robas 1.
- **Sabor**: «Cuatro cosechas al año. Cinco si el año viene bien.»
- **Motor**: ya soportado (mismo patrón que la Biblioteca Sumergida)
- **Prompt**: *Una isla de cultivo rectangular flotando en un canal, sujeta
  por sauces jóvenes plantados en las esquinas, con maíz, calabaza y frijol
  creciendo juntos y una canoa amarrada. Verde intenso sobre agua oscura.
  Paleta Quinto Sol.*

---

## 5. Cómo se juega esta facción

Quinto Sol despliega barato y gasta lo desplegado. Sus cargadores y sus perros
no están para pelear: están para convertirse en cartas, en daño y en Cuenta. El
rival ve un tablero lleno de criaturas pequeñas y descubre tarde que ninguna de
ellas pensaba quedarse.

Es la facción más **explosiva** del juego a media partida, y la que peor lleva
que le maten las piezas antes de poder gastarlas él.

Sus dos debilidades, deliberadas:

1. **Sin munición no hay facción.** Media docena de sus mejores cartas no se
   pueden ni jugar si no tienes una unidad que sacrificar. Un barrido en el
   momento justo la deja con la mano llena de cartas muertas.
2. **Le regala el tablero al rival.** Cada Sacrificio es una pieza menos sobre
   la mesa. Contra Orden o Jade, que ganan por control del terreno, puede
   quedarse sin nada que defender el Nexo.

Mazo inicial sugerido (50 cartas): 20 Fuente de Sol, 3 Cargador de Tributo,
3 Guerrero Águila, 2 Guerrero Jaguar, 2 Perro Guía del Inframundo,
2 Arquero de Chinampa, 2 Portador del Cuchillo, 1 Tejedora de Plumas,
1 Mensajero de Obsidiana, 1 Sacerdote del Templo Mayor, 1 Colibrí del Sur,
1 Danzante del Fuego Nuevo, 1 Señora de la Falda de Jade, 1 Monolito Viviente,
1 Serpiente Emplumada, 1 Tzitzimitl Estrella Caída, 2 Corazón Ofrecido,
1 Canto de Guerra, 1 Lluvia de Obsidiana, 1 Fuego Nuevo, 1 Espejo Humeante,
1 Cuenta de los Días, 1 Templo Mayor, 1 Piedra del Sol, 1 Muro de Cráneos,
1 Calzada de la Laguna.

---

## 6. Checklist de entrega

Nombres de archivo exactos para `tools/art-inbox/` (sin tildes ni ñ):

```
fuente-sol                  cargador-de-tributo        guerrero-aguila
guerrero-jaguar             perro-guia-del-inframundo  arquero-de-chinampa
portador-del-cuchillo       tejedora-de-plumas         mensajero-de-obsidiana
sacerdote-del-templo-mayor  danzante-del-fuego-nuevo   colibri-del-sur
monolito-viviente           serpiente-emplumada        tzitzimitl-estrella-caida
senora-de-la-falda-de-jade  corazon-ofrecido           lluvia-de-obsidiana
fuego-nuevo                 sequia-del-quinto-sol      canto-de-guerra
espejo-humeante             plumas-de-quetzal          red-de-chinampas
cuenta-de-los-dias          templo-mayor               piedra-del-sol
juego-de-pelota             muro-de-craneos            calzada-de-la-laguna
chinampa-flotante           itzpapalotl-mariposa-obsidiana
```

Aviso de estilo para toda la facción: **una ciudad viva, no unas ruinas**. Todo
está encalado, recién pintado y a plena luz: los templos son rojos y azules, no
grises; los relieves conservan su color; las plazas están llenas. Nada de selva
comiéndose las piedras, nada de exploradores, nada de calaveras de azúcar —eso
es otra época y otra cosa. El sacrificio se sugiere siempre con lo ceremonial:
el cuchillo, el humo de copal, el cuenco, la escalinata al contraluz; nunca con
sangre a la vista.
