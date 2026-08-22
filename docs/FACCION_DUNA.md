# Facción nueva · DUNA — «El Tribunal de Arena»

Dosier completo de la décima facción: Egipto, desierto y mitología funeraria.
Identidad, mecánica propia, comandante y **31 cartas** con su prompt de arte.

---

## 1. Por qué esta facción y en qué se diferencia

Egipto tiene dos trampas evidentes y las dos se esquivan a propósito:

- **No es Sombra con vendas.** Sombra es lamento, veneno y cementerio: gana
  robando vida. Duna **no llora a sus muertos, los administra**: sus difuntos
  son funcionarios, jueces y guardianes con un puesto que cumplir.
- **No es Orden con oro.** Orden es simetría celestial, escudos y muros. Duna
  es **contabilidad divina**: paga por adelantado —vida, cartas, tiempo— y cobra
  después con intereses. Donde Orden protege, Duna *invierte*.

Nadie en el juego tiene hoy cartas que te obliguen a decidir «pierdo algo ahora
para ganar más luego». Ese es el hueco.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (arenisca, duna al sol) | `#c9a86a` |
| Luz (oro ceremonial, sol vertical) | `#ffd76a`, `#fff4c9` |
| Sombra (interior de tumba, basalto) | `#1a1408` |
| Acento (lapislázuli, turquesa ritual) | `#2f5fa8`, `#3fbfae` |

**Materiales**: arenisca tallada, oro batido, lapislázuli, lino, basalto negro,
alabastro traslúcido, papiro. **Formas**: geometría maciza, perfiles de frente,
jeroglíficos, alas desplegadas, discos solares. **Tono**: solemne y luminoso,
con calor que aplasta. Nada de aventureros ni de saqueadores: esto se cuenta
**desde dentro**, como si el imperio siguiera en pie.

---

## 2. Las mecánicas propias

### Ofrenda

> **Ofrenda N** — Al jugar esta carta puedes pagar N de Vida de tu Nexo. Si lo
> haces, obtienes el efecto mejorado.

Es la mecánica insignia: **decisiones de verdad, no rampas automáticas**. Tu
Vida deja de ser solo el marcador de derrota y pasa a ser un recurso. Contra un
rival lento puedes permitirte ofrendar; contra Furia, cada punto que entregas
puede ser el que te mate.

### El Juicio

> **Juicio** — Al final de tu turno, si tu Nexo tiene MENOS Vida que el del
> rival, obtienes una recompensa.

La contrapartida elegante de Ofrenda: cuanto más has pagado, más cerca estás de
que el Tribunal falle a tu favor. Duna es la única facción que **saca provecho
de ir perdiendo**, lo que la convierte en una remontadora natural y evita que
sea simplemente «pagar vida por poder».

> Nota técnica: las dos son extensiones del motor (un coste opcional en Vida al
> jugar la carta y una condición comparativa al final del turno). Nada que el
> estado no sepa ya: la Vida de los dos Nexos está a mano. Lo implemento yo.

---

## 3. El comandante

### `khaeris-la-balanza`
- **Nombre**: Khaeris · **Título**: La Balanza · **Facción**: Duna
- **Vida del Nexo**: 35
- **Pasiva**: La primera vez cada turno que pagas una Ofrenda, robas 1 carta.
- **Poder (una vez por partida, 2 genérico + 1 dorado de arena)**: «Pesaje del corazón» — inflige a cada Nexo la mitad de la diferencia entre ambos; si el tuyo tenía menos Vida, la mitad de esa diferencia la recuperas tú en su lugar.
- **Sabor**: «No juzga lo que hiciste. Pesa lo que queda de ti.»
- **Prompt de retrato**: *Retrato en tres cuartos de una figura hierática de porte real, cabeza con máscara ceremonial de chacal en oro batido y lapislázuli, cuerpo envuelto en lino blanquísimo plisado, sosteniendo una balanza pequeña de oro con una pluma en un platillo. Fondo: sala hipóstila con columnas gigantes y luz vertical de mediodía entrando por un tragaluz. Solemne, sereno, imponente. Paleta Duna.*

---

## 4. Las 31 cartas

**16 de 31 funcionan con lo que ya existe**; el resto usa Ofrenda o Juicio.

---

### 4.1 Fuente

#### `fuente-duna`
- **Nombre**: Fuente de Duna · **Tipo**: Esencia — Fuente · **Rareza**: Común
- **Coste**: 0 · **Reglas**: Agota esta fuente: genera 1 Esencia Dorada.
- **Sabor**: «El río sube cuando le toca. Nadie se lo pide.»
- **Motor**: ya soportado
- **Prompt**: *Un pozo escalonado de arenisca tallada con agua dorada en el fondo reflejando el sol vertical, jeroglíficos grabados en los peldaños. Sin figuras, composición vertical centrada. Paleta Duna.*

---

### 4.2 Unidades (15)

#### `escriba-del-tribunal`
- **Tipo**: Unidad — Humanoide · **Rareza**: Común · **Coste**: 0 gen + 1 dorada
- **ATQ/VID**: 1/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al entrar en juego, escruta 1.
- **Sabor**: «Lo escribe todo. Especialmente lo que preferirías olvidar.»
- **Motor**: ya soportado
- **Prompt**: *Un escriba sentado con las piernas cruzadas y un papiro desplegado sobre las rodillas, cabeza rapada, torso desnudo, pincel de junco en la mano, en una sala de columnas. Concentrado, ajeno a todo. Paleta Duna.*

#### `lancero-de-arena`
- **Tipo**: Unidad — Soldado · **Rareza**: Común · **Coste**: 1 gen + 1 dorada
- **ATQ/VID**: 2/3 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «La formación aguanta porque nadie recuerda cómo se rompe.»
- **Motor**: ya soportado
- **Prompt**: *Un soldado con faldellín de lino, escudo alargado de cuero y lanza de bronce, formando parte de una línea que se pierde en la duna, con el sol muy alto. Vista lateral. Paleta Duna.*

#### `chacal-guardian`
- **Tipo**: Unidad — Bestia · **Rareza**: Común · **Coste**: 1 gen + 1 dorada
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Impulso.
- **Sabor**: «Conoce el camino a la tumba de memoria. En los dos sentidos.»
- **Motor**: ya soportado
- **Prompt**: *Un chacal negro de pelaje lustroso y collar de oro, corriendo a gran velocidad por la arena al atardecer, con la sombra alargada. Elegante y ágil. Paleta Duna.*

#### `portadora-de-ofrendas`
- **Tipo**: Unidad — Humanoide · **Rareza**: Común · **Coste**: 1 gen + 1 dorada
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Ofrenda 2: al entrar en juego, roba 1 carta.
- **Sabor**: «Lleva en la cabeza más de lo que pesa el cesto.»
- **Motor**: nueva (Ofrenda)
- **Prompt**: *Una mujer joven caminando erguida con un cesto de ofrendas —panes, higos, flores de loto— en equilibrio sobre la cabeza, collar ancho de cuentas. Procesión difusa al fondo. Paleta Duna.*

#### `embalsamador`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 dorada
- **ATQ/VID**: 1/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al final de tu turno, cura 1 a tu Nexo. Juicio: cura 3 en su lugar.
- **Sabor**: «Su trabajo empieza donde el de los médicos termina.»
- **Motor**: nueva (Juicio)
- **Prompt**: *Un sacerdote embalsamador con máscara de chacal ceremonial trabajando con vendas de lino sobre una mesa de alabastro, vasijas canopas alineadas al fondo. Luz de aceite cálida. Sin cuerpo visible. Paleta Duna.*

#### `guardiana-de-la-tumba`
- **Tipo**: Unidad — Constructo · **Rareza**: Infrecuente · **Coste**: 2 gen + 1 dorada
- **ATQ/VID**: 2/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. No puede ser aturdida.
- **Sabor**: «Lleva mil años haciendo exactamente lo mismo.»
- **Motor**: nueva (inmunidad a estado)
- **Prompt**: *Una estatua colosal de granito de un guardián con cabeza de halcón, cobrando vida: las grietas de sus juntas brillan en dorado mientras da un paso al frente ante una puerta sellada. Paleta Duna.*

#### `sacerdote-solar`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 2 gen + 1 dorada
- **ATQ/VID**: 3/3 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Ofrenda 3: al entrar en juego, inflige 3 de daño a una unidad enemiga.
- **Sabor**: «El sol no negocia; solo se le puede pagar.»
- **Motor**: nueva (Ofrenda)
- **Prompt**: *Un sacerdote de cabeza rapada y piel de leopardo sobre el hombro, alzando los brazos hacia un disco solar cegador, con rayos rectos descendiendo sobre él. Contraluz dramático. Paleta Duna.*

#### `momia-funcionaria`
- **Tipo**: Unidad — No muerto · **Rareza**: Común · **Coste**: 1 gen + 1 dorada
- **ATQ/VID**: 3/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: No puede moverse el turno en que entra en juego.
- **Sabor**: «Volvió al puesto. Nadie le dijo que ya no hacía falta.»
- **Motor**: nueva (restricción de entrada)
- **Prompt**: *Una momia vendada erguida y compuesta, con collar de cargo y bastón de mando, de pie en un pasillo de tumba con jeroglíficos. Digna, nada monstruosa; se parece más a un funcionario que a un zombi. Paleta Duna.*

#### `arquera-del-nilo`
- **Tipo**: Unidad — Soldado · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 dorada
- **ATQ/VID**: 2/3 · **Alcance** 3 · **Movimiento** 1
- **Reglas**: Juicio: sus ataques infligen 1 de daño adicional.
- **Sabor**: «Apunta mejor cuando el asunto se ha puesto serio.»
- **Motor**: nueva (Juicio)
- **Prompt**: *Una arquera en la proa de una barca de juncos sobre el río, tensando un arco compuesto, con cañaverales altos y aves alzando el vuelo. Amanecer neblinoso. Paleta Duna.*

#### `escorpion-de-basalto`
- **Tipo**: Unidad — Constructo · **Rareza**: Rara · **Coste**: 2 gen + 1 dorada
- **ATQ/VID**: 4/4 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Cuando ataca, aturde al objetivo.
- **Sabor**: «Tallado para custodiar un umbral que ya no existe.»
- **Motor**: ya soportado (daño + `stunned`)
- **Prompt**: *Un escorpión monumental tallado en basalto negro pulido con incrustaciones de oro en las junturas, avanzando sobre la arena con el aguijón alzado. Reflejos duros del sol en la piedra. Paleta Duna.*

#### `heraldo-con-cabeza-de-ibis`
- **Tipo**: Unidad — Celestial · **Rareza**: Rara · **Coste**: 2 gen + 1 dorada
- **ATQ/VID**: 3/4 · **Alcance** 2 · **Movimiento** 2
- **Reglas**: Volador. Al entrar en juego, escruta 2.
- **Sabor**: «Sabe el final de la frase antes de que empieces a decirla.»
- **Motor**: ya soportado
- **Prompt**: *Una figura de cuerpo humano y cabeza de ibis, con alas amplias de plumas blancas y negras, sosteniendo una tablilla y un cálamo, suspendida sobre un templo. Sereno, sabio. Paleta Duna.*

#### `coloso-de-la-necropolis`
- **Tipo**: Unidad — Constructo · **Rareza**: Mítica · **Coste**: 4 gen + 2 dorada
- **ATQ/VID**: 6/8 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Ofrenda 4: al entrar en juego, inflige 3 de daño a todas las unidades enemigas.
- **Sabor**: «Se levanta cuando la necrópolis considera que ya está bien.»
- **Motor**: nueva (Ofrenda)
- **Prompt**: *Una estatua sedente colosal, de las que flanquean un templo, incorporándose y arrancando piedra del suelo, con el rostro sereno y los ojos encendidos en dorado. Escala aplastante, vista desde abajo. Paleta Duna.*

#### `devoradora-del-inframundo`
- **Tipo**: Unidad — Horror · **Rareza**: Mítica · **Coste**: 3 gen + 2 dorada
- **ATQ/VID**: 5/5 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Vínculo vital. Juicio: además, al final de tu turno el Nexo rival pierde 2 de Vida.
- **Sabor**: «Espera bajo la balanza a que el veredicto le dé de comer.»
- **Motor**: nueva (Juicio)
- **Prompt**: *Una criatura híbrida de cocodrilo, león e hipopótamo, agazapada junto a una balanza dorada gigantesca en una sala oscura, con los ojos fijos en el platillo. Mítica y expectante, no sanguinaria. Paleta Duna.*

#### `visir-de-la-arena`
- **Tipo**: Unidad — Humanoide · **Rareza**: Rara · **Coste**: 2 gen + 1 dorada
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Tus Ofrendas cuestan 1 de Vida menos.
- **Sabor**: «Administra el precio de todo, empezando por el suyo.»
- **Motor**: nueva (Ofrenda)
- **Prompt**: *Un visir anciano de barba postiza ceremonial y bastón, con anillos de oro, revisando cuentas grabadas en una tablilla mientras dos ayudantes esperan. Interior de palacio en penumbra fresca. Paleta Duna.*

#### `leon-de-la-sequia`
- **Tipo**: Unidad — Bestia · **Rareza**: Infrecuente · **Coste**: 2 gen + 1 dorada
- **ATQ/VID**: 4/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Golpe veloz.
- **Sabor**: «Cuando el río no sube, baja él.»
- **Motor**: ya soportado
- **Prompt**: *Una leona de melena rala y costillas marcadas cruzando una llanura agrietada por la sequía, con el aire temblando de calor al fondo. Fuerza cansada pero temible. Paleta Duna.*

---

### 4.3 Hechizos (9)

#### `plegaria-al-sol`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 0 gen + 1 dorada
- **Reglas**: Inflige 3 de daño a una unidad enemiga. Ofrenda 2: inflige 5.
- **Sabor**: «Se paga primero. Siempre se paga primero.»
- **Motor**: nueva (Ofrenda)
- **Prompt**: *Un rayo de sol vertical y sólido cayendo sobre una losa del suelo del desierto, calcinándola, con el polvo suspendido alrededor del haz. Sin figuras. Paleta Duna.*

#### `tormenta-de-arena`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Rara · **Coste**: 2 gen + 1 dorada
- **Reglas**: Inflige 2 de daño a todas las unidades enemigas y reduce su Movimiento en 1 este turno.
- **Sabor**: «Cambió el mapa dos veces antes del mediodía.»
- **Motor**: nueva (daño masivo existente + ralentización)
- **Prompt**: *Un muro de arena de cientos de metros avanzando sobre un templo, tragándose las columnas exteriores, con el cielo ocre y la luz filtrándose en tonos cobrizos. Escala apocalíptica. Paleta Duna.*

#### `balanza-de-maat`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Mítica · **Coste**: 2 gen + 2 dorada
- **Reglas**: Juicio: destruye la unidad enemiga con más Ataque. Si no, inflige 4 de daño a una unidad enemiga.
- **Sabor**: «La pluma no pesa nada y aun así gana casi siempre.»
- **Motor**: nueva (Juicio + destrucción condicional)
- **Prompt**: *Una balanza ceremonial de oro con una pluma blanca en un platillo y una sombra oscura en el otro, suspendida en una sala infinita de columnas. Momento exacto del equilibrio. Paleta Duna.*

#### `vendaje-ritual`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 0 gen + 1 dorada
- **Reglas**: Una unidad aliada gana un escudo de 3.
- **Sabor**: «Cada vuelta de lino es una promesa distinta.»
- **Motor**: ya soportado
- **Prompt**: *Vendas de lino blanquísimo enrollándose solas en el aire alrededor de una forma invisible, con polvo dorado entre las capas. Abstracto y ritual. Paleta Duna.*

#### `crecida-del-rio`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 dorada
- **Reglas**: Cura 6 de Vida a tu Nexo. Juicio: cura 10 en su lugar.
- **Sabor**: «Todo lo que el año se llevó, vuelve en una noche.»
- **Motor**: nueva (Juicio)
- **Prompt**: *El río desbordado cubriendo campos resecos, con el agua avanzando en láminas brillantes bajo la luna y la vegetación reverdeciendo en el borde. Esperanzador. Paleta Duna.*

#### `maldicion-del-sello`
- **Tipo**: Hechizo inmediato — Encantamiento · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 dorada
- **Reglas**: Una unidad enemiga no puede atacar ni moverse en su próximo turno. Ofrenda 2: además pierde 2 de Vida.
- **Sabor**: «Estaba escrito en la puerta y nadie lo leyó.»
- **Motor**: nueva (Ofrenda; el bloqueo total ya existe como Congelar)
- **Prompt**: *Un sello de arcilla intacto sobre la cuerda de una puerta de tumba, con jeroglíficos de advertencia grabados y una luz azulada escapando por las juntas. Primer plano. Paleta Duna.*

#### `juicio-de-los-cuarenta-y-dos`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 2 gen + 1 dorada
- **Reglas**: El rival descarta 1 carta. Juicio: descarta 2 y robas 1.
- **Sabor**: «Cuarenta y dos preguntas. Ninguna admite matices.»
- **Motor**: nueva (Juicio)
- **Prompt**: *Una hilera de cuarenta y dos figuras sedentes idénticas en penumbra, todas mirando al frente, apenas iluminadas por antorchas lejanas en una sala interminable. Opresivo y solemne. Paleta Duna.*

#### `oro-de-la-camara`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 dorada
- **Reglas**: Roba 2 cartas. Ofrenda 3: roba 3.
- **Sabor**: «Lo enterraron para el viaje. El viaje se aplazó.»
- **Motor**: nueva (Ofrenda)
- **Prompt**: *Una cámara funeraria repleta de objetos de oro apilados —tronos, carros desmontados, cofres— con la luz de una antorcha recién entrada arrancando destellos. Sin figuras. Paleta Duna.*

#### `eclipse`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Rara · **Coste**: 2 gen + 1 dorada
- **Reglas**: Ofrenda 4: inflige 4 de daño a todas las unidades enemigas y cura 4 a tu Nexo.
- **Sabor**: «El disco se cerró y el tribunal entero se puso de pie.»
- **Motor**: nueva (Ofrenda)
- **Prompt**: *Un eclipse total sobre el desierto, con el anillo de fuego rodeando el disco negro y las dunas iluminadas por una luz crepuscular imposible. Sin figuras. Paleta Duna.*

---

### 4.4 Estructuras (6)

#### `obelisco`
- **Tipo**: Estructura — Obelisco · **Rareza**: Común · **Coste**: 1 gen + 1 dorada · **Resistencia**: 5
- **Reglas**: Tus unidades a distancia infligen 1 de daño adicional.
- **Sabor**: «Un dedo de piedra señalando quién manda.»
- **Motor**: ya soportado (`ranged-attack-bonus`)
- **Prompt**: *Un obelisco de granito rosa cubierto de jeroglíficos, con la punta dorada encendida por el primer sol, recortado contra un cielo limpio. Vista desde abajo. Paleta Duna.*

#### `mesa-de-ofrendas`
- **Tipo**: Estructura — Altar · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 dorada · **Resistencia**: 4
- **Reglas**: La primera Ofrenda que pagues cada turno cuesta 1 de Vida menos.
- **Sabor**: «Se deja lo mejor y se espera de pie.»
- **Motor**: nueva (Ofrenda)
- **Prompt**: *Una mesa de ofrendas de alabastro con panes, frutas y una jarra, delante de una estela grabada, en un patio de templo con sombra dura de mediodía. Sin figuras. Paleta Duna.*

#### `pozo-escalonado`
- **Tipo**: Estructura — Pozo · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 dorada · **Resistencia**: 5
- **Reglas**: Al final de tu turno, cura 2 a tu Nexo.
- **Sabor**: «Baja tantos escalones como años lleve sin llover.»
- **Motor**: ya soportado
- **Prompt**: *Un pozo escalonado geométrico de arenisca, con decenas de escaleras descendiendo en simetría hacia el agua verde del fondo. Perspectiva vertiginosa, sin figuras. Paleta Duna.*

#### `puerta-sellada`
- **Tipo**: Estructura — Fortaleza · **Rareza**: Rara · **Coste**: 2 gen + 1 dorada · **Resistencia**: 9
- **Reglas**: Guardia.
- **Sabor**: «Lo que está detrás pagó por no ser molestado.»
- **Motor**: ya soportado
- **Prompt**: *Una puerta monumental de piedra sellada con cuerdas y sellos de arcilla intactos, flanqueada por dos estatuas guardianas, al final de un corredor con antorchas. Paleta Duna.*

#### `templo-del-veredicto`
- **Tipo**: Estructura — Templo · **Rareza**: Rara · **Coste**: 2 gen + 1 dorada · **Resistencia**: 6
- **Reglas**: Juicio: al final de tu turno, robas 1 carta.
- **Sabor**: «Se llena cuando las cosas van mal. Por eso está tan cuidado.»
- **Motor**: nueva (Juicio)
- **Prompt**: *La fachada de un templo con pilonos inclinados, estandartes en mástiles y una escalinata ancha, bajo un sol vertical que borra las sombras. Grandioso y desierto. Paleta Duna.*

#### `necropolis`
- **Tipo**: Estructura — Necrópolis · **Rareza**: Mítica · **Coste**: 2 gen + 2 dorada · **Resistencia**: 7
- **Reglas**: Juicio: al final de tu turno, una unidad aliada gana +1/+1 permanente.
- **Sabor**: «La ciudad de los que ya no discuten.»
- **Motor**: nueva (Juicio)
- **Prompt**: *Una ciudad funeraria entera de mastabas y capillas alineadas hasta el horizonte, con callejones de arena entre ellas y el sol bajo alargando cada sombra. Sin figuras vivas. Paleta Duna.*

---

## 5. Cómo se juega esta facción

Duna empieza pagando. Sus Ofrendas la ponen por detrás en Vida a propósito, y
justo entonces se enciende el Juicio: sus cartas rinden más, cura más y el
rival descubre que lo que parecía una ventaja se le ha dado la vuelta.

Es la facción que mejor **remonta** y la única que trata su propia Vida como
munición. También es la más fácil de jugar mal: ofrendar de más contra el rival
equivocado es perder por tu propia mano.

Sus dos debilidades, deliberadas:

1. **Suicida contra la agresión**: frente a Furia o Enjambre, cada Ofrenda
   acorta tu reloj. Hay partidas en las que la mitad de tu mazo no se puede usar.
2. **Sin Juicio, floja**: si vas ganando cómodamente, media facción rinde a la
   mitad. Es la única que no quiere ir demasiado por delante.

Mazo inicial sugerido (50 cartas): 20 Fuente de Duna, 3 Lancero de Arena,
3 Chacal Guardián, 2 Escriba del Tribunal, 2 Portadora de Ofrendas,
2 Momia Funcionaria, 2 Guardiana de la Tumba, 2 Sacerdote Solar,
2 Arquera del Nilo, 1 Escorpión de Basalto, 1 León de la Sequía,
1 Visir de la Arena, 1 Heraldo con Cabeza de Ibis, 1 Coloso de la Necrópolis,
1 Devoradora del Inframundo, 2 Plegaria al Sol, 2 Vendaje Ritual,
1 Crecida del Río, 1 Tormenta de Arena, 1 Balanza de Maat, 1 Eclipse,
1 Obelisco, 1 Mesa de Ofrendas, 1 Templo del Veredicto, 1 Necrópolis,
1 Oro de la Cámara.

---

## 6. Checklist de entrega

Nombres de archivo exactos para `tools/art-inbox/` (sin tildes ni ñ):

```
fuente-duna                escriba-del-tribunal      lancero-de-arena
chacal-guardian            portadora-de-ofrendas     embalsamador
guardiana-de-la-tumba      sacerdote-solar           momia-funcionaria
arquera-del-nilo           escorpion-de-basalto      heraldo-con-cabeza-de-ibis
coloso-de-la-necropolis    devoradora-del-inframundo visir-de-la-arena
leon-de-la-sequia          plegaria-al-sol           tormenta-de-arena
balanza-de-maat            vendaje-ritual            crecida-del-rio
maldicion-del-sello        juicio-de-los-cuarenta-y-dos  oro-de-la-camara
eclipse                    obelisco                  mesa-de-ofrendas
pozo-escalonado            puerta-sellada            templo-del-veredicto
necropolis                 khaeris-la-balanza
```

Aviso de estilo para toda la facción: **contado desde dentro del imperio**, no
desde la arqueología. Nada de exploradores con sombrero, nada de ruinas
polvorientas ni de vendas colgando de monstruos: los templos están recién
pintados, el oro está pulido y los muertos tienen un cargo. La referencia es la
pintura orientalista del XIX en cuanto a luz y solemnidad, pero con la
precisión iconográfica de un friso auténtico.

---

## 7. Las cuatro facciones nuevas juntas

Con estas dos, el juego tendría diez facciones y cada una un verbo distinto:

| Facción | Qué controla | Su verbo |
| --- | --- | --- |
| Marea | El espacio | Mover |
| Forja | La acumulación | Construir |
| Enjambre | El tiempo a su favor | Crecer |
| Duna | El precio de las cosas | Pagar |

Ninguna se pisa con otra ni con las seis originales, y las cuatro se pueden
implementar por separado: cada dosier es autosuficiente.
