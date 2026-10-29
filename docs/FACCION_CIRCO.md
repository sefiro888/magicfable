# Facción nueva · EL CIRCO — «La Compañía de los Prodigios»

Dosier completo: identidad, mecánicas propias, comandante y **31 cartas** con su
prompt de arte.

---

## 0. CÓMO GENERAR EL ARTE

Lee `docs/GUIA-PROMPTS-ARTE.md` si no lo has hecho.

### Qué generador usar

**ChatGPT.** Gemini se atasca en gris y plano medio e ignora las instrucciones
de cámara; está comprobado con Inmortales.

### Instrucción permanente — pégala UNA VEZ al empezar la conversación

Los prompts terminan en «Paleta Circo» y eso no significa nada si no has pegado
esto antes.

> A partir de ahora voy a pedirte una serie de ilustraciones para cartas de un
> juego de fantasía táctico. Todas comparten esta dirección artística y **no
> quiero que la cambies entre una y otra**. Cuando yo escriba «Paleta Circo» me
> refiero a todo esto:
>
> **Color**: **rojo carmesí de lona y terciopelo** y oro viejo de galón como
> base; blanco de yeso y maquillaje en las caras; morado y verde absenta como
> acentos venenosos; negro absoluto en el fondo, porque todo pasa de noche.
> Colores muy saturados, de caramelo, casi empalagosos.
>
> **Luz**: luz de **espectáculo**, siempre artificial y teatral. Un foco de
> calcio que cae en vertical y deja todo lo demás en negro; candilejas que
> iluminan las caras **desde abajo**; bengalas de colores; farolillos; la luna.
> Nunca luz de día, nunca luz natural. Que se vea el haz del foco atravesando
> el aire.
>
> **Aire**: polvo de pista levantado, confeti cayendo, serrín, humo de colores.
> Siempre hay algo flotando en el haz de luz.
>
> **Tono**: esto es lo más importante. **Maravilloso e inquietante a la vez,
> nunca repugnante ni sangriento.** La sensación debe ser la de un espectáculo
> fascinante en el que sospechas que te están timando y no te quieres ir. Hay
> sonrisas, pero son demasiado anchas. Hay elegancia, pero el terciopelo está
> raído. Si una imagen da miedo de terror o da asco, está mal.
>
> **Materiales**: lona encerada, terciopelo gastado, lentejuela, latón, espejo,
> cuerda, madera pintada, papel pintado, plumas, cristal.
>
> **Formas**: rayas verticales, rombos de arlequín, espirales, curvas de
> caravana, tipografía circense recargada. Siluetas exageradas: muy altas, muy
> anchas, muy delgadas, nunca normales.
>
> Contraste altísimo —zonas de negro puro—, composición **cinematográfica en
> formato vertical 2:3**, mínimo 1024 × 1536. Arte de carta de fantasía.

### Cómo se nombran los archivos

**Cada imagen se guarda con el identificador de su carta, tal cual:**

```
mujer-de-goma.png
el-canon-humano.png
fuente-circo.png
```

Minúsculas, guiones, sin acentos, sin números de serie. La lista completa está
al final del documento.

---

## 1. Por qué esta facción y en qué se diferencia

Todas las facciones del juego pelean por posición: amenazan casillas, bloquean
pasos, se cubren unas a otras. El tablero es una rejilla y todo el mundo la
respeta.

El Circo no la respeta. **Sus unidades saltan por encima de lo que haya.**

Donde Orden levanta un muro, los acróbatas pasan por arriba. Donde los Tercios
cierran un cuadro erizado de picas, la mujer de goma se cuela entre las astas.
Mientras el resto del juego se gana estudiando la geometría, esta facción se
gana **ignorándola**: aparece detrás de las líneas, cambia dos piezas de sitio
en mitad de un combate y deja al rival peleando contra la unidad equivocada.

La segunda seña es el descaro. Los artistas de esta compañía **actúan**, y
actuar es ponerse donde todo el mundo mire: cuanto más rodeados de enemigos
están, más pegan. Es la única facción del juego a la que le conviene estar en
peligro.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (lona carmesí, terciopelo) | `#9b1b30`, `#5e1430` |
| Luz (foco de calcio, candilejas) | `#fff4d6`, `#ffcf5c` |
| Sombra (noche de la carpa) | `#0a0710` |
| Acento (absenta, morado de feria) | `#7fd1a0`, `#6b3fa0` |

**Materiales**: lona encerada, terciopelo raído, lentejuela, latón, espejo,
cuerda, madera pintada, plumas, cristal.

**Formas**: rayas verticales, rombos de arlequín, espirales, curvas de
caravana. Siluetas exageradas y nunca normales: muy altas, muy anchas, muy
delgadas.

**El detalle que lo identifica todo**: **el cartel**. Esta gente se anuncia. En
casi todas las ilustraciones debería haber un cartel pintado, un rótulo, una
pancarta o un programa con tipografía circense recargada, aunque sea de fondo y
medio ilegible. Es lo que distingue a un monstruo de Bestiario de un monstruo
del Circo: el del Circo **tiene cartel**, y por tanto tiene nombre artístico.

**El truco narrativo de esta facción**: **el público**. En el fondo de las
ilustraciones, siempre que quepa, debe haber gradas en penumbra con filas de
caras mirando — a veces solo los brillos de los ojos y los dientes. No se ve
quién es ese público. Cuenta la mecánica Público dentro de la imagen y deja una
pregunta sin responder.

**Cuidado con Sombra**: Sombra es terror de verdad, oscuridad y miedo. El Circo
es luminoso, recargado y colorido; lo inquietante viene del exceso, no de la
penumbra.

**Cuidado con Plaga**: Plaga da asco a propósito. Aquí no hay nada supurante ni
podrido: hay lentejuela, maquillaje y dientes muy blancos.

**Cuidado con Goblins**: Goblins da risa por torpeza. El Circo no es torpe —es
asombrosamente competente—, y ahí está lo que da mal cuerpo.

---

## 2. Las mecánicas propias

### ACROBACIA

> **Acrobacia** — Esta unidad puede moverse atravesando casillas ocupadas por
> cualquier unidad o estructura, y no puede ser bloqueada.

Dos decisiones que importan:

**Atraviesa, no vuela.** Una unidad con Acrobacia sigue estando a nivel de
suelo: la pueden atacar los que atacan al suelo y pisa las casillas con efecto.
Si volara sería Volador, que ya existe, y además se saltaría demasiadas cosas.

**Atraviesa, pero no termina encima.** El movimiento pasa por casillas
ocupadas, pero tiene que acabar en una libre. Sin ese límite la facción podría
plantarse en cualquier parte del tablero y no habría defensa posible.

### PÚBLICO

> **Público** — Esta unidad gana +1 de Ataque por cada unidad enemiga que esté
> adyacente a ella, hasta un máximo de +3.

Es un incentivo a meterse donde no se debe, y por eso **el Circo es frágil a
propósito**: sus unidades tienen poca Vida, así que cobrar el bono completo
suele significar morir al turno siguiente. La facción se juega calculando
cuántos turnos de función te quedan.

La combinación de las dos es lo que la hace distinta: Acrobacia te permite
**colocarte voluntariamente rodeado**, en un sitio al que ninguna otra facción
puede llegar, y Público convierte eso en el mayor pico de daño del juego. Es un
número de riesgo, no una estrategia de control.

> Nota técnica: Acrobacia necesita un modo de búsqueda de camino que ignore
> ocupación pero exija destino libre — el buscador actual ya distingue ambas
> cosas al calcular casillas válidas. Público es un modificador derivado del
> estado, como Formación de los Tercios. Lo implemento yo.

---

## 3. El comandante

### `don-fausto-maestro-de-ceremonias`
- **Nombre**: Don Fausto · **Título**: Maestro de Ceremonias · **Facción**: Circo
- **Vida del Nexo**: 30
- **Pasiva**: Tus unidades con Público ganan +1 de Ataque adicional por enemigo adyacente si están en la mitad del tablero del rival.
- **Poder (una vez por partida, 2 genérico + 1 oropel)**: «¡Pasen y vean!» — intercambia la posición de hasta tres parejas de unidades cualesquiera, tuyas o del rival.
- **Sabor**: «Todo lo que van a ver esta noche es verdad. Casi todo. Casi.»
- **Prompt**: *Un maestro de ceremonias altísimo y flaquísimo con chistera, frac rojo carmesí con galón dorado deshilachado y guantes blancos, de pie en el centro de la pista con los brazos abiertos de par en par presentando algo que queda fuera del encuadre. Un foco de calcio cae en vertical sobre él y deja todo lo demás en negro absoluto; el haz se ve atravesando el polvo de la pista. La sonrisa es demasiado ancha. Detrás, en la oscuridad, gradas con filas de ojos brillantes. Paleta Circo.*

---

## 4. Las 31 cartas

---

### 4.1 Fuente

#### `fuente-circo`
- **Nombre**: Esencia de Oropel · **Tipo**: Esencia — Fuente · **Rareza**: Común
- **Coste**: 0 · **Reglas**: Agota esta fuente: genera 1 de Esencia de Oropel.
- **Sabor**: «No es oro. Nunca lo fue. Mira cómo brilla.»
- **Prompt**: *Primerísimo plano de un montón de lentejuelas doradas, galón trenzado y abalorios de cristal derramados sobre terciopelo carmesí raído, con un foco cayendo en diagonal que arranca a cada lentejuela un destello distinto. Entre el montón, una moneda de latón mordida. Sin figuras. Lujo falso y precioso. Paleta Circo.*

---

### 4.2 Unidades (15)

#### `mozo-de-pista`
- **Tipo**: Unidad — Artista · **Rareza**: Común · **Coste**: 1 gen + 1 oropel
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 2
- **Sabor**: «Monta la carpa, limpia la pista, da de comer al tigre. No sale en el cartel.»
- **Prompt**: *Un hombre fuerte de mono de trabajo manchado y tirantes caídos, clavando con un mazo enorme una estaca de carpa en la tierra, visto desde abajo con el mazo en lo alto del golpe. A su espalda, la lona carmesí a medio izar y una maraña de cuerdas tensas cruzando el encuadre. Luz de farolillos de colores. Paleta Circo.*

#### `arlequin`
- **Tipo**: Unidad — Artista · **Rareza**: Común · **Coste**: 1 gen + 1 oropel
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Acrobacia.
- **Sabor**: «Entra por donde no hay puerta y se va antes del aplauso.»
- **Prompt**: *Un arlequín en mitad de un salto imposible, el cuerpo doblado hacia atrás en arco y las piernas por encima de la cabeza, congelado en el aire a dos metros del suelo. Traje de rombos carmesí y verde absenta, media máscara negra. El foco lo pilla en el aire y su sombra se proyecta deformada en la lona del fondo. Confeti cayendo. Paleta Circo.*

#### `el-payaso-triste`
- **Tipo**: Unidad — Artista · **Rareza**: Común · **Coste**: 1 gen + 1 oropel
- **ATQ/VID**: 1/4 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Las unidades enemigas adyacentes tienen −1 de Ataque.
- **Sabor**: «Mientras se rían de él, no están mirando al que entra por detrás.»
- **Prompt**: *Un payaso sentado solo en el borde de la pista vacía después de la función, con el maquillaje blanco corrido por el sudor, la peluca en la mano y los zapatones enormes desatados. Un único foco lo pilla desde muy arriba y deja las gradas vacías en negro. Confeti pisado en el serrín. La cara pintada sonríe y la de debajo no. Tristeza digna, nunca patética. Paleta Circo.*

#### `malabarista-de-cuchillos`
- **Tipo**: Unidad — Artista · **Rareza**: Común · **Coste**: 1 gen + 1 oropel
- **ATQ/VID**: 2/2 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Público.
- **Sabor**: «Siete cuchillos. Nunca se le ha caído ninguno. Nunca.»
- **Prompt**: *Un malabarista de chaleco de lentejuelas con siete cuchillos en el aire a la vez formando un círculo sobre él, la cabeza echada atrás mirándolos y los brazos borrosos de velocidad. Cada cuchillo refleja el foco y deja una estela. En primer plano, desenfocadas, las cabezas de los espectadores de la primera fila. Paleta Circo.*

#### `mujer-de-goma`
- **Tipo**: Unidad — Artista · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 oropel
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Acrobacia.
- **Sabor**: «Dicen que no tiene huesos. Tiene. Los lleva en otro orden.»
- **Prompt**: *Una contorsionista pasando el cuerpo entero a través de un aro de latón suspendido que parece demasiado pequeño para ella, con las articulaciones en ángulos que no deberían poder darse, vestida con un maillot verde absenta con lentejuelas. Media figura ya ha pasado y media no. Expresión serena, casi aburrida. El aro se balancea. Paleta Circo.*

#### `tragafuegos`
- **Tipo**: Unidad — Artista · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 oropel
- **ATQ/VID**: 2/3 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Público. Cuando ataca, inflige 1 de daño a las unidades adyacentes a su objetivo.
- **Sabor**: «El truco está en no respirar. El truco está casi siempre en no respirar.»
- **Prompt**: *Un tragafuegos de torso desnudo y pantalón de raya ancha soltando una bola de fuego enorme hacia arriba desde la boca, con la cabeza echada atrás. La llamarada es la única luz de la imagen y le ilumina la cara y el pecho de naranja desde abajo, dejando el resto en negro. Chispas y hollín. Al fondo, el reflejo del fuego en decenas de ojos. Paleta Circo.*

#### `equilibrista`
- **Tipo**: Unidad — Artista · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 oropel
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Acrobacia. No puede ser objetivo de hechizos enemigos mientras no tenga unidades adyacentes.
- **Sabor**: «Allá arriba no hay quien la moleste. Ni red.»
- **Prompt**: *Una funambulista vista desde MUY abajo, caminando por un cable tendido altísimo con una pértiga larga, su silueta recortada contra la cúpula de lona carmesí a rayas iluminada por focos. Debajo de ella, un vacío oscuro sin red donde se adivinan muy pequeñas las gradas. Un pie en el aire. Vértigo puro. Paleta Circo.*

#### `domadora`
- **Tipo**: Unidad — Artista · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 oropel
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al entrar en juego, una unidad enemiga adyacente no puede atacar en su próximo turno.
- **Sabor**: «La silla no es para defenderse. Es para darle cuatro cosas en que pensar a la vez.»
- **Prompt**: *Una domadora de casaca roja con galón dorado y botas altas, de espaldas al espectador, sosteniendo una silla de madera con una mano y el látigo bajado con la otra, frente a un felino enorme agachado y rugiendo a un metro de ella. La fiera ocupa el centro y ella es una silueta negra a contraluz del foco. Serrín levantado. Paleta Circo.*

#### `el-canon-humano`
- **Tipo**: Unidad — Artista · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 oropel
- **ATQ/VID**: 4/2 · **Alcance** 1 · **Movimiento** 4
- **Reglas**: Acrobacia. Impulso.
- **Sabor**: «Cobra por vuelo, no por función.»
- **Prompt**: *Un hombre con casco de cuero y traje plateado de lentejuelas saliendo disparado de la boca de un cañón de feria pintado de carmesí y oro, el cuerpo estirado como una flecha y los brazos pegados, con una bola de humo blanco y una llamarada detrás. Cruza la imagen en diagonal. Confeti y chispas en la estela. Al fondo, la red esperando muy lejos. Paleta Circo.*

#### `los-hermanos-imposibles`
- **Tipo**: Unidad — Artista · **Rareza**: Rara · **Coste**: 1 gen + 2 oropel
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Acrobacia. Cuando esta unidad se mueve, puedes intercambiar la posición de dos unidades aliadas cualesquiera.
- **Sabor**: «Son dos. Puede que sean dos.»
- **Prompt**: *Dos acróbatas idénticos de maillot a rayas verticales en una figura a dos: uno de pie sobre los hombros del otro, los dos con los brazos extendidos en la misma pose exacta y la misma sonrisa. Un espejo alto al fondo los refleja, pero en el reflejo hay TRES. Foco de calcio y negro absoluto alrededor. Paleta Circo.*

#### `el-adivino-de-laton`
- **Tipo**: Unidad — Autómata · **Rareza**: Rara · **Coste**: 1 gen + 2 oropel
- **ATQ/VID**: 2/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al comienzo de tu turno, escruta 2.
- **Sabor**: «Una moneda, una carta. Lleva cuarenta años acertando y nadie le ha dado cuerda.»
- **Prompt**: *Un autómata adivino dentro de una cabina de feria con cristal y madera pintada: busto de cera con turbante, ojos de cristal pintados y una mano articulada de latón suspendida sobre un mazo de cartas. Dentro de la cabina, luz amarilla de bombilla; fuera, negro. La mano está a mitad de un movimiento y el muñeco mira directamente al espectador. Rótulo recargado encima del cristal. Paleta Circo.*

#### `la-mujer-barbuda`
- **Tipo**: Unidad — Prodigio · **Rareza**: Rara · **Coste**: 1 gen + 2 oropel
- **ATQ/VID**: 3/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Público. Mientras tenga dos o más unidades enemigas adyacentes, gana +2 de Vida.
- **Sabor**: «Lleva veinte años cobrando por que la miren. Que miren.»
- **Prompt**: *Retrato de una mujer de barba larga y cuidada, con vestido de terciopelo carmesí, collar de perlas y pose de estudio fotográfico del siglo XIX, sentada muy recta en un sillón y mirando a cámara con una dignidad absoluta y un gesto de desafío sereno. Candilejas iluminándola desde abajo. A un lado, un cartel pintado con su nombre artístico en tipografía recargada. Paleta Circo.*

#### `el-gigante-de-la-compania`
- **Tipo**: Unidad — Prodigio · **Rareza**: Rara · **Coste**: 2 gen + 2 oropel
- **ATQ/VID**: 5/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Público. Perforar.
- **Sabor**: «En el cartel pone tres metros. Son dos y veinte, y sobran.»
- **Prompt**: *Un hombre gigantesco con chaleco de rayas y pantalón corto, agachado para caber en el encuadre, levantando con una sola mano una pesa de feria enorme con la inscripción pintada. Al lado, para dar escala, un mozo de pista que le llega al muslo y le mira. Foco desde arriba que le deja los ojos en sombra. El gesto es amable; el tamaño, no. Paleta Circo.*

#### `el-tigre-de-dos-cabezas`
- **Tipo**: Unidad — Bestia · **Rareza**: Mítica · **Coste**: 2 gen + 2 oropel
- **ATQ/VID**: 5/4 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Acrobacia. Público. Cuando ataca, puede atacar también a una segunda unidad adyacente a él.
- **Sabor**: «Las dos cabezas comen. Solo una duerme.»
- **Prompt**: *Un tigre enorme con dos cabezas saltando a través de un aro en llamas suspendido, las dos cabezas rugiendo en direcciones distintas y el cuerpo estirado en pleno vuelo. El aro de fuego es la fuente de luz y le recorta el pelaje de naranja. Serrín y chispas saltando. Detrás, en la oscuridad, las gradas llenas de ojos. Monstruoso y magnífico, nunca repulsivo. Paleta Circo.*

#### `la-gran-madame-fortunata`
- **Tipo**: Unidad — Prodigio · **Rareza**: Mítica · **Coste**: 3 gen + 2 oropel
- **ATQ/VID**: 4/6 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Público. Al comienzo de tu turno, intercambia la posición de dos unidades enemigas cualesquiera.
- **Sabor**: «No adivina el futuro. Lo coloca.»
- **Prompt**: *Una vidente opulenta cubierta de chales, anillos y collares, sentada ante una mesa redonda con una bola de cristal entre las manos, en una caseta forrada de terciopelo morado. Dentro de la bola se ve, diminuto y nítido, el tablero de una batalla con fichas; y ella está moviendo una con el dedo meñique. La bola es la única luz y le ilumina la cara desde abajo. Paleta Circo.*

---

### 4.3 Hechizos (8)

#### `cambio-de-numero`
- **Tipo**: Hechizo inmediato — Truco · **Rareza**: Común · **Coste**: 1 gen + 0 oropel
- **Reglas**: Intercambia la posición de dos unidades aliadas.
- **Sabor**: «Estaba allí. Ahora está aquí. Es el mismo, se lo prometo.»
- **Prompt**: *Dos cajas de madera pintada idénticas, con rayas y estrellas, una abierta y vacía y otra cerrada, sobre la pista de serrín; entre las dos, un rastro de confeti y una cortina de humo morado disipándose. Unos guantes blancos abandonados en el suelo. Sin figuras. Foco cayendo entre las dos cajas. Paleta Circo.*

#### `aplauso-cerrado`
- **Tipo**: Hechizo inmediato — Truco · **Rareza**: Común · **Coste**: 1 gen + 1 oropel
- **Reglas**: Una unidad aliada gana Público hasta el final del turno y +2 de Ataque.
- **Sabor**: «Lo que mueve a un artista no es el aplauso. Es el silencio de antes.»
- **Prompt**: *Vista desde la pista hacia las gradas: cientos de pares de manos aplaudiendo, desdibujadas por el movimiento, y por encima de ellas filas de caras en penumbra de las que solo se ven los brillos de los ojos y los dientes. El foco viene de detrás del espectador y recorta todo a contraluz. Agobiante y eufórico a la vez. Paleta Circo.*

#### `juego-de-manos`
- **Tipo**: Hechizo inmediato — Truco · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 oropel
- **Reglas**: Roba 2 cartas y después devuelve 1 al fondo de tu mazo.
- **Sabor**: «Elija una carta. No, esa no. Esa.»
- **Prompt**: *Primerísimo plano de dos manos enguantadas de blanco abriendo un mazo de cartas en abanico perfecto en el aire, con media docena de cartas escapándose hacia arriba. Una carta está claramente saliendo de una bocamanga. Fondo negro absoluto, foco duro lateral. Los puños del frac con galón dorado deshilachado. Paleta Circo.*

#### `red-rota`
- **Tipo**: Hechizo inmediato — Truco · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 oropel
- **Reglas**: Una unidad enemiga pierde Volador y recibe 3 de daño.
- **Sabor**: «La red era parte del número. Todo era parte del número.»
- **Prompt**: *Una red de circo rota por el centro, vista desde abajo contra la cúpula de lona iluminada, con los cabos deshilachados colgando y balanceándose, y el agujero del medio perfectamente limpio, como cortado. Ningún cuerpo. Un trapecio vacío oscilando al fondo. El silencio de la imagen es lo que da miedo. Paleta Circo.*

#### `el-numero-del-aro`
- **Tipo**: Hechizo inmediato — Truco · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 oropel
- **Reglas**: Una unidad aliada gana Acrobacia y puede moverse hasta 4 casillas inmediatamente.
- **Sabor**: «Cuanto más estrecho el aro, más alto el precio de la entrada.»
- **Prompt**: *Un aro envuelto en llamas suspendido de cadenas en el centro de la pista, visto de frente y vacío, con el fuego girando alrededor del borde. A través del aro se ve, al otro lado, una parte del circo completamente distinta y mucho más lejana de lo que debería estar. Humo subiendo. Sin figuras. Paleta Circo.*

#### `la-funcion-continua`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 1 gen + 2 oropel
- **Reglas**: Devuelve a la mano hasta dos unidades aliadas destruidas este turno.
- **Sabor**: «Se cayó en la función de tarde. Salió en la de noche.»
- **Prompt**: *Un camerino estrecho y abarrotado visto por la puerta entreabierta: un espejo rodeado de bombillas fundidas y encendidas, tarros de maquillaje abiertos, una peluca en una horma, un traje de lentejuelas colgado con un desgarrón cosido a mano. En el espejo, el reflejo de alguien sentado que no está en la habitación. Luz amarilla de bombilla. Paleta Circo.*

#### `el-gran-escapista`
- **Tipo**: Hechizo inmediato — Truco · **Rareza**: Rara · **Coste**: 1 gen + 1 oropel
- **Reglas**: Una unidad aliada se retira del tablero y vuelve al final de tu siguiente turno en una casilla que elijas de tu mitad.
- **Sabor**: «Treinta cadenas, dos candados y un baúl. Noventa segundos.»
- **Prompt**: *Un baúl de madera reforzado con hierro, cerrado con una cadena enorme y tres candados, sumergido hasta la mitad en un tanque de agua con burbujas subiendo. Encima del tanque, un reloj grande de feria marcando los segundos. A través del cristal, dentro, solo se ven las cadenas flojas y ninguna figura. Luz verdosa del agua. Paleta Circo.*

#### `pasen-y-vean`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Mítica · **Coste**: 2 gen + 2 oropel
- **Reglas**: Todas tus unidades ganan Acrobacia y Público este turno, y pueden moverse inmediatamente.
- **Sabor**: «El número final. No hay otro después.»
- **Prompt**: *La pista entera en plena apoteosis final vista desde arriba: todos los artistas de la compañía en acción al mismo tiempo —acróbatas en el aire, el tragafuegos, el gigante, la fiera saltando, el cañón disparando—, cada uno iluminado por un foco de un color distinto, con confeti y serpentinas cayendo a plomo sobre todo. Caos ordenado y deslumbrante. Paleta Circo.*

---

### 4.4 Estructuras (7)

#### `carromato`
- **Tipo**: Estructura — Vehículo · **Rareza**: Común · **Coste**: 1 gen + 1 oropel · **Resistencia**: 4
- **Reglas**: Tus unidades tienen +1 de Movimiento.
- **Sabor**: «La compañía no tiene casa. Tiene ruedas.»
- **Prompt**: *Una caravana de feria de madera pintada en carmesí y oro con molduras talladas y ventanucos con cortinas, parada de noche en un camino con un farol encendido colgado en la puerta y la escalerilla bajada. Ropa tendida en una cuerda al lado. Un caballo desenganchado comiendo en la oscuridad. Luna. Acogedor y errante. Paleta Circo.*

#### `taquilla`
- **Tipo**: Estructura — Caseta · **Rareza**: Común · **Coste**: 1 gen + 1 oropel · **Resistencia**: 3
- **Reglas**: Al comienzo de tu turno, si tienes una unidad en la mitad del tablero del rival, roba 1 carta.
- **Sabor**: «Entrada general, dos reales. Primera fila, cuatro. Primera fila es peor.»
- **Prompt**: *Una caseta de taquilla de feria, estrecha y altísima, con el ventanuco iluminado desde dentro, rótulos pintados con precios en tipografía recargada y un cartel de ENTRADA colgado torcido. Dentro, una silueta a contraluz detrás del cristal de la que no se distingue la cara. De noche, con el resto del recinto a oscuras. Paleta Circo.*

#### `la-casa-de-los-espejos`
- **Tipo**: Estructura — Atracción · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 oropel · **Resistencia**: 5
- **Reglas**: Las unidades enemigas adyacentes tienen −1 de Ataque.
- **Sabor**: «Dentro hay cuarenta personas y usted es todas.»
- **Prompt**: *Un pasillo de espejos deformantes visto desde dentro, con los reflejos estirándose y encogiéndose hacia el infinito por los dos lados, iluminado por bombillas de colores engarzadas en los marcos. En uno de los reflejos lejanos hay una figura; en los demás, no. Perspectiva vertiginosa. Paleta Circo.*

#### `el-trapecio`
- **Tipo**: Estructura — Aparato · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 oropel · **Resistencia**: 4
- **Reglas**: Tus unidades con Acrobacia tienen +1 de Ataque y +1 de Movimiento.
- **Sabor**: «Dos segundos de vuelo. Lo demás es colgar.»
- **Prompt**: *Dos trapecios vacíos oscilando a distinta altura bajo la cúpula de lona a rayas, vistos desde abajo, con las cuerdas tensas subiendo hasta perderse y las plataformas de madera a los lados. Los focos atraviesan el aire polvoriento en haces cruzados. Nadie en ellos. La expectativa es todo. Paleta Circo.*

#### `la-jaula-central`
- **Tipo**: Estructura — Aparato · **Rareza**: Rara · **Coste**: 1 gen + 2 oropel · **Resistencia**: 6
- **Reglas**: Guardia. Las unidades con Acrobacia pueden atravesarla; las demás, no.
- **Sabor**: «La jaula no es para el tigre. Es para que el público se quede quieto.»
- **Prompt**: *Una jaula circular de barrotes montada en el centro de la pista, vista desde fuera y desde abajo, con los barrotes verticales cruzando toda la imagen y el serrín dentro marcado de zarpazos. Un foco cae dentro del círculo y los barrotes proyectan sombras largas hacia el espectador, como si fuera este el que está encerrado. Vacía. Paleta Circo.*

#### `la-carpa-mayor`
- **Tipo**: Estructura — Carpa · **Rareza**: Rara · **Coste**: 1 gen + 2 oropel · **Resistencia**: 6
- **Reglas**: Tus unidades tienen +1 de Vida. Tus unidades con Público ganan +1 de Ataque adicional.
- **Sabor**: «Dentro caben dos mil personas. Fuera, nadie se acuerda del pueblo.»
- **Prompt**: *Una carpa de circo gigantesca a rayas carmesí y crema vista de noche desde fuera y desde abajo, con las banderolas en los mástiles, el interior iluminado haciendo brillar la lona desde dentro y la cola de gente entrando como una fila de sombras. Alrededor, campo negro y vacío hasta el horizonte. Una luna enorme detrás. Paleta Circo.*

#### `el-contrato`
- **Tipo**: Estructura — Pacto · **Rareza**: Mítica · **Coste**: 2 gen + 2 oropel · **Resistencia**: 5
- **Reglas**: Al comienzo de tu turno, una unidad aliada gana Acrobacia y Público permanentemente. Al final de cada turno, esta estructura pierde 1 de Resistencia.
- **Sabor**: «Todos los de la compañía firmaron lo mismo. Nadie leyó la parte de abajo.»
- **Prompt**: *Primerísimo plano de un contrato antiguo de papel amarillento desplegado sobre terciopelo carmesí, escrito a mano con letra apretadísima y cubierto de firmas de distintas tintas, muchas de ellas temblorosas. En la esquina inferior, el texto se vuelve ilegiblemente pequeño. Una pluma y un tintero al lado, y una gota de tinta roja cayendo. Luz de vela. Sin figuras. Paleta Circo.*

---

## 5. Cómo se juega esta facción

El Circo es la facción más móvil y la más frágil del juego. No defiende: **se
coloca**. Acrobacia le permite llegar a casillas que ninguna otra facción puede
alcanzar, y Público convierte estar rodeado en el mayor pico de daño del
juego — pero con tan poca Vida que cobrar el bono completo suele costar la
pieza al turno siguiente.

El error típico al pilotarla es jugarla como una facción agresiva normal, metiendo
todo adelante. Hay que pensarla como una función: cada unidad hace su número, se
cobra el aplauso y cae. Lo que decide la partida es el **orden** en que salen a
la pista.

La carta que cambia las partidas es `la-gran-madame-fortunata`, que mueve
piezas del rival cada turno: deshace cualquier formación cuidada —y es la peor
pesadilla de los Tercios— mientras los acróbatas pasan por el hueco.

Su punto débil es cualquier facción que pegue fuerte y de lejos. Si no llega a
colocarse, no hace nada, y con 2 de Vida no aguanta un intercambio. Contra
Inmortales también sufre: ahí matar no sirve de nada y el Circo solo sabe
matar.

---

## 6. Checklist de entrega

Nombres de archivo exactos (sin extensión):

```
don-fausto-maestro-de-ceremonias  fuente-circo
mozo-de-pista                     arlequin
el-payaso-triste
malabarista-de-cuchillos          mujer-de-goma
tragafuegos                       equilibrista
domadora                          el-canon-humano
los-hermanos-imposibles           el-adivino-de-laton
la-mujer-barbuda                  el-gigante-de-la-compania
el-tigre-de-dos-cabezas           la-gran-madame-fortunata
cambio-de-numero                  aplauso-cerrado
juego-de-manos                    red-rota
el-numero-del-aro                 la-funcion-continua
el-gran-escapista                 pasen-y-vean
carromato                         taquilla
la-casa-de-los-espejos            el-trapecio
la-jaula-central                  la-carpa-mayor
el-contrato
```

- [ ] 32 ilustraciones (31 cartas + retrato del comandante).
- [ ] Generadas con **ChatGPT**, con la instrucción permanente pegada al principio de la conversación.
- [ ] **Cada archivo nombrado con el id de su carta**, en minúsculas y con guiones.
- [ ] Formato vertical 2:3, mínimo 1024 × 1536.
- [ ] Dejar todo en una carpeta dentro de `tools/art-inbox/`.
- [ ] Revisar que **toda la luz sea artificial y teatral**: focos, candilejas desde abajo, bengalas, farolillos. Si hay luz de día, está mal.
- [ ] Revisar que **ninguna dé asco ni miedo de terror**. Si pasa, es Plaga o Sombra: hay que repetirla. Lo inquietante tiene que venir del exceso, no de la penumbra.
- [ ] Revisar que aparezcan **carteles y rótulos** con tipografía circense, aunque sean de fondo.
- [ ] Revisar que, donde quepa, haya **gradas con ojos mirando** en la oscuridad del fondo.
