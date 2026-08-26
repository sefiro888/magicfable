# Facción nueva · PLAGA — «Lo que muerde, no perdona»

Dosier completo de la facción de muertos vivientes y contagio. Identidad,
mecánica propia, comandante y **31 cartas** con su prompt de arte.

---

## 1. Por qué esta facción y en qué se diferencia

Sombra ya es la facción de cementerio y robo de vida del juego, así que
Plaga se aparta a propósito de ese terreno:

- **No vive de SU cementerio, contamina el TABLERO RIVAL.** Sombra mira
  hacia dentro: qué le queda a ella en su propio cementerio. Plaga mira
  hacia fuera: qué le puede hacer a las piezas del rival mientras siguen
  vivas encima del tablero.
- **No roba vida, la convierte.** El objetivo de Plaga no es drenar al
  Nexo enemigo, es que sus propias unidades infectadas terminen siendo
  tuyas.

Ninguna facción del juego amenaza hoy con darle la vuelta a una pieza que
ya está en la mesa del rival. Ese es el hueco: la única a la que le
conviene herir sin matar todavía.

### Identidad visual

| Uso | Color |
| --- | --- |
| Base (verde enfermizo, oliva podrido) | `#4a5c34` |
| Luz (amarillo verdoso de fiebre) | `#c9d68a` |
| Sombra (negro de tierra de fosa) | `#1a1710` |
| Acento (rojo de infección, óxido) | `#b8481f`, `#6b5a3f` |

**Materiales**: vendas sucias, hierro oxidado, tela de saco, hueso
ennegrecido, cera de vela derretida, cristal de frasco de boticario.
**Formas**: puntadas y cosidos, máscaras de pico de peste, jaulas de
cuarentena, moscas, grietas de tierra removida. **Tono**: sucio y húmedo,
nunca gótico elegante — esto es una epidemia real, no un baile de máscaras.
Nada de zombis cómicos ni de vísceras gratuitas: el miedo viene de que
todavía se mueven con intención.

---

## 2. Las mecánicas propias

### Contagio

> **Contagio** — Cuando esta unidad daña a una unidad enemiga, la infecta.
> Una unidad **Infectada** pierde 1 de Vida al final de cada turno (de
> cualquiera de los dos jugadores). **Si una unidad Infectada muere, en vez
> de irse al cementerio de su dueño, se convierte en un Zombi Contagiado
> bajo tu control**, en su misma casilla.

Es la mecánica insignia: no destruyes al rival, lo reclutas. Cambia cómo se
juega el combate contra Plaga — dejar una pieza infectada en la mesa,
aunque esté sana, es una bomba de relojería que en algún momento se pasa de
bando.

### Horda

> **Horda** — Esta unidad gana +1 de Ataque (o +1/+1, según la carta) por
> cada OTRA unidad tuya con Horda que haya en el tablero.

La contrapartida activa: cuantos más muertos vivientes tengas en la mesa a
la vez, más fuerte pega cada uno. Es lo que convierte "he infectado a tres
piezas rivales" en un ejército que crece solo, en vez de en tres bajas
sueltas.

> Nota técnica: Infectado es un `PieceStatus` nuevo (como `cursed` o
> `frozen`), con un tique de daño al final de cada turno de cualquiera de
> los dos jugadores, no solo el propio. La conversión al morir necesita que
> `damagePieceDetailed` compruebe si la pieza que muere lleva el estado y,
> si es así, despliegue una copia de `zombi-contagiado` (ya en el catálogo,
> es una carta real, no una ficha fuera de catálogo) en la misma casilla
> bajo el jugador que la infectó — hay que guardar quién infectó, no solo
> que está infectada. Horda es un cálculo dinámico igual que la Furia de
> Fimbul o el aura del Jarl de la Costa: cuenta piezas propias con el mismo
> id de pasiva en el tablero en el momento de golpear, sin contador nuevo
> en `PlayerState`.

---

## 3. El comandante

### `kessra-paciente-cero`

- **Nombre**: Kessra · **Título**: La Paciente Cero
- **Facción**: Plaga · **Vida del Nexo**: 35
- **Pasiva**: La primera vez cada turno que infectas a una unidad enemiga,
  robas 1 carta.
- **Poder (una vez por partida, 2 genérico + 1 pútrido)**: «Brote Final» —
  infecta a todas las unidades enemigas y todas las unidades Infectadas
  pierden 3 de Vida de inmediato.
- **Sabor**: «No recuerda haber estado enferma. Recuerda que dejó de
  importarle.»
- **Prompt de retrato**: *Retrato en tres cuartos de una mujer de piel
  pálida grisácea con venas oscuras visibles en cuello y sienes, ropa de
  paciente de hospital de campaña sucia y remendada, sosteniendo una
  máscara de pico de peste vacía en una mano sin llevarla puesta. Mirada
  serena, no agresiva — como si ya no le doliera nada. Fondo: tienda de
  cuarentena en penumbra con frascos de boticario rotos y vendas colgando.
  Paleta Plaga.*

---

## 4. Las 31 cartas

Cada ficha trae: **id** (nombre de archivo), datos de juego y el prompt de
arte. La columna «motor» avisa de si la carta usa mecánica que el juego ya
sabe resolver o si hay que programar algo.

---

### 4.1 Fuente

#### `fuente-plaga`
- **Tipo**: Esencia — Fuente · **Rareza**: Común · **Coste**: 0
- **Reglas**: Agota esta fuente: genera 1 de Esencia Pútrida.
- **Sabor**: «No hace falta cultivarla. Solo hace falta no limpiarla a tiempo.»
- **Motor**: ya soportado
- **Prompt**: *Un frasco de boticario roto derramando un líquido verdoso
  espeso sobre una mesa de madera podrida, con moscas posadas alrededor.
  Luz de vela mortecina. Sin figuras. Paleta Plaga.*

---

### 4.2 Unidades (15)

#### `mordedor-recien-alzado`
- **Tipo**: Unidad — No muerto · **Rareza**: Común · **Coste**: 1 gen + 1 pútrido
- **ATQ/VID**: 2/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Contagio.
- **Sabor**: «Ayer enterraba a los suyos. Hoy es de los suyos que enterró.»
- **Motor**: nueva (Contagio)
- **Prompt**: *Un cadáver reanimado recién salido de una fosa poco
  profunda, tierra todavía cayendo de la ropa, mordiendo el aire hacia el
  espectador con los brazos extendidos. Paleta Plaga.*

#### `zombi-contagiado`
- **Tipo**: Unidad — No muerto · **Rareza**: Común · **Coste**: 0 gen + 1 pútrido
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Impulso.
- **Sabor**: «No pidió unirse. Ya no es una pregunta que pueda hacerse.»
- **Motor**: ya soportado (`impulse`) — además es la unidad que aparece cuando Contagio convierte a una víctima
- **Prompt**: *Un zombi genérico de aspecto reciente, ropa corriente
  desgarrada, avanzando en grupo con otros dos idénticos por una calle
  estrecha de noche. Paleta Plaga.*

#### `enjambre-de-moscas`
- **Tipo**: Unidad — Horror · **Rareza**: Común · **Coste**: 1 gen + 1 pútrido
- **ATQ/VID**: 1/2 · **Alcance** 1 · **Movimiento** 3
- **Reglas**: Volador. Al entrar en juego, escruta 1.
- **Sabor**: «Llegan antes que el olor. Siempre llegan antes.»
- **Motor**: ya soportado (`flying` + `scry`)
- **Prompt**: *Una nube densa de moscas con forma vagamente animal,
  arremolinándose sobre un charco estancado bajo luz gris de mediodía.
  Paleta Plaga.*

#### `paciente-en-cuarentena`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pútrido
- **ATQ/VID**: 1/5 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia.
- **Sabor**: «La puerta se cerró desde fuera. Nunca ha vuelto a abrirse.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Una figura envuelta en vendas sucias y correas de contención
  sueltas, de pie e inmóvil ante la puerta de hierro de una celda de
  cuarentena, luz de una sola bombilla. Paleta Plaga.*

#### `enterrador-ciego`
- **Tipo**: Unidad — Humanoide · **Rareza**: Infrecuente · **Coste**: 0 gen + 1 pútrido
- **ATQ/VID**: 1/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al entrar en juego, escruta 2.
- **Sabor**: «Ya no necesita ver para saber dónde cavar.»
- **Motor**: ya soportado (`scry`)
- **Prompt**: *Un sepulturero encorvado con los ojos nublados de blanco,
  apoyado en una pala en mitad de un cementerio nocturno lleno de fosas a
  medio cubrir. Paleta Plaga.*

#### `verdugo-podrido`
- **Tipo**: Unidad — No muerto · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pútrido
- **ATQ/VID**: 3/3 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Contagio.
- **Sabor**: «Ejecutaba en nombre de la ley. Ahora ejecuta sin motivo, y no nota la diferencia.»
- **Motor**: nueva (Contagio)
- **Prompt**: *Un verdugo con capucha rota y piel grisácea agrietada,
  sosteniendo un hacha oxidada con una mano descarnada, de pie en un
  patíbulo abandonado. Paleta Plaga.*

#### `fosa-comun-andante`
- **Tipo**: Unidad — Horror · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 pútrido
- **ATQ/VID**: 3/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Horda: gana +1 de Ataque por cada otra unidad tuya con Horda en el tablero.
- **Sabor**: «Nadie sabe cuántos son ahí dentro. Ella tampoco.»
- **Motor**: nueva (Horda)
- **Prompt**: *Una masa amorfa de cuerpos entrelazados moviéndose como uno
  solo, brazos y rostros distintos asomando por toda la superficie,
  avanzando por un campo embarrado. Paleta Plaga.*

#### `nino-infectado`
- **Tipo**: Unidad — Horror · **Rareza**: Rara · **Coste**: 1 gen + 1 pútrido
- **ATQ/VID**: 2/2 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Cuando ataca, infecta a la defensora.
- **Sabor**: «Sigue jugando al mismo juego de antes. Las reglas han cambiado.»
- **Motor**: nueva (Contagio al atacar)
- **Prompt**: *Una figura infantil de pie en el umbral de una casa a
  oscuras, piel pálida con venas oscuras visibles en el cuello, sosteniendo
  un juguete roto. Inquietante por lo cotidiano, no por lo grotesco. Paleta
  Plaga.*

#### `alguacil-reanimado`
- **Tipo**: Unidad — No muerto · **Rareza**: Rara · **Coste**: 1 gen + 2 pútrido
- **ATQ/VID**: 4/4 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Golpe veloz.
- **Sabor**: «Sigue llevando la estrella. Ya no representa a nadie.»
- **Motor**: ya soportado (`swift-strike`)
- **Prompt**: *Un alguacil muerto con el chaleco de cuero agrietado y una
  estrella oxidada en el pecho, levantándose de detrás de un mostrador de
  saloon abandonado, mano en la pistolera vacía. Paleta Plaga.*

#### `medica-de-la-peste`
- **Tipo**: Unidad — Humanoide · **Rareza**: Rara · **Coste**: 1 gen + 2 pútrido
- **ATQ/VID**: 2/4 · **Alcance** 2 · **Movimiento** 1
- **Reglas**: Tus otras unidades tienen Contagio mientras esta siga en juego.
- **Sabor**: «Llegó a curar. Se quedó a entender por qué no podía.»
- **Motor**: nueva (aura de Contagio)
- **Prompt**: *Una médica con máscara de pico de peste completa y bata de
  cuero encerado, sosteniendo un frasco de cristal turbio en alto contra la
  luz de una ventana sucia. Paleta Plaga.*

#### `golem-de-carne-cosida`
- **Tipo**: Unidad — Constructo · **Rareza**: Rara · **Coste**: 2 gen + 2 pútrido
- **ATQ/VID**: 5/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Guardia. Perforar.
- **Sabor**: «Ninguna de las partes lo eligió. El conjunto tampoco pregunta.»
- **Motor**: ya soportado (`guard` + `pierce`)
- **Prompt**: *Una figura enorme cosida a partir de piezas visiblemente
  distintas, cicatrices gruesas cruzando el torso, de pie inmóvil en la
  entrada de un laboratorio subterráneo. Paleta Plaga.*

#### `turba-devoradora`
- **Tipo**: Unidad — Horror · **Rareza**: Rara · **Coste**: 2 gen + 1 pútrido
- **ATQ/VID**: 4/4 · **Alcance** 1 · **Movimiento** 2
- **Reglas**: Horda: gana +1/+1 permanentes por cada otra unidad tuya con Horda en el tablero.
- **Sabor**: «No se detiene a contar cuántos quedan. Nunca son los últimos.»
- **Motor**: nueva (Horda)
- **Prompt**: *Una multitud de figuras putrefactas avanzando en formación
  apretada por un puente estrecho, vista desde muy cerca, sin horizonte
  visible detrás. Paleta Plaga.*

#### `alcalde-caido`
- **Tipo**: Unidad — No muerto · **Rareza**: Mítica · **Coste**: 3 gen + 2 pútrido
- **ATQ/VID**: 6/6 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Al entrar en juego, infecta a todas las unidades enemigas.
- **Sabor**: «Prometió protegerlos a todos. Técnicamente, cumplió.»
- **Motor**: nueva (Contagio masivo)
- **Prompt**: *Un hombre corpulento con traje formal desgarrado y cadena de
  alcalde oxidada al cuello, de pie en el balcón roto de un ayuntamiento
  sobre una plaza vacía. Paleta Plaga.*

#### `horda-sin-fin`
- **Tipo**: Unidad — Horror · **Rareza**: Mítica · **Coste**: 3 gen + 2 pútrido
- **ATQ/VID**: 5/7 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Cuando una unidad Infectada enemiga muere, esta unidad gana +1/+1 permanentes.
- **Sabor**: «Cuenta cada uno que cae. Nunca en voz alta.»
- **Motor**: nueva (Contagio, disparo de muerte)
- **Prompt**: *Una figura envuelta en capas de tela y huesos atados como
  trofeos, de pie sobre un montículo de tierra removida, mirando hacia un
  campo de batalla fuera de encuadre. Paleta Plaga.*

#### `titan-de-la-plaga`
- **Tipo**: Unidad — Horror · **Rareza**: Mítica · **Coste**: 4 gen + 2 pútrido
- **ATQ/VID**: 8/8 · **Alcance** 1 · **Movimiento** 1
- **Reglas**: Perforar. Contagio.
- **Sabor**: «Ya no es una persona. Es lo que queda cuando la enfermedad gana del todo.»
- **Motor**: ya soportado (`pierce`) + nueva (Contagio)
- **Prompt**: *Una figura colosal e hinchada de piel agrietada supurando un
  brillo verdoso tenue entre las grietas, arrastrándose por una ciudad en
  ruinas, edificios pequeños a su alrededor. Paleta Plaga.*

---

### 4.3 Hechizos (9)

#### `mordisco-infeccioso`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 pútrido
- **Reglas**: Inflige 3 de daño a una unidad enemiga y la infecta.
- **Sabor**: «No hace falta que sea profundo. Con que sangre, basta.»
- **Motor**: nueva (`damage` + Contagio)
- **Prompt**: *Una dentadura humana desgastada mordiendo el aire en primer
  plano, con gotas oscuras cayendo, fondo completamente desenfocado. Paleta
  Plaga.*

#### `niebla-infecciosa`
- **Tipo**: Hechizo inmediato — Encantamiento · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pútrido
- **Reglas**: Infecta a todas las unidades enemigas.
- **Sabor**: «Se respira antes de verla. Ya es tarde para entonces.»
- **Motor**: nueva (Contagio masivo)
- **Prompt**: *Una nube baja de esporas verdosas extendiéndose por el
  suelo de un bosque entre troncos podridos, sin figuras. Paleta Plaga.*

#### `cuarentena`
- **Tipo**: Hechizo inmediato — Encantamiento · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pútrido
- **Reglas**: Congela una unidad enemiga 2 turnos.
- **Sabor**: «Se marca la puerta y se espera. Nadie entra, nadie sale.»
- **Motor**: ya soportado (`freeze`)
- **Prompt**: *Una puerta de madera con una cruz roja pintada a brochazos
  y una cadena echada, pasillo de hospital vacío y en penumbra alrededor.
  Paleta Plaga.*

#### `saqueo-de-tumbas`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Común · **Coste**: 1 gen + 1 pútrido
- **Reglas**: Robas 2 cartas.
- **Sabor**: «Lo que no se llevaron los ladrones, lo reparte ella.»
- **Motor**: ya soportado (`draw`)
- **Prompt**: *Una tumba abierta con la tapa del ataúd apartada y objetos
  personales esparcidos alrededor sobre tierra húmeda. Sin figuras. Paleta
  Plaga.*

#### `festin-de-carronia`
- **Tipo**: Hechizo inmediato — Conjuro · **Rareza**: Común · **Coste**: 1 gen + 1 pútrido
- **Reglas**: Cura 6 de Vida a tu Nexo.
- **Sabor**: «Nada se desperdicia. Ni siquiera lo que ya no debería estar.»
- **Motor**: ya soportado (`heal-nexus`)
- **Prompt**: *Cuervos posados sobre los restos de una comida abandonada en
  mitad de un camino de tierra, luz gris de amanecer nublado. Paleta Plaga.*

#### `ultimo-aliento`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Infrecuente · **Coste**: 1 gen + 2 pútrido
- **Reglas**: Destruye una unidad enemiga Infectada.
- **Sabor**: «El cuerpo ya había decidido. Esto solo lo confirma.»
- **Motor**: nueva (destrucción condicionada a Infectada, mismo patrón que Hilo de las Moiras)
- **Prompt**: *Una vela consumiéndose hasta el final sobre un plato de
  peltre, la llama a punto de apagarse, habitación completamente a oscuras
  alrededor. Paleta Plaga.*

#### `avalancha-podrida`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Rara · **Coste**: 2 gen + 1 pútrido
- **Reglas**: Inflige 3 de daño a todas las unidades enemigas y les resta 1 de Movimiento este turno.
- **Sabor**: «No corren. No hace falta correr cuando sois tantos.»
- **Motor**: ya soportado (`damage-all-enemies` + ralentización)
- **Prompt**: *Una marea de figuras cayendo unas sobre otras por la ladera
  de una colina de noche, vista desde lejos, sin detalle individual. Paleta
  Plaga.*

#### `resurreccion-forzada`
- **Tipo**: Hechizo inmediato — Ritual · **Rareza**: Rara · **Coste**: 2 gen + 1 pútrido
- **Reglas**: Destruye una unidad aliada. Devuélvela a tu mano con +2/+2 permanentes.
- **Sabor**: «Vuelve distinta. Vuelve, que es lo único que importa aquí.»
- **Motor**: ya soportado (mismo patrón que Rueda que Gira, de Samsara)
- **Prompt**: *Unas manos cosiendo con hilo grueso una herida que ya no
  sangra, a la luz de una única vela, sin ver el rostro de quien recibe la
  puntada. Paleta Plaga.*

#### `plaga-que-no-cesa`
- **Tipo**: Hechizo inmediato — Cataclismo · **Rareza**: Mítica · **Coste**: 2 gen + 2 pútrido
- **Reglas**: Infecta a todas las unidades enemigas. Todas las unidades Infectadas pierden 2 de Vida adicionales este turno.
- **Sabor**: «No tiene principio que se recuerde. No va a tener final que se celebre.»
- **Motor**: nueva (Contagio masivo + daño adicional a Infectadas)
- **Prompt**: *Una ciudad entera vista desde una colina de noche, con
  ventanas iluminadas en verde enfermizo esparcidas de forma irregular por
  todos los barrios. Paleta Plaga.*

---

### 4.4 Estructuras (6)

#### `foso-comun`
- **Tipo**: Estructura — Fosa · **Rareza**: Rara · **Coste**: 2 gen + 1 pútrido · **Resistencia**: 8
- **Reglas**: Guardia.
- **Sabor**: «No tiene lápidas. No hacían falta tantas.»
- **Motor**: ya soportado (`guard`)
- **Prompt**: *Una fosa común larga a medio cubrir, con tierra removida
  amontonada a un lado y postes de madera clavados sin orden alrededor,
  niebla baja. Paleta Plaga.*

#### `laboratorio-clandestino`
- **Tipo**: Estructura — Laboratorio · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pútrido · **Resistencia**: 4
- **Reglas**: Al final de tu turno, una unidad enemiga Infectada pierde 1 de Vida adicional.
- **Sabor**: «Buscaban la cura. Encontraron algo que se defiende solo.»
- **Motor**: nueva (drenaje adicional a Infectadas)
- **Prompt**: *Una mesa de laboratorio improvisada con matraces burbujeando
  un líquido verde y notas clavadas en la pared con manchas oscuras, sótano
  de piedra. Paleta Plaga.*

#### `campana-de-cuarentena`
- **Tipo**: Estructura — Campana · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pútrido · **Resistencia**: 5
- **Reglas**: Tus unidades a distancia infligen 1 de daño adicional.
- **Sabor**: «Suena cuando alguien nuevo cae. Últimamente no para.»
- **Motor**: ya soportado (`ranged-attack-bonus`)
- **Prompt**: *Una campana de hierro oxidado colgada en una torre de
  madera improvisada en mitad de una plaza vacía, cuerda deshilachada
  colgando. Paleta Plaga.*

#### `pozo-de-los-caidos`
- **Tipo**: Estructura — Pozo · **Rareza**: Común · **Coste**: 1 gen + 1 pútrido · **Resistencia**: 5
- **Reglas**: Al final de tu turno, cura 2 a tu Nexo.
- **Sabor**: «El agua ya no está limpia. Sigue siendo lo único que hay.»
- **Motor**: ya soportado (mantenimiento de curación)
- **Prompt**: *Un pozo de piedra cubierto de musgo con un cubo volcado al
  lado y agua de color turbio visible en el fondo, luz de atardecer.
  Paleta Plaga.*

#### `criadero-de-horda`
- **Tipo**: Estructura — Criadero · **Rareza**: Infrecuente · **Coste**: 1 gen + 1 pútrido · **Resistencia**: 4
- **Reglas**: Al final de tu turno, una unidad aliada gana un escudo de 2.
- **Sabor**: «No cría nada. Solo espera a que algo más se una.»
- **Motor**: ya soportado (mantenimiento de escudo)
- **Prompt**: *Un corral improvisado con tablones cruzados y cadenas
  colgando vacías, en el patio trasero de una granja abandonada de noche.
  Paleta Plaga.*

#### `monumento-a-la-plaga`
- **Tipo**: Estructura — Monumento · **Rareza**: Mítica · **Coste**: 2 gen + 2 pútrido · **Resistencia**: 7
- **Reglas**: Al final de tu turno, si alguna unidad Infectada enemiga murió este turno, robas 1 carta y una unidad aliada gana +1/+1 permanentes.
- **Sabor**: «No conmemora a los que murieron. Conmemora que siguieron sirviendo después.»
- **Motor**: nueva (condición sobre muertes de Infectadas enemigas)
- **Prompt**: *Una estatua tosca de piedra sin pulir representando una
  figura envuelta en vendas, rodeada de ofrendas podridas dejadas por
  alguien, en el centro de una plaza desierta. Paleta Plaga.*

---

## 5. Cómo se juega esta facción

Plaga no busca matar limpio: busca herir y esperar. Cada unidad enemiga que
infecta es una amenaza que crece sola, turno a turno, sin que tengas que
volver a tocarla — y si el rival no la cura o la salva a tiempo, termina
peleando de tu lado. Cuantas más piezas Horda tengas en la mesa a la vez,
más fuerte pega cada una, así que el objetivo real no es la primera
víctima: es la tercera, la cuarta, la que ya no puede pararse.

Sus dos debilidades, deliberadas:

1. **Necesita tiempo.** El contagio no mata en el acto: si el rival cierra
   la partida rápido, Plaga nunca llega a cobrar lo que ha sembrado.
2. **Depende de que el rival juegue criaturas.** Un mazo que gane a base de
   hechizos y golpear el Nexo directo apenas le da objetivos que infectar.

Mazo inicial sugerido (50 cartas): 20 Fuente de Plaga, 3 Mordedor Recién
Alzado, 3 Zombi Contagiado, 2 Enjambre de Moscas, 2 Paciente en Cuarentena,
2 Verdugo Podrido, 1 Enterrador Ciego, 1 Fosa Común Andante,
1 Niño Infectado, 1 Alguacil Reanimado, 1 Médica de la Peste,
1 Golem de Carne Cosida, 1 Enjambre Devorador, 1 Alcalde Caído,
1 Horda sin Fin, 1 Titán de la Plaga, 1 Mordisco Infeccioso,
1 Nube de Esporas, 1 Saqueo de Tumbas, 1 Avalancha Podrida,
1 Resurrección Forzada, 1 Foso Común, 1 Campana de Cuarentena,
1 Criadero de Horda.

---

## 6. Checklist de entrega

Nombres de archivo exactos para `tools/art-inbox/` (sin tildes ni ñ):

```
fuente-plaga                 mordedor-recien-alzado     zombi-contagiado
enjambre-de-moscas           paciente-en-cuarentena     enterrador-ciego
verdugo-podrido               fosa-comun-andante         nino-infectado
alguacil-reanimado            medica-de-la-peste         golem-de-carne-cosida
turba-devoradora            alcalde-caido               horda-sin-fin
titan-de-la-plaga             mordisco-infeccioso        niebla-infecciosa
cuarentena                    saqueo-de-tumbas            festin-de-carronia
ultimo-aliento                avalancha-podrida           resurreccion-forzada
plaga-que-no-cesa             foso-comun                  laboratorio-clandestino
campana-de-cuarentena         pozo-de-los-caidos          criadero-de-horda
monumento-a-la-plaga          kessra-paciente-cero
```

Aviso de estilo para toda la facción: **epidemia real, no gótico de
disfraz**. Nada de vísceras gratuitas ni de zombis payasos: la referencia es
la peste histórica —máscaras de pico, cuarentenas marcadas con cruz,
vendas, boticarios— llevada a un acabado tridimensional sucio y húmedo. El
miedo está en que se mueven con propósito y en que todavía se parecen a
quienes fueron, no en la cantidad de sangre que se derrame.
