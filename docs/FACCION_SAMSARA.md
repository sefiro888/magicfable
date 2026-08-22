# Facción nueva · SAMSARA — «La Rueda que no se detiene»

Dosier completo de la facción india: mitología védica e hindú, ciclo de
renacimiento y avatares. Identidad, mecánica propia, comandante y **31 cartas**
con su prompt de arte.

---

## 1. Por qué esta facción y en qué se diferencia

La India tiene dos trampas evidentes y las dos se esquivan a propósito:

- **No es Naturaleza con elefantes.** Naturaleza crece hacia arriba: cura,
  engorda y aguanta. Samsara **no crece, gira**: sus criaturas mueren y vuelven
  siendo otra cosa, y cada vuelta de rueda las deja mejor que la anterior.
- **No es Sombra con reencarnación.** Sombra saquea el cementerio ajeno y roba
  vida. Samsara **no roba nada a nadie**: administra su propio ciclo, y lo que
  pierde le vuelve. Donde Sombra profana, Samsara *cumple*.

Ninguna facción del juego quiere hoy que sus propias unidades mueran. Ese es el
hueco: la única que juega a perder piezas porque perderlas es su motor.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (azafrán, cúrcuma, arcilla) | `#e08a2c` |
| Luz (oro de templo, lámpara de ghee) | `#ffd27a`, `#fff2cf` |
| Sombra (índigo profundo, noche del monzón) | `#1b1a3a` |
| Acento (verde loto, rojo bermellón) | `#3fae7a`, `#d63b3b` |

**Materiales**: bronce fundido, arenisca rosada, seda teñida, guirnaldas de
caléndula, ceniza sagrada, pan de oro, marfil. **Formas**: brazos múltiples,
posturas de danza, ruedas y mandalas, arcos de templo, aureolas de fuego,
serpientes enroscadas. **Tono**: exuberante y sereno a la vez. Nada de
misticismo de bazar ni de gurús de postal: esto es una cosmología funcionando,
con sus dioses ocupados y su rueda girando.

---

## 2. Las mecánicas propias

### Renacer

> **Renacer N** — Cuando esta unidad es destruida, vuelve a tu mano con +N/+N
> permanentes. Solo una vez por copia.

Es la mecánica insignia y va a contracorriente de todo el juego: sus unidades
**quieren** morir, porque cada muerte las devuelve más grandes. Cambia por
completo cómo se juega el combate contra ella — el intercambio favorable deja
de serlo, y el rival tiene que decidir si mata algo sabiendo que lo va a volver
a ver peor.

El límite de una vez por copia es lo que impide que sea un bucle infinito: la
rueda da una vuelta, no gira sola para siempre.

### Avatar

> **Avatar** — Al entrar en juego, si ya has tenido una unidad destruida este
> turno, esta carta entra con su forma despierta (el segundo bloque de reglas).

La contrapartida activa de Renacer: premia la muerte reciente en lugar de la
propia. Es lo que hace que la facción tenga dos velocidades — la forma dormida,
modesta y barata, y la despierta, que es lo que la gente recuerda.

> Nota técnica: Renacer necesita un disparador de muerte que devuelva la carta
> a la mano con modificadores permanentes; el motor ya tiene disparadores de
> muerte (`on-kill-heal-nexus`) y bonos permanentes (`permanentAttackBonus`),
> así que es una combinación de dos cosas que existen. Avatar solo necesita
> contar las muertes propias del turno, igual que ya se cuentan las Ofrendas.

---

## 3. El comandante

### `indrayani-la-rueda`

- **Nombre**: Indrayani · **Título**: La que Hace Girar la Rueda
- **Facción**: Samsara · **Vida del Nexo**: 35
- **Pasiva**: La primera unidad aliada que muere cada turno te hace robar 1 carta.
- **Poder (una vez por partida, 2 genérico + 1 azafrán)**: «Vuelta Completa» —
  devuelve a tu mano todas tus unidades destruidas esta partida que tuvieran
  Renacer sin gastar.
- **Sabor**: «No castiga ni perdona. Solo se asegura de que la rueda siga girando.»
- **Prompt de retrato**: *Retrato en tres cuartos de una figura femenina de piel
  oscura y cuatro brazos, corona alta de oro y gemas, ojos entrecerrados en
  calma absoluta, sosteniendo en cada mano un objeto distinto: una rueda de
  radios, una flor de loto, una llama y una cuerda. Sari de seda azafrán con
  bordado de oro, guirnalda de caléndulas al cuello. Fondo: aureola circular de
  fuego dorado sobre un templo de arenisca rosada. Serena, imponente, nada
  amenazante. Paleta Samsara.*

---

## 4. Las 31 cartas

Cada ficha trae: **id** (nombre de archivo), datos de juego y el prompt de arte.
La columna «motor» avisa de si la carta usa mecánica que el juego ya sabe
resolver o si hay que programar algo.

---

### 4.1 Fuente

#### `fuente-samsara`
- **Tipo**: Esencia — Fuente · **Rareza**: Común · **Coste**: 0
- **Reglas**: Agota esta fuente: genera 1 de Esencia de Azafrán.
- **Sabor**: «El aceite de la lámpara nunca se acaba del todo.»
- **Motor**: ya soportado
- **Prompt**: *Una lámpara de aceite de bronce con varias mechas encendidas
  sobre un pedestal de piedra, guirnaldas de caléndula alrededor y pétalos
  flotando en un cuenco de agua. Luz cálida en la penumbra de un templo. Sin
  figuras. Paleta Samsara.*

---

### 4.2 Unidades (15)

#### `peregrino-del-ganges`
- **Tipo**: Unidad — Humanoide · **Rareza**: Común · **Coste**: 0 gen + 1 azafrán
- **ATQ/VID**: 1/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Renacer 1.
- **Sabor**: «Ha hecho el camino tantas veces que ya no recuerda por qué empezó.»
- **Motor**: nueva (Renacer)
- **Prompt**: *Un peregrino delgado y descalzo con una túnica azafrán gastada y
  un bastón, metido hasta las rodillas en un río al amanecer, con la neblina
  sobre el agua y escalones de piedra al fondo. Sereno, ajeno al frío. Paleta
  Samsara.*

#### `guardian-de-la-puerta`
- **Tipo**: Unidad — Humanoide · **Rareza**: Común · **Coste**: 1 gen + 1 azafrán
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «Lleva de guardia lo que dura una era. Le quedan tres.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Un guardián de templo enorme, torso desnudo con ceniza sagrada
  en franjas, maza de bronce apoyada en el hombro, de pie bajo un arco tallado
  con figuras. Bigote espeso, mirada fija. Paleta Samsara.*

#### `tigresa-de-la-diosa`
- **Tipo**: Unidad — Bestia · **Rareza**: Común · **Coste**: 1 gen + 1 azafrán
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Impulso.
- **Sabor**: «No es su montura. La acompaña porque le apetece.»
- **Motor**: ya soportado (`impulse`)
- **Prompt**: *Una tigresa de bengala saltando entre la maleza alta al
  atardecer, con una gualdrapa bordada de oro y campanillas al cuello. Músculo
  y elegancia, movimiento congelado. Paleta Samsara.*

#### `bailarina-de-los-cien-brazos`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 azafrán
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Renacer 2.
- **Sabor**: «Cada vuelta del baile se lo enseña un poco mejor.»
- **Motor**: nueva (Renacer)
- **Prompt**: *Una bailarina en plena postura de danza clásica, con el efecto
  de múltiples brazos superpuestos como una fotografía de larga exposición,
  campanillas en los tobillos, sari rojo y dorado. Fondo: patio de templo con
  lámparas encendidas. Paleta Samsara.*

#### `naga-del-pozo`
- **Tipo**: Unidad — Serpiente · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 azafrán
- **ATQ/VID**: 3/3 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Cuando ataca, aturde al objetivo.
- **Sabor**: «El agua del pozo está fresca. Nadie baja a por ella.»
- **Motor**: ya soportado (`stun`)
- **Prompt**: *Una naga de torso humano y cuerpo de serpiente emergiendo de un
  pozo escalonado de piedra, capucha de cobra desplegada tras la cabeza, joyas
  de oro en los brazos. Luz verdosa del agua reflejada en la piedra. Paleta
  Samsara.*

#### `asceta-de-la-ceniza`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 2 gen + 1 azafrán
- **ATQ/VID**: 1/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al final de tu turno, cura 2 a tu Nexo por cada unidad tuya destruida este turno.
- **Sabor**: «Se sienta donde arden las piras porque allí no le molesta nadie.»
- **Motor**: nueva (contador de muertes propias del turno)
- **Prompt**: *Un asceta cubierto de ceniza gris de la cabeza a los pies,
  rastas largas recogidas, sentado en meditación junto a una pira que aún humea
  a orillas de un río de noche. Ojos cerrados, total quietud. Paleta Samsara.*

#### `elefante-de-guerra`
- **Tipo**: Unidad — Bestia · **Rareza**: Rara · **Coste**: 2 gen + 2 azafrán
- **ATQ/VID**: 5/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Perforar.
- **Sabor**: «La formación enemiga no se rompe. Se aparta.»
- **Motor**: ya soportado (`pierce`)
- **Prompt**: *Un elefante de guerra acorazado con placas de metal repujado y
  una torreta de madera en el lomo, colmillos con puntas de bronce, avanzando
  entre polvo. Visto ligeramente desde abajo para exagerar la mole. Paleta
  Samsara.*

#### `garuda-de-alas-de-sol`
- **Tipo**: Unidad — Celestial · **Rareza**: Rara · **Coste**: 2 gen + 1 azafrán
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador. Avatar: entra con +2/+0 y Golpe veloz.
- **Sabor**: «Baja una vez por era, y siempre a por lo mismo.»
- **Motor**: nueva (Avatar)
- **Prompt**: *Un ser de cuerpo humano musculoso y cabeza, alas y garras de
  águila dorada, plumaje que parece hecho de luz de mediodía, descendiendo en
  picado con las alas desplegadas. Joyas de oro en el pecho. Cielo abierto de
  fondo. Paleta Samsara.*

#### `mono-saltarin`
- **Tipo**: Unidad — Bestia · **Rareza**: Común · **Coste**: 0 gen + 1 azafrán
- **ATQ/VID**: 2/1 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Impulso. Renacer 1.
- **Sabor**: «Lo han matado cuatro veces. Se lo toma como un juego.»
- **Motor**: nueva (Renacer)
- **Prompt**: *Un mono langur de cara negra saltando entre las almenas de un
  templo con una fruta robada en la mano, cola arqueada, gesto burlón. Piedra
  rosada y cielo azul intenso. Paleta Samsara.*

#### `rakshasa-de-la-noche`
- **Tipo**: Unidad — Horror · **Rareza**: Rara · **Coste**: 2 gen + 2 azafrán
- **ATQ/VID**: 5/4 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Vínculo vital. Avatar: además, al entrar, el rival descarta 1 carta.
- **Sabor**: «De día es un consejero cortés. De noche cambia de opinión.»
- **Motor**: nueva (Avatar)
- **Prompt**: *Un rakshasa de piel azul oscuro, colmillos prominentes y cuatro
  ojos, vestido con sedas ricas y joyas pesadas, medio oculto entre las
  columnas de un palacio nocturno iluminado por antorchas. Elegante y
  perturbador a partes iguales. Paleta Samsara.*

#### `arquero-del-arco-de-cuerno`
- **Tipo**: Unidad — Soldado · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 azafrán
- **ATQ/VID**: 2/3 · **Alcance** 3 · **Movimiento** 1
- **Reglas**: Ninguna.
- **Sabor**: «Tensó el arco antes de que empezara la guerra y sigue esperando.»
- **Motor**: ya soportado
- **Prompt**: *Un arquero de torso desnudo con cordón sagrado cruzado al pecho,
  tensando un arco compuesto de cuerno y tendón, con el codo muy alto. Turbante
  ligero. Campo abierto polvoriento al fondo. Paleta Samsara.*

#### `vaca-de-la-abundancia`
- **Tipo**: Unidad — Bestia · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 azafrán
- **ATQ/VID**: 0/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Al final de tu turno, cura 2 a tu Nexo.
- **Sabor**: «Nadie la molesta. Nadie se atreve.»
- **Motor**: ya soportado (`guard` + mantenimiento de curación)
- **Prompt**: *Una vaca blanca de cuernos pintados de colores y guirnalda de
  flores al cuello, tumbada tranquilamente en mitad de una calle de mercado que
  se aparta a su alrededor. Luz dorada de tarde. Paleta Samsara.*

#### `avatar-del-jabali`
- **Tipo**: Unidad — Avatar · **Rareza**: Mítica · **Coste**: 3 gen + 2 azafrán
- **ATQ/VID**: 6/6 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Perforar. Avatar: entra con +2/+2 y ataca el turno en que entra.
- **Sabor**: «Se hunde en el océano y vuelve con el mundo en los colmillos.»
- **Motor**: nueva (Avatar)
- **Prompt**: *Un ser colosal de cuerpo humano dorado y cabeza de jabalí,
  emergiendo de un océano oscuro con agua cayendo en cortinas de sus hombros,
  sosteniendo un pequeño globo terráqueo sobre un colmillo. Épico, monumental.
  Paleta Samsara.*

#### `danzante-de-la-destruccion`
- **Tipo**: Unidad — Celestial · **Rareza**: Mítica · **Coste**: 4 gen + 2 azafrán
- **ATQ/VID**: 7/7 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al entrar en juego, destruye TODAS las unidades con 3 o menos de Vida, incluidas las tuyas.
- **Sabor**: «El baile no es un final. Es lo que hay que hacer antes de empezar otra vez.»
- **Motor**: nueva (barrido condicional que incluye aliados)
- **Prompt**: *Una figura de cuatro brazos danzando dentro de un aro de llamas,
  pie levantado, cabello suelto en ondas, tambor en una mano y fuego en otra,
  con ceniza y chispas girando alrededor. Bronce oscuro y oro. Terrible y
  hermoso. Paleta Samsara.*

#### `nino-de-la-flauta`
- **Tipo**: Unidad — Celestial · **Rareza**: Rara · **Coste**: 1 gen + 2 azafrán
- **ATQ/VID**: 2/4 · **Alcance** 2 · **Movimiento** 2
- **Reglas**: Tus unidades con Renacer vuelven con +1/+1 adicional.
- **Sabor**: «Toca. Y todo el mundo hace lo que ya iba a hacer, pero mejor.»
- **Motor**: nueva (Renacer)
- **Prompt**: *Un joven de piel azul con corona de plumas de pavo real,
  apoyado en una pose relajada con una pierna cruzada, tocando una flauta
  travesera. Vacas y pastores escuchando al fondo entre árboles. Luz de tarde,
  ambiente idílico. Paleta Samsara.*

---

### 4.3 Hechizos (9)

#### `flecha-de-brahma`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 0 gen + 1 azafrán
- **Reglas**: Inflige 4 de daño a una unidad enemiga.
- **Sabor**: «Se dispara una vez y ya no hay forma de retirarla.»
- **Motor**: ya soportado (`damage`)
- **Prompt**: *Una flecha ardiendo en pleno vuelo con una estela de fuego
  dorado y símbolos luminosos girando a su alrededor, sobre un cielo cargado.
  Composición diagonal. Sin figuras. Paleta Samsara.*

#### `rueda-que-gira`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 2 gen + 1 azafrán
- **Reglas**: Destruye una unidad aliada. Devuélvela a tu mano con +2/+2 permanentes y roba 1 carta.
- **Sabor**: «Se rompe para que pueda volver a empezar.»
- **Motor**: nueva (sacrificio propio + bono permanente)
- **Prompt**: *Una rueda de radios de bronce girando tan deprisa que se ve
  desdibujada, con pétalos y ceniza arrastrados en el remolino, suspendida en
  un patio de templo. Sin figuras. Paleta Samsara.*

#### `bendicion-del-rio`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 azafrán
- **Reglas**: Cura 6 de Vida a tu Nexo y una unidad aliada gana un escudo de 2.
- **Sabor**: «Baja del norte cargado de nieve y de perdones.»
- **Motor**: ya soportado (`heal-nexus` + escudo)
- **Prompt**: *Miles de lámparas de aceite flotando en la corriente de un río
  ancho al anochecer, con los escalones de la orilla llenos de ofrendas de
  flores. Reflejos dorados en el agua. Sin figuras protagonistas. Paleta
  Samsara.*

#### `maya-el-espejismo`
- **Tipo**: Hechizo inmediato — Encantamiento · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 azafrán
- **Reglas**: Congela una unidad enemiga 2 turnos.
- **Sabor**: «Sigue peleando. Contra algo que no está.»
- **Motor**: ya soportado (`freeze`)
- **Prompt**: *Una figura humana que se deshace en ondas de calor y reflejos,
  como un espejismo sobre un camino de tierra al mediodía, con templos
  duplicados y flotando en el horizonte. Inquietante y bello. Paleta Samsara.*

#### `ofrenda-de-fuego`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 azafrán
- **Reglas**: Inflige 2 de daño a todas las unidades enemigas. Si alguna unidad tuya ha muerto este turno, inflige 4 en su lugar.
- **Sabor**: «Al fuego se le da algo antes de pedirle nada.»
- **Motor**: nueva (condición de muerte propia en el turno)
- **Prompt**: *Un altar cuadrado de ladrillo con una hoguera ritual alta,
  manos anónimas vertiendo mantequilla clarificada en las llamas, chispas
  subiendo en columna. Noche cerrada alrededor. Paleta Samsara.*

#### `veneno-de-la-serpiente`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 azafrán
- **Reglas**: Una unidad enemiga pierde 3 de Vida al final de cada turno hasta que muere.
- **Sabor**: «El batido del océano trajo el néctar. Y también esto.»
- **Motor**: ya soportado (maldición de desgaste, como Sombra)
- **Prompt**: *Un chorro de veneno azul oscuro brotando de las fauces de una
  serpiente gigante enroscada en una montaña, con el mar batido a su alrededor.
  Ambiente de mito cósmico. Paleta Samsara.*

#### `karma`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Mítica · **Coste**: 2 gen + 2 azafrán
- **Reglas**: Devuelve a tu mano todas tus unidades destruidas este turno, con +1/+1 permanentes.
- **Sabor**: «No es castigo ni recompensa. Es contabilidad.»
- **Motor**: nueva (registro de muertes propias del turno)
- **Prompt**: *Una balanza cósmica de platillos suspendida en el vacío, con una
  rueda girando en un platillo y una llama en el otro, rodeada de constelaciones
  y pétalos. Sin figuras. Paleta Samsara.*

#### `bendicion-de-los-mil-ojos`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 azafrán
- **Reglas**: Robas 2 cartas y escrutas 1.
- **Sabor**: «Ve todo lo que pasa. El problema es acordarse de mirar.»
- **Motor**: ya soportado (`draw` + `scry`)
- **Prompt**: *Un cielo nocturno en el que las estrellas están dispuestas como
  ojos abiertos, sobre la silueta de una ciudad de templos. Bello, no
  amenazante. Paleta Samsara.*

#### `monzon`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Rara · **Coste**: 2 gen + 1 azafrán
- **Reglas**: Inflige 3 de daño a todas las unidades enemigas y les resta 1 de Movimiento este turno.
- **Sabor**: «Se espera todo el año. Y aun así llega de golpe.»
- **Motor**: ya soportado (`damage-all-enemies` + ralentización)
- **Prompt**: *Un muro de lluvia avanzando sobre una llanura seca y agrietada,
  con nubes negras bajísimas y las primeras gotas levantando polvo. Grandioso.
  Sin figuras. Paleta Samsara.*

---

### 4.4 Estructuras (6)

#### `templo-de-la-rueda`
- **Tipo**: Estructura — Templo · **Rareza**: Rara · **Coste**: 2 gen + 1 azafrán · **Resistencia**: 6
- **Reglas**: Al final de tu turno, si alguna unidad tuya ha muerto este turno, robas 1 carta.
- **Sabor**: «Cada carro tallado en la fachada es una vuelta que ya se dio.»
- **Motor**: nueva (condición de muerte propia)
- **Prompt**: *Un templo de piedra tallado en forma de carro gigante, con
  ruedas de dos metros esculpidas en el muro y caballos de piedra tirando de
  él. Amanecer, luz rasante que marca los relieves. Paleta Samsara.*

#### `pira-del-ghat`
- **Tipo**: Estructura — Pira · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 azafrán · **Resistencia**: 4
- **Reglas**: Tus unidades con Renacer vuelven a tu mano con 1 de coste genérico menos.
- **Sabor**: «Arde a todas horas porque siempre hay alguien terminando.»
- **Motor**: nueva (Renacer)
- **Prompt**: *Escalones de piedra bajando al río con varias piras encendidas
  en distintas fases, humo subiendo recto en el aire quieto del amanecer, barcas
  de madera amarradas. Solemne, sin morbo. Paleta Samsara.*

#### `estanque-de-loto`
- **Tipo**: Estructura — Estanque · **Rareza**: Común · **Coste**: 1 gen + 1 azafrán · **Resistencia**: 5
- **Reglas**: Al final de tu turno, cura 2 a tu Nexo.
- **Sabor**: «Crece en el barro y sale limpio. Nadie sabe cómo.»
- **Motor**: ya soportado (mantenimiento de curación)
- **Prompt**: *Un estanque cuadrado de piedra lleno de flores de loto rosas
  abiertas, con escalones bajando al agua por los cuatro lados y palomas
  bebiendo. Luz de primera hora. Paleta Samsara.*

#### `puerta-de-los-leones`
- **Tipo**: Estructura — Fortaleza · **Rareza**: Rara · **Coste**: 2 gen + 1 azafrán · **Resistencia**: 8
- **Reglas**: Guardia.
- **Sabor**: «Los leones no vigilan la puerta. Son la puerta.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Una puerta monumental flanqueada por dos leones de piedra
  sentados, de tres metros, con melena tallada en volutas y la boca abierta.
  Muro de arenisca rosada con relieves. Paleta Samsara.*

#### `columna-del-edicto`
- **Tipo**: Estructura — Columna · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 azafrán · **Resistencia**: 5
- **Reglas**: Tus unidades a distancia infligen 1 de daño adicional.
- **Sabor**: «La ley se grabó en piedra para que nadie discutiera la redacción.»
- **Motor**: ya soportado (`ranged-attack-bonus`)
- **Prompt**: *Una columna de piedra pulida como un espejo, de siete metros,
  rematada por cuatro leones de espaldas, con una inscripción antigua grabada
  en el fuste. Llanura vacía alrededor, cielo enorme. Paleta Samsara.*

#### `montana-batida`
- **Tipo**: Estructura — Montaña · **Rareza**: Mítica · **Coste**: 2 gen + 2 azafrán · **Resistencia**: 7
- **Reglas**: Al final de tu turno, una unidad aliada gana +1 de Ataque y +1 de Vida permanentes.
- **Sabor**: «La usaron de batidor para sacarle néctar al mar. Sigue mareada.»
- **Motor**: ya soportado (mismo patrón que la Necrópolis de Duna)
- **Prompt**: *Una montaña usada como eje, con una serpiente colosal enroscada
  a ella tirando desde ambos lados, y el océano batiéndose en espuma alrededor.
  Vista amplia, mito cósmico en marcha. Paleta Samsara.*

---

## 5. Cómo se juega esta facción

Samsara pierde piezas a propósito. Sus unidades baratas con Renacer entran,
mueren, vuelven mayores y vuelven a entrar; cada muerte enciende Avatar para la
siguiente carta y hace robar a Indrayani. Es la única facción del juego cuyo
peor turno —perder tres unidades— es también su mejor turno.

Es la facción más **paciente**: no busca ganar en el turno 8, busca que en el
turno 15 sus criaturas sean el doble de grandes que las del rival.

Sus dos debilidades, deliberadas:

1. **Lenta de arranque.** Sus formas dormidas son modestas y su motor tarda dos
   o tres vueltas en girar. Contra Furia puede llegar tarde.
2. **Se ahoga si no muere nadie.** Frente a un rival que se limita a golpear el
   Nexo y no entra al combate, media facción no se activa nunca.

Mazo inicial sugerido (50 cartas): 20 Fuente de Samsara, 3 Peregrino del Ganges,
2 Guardián de la Puerta, 2 Tigresa de la Diosa, 2 Mono Saltarín,
2 Bailarina de los Cien Brazos, 2 Naga del Pozo, 1 Asceta de la Ceniza,
2 Arquero del Arco de Cuerno, 1 Vaca de la Abundancia, 1 Elefante de Guerra,
1 Garuda de Alas de Sol, 1 Rakshasa de la Noche, 1 Niño de la Flauta,
1 Avatar del Jabalí, 1 Danzante de la Destrucción, 2 Flecha de Brahma,
1 Rueda que Gira, 1 Bendición del Río, 1 Ofrenda de Fuego, 1 Monzón, 1 Karma,
1 Templo de la Rueda, 1 Pira del Ghat, 1 Estanque de Loto, 1 Montaña Batida.

---

## 6. Checklist de entrega

Nombres de archivo exactos para `tools/art-inbox/` (sin tildes ni ñ):

```
fuente-samsara              peregrino-del-ganges       guardian-de-la-puerta
tigresa-de-la-diosa         bailarina-de-los-cien-brazos  naga-del-pozo
asceta-de-la-ceniza         elefante-de-guerra         garuda-de-alas-de-sol
mono-saltarin               rakshasa-de-la-noche       arquero-del-arco-de-cuerno
vaca-de-la-abundancia       avatar-del-jabali          danzante-de-la-destruccion
nino-de-la-flauta           flecha-de-brahma           rueda-que-gira
bendicion-del-rio           maya-el-espejismo          ofrenda-de-fuego
veneno-de-la-serpiente      karma                      bendicion-de-los-mil-ojos
monzon                      templo-de-la-rueda         pira-del-ghat
estanque-de-loto            puerta-de-los-leones       columna-del-edicto
montana-batida              indrayani-la-rueda
```

Aviso de estilo para toda la facción: **exuberante pero sereno**. La India de
este dosier no es exótica ni misteriosa: es una civilización en marcha, con sus
templos recién encalados, sus flores frescas y sus dioses ocupados. Nada de
turbantes de aventura, nada de faquires, nada de misticismo de escaparate. La
referencia visual es la pintura de las escuelas rajput y pahari —color plano
intenso, contorno firme, composición ordenada— llevada a un acabado
tridimensional y luminoso.
