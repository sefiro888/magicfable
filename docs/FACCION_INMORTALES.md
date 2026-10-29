# Facción nueva · LOS INMORTALES — «Los Diez Mil»

Dosier completo: identidad, mecánica propia, comandante y **31 cartas** con su
prompt de arte.

---

## 0. CÓMO GENERAR EL ARTE

### Qué generador usar

**ChatGPT.** Se probó en paralelo con Gemini y no hay color: con los mismos
prompts, ChatGPT devuelve el lapislázuli saturado, el bordado denso y poses con
energía, mientras que Gemini se atasca en gris, plano medio y composiciones
repetidas, e **ignora las instrucciones de cámara** aunque se las repitas.

### Instrucción permanente — pégala UNA VEZ al empezar la conversación

Antes de pedir la primera ilustración, pega esto. Luego ya solo hay que ir
pasando los prompts de una en una.

> A partir de ahora voy a pedirte una serie de ilustraciones para cartas de un
> juego de fantasía. Todas comparten esta dirección artística y **no quiero que
> la cambies entre una y otra**:
>
> Luz de atardecer muy bajo o de incendio lejano, cálida y rasante, con sombras
> largas en AZUL PROFUNDO. Cielo encendido en ámbar y violeta, nunca azul de
> mediodía, nunca gris. Aire con polvo en suspensión y partículas de luz.
> Contraste alto, colores saturados, zonas oscuras de verdad. Paleta dominante:
> azul lapislázuli intenso y oro, con rojo carmín de acento.
>
> Composición cinematográfica, **formato vertical 2:3**, mínimo 1024 × 1536.
> Arte de carta de fantasía, no ilustración de libro de historia.

### Cómo se nombran los archivos

**Cada imagen se guarda con el identificador de su carta, tal cual:**

```
portador-de-manzana.png
arquero-de-susa.png
fuente-inmortales.png
```

Minúsculas, guiones, sin acentos, sin números de serie. El identificador está
en el encabezado de cada ficha, entre comillas inclinadas.

Con la facción Enjambre llegaron 32 imágenes llamadas `exec-a1bf5c0b-1143.png`
y hubo que identificarlas una a una mirándolas, porque el PNG no traía
metadatos y todas tenían la misma hora. Se perdió una tarde y aun así
aparecieron dos repetidas y dos que faltaban.

### Ya ilustradas — NO repetir

- `jerjes-rey-de-reyes`
- `fuente-inmortales`
- `portador-de-manzana`

---

## 1. Por qué esta facción y en qué se diferencia

Heródoto cuenta que el cuerpo de élite persa se llamaba «los Inmortales» porque
se mantenía siempre en diez mil hombres exactos: en cuanto uno caía o enfermaba,
otro ocupaba su puesto **de inmediato**, y la formación nunca parecía menguar.
Para el enemigo era desesperante — mataban y el muro seguía igual de largo.

Eso es toda la facción. No pega más fuerte que nadie ni cura: **no se rompe**.

Frente a las dieciséis actuales: Orden defiende con escudos y muros, pero una
vez caen, cayeron. Samsara vuelve de la muerte, sí, pero dando un rodeo por el
cementerio y volviendo **distinta**, más grande. Los Inmortales vuelven en el
acto, en la misma casilla, exactamente iguales que antes. No es una facción que
crezca: es una que **no cede terreno**.

La segunda seña es el arco. El ejército persa se recordaba por la arquería
masiva —«las flechas taparán el sol»—, así que esta facción pelea de lejos y con
muchos tiros a la vez, no a espadazos.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (lapislázuli, lana teñida) | `#1f4e8c` |
| Luz (oro de Persépolis, marfil) | `#e8b93f`, `#f2e4c4` |
| Sombra (betún, cedro quemado) | `#141118` |
| Acento (ladrillo vidriado, carmín) | `#3fa89a`, `#b5343c` |

**Materiales**: ladrillo vidriado de colores, oro repujado, lapislázuli, cedro,
mimbre trenzado, lana de tintes saturados, cuero tachonado, bronce.

**Formas**: columnas acanaladas rematadas en **doble toro** afrontado, escaleras
con relieves de portadores de tributo, el disco alado, gorros blandos de fieltro,
barbas rizadas en bucles geométricos, pantalones estampados, carcaj combinado
con funda de arco.

**El detalle que lo identifica todo**: los Inmortales llevaban el regatón de la
lanza rematado en una **granada o manzana de oro** — por eso los griegos los
llamaban «los portadores de manzana». Esa bola dorada al final del asta tiene que
salir en todas las lanzas que se vean.

**El truco que mejor funciona**: meter en el fondo **al mismo hombre repetido** —
marchando en la misma postura exacta, o pintado en el friso de ladrillo del muro.
Cuenta la mecánica de la facción dentro de la propia imagen, sin explicarla.

**Cuidado con Duna**: Duna también es desierto y piedra, pero es una necrópolis —
ocre pálido, arena, tumbas. Esto es un **imperio vivo y riquísimo**: azul
saturado, oro, jardines regados. Si una ilustración sale color arena, está mal.

**Cuidado con Olimpo**: nada de mármol blanco ni cascos corintios. Aquí no hay
desnudos heroicos: todo el mundo va vestido, con tela gruesa y estampada.

---

## 2. La mecánica propia: RELEVO

> **Relevo** — Cuando esta unidad es destruida, vuelve inmediatamente a la misma
> casilla con sus estadísticas base. Solo una vez.

Tres decisiones que importan y conviene no cambiar sin pensarlo:

**Vuelve YA, no al turno siguiente.** Si volviera después sería una facción de
recuperación y se parecería a Samsara. Volviendo en el acto, el rival siente que
no ha conseguido nada, que es justo la sensación histórica.

**Vuelve con las estadísticas BASE.** Pierde las mejoras que llevara encima. Eso
impide que la facción se vuelva una bola de nieve: el Relevo conserva el
tablero, no lo engorda.

**Solo una vez por pieza.** Sin ese tope, matar sería imposible y la partida no
acabaría nunca. Con el tope, el rival sabe que cada Inmortal cuesta dos muertes
y puede planificar.

El efecto de todo junto: contra esta facción **el combate rinde la mitad**.

> Nota técnica: Relevo es una pasiva al morir, con marca en la pieza para no
> repetirse. El motor ya tiene disparadores de muerte (`revive-on-death` de
> Samsara) y el campo `renacerSpent` como precedente. Lo implemento yo.

---

## 3. El comandante

### `jerjes-rey-de-reyes` — ✅ YA ILUSTRADO
- **Nombre**: Jerjes · **Título**: Rey de Reyes · **Facción**: Inmortales
- **Vida del Nexo**: 35
- **Pasiva**: La primera unidad aliada que sea destruida cada turno vuelve con Relevo aunque no lo tuviera.
- **Poder (una vez por partida, 2 genérico + 1 lapislázuli)**: «Las flechas taparán el sol» — inflige 2 de daño a todas las unidades enemigas y tus unidades a distancia pueden volver a atacar este turno.
- **Sabor**: «Cuento mis ejércitos por naciones, no por hombres.»

---

## 4. Las 31 cartas

---

### 4.1 Fuente

#### `fuente-inmortales` — ✅ YA ILUSTRADA
- **Nombre**: Fuente de los Inmortales · **Tipo**: Esencia — Fuente · **Rareza**: Común
- **Coste**: 0 · **Reglas**: Agota esta fuente: genera 1 de Esencia de Lapislázuli.
- **Sabor**: «La piedra azul viene de las montañas del este. El imperio también.»

---

### 4.2 Unidades (15)

#### `portador-de-manzana` — ✅ YA ILUSTRADO
- **Tipo**: Unidad — Inmortal · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Relevo.
- **Sabor**: «Lo mataron en Maratón. Sigue aquí.»

#### `arquero-de-susa`
- **Tipo**: Unidad — Arquero · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/2 · **Alcance** 2 · **Movimiento** 1
- **Sabor**: «No apunta a un hombre. Apunta al sitio donde habrá hombres.»
- **Prompt**: *Un arquero persa en lo alto de una muralla de ladrillo vidriado azul y oro, de perfil, en el instante exacto en que suelta la cuerda del arco compuesto. Carcaj combinado con funda colgado a la cadera, túnica azul lapislázuli bordada con un león alado dorado. El cielo del atardecer está cruzado por cientos de flechas describiendo la misma curva. A su lado, más arqueros en la postura idéntica, difuminados por el polvo dorado.*

#### `escudero-de-mimbre`
- **Tipo**: Unidad — Inmortal · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 1/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «El muro no es de piedra. Por eso se mueve.»
- **Prompt**: *Primer plano bajo de un soldado persa arrodillado tras un escudo enorme de mimbre trenzado clavado en el suelo, casi tan alto como él, asomando solo los ojos por encima del borde. Varias flechas enemigas clavadas en el mimbre, todavía vibrando. El escudo ocupa media imagen y se ve el trenzado al detalle, recortado contra un horizonte en llamas. A los lados, la misma escena repetida formando una pared continua que se pierde en el humo.*

#### `hondero-de-caria`
- **Tipo**: Unidad — Mercenario · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/2 · **Alcance** 2 · **Movimiento** 2
- **Sabor**: «El imperio no le pide lealtad. Le paga.»
- **Prompt**: *Un hondero extranjero de piel curtida y ropa basta de lino crudo con ribetes azules, en plena torsión del cuerpo, haciendo girar la honda sobre la cabeza con el brazo desdibujado por la velocidad. Bolsa de proyectiles de plomo abierta en la cadera. Está en una ladera rocosa y abajo, muy lejos, se ve el campamento imperial lleno de hogueras y estandartes. Contraste entre su ropa pobre y el lujo azul y oro del fondo.*

#### `lancero-de-persepolis`
- **Tipo**: Unidad — Inmortal · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Relevo.
- **Sabor**: «Hay un hueco en la escalera donde debería estar. Nunca lo hay.»
- **Prompt**: *Un guardia inmortal inmóvil al pie de una escalinata monumental de piedra tallada con relieves de portadores de tributo, la lanza vertical con la granada de oro apoyada en el escalón. Antorchas encendidas a intervalos subiendo la escalera hacia la oscuridad. En el relieve de la pared, a su espalda, está tallado un guardia idéntico a él en la misma postura. Composición muy simétrica y solemne.*

#### `jinete-de-nisea`
- **Tipo**: Unidad — Jinete · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 3/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Impulso.
- **Sabor**: «Los caballos de Nisea no se venden. Se regalan a quien conviene.»
- **Prompt**: *Un jinete persa al galope tendido sobre un caballo enorme y poderoso, visto casi desde el suelo de modo que caballo y jinete se recortan contra el cielo encendido. Gualdrapa bordada en carmín y oro ondeando, el jinete inclinado hacia delante con la jabalina echada atrás. Terrones y polvo dorado saltando bajo los cascos. Detrás, la silueta de más jinetes en la misma carga.*

#### `arquero-a-caballo`
- **Tipo**: Unidad — Jinete · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 lapislázuli
- **ATQ/VID**: 2/3 · **Alcance** 2 · **Movimiento** 2
- **Sabor**: «Dispara mientras se retira. Esa es la idea.»
- **Prompt**: *Un arquero a caballo girado por completo sobre la grupa, disparando hacia atrás mientras el caballo huye hacia delante — el disparo parto. Torsión del cuerpo muy marcada y el arco tensado al máximo. Estela de polvo dorado detrás y, al fondo, los perseguidores difuminados entre ese polvo. Movimiento congelado en el instante previo a soltar.*

#### `portaestandarte-real`
- **Tipo**: Unidad — Inmortal · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Cuando ataca, tus otras unidades adyacentes ganan +1 de Ataque.
- **Sabor**: «Mientras se vea el disco, nadie corre.»
- **Prompt**: *Un soldado persa visto desde abajo sosteniendo en alto un estandarte enorme con el disco alado dorado sobre tela púrpura y azul, el asta apoyada en un soporte del cinturón. El viento estira la tela y el disco atrapa la última luz del sol como si ardiera. Abajo, en penumbra, decenas de cabezas con gorro de fieltro levantadas mirándolo. Contrapicado que hace el estandarte gigantesco.*

#### `satrapa-de-lidia`
- **Tipo**: Unidad — Noble · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli
- **ATQ/VID**: 2/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al comienzo de tu turno, escruta 1.
- **Sabor**: «Gobierna una provincia más rica que su rey. No lo menciona.»
- **Prompt**: *Un gobernador persa de edad madura con túnica suntuosa de seda azul bordada en oro y collar de cabezas de león, sentado en una silla plegable de bronce en una terraza abierta. Revisa una tablilla de arcilla que le tiende un escriba arrodillado. Detrás, la ciudad entera a sus pies con el río reflejando el atardecer. Braseros encendidos a los lados. Riqueza abrumadora y una expresión de cálculo frío.*

#### `maestro-de-correos`
- **Tipo**: Unidad — Mensajero · **Rareza**: Rara · **Coste**: 1 gen + 1 lapislázuli
- **ATQ/VID**: 1/3 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Al entrar en juego, roba 1 carta.
- **Sabor**: «Ni la nieve, ni la lluvia, ni el calor, ni la noche los detienen.»
- **Prompt**: *El instante exacto del relevo en una posta del camino real: un mensajero exhausto y cubierto de polvo tiende un rollo sellado a otro que ya está montado y con el caballo en movimiento. Las manos casi se tocan y el rollo está en el aire entre los dos. Antorchas, caballos de refresco resoplando, el camino perdiéndose hacia un horizonte en llamas. Urgencia pura.*

#### `toro-alado-de-la-puerta`
- **Tipo**: Unidad — Coloso · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli
- **ATQ/VID**: 2/7 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Relevo.
- **Sabor**: «Llevaba doscientos años ahí. Nadie contaba con que se moviera.»
- **Prompt**: *Un toro alado colosal de piedra con cabeza humana barbada y corona almenada —un lamassu— DESPERTANDO: la piedra se agrieta por las junturas y de las grietas sale luz dorada, una pezuña ya ha pisado fuera del pedestal y hay polvo y cascotes cayendo. Mide cinco veces lo que los soldados diminutos que huyen a sus pies. Visto desde abajo contra un cielo violeta en llamas. Monumental y aterrador.*

#### `general-de-los-diez-mil`
- **Tipo**: Unidad — Inmortal · **Rareza**: Rara · **Coste**: 2 gen + 2 lapislázuli
- **ATQ/VID**: 4/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al entrar en juego, una unidad aliada gana Relevo.
- **Sabor**: «No manda a diez mil. Manda a uno, diez mil veces.»
- **Prompt**: *Un comandante persa de espaldas en primer término, manto largo bordado en oro ondeando, girando apenas la cabeza para que se le vea el perfil. Ante él, una formación de inmortales perfectamente alineada que se extiende hasta perderse en el polvo del atardecer: miles de gorros de fieltro y lanzas idénticas. Profundidad extrema, el hombre pequeño y el ejército infinito.*

#### `elefante-de-india`
- **Tipo**: Unidad — Bestia · **Rareza**: Rara · **Coste**: 2 gen + 2 lapislázuli
- **ATQ/VID**: 5/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Perforar.
- **Sabor**: «Llegó con el tributo del este. Nadie preguntó cómo cruzó las montañas.»
- **Prompt**: *Un elefante de guerra indio enorme cargando de frente, visto desde muy abajo, con la frente cubierta por una placa de bronce repujada y los colmillos rematados en puntas metálicas. Torreta de madera en el lomo con dos arqueros disparando. Telas carmesí y azules colgando de los flancos, campanas de bronce sonando. Polvo dorado levantándose en cortina. Escala aplastante.*

#### `inmortal-sin-nombre`
- **Tipo**: Unidad — Inmortal · **Rareza**: Mítica · **Coste**: 3 gen + 2 lapislázuli
- **ATQ/VID**: 5/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Relevo. Cuando vuelve por Relevo, inflige 2 de daño a todas las unidades enemigas adyacentes.
- **Sabor**: «Preguntaron su nombre para el informe de bajas. Dijo: el mismo de ayer.»
- **Prompt**: *Un guerrero inmortal RECOMPONIÉNDOSE del polvo: el cuerpo a medio formar, hecho de granos de arena y ceniza dorada que vuelan hacia él desde el suelo y se solidifican en túnica azul y oro. La mitad ya es carne y tela, la otra mitad sigue siendo polvo en suspensión. En la mano, la lanza con la granada dorada ya completa y ardiendo. A sus pies, el cuerpo caído del que era antes. Sin sangre: solo polvo y luz.*

#### `simurgh`
- **Tipo**: Unidad — Bestia · **Rareza**: Mítica · **Coste**: 2 gen + 2 lapislázuli
- **ATQ/VID**: 4/6 · **Alcance** 2 · **Movimiento** 2
- **Reglas**: Volador. Al comienzo de tu turno, la unidad aliada con menos Vida gana Relevo.
- **Sabor**: «Dicen que una de sus plumas quemada la trae de vuelta. Dicen muchas cosas.»
- **Prompt**: *Un ave mitológica colosal con cuerpo de pavo real y rostro de perro, plumas de cobre, turquesa y oro que parecen metal batido, y una cola inmensa desplegada como un abanico de llamas frías. Planea bajo sobre un ejército diminuto, y de sus plumas caen chispas doradas que al tocar el suelo levantan siluetas de guerreros. Envergadura descomunal recortada contra el cielo violeta. Majestuoso, no monstruoso.*

---

### 4.3 Hechizos (8)

#### `lluvia-de-flechas`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Inflige 2 de daño a todas las unidades enemigas.
- **Sabor**: «Entonces lucharemos a la sombra.»
- **Prompt**: *Vista desde el suelo, mirando directamente hacia arriba: miles de flechas descendiendo, tan juntas que apenas se ve el cielo entre ellas. La última luz del atardecer se cuela entre las astas y las vuelve líneas doradas sobre un fondo violeta. Sin figuras humanas. Las puntas más cercanas, enormes y desenfocadas. Abrumador.*

#### `relevo-inmediato`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Común · **Coste**: 1 gen + 0 lapislázuli
- **Reglas**: Una unidad aliada gana Relevo.
- **Sabor**: «Siguiente.»
- **Prompt**: *Primerísimo plano de dos manos en el instante del relevo: una suelta una lanza cuyo regatón es una granada de oro incandescente y otra la recoge, sin que el arma llegue a tocar el suelo. La granada ilumina las dos manos desde abajo. Fondo desenfocado de formación militar y polvo dorado. Íntimo y tenso.*

#### `tributo-de-las-satrapias`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Roba 2 cartas.
- **Sabor**: «Veinte provincias, veinte regalos, un solo destinatario.»
- **Prompt**: *Una fila interminable de portadores de tributo de pueblos distintos subiendo una escalinata monumental al atardecer, cada uno con una ofrenda diferente: un carnero, un cuenco de oro, un rollo de tela bordada, un colmillo de marfil, un caballo. Vistos de perfil como en un relieve, pero vivos y a todo color, con antorchas iluminándolos. La fila se pierde hacia abajo en la penumbra.*

#### `muro-de-mimbre`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Todas tus unidades ganan un escudo de 2.
- **Sabor**: «Primero la pared. Después se discute.»
- **Prompt**: *Una línea de escudos de mimbre encajándose unos con otros vista casi a ras de suelo, formando una pared continua que cruza toda la imagen, con las lanzas asomando por los huecos y las granadas doradas de los regatones brillando abajo. Detalle del trenzado en primer plano. Tras la pared, el resplandor naranja de un incendio. Polvo a ras.*

#### `azotar-el-mar`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Inflige 4 de daño a una unidad enemiga.
- **Sabor**: «La tormenta le rompió el puente. Mandó dar al mar trescientos latigazos. Se los dieron.»
- **Prompt**: *Soldados persas de pie en la orilla, con el agua por la cintura, azotando el mar embravecido con látigos y arrojándole cadenas de hierro, mientras un oficial cuenta los golpes desde una roca con una tablilla. Olas enormes rompiendo contra ellos y rayos al fondo. Cielo violeta de tormenta rasgado por última luz ámbar. Absurdo, solemne y aterrador a la vez.*

#### `decreto-inmutable`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Rara · **Coste**: 1 gen + 1 lapislázuli
- **Reglas**: Una unidad enemiga no puede atacar ni moverse en su próximo turno.
- **Sabor**: «Ley de medos y persas: lo escrito no se deroga. Ni por quien lo escribió.»
- **Prompt**: *Primer plano macro de un cilindro-sello de piedra rodando sobre arcilla fresca y dejando impresa una fila de figuras y escritura cuneiforme. La arcilla húmeda brilla con la luz de una lámpara de aceite cercana. Manos de escriba en el borde del encuadre, inmóviles. Todo lo demás en penumbra azul profunda. Pequeño e irrevocable.*

#### `camino-de-regreso`
- **Tipo**: Hechizo inmediato — Orden · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli
- **Reglas**: Devuelve a la mano una unidad aliada destruida este turno.
- **Sabor**: «El imperio no pierde hombres. Los traslada.»
- **Prompt**: *Un camino empedrado recto que se pierde hacia el horizonte entre montañas secas, con mojones de piedra a los lados y antorchas encendidas a intervalos regulares marcando toda su longitud. En la distancia, una columna de polvo dorado de alguien que vuelve. Sin figuras en primer plano. Sol poniéndose justo al final del camino.*

#### `las-flechas-taparan-el-sol`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Mítica · **Coste**: 2 gen + 2 lapislázuli
- **Reglas**: Inflige 3 de daño a todas las unidades enemigas. Tus unidades con Relevo que mueran este turno vuelven aunque ya lo hubieran gastado.
- **Sabor**: «Nuestras flechas taparán el sol. — Entonces lucharemos a la sombra.»
- **Prompt**: *Un valle entero sumido en una sombra antinatural porque el cielo está cubierto por una nube sólida de flechas descendentes, con el sol reducido a un disco rojo apenas visible detrás de ellas. Abajo, dos ejércitos minúsculos para dar escala, uno azul y oro y otro ya cubriéndose. La luz que se cuela entre las flechas cae en haces. Épico y apocalíptico.*

---

### 4.4 Estructuras (7)

#### `puerta-de-todas-las-naciones`
- **Tipo**: Estructura — Puerta · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli · **Resistencia**: 5
- **Reglas**: Guardia.
- **Sabor**: «Entran todos. Salen los que el rey decide.»
- **Prompt**: *Un pórtico monumental de piedra flanqueado por dos toros alados colosales con cabeza humana barbada, visto desde abajo. El dintel sigue en pie y por el hueco se ve el cielo en llamas del atardecer. Antorchas a ambos lados proyectando sombras larguísimas. Sin figuras: la escala la dan los relieves diminutos tallados en la base.*

#### `puente-de-barcas`
- **Tipo**: Estructura — Puente · **Rareza**: Común · **Coste**: 1 gen + 1 lapislázuli · **Resistencia**: 4
- **Reglas**: Tus unidades tienen +1 de Movimiento.
- **Sabor**: «Unió dos continentes con barcos atados. La primera vez. A la segunda aprendió.»
- **Prompt**: *Cientos de barcos de guerra atados costado con costado formando un puente flotante que cruza un estrecho de orilla a orilla, con tablones y tierra encima y un ejército interminable pasando por encima en doble columna. Visto desde una altura lateral para que se vea la longitud imposible. Cabos tensos, mástiles desarbolados a propósito, agua oscura agitándose debajo. Atardecer ámbar y violeta.*

#### `altar-del-fuego`
- **Tipo**: Estructura — Altar · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli · **Resistencia**: 4
- **Reglas**: Al comienzo de tu turno, cura 1 a tu Nexo.
- **Sabor**: «Lo trajeron encendido desde el primer templo. Nunca ha dejado de arder.»
- **Prompt**: *Dos altares de fuego de piedra tallada en lo alto de una colina rocosa, uno con una llama alta y muy limpia y el otro apagado, recortados contra el cielo del atardecer. Un sacerdote con la boca cubierta por un paño blanco alimenta la llama con leño perfumado. La llama es la fuente de luz principal y tiñe la piedra de oro. Soledad y ritual.*

#### `jardin-cerrado`
- **Tipo**: Estructura — Jardín · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 lapislázuli · **Resistencia**: 5
- **Reglas**: Al comienzo de tu turno, una unidad aliada dañada recupera 1 de Vida.
- **Sabor**: «De aquí viene la palabra paraíso: un sitio con tapia y agua.»
- **Prompt**: *Un jardín persa amurallado al atardecer, con canales de agua rectos cruzándose en el centro, cipreses altísimos alineados, granados cargados de fruta y un pabellón de columnas al fondo. El agua refleja el cielo ámbar y violeta. Lámparas de aceite encendidas entre los setos. Fuera de la tapia se adivina el desierto a oscuras. Geometría perfecta, verdes intensos, sin figuras.*

#### `friso-de-los-inmortales`
- **Tipo**: Estructura — Relieve · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli · **Resistencia**: 6
- **Reglas**: Tus unidades con Relevo vuelven con +1/+1.
- **Sabor**: «Los contaron al pintarlos. Siguen saliendo más.»
- **Prompt**: *Un friso de ladrillo vidriado mostrando una fila de guerreros inmortales idénticos en marcha, de perfil, con lanzas y arcos, sobre fondo azul lapislázuli intenso. Las figuras están en relieve y algunas parecen a punto de despegarse del muro: una ha sacado ya el hombro fuera del plano. Antorchas rasantes hacen brillar el vidriado. Inquietante y precioso.*

#### `salon-de-las-cien-columnas`
- **Tipo**: Estructura — Salón · **Rareza**: Rara · **Coste**: 1 gen + 2 lapislázuli · **Resistencia**: 7
- **Reglas**: Guardia. Tus unidades adyacentes tienen +1 de Vida.
- **Sabor**: «Cien columnas para que nadie dude de cuántas provincias hay.»
- **Prompt**: *El interior de una sala hipóstila inmensa, con columnas acanaladas rematadas en capiteles de doble toro afrontado repitiéndose hasta perderse en la penumbra. Haces de luz ámbar entrando en diagonal desde ventanas altas y cortando el polvo en suspensión. Braseros encendidos entre las columnas. Sin figuras: escala aplastante y silencio.*

#### `arsenal-de-susa`
- **Tipo**: Estructura — Arsenal · **Rareza**: Mítica · **Coste**: 2 gen + 2 lapislázuli · **Resistencia**: 6
- **Reglas**: Al comienzo de tu turno, una unidad aliada sin Relevo lo gana.
- **Sabor**: «Hay armadura para cada hombre que vendrá. Y para el que venga después.»
- **Prompt**: *El interior de un almacén militar colosal, con estanterías de cedro repletas de escudos de mimbre, haces de lanzas con el regatón dorado brillando en la penumbra y túnicas azules dobladas, ordenadas en filas que se pierden al fondo. Un solo escriba minúsculo con una lámpara haciendo inventario. La luz de su lámpara arranca destellos a cientos de granadas doradas a la vez.*

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

- [ ] 29 ilustraciones nuevas (ya están hechas `jerjes-rey-de-reyes`, `fuente-inmortales` y `portador-de-manzana`).
- [ ] Generadas con **ChatGPT**, con la instrucción permanente pegada al principio de la conversación.
- [ ] **Cada archivo nombrado con el id de su carta**, en minúsculas y con guiones.
- [ ] Formato vertical 2:3, mínimo 1024 × 1536.
- [ ] Dejar todo en una carpeta dentro de `tools/art-inbox/`.
- [ ] Revisar que ninguna salga color arena ni gris: si parece Duna, repetirla.
- [ ] Revisar que en toda lanza visible esté la **granada de oro** del regatón.

## Nombres de archivo exactos

```
fuente-inmortales
portador-de-manzana
arquero-de-susa
escudero-de-mimbre
hondero-de-caria
lancero-de-persepolis
jinete-de-nisea
arquero-a-caballo
portaestandarte-real
satrapa-de-lidia
maestro-de-correos
toro-alado-de-la-puerta
general-de-los-diez-mil
elefante-de-india
inmortal-sin-nombre
simurgh
lluvia-de-flechas
relevo-inmediato
tributo-de-las-satrapias
muro-de-mimbre
azotar-el-mar
decreto-inmutable
camino-de-regreso
las-flechas-taparan-el-sol
puerta-de-todas-las-naciones
puente-de-barcas
altar-del-fuego
jardin-cerrado
friso-de-los-inmortales
salon-de-las-cien-columnas
arsenal-de-susa
jerjes-rey-de-reyes
```
