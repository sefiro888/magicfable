# Facción nueva · LOS INMORTALES — «Los Diez Mil»

Dosier completo: identidad, mecánica propia, comandante y **31 cartas** con su
prompt de arte. Mismo flujo que los anteriores: tú generas las ilustraciones,
yo doy de alta las cartas.

---

## ⚠️ ANTES DE GENERAR NADA: cómo se nombran los archivos

Esto no es un detalle. Con la facción Enjambre llegaron 32 imágenes llamadas
`exec-a1bf5c0b-1143-4804-880e-d4165a525c96.png` y hubo que identificarlas una
a una mirándolas, porque el PNG no traía metadatos y todas tenían la misma
hora. Se perdió una tarde y aun así aparecieron dos repetidas y dos que
faltaban.

**Cada imagen tiene que guardarse con el identificador de su carta, tal cual:**

```
portador-de-manzana.png
arquero-de-susa.png
fuente-inmortales.png
```

En minúsculas, con guiones, sin acentos y sin números de serie. El
identificador va en el encabezado de cada ficha, entre comillas inclinadas.

Formato: PNG o JPG, **vertical**, mínimo 1024 × 1536. El importador se encarga
del recorte y del WebP.

---

## 1. Por qué esta facción y en qué se diferencia

Heródoto cuenta que el cuerpo de élite persa se llamaba «los Inmortales»
porque se mantenía siempre en diez mil hombres exactos: en cuanto uno caía o
enfermaba, otro ocupaba su puesto **de inmediato**, y la formación nunca
parecía menguar. Para el enemigo era desesperante — mataban y el muro seguía
igual de largo.

Eso es toda la facción. No pega más fuerte que nadie ni cura: **no se rompe**.

Frente a las dieciséis actuales: Orden defiende con escudos y muros, pero una
vez caen, cayeron. Samsara vuelve de la muerte, sí, pero dando un rodeo por el
cementerio y volviendo **distinta**, más grande. Los Inmortales vuelven en el
acto, en la misma casilla, exactamente iguales que antes. No es una facción
que crezca: es una que **no cede terreno**.

La segunda seña es el arco. El ejército persa se recordaba por la arquería
masiva —«las flechas taparán el sol»—, así que esta facción pelea de lejos y
con muchos tiros a la vez, no a espadazos.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (lapislázuli, lana teñida) | `#1f4e8c` |
| Luz (oro de Persépolis, marfil) | `#e8b93f`, `#f2e4c4` |
| Sombra (betún, cedro quemado) | `#141118` |
| Acento (ladrillo vidriado, carmín) | `#3fa89a`, `#b5343c` |

**Materiales**: ladrillo vidriado de colores, oro repujado, lapislázuli,
madera de cedro, mimbre trenzado, lana de tintes saturados, cuero tachonado,
bronce.

**Formas**: columnas acanaladas rematadas en **doble toro** afrontado, escaleras
con relieves de portadores de tributo, el disco alado, gorros blandos de fieltro,
barbas rizadas en bucles geométricos, pantalones (sí: los persas llevaban
pantalones y los griegos se burlaban), carcaj combinado con funda de arco.

**El detalle que lo identifica todo**: los Inmortales llevaban el regatón de la
lanza rematado en una **granada o manzana de oro** — por eso los griegos los
llamaban «los portadores de manzana». Esa bola dorada al final del asta tiene
que salir en todas las lanzas que se vean. Es la firma de la facción.

**Cuidado con Duna**: Duna también es desierto y piedra, pero es una
necrópolis — ocre pálido, arena, tumbas, un tribunal que juzga muertos. Esto es
un **imperio vivo y riquísimo**: azul saturado, oro, jardines regados, color por
todas partes. Si una ilustración sale color arena, está mal.

**Cuidado con Olimpo**: nada de mármol blanco ni cascos corintios. Aquí no hay
desnudos heroicos: todo el mundo va vestido, con tela gruesa y estampada.

---

## 2. La mecánica propia: RELEVO

> **Relevo** — Cuando esta unidad es destruida, vuelve inmediatamente a la misma
> casilla con sus estadísticas base. Solo una vez.

Tres decisiones que importan y conviene no cambiar sin pensarlo:

**Vuelve YA, no al turno siguiente.** Si volviera después, sería una facción de
recuperación y se parecería a Samsara. Volviendo en el acto, el rival siente que
no ha conseguido nada, que es justo la sensación histórica.

**Vuelve con las estadísticas BASE.** Pierde todas las mejoras que llevara
encima. Esto es lo que impide que la facción se vuelva una bola de nieve: el
Relevo conserva el tablero, no lo engorda.

**Solo una vez por pieza.** Sin ese tope, matar sería imposible y la partida no
acabaría nunca. Con el tope, el rival sabe que cada Inmortal cuesta dos muertes
y puede planificar.

El efecto de todo junto: contra esta facción **el combate rinde la mitad**. El
rival tiene que gastar el doble para abrir hueco, y mientras tanto los arqueros
siguen disparando.

> Nota técnica: Relevo es una pasiva al morir, con marca en la pieza para no
> repetirse. El motor ya tiene disparadores de muerte (`revive-on-death` de
> Samsara) y el campo `renacerSpent` como precedente. Lo implemento yo.

---

## 3. El comandante

### `jerjes-rey-de-reyes`
- **Nombre**: Jerjes · **Título**: Rey de Reyes · **Facción**: Inmortales
- **Vida del Nexo**: 35
- **Pasiva**: La primera unidad aliada que sea destruida cada turno vuelve con Relevo aunque no lo tuviera.
- **Poder (una vez por partida, 2 genérico + 1 lapislázuli)**: «Las flechas taparán el sol» — inflige 2 de daño a todas las unidades enemigas y tus unidades a distancia pueden volver a atacar este turno.
- **Sabor**: «Cuento mis ejércitos por naciones, no por hombres.»
- **Prompt de retrato**: *Retrato en tres cuartos de un rey persa aqueménida sentado en un trono elevado, barba larga rizada en bucles geométricos y trenzada con hilo de oro, corona cilíndrica almenada, túnica azul lapislázuli bordada en oro con motivos de leones, una mano apoyada en un cetro largo y la otra en el reposabrazos. Detrás, un parasol sostenido por un sirviente y relieves de piedra de portadores de tributo. Expresión de aburrimiento imperial, no de ira. Iluminación cálida de antorchas sobre el oro. Paleta Inmortales: lapislázuli, oro, marfil, carmín.*

---

## 4. Las 31 cartas

**19 de 31 funcionan con lo que ya existe**; 12 usan Relevo, que es lo que
estrena la facción.

---

### 4.1 Fuente

#### `fuente-inmortales`
- **Nombre**: Fuente de los Inmortales · **Tipo**: Esencia — Fuente · **Rareza**: Común
- **Coste**: 0 · **Reglas**: Agota esta fuente: genera 1 de Esencia de Lapislázuli.
- **Sabor**: «La piedra azul viene de las montañas del este. El imperio también.»
- **Prompt**: *Un bloque de lapislázuli en bruto partido por la mitad sobre un paño de lana roja, con las vetas doradas de pirita brillando dentro y polvo azul intenso alrededor. Herramientas de bronce a un lado. Sin figuras, composición vertical centrada, luz lateral cálida. Paleta Inmortales.*

---

### 4.2 Unidades (15)

#### `portador-de-manzana`
- **Tipo**: Unidad — Inmortal · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Relevo.
- **Sabor**: «Lo mataron en Maratón. Sigue aquí.»
- **Prompt**: *Un guerrero inmortal persa de pie en posición de guardia, túnica larga de lana estampada en rombos azules y amarillos, gorro blando de fieltro cubriéndole la boca, barba rizada, escudo de mimbre trenzado en una mano y lanza en la otra con una GRANADA DE ORO en el extremo inferior del asta. Fondo de muro de ladrillo vidriado con la silueta de otros iguales. Paleta Inmortales.*

#### `arquero-de-susa`
- **Tipo**: Unidad — Arquero · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/2 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: —
- **Sabor**: «No apunta a un hombre. Apunta al sitio donde habrá hombres.»
- **Prompt**: *Un arquero persa en el momento de soltar la cuerda, arco compuesto curvado, carcaj combinado con funda colgado a la cadera, túnica corta sobre pantalones estampados, gorro de fieltro. Vista de perfil con el brazo extendido. Al fondo, decenas de flechas ya en el aire formando una curva. Paleta Inmortales.*

#### `escudero-de-mimbre`
- **Tipo**: Unidad — Inmortal · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 1/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «El muro no es de piedra. Por eso se mueve.»
- **Prompt**: *Un soldado persa arrodillado tras un escudo enorme de mimbre trenzado (spara) clavado en el suelo, casi tan alto como él, mirando por encima del borde. Detalle del trenzado del mimbre y de las ataduras de cuero. Varias flechas enemigas clavadas en el escudo. Paleta Inmortales.*

#### `hondero-de-caria`
- **Tipo**: Unidad — Mercenario · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/2 · **Alcance** 2 · **Movimiento** 2
- **Reglas**: —
- **Sabor**: «El imperio no le pide lealtad. Le paga.»
- **Prompt**: *Un hondero de aspecto extranjero, piel curtida y ropa más sencilla que la persa, haciendo girar la honda por encima de la cabeza con el brazo desenfocado por la velocidad. Bolsa de proyectiles de plomo a la cintura. Paisaje seco con colinas al fondo. Paleta Inmortales con tonos más terrosos.*

#### `lancero-de-persepolis`
- **Tipo**: Unidad — Inmortal · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Relevo.
- **Sabor**: «Hay un hueco en la escalera donde debería estar. Nunca lo hay.»
- **Prompt**: *Un guardia inmortal de pie e inmóvil ante una gran escalinata de piedra tallada con relieves de portadores de tributo, lanza vertical con la granada de oro apoyada en el suelo, mirada al frente. Composición muy simétrica y solemne. Luz de atardecer rasante sobre la piedra. Paleta Inmortales.*

#### `jinete-de-nisea`
- **Tipo**: Unidad — Jinete · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Impulso.
- **Sabor**: «Los caballos de Nisea no se venden. Se regalan a quien conviene.»
- **Prompt**: *Un jinete persa al galope sobre un caballo grande y poderoso de la llanura de Nisea, gualdrapa bordada en rojo y oro cubriendo los flancos, el jinete inclinado hacia delante con una jabalina. Polvo levantándose. Movimiento y energía. Paleta Inmortales.*

#### `arquero-a-caballo`
- **Tipo**: Unidad — Jinete · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 lapislázuli
- **ATQ/VID**: 2/3 · **Alcance** 2 · **Movimiento** 2
- **Reglas**: —
- **Sabor**: «Dispara mientras se retira. Esa es la idea.»
- **Prompt**: *Un arquero a caballo girado sobre la grupa disparando hacia atrás mientras el caballo huye hacia delante (el disparo parto). Torsión del cuerpo muy marcada, arco tensado. Fondo de llanura polvorienta. Paleta Inmortales.*

#### `inmortal-veterano`
- **Tipo**: Unidad — Inmortal · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 lapislázuli
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Relevo.
- **Sabor**: «Treinta años en la fila. Nadie recuerda su cara.»
- **Prompt**: *Un inmortal de más edad, barba canosa rizada, túnica gastada con remiendos cuidados, escudo de mimbre reparado varias veces con cuero nuevo. Postura relajada de quien ha hecho esto mil veces. Retrato de medio cuerpo, luz suave. Paleta Inmortales.*

#### `portaestandarte-real`
- **Tipo**: Unidad — Inmortal · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Cuando ataca, tus otras unidades adyacentes ganan +1 de Ataque.
- **Sabor**: «Mientras se vea el disco, nadie corre.»
- **Prompt**: *Un soldado persa sosteniendo en alto un estandarte con el disco alado del faravahar en oro sobre tela púrpura, el asta larga apoyada en un soporte del cinturón. Viento moviendo la tela. Contrapicado para que el estandarte domine la imagen. Paleta Inmortales.*

#### `satrapa-de-lidia`
- **Tipo**: Unidad — Noble · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli
- **ATQ/VID**: 2/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al comienzo de tu turno, escruta 1.
- **Sabor**: «Gobierna una provincia más rica que su rey. No lo menciona.»
- **Prompt**: *Un gobernador persa de edad madura con túnica suntuosa de seda bordada y collar de oro con cabezas de león, sentado en una silla plegable de bronce, revisando una tablilla que le tiende un escriba arrodillado. Interior palaciego con cortinas pesadas. Paleta Inmortales con mucho oro.*

#### `maestro-de-correos`
- **Tipo**: Unidad — Mensajero · **Rareza**: Rara · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 1/3 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Al entrar en juego, roba 1 carta.
- **Sabor**: «Ni la nieve, ni la lluvia, ni el calor, ni la noche los detienen.»
- **Prompt**: *Un mensajero persa entregando un rollo sellado a otro que ya está montado y a punto de salir, en una posta del camino real al amanecer. Caballos de refresco atados detrás. Sensación de relevo y prisa. Paleta Inmortales.*

#### `guardia-de-la-puerta`
- **Tipo**: Unidad — Inmortal · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli
- **ATQ/VID**: 2/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Relevo.
- **Sabor**: «Pasa quien trae tributo. Los demás esperan.»
- **Prompt**: *Un inmortal enorme plantado bajo un arco monumental de piedra flanqueado por dos toros alados colosales, lanza cruzada cerrando el paso. Vista frontal, escala imponente, el guardia pequeño frente a la arquitectura pero inamovible. Paleta Inmortales.*

#### `general-de-los-diez-mil`
- **Tipo**: Unidad — Inmortal · **Rareza**: Rara · **Coste**: 2 gen + 2 lapislázuli
- **ATQ/VID**: 4/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al entrar en juego, una unidad aliada gana Relevo.
- **Sabor**: «No manda a diez mil. Manda a uno, diez mil veces.»
- **Prompt**: *Un comandante persa de espaldas al espectador, con manto largo bordado, revisando una formación de inmortales perfectamente alineada que se pierde en la distancia. Solo se le ve el perfil al girar la cabeza. Composición de profundidad extrema. Paleta Inmortales.*

#### `elefante-de-india`
- **Tipo**: Unidad — Bestia · **Rareza**: Rara · **Coste**: 2 gen + 2 lapislázuli
- **ATQ/VID**: 5/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Perforar.
- **Sabor**: «Llegó con el tributo del este. Nadie preguntó cómo cruzó las montañas.»
- **Prompt**: *Un elefante de guerra indio con la frente cubierta por una placa de bronce decorada, colmillos rematados en puntas metálicas, torreta de madera en el lomo con dos arqueros. Visto en tres cuartos avanzando. Polvo y tela colorida colgando de los flancos. Paleta Inmortales.*

#### `inmortal-sin-nombre`
- **Tipo**: Unidad — Inmortal · **Rareza**: Mítica · **Coste**: 3 gen + 2 lapislázuli
- **ATQ/VID**: 5/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Relevo. Cuando vuelve por Relevo, inflige 2 de daño a todas las unidades enemigas adyacentes.
- **Sabor**: «Preguntaron su nombre para el informe de bajas. Dijo: el mismo de ayer.»
- **Prompt**: *Un inmortal visto de frente con el rostro completamente en sombra bajo el gorro de fieltro, de pie entre los cuerpos de otros idénticos a él, la lanza con la granada dorada aún en alto. Atmósfera de polvo y luz baja. Inquietante sin ser macabro: no hay sangre, solo repetición. Paleta Inmortales.*

#### `heraldo-del-rey-de-reyes`
- **Tipo**: Unidad — Mensajero · **Rareza**: Mítica · **Coste**: 2 gen + 2 lapislázuli
- **ATQ/VID**: 3/6 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Al comienzo de tu turno, la unidad aliada con menos Vida gana Relevo.
- **Sabor**: «Habla con la voz del rey. Literalmente: no tiene otra.»
- **Prompt**: *Un heraldo persa de pie sobre un pedestal con los brazos abiertos proclamando, túnica blanca con ribetes de oro, el disco alado bordado en el pecho. A sus pies, soldados escuchando de rodillas. Luz cenital teatral. Paleta Inmortales.*

---

### 4.3 Hechizos (8)

#### `lluvia-de-flechas`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Inflige 2 de daño a todas las unidades enemigas.
- **Sabor**: «Entonces lucharemos a la sombra.»
- **Prompt**: *Miles de flechas en el aire vistas desde abajo, oscureciendo el cielo, con la luz del sol filtrándose entre ellas. Sin figuras humanas, solo el enjambre de astas y plumas. Escala apocalíptica. Paleta Inmortales.*

#### `relevo-inmediato`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Común · **Coste**: 1 gen + 0 lapislázuli
- **Reglas**: Una unidad aliada gana Relevo.
- **Sabor**: «Siguiente.»
- **Prompt**: *Primer plano de dos manos en el momento exacto del relevo: una suelta una lanza con granada dorada y otra la recoge, sin que el arma llegue a tocar el suelo. Fondo desenfocado de formación militar. Paleta Inmortales.*

#### `tributo-de-las-satrapias`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Roba 2 cartas.
- **Sabor**: «Veinte provincias, veinte regalos, un solo destinatario.»
- **Prompt**: *Una fila de portadores de tributo de distintos pueblos subiendo una escalinata, cada uno con una ofrenda diferente: un carnero, un cuenco de oro, un rollo de tela, un colmillo de marfil. Vistos de perfil como en un relieve de piedra, pero pintados a todo color. Paleta Inmortales.*

#### `muro-de-mimbre`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Todas tus unidades ganan un escudo de 2.
- **Sabor**: «Primero la pared. Después se discute.»
- **Prompt**: *Una línea de escudos de mimbre encajándose unos con otros vista desde el lado, formando una pared continua, con las lanzas asomando por los huecos. Detalle del trenzado. Polvo a ras de suelo. Paleta Inmortales.*

#### `fuego-que-no-se-apaga`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Inflige 4 de daño a una unidad enemiga.
- **Sabor**: «Lo trajeron encendido desde el primer templo. Nunca ha dejado de arder.»
- **Prompt**: *Un brasero ritual de bronce sobre un pedestal escalonado con una llama alta y muy limpia, y un sacerdote con la boca cubierta por un paño blanco alimentándola con ramas de leño perfumado. Interior en penumbra, la llama como única fuente de luz. Paleta Inmortales.*

#### `decreto-inmutable`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Rara · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Una unidad enemiga no puede atacar ni moverse en su próximo turno.
- **Sabor**: «Ley de medos y persas: lo escrito no se deroga. Ni por quien lo escribió.»
- **Prompt**: *Un cilindro-sello de piedra rodando sobre arcilla fresca y dejando impresa una fila de figuras y escritura cuneiforme. Primer plano macro, manos de escriba al borde del encuadre. La arcilla aún húmeda brillando. Paleta Inmortales.*

#### `camino-de-regreso`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli
- **Reglas**: Devuelve a la mano una unidad aliada destruida este turno.
- **Sabor**: «El imperio no pierde hombres. Los traslada.»
- **Prompt**: *Un camino empedrado recto que se pierde en el horizonte entre montañas secas, con mojones de piedra a los lados y una columna de polvo lejana de alguien que vuelve. Sin figuras en primer plano. Atardecer. Paleta Inmortales.*

#### `las-flechas-taparan-el-sol`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Mítica · **Coste**: 2 gen + 2 lapislázuli
- **Reglas**: Inflige 3 de daño a todas las unidades enemigas. Tus unidades con Relevo que mueran este turno vuelven aunque ya lo hubieran gastado.
- **Sabor**: «Nuestras flechas taparán el sol. — Entonces lucharemos a la sombra.»
- **Prompt**: *Un campo de batalla entero bajo una sombra antinatural, con el cielo cubierto de flechas descendentes y el sol reducido a un disco pálido tras ellas. Dos ejércitos minúsculos abajo para dar escala. Épico y sombrío. Paleta Inmortales.*

---

### 4.4 Estructuras (7)

#### `puerta-de-todas-las-naciones`
- **Tipo**: Estructura — Puerta · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli · **Resistencia**: 5
- **Reglas**: Guardia.
- **Sabor**: «Entran todos. Salen los que el rey decide.»
- **Prompt**: *Un pórtico monumental de piedra flanqueado por dos toros alados con cabeza humana barbada, con el dintel aún en pie y el cielo visible por el hueco. Sin figuras. Luz rasante marcando los relieves. Paleta Inmortales.*

#### `camino-real`
- **Tipo**: Estructura — Vía · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli · **Resistencia**: 4
- **Reglas**: Tus unidades tienen +1 de Movimiento.
- **Sabor**: «Dos mil setecientos kilómetros. Siete días a caballo.»
- **Prompt**: *Un tramo de calzada antigua perfectamente conservada cruzando un paisaje árido, con postas de piedra a intervalos regulares y la vía perdiéndose en la distancia. Sin figuras. Vista elevada. Paleta Inmortales.*

#### `altar-del-fuego`
- **Tipo**: Estructura — Altar · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli · **Resistencia**: 4
- **Reglas**: Al comienzo de tu turno, cura 1 a tu Nexo.
- **Sabor**: «Mientras arda, el mundo sigue en orden.»
- **Prompt**: *Dos altares de fuego de piedra tallada en lo alto de una colina rocosa, uno encendido y otro apagado, recortados contra un cielo limpio del amanecer. Sin figuras. Simetría y soledad. Paleta Inmortales.*

#### `jardin-cerrado`
- **Tipo**: Estructura — Jardín · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli · **Resistencia**: 5
- **Reglas**: Al comienzo de tu turno, una unidad aliada dañada recupera 1 de Vida.
- **Sabor**: «De aquí viene la palabra paraíso: un sitio con tapia y agua.»
- **Prompt**: *Un jardín persa amurallado visto desde arriba, con canales de agua rectos cruzándose en el centro, cipreses alineados, granados en flor y un pabellón pequeño. Geometría perfecta en medio de un desierto que se adivina fuera. Sin figuras. Paleta Inmortales con verdes intensos.*

#### `friso-de-los-inmortales`
- **Tipo**: Estructura — Relieve · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli · **Resistencia**: 6
- **Reglas**: Tus unidades con Relevo vuelven con +1/+1.
- **Sabor**: «Los contaron al pintarlos. Siguen saliendo más.»
- **Prompt**: *Un friso de ladrillo vidriado de colores mostrando una fila de guerreros inmortales idénticos en marcha, de perfil, con lanzas y arcos, sobre fondo azul intenso. Los ladrillos brillantes y algunos desconchados por el tiempo. Sin perspectiva: plano como el original. Paleta Inmortales.*

#### `salon-de-las-cien-columnas`
- **Tipo**: Estructura — Salón · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli · **Resistencia**: 7
- **Reglas**: Guardia. Tus unidades adyacentes tienen +1 de Vida.
- **Sabor**: «Cien columnas para que nadie dude de cuántas provincias hay.»
- **Prompt**: *El interior de una sala hipóstila enorme con columnas acanaladas rematadas en capiteles de doble toro afrontado, repitiéndose hasta perderse en la penumbra. Rayos de luz entrando desde arriba. Sin figuras, escala aplastante. Paleta Inmortales.*

#### `arsenal-de-susa`
- **Tipo**: Estructura — Arsenal · **Rareza**: Mítica · **Coste**: 2 gen + 2 lapislázuli · **Resistencia**: 6
- **Reglas**: Al comienzo de tu turno, una unidad aliada sin Relevo lo gana.
- **Sabor**: «Hay armadura para cada hombre que vendrá. Y para el que venga después.»
- **Prompt**: *El interior de un almacén militar inmenso con estanterías de madera repletas de escudos de mimbre, haces de lanzas con el regatón dorado y túnicas dobladas, ordenadas en filas que se pierden al fondo. Un solo escriba minúsculo haciendo inventario. Paleta Inmortales.*

---

## 5. Cómo se juega esta facción

Los Inmortales no buscan matar: buscan **no morir**. La curva es sólida y poco
espectacular — aguantas, disparas, y dejas que el rival se desangre intentando
abrir hueco en una línea que se repone sola.

El error típico al pilotarla es gastar el Relevo demasiado pronto, metiendo una
unidad en un combate que no hacía falta. Cada Relevo es una segunda vida: hay
que perderla cuando duela al rival, no cuando dé igual.

La carta que cambia las partidas es el `arsenal-de-susa`, que convierte la
pasiva en un goteo constante. Si el rival lo deja en pie tres turnos, ya no hay
forma de limpiar el tablero.

Su punto débil es la prisa: no tiene forma de acelerar. Contra una facción que
corra mucho —Furia, Bestiario— puede quedarse atrás aunque nunca pierda una
pieza, así que necesita a los jinetes para no ceder el centro.

---

## 6. Checklist de entrega

- [ ] 32 ilustraciones (31 cartas + retrato del comandante).
- [ ] **Cada archivo nombrado con el id de su carta**, en minúsculas y con guiones: `portador-de-manzana.png`, `fuente-inmortales.png`, etc. Nada de nombres automáticos.
- [ ] Formato vertical, mínimo 1024 × 1536, PNG o JPG.
- [ ] Dejar todo en una carpeta dentro de `tools/art-inbox/`.
- [ ] Revisar que ninguna salga color arena: si parece Duna, repetirla.
- [ ] Revisar que en toda lanza visible esté la **granada de oro** del regatón.
