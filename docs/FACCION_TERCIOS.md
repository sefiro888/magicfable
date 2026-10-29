# Facción nueva · LOS TERCIOS — «El Cuadro de Flandes»

Dosier completo: identidad, mecánicas propias, comandante y **31 cartas** con su
prompt de arte.

---

## 0. CÓMO GENERAR EL ARTE

Lee `docs/GUIA-PROMPTS-ARTE.md` si no lo has hecho. Lo esencial aplicado aquí:

### Qué generador usar

**ChatGPT.** Con Inmortales se probó en paralelo con Gemini y no hay color:
Gemini se atasca en gris y plano medio e ignora las instrucciones de cámara.

### Instrucción permanente — pégala UNA VEZ al empezar la conversación

Los prompts de abajo terminan en «Paleta Tercios». Si no has pegado esto antes,
eso no significa nada para el generador.

> A partir de ahora voy a pedirte una serie de ilustraciones para cartas de un
> juego de fantasía táctico. Todas comparten esta dirección artística y **no
> quiero que la cambies entre una y otra**. Cuando yo escriba «Paleta Tercios»
> me refiero a todo esto:
>
> **Color**: negro de paño y acero pavonado como base; **naranja de fogonazo y
> de mecha encendida** como luz principal; sombras de humo y barro, muy
> oscuras; y el **rojo de la cruz de Borgoña** —una cruz en aspa, de ramas
> nudosas— como único acento saturado. Algún destello de latón y oro viejo en
> los oficiales.
>
> **Luz**: la luz sale de la pólvora y del fuego — fogonazos de arcabuz, mechas
> encendidas, un incendio de ciudad al fondo, faroles. Dura, baja y naranja,
> dejando media figura en negro. Si hay luz de día, es un **amanecer de
> Flandes**: sol bajo atravesando la niebla y el humo, nunca mediodía abierto.
>
> **Aire**: esto es importantísimo. Siempre hay **humo de pólvora en capas**,
> niebla baja, llovizna o barro. El aire nunca está limpio. Los haces de luz se
> ven porque atraviesan el humo.
>
> **Tono**: duro, sucio, profesional y orgulloso. Soldados cansados que saben
> exactamente lo que hacen. Nada de heroísmo reluciente ni de armaduras
> brillantes de torneo: aquí el metal está rayado, el paño remendado y las
> botas enterradas en el fango.
>
> **Materiales**: paño negro, lino crudo, cuero gastado, acero pavonado y
> rayado, madera de pica, cuerda de mecha, latón, barro.
>
> Contraste alto, composición **cinematográfica en formato vertical 2:3**,
> mínimo 1024 × 1536. Arte de carta de fantasía.

### Cómo se nombran los archivos

**Cada imagen se guarda con el identificador de su carta, tal cual:**

```
piquero-de-flandes.png
el-ultimo-cuadro.png
fuente-tercios.png
```

Minúsculas, guiones, sin acentos, sin números de serie. El identificador va en
el encabezado de cada ficha, entre comillas inclinadas. Las 32 imágenes de
Enjambre llegaron con nombre automático y hubo que identificarlas una a una
mirándolas: se perdió una tarde y aun así faltaban dos.

La lista completa de nombres está al final del documento, para comprobarla de
un vistazo.

---

## 1. Por qué esta facción y en qué se diferencia

Durante siglo y medio la infantería española no perdió una batalla campal, y no
fue por valentía: fue por una **idea de ingeniería social**. El tercio mezclaba
en un mismo cuadro picas larguísimas y arcabuces, de modo que los piqueros
aguantaban la carga mientras los arcabuceros disparaban **por encima y entre
ellos**. Ninguna de las dos armas servía sola. Juntas eran intratables.

Eso es toda la facción: **aquí las piezas no valen nada sueltas**.

Frente a las dieciséis actuales esto es nuevo. Orden defiende con escudos y
muros, pero cada unidad vale lo mismo esté donde esté. Inmortales no se rompe,
pero individualmente. Los Tercios son la única facción cuyas unidades **cambian
de valor según quién tengan al lado**, y la única que premia apelotonarse
cuando todo el resto del juego te enseña a dispersarte para no comer un área.

La segunda seña es la pólvora, y con ella el sitio: minas bajo la muralla,
brulotes, trincheras. Es la facción que **derriba estructuras**.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (paño negro, acero pavonado) | `#1c1c20`, `#4a4f57` |
| Luz (fogonazo, mecha, incendio) | `#ff8c2b`, `#ffd9a0` |
| Sombra (humo, barro, fango) | `#0e0c0a` |
| Acento (cruz de Borgoña, latón) | `#b0202a`, `#c9a227` |

**Materiales**: paño negro, lino crudo, cuero gastado, acero pavonado y rayado,
madera de pica, cuerda de mecha, latón, barro.

**Formas**: líneas larguísimas y rectas —las picas de cinco metros son el motivo
gráfico de toda la facción—, sombreros de ala ancha, golas blancas, calzas
abullonadas, corazas lisas sin adorno, bandoleras con frascos de pólvora
colgando.

**El detalle que lo identifica todo**: la **cruz de Borgoña**, una cruz en aspa
hecha de dos ramas nudosas y descortezadas, en rojo sobre fondo claro. Va en
banderas, tambores y mangas. Si una ilustración no la lleva en algún sitio,
falta la seña de la casa.

**El truco narrativo de esta facción**: **las picas que entran y salen del
encuadre**. En cada ilustración de unidad debería haber astas de pica cruzando
la imagen que pertenecen a compañeros que no se ven. Cuenta la mecánica dentro
del cuadro: esta gente nunca está sola, aunque la carta enseñe a uno solo.

**Cuidado con Orden**: Orden es lo caballeresco limpio — escudo, heráldica,
metal brillante. Los Tercios son pólvora y fango. Si una ilustración sale
luminosa y pulcra, está mal.

**Cuidado con Forja**: Forja también es metal, pero es precisión y simetría.
Aquí el acero está rayado y el paño remendado.

---

## 2. Las mecánicas propias

### FORMACIÓN

> **Formación** — Mientras esta unidad tenga dos o más unidades aliadas
> adyacentes, gana +1 de Ataque y +2 de Vida.

Tres decisiones que importan:

**Dos aliadas, no una.** Con una sola el bono se activaría casi siempre y
dejaría de ser una decisión. Con dos hay que renunciar de verdad a cubrir
terreno.

**El bono es mayor en Vida que en Ataque.** Formación es una mecánica
defensiva: premia plantarse. Si diera más Ataque, el jugador querría apelotonar
y avanzar a la vez, que es justo lo que no sabía hacer el tercio real.

**Se comprueba continuamente, no al entrar.** Es lo que hace que la facción se
juegue nerviosa: cada muerte puede desactivar a los tres vecinos a la vez, y
hundir el cuadro de golpe. Esa cascada es el riesgo que equilibra la mecánica.

### DESCARGA

> **Descarga** — Si hay una unidad aliada entre esta unidad y su objetivo, el
> ataque inflige 2 de daño adicional.

Es el arcabuz disparando por encima de las picas, y es la pieza que convierte
Formación en algo más que un bono defensivo: **apelotonarte deja de ser solo
aguantar y pasa a ser también la forma de hacer daño**. Un arcabucero detrás
del cuadro pega más que uno a campo abierto, que es exactamente al revés de lo
que haría cualquier otra facción del juego.

> Nota técnica: Formación necesita recalcularse al mover y al morir cualquier
> pieza adyacente, así que va como modificador derivado del estado, no como
> contador en la unidad. Descarga es una comprobación de línea entre atacante y
> objetivo, parecida a la que ya hace `pushDestination` en `marea.ts`. Lo
> implemento yo.

---

## 3. El comandante

### `farnesio-duque-de-parma`
- **Nombre**: Alejandro Farnesio · **Título**: Duque de Parma · **Facción**: Tercios
- **Vida del Nexo**: 34
- **Pasiva**: Tus unidades con Formación la mantienen con una sola aliada adyacente.
- **Poder (una vez por partida, 2 genérico + 1 pólvora)**: «El cuadro no se rompe» — tus unidades en Formación ganan un escudo de 3 y no pueden ser desplazadas ni obligadas a moverse durante un turno.
- **Sabor**: «No he perdido una plaza en veinte años. He perdido veinte años.»
- **Prompt**: *Un general flamenco-español de barba puntiaguda y gola blanca almidonada, con coraza pavonada y bastón de mando, de pie sobre un terraplén de tierra revuelta mirando hacia una ciudad sitiada que arde al fondo. Capa negra pesada movida por el viento. El incendio de la ciudad es la única fuente de luz y le ilumina la cara desde abajo. Humo en capas cruzando toda la imagen. Astas de pica entrando por los bordes del encuadre. Paleta Tercios.*

---

## 4. Las 31 cartas

---

### 4.1 Fuente

#### `fuente-tercios`
- **Nombre**: Esencia de Pólvora · **Tipo**: Esencia — Fuente · **Rareza**: Común
- **Coste**: 0 · **Reglas**: Agota esta fuente: genera 1 de Esencia de Pólvora.
- **Sabor**: «Un barril cuesta lo que un hombre. El barril llega antes.»
- **Prompt**: *Primerísimo plano de un frasco de pólvora de cuerno y latón abierto sobre una mesa de madera basta, con la pólvora negra derramada en grano gordo, al lado de un trozo de mecha encendida cuyo ascua naranja es la única luz de la imagen. Al fondo, desenfocado, un barril con marcas. Sin figuras. La cercanía del ascua a la pólvora da una tensión insoportable. Paleta Tercios.*

---

### 4.2 Unidades (15)

#### `piquero-de-flandes`
- **Tipo**: Unidad — Infantería · **Rareza**: Común · **Coste**: 1 gen + 1 pólvora
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Formación.
- **Sabor**: «Cinco metros de fresno. No hace falta saber esgrima.»
- **Prompt**: *Un piquero visto desde muy abajo, casi desde el suelo, calando la pica hacia el frente con las dos manos y el pie derecho adelantado clavado en el barro. La pica es larguísima y sale por la esquina superior del encuadre. A su lado, otras cuatro astas idénticas en el mismo ángulo exacto, pertenecientes a compañeros que quedan fuera del cuadro. Sombrero de ala ancha, paño negro remendado, niebla baja hasta las rodillas. Paleta Tercios.*

#### `arcabucero-bisono`
- **Tipo**: Unidad — Arcabucero · **Rareza**: Común · **Coste**: 1 gen + 1 pólvora
- **ATQ/VID**: 2/2 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Descarga.
- **Sabor**: «Bisoño: el que todavía cierra los ojos al disparar.»
- **Prompt**: *Un soldado muy joven, casi un chaval, en el instante del disparo de arcabuz: el fogonazo le estalla a un palmo de la cara iluminándolo de naranja, tiene los ojos apretados y la cabeza girada hacia el otro lado. El retroceso le levanta el hombro. Humo saliendo por la boca del cañón y por la llave a la vez. Paleta Tercios.*

#### `rodelero`
- **Tipo**: Unidad — Infantería · **Rareza**: Común · **Coste**: 1 gen + 1 pólvora
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 2
- **Sabor**: «Cuando las picas se traban, alguien tiene que meterse debajo.»
- **Prompt**: *Un soldado agachado corriendo POR DEBAJO de un bosque de astas de pica trabadas que cruzan toda la mitad superior de la imagen, con una rodela redonda de acero en una mano y una espada corta en la otra, la boca abierta en un grito. Las astas forman un techo sobre él. Barro saltando. Visto a ras de suelo. Paleta Tercios.*

#### `mosquetero-veterano`
- **Tipo**: Unidad — Arcabucero · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pólvora
- **ATQ/VID**: 2/3 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Descarga. Cuando ataca con Descarga, inflige 1 de daño adicional.
- **Sabor**: «Veinte años de servicio y una paga de catorce meses atrasada.»
- **Prompt**: *Un soldado de mediana edad con la cara curtida y una cicatriz, apoyando un mosquete muy largo sobre una horquilla clavada en el suelo, apuntando con calma absoluta y el ojo entrecerrado. Entre él y el objetivo, desenfocadas en primer plano, las espaldas de los piqueros por encima de las cuales está disparando. Mecha encendida enrollada en la muñeca. Paleta Tercios.*

#### `cabo-de-escuadra`
- **Tipo**: Unidad — Infantería · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pólvora
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Formación. Tus unidades adyacentes tienen +1 de Ataque.
- **Sabor**: «Veinticinco hombres. Se sabe los veinticinco nombres.»
- **Prompt**: *Un suboficial de espaldas al enemigo y de cara a su escuadra, con el brazo extendido señalando una posición y la otra mano cerrada en el pecho de un soldado al que está colocando en su sitio. Alrededor, caras de soldados mirándolo. Un fogonazo lejano les ilumina a todos de naranja por el lado derecho. Astas de pica cruzando el encuadre. Paleta Tercios.*

#### `tambor-del-tercio`
- **Tipo**: Unidad — Músico · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pólvora
- **ATQ/VID**: 1/3 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Tus unidades adyacentes tienen +1 de Movimiento.
- **Sabor**: «El cuadro no oye las órdenes. Oye el parche.»
- **Prompt**: *Un tambor con la caja colgada al costado y las dos baquetas desdibujadas por la velocidad del redoble, caminando hacia el frente con la boca cerrada y la mirada fija. El parche del tambor lleva pintada la cruz de Borgoña roja y ocupa buena parte de la imagen. Detrás, en la niebla, siluetas de picas avanzando a su ritmo. Paleta Tercios.*

#### `alferez-de-la-cruz`
- **Tipo**: Unidad — Infantería · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pólvora
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Formación. Tus unidades en Formación tienen +1 de Vida.
- **Sabor**: «El alférez no pelea. El alférez se queda de pie.»
- **Prompt**: *Un abanderado visto desde abajo sosteniendo con las dos manos una bandera enorme con la cruz de Borgoña roja sobre fondo blanco sucio, la tela desplegada ocupando media imagen y agujereada por tres o cuatro balazos. El viento la estira. Él tiene los pies clavados en el barro y la mandíbula apretada. Un incendio al fondo atraviesa la tela y hace brillar el rojo de la cruz. Paleta Tercios.*

#### `coselete`
- **Tipo**: Unidad — Infantería · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 pólvora
- **ATQ/VID**: 3/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Formación.
- **Sabor**: «Treinta kilos de hierro. Va en primera fila porque puede.»
- **Prompt**: *Un piquero acorazado de pies a cabeza, de frente y muy quieto, con coraza, quijotes y celada, el acero pavonado rayado y con dos abolladuras de bala. Sostiene la pica vertical. La figura es ancha y pesada y ocupa el centro exacto de la imagen. Niebla y humo detrás, y a los lados las astas de los compañeros. Imponente, sin un gramo de adorno. Paleta Tercios.*

#### `gastador`
- **Tipo**: Unidad — Zapador · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pólvora
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Perforar. Inflige el doble de daño a estructuras.
- **Sabor**: «Cobra doble. Se entiende por qué.»
- **Prompt**: *Un zapador de torso desnudo y sudado cavando en una galería estrechísima bajo tierra, apuntalada con maderos, alumbrado por un solo farol colgado de un clavo. Tiene un pico en las manos y un barril de pólvora esperando a su espalda. Tierra cayendo del techo. El espacio es tan angosto que da claustrofobia. Paleta Tercios.*

#### `sargento-mayor`
- **Tipo**: Unidad — Oficial · **Rareza**: Rara · **Coste**: 1 gen + 2 pólvora
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al comienzo de tu turno, puedes mover una unidad aliada 1 casilla.
- **Sabor**: «El que convierte una orden en un sitio donde ponerse.»
- **Prompt**: *Un oficial con partesana y gola, de pie sobre un tambor volcado para ganar altura, gritando órdenes con el brazo señalando a un flanco. A sus pies, el cuadro de picas reorganizándose: unas astas bajando y otras subiendo en mitad del movimiento. Humo denso. La escena transmite que algo se está corrigiendo justo a tiempo. Paleta Tercios.*

#### `jinete-herreruelo`
- **Tipo**: Unidad — Jinete · **Rareza**: Rara · **Coste**: 1 gen + 2 pólvora
- **ATQ/VID**: 3/2 · **Alcance** 2 · **Movimiento** 3
- **Reglas**: Descarga. Impulso.
- **Sabor**: «Dispara los dos pistoletes y se va. No se queda a ver.»
- **Prompt**: *Un jinete vestido entero de negro, con capa corta y sombrero de ala ancha, girando el caballo sobre sí mismo mientras dispara un pistolete con la mano derecha; el otro pistolete ya descargado y humeante en la izquierda. Dos fogonazos distintos iluminan la escena desde ángulos opuestos. El caballo negro, los ojos muy abiertos. Barro y humo. Paleta Tercios.*

#### `capitan-de-infanteria`
- **Tipo**: Unidad — Oficial · **Rareza**: Rara · **Coste**: 2 gen + 2 pólvora
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Formación. Tus unidades en Formación tienen +1/+1.
- **Sabor**: «Compró la compañía. Lleva once años pagándola con el cuerpo.»
- **Prompt**: *Un capitán con coraza y banda roja cruzada al pecho, en el centro del cuadro de picas, señalando hacia delante con la espada mientras mira hacia atrás por encima del hombro para comprobar que la formación lo sigue. Composición que deja ver el cuadro completo a su alrededor, erizado de astas, con humo entre las filas. Un fogonazo le ilumina la banda roja. Paleta Tercios.*

#### `maestre-de-campo`
- **Tipo**: Unidad — Oficial · **Rareza**: Rara · **Coste**: 2 gen + 2 pólvora
- **ATQ/VID**: 4/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Formación. Al entrar en juego, dos unidades aliadas ganan Formación.
- **Sabor**: «Manda tres mil hombres y conoce el nombre de cuatrocientos.»
- **Prompt**: *Un oficial de alto rango de pie en una altura al amanecer, con bengala de mando y bastón, viendo desplegarse abajo tres cuadros de picas a la vez sobre un campo encharcado. El sol bajo atraviesa la niebla en haces y hace brillar los miles de puntas de pica como un campo de espigas de acero. Él, de espaldas y pequeño; el ejército, inmenso. Paleta Tercios.*

#### `el-ultimo-cuadro`
- **Tipo**: Unidad — Infantería · **Rareza**: Mítica · **Coste**: 3 gen + 2 pólvora
- **ATQ/VID**: 4/7 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Formación. Mientras tenga dos o más unidades aliadas adyacentes, no puede ser destruida. Cuando una unidad aliada adyacente es destruida, gana +1/+1 permanentemente.
- **Sabor**: «Les pidieron rendición tres veces. Tres veces contestaron lo mismo.»
- **Prompt**: *Un cuadro de picas visto desde fuera y desde abajo, rodeado por completo, convertido en un erizo imposible de astas que apuntan en todas direcciones hacia un cerco de jinetes enemigos apenas insinuados en el humo. Dentro del cuadro, caras cerradas y una bandera agujereada todavía en pie. El suelo sembrado de caídos. Atardecer rojo detrás, el cuadro en negro casi total. Terminal y magnífico. Paleta Tercios.*

#### `el-gran-capitan`
- **Tipo**: Unidad — Oficial · **Rareza**: Mítica · **Coste**: 3 gen + 2 pólvora
- **ATQ/VID**: 4/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Formación. Tus unidades en Formación ganan Descarga.
- **Sabor**: «No inventó la pica ni el arcabuz. Se le ocurrió ponerlos juntos.»
- **Prompt**: *Un general de finales del XV con armadura de media coraza y barba corta, arrodillado en el suelo de tierra dibujando un cuadrado con el pomo de la daga, rodeado de oficiales inclinados que miran el dibujo. En el dibujo se distinguen una fila de rayas largas y detrás unos puntos. Un farol en el suelo ilumina la escena desde abajo y les deja las caras a medias. Al fondo, difuminado, el cuadro real formándose igual que el dibujo. Paleta Tercios.*

---

### 4.3 Hechizos (8)

#### `descarga-cerrada`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Común · **Coste**: 1 gen + 1 pólvora
- **Reglas**: Inflige 2 de daño a todas las unidades enemigas de una misma fila o columna.
- **Sabor**: «Primera fila, fuego. Segunda fila, avanza.»
- **Prompt**: *Una línea de arcabuceros disparando todos en el mismo instante, vista de lado para que se vea la fila entera: una sola pared de fogonazos naranjas alineados y una cortina de humo blanco saliendo hacia el mismo lado. La luz de los fogonazos ilumina la fila desde dentro. Sin enemigo visible, solo la oscuridad hacia la que disparan. Paleta Tercios.*

#### `a-la-pica`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Común · **Coste**: 1 gen + 0 pólvora
- **Reglas**: Una unidad aliada gana Formación. Si ya la tenía, gana +2 de Vida.
- **Sabor**: «Calar picas es un solo movimiento. Hay que hacerlo todos a la vez.»
- **Prompt**: *Primerísimo plano de una docena de manos callosas agarrando astas de pica, bajándolas al unísono: las manos a distintas alturas congeladas en mitad del gesto. Nudillos, uñas negras, puños de lino sucio. El ascua naranja de una mecha encendida al fondo desenfocada. Nada más. Íntimo y coral. Paleta Tercios.*

#### `santiago-y-cierra-espana`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pólvora
- **Reglas**: Tus unidades en Formación pueden moverse 1 casilla y atacar este turno.
- **Sabor**: «El grito no sirve de nada. Lo que sirve es que lo grite todo el mundo.»
- **Prompt**: *El cuadro entero rompiendo a avanzar, visto de frente y desde abajo: una pared de bocas abiertas gritando y de picas inclinándose hacia delante al mismo tiempo, las primeras botas ya fuera del encuadre inferior. La bandera con la cruz de Borgoña en alto en el centro. Polvo y barro saltando. Energía de avalancha. Paleta Tercios.*

#### `cuerda-encendida`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pólvora
- **Reglas**: Tus unidades con Descarga infligen 2 de daño adicional este turno.
- **Sabor**: «De noche se ve el tercio antes de oírlo: doscientas brasas flotando.»
- **Prompt**: *Primer plano nocturno de una mecha de cuerda enrollada varias veces alrededor del antebrazo de un soldado, con el ascua naranja viva en el extremo y una voluta de humo subiendo. Detrás, desenfocados en la oscuridad, decenas de puntos de brasa idénticos flotando a la misma altura, formando una línea curva que se pierde. Inquietante y precioso. Paleta Tercios.*

#### `mina-bajo-la-muralla`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 pólvora
- **Reglas**: Destruye una estructura enemiga e inflige 3 de daño a las unidades adyacentes a ella.
- **Sabor**: «Cavaron cuarenta días. Duró un segundo y medio.»
- **Prompt**: *El instante exacto en que una muralla de ladrillo revienta desde ABAJO: la base estalla en una bola naranja y el lienzo entero de muro se levanta y se parte en bloques que vuelan hacia los lados y hacia arriba. Visto desde lejos y desde abajo para que se vea la escala. Silueta de defensores diminutos cayendo. Onda de polvo expandiéndose. Paleta Tercios.*

#### `motin-de-impagados`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 1 gen + 0 pólvora
- **Reglas**: Roba 3 cartas. Tus unidades no pueden atacar este turno.
- **Sabor**: «No desertaron. Se quedaron en el campo, armados, esperando la paga.»
- **Prompt**: *Un corro de soldados sentados y de pie alrededor de una hoguera dentro de un campamento, con las picas CLAVADAS EN EL SUELO en vez de en las manos, pasándose un papel y discutiendo. Uno tiene un sombrero vuelto del revés sobre las rodillas, vacío. Un oficial aparece al borde del encuadre y nadie se levanta. La hoguera es la única luz. Tensión, no violencia. Paleta Tercios.*

#### `el-brulote`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Rara · **Coste**: 2 gen + 2 pólvora
- **Reglas**: Inflige 4 de daño a todas las unidades y estructuras de una fila.
- **Sabor**: «Llenaron un barco de pólvora y lo soltaron río abajo. Lo llamaron el infierno.»
- **Prompt**: *Un barco de madera entero convertido en bomba, navegando solo y en llamas por un río nocturno hacia un puente de barcas, con el fuego saliéndole por las escotillas y el mástil ya encendido como una antorcha. El reflejo naranja parte el agua negra en dos. En el puente, siluetas diminutas corriendo. El momento justo antes. Paleta Tercios.*

#### `rocroi`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Mítica · **Coste**: 2 gen + 2 pólvora
- **Reglas**: Tus unidades en Formación no pueden ser destruidas este turno. Al final del turno, inflige 2 de daño a todas las unidades enemigas adyacentes a una unidad tuya.
- **Sabor**: «Preguntaron cuántos quedaban. Contestaron: contad los muertos.»
- **Prompt**: *Un campo de batalla al anochecer visto desde una loma: todo el ejército propio derrotado y disperso, y en el centro exacto un único cuadrado de picas todavía entero y erizado, rodeado por un cerco enorme de enemigos que se ha detenido a distancia. Última luz roja en el horizonte, el resto azul oscuro. Sin figuras en primer plano. Épico y desolado. Paleta Tercios.*

---

### 4.4 Estructuras (7)

#### `trinchera`
- **Tipo**: Estructura — Fortificación · **Rareza**: Común · **Coste**: 1 gen + 1 pólvora · **Resistencia**: 4
- **Reglas**: Tus unidades adyacentes cuentan como una aliada adicional para Formación.
- **Sabor**: «Se gana más terreno con la pala que con la pica.»
- **Prompt**: *Una trinchera recién cavada en zigzag, vista en diagonal desde arriba y de cerca: tierra negra revuelta, fajinas de ramas apuntalando los lados, charcos de agua marrón en el fondo y una pala clavada. Vacía de gente. Al amanecer, con niebla a ras de suelo metiéndose dentro del zanjón. Paleta Tercios.*

#### `camino-espanol`
- **Tipo**: Estructura — Ruta · **Rareza**: Común · **Coste**: 1 gen + 1 pólvora · **Resistencia**: 4
- **Reglas**: Tus unidades tienen +1 de Movimiento.
- **Sabor**: «Mil kilómetros de Milán a Flandes, y ni un barco inglés en medio.»
- **Prompt**: *Un paso de montaña nevado al atardecer con una columna interminable de soldados, carros y mulas serpenteando por él, tan larga que se ve entrar por un extremo del encuadre y salir por el otro. Picas al hombro recortadas contra la nieve. Cumbres enormes a los lados. La columna, minúscula; la montaña, aplastante. Paleta Tercios con el blanco azulado de la nieve.*

#### `fuerte-de-estrella`
- **Tipo**: Estructura — Fortificación · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pólvora · **Resistencia**: 6
- **Reglas**: Guardia. Tus unidades adyacentes tienen +1 de Vida.
- **Sabor**: «No tiene esquinas muertas. Eso es todo lo que tiene que tener.»
- **Prompt**: *Una fortaleza abaluartada en forma de estrella vista desde el aire al atardecer, con sus baluartes puntiagudos, el foso lleno de agua reflejando el cielo naranja y los terraplenes de hierba. Geometría perfecta y extrañísima vista desde arriba, como una figura dibujada con compás sobre el campo. Humo de un cañón en un baluarte. Paleta Tercios.*

#### `pagaduria`
- **Tipo**: Estructura — Edificio · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pólvora · **Resistencia**: 4
- **Reglas**: Al comienzo de tu turno, roba 1 carta. Si tienes menos de tres unidades en juego, no hace nada.
- **Sabor**: «La plata de las Indias llega hasta aquí. Hasta aquí.»
- **Prompt**: *El interior en penumbra de una oficina de pagos militar: una mesa larga con un libro de cuentas abierto, montones de monedas de plata ordenados en pilas, una balanza de precisión y un cofre de hierro con tres cerraduras. Una vela gastada como única luz. Una mano enguantada escribiendo. Nadie cobrando: la cola se adivina fuera, en la oscuridad. Paleta Tercios.*

#### `maestranza-de-artilleria`
- **Tipo**: Estructura — Taller · **Rareza**: Rara · **Coste**: 1 gen + 2 pólvora · **Resistencia**: 5
- **Reglas**: Tus hechizos de Cataclismo infligen 1 de daño adicional.
- **Sabor**: «Cada cañón tiene nombre de mujer y un cura que lo bendijo.»
- **Prompt**: *Un parque de artillería de campaña al anochecer: cuatro cañones de bronce enormes sobre cunas de madera, con el bronce reflejando el naranja de las fraguas portátiles encendidas al lado. Pirámides de bolaños de piedra apiladas. Un artillero minúsculo limpiando un ánima con una baqueta larguísima. Humo y chispas. Escala industrial. Paleta Tercios.*

#### `puente-sobre-el-escalda`
- **Tipo**: Estructura — Puente · **Rareza**: Rara · **Coste**: 1 gen + 2 pólvora · **Resistencia**: 5
- **Reglas**: Tus unidades pueden moverse atravesando casillas ocupadas por aliadas.
- **Sabor**: «Dijeron que el río no se podía cerrar. Se cerró en siete meses.»
- **Prompt**: *Un puente de guerra cruzando un río anchísimo de orilla a orilla, hecho de barcazas ancladas y pontones con empalizadas y torres de madera armadas encima, visto desde una altura lateral para que se aprecie la longitud absurda. Antorchas cada pocos metros reflejándose en el agua negra. Niebla sobre el río. Una obra que no debería existir. Paleta Tercios.*

#### `el-cuartel-de-invierno`
- **Tipo**: Estructura — Edificio · **Rareza**: Mítica · **Coste**: 2 gen + 2 pólvora · **Resistencia**: 6
- **Reglas**: Al comienzo de tu turno, una unidad aliada dañada recupera 2 de Vida y, si no la tenía, gana Formación.
- **Sabor**: «Seis meses sin pelear. Es cuando se hace el tercio.»
- **Prompt**: *El interior de un granero enorme reconvertido en alojamiento de tropa en invierno: hamacas y jergones de paja por el suelo, picas apoyadas ordenadamente contra una pared en una fila larguísima, ropa tendida de las vigas, y en el centro una hoguera rodeada de soldados dormidos y de uno que vela remendando una bota. Luz naranja de la hoguera, azul fría de la nieve en los ventanucos. Paz tensa. Paleta Tercios.*

---

## 5. Cómo se juega esta facción

Los Tercios juegan al contrario que todo el mundo: **buscan apelotonarse**. La
curva abre con piqueros baratos que no valen nada sueltos y, en cuanto hay tres
juntos, se convierten en un bloque que cuesta muchísimo mover de donde está.
Detrás, los arcabuceros disparan por encima con Descarga, que es el premio por
haber formado.

El error típico al pilotarla es extenderse para cubrir casillas. En cuanto el
cuadro se abre, Formación se cae en cascada —una muerte puede desactivar a tres
vecinos a la vez— y lo que quedan son unidades mediocres y caras.

La carta que cambia las partidas es `el-gran-capitan`, que convierte a todo el
cuadro en artillería: con él en pie, estar apelotonado deja de ser solo
aguantar y empieza a matar.

Su punto débil son las áreas. Cualquier facción con daño de zona —Goblins,
Quinto Sol, Arcano— castiga justo lo que esta facción está obligada a hacer.
Contra ellas hay que abrir el cuadro a tiempo, aceptar perder los bonos y
confiar en los oficiales.

---

## 6. Checklist de entrega

Nombres de archivo exactos (sin extensión):

```
farnesio-duque-de-parma  fuente-tercios           piquero-de-flandes
arcabucero-bisono        rodelero                 mosquetero-veterano
cabo-de-escuadra         tambor-del-tercio        alferez-de-la-cruz
coselete                 gastador                 sargento-mayor
jinete-herreruelo        capitan-de-infanteria    maestre-de-campo
el-ultimo-cuadro         el-gran-capitan          descarga-cerrada
a-la-pica                santiago-y-cierra-espana cuerda-encendida
mina-bajo-la-muralla     motin-de-impagados       el-brulote
rocroi                   trinchera                camino-espanol
fuerte-de-estrella       pagaduria                maestranza-de-artilleria
puente-sobre-el-escalda  el-cuartel-de-invierno
```

- [ ] 32 ilustraciones (31 cartas + retrato del comandante).
- [ ] Generadas con **ChatGPT**, con la instrucción permanente pegada al principio de la conversación.
- [ ] **Cada archivo nombrado con el id de su carta**, en minúsculas y con guiones.
- [ ] Formato vertical 2:3, mínimo 1024 × 1536.
- [ ] Dejar todo en una carpeta dentro de `tools/art-inbox/`.
- [ ] Revisar que **el aire nunca esté limpio**: siempre humo, niebla, llovizna o polvo. Es lo que distingue esta facción de Orden.
- [ ] Revisar que la **cruz de Borgoña** aparezca en banderas, tambores y mangas.
- [ ] Revisar que haya **astas de pica cruzando el encuadre** en las cartas de unidad, incluso cuando solo se vea a un soldado.
