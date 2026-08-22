# Facción nueva · ENJAMBRE — «La Corte de Quitina»

Dosier completo de la novena facción: insectos y arácnidos. Identidad, mecánica
propia, comandante y **31 cartas** con su prompt de arte. Mismo flujo que los
dosieres anteriores: tú generas las ilustraciones, yo doy de alta las cartas.

---

## 1. Por qué esta facción y en qué se diferencia

Insectos y arácnidos podrían parecerse a Naturaleza (que ya tiene bestias) o a
Sombra (que ya tiene veneno). No se van a parecer, y el motivo es este:

- **Naturaleza** crece *hacia fuera*: cura, refuerza y aguanta. Es un bosque.
- **Sombra** roba vida y trabaja desde el cementerio. Es un lamento.
- **Enjambre** crece *hacia dentro*: sus cartas entran pequeñas y **se
  transforman solas** si les das tiempo. Es un ciclo vital.

Nadie en el juego tiene hoy unidades que cambien de estadísticas por sí mismas
turno tras turno. Enjambre convierte cada bicho que sobrevive en una amenaza
mayor, así que la pregunta para el rival deja de ser «¿me hace daño ahora?» y
pasa a ser «¿me puedo permitir dejarlo vivo otro turno?».

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (quitina) | `#2b2a1f` |
| Luz (savia ácida, bioluminiscencia) | `#a8e04a`, `#e6ff9c` |
| Sombra (nido, humedad) | `#0c0f08` |
| Acento (ámbar, ojos compuestos) | `#e0a03c`, `#7d5cff` |

**Materiales**: quitina iridiscente, seda de araña, ámbar con cosas dentro,
membranas de ala, cera de panal, madera podrida. **Formas**: hexágonos,
segmentación, patas articuladas, simetría radial. **Tono**: fascinante, no
repugnante. Nada de gore ni de vísceras: esto es *belleza incómoda*, como una
lámina de entomología del XIX pintada al óleo.

---

## 2. Las mecánicas propias

### Metamorfosis

> **Metamorfosis** — Al final de tu turno, si esta unidad sigue en juego, gana
> +1/+1. A la tercera vez, se transforma: gana además una palabra clave.

No es un contador que el jugador tenga que llevar a mano: la ficha enseña sus
estadísticas actuales, como cualquier otra. Lo que cambia es que **el tiempo
juega a favor de Enjambre**, y eso obliga al rival a gastar recursos en bichos
baratos que aún no dan miedo.

### Telaraña

> **Telaraña** — La unidad afectada no puede moverse en su próximo turno, pero
> sí puede atacar.

Es deliberadamente distinta de Congelar (Arcano), que anula el turno entero, y
de Aturdir (Orden), que impide atacar pero deja mover. Telaraña **clava a la
unidad en el sitio**: sigue siendo peligrosa donde está, pero deja de avanzar.
En un tablero de 8×8 donde hay que cruzar para llegar al Nexo, eso duele.

> Nota técnica: ambas son extensiones del motor (un estado nuevo `webbed` y un
> disparador de fin de turno). Los estados con caducidad por turno ya existen
> —`frozen` y `stunned` funcionan así—, de modo que Telaraña es casi calcar lo
> que hay. Lo implemento yo.

---

## 3. El comandante

### `vespira-madre-de-mil`
- **Nombre**: Vespira · **Título**: Madre de Mil · **Facción**: Enjambre
- **Vida del Nexo**: 35
- **Pasiva**: La primera unidad que juegues cada turno entra con Metamorfosis (si ya la tenía, entra con +1/+1).
- **Poder (una vez por partida, 2 genérico + 1 verde ácido)**: «Puesta» — todas tus unidades ganan +1/+1 permanente y aplican Telaraña a la unidad enemiga adyacente más cercana.
- **Sabor**: «No cuenta a sus hijas. Cuenta las que faltan.»
- **Prompt de retrato**: *Retrato en tres cuartos de una reina insectoide de porte majestuoso: torso humanoide de piel pálida cubierta por placas de quitina negra iridiscente, cuatro brazos delgados, alas membranosas plegadas a la espalda como una capa, ojos compuestos ámbar enormes y serenos. Corona formada por celdas de panal. Fondo: interior de un nido colosal con luz dorada filtrándose entre celdas. Bello e inquietante, nunca repulsivo. Paleta Enjambre.*

---

## 4. Las 31 cartas

**17 de 31 funcionan con lo que ya existe**; el resto usa Metamorfosis o
Telaraña, que son lo que estrena la facción.

---

### 4.1 Fuente

#### `fuente-enjambre`
- **Nombre**: Fuente de Enjambre · **Tipo**: Esencia — Fuente · **Rareza**: Común
- **Coste**: 0 · **Reglas**: Agota esta fuente: genera 1 Esencia Ácida.
- **Sabor**: «El panal decide dónde va la savia. Nunca se equivoca.»
- **Motor**: ya soportado
- **Prompt**: *Un fragmento de panal colosal de cera ambarina con savia luminosa verde brillando dentro de las celdas hexagonales, algunas selladas y otras rezumando. Sin figuras, composición vertical centrada. Paleta Enjambre.*

---

### 4.2 Unidades (16)

#### `larva-voraz`
- **Tipo**: Unidad — Insecto · **Rareza**: Común · **Coste**: 0 gen + 1 ácida
- **ATQ/VID**: 1/2 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Metamorfosis.
- **Sabor**: «Come. Solo eso. Y funciona.»
- **Motor**: nueva (Metamorfosis)
- **Prompt**: *Una larva pálida y segmentada del tamaño de un perro, con mandíbulas desproporcionadas, avanzando sobre madera podrida que va devorando a su paso. Detalle de textura húmeda sin resultar asquerosa. Paleta Enjambre.*

#### `obrera-de-quitina`
- **Tipo**: Unidad — Insecto · **Rareza**: Común · **Coste**: 1 gen + 1 ácida
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Metamorfosis.
- **Sabor**: «Trabaja como si la colonia dependiera de ella. Y así es.»
- **Motor**: nueva (Metamorfosis)
- **Prompt**: *Una hormiga guerrera del tamaño de un caballo, quitina negra pulida con reflejos verdes, mandíbulas curvas, transportando un fragmento de panal. Postura decidida, patas articuladas bien visibles. Paleta Enjambre.*

#### `tejedora-de-seda`
- **Tipo**: Unidad — Arácnido · **Rareza**: Común · **Coste**: 1 gen + 1 ácida
- **ATQ/VID**: 1/3 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Cuando ataca, aplica Telaraña al objetivo.
- **Sabor**: «Primero decide dónde quiere que estés.»
- **Motor**: nueva (Telaraña)
- **Prompt**: *Una araña de patas largas y finas suspendida en el centro de una tela enorme y geométrica que brilla con rocío, hilando un nuevo hilo. Contraluz que hace resplandecer la seda. Elegante, no monstruosa. Paleta Enjambre.*

#### `zangano-explorador`
- **Tipo**: Unidad — Insecto · **Rareza**: Común · **Coste**: 0 gen + 1 ácida
- **ATQ/VID**: 1/1 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador. Al entrar en juego, escruta 1.
- **Sabor**: «Vuelve con el mapa entero en la cabeza.»
- **Motor**: ya soportado
- **Prompt**: *Un zángano volador de alas rápidas y translúcidas, cuerpo cubierto de vello dorado, sobrevolando un claro al amanecer con polen suspendido en el aire. Paleta Enjambre.*

#### `saltadora-de-emboscada`
- **Tipo**: Unidad — Arácnido · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ácida
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Golpe veloz.
- **Sabor**: «Estaba ahí desde el principio.»
- **Motor**: ya soportado
- **Prompt**: *Una araña saltadora gigante, cuerpo compacto y peludo, ocho ojos brillantes al frente, agazapada en el instante previo al salto sobre una rama. Ojos como espejos negros. Paleta Enjambre.*

#### `escarabajo-acorazado`
- **Tipo**: Unidad — Insecto · **Rareza**: Común · **Coste**: 1 gen + 1 ácida
- **ATQ/VID**: 1/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «Su caparazón sobrevivió a la última era. Y a la anterior.»
- **Motor**: ya soportado
- **Prompt**: *Un escarabajo colosal de caparazón acorazado con reflejos metálicos verdes y morados, patas robustas clavadas en el suelo, visto de frente en posición defensiva. Paleta Enjambre.*

#### `mantis-segadora`
- **Tipo**: Unidad — Insecto · **Rareza**: Infrecuente · **Coste**: 2 gen + 1 ácida
- **ATQ/VID**: 4/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Cuando ataca, inflige 1 de daño adicional a las unidades enemigas adyacentes al objetivo.
- **Sabor**: «Reza antes de cada corte. No por ti.»
- **Motor**: ya soportado (`adjacent-damage` como precedente)
- **Prompt**: *Una mantis religiosa gigante erguida, patas delanteras dentadas alzadas en posición de ataque, cabeza triangular inclinada con calma inquietante. Fondo de hierba alta al atardecer. Paleta Enjambre.*

#### `avispa-parasitaria`
- **Tipo**: Unidad — Insecto · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ácida
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador. Cuando destruye una unidad, tu siguiente unidad de este turno cuesta 1 genérico menos.
- **Sabor**: «Cada cuerpo que cae es una cuna.»
- **Motor**: nueva (disparador de muerte + descuento)
- **Prompt**: *Una avispa enorme de cintura estrecha y aguijón largo, alas vibrando en el aire, planeando sobre un capullo de seda entreabierto. Colores ámbar y negro, luz lateral dura. Paleta Enjambre.*

#### `viuda-de-la-fosa`
- **Tipo**: Unidad — Arácnido · **Rareza**: Rara · **Coste**: 2 gen + 1 ácida
- **ATQ/VID**: 3/4 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Vínculo vital. Cuando ataca, aplica Telaraña al objetivo.
- **Sabor**: «Nadie ha visto el fondo de su nido y ha vuelto a contarlo.»
- **Motor**: nueva (Telaraña; `lifelink` ya existe)
- **Prompt**: *Una araña grande de abdomen brillante negro con una marca roja, asomando desde la boca de un agujero forrado de seda en el suelo. Solo se le ven las patas delanteras y los ojos. Tensión contenida. Paleta Enjambre.*

#### `escolta-de-ninfas`
- **Tipo**: Unidad — Insecto · **Rareza**: Infrecuente · **Coste**: 2 gen + 1 ácida
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Tus otras unidades con Metamorfosis adyacentes tienen +1 de Vida.
- **Sabor**: «Las cuida hasta que dejan de necesitarlo.»
- **Motor**: nueva (bono a unidades con Metamorfosis)
- **Prompt**: *Un insecto adulto de porte protector con alas semiplegadas formando un techo sobre varias ninfas más pequeñas agrupadas bajo él, en el interior cálido de un nido. Ternura extraña. Paleta Enjambre.*

#### `cazadora-de-tunel`
- **Tipo**: Unidad — Arácnido · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ácida
- **ATQ/VID**: 3/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Impulso. No puede ser objetivo de ataques a distancia el turno en que entra en juego.
- **Sabor**: «Sale del suelo justo donde no mirabas.»
- **Motor**: nueva (inmunidad temporal a distancia)
- **Prompt**: *Una araña de trampilla emergiendo de golpe de un agujero camuflado en la tierra, con la tapa de seda y musgo levantada, patas delanteras ya fuera. Movimiento explosivo. Paleta Enjambre.*

#### `guardiana-del-panal`
- **Tipo**: Unidad — Insecto · **Rareza**: Rara · **Coste**: 2 gen + 1 ácida
- **ATQ/VID**: 3/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Metamorfosis.
- **Sabor**: «Su cuerpo es la puerta.»
- **Motor**: nueva (Metamorfosis)
- **Prompt**: *Una avispa soldado enorme bloqueando la entrada circular de un panal, alas abiertas, aguijón visible, cuerpo cubierto de placas ambarinas. Vista frontal simétrica. Paleta Enjambre.*

#### `libelula-de-obsidiana`
- **Tipo**: Unidad — Insecto · **Rareza**: Rara · **Coste**: 2 gen + 1 ácida
- **ATQ/VID**: 4/3 · **Alcance** 1 · **Movimiento** 4
- **Reglas**: Volador, Golpe veloz.
- **Sabor**: «Ochenta batidas por segundo y ni una duda.»
- **Motor**: ya soportado
- **Prompt**: *Una libélula gigantesca de cuerpo negro iridiscente y alas de cristal ahumado, congelada en pleno vuelo rasante sobre agua quieta, con su reflejo debajo. Precisión y velocidad. Paleta Enjambre.*

#### `emperatriz-imago`
- **Tipo**: Unidad — Insecto · **Rareza**: Mítica · **Coste**: 4 gen + 2 ácida
- **ATQ/VID**: 5/7 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Volador, Metamorfosis. Al entrar en juego, tus otras unidades con Metamorfosis ganan +1/+1.
- **Sabor**: «Tardó nueve mudas. Mereció la pena esperar.»
- **Motor**: nueva (Metamorfosis)
- **Prompt**: *Una figura insectoide majestuosa recién salida de su crisálida, alas enormes aún húmedas desplegándose y brillando con tornasoles, cuerpo esbelto de quitina clara. Luz cenital como en un nacimiento. Sobrecogedora, hermosa. Paleta Enjambre.*

#### `tejedora-abismal`
- **Tipo**: Unidad — Arácnido · **Rareza**: Mítica · **Coste**: 3 gen + 2 ácida
- **ATQ/VID**: 4/6 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Al final de tu turno, aplica Telaraña a la unidad enemiga más cercana a tu Nexo.
- **Sabor**: «Teje despacio porque el tiempo también es hilo.»
- **Motor**: nueva (Telaraña recurrente)
- **Prompt**: *Una araña colosal en el centro de una red que ocupa todo un desfiladero, con hilos gruesos anclados a las paredes de roca y niebla entre ellos. Escala monumental, vista desde abajo. Paleta Enjambre.*

#### `enjambre-devorador`
- **Tipo**: Unidad — Insecto · **Rareza**: Rara · **Coste**: 3 gen + 1 ácida
- **ATQ/VID**: 5/4 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Perforar. Cuando ataca, gana +1 de Ataque hasta el final del turno.
- **Sabor**: «Uno es una molestia. Un millón es geografía.»
- **Motor**: ya soportado (`buff-self-on-attack`)
- **Prompt**: *Una masa densa de insectos voladores formando una silueta vagamente humanoide que avanza arrasando un campo, con el fondo oscurecido por la nube. Sin detalle individual, solo movimiento. Paleta Enjambre.*

---

### 4.3 Hechizos (9)

#### `muda`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Común · **Coste**: 0 gen + 1 ácida
- **Reglas**: Una unidad aliada gana +1/+1 permanente.
- **Sabor**: «El caparazón viejo queda de pie, vacío, como una advertencia.»
- **Motor**: ya soportado (`target-health-permanent` como precedente)
- **Prompt**: *Un exoesqueleto vacío partido por la espalda, aún en pie y perfectamente conservado, mientras al fondo se adivina la criatura nueva y húmeda alejándose. Melancólico. Paleta Enjambre.*

#### `hilo-tenso`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 0 gen + 1 ácida
- **Reglas**: Aplica Telaraña a una unidad enemiga.
- **Sabor**: «Un solo hilo. En el sitio exacto.»
- **Motor**: nueva (Telaraña)
- **Prompt**: *Un único hilo de seda tensado en diagonal entre dos ramas, cargado de gotas de rocío que atrapan la luz, vibrando. Minimalista, casi abstracto. Paleta Enjambre.*

#### `veneno-lento`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ácida
- **Reglas**: Inflige 2 de daño a una unidad enemiga y 2 más al final de tu siguiente turno.
- **Sabor**: «No corras. Eso lo acelera.»
- **Motor**: nueva (daño diferido)
- **Prompt**: *Una gota de veneno verde ácido cayendo desde un colmillo curvo, con el líquido dejando una estela luminosa en el aire. Primer plano macro. Paleta Enjambre.*

#### `nube-de-esporas`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Rara · **Coste**: 2 gen + 1 ácida
- **Reglas**: Inflige 2 de daño a todas las unidades enemigas y aplica Telaraña a las que sobrevivan.
- **Sabor**: «Respirar era la trampa.»
- **Motor**: nueva (daño masivo existente + Telaraña)
- **Prompt**: *Una nube densa de esporas doradas y verdes expandiéndose por un claro, con siluetas difusas atrapadas dentro. Luz difundida, atmósfera espesa. Paleta Enjambre.*

#### `festin`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ácida
- **Reglas**: Una unidad aliada gana +2 de Ataque hasta el final del turno. Si destruye a alguien este turno, cura 2 a tu Nexo.
- **Sabor**: «La colonia también come de lo que muere lejos.»
- **Motor**: nueva (condición «si destruye»)
- **Prompt**: *Un banquete de insectos sobre una fruta enorme y madura partida por la mitad, decenas de cuerpos brillantes cubriéndola. Colores intensos, casi bodegón. Paleta Enjambre.*

#### `crisalida`
- **Tipo**: Hechizo inmediato — Encantamiento · **Rareza**: Rara · **Coste**: 1 gen + 1 ácida
- **Reglas**: Una unidad aliada no puede ser objetivo hasta tu próximo turno, y entonces gana +2/+2 permanente.
- **Sabor**: «Se encierra porque sabe en qué va a salir.»
- **Motor**: nueva (intocable temporal + bono diferido)
- **Prompt**: *Una crisálida grande colgando de una rama, de superficie dorada translúcida, con la silueta de algo mucho mayor de lo que cabría dentro insinuándose a contraluz. Paleta Enjambre.*

#### `plaga`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Mítica · **Coste**: 3 gen + 2 ácida
- **Reglas**: Inflige 3 de daño a todas las unidades enemigas. Tus unidades con Metamorfosis ganan +1/+1 permanente.
- **Sabor**: «Se llevaron las cosechas, los techos y los nombres.»
- **Motor**: nueva (Metamorfosis)
- **Prompt**: *El cielo entero oscurecido por una plaga de langostas sobre campos de cultivo, con el sol convertido en un disco pálido tras la nube. Escala apocalíptica pero pictórica. Paleta Enjambre.*

#### `mordedura-paralizante`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 ácida
- **Reglas**: Inflige 3 de daño a una unidad enemiga y la aturde.
- **Sabor**: «No hace falta veneno para todo. A veces basta la presión.»
- **Motor**: ya soportado (daño + `stunned`)
- **Prompt**: *Un par de quelíceros cerrándose sobre una superficie dura, con un punto de impacto luminoso donde muerden. Detalle macro extremo. Paleta Enjambre.*

#### `llamada-del-panal`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ácida
- **Reglas**: Roba 2 cartas. Si controlas tres unidades o más, cuesta 1 genérico menos.
- **Sabor**: «Todas oyen lo mismo, todas a la vez.»
- **Motor**: nueva (descuento condicional)
- **Prompt**: *El interior de un panal visto desde dentro, con cientos de celdas hexagonales llenas de luz ambarina y siluetas moviéndose en el fondo. Geometría hipnótica. Paleta Enjambre.*

---

### 4.4 Estructuras (5)

#### `nido-colgante`
- **Tipo**: Estructura — Nido · **Rareza**: Común · **Coste**: 1 gen + 1 ácida · **Resistencia**: 4
- **Reglas**: Al final de tu turno, una unidad aliada con Metamorfosis gana +1 de Vida.
- **Sabor**: «Papel masticado, saliva y una paciencia infinita.»
- **Motor**: nueva (Metamorfosis)
- **Prompt**: *Un nido de avispas colosal colgando de una rama gruesa, de capas grises y ocres como papel enrollado, con la abertura inferior oscura. Bosque en penumbra. Paleta Enjambre.*

#### `telar-de-emboscada`
- **Tipo**: Estructura — Telar · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ácida · **Resistencia**: 4
- **Reglas**: Al final de tu turno, aplica Telaraña a una unidad enemiga adyacente a esta estructura.
- **Sabor**: «La trampa no persigue. Espera.»
- **Motor**: nueva (Telaraña)
- **Prompt**: *Una red de seda espesa tendida entre dos troncos, con restos atrapados y capullos colgando, iluminada por un rayo de sol que la vuelve casi blanca. Sin figuras. Paleta Enjambre.*

#### `criadero-subterraneo`
- **Tipo**: Estructura — Criadero · **Rareza**: Rara · **Coste**: 2 gen + 1 ácida · **Resistencia**: 6
- **Reglas**: Tus unidades entran en juego con +1 de Vida.
- **Sabor**: «Abajo siempre hay más.»
- **Motor**: ya soportado (`entry-allied-units-gain-health` como precedente)
- **Prompt**: *Una cámara subterránea llena de huevos traslúcidos ordenados en filas, con luz verde palpitando dentro de cada uno y raíces colgando del techo. Sin figuras adultas. Paleta Enjambre.*

#### `columna-de-ambar`
- **Tipo**: Estructura — Reliquia · **Rareza**: Rara · **Coste**: 2 gen + 1 ácida · **Resistencia**: 5
- **Reglas**: Guardia. Al final de tu turno, escruta 1.
- **Sabor**: «Dentro hay algo con más patas de las que debería.»
- **Motor**: ya soportado
- **Prompt**: *Una columna alta de ámbar dorado semitransparente, con insectos antiquísimos suspendidos dentro en distintas posturas, atravesada por la luz. Belleza de museo. Paleta Enjambre.*

#### `corte-de-quitina`
- **Tipo**: Estructura — Trono · **Rareza**: Mítica · **Coste**: 2 gen + 2 ácida · **Resistencia**: 6
- **Reglas**: Tus unidades con Metamorfosis crecen +2/+2 en vez de +1/+1.
- **Sabor**: «El trono no manda: coordina.»
- **Motor**: nueva (Metamorfosis mejorada)
- **Prompt**: *Un trono orgánico formado por quitina negra fusionada y celdas de panal, vacío, en el centro de una cámara circular con nervaduras como alas. Solemne y ajeno. Paleta Enjambre.*

---

## 5. Cómo se juega esta facción

Enjambre inunda el tablero pronto con bichos baratos y **espera**. Cada turno
que el rival no dedica a matarlos, valen más. Su mejor jugada no es una carta
cara: es sobrevivir tres turnos con cuatro unidades pequeñas y que se conviertan
en cuatro amenazas de verdad, mientras las telarañas impiden que el rival
reorganice su línea.

Sus dos debilidades, a propósito:

1. **Frágil al daño masivo**: un Temblor Rojo de Furia o un Juicio Divino de
   Orden se llevan medio enjambre antes de que crezca. Es la facción que peor
   encaja los barridos.
2. **Lenta si va por detrás**: si pierde el tablero temprano no tiene forma de
   recuperarlo de golpe; sus cartas necesitan tiempo, y cuando va perdiendo, el
   tiempo es justo lo que no tiene.

Mazo inicial sugerido (50 cartas): 20 Fuente de Enjambre, 3 Larva Voraz,
3 Obrera de Quitina, 3 Tejedora de Seda, 2 Zángano Explorador,
2 Escarabajo Acorazado, 2 Saltadora de Emboscada, 2 Mantis Segadora,
2 Avispa Parasitaria, 1 Viuda de la Fosa, 1 Guardiana del Panal,
1 Libélula de Obsidiana, 1 Emperatriz Imago, 1 Tejedora Abismal,
2 Muda, 2 Hilo Tenso, 1 Veneno Lento, 1 Nube de Esporas, 1 Crisálida,
1 Plaga, 1 Nido Colgante, 1 Telar de Emboscada, 1 Criadero Subterráneo,
1 Corte de Quitina, 1 Llamada del Panal, 1 Mordedura Paralizante,
1 Enjambre Devorador.

---

## 6. Checklist de entrega

Nombres de archivo exactos para `tools/art-inbox/` (sin tildes ni ñ):

```
fuente-enjambre            larva-voraz               obrera-de-quitina
tejedora-de-seda           zangano-explorador        saltadora-de-emboscada
escarabajo-acorazado       mantis-segadora           avispa-parasitaria
viuda-de-la-fosa           escolta-de-ninfas         cazadora-de-tunel
guardiana-del-panal        libelula-de-obsidiana     emperatriz-imago
tejedora-abismal           enjambre-devorador        muda
hilo-tenso                 veneno-lento              nube-de-esporas
festin                     crisalida                 plaga
mordedura-paralizante      llamada-del-panal         nido-colgante
telar-de-emboscada         criadero-subterraneo      columna-de-ambar
corte-de-quitina           vespira-madre-de-mil
```

Aviso de estilo para toda la facción: **fascinante, no repulsivo**. Nada de
sangre, vísceras ni cadáveres humanos. La referencia es una lámina de
entomología victoriana pintada al óleo: precisión anatómica, luz cuidada y esa
belleza rara que tienen los bichos cuando se les mira de cerca.
