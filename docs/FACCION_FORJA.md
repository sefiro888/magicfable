# Facción nueva · FORJA — «El Gremio de los Engranajes»

Dosier completo de la octava facción: identidad, mecánica propia, comandante y
**31 cartas** con su prompt de arte. Es la pareja del dosier de Marea y está
diseñada para no parecerse a ella en nada.

---

## 1. Por qué esta facción y en qué se diferencia

Marea controla el **espacio**: mueve piezas por el tablero. Forja controla el
**tiempo y la acumulación**: sus cartas empiezan flojas y se vuelven temibles si
las dejas trabajar. Es la única facción que **mejora lo que ya tiene** en vez de
seguir echando cartas.

Frente a las seis actuales: Orden defiende con muros grandes y quietos, Furia
quema rápido, Naturaleza cura. Forja **construye una máquina**: sus estructuras
no son paredes, son fábricas que fabrican ventaja cada turno, y sus unidades
son autómatas que se refuerzan entre sí. Si sobrevive al turno seis, gana.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (hierro y bronce viejo) | `#7a5a2e` |
| Luz mágica (metal al rojo, chispa) | `#ffb347`, `#ffe9a8` |
| Sombra (hollín, aceite) | `#1a1512` |
| Acento (latón pulido, vapor) | `#d9c48a`, `#cfd8dd` |

**Materiales**: bronce, latón, hierro remachado, engranajes, vapor, aceite,
cristal de reloj, cuerda tensada. **Formas**: círculos dentados, ejes,
mecanismos a la vista, simetría *funcional* (no ceremonial como Orden).

**Cuidado con Furia**: Furia también es fuego y metal, pero es *volcánica* —
grietas, lava, roca. Forja es *industrial* — piezas fabricadas, tornillos,
precisión. En las ilustraciones, Furia arde sin control; Forja controla el calor.

---

## 2. La mecánica propia: ENSAMBLAJE

**Cada vez que juegas una estructura, tus autómatas ganan +1 de Ataque
permanente.** Ese es el motor de la facción: las estructuras no defienden, dan
cuerda a tus máquinas.

Además, la palabra clave propia:

> **Ensamblaje N** — Al entrar en juego, esta carta gana +1/+1 por cada
> estructura aliada en el tablero, hasta un máximo de N.

Esto crea una decisión que hoy no existe: ¿juego ya la unidad grande, o levanto
primero otra fábrica y la juego el turno siguiente valiendo el doble? Y una
tensión real: las estructuras son objetivo fácil, así que el rival puede
desmontarte la máquina si acierta a tiempo.

> Nota técnica: «Ensamblaje» y el bono por estructura son extensiones del motor
> (una pasiva que cuenta estructuras aliadas al desplegar). Lo implemento yo.

---

## 3. El comandante

### `torvald-maestro-del-yunque`
- **Nombre**: Torvald · **Título**: Maestro del Yunque · **Facción**: Forja
- **Vida del Nexo**: 35
- **Pasiva**: Tus estructuras entran en juego con +1 de Resistencia. La primera estructura que juegues cada turno cuesta 1 genérico menos.
- **Poder (una vez por partida, 2 genérico + 1 ámbar)**: «Dar cuerda» — todas tus unidades ganan +2 de Ataque hasta el final del turno y pueden volver a moverse.
- **Sabor**: «Una pieza bien hecha no necesita que la animen. Solo que la dejen girar.»
- **Prompt de retrato**: *Retrato en tres cuartos de un artesano corpulento de mediana edad, gafas de soldador levantadas sobre la frente, delantal de cuero lleno de herramientas, un brazo mecánico de latón articulado con engranajes visibles. Fondo: taller en penumbra con maquinaria en marcha y chispas. Expresión concentrada, manos grandes y capaces. Paleta Forja.*

---

## 4. Las 31 cartas

**18 de 31 funcionan con lo que ya existe**; 13 usan Ensamblaje o el bono por
estructura, que es lo que estrena la facción.

---

### 4.1 Fuente

#### `fuente-forja`
- **Nombre**: Fuente de Forja · **Tipo**: Esencia — Fuente · **Rareza**: Común
- **Coste**: 0 · **Reglas**: Agota esta fuente: genera 1 Esencia Ámbar.
- **Sabor**: «El fuelle no descansa; por eso el gremio tampoco.»
- **Motor**: ya soportado
- **Prompt**: *Un fuelle industrial de cuero y latón conectado a un horno cuyo interior brilla en ámbar, con tuberías de vapor alrededor. Sin figuras, composición vertical centrada. Paleta Forja.*

---

### 4.2 Unidades (14)

#### `automata-de-taller`
- **Tipo**: Unidad — Autómata · **Rareza**: Común · **Coste**: 0 gen + 1 ámbar
- **ATQ/VID**: 1/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Ensamblaje 2.
- **Sabor**: «Barato, obediente y sorprendentemente rencoroso.»
- **Motor**: nueva (Ensamblaje)
- **Prompt**: *Un autómata pequeño y tosco de latón remachado, con un solo ojo de cristal ámbar y brazos desiguales terminados en herramientas, de pie en un taller entre virutas de metal. Encantador dentro de su fealdad. Paleta Forja.*

#### `remachadora`
- **Tipo**: Unidad — Autómata · **Rareza**: Común · **Coste**: 1 gen + 1 ámbar
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al entrar en juego, una estructura aliada recupera 2 de Resistencia.
- **Sabor**: «Repara más rápido de lo que el enemigo rompe. Casi siempre.»
- **Motor**: nueva (curar estructuras)
- **Prompt**: *Un autómata con forma de operario robusto sosteniendo una remachadora neumática humeante, arreglando una viga metálica, chispas saltando. Vapor y ruido implícitos. Paleta Forja.*

#### `capataz-del-gremio`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ámbar
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Tus otros autómatas adyacentes tienen +1 de Ataque.
- **Sabor**: «No fabrica nada. Consigue que los demás fabriquen mejor.»
- **Motor**: ya soportado (`attack-buff-nearby-allies`)
- **Prompt**: *Un capataz con chaleco de cuero, gafas de latón y una libreta metálica, señalando con autoridad mientras dos autómatas trabajan al fondo. Luz cálida de horno desde la derecha. Paleta Forja.*

#### `carguero-oxidado`
- **Tipo**: Unidad — Autómata · **Rareza**: Común · **Coste**: 1 gen + 1 ámbar
- **ATQ/VID**: 1/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «Lleva cuarenta años cargando y aún no se ha quejado.»
- **Motor**: ya soportado
- **Prompt**: *Un autómata de carga enorme y lento, con la chapa oxidada y una plataforma vacía sobre la espalda, plantado en medio de un patio industrial. Postura pesada y paciente. Paleta Forja.*

#### `perforadora-de-vapor`
- **Tipo**: Unidad — Autómata · **Rareza**: Infrecuente · **Coste**: 2 gen + 1 ámbar
- **ATQ/VID**: 4/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Perforar.
- **Sabor**: «Diseñada para roca. Sirve igual para lo demás.»
- **Motor**: ya soportado
- **Prompt**: *Una máquina bípeda con un taladro gigante de vapor por brazo derecho, expulsando vapor a presión por las juntas, avanzando sobre escombros. Ángulo bajo y agresivo. Paleta Forja.*

#### `ingeniera-de-campo`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ámbar
- **ATQ/VID**: 2/3 · **Alcance** 2 · **Movimiento** 2
- **Reglas**: Al entrar en juego, escruta 1. Si controlas una estructura, roba 1 carta.
- **Sabor**: «Los planos siempre estaban bien. Era el mundo el que venía torcido.»
- **Motor**: nueva (condición «controlas una estructura»)
- **Prompt**: *Una ingeniera joven con mono de trabajo y brazalete de herramientas, desplegando un plano metálico luminoso que flota ante ella. Fondo de andamios. Decidida, práctica. Paleta Forja.*

#### `centinela-de-engranaje`
- **Tipo**: Unidad — Autómata · **Rareza**: Infrecuente · **Coste**: 2 gen + 1 ámbar
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Ensamblaje 2.
- **Sabor**: «Gira despacio y siempre en la misma dirección: hacia ti.»
- **Motor**: nueva (Ensamblaje)
- **Prompt**: *Un guardián mecánico con un enorme engranaje dentado como torso, que gira lentamente, brazos-escudo de hierro. De pie ante una puerta de fábrica. Paleta Forja.*

#### `martillo-automata`
- **Tipo**: Unidad — Autómata · **Rareza**: Rara · **Coste**: 2 gen + 1 ámbar
- **ATQ/VID**: 4/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Cuando ataca a una estructura, inflige 3 de daño adicional.
- **Sabor**: «El gremio también sabe desmontar.»
- **Motor**: ya soportado (`structure-bonus-damage`)
- **Prompt**: *Un autómata con un martillo pilón por brazo, golpeando un muro que se resquebraja, con la fuerza del impacto levantando polvo y chispas. Movimiento congelado en el momento del golpe. Paleta Forja.*

#### `chatarrero`
- **Tipo**: Unidad — Humanoide · **Rareza**: Común · **Coste**: 0 gen + 1 ámbar
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Cuando destruye una unidad, tu siguiente estructura cuesta 1 genérico menos.
- **Sabor**: «Todo lo que cae vuelve al taller.»
- **Motor**: nueva (disparador de muerte + descuento)
- **Prompt**: *Un buscador de chatarra flaco con gafas de aumento y un saco lleno de piezas al hombro, arrancando una pieza de un autómata caído. Ambiente de desguace al atardecer. Paleta Forja.*

#### `titan-de-cuerda`
- **Tipo**: Unidad — Autómata · **Rareza**: Rara · **Coste**: 3 gen + 1 ámbar
- **ATQ/VID**: 4/7 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Ensamblaje 3.
- **Sabor**: «Le dan cuerda entre seis. Luego se apartan.»
- **Motor**: nueva (Ensamblaje)
- **Prompt**: *Un titán mecánico con una enorme llave de cuerda girando lentamente en la espalda, cuerpo de placas de bronce, alzándose sobre un taller que le queda pequeño. Vista desde abajo. Paleta Forja.*

#### `artillera-de-riel`
- **Tipo**: Unidad — Humanoide · **Rareza**: Rara · **Coste**: 2 gen + 1 ámbar
- **ATQ/VID**: 3/3 · **Alcance** 3 · **Movimiento** 1
- **Reglas**: No puede atacar a unidades adyacentes.
- **Sabor**: «Tres casillas o nada. Es cuestión de principios y de calibre.»
- **Motor**: nueva (restricción de alcance mínimo)
- **Prompt**: *Una artillera apoyando en un bípode un rifle de riel larguísimo de latón y cobre, con bobinas que se cargan de energía ámbar, apuntando a lo lejos desde una azotea industrial. Paleta Forja.*

#### `coloso-de-la-fundicion`
- **Tipo**: Unidad — Autómata · **Rareza**: Mítica · **Coste**: 4 gen + 2 ámbar
- **ATQ/VID**: 6/8 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Ensamblaje 4. Guardia.
- **Sabor**: «Se tarda un mes en montarlo y una tarde en lamentarlo.»
- **Motor**: nueva (Ensamblaje)
- **Prompt**: *Un coloso mecánico monumental de hierro y bronce con un horno encendido en el pecho visible tras una reja, brazos como yunques, saliendo de una fundición por unas puertas que apenas le caben. Escala aplastante. Paleta Forja.*

#### `cronista-de-laton`
- **Tipo**: Unidad — Autómata · **Rareza**: Mítica · **Coste**: 3 gen + 2 ámbar
- **ATQ/VID**: 4/6 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Al final de tu turno, si controlas dos estructuras o más, roba 1 carta.
- **Sabor**: «Lo apunta todo. Algún día alguien lo leerá.»
- **Motor**: nueva (condición «dos estructuras o más»)
- **Prompt**: *Un autómata escribiente con múltiples brazos delgados sosteniendo plumas, tomando notas simultáneas sobre un pergamino metálico, rodeado de archivadores de latón. Cabeza con esfera de reloj por rostro. Paleta Forja.*

#### `soldadora-veterana`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ámbar
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al entrar en juego, una unidad aliada gana un escudo de 2.
- **Sabor**: «Ha reparado más grietas que años tienes.»
- **Motor**: ya soportado (estado `shielded`)
- **Prompt**: *Una soldadora mayor con máscara levantada, cara curtida y sonrisa breve, aplicando un soplete a la placa de un autómata mientras salta un abanico de chispas blancas. Paleta Forja.*

---

### 4.3 Hechizos (8)

#### `dar-cuerda`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 0 gen + 1 ámbar
- **Reglas**: Una unidad aliada gana +2 de Ataque hasta el final del turno y puede volver a moverse.
- **Sabor**: «Media vuelta más de llave. Solo media.»
- **Motor**: ya soportado (`target-attack-until-end` + `refresh-move`)
- **Prompt**: *Una llave de cuerda enorme girando en el costado de una máquina, con el mecanismo interior visible tensándose y una onda de energía ámbar recorriendo las piezas. Sin figuras. Paleta Forja.*

#### `sobrecarga`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ámbar
- **Reglas**: Inflige 4 de daño a una unidad enemiga. Si controlas una estructura, inflige 6.
- **Sabor**: «El manual desaconseja esto en la página uno.»
- **Motor**: nueva (condición «controlas una estructura»)
- **Prompt**: *Una máquina desbordada de energía ámbar, con las juntas escupiendo arcos eléctricos y los manómetros reventados, un instante antes de estallar. Sin figuras. Paleta Forja.*

#### `linea-de-montaje`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 1 gen + 1 ámbar
- **Reglas**: Roba 2 cartas. Si controlas dos estructuras o más, cuesta 1 genérico menos.
- **Sabor**: «Producción antes que inspiración.»
- **Motor**: nueva (descuento condicional)
- **Prompt**: *Una cinta transportadora industrial vista en perspectiva, con piezas idénticas avanzando hacia el fondo y brazos mecánicos ensamblándolas a los lados. Ritmo y repetición. Paleta Forja.*

#### `desguace`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ámbar
- **Reglas**: Destruye una estructura enemiga. Tu Nexo se cura 2 por cada punto de Resistencia que tuviera, hasta 6.
- **Sabor**: «Nada se tira. Todo se reaprovecha.»
- **Motor**: nueva (curación proporcional; existe precedente en «Aniquilación del Vacío»)
- **Prompt**: *El esqueleto metálico de una estructura siendo desmontado pieza a pieza por garfios y cadenas, con las partes ordenadas ya en pilas al fondo. Sin figuras. Paleta Forja.*

#### `temple`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 0 gen + 1 ámbar
- **Reglas**: Una unidad aliada gana un escudo de 3.
- **Sabor**: «Agua fría en el momento exacto. Ni antes ni después.»
- **Motor**: ya soportado
- **Prompt**: *Una pieza de metal al rojo vivo sumergiéndose en un barreño de agua, con una explosión de vapor blanco y el metal cambiando de color. Primer plano. Paleta Forja.*

#### `plano-maestro`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 2 gen + 1 ámbar
- **Reglas**: Tus estructuras recuperan toda su Resistencia y tus autómatas ganan +1 de Ataque permanente.
- **Sabor**: «Estaba en el cajón desde el principio.»
- **Motor**: nueva (curar estructuras + bono permanente)
- **Prompt**: *Un plano técnico enorme desplegado sobre una mesa de taller, con líneas doradas que se elevan del papel formando el esquema tridimensional de una máquina. Luz cálida cenital. Paleta Forja.*

#### `martillo-de-precision`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 ámbar
- **Reglas**: Inflige 2 de daño a una unidad enemiga y la aturde.
- **Sabor**: «El golpe correcto pesa menos que el golpe fuerte.»
- **Motor**: ya soportado (daño + estado `stunned`)
- **Prompt**: *Un martillo pequeño de relojero golpeando un punto exacto de un mecanismo, que se detiene en seco con los engranajes trabados. Detalle macro, muy nítido. Paleta Forja.*

#### `horno-a-plena-carga`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Mítica · **Coste**: 3 gen + 2 ámbar
- **Reglas**: Inflige 3 de daño a todas las unidades enemigas. Tus autómatas ganan +1/+1 permanente.
- **Sabor**: «El gremio decidió que hoy no se ahorraba carbón.»
- **Motor**: nueva (daño masivo existente + bono permanente)
- **Prompt**: *Un horno industrial gigantesco con las compuertas abiertas de par en par, escupiendo una ola de calor ámbar que deforma el aire de toda la nave. Silueta de maquinaria recortada contra la luz. Paleta Forja.*

---

### 4.4 Estructuras (8)

Forja lleva más estructuras que ninguna otra facción a propósito: son su motor,
no su muro.

#### `yunque-del-gremio`
- **Tipo**: Estructura — Yunque · **Rareza**: Común · **Coste**: 1 gen + 1 ámbar · **Resistencia**: 4
- **Reglas**: Tus autómatas tienen +1 de Ataque.
- **Sabor**: «Todo lo que sirve pasó por aquí encima.»
- **Motor**: nueva (bono a un subtipo)
- **Prompt**: *Un yunque colosal de hierro negro sobre un tocón de roble reforzado, con marcas de miles de golpes y un martillo apoyado. Luz de fragua lateral. Sin figuras. Paleta Forja.*

#### `torre-de-vapor`
- **Tipo**: Estructura — Torre · **Rareza**: Común · **Coste**: 1 gen + 1 ámbar · **Resistencia**: 5
- **Reglas**: Al final de tu turno, inflige 1 de daño a la unidad enemiga más cercana.
- **Sabor**: «Suelta presión cada minuto, tenga o no a quién.»
- **Motor**: ya soportado (`splash-weakest-enemy` como precedente)
- **Prompt**: *Una torre industrial de ladrillo y tubos de latón soltando un chorro de vapor a presión por una válvula lateral, con manómetros temblando. Cielo gris de fábrica. Paleta Forja.*

#### `taller-ambulante`
- **Tipo**: Estructura — Taller · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ámbar · **Resistencia**: 4
- **Reglas**: Al final de tu turno, una unidad aliada dañada recupera 1 de Vida.
- **Sabor**: «Llega hasta donde está el problema.»
- **Motor**: nueva (curar unidades)
- **Prompt**: *Un carromato-taller de madera y metal con las paredes abiertas mostrando herramientas colgadas y un pequeño horno encendido dentro, aparcado en un camino embarrado. Sin figuras. Paleta Forja.*

#### `fundicion`
- **Tipo**: Estructura — Fundición · **Rareza**: Rara · **Coste**: 2 gen + 1 ámbar · **Resistencia**: 6
- **Reglas**: La primera unidad que juegues cada turno cuesta 1 genérico menos.
- **Sabor**: «El fuego nunca se apaga; solo cambia de turno.»
- **Motor**: nueva (descuento por turno; existe precedente en la pasiva de Kaela)
- **Prompt**: *El interior de una fundición con un crisol volcando metal líquido incandescente en un molde, chispas cayendo como lluvia y siluetas de maquinaria alrededor. Paleta Forja.*

#### `deposito-de-piezas`
- **Tipo**: Estructura — Depósito · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 ámbar · **Resistencia**: 5
- **Reglas**: Al final de tu turno, escruta 1.
- **Sabor**: «Ordenado por tamaño, por uso y por rencor.»
- **Motor**: ya soportado
- **Prompt**: *Estanterías industriales llenas de piezas metálicas clasificadas en cajones abiertos, con etiquetas y una escalera rodante. Orden obsesivo. Sin figuras. Paleta Forja.*

#### `muralla-remachada`
- **Tipo**: Estructura — Fortaleza · **Rareza**: Rara · **Coste**: 2 gen + 1 ámbar · **Resistencia**: 9
- **Reglas**: Guardia.
- **Sabor**: «No es bonita. Es que no hace falta que lo sea.»
- **Motor**: ya soportado
- **Prompt**: *Un muro industrial de planchas de acero remachadas, con refuerzos en diagonal y una puerta blindada cerrada, visto de frente. Textura de metal golpeado y óxido. Paleta Forja.*

#### `reloj-del-gremio`
- **Tipo**: Estructura — Reloj · **Rareza**: Mítica · **Coste**: 2 gen + 2 ámbar · **Resistencia**: 6
- **Reglas**: Al final de tu turno, tus autómatas ganan +1 de Ataque permanente.
- **Sabor**: «Marca la hora a la que todo estará listo.»
- **Motor**: nueva (bono permanente recurrente)
- **Prompt**: *Un reloj de torre monumental con la maquinaria a la vista en lugar de esfera, engranajes de latón girando unos dentro de otros y un péndulo enorme oscilando. Luz ámbar desde dentro. Paleta Forja.*

#### `cadena-de-montaje`
- **Tipo**: Estructura — Cadena · **Rareza**: Rara · **Coste**: 2 gen + 1 ámbar · **Resistencia**: 5
- **Reglas**: Tus otras estructuras entran en juego con +2 de Resistencia.
- **Sabor**: «Una máquina sola es un capricho. Dos son una industria.»
- **Motor**: nueva (bono al desplegar estructuras)
- **Prompt**: *Una cadena de montaje elevada con raíles y ganchos transportando estructuras metálicas a medio ensamblar por encima de un patio de fábrica. Perspectiva profunda. Paleta Forja.*

---

## 5. Cómo se juega esta facción

Forja pierde los primeros turnos a propósito: pone estructuras baratas mientras
encaja golpes. A partir del turno cinco o seis, cada autómata que despliega vale
el doble que la carta equivalente de otra facción, y el Coloso de la Fundición
con cuatro estructuras en mesa es la unidad más grande del juego.

Sus dos debilidades, deliberadas:

1. **Arranque flojo**: contra Furia, que quiere matar en el turno seis, va
   siempre por detrás. Necesita sus guardias baratos para llegar viva.
2. **Depende de las estructuras**: son objetivo fácil. El Martillo Autómata de
   su propia facción, el Vacío o cualquier carta que destruya estructuras la
   desmontan entera. Sin fábricas, sus autómatas son estadísticas mediocres.

Mazo inicial sugerido (50 cartas): 20 Fuente de Forja, 3 Autómata de Taller,
3 Carguero Oxidado, 2 Remachadora, 2 Capataz del Gremio, 2 Centinela de
Engranaje, 2 Perforadora de Vapor, 2 Soldadora Veterana, 1 Titán de Cuerda,
1 Artillera de Riel, 1 Coloso de la Fundición, 1 Cronista de Latón,
2 Yunque del Gremio, 2 Torre de Vapor, 1 Fundición, 1 Depósito de Piezas,
1 Reloj del Gremio, 2 Dar Cuerda, 2 Temple, 1 Sobrecarga, 1 Plano Maestro,
1 Horno a Plena Carga, 1 Línea de Montaje, 1 Martillo de Precisión.

---

## 6. Checklist de entrega

Nombres de archivo exactos para `tools/art-inbox/`:

```
fuente-forja               automata-de-taller        remachadora
capataz-del-gremio         carguero-oxidado          perforadora-de-vapor
ingeniera-de-campo         centinela-de-engranaje    martillo-automata
chatarrero                 titan-de-cuerda           artillera-de-riel
coloso-de-la-fundicion     cronista-de-laton         soldadora-veterana
dar-cuerda                 sobrecarga                linea-de-montaje
desguace                   temple                    plano-maestro
martillo-de-precision      horno-a-plena-carga       yunque-del-gremio
torre-de-vapor             taller-ambulante          fundicion
deposito-de-piezas         muralla-remachada         reloj-del-gremio
cadena-de-montaje          torvald-maestro-del-yunque
```

Los ids van sin acentos aunque el nombre de la carta los lleve: `cronista-de-laton`
para «Cronista de Latón», `linea-de-montaje` para «Línea de Montaje»,
`martillo-de-precision` para «Martillo de Precisión», `coloso-de-la-fundicion`
para «Coloso de la Fundición».

---

## 7. Las dos facciones juntas

Si algún día se enfrentan, la partida cuenta una historia clara: **Marea intenta
que la máquina de Forja nunca esté donde tiene que estar**, empujando autómatas
lejos de sus fábricas; **Forja aguanta con guardias baratos hasta que sus piezas
son tan grandes que da igual dónde las pongan**. Son opuestas en ritmo (Marea
juega el presente, Forja el futuro) y en método (mover vs. acumular), que es
justo lo que se busca al añadir dos facciones a la vez en vez de una.
