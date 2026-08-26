# Facción nueva · BESTIARIO — «Las bestias que ningún pueblo pudo domesticar»

Dosier completo de la facción de criaturas legendarias: no pertenece a un solo
pueblo ni a una sola mitología, sino a todas las que alguna vez temieron a
algo demasiado grande para explicarlo. Identidad, comandante y **31 cartas**
con su prompt de arte. **Sin mecánica propia a propósito** — ver sección 2.

---

## 1. Por qué esta facción y en qué se diferencia

Todas las facciones hasta ahora vienen de un pueblo concreto con su propia
cosmología. Bestiario rompe ese patrón aposta: es la colección de grandes
bestias que distintas culturas describieron por separado —el kraken
escandinavo, el cancerbero griego, el simurgh persa, el roc árabe, el
bakunawa filipino— tratadas como especies de un mismo mundo salvaje, no como
símbolos religiosos de nadie.

- **No es Olimpo con más monstruos.** Olimpo castiga la desmesura de HÉROES
  que se exceden. Bestiario no se excede ni se contiene: simplemente es
  grande desde el principio.
- **No es Fimbul con colmillos.** Fimbul necesita que le hayan pegado para
  rendir. Bestiario no necesita ninguna condición: pega fuerte porque sí.

Ninguna facción del juego apuesta hoy TODO a plantar el cuerpo más grande de
la mesa sin ningún truco alrededor. Ese es el hueco.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (escama verde oscuro casi negro) | `#1c2e22` |
| Luz (vitela envejecida, hueso) | `#e8dcc0` |
| Sombra (negro de foso, sin fondo) | `#0b0f0c` |
| Acento (carmesí de sangre vieja, ámbar de cuerno) | `#9c1f2e`, `#c9932e` |

**Materiales**: escama, cuerno, garra, vitela envejecida, pan de oro de
manuscrito iluminado, tinta y hueso. **Formas**: bestias enroscadas, orlas de
bestiario medieval iluminado, zarpazos, escamas superpuestas, capitulares
decoradas. **Tono**: como si las ilustraciones de un bestiario medieval
iluminado —pan de oro, vitela, orla de página— hubieran cobrado vida y
volumen real. Nada de dragones de videojuego genéricos: cada bestia se
dibuja con el detalle de un naturalista que la vio una sola vez y no volvió a
acercarse tanto.

---

## 2. Sin mecánica propia — la decisión de diseño

Bestiario **no añade ningún contador, condición ni efecto nuevo al motor**.
Todo lo que hace ya existe en el juego: Guardia, Impulso, Golpe veloz,
Volador, Perforar, Vínculo vital y Aturdir, más los efectos genéricos de
siempre (daño, curación, robo, congelar, escudo). Es la facción de "el
cuerpo más grande y directo de la mesa", sin capa de reglas propia encima.

Esto es intencional, no una carencia:

- Se integra en una fracción del tiempo que cualquier otra facción nueva,
  porque no hay que programar nada.
- Es la mejor puerta de entrada para quien no quiera aprender un sistema
  nuevo: sus cartas se explican solas.
- A cambio, no tiene la "genialidad" de una mecánica propia — su identidad
  está en las estadísticas (las más altas del juego, coste por coste) y en
  las combinaciones de palabras clave ya existentes, no en un truco inédito.

> Nota técnica: al no introducir ningún `CardEffect` ni passive nuevos, cada
> carta de este dosier debe poder escribirse solo con lo que ya soporta
> `src/game/engine.ts`. La columna «motor» de cada ficha lo confirma carta a
> carta.

---

## 3. El comandante

### `vaelith-la-guardabestias`

- **Nombre**: Vaelith · **Título**: La Guardabestias
- **Facción**: Bestiario · **Vida del Nexo**: 35
- **Pasiva**: Mientras controles una unidad con Guardia, tus unidades entran
  en juego con +1 de Vida.
- **Poder (una vez por partida, 2 genérico + 1 garra)**: «Instinto de Caza» —
  inflige 6 de daño a la unidad enemiga con más Ataque y cura 6 a tu Nexo.
- **Sabor**: «No las domó. Aprendió a pedir permiso.»
- **Prompt de retrato**: *Retrato en tres cuartos de una cazadora curtida de
  mediana edad, ropa de cuero remendado y pieles superpuestas de varios
  animales distintos (no a juego, trofeos reales), con cicatrices de garra
  en un antebrazo y un cuerno grabado colgado al cuello. Sostiene una cadena
  suelta, no tensa, como si el animal la siguiera por decisión propia y no
  por la cadena. Fondo: linde de un bosque muy antiguo, niebla baja, ojos
  brillando entre los árboles fuera de foco. Serena, sin arrogancia. Paleta
  Bestiario.*

---

## 4. Las 31 cartas

Cada ficha trae: **id** (nombre de archivo), datos de juego y el prompt de
arte. La columna «motor» confirma que no hace falta nada nuevo.

---

### 4.1 Fuente

#### `fuente-bestiario`
- **Tipo**: Esencia — Fuente · **Rareza**: Común · **Coste**: 0
- **Reglas**: Agota esta fuente: genera 1 de Esencia de Garra.
- **Sabor**: «No se cultiva. Se encuentra, o te encuentra ella a ti.»
- **Motor**: ya soportado
- **Prompt**: *Una garra fosilizada enorme montada sobre un pedestal de
  madera oscura en el rincón de un estudio de naturalista, con vitelas
  enrolladas y tinteros alrededor. Luz de vela. Sin figuras. Paleta
  Bestiario.*

---

### 4.2 Unidades (15)

#### `chupacabras`
- **Tipo**: Unidad — Horror · **Rareza**: Común · **Coste**: 0 gen + 1 garra
- **ATQ/VID**: 2/1 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Impulso.
- **Sabor**: «Los rebaños lo notan antes que los perros.»
- **Motor**: ya soportado (`impulse`)
- **Prompt**: *Una criatura escuálida de piel grisácea sin pelo, espinas
  cortas a lo largo del lomo y ojos rojos grandes, agazapada sobre una valla
  de madera de noche cerrada. Rápida, nerviosa. Paleta Bestiario.*

#### `yeti-de-la-cumbre`
- **Tipo**: Unidad — Bestia · **Rareza**: Común · **Coste**: 1 gen + 1 garra
- **ATQ/VID**: 2/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «Las huellas siempre van hacia arriba. Nunca hacia abajo.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Un homínido enorme de pelaje blanco apelmazado por el hielo,
  de pie en un paso de montaña bloqueando el camino entre dos paredes de
  roca, ventisca alrededor. Paleta Bestiario.*

#### `viborno-alado`
- **Tipo**: Unidad — Dragón · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 garra
- **ATQ/VID**: 3/3 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador.
- **Sabor**: «No escupe fuego. No le hace falta.»
- **Motor**: ya soportado (`flying`)
- **Prompt**: *Un wyvern esbelto de escamas verde botella y membranas
  correosas en las alas, aterrizando entre las ruinas de una torre de
  vigilancia, cola con aguijón enroscada. Paleta Bestiario.*

#### `manticora-del-desfiladero`
- **Tipo**: Unidad — Horror · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 garra
- **ATQ/VID**: 3/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Aturdir.
- **Sabor**: «Cara casi humana. Es lo primero que dejas de notar.»
- **Motor**: ya soportado (`stun`)
- **Prompt**: *Una criatura con cuerpo de león rojizo, rostro casi humano de
  sonrisa fija y cola de escorpión erguida sobre el lomo, en la boca de un
  desfiladero rocoso. Inquietante, no cómica. Paleta Bestiario.*

#### `esfinge-del-umbral`
- **Tipo**: Unidad — Horror · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 garra
- **ATQ/VID**: 2/5 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «Hace una sola pregunta. La segunda ya no la respondes tú.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Una esfinge de cuerpo de león y torso humano tallado en
  piedra arenisca pero con ojos vivos, tumbada ante la entrada estrecha de un
  templo semienterrado en arena. Paleta Bestiario.*

#### `cancerbero`
- **Tipo**: Unidad — Bestia · **Rareza**: Rara · **Coste**: 1 gen + 2 garra
- **ATQ/VID**: 4/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «Tres cabezas, un solo trabajo: que nadie vuelva a salir.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Un perro colosal de tres cabezas y crines de serpiente
  moviéndose entre ellas, encadenado a una puerta de bronce ennegrecida
  entre vapor y roca oscura. Paleta Bestiario.*

#### `anzu-tormenta`
- **Tipo**: Unidad — Ave · **Rareza**: Rara · **Coste**: 1 gen + 2 garra
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador.
- **Sabor**: «Robó las Tablas del Destino. Las devolvió tarde y de mala gana.»
- **Motor**: ya soportado (`flying`)
- **Prompt**: *Un ave colosal de cabeza leonina y plumaje tormentoso gris
  azulado, planeando entre nubes bajas cargadas de rayos, garras extendidas.
  Paleta Bestiario.*

#### `roc-de-las-cumbres`
- **Tipo**: Unidad — Ave · **Rareza**: Rara · **Coste**: 2 gen + 1 garra
- **ATQ/VID**: 5/5 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador.
- **Sabor**: «Se lleva elefantes a los polluelos. No exagera nadie al contarlo.»
- **Motor**: ya soportado (`flying`)
- **Prompt**: *Un ave rapaz de tamaño imposible descendiendo sobre una
  cordillera nevada, sombra cubriendo un valle entero, plumaje pardo y
  dorado. Paleta Bestiario.*

#### `simurgh-de-plumas-de-cobre`
- **Tipo**: Unidad — Celestial · **Rareza**: Rara · **Coste**: 1 gen + 2 garra
- **ATQ/VID**: 3/5 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador. Vínculo vital.
- **Sabor**: «Llorar le cuesta una pluma. Sigue teniendo de sobra.»
- **Motor**: ya soportado (`flying` + `lifelink`)
- **Prompt**: *Un ave majestuosa con plumaje de cobre y cola larga en
  llamaradas de color, posada en la rama de un árbol solitario en mitad de un
  desierto de sal, mirada antigua. Paleta Bestiario.*

#### `leon-de-piel-de-hierro`
- **Tipo**: Unidad — Bestia · **Rareza**: Rara · **Coste**: 2 gen + 1 garra
- **ATQ/VID**: 5/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Golpe veloz.
- **Sabor**: «Ninguna hoja le ha encontrado nunca el sitio blando.»
- **Motor**: ya soportado (`swift-strike`)
- **Prompt**: *Un león de melena oscura y pelaje con un brillo metálico
  apagado, saltando desde una roca sobre un valle seco, garras por delante.
  Paleta Bestiario.*

#### `tarasca-del-rio`
- **Tipo**: Unidad — Bestia · **Rareza**: Rara · **Coste**: 2 gen + 2 garra
- **ATQ/VID**: 5/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Perforar.
- **Sabor**: «Seis patas de oso, caparazón de tortuga y cola de escorpión. Nadie se pone de acuerdo en el resto.»
- **Motor**: ya soportado (`guard` + `pierce`)
- **Prompt**: *Una bestia colosal con caparazón de placas óseas
  superpuestas, seis patas cortas y gruesas, y una cola larga terminada en
  aguijón, saliendo del agua turbia de un río ancho. Paleta Bestiario.*

#### `bakunawa`
- **Tipo**: Unidad — Dragón · **Rareza**: Mítica · **Coste**: 2 gen + 2 garra
- **ATQ/VID**: 6/5 · **Alcance** 2 · **Movimiento** 2
- **Reglas**: Volador. Perforar.
- **Sabor**: «Se come la luna despacio. Siempre la devuelve, siempre tarde.»
- **Motor**: ya soportado (`flying` + `pierce`)
- **Prompt**: *Una serpiente marina descomunal con alas membranosas cortas y
  fauces desencajadas, enroscándose en torno a una luna llena baja sobre el
  horizonte del mar. Escamas negro azulado. Paleta Bestiario.*

#### `aspidoquelone`
- **Tipo**: Unidad — Bestia · **Rareza**: Mítica · **Coste**: 2 gen + 2 garra
- **ATQ/VID**: 3/8 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «Los marineros la confunden con una isla. Solo se equivocan una vez.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *El lomo colosal de una tortuga marina cubierto de tierra,
  árboles pequeños y hasta una choza de pescadores olvidada, apenas
  emergiendo del mar en calma. Vista muy amplia. Paleta Bestiario.*

#### `kraken-del-abismo`
- **Tipo**: Unidad — Horror · **Rareza**: Mítica · **Coste**: 3 gen + 2 garra
- **ATQ/VID**: 8/7 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Perforar.
- **Sabor**: «No hunde barcos. Los toma prestados un momento y se olvida de devolverlos.»
- **Motor**: ya soportado (`pierce`)
- **Prompt**: *Tentáculos colosales rompiendo la superficie del mar
  alrededor de un barco a punto de zozobrar, ventosas del tamaño de ruedas de
  carro, tormenta encima. Sin ver el cuerpo entero. Paleta Bestiario.*

#### `behemot`
- **Tipo**: Unidad — Gigante · **Rareza**: Mítica · **Coste**: 4 gen + 2 garra
- **ATQ/VID**: 8/9 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Perforar.
- **Sabor**: «Come el heno de mil colinas y ninguna se nota más vacía.»
- **Motor**: ya soportado (`pierce`)
- **Prompt**: *Una bestia cuadrúpeda colosal de piel gruesa como corteza de
  árbol y cuernos cortos, pastando en un valle que queda diminuto a su
  alrededor, vista desde muy abajo. Paleta Bestiario.*

---

### 4.3 Hechizos (9)

#### `aliento-feroz`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 garra
- **Reglas**: Inflige 4 de daño a una unidad enemiga.
- **Sabor**: «No hace falta que sea fuego. Con el aliento basta.»
- **Motor**: ya soportado (`damage`)
- **Prompt**: *Una bocanada visible de vapor y escarcha saliendo de unas
  fauces fuera de encuadre, deshaciendo la escarcha de un árbol cercano.
  Paleta Bestiario.*

#### `coraza-de-escamas`
- **Tipo**: Hechizo inmediato — Encantamiento · **Rareza**: Común · **Coste**: 1 gen + 1 garra
- **Reglas**: Una unidad aliada gana un escudo de 3.
- **Sabor**: «Se muda una vez al año. El resto del tiempo, aguanta.»
- **Motor**: ya soportado (escudo con objetivo)
- **Prompt**: *Una escama desprendida del tamaño de un escudo, de un verde
  casi negro con reflejos, apoyada contra un tronco en el suelo del bosque.
  Paleta Bestiario.*

#### `presa-debilitada`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 2 gen + 1 garra
- **Reglas**: Destruye una unidad enemiga con 5 o menos de Vida.
- **Sabor**: «No hace falta ser el más rápido. Solo hace falta esperar.»
- **Motor**: ya soportado (destrucción condicionada, mismo patrón que Hilo de las Moiras)
- **Prompt**: *Un rastro de huellas grandes convergiendo hacia un punto
  fuera de encuadre en la nieve, con una sola gota de sangre vieja al final
  del rastro visible. Paleta Bestiario.*

#### `instinto-de-manada`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 garra
- **Reglas**: Una unidad aliada puede volver a moverse y gana +2 de Ataque hasta el final del turno.
- **Sabor**: «Una se mueve. Las demás ya sabían que iba a hacerlo.»
- **Motor**: ya soportado (refrescar movimiento + bono temporal)
- **Prompt**: *Un grupo de sombras alargadas de animales moviéndose juntas
  al mismo tiempo por una llanura al anochecer, sin que se distinga la
  especie. Paleta Bestiario.*

#### `aullido-que-paraliza`
- **Tipo**: Hechizo inmediato — Encantamiento · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 garra
- **Reglas**: Aturde a una unidad enemiga.
- **Sabor**: «No es el volumen. Es reconocer lo que significa.»
- **Motor**: ya soportado (`stun`)
- **Prompt**: *Ondas de sonido invisibles sugeridas por hojas y polvo
  temblando en el aire alrededor de una figura fuera de encuadre, en un
  claro de noche. Paleta Bestiario.*

#### `estampida`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Rara · **Coste**: 2 gen + 1 garra
- **Reglas**: Inflige 2 de daño a todas las unidades enemigas y les resta 1 de Movimiento este turno.
- **Sabor**: «No decide adónde va. Decide que nada se quede quieto.»
- **Motor**: ya soportado (`damage-all-enemies` + ralentización)
- **Prompt**: *Una llanura entera de hierba aplastada y polvo levantado tras
  el paso de algo enorme, sin que se vea el final de la manada en ninguna
  dirección. Paleta Bestiario.*

#### `presagio-salvaje`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 garra
- **Reglas**: Escruta 3 y robas 1 carta.
- **Motor**: ya soportado (`scry` + `draw`)
- **Sabor**: «Los pájaros se callan antes. Siempre antes.»
- **Prompt**: *Una bandada entera despegando de golpe de un bosque en
  completo silencio, vista desde abajo contra un cielo gris plomo. Paleta
  Bestiario.*

#### `sangre-antigua`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Común · **Coste**: 1 gen + 1 garra
- **Reglas**: Cura 8 de Vida a tu Nexo.
- **Sabor**: «Más vieja que cualquier pueblo que la haya usado.»
- **Motor**: ya soportado (`heal-nexus`)
- **Prompt**: *Un cuerno de bestia enorme usado como recipiente, tallado por
  fuera y lleno de un líquido oscuro reflectante, sobre una piedra plana en
  un claro. Paleta Bestiario.*

#### `terror-ancestral`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Mítica · **Coste**: 2 gen + 2 garra
- **Reglas**: Congela a todas las unidades enemigas 1 turno.
- **Sabor**: «No hace falta que lo veas. Con saber que está ahí, basta.»
- **Motor**: ya soportado (congelación masiva, mismo patrón que Eclipse del Dragón)
- **Prompt**: *Un bosque entero completamente inmóvil, sin viento, sin
  pájaros, con la luz filtrándose rara entre los árboles como si algo
  enorme acabara de pasar. Sin figuras. Paleta Bestiario.*

---

### 4.4 Estructuras (6)

#### `guarida-profunda`
- **Tipo**: Estructura — Guarida · **Rareza**: Rara · **Coste**: 2 gen + 1 garra · **Resistencia**: 8
- **Reglas**: Guardia.
- **Sabor**: «La entrada es estrecha a propósito. Lo de dentro no lo es.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *La boca de una cueva enorme entre raíces expuestas y huesos
  viejos esparcidos en la entrada, oscuridad total más allá de los primeros
  metros. Paleta Bestiario.*

#### `osario-de-huesos`
- **Tipo**: Estructura — Osario · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 garra · **Resistencia**: 4
- **Reglas**: Al final de tu turno, cura 2 a tu Nexo.
- **Sabor**: «Cada hueso es de una especie distinta. Ninguna se repite dos veces.»
- **Motor**: ya soportado (mantenimiento de curación)
- **Prompt**: *Una pila ordenada de huesos y cráneos de tamaños y formas muy
  distintas apilada contra la pared de un risco, musgo creciendo entre los
  más viejos. Paleta Bestiario.*

#### `nido-en-lo-alto`
- **Tipo**: Estructura — Nido · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 garra · **Resistencia**: 5
- **Reglas**: Tus unidades a distancia infligen 1 de daño adicional.
- **Sabor**: «Se ve todo desde ahí arriba. Por eso nunca lo abandonan.»
- **Motor**: ya soportado (`ranged-attack-bonus`)
- **Prompt**: *Un nido descomunal hecho de ramas enteras de árbol
  encajadas en la cornisa de un acantilado altísimo, plumas gigantes
  sueltas alrededor. Paleta Bestiario.*

#### `fosa-de-alimentacion`
- **Tipo**: Estructura — Fosa · **Rareza**: Común · **Coste**: 1 gen + 1 garra · **Resistencia**: 5
- **Reglas**: Al final de tu turno, si tienes pocas cartas en la mano, robas 1.
- **Sabor**: «Lo que sobra no se tira. Se guarda para cuando haga falta.»
- **Motor**: ya soportado (mismo patrón que la Biblioteca Sumergida)
- **Prompt**: *Una fosa amplia excavada en tierra dura con restos
  ordenados a un lado y huellas de garra profundas en el barro seco
  alrededor. Paleta Bestiario.*

#### `cueva-de-cria`
- **Tipo**: Estructura — Cueva · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 garra · **Resistencia**: 4
- **Reglas**: Al final de tu turno, una unidad aliada gana un escudo de 2.
- **Sabor**: «Nadie se acerca. Ni siquiera quien la vigila desde fuera.»
- **Motor**: ya soportado (mantenimiento de escudo)
- **Prompt**: *Una cueva baja con varios huevos enormes de cáscara veteada
  agrupados sobre un lecho de hojas secas, vapor de calor saliendo entre
  ellos. Paleta Bestiario.*

#### `osamenta-ancestral`
- **Tipo**: Estructura — Monumento · **Rareza**: Mítica · **Coste**: 2 gen + 2 garra · **Resistencia**: 7
- **Reglas**: Al final de tu turno, una unidad aliada gana +1 de Ataque y +1 de Vida permanentes.
- **Sabor**: «El esqueleto entero, expuesto entero, para que nadie olvide el tamaño real.»
- **Motor**: ya soportado (mismo patrón que la Necrópolis de Duna)
- **Prompt**: *El esqueleto fosilizado completo de una bestia colosal
  desconocida, expuesto al aire libre entre columnas de piedra levantadas a
  su alrededor como un santuario, escala imposible. Paleta Bestiario.*

---

## 5. Cómo se juega esta facción

Bestiario no tiene plan B ni combo escondido: despliega el cuerpo más grande
que le quepa en el turno y lo lleva al choque. Es la más fácil de leer desde
el otro lado de la mesa —no hay contador que vigilar ni condición oculta— y
también la más difícil de frenar una vez que el cuerpo grande llega, porque
sus estadísticas están por encima de lo normal en su coste.

Sus dos debilidades, deliberadas:

1. **Sin red de seguridad.** No tiene ningún mecanismo propio de remontada:
   si se queda sin sus cuerpos grandes, no le queda ningún truco alternativo
   al que recurrir.
2. **Previsible.** Un rival que ya sabe que no hay sorpresa mecánica puede
   jugar exactamente contra lo que ve en la mesa, sin reservarse nada para un
   efecto oculto.

Mazo inicial sugerido (50 cartas): 20 Fuente de Bestiario, 3 Chupacabras,
2 Yeti de la Cumbre, 2 Viborno Alado, 2 Mantícora del Desfiladero,
2 Esfinge del Umbral, 1 Cancerbero, 1 Anzu Tormenta, 1 Roc de las Cumbres,
1 Simurgh de Plumas de Cobre, 1 León de Piel de Hierro, 1 Tarasca del Río,
1 Bakunawa, 1 Aspidoquelone, 1 Kraken del Abismo, 1 Behemot,
2 Aliento Feroz, 1 Coraza de Escamas, 1 Presa Debilitada,
1 Instinto de Manada, 1 Estampida, 1 Sangre Antigua, 1 Guarida Profunda,
1 Osario de Huesos, 1 Fosa de Alimentación.

---

## 6. Checklist de entrega

Nombres de archivo exactos para `tools/art-inbox/` (sin tildes ni ñ):

```
fuente-bestiario            chupacabras                yeti-de-la-cumbre
viborno-alado                manticora-del-desfiladero  esfinge-del-umbral
cancerbero                   anzu-tormenta               roc-de-las-cumbres
simurgh-de-plumas-de-cobre   leon-de-piel-de-hierro      tarasca-del-rio
bakunawa                     aspidoquelone               kraken-del-abismo
behemot                      aliento-feroz               coraza-de-escamas
presa-debilitada             instinto-de-manada          aullido-que-paraliza
estampida                    presagio-salvaje            sangre-antigua
terror-ancestral             guarida-profunda            osario-de-huesos
nido-en-lo-alto              fosa-de-alimentacion        cueva-de-cria
osamenta-ancestral           vaelith-la-guardabestias
```

Aviso de estilo para toda la facción: **bestiario iluminado, no póster de
fantasía genérica**. La referencia es la página de un manuscrito medieval de
bestiario —vitela envejecida, pan de oro en los bordes, capitulares
decoradas— pero con la propia bestia pintada con volumen y detalle reales,
como si el ilustrador la hubiera visto de verdad y no se hubiera fiado del
todo de la distancia de seguridad. Nada de escamas brillantes de videojuego
ni de dragones con pose heroica: son animales peligrosos, no mascotas.
