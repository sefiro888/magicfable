# Facción nueva · MAREA — «Los Hijos de la Resaca»

Dosier completo de la séptima facción: identidad, mecánica propia, comandante y
**31 cartas** con su prompt de arte. Mismo flujo que la segunda oleada: tú
generas las ilustraciones, yo doy de alta las cartas en el motor.

---

## 1. Por qué esta facción y no otra

Las seis actuales ya cubren fuego (Furia), hielo y negación (Arcano),
crecimiento (Naturaleza), defensa (Orden), drenaje (Sombra) y distorsión
(Vacío). Lo que **ningún** mazo hace hoy es **mover al rival**: el tablero es
de 8×8 y la posición decide cada combate, pero nadie juega con eso.

Marea es la facción del **control del espacio**. No mata rápido ni aguanta como
un muro: coloca a tus unidades donde quiere y arrastra a las enemigas fuera de
donde les conviene. Frente a Arcano, que congela y niega, Marea **reposiciona**:
la unidad rival sigue viva y activa, pero ya no está donde hacía daño.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (agua profunda) | `#12656f` |
| Luz mágica (espuma, bioluminiscencia) | `#7fe3d4`, `#d6fff6` |
| Sombra (fondo abisal) | `#04161c` |
| Acento (coral, nácar) | `#e88f6a`, `#f2e6d8` |

**Materiales**: coral vivo, nácar, hueso de ballena, vidrio marino pulido, redes
de algas, bronce comido por la sal. **Formas**: curvas, espirales, olas rotas,
todo en movimiento lateral. Nada de simetría rígida (eso es Orden) ni de
geometría fría (eso es Arcano).

---

## 2. La mecánica propia: el ciclo de marea

**En los turnos impares hay Bajamar; en los pares, Pleamar.** El ciclo cambia
solo, sin que nadie lo controle, y muchas cartas de Marea hacen una cosa u otra
según el momento:

- **Pleamar** (turnos pares): la facción golpea y cura. El agua está alta y todo
  fluye.
- **Bajamar** (turnos impares): la facción mueve, roba y coloca. El agua se
  retira y deja el fondo al descubierto.

Esto obliga a **planear un turno por delante**, que es exactamente la decisión
que le falta al juego hoy: no basta con jugar lo más caro que puedas pagar,
importa *cuándo* lo juegas.

> Nota técnica: el ciclo no necesita guardar nada nuevo, se deduce del número de
> turno que el motor ya lleva. Lo implemento yo como una condición nueva de
> efecto (`tide: 'high' | 'low'`).

### Arrastre y empuje

La segunda seña de identidad: mover unidades una o dos casillas. El motor ya
sabe empujar (lo hace el Leviatán Abismal del Vacío), así que la mayoría de
estas cartas funcionan con lo que existe.

---

## 3. El comandante

### `nerith-voz-de-la-resaca`
- **Nombre**: Nerith · **Título**: Voz de la Resaca · **Facción**: Marea
- **Vida del Nexo**: 35
- **Pasiva**: En Pleamar, la primera unidad que juegues cada turno entra con un escudo de 2.
- **Poder (una vez por partida, 2 genérico + 1 turquesa)**: «Resaca» — empuja 1 casilla hacia atrás a todas las unidades enemigas y cura 3 a tu Nexo.
- **Sabor**: «El mar no discute. Vuelve.»
- **Prompt de retrato**: *Retrato en tres cuartos de una figura de aspecto humano cubierta por una segunda piel de agua en movimiento constante, cabello largo suspendido como si flotara bajo el mar, ojos sin blanco de color turquesa luminoso, corona de coral vivo y nácar. Fondo: la línea de costa vista desde dentro de una ola a punto de romper. Sereno, imponente, nada monstruoso. Paleta Marea.*

---

## 4. Las 31 cartas

Cada ficha trae id (nombre de archivo), datos de juego y prompt. La columna
«motor» avisa de si hace falta código nuevo: **19 de 31 funcionan con lo que ya
existe**, 12 usan la condición de marea o el empuje ampliado, que es la extensión que estrena la
facción.

---

### 4.1 Fuente

#### `fuente-marea`
- **Nombre**: Fuente de Marea · **Tipo**: Esencia — Fuente · **Rareza**: Común
- **Coste**: 0 · **Reglas**: Agota esta fuente: genera 1 Esencia Turquesa.
- **Sabor**: «Cada pozo del arrecife recuerda dónde estuvo el mar.»
- **Motor**: ya soportado
- **Prompt**: *Un pozo natural de agua turquesa luminosa entre rocas de arrecife cubiertas de percebes y algas, con la luz filtrándose desde el fondo como si el agua misma brillara. Sin figuras, composición vertical centrada. Paleta Marea.*

---

### 4.2 Unidades (16)

#### `pez-linterna`
- **Tipo**: Unidad — Bestia · **Rareza**: Común · **Coste**: 0 gen + 1 turquesa
- **ATQ/VID**: 1/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: En Bajamar, al entrar en juego escruta 1.
- **Sabor**: «Alumbra el camino de cosas mucho peores.»
- **Motor**: nueva (condición de marea)
- **Prompt**: *Un pez abisal pequeño con un apéndice bioluminiscente turquesa sobre la cabeza, nadando entre corales oscuros que su luz revela. Fondo negro azulado, la única luz es la suya. Paleta Marea.*

#### `nadadora-de-arrecife`
- **Tipo**: Unidad — Humanoide · **Rareza**: Común · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Impulso.
- **Sabor**: «Llega antes que la ola que la empuja.»
- **Motor**: ya soportado
- **Prompt**: *Una nadadora de piel morena con branquias en el cuello y aletas membranosas en brazos y piernas, avanzando en horizontal a gran velocidad sobre un arrecife poco profundo, estela de burbujas. Luz solar filtrada desde arriba. Paleta Marea.*

#### `centinela-de-coral`
- **Tipo**: Unidad — Constructo · **Rareza**: Común · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 1/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «Creció durante siglos justo donde hacía falta.»
- **Motor**: ya soportado
- **Prompt**: *Un guardián humanoide formado enteramente por coral vivo y conchas fusionadas, brazos anchos como escudos, inmóvil en posición defensiva sobre la arena del fondo marino. Pequeños peces entrando y saliendo de sus huecos. Paleta Marea.*

#### `lanzarredes`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 2/3 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Cuando ataca, empuja 1 casilla hacia atrás a la unidad objetivo.
- **Sabor**: «No hace falta matarlo. Basta con que esté en otro sitio.»
- **Motor**: ya soportado (empuje)
- **Prompt**: *Un pescador de aspecto duro con una red de algas y anzuelos de hueso girando sobre su cabeza, listo para lanzarla, de pie sobre una roca batida por la espuma. Cielo tormentoso. Paleta Marea.*

#### `remora-oportunista`
- **Tipo**: Unidad — Bestia · **Rareza**: Común · **Coste**: 0 gen + 1 turquesa
- **ATQ/VID**: 2/1 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Golpe veloz.
- **Sabor**: «Come de lo que otros matan y nunca da las gracias.»
- **Motor**: ya soportado
- **Prompt**: *Una rémora grande y musculosa desprendiéndose del costado de una silueta enorme y borrosa al fondo, lanzándose hacia el frente con la boca abierta. Movimiento y burbujas. Paleta Marea.*

#### `crustaceo-acorazado`
- **Tipo**: Unidad — Bestia · **Rareza**: Común · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. No puede ser empujado.
- **Sabor**: «Se agarra al fondo y deja que el mar se canse primero.»
- **Motor**: nueva (inmunidad al empuje; el empuje ya existe, falta la excepción)
- **Prompt**: *Un crustáceo enorme de caparazón grueso cubierto de percebes y algas, con las pinzas cerradas y las patas clavadas en la roca mientras una corriente fuerte pasa a su alrededor sin moverlo. Vista lateral. Paleta Marea.*

#### `heraldo-de-la-corriente`
- **Tipo**: Unidad — Espíritu · **Rareza**: Infrecuente · **Coste**: 2 gen + 1 turquesa
- **ATQ/VID**: 3/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: En Pleamar, esta unidad tiene Vínculo vital.
- **Sabor**: «Anuncia lo que ya viene de camino.»
- **Motor**: nueva (condición de marea)
- **Prompt**: *Un espíritu con forma de corriente marina personificada: torso humanoide traslúcido cuyo cuerpo se deshace en remolinos de agua y espuma, portando una caracola enorme. Fondo de mar abierto al amanecer. Paleta Marea.*

#### `tejedora-de-algas`
- **Tipo**: Unidad — Hechicera · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 1/4 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Al entrar en juego, una unidad enemiga pierde 1 de Movimiento hasta el final del turno.
- **Sabor**: «Cada nudo es una decisión que el enemigo ya no puede tomar.»
- **Motor**: ya soportado (`slow-enemies-on-attack` como precedente)
- **Prompt**: *Una hechicera anciana sentada sobre roca, tejiendo con dedos largos una red de algas luminosas que flota en el aire como si estuviera sumergida. Túnica de tiras de alga seca. Paleta Marea.*

#### `nautilo-blindado`
- **Tipo**: Unidad — Bestia · **Rareza**: Infrecuente · **Coste**: 2 gen + 1 turquesa
- **ATQ/VID**: 2/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. La primera vez que recibe daño cada turno, lo reduce en 1.
- **Sabor**: «La espiral es la forma que el mar aprueba.»
- **Motor**: ya soportado (`first-damage-reduction`)
- **Prompt**: *Un nautilo colosal con la concha nacarada cubierta de placas de bronce marino, tentáculos gruesos asomando, avanzando lentamente por el fondo. Escala imponente frente a corales pequeños. Paleta Marea.*

#### `ahogado-rencoroso`
- **Tipo**: Unidad — No muerto · **Rareza**: Común · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: En Bajamar, entra en juego con Impulso.
- **Sabor**: «La marea baja siempre devuelve lo que se llevó.»
- **Motor**: nueva (condición de marea)
- **Prompt**: *Una figura ahogada de pie en la arena descubierta por la marea baja, ropa hecha jirones y algas colgando, agua escurriendo, rodeada de restos de naufragio. Inquietante, con dignidad triste; sin gore. Paleta Marea.*

#### `mensajera-de-espuma`
- **Tipo**: Unidad — Ave · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador. Cuando ataca, robas 1 carta si es Bajamar.
- **Sabor**: «Trae noticias que nadie pidió.»
- **Motor**: nueva (condición de marea)
- **Prompt**: *Un ave marina blanca y turquesa de alas largas rozando la superficie del agua con la punta de un ala, dejando una línea de espuma. Cielo bajo y plomizo. Paleta Marea.*

#### `arponera-de-la-fosa`
- **Tipo**: Unidad — Guerrera · **Rareza**: Rara · **Coste**: 2 gen + 1 turquesa
- **ATQ/VID**: 3/4 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Sus ataques a distancia infligen 1 de daño adicional.
- **Sabor**: «Aprendió a apuntar donde el agua deforma.»
- **Motor**: ya soportado (`ranged-attack-bonus`)
- **Prompt**: *Una guerrera con armadura de escamas y placas de hueso, apuntando un arpón largo de bronce hacia el frente, medio cuerpo fuera del agua en la boca de una fosa marina oscura. Paleta Marea.*

#### `coloso-de-marea`
- **Tipo**: Unidad — Gigante · **Rareza**: Rara · **Coste**: 3 gen + 2 turquesa
- **ATQ/VID**: 5/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Cuando ataca, empuja 1 casilla hacia atrás a las unidades enemigas adyacentes al objetivo.
- **Sabor**: «Camina despacio porque el mar lo acompaña.»
- **Motor**: ya soportado (`push-adjacent-enemies-on-attack`)
- **Prompt**: *Un gigante formado por agua contenida en una armadura hueca de coral y bronce, caminando por aguas poco profundas mientras el mar se levanta a su alrededor en olas concéntricas. Vista desde abajo. Paleta Marea.*

#### `guardiana-del-faro`
- **Tipo**: Unidad — Humanoide · **Rareza**: Rara · **Coste**: 2 gen + 1 turquesa
- **ATQ/VID**: 2/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Tus otras unidades adyacentes tienen +1 de Vida.
- **Sabor**: «Mientras la lámpara aguante, nadie se pierde.»
- **Motor**: ya soportado (`buff-allied-units-health`)
- **Prompt**: *Una mujer mayor con capote encerado sosteniendo una lámpara de aceite en lo alto de un faro azotado por la tormenta, la luz cortando la lluvia. Firme, los pies bien plantados. Paleta Marea con el ámbar cálido de la lámpara como único acento.*

#### `leviatan-de-las-simas`
- **Tipo**: Unidad — Bestia · **Rareza**: Mítica · **Coste**: 4 gen + 2 turquesa
- **ATQ/VID**: 7/7 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Al entrar en juego, empuja 2 casillas hacia atrás a todas las unidades enemigas. En Pleamar, además inflige 1 de daño a cada una.
- **Sabor**: «Sube una vez por generación, y nadie cuenta lo mismo.»
- **Motor**: nueva (condición de marea; el empuje masivo extiende el empuje existente)
- **Prompt**: *Una criatura abisal colosal emergiendo del agua, con el cuerpo cubierto de placas y luces bioluminiscentes en hilera, arrastrando una ola gigante que desplaza todo a su alrededor. Barcos diminutos para dar escala. Paleta Marea.*

#### `oraculo-de-las-mareas`
- **Tipo**: Unidad — Místico · **Rareza**: Mítica · **Coste**: 3 gen + 2 turquesa
- **ATQ/VID**: 4/6 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Al final de tu turno, escruta 1. En Pleamar, además cura 2 a tu Nexo.
- **Sabor**: «Leyó la próxima marea en la anterior.»
- **Motor**: nueva (condición de marea)
- **Prompt**: *Una figura andrógina de piel pálida y ojos completamente turquesa, sentada en posición de meditación dentro de un círculo de agua suspendida que gira en el aire, con reflejos de escenas futuras en la superficie. Paleta Marea.*

---

### 4.3 Hechizos (9)

#### `resaca-subita`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 0 gen + 1 turquesa
- **Reglas**: Empuja 2 casillas hacia atrás a una unidad enemiga.
- **Sabor**: «Un paso atrás en el momento justo vale más que una espada.»
- **Motor**: ya soportado (empuje)
- **Prompt**: *Una ola de resaca arrastrando hacia atrás todo lo que hay en la orilla —piedras, algas, espuma— vista desde el nivel del agua. Sin figuras. Movimiento violento pero limpio. Paleta Marea.*

#### `corriente-de-fondo`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **Reglas**: Una unidad aliada puede volver a moverse. Si es Bajamar, roba 1 carta.
- **Sabor**: «Por debajo, el mar va en otra dirección.»
- **Motor**: nueva (condición de marea; `refresh-move` ya existe)
- **Prompt**: *Vista submarina de una corriente de fondo visible como una franja de agua más clara que cruza la escena en diagonal, arrastrando arena y peces pequeños. Sin figuras. Paleta Marea.*

#### `abrazo-del-abismo`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **Reglas**: Inflige 3 de daño a una unidad enemiga. Si es Pleamar, cura 2 a tu Nexo.
- **Sabor**: «Abajo no hay luz que discuta.»
- **Motor**: nueva (condición de marea)
- **Prompt**: *Unos brazos hechos de agua oscura surgiendo del fondo para envolver una silueta que se hunde, con burbujas escapando hacia arriba. Dramático, elegante, sin violencia explícita. Paleta Marea.*

#### `marea-viva`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Rara · **Coste**: 2 gen + 1 turquesa
- **Reglas**: Inflige 2 de daño a todas las unidades enemigas y empújalas 1 casilla hacia atrás.
- **Sabor**: «La luna tira y el mar obedece.»
- **Motor**: nueva (combina daño masivo existente con empuje masivo)
- **Prompt**: *Una ola enorme rompiendo a lo ancho de toda la escena, con la cresta iluminada por dentro en turquesa, barriendo la playa. Vista frontal, escala imponente. Paleta Marea.*

#### `sal-en-la-herida`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Común · **Coste**: 0 gen + 1 turquesa
- **Reglas**: Una unidad enemiga dañada recibe 3 de daño.
- **Sabor**: «El mar limpia y escuece a la vez.»
- **Motor**: nueva (condición «objetivo dañado»)
- **Prompt**: *Cristales de sal marina formándose y creciendo en el aire alrededor de un punto luminoso, con la luz refractada en aristas afiladas. Abstracto, sin figuras. Paleta Marea.*

#### `canto-de-la-sirena`
- **Tipo**: Hechizo inmediato — Encantamiento · **Rareza**: Rara · **Coste**: 1 gen + 1 turquesa
- **Reglas**: Mueve una unidad enemiga 2 casillas en la dirección que elijas.
- **Sabor**: «No la obligó. Solo le dijo dónde estaba más bonito.»
- **Motor**: nueva (movimiento dirigido de una unidad rival)
- **Prompt**: *Ondas de sonido visibles como anillos concéntricos de luz turquesa expandiéndose sobre la superficie del agua desde un punto, con peces girando para seguirlas. Sin figura visible. Paleta Marea.*

#### `naufragio`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Rara · **Coste**: 2 gen + 1 turquesa
- **Reglas**: Destruye una estructura enemiga. Roba 1 carta.
- **Sabor**: «Todo lo que se construye junto al mar es un préstamo.»
- **Motor**: ya soportado
- **Prompt**: *El casco de un barco partiéndose contra rocas en plena tormenta nocturna, con el mástil cayendo y espuma iluminada por un relámpago frío. Sin figuras. Paleta Marea.*

#### `bendicion-de-la-luna`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa
- **Reglas**: Cura 5 de Vida a tu Nexo. Si es Pleamar, cura 8.
- **Sabor**: «Manda la luna; el mar solo firma.»
- **Motor**: nueva (condición de marea)
- **Prompt**: *La luna llena reflejada en un mar completamente en calma, con el reflejo formando un camino de luz que llega hasta el primer plano. Serenidad total, sin figuras. Paleta Marea con blancos nacarados.*

#### `voragine`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Mítica · **Coste**: 3 gen + 2 turquesa
- **Reglas**: Empuja 2 casillas hacia tu Nexo a todas las unidades enemigas y aturde a las que no puedan retroceder.
- **Sabor**: «El agujero que el mar hace cuando decide tragar.»
- **Motor**: nueva (empuje masivo dirigido + estado `stunned` existente)
- **Prompt**: *Un remolino gigantesco visto desde arriba, con el agua girando en espiral hacia un centro negro y restos arrastrados en los bordes. Escala oceánica. Paleta Marea.*

---

### 4.4 Estructuras (5)

#### `arrecife-vivo`
- **Tipo**: Estructura — Arrecife · **Rareza**: Común · **Coste**: 1 gen + 1 turquesa · **Resistencia**: 5
- **Reglas**: Guardia. Tus unidades adyacentes tienen +1 de Vida.
- **Sabor**: «Un edificio que crece mientras te defiende.»
- **Motor**: ya soportado
- **Prompt**: *Una barrera de coral viva y densa, de colores turquesa y ámbar, cubierta de anémonas y peces pequeños, formando un muro natural. Sin figuras. Paleta Marea.*

#### `pozo-de-sal`
- **Tipo**: Estructura — Pozo · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 turquesa · **Resistencia**: 4
- **Reglas**: Al final de tu turno, escruta 1.
- **Sabor**: «El agua se va, la sal se queda, la verdad también.»
- **Motor**: ya soportado
- **Prompt**: *Un pozo circular de salinas con costras blancas de sal en los bordes y agua turquesa inmóvil en el centro, al atardecer. Geometría natural, sin figuras. Paleta Marea.*

#### `faro-de-hueso`
- **Tipo**: Estructura — Faro · **Rareza**: Rara · **Coste**: 2 gen + 1 turquesa · **Resistencia**: 6
- **Reglas**: Tus unidades a distancia infligen 1 de daño adicional.
- **Sabor**: «Lo levantaron con lo que el mar dejó de una ballena.»
- **Motor**: ya soportado (`ranged-attack-bonus` como pasiva de estructura)
- **Prompt**: *Un faro construido con costillas gigantes de ballena y vértebras apiladas, coronado por una llama turquesa, sobre un islote rocoso. Silueta inquietante contra un cielo nublado. Paleta Marea.*

#### `dique-de-nacar`
- **Tipo**: Estructura — Dique · **Rareza**: Rara · **Coste**: 2 gen + 1 turquesa · **Resistencia**: 8
- **Reglas**: Guardia. En Pleamar, al final de tu turno cura 2 a tu Nexo.
- **Sabor**: «Contiene el mar por acuerdo, no por fuerza.»
- **Motor**: nueva (condición de marea)
- **Prompt**: *Un dique curvo de piedra recubierta de nácar iridiscente que refleja la luz en tornasoles, con el mar golpeando el otro lado y saltando espuma por encima. Sin figuras. Paleta Marea.*

#### `altar-de-la-resaca`
- **Tipo**: Estructura — Altar · **Rareza**: Mítica · **Coste**: 2 gen + 2 turquesa · **Resistencia**: 6
- **Reglas**: Al final de tu turno, empuja 1 casilla hacia atrás a la unidad enemiga más cercana a tu Nexo.
- **Sabor**: «Se le ofrece lo que ya se había llevado.»
- **Motor**: nueva (empuje dirigido desde una estructura)
- **Prompt**: *Un altar de piedra negra medio sumergido, cubierto de conchas y ofrendas, con el agua retirándose de él en todas direcciones como si lo evitara. Luz turquesa emanando de las juntas. Paleta Marea.*

---

## 5. Cómo se juega esta facción

Marea gana **decidiendo dónde ocurre cada combate**. La curva es baja (muchas
cartas de coste 1-2), pero no busca rematar rápido: empuja a las unidades
rivales fuera de rango, coloca guardias donde molestan y aprovecha la Pleamar
para curar y castigar a la vez.

Sus dos debilidades a propósito, para que no sea la mejor sin más:

1. **Daño bruto bajo**: solo el Leviatán y el Coloso pegan fuerte. Contra Orden,
   que aguanta, le cuesta cerrar la partida.
2. **Depende del ciclo**: la mitad de sus cartas rinden a medias en el turno
   equivocado. Un rival que fuerce cambios rápidos la descoloca.

Mazo inicial sugerido (50 cartas): 20 Fuente de Marea, 3 Nadadora de Arrecife,
3 Lanzarredes, 3 Ahogado Rencoroso, 2 Centinela de Coral, 2 Nautilo Blindado,
2 Arponera de la Fosa, 2 Heraldo de la Corriente, 2 Mensajera de Espuma,
1 Coloso de Marea, 1 Leviatán de las Simas, 1 Oráculo de las Mareas,
3 Resaca Súbita, 2 Abrazo del Abismo, 2 Corriente de Fondo, 1 Marea Viva,
1 Vorágine, 2 Arrecife Vivo, 1 Faro de Hueso, 1 Dique de Nácar,
1 Altar de la Resaca, 1 Bendición de la Luna, 1 Naufragio, 1 Canto de la Sirena,
1 Sal en la Herida.

---

## 6. Checklist de entrega

Nombres de archivo exactos para `tools/art-inbox/` (sin acentos ni ñ salvo
donde se indica):

```
fuente-marea               pez-linterna              nadadora-de-arrecife
centinela-de-coral         lanzarredes               remora-oportunista
crustaceo-acorazado
heraldo-de-la-corriente    tejedora-de-algas         nautilo-blindado
ahogado-rencoroso          mensajera-de-espuma       arponera-de-la-fosa
coloso-de-marea            guardiana-del-faro        leviatan-de-las-simas
oraculo-de-las-mareas      resaca-subita             corriente-de-fondo
abrazo-del-abismo          marea-viva                sal-en-la-herida
canto-de-la-sirena         naufragio                 bendicion-de-la-luna
voragine                   arrecife-vivo             pozo-de-sal
faro-de-hueso              dique-de-nacar            altar-de-la-resaca
nerith-voz-de-la-resaca
```

Fíjate en que `voragine` va **sin tilde** en el nombre de archivo aunque la
carta se llame «Vorágine»: los ids del juego no llevan acentos.

Cuando tengas un lote, pásalo por `python tools/import_art.py` y avísame. Yo doy
de alta la facción entera en el motor —incluida la mecánica de marea— y la
equilibro con el simulador antes de que sea jugable.
