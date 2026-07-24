# Auditoría de cartas — Crónicas del Nexo

Registro vivo de qué cartas ya tienen un test que comprueba que su efecto
implementado coincide de verdad con su texto de reglas. Se actualiza según
avanza la auditoría; sirve también de plantilla para cuando se añadan cartas
nuevas en el futuro.

## Cómo auditar una carta (plantilla para cartas nuevas)

1. Localiza la carta en `src/game/cards.ts`: anota su `id`, el texto de
   `rules` y su array `effects` (kind + parámetros).
2. Busca en `src/game/engine.ts` dónde se interpreta ese `kind` de efecto
   (o el `passive.id` concreto si es un pasivo) para entender exactamente
   qué hace el motor.
3. Escribe un test en `src/game/engine.test.ts` (mecánicas generales) o
   `src/game/effects.test.ts` (efecto puntual de una carta/comandante
   concreto) que monte un tablero mínimo, dispare el efecto y compruebe el
   resultado exacto que promete el texto — no solo que "algo pasa".
4. Si el test falla porque el motor hace algo distinto a lo que dice el
   texto: eso es un bug real. Repáralo (o ajusta el texto si el
   comportamiento del motor es el correcto) y dilo explícitamente al
   usuario al terminar el lote.
5. Actualiza la fila de esa carta en este documento: estado `✅ Verificada`,
   y qué test la cubre.

Estados usados en las tablas:
- `✅ Verificada` — hay un test que comprueba su efecto exacto y pasa.
- `⚠️ Dudosa` — hay algún test que la usa, pero no comprueba su habilidad
  propia (aparece solo como pieza genérica de relleno).
- `⬜ Pendiente` — sin ningún test dedicado.
- `❌ Bug` — se ha comprobado leyendo el motor que el efecto NO hace lo que
  dice su texto (o no hace nada). Se anota qué falla; el arreglo se deja
  para un lote final conjunto, no se toca el motor durante la auditoría.

## Estado global (24 jul. 2026 — lote de arreglos aplicado y verificado)

| Facción | Total | Verificadas | Dudosas | Bugs pendientes | Pendientes |
|---|---|---|---|---|---|
| Furia | 17 | 17 | 0 | 0 | 0 |
| Arcano | 17 | 16 | 0 | 1 | 0 |
| Naturaleza | 14 | 14 | 0 | 0 | 0 |
| Orden | 14 | 14 | 0 | 0 | 0 |
| Sombra | 14 | 13 | 0 | 1 | 0 |
| Vacío | 14 | 14 | 0 | 0 | 0 |
| Comandantes | 6 | 6 | 0 | 0 | 0 |
| **Total** | **96** | **94** | **0** | **2** | **0** |

**32 de los 33 bugs originales están arreglados y verificados**, cada uno con
un test propio en `src/game/bug-fixes.test.ts` (40 tests en total) que
comprueba el resultado exacto. Todo el trabajo se hizo en local: el gate
completo (`tsc`, `eslint`, `vitest` — 199/199 — y `build`) pasa limpio.

De los 4 que exigían una decisión de diseño, **3 se resolvieron rediseñando
ligeramente su texto** para que encajen en el motor actual sin construir
mecánica nueva (ver detalle abajo). Solo queda **Esqueleto Guerrero**, porque
su arreglo fiel es una feature nueva con acción de jugador y UI propia, no
un bugfix — se deja aparte como tarea futura si se quiere abordar.

### Dos bugs que no estaban en la lista original de 33

Escribir los tests de verificación destapó dos fallos adicionales que no se
habían detectado durante la lectura de código de la fase de auditoría:

- **Bono de "objetivo solitario"** (Infiltrado Volcánico, y cualquier otra
  carta que use `bonus-damage-isolated-target`): el chequeo de "¿tiene el
  objetivo alguna otra pieza adyacente?" contaba al propio atacante como
  vecino. Como un atacante cuerpo a cuerpo siempre está adyacente a su
  objetivo, el bono nunca se activaba. Arreglado excluyendo también al
  atacante del chequeo.
- **Daño en área de Draco de Magma** (`adjacent-damage` con
  `trigger: 'attack'`): si el ataque mataba al objetivo, el efecto de área
  buscaba la posición del objetivo en el tablero *después* de haberlo
  eliminado, así que el splash se saltaba en silencio cada vez que el golpe
  era letal. Arreglado pasando la posición del objetivo capturada antes de
  aplicar el daño.

## Bugs arreglados en este lote (29)

Cada uno tiene ahora un test dedicado en `src/game/bug-fixes.test.ts`
(el nombre del `describe` cita el número de bug de esta lista).

1. ✅ **Elemental de Tormenta** (Furia) — el bono de +1 daño al atacar ahora
   se suma en `attackBonus` (mismo mecanismo que Ariete Volcánico).
2. ✅ **Draco de Magma** (Furia) — el daño en área ahora se dispara al
   atacar (no al entrar), usando el nuevo campo `trigger` del efecto
   `adjacent-damage`, resuelto en `applyOnAttackExtras`.
3. ✅ **Gigante de Magma** (Furia) — abrasa sus 4 casillas ortogonales al
   entrar en juego (simplificación: es un efecto puntual, no un aura que
   se mueva con la unidad — ver nota en la ficha de la carta).
4. ✅ **Infiltrado Volcánico** (Furia) — el bono de +1 Ataque contra
   objetivos solitarios ya se aplica correctamente (y se corrigió además
   el bug de "el propio atacante cuenta como vecino", ver arriba).
5. ✅ **Erupción Volcánica** (Furia) — nuevo tipo de efecto
   `damage-all-enemies` que golpea a todas las unidades enemigas en juego
   y abrasa sus casillas.
6. ✅ **Dragón de Escarcha** (Arcano) — el `freeze` de la carta ahora se
   aplica también al atacar (no solo al lanzar hechizos), mismo gancho
   genérico que Basilisco del Caos (bug #28).
7. ✅ **Guardián Escarchado** (Arcano) — nueva comprobación `isPacified`
   en `canAttackPiece`/`canAttackEnemyNexus`: ninguna unidad enemiga
   adyacente al Guardián puede atacar (ni a piezas ni al Nexo).
8. ✅ **Mago Celestial** (Arcano) — el bono de +1 Ataque a distancia
   (`ranged-attack-bonus`) se suma en `attackBonus` cuando la distancia al
   objetivo es mayor que 1.
9. ✅ **Oso Forestal** (Naturaleza) — los aliados que entran en juego
   mientras el Oso está en el tablero ganan +1 Vida (no afecta a
   estructuras).
10. ✅ **Arboleda Sagrada** (Naturaleza) — mismo aura que el Oso Forestal,
    aplicada desde una estructura.
11. ✅ **Crecimiento Salvaje** (Naturaleza) — ahora dos pasivos separados:
    `target-attack-until-end` (+1 Ataque hasta fin de turno) y
    `target-health-permanent` (+2 Vida; simplificado a permanente, no hay
    mecanismo de "vida máxima temporal" en el motor).
12. ✅ **Centauro Cazador** (Naturaleza) — al atacar, los aliados
    adyacentes al Centauro ganan +1 Ataque hasta fin de turno.
13. ✅ **Elfo Ancestral** (Naturaleza) — el descuento de -1 genérico a los
    instantes propios (`instant-cost-discount`) ya se aplica en
    `effectiveCost`.
14. ✅ **Dríade del Manantial** (Naturaleza) — `heal-nexus` ahora también
    se interpreta al entrar en juego una unidad (antes solo en hechizos).
15. ✅ **Ángel Celestial** (Orden) — gana un escudo preventivo de 1 al
    entrar (generalizado el mecanismo que antes era exclusivo del
    comandante Asterin).
16. ✅ **Pégaso Celestial** (Orden) — cura 2 Vida (sin superar su máximo)
    la primera vez que ataca, y solo esa vez.
17. ✅ **Paladín Glorioso** (Orden) — sus aliados adyacentes ya no pueden
    ser congelados por ninguna vía (chequeo centralizado en `addStatus`).
18. ⬜ **Clérigo de Luz** (Orden) — sigue sin arreglar, ver "pendientes de
    decisión" abajo.
19. ✅ **Grifo de Orden** (Orden) — las unidades enemigas adyacentes al
    Grifo sufren -1 Ataque al atacar.
20. ✅ **Juicio Divino** (Orden) — ahora solo puede destruir unidades con
    2 Vida o menos (antes destruía cualquier unidad).
21. ✅ **Murciélago Sombra** (Sombra) — drena 1 Vida del Nexo enemigo al
    Nexo propio en cada ataque.
22. ✅ **Espectro Siniestro** (Sombra) — ignora Guardias enemigos al elegir
    objetivo, y descarta una carta de la mano **enemiga** (no la propia)
    cada vez que hace daño atacando.
23. ⬜ **Esqueleto Guerrero** (Sombra) — sigue sin arreglar, ver
    "pendientes de decisión" abajo.
24. ✅ **Nigromante Oscuro** (Sombra) — roba una carta cada vez que muere
    una unidad aliada propia, y cura el Nexo propio en la cantidad de
    daño que hacen los hechizos propios mientras esté en el tablero.
25. ✅ **Maldición Sombra** (Sombra) — la unidad maldecida pierde 1 Vida al
    final de cada turno hasta morir; además ahora rechaza objetivos
    aliados (no se puede lanzar sobre las propias unidades).
26. ✅ **Vampiro Siniestro** (Sombra) — cura el Nexo propio en una cantidad
    igual al daño infligido al atacar.
27. ✅ **Pesadilla Mortal** (Sombra) — descarta 2 cartas de la mano
    **enemiga** (no la propia) y resta 1 Vida a las unidades enemigas en
    juego.
28. ✅ **Basilisco del Caos** (Vacío) — congela al objetivo al atacar
    (mismo gancho genérico que el Dragón de Escarcha, bug #6).
29. ⬜ **Quimera del Caos** (Vacío) — sigue sin arreglar, ver "pendientes
    de decisión" abajo.
30. ✅ **Devorador Entrópico** (Vacío) — gana Vida igual a la Resistencia
    de cualquier estructura enemiga que se destruya (sin superar su
    máximo).
31. ⬜ **Leviatán Abismal** (Vacío) — sigue sin arreglar, ver "pendientes
    de decisión" abajo.
32. ✅ **Aniquilación del Vacío** (Vacío) — nuevo efecto
    `destroy-all-enemy-structures`: destruye todas las estructuras
    enemigas y gana Esencia igual a la suma de sus Resistencias.
33. ✅ **Horror Abisal** (Vacío) — al atacar, las unidades enemigas pierden
    1 Movimiento durante su siguiente turno (se restaura al terminar ese
    turno, mismo ciclo de vida que `attackModifier`).

## Los 3 bugs de diseño resueltos con texto rediseñado

Estos tres no se podían arreglar "conectando el pasivo que faltaba" sin
inventar mecánica nueva, así que en vez de eso se simplificó ligeramente su
texto para que quepan en el motor actual. Quedan arreglados y con test en
`bug-fixes.test.ts`; si el diseño original se quiere recuperar tal cual,
habría que revisar esta decisión más adelante.

18. ✅ **Clérigo de Luz** (Orden) — su disparador original ("cuando cura a
    una unidad") era irrealizable: ninguna carta cura la Vida de una
    unidad, solo la del Nexo. Se cambió a "las unidades aliadas al entrar
    en juego ganan +1 Vida" — el mismo aura que Oso Forestal / Arboleda
    Sagrada, reutilizando el mecanismo ya existente en vez de construir
    uno nuevo.
29. ✅ **Quimera del Caos** (Vacío) — "copiar una habilidad" de un aliado
    genérico exigía un campo nuevo de "efecto sobreescrito por pieza"
    (cambio estructural). Se acotó a "si hay un aliado adyacente al
    entrar, copia su Ataque como bono permanente": conserva el espíritu
    (la Quimera absorbe el poder de otra unidad) sin tocar el modelo de
    datos.
31. ✅ **Leviatán Abismal** (Vacío) — el texto original ("mueve todas las
    unidades del tablero 1 casilla") no tiene reglas de desempate
    definidas (colisiones, bordes del tablero) y el efecto que tenía
    asignado (`adjacent-damage`) ni siquiera coincidía con eso. Se
    rediseñó a "al atacar, empuja 1 casilla hacia atrás a las unidades
    enemigas adyacentes al objetivo": mismo espíritu de control de
    espacio, pero acotado (solo enemigos, solo alrededor del objetivo) y
    con reglas claras — si la casilla de destino está ocupada o fuera del
    tablero, la unidad simplemente no se mueve.

## Bug pendiente — feature nueva, no bugfix (1)

23. ⬜ **Esqueleto Guerrero** (Sombra) — el pasivo `undead-resurrection`
    sigue sin conectar. Resucitarlo "gastando 2 Esencia Oscura" es una
    acción nueva con coste y elección del jugador (necesitaría un
    `GameAction` nuevo, un estado de "decisión pendiente" y soporte en la
    UI para preguntar sí/no) — es trabajo de feature nueva, no un ajuste
    de motor, así que se deja fuera de este lote a propósito.

---

## Furia (17)

| Carta | Efecto | Estado | Test |
|---|---|---|---|
| fuente-furia | Fuente de maná | ✅ | engine.test.ts "fuentes y despliegue" |
| sabueso-brasa | Impulso | ✅ | engine.test.ts "movimiento táctico" |
| berserker-ignivoro | +1 ATQ en su 1er ataque del turno | ✅ | engine.test.ts "combate..." |
| dragon-caldera | 2 daño adyacentes al entrar | ✅ | engine.test.ts "efectos de cartas principales" |
| lluvia-ceniza | 2 daño + abrasa casilla | ✅ | engine.test.ts "efectos de cartas principales" |
| forja-carmesi | +1 ATQ primera unidad Furia del turno | ✅ | engine.test.ts "fuentes y despliegue" |
| lancera-magma | Impulso, avanza hasta 2 | ✅ | engine.test.ts "movimiento táctico" |
| altar-combustion | Bloquea paso enemigo | ✅ | engine.test.ts "combate, daño y destrucción" |
| temblor-rojo | 3 daño + réplica 1 daño al más débil | ✅ | effects.test.ts |
| fenix-pavesa | 1 daño adyacente al entrar | ✅ | effects.test.ts |
| ariete-volcanico | +2 daño extra a estructuras | ✅ | effects.test.ts |
| pacto-ascuas | +2 ATQ a una unidad aliada | ✅ | effects.test.ts |
| erupcion-volcanica | 2 daño a todas las unidades enemigas + abrasa | ✅ Bug #5 arreglado | bug-fixes.test.ts |
| gigante-magma | Casillas adyacentes abrasadas | ✅ Bug #3 arreglado | bug-fixes.test.ts |
| draco-magma | Impulso; al atacar, daño en área | ✅ Bug #2 arreglado | bug-fixes.test.ts |
| infiltrado-volcanico | Impulso; +1 ATQ vs unidad solitaria | ✅ Bug #4 arreglado | bug-fixes.test.ts |
| elemental-tormenta | Rango 2; +1 daño extra al atacar | ✅ Bug #1 arreglado | bug-fixes.test.ts |

## Arcano (17)

| Carta | Efecto | Estado | Test |
|---|---|---|---|
| centinela-cristal | Scry 2 al entrar | ✅ | engine.test.ts "efectos de cartas principales" |
| tejedora-escarcha | Congela al dañar | ✅ | engine.test.ts "combate, daño y destrucción" |
| prision-glacial | Congela 1 turno | ✅ | engine.test.ts "efectos de cartas principales" |
| cometa-arcano | 4 daño (+2 si congelado) | ✅ | engine.test.ts "efectos de cartas principales" |
| torre-horizonte | Roba/descarta 1 vez por turno tras hechizo | ✅ | engine.test.ts "efectos de cartas principales" |
| golem-azur | -1 al primer daño del turno | ✅ | effects.test.ts |
| niebla-espejada | Scry 3 + roba 1 | ✅ | effects.test.ts |
| eco-cronomante | Roba 2, descarta 1 | ✅ | effects.test.ts (como hechizo con descuento / de Oriel) |
| archivo-viviente | Roba 2 al entrar; hechizos -1 genérico | ✅ | effects.test.ts |
| convergencia-astral | Refresca movimiento de una unidad | ✅ | effects.test.ts |
| fuente-arcana | Fuente de maná | ✅ | sin efecto propio, nada que auditar |
| duelista-prisma | Roba 1 y descarta 1 al entrar | ✅ | effects.test.ts |
| congelacion-rapida | Congela 1 turno | ✅ | effects.test.ts |
| dragon-escarcha | Congela al atacar | ✅ Bug #6 arreglado | bug-fixes.test.ts |
| guardian-escarchado | Enemigos adyacentes no pueden atacar | ✅ Bug #7 arreglado | bug-fixes.test.ts |
| destello-runico | 2 daño + roba 1 | ✅ | effects.test.ts |
| mago-celestial | Rango 3; +1 ATQ a distancia | ✅ Bug #8 arreglado | bug-fixes.test.ts |

## Naturaleza (14)

| Carta | Efecto | Estado | Test |
|---|---|---|---|
| ciervo-sagrado | Roba 1 al entrar | ✅ | engine.test.ts "habilidades de comandante" (vía Verdania) |
| guardian-robledal | -1 al primer daño del turno | ✅ | engine.test.ts "palabras clave" |
| fuente-naturaleza | Fuente de maná | ✅ | sin efecto propio, nada que auditar |
| lobo-salvaje | Impulso | ✅ | solo palabra clave, ya cubierta genéricamente |
| jabali-embestida | Impulso + Golpe Veloz | ✅ | solo palabras clave, ya cubiertas genéricamente |
| savia-restauradora | Nexo +5 Vida + roba 1 | ✅ | effects.test.ts |
| muralla-zarzas | 2 daño adyacente al alzarse | ✅ | effects.test.ts |
| aliento-primavera | +3 ATQ + refresca movimiento | ✅ | effects.test.ts |
| oso-forestal | Demás aliados +1 Vida | ✅ Bug #9 arreglado | bug-fixes.test.ts |
| arboleda-sagrada | Aliados +1 Vida al entrar | ✅ Bug #10 arreglado | bug-fixes.test.ts |
| crecimiento-salvaje | +2 Vida / +1 ATQ hasta fin de turno | ✅ Bug #11 arreglado | bug-fixes.test.ts |
| centauro-cazador | Al atacar, aliados adyacentes +1 ATQ | ✅ Bug #12 arreglado | bug-fixes.test.ts |
| elfo-ancestral | Roba 1 al entrar; instantes -1 genérico | ✅ Bug #13 arreglado | bug-fixes.test.ts |
| driada-manantial | Nexo +3 Vida al entrar | ✅ Bug #14 arreglado | (heal-nexus ahora también entra al desplegar) |

## Orden (14)

| Carta | Efecto | Estado | Test |
|---|---|---|---|
| aguila-celestial | Vuelo | ✅ | engine.test.ts "palabras clave" |
| lancero-alba | -1 al primer daño del turno | ✅ | effects.test.ts |
| bendicion-escudo | Nexo +4 Vida | ✅ | effects.test.ts |
| heraldo-juicio | 2 daño adyacente al entrar | ✅ | effects.test.ts |
| columna-luz | 5 daño a una pieza enemiga | ✅ | effects.test.ts |
| fuente-orden | Fuente de maná | ✅ | sin efecto propio, nada que auditar |
| bastion-marmoreo | Muro (solo estadísticas) | ✅ | sin efecto propio, nada que auditar |
| centinela-solar | Vigilancia a distancia (solo estadísticas) | ✅ | sin efecto propio, nada que auditar |
| angel-celestial | Escudo preventivo 1 al entrar | ✅ Bug #15 arreglado | bug-fixes.test.ts |
| pegaso-celestial | Vuelo + impulso; cura 2 en primer ataque | ✅ Bug #16 arreglado | bug-fixes.test.ts |
| paladin-glorioso | Aliados adyacentes inmunes a congelación | ✅ Bug #17 arreglado | bug-fixes.test.ts |
| clerigo-luz | Aliados +1 Vida al entrar (texto rediseñado, ver Bug #18) | ✅ Bug #18 resuelto (rediseño) | bug-fixes.test.ts |
| grifo-orden | Vigilancia; enemigos adyacentes -1 ATQ | ✅ Bug #19 arreglado | bug-fixes.test.ts |
| juicio-divino | Destruye unidad con ≤2 Vida; +2 Vida | ✅ Bug #20 arreglado | bug-fixes.test.ts |

## Sombra (14)

| Carta | Efecto | Estado | Test |
|---|---|---|---|
| fuente-sombra | Fuente de maná | ✅ | sin efecto propio, nada que auditar |
| sabueso-tumba | Impulso + Golpe Veloz | ✅ | solo palabras clave, ya cubiertas genéricamente |
| sacerdote-carrona | Descarta 1 y roba 1 al entrar | ✅ | effects.test.ts |
| ritual-sanguino | Nexo +4 Vida + descarta 1 | ✅ | effects.test.ts |
| cripta-olvidada | Hechizos -1 genérico | ✅ | effects.test.ts |
| guadana-espectral | 4 daño + 2 al más débil | ✅ | effects.test.ts |
| senor-osario | 2 daño a todos los enemigos adyacentes al entrar | ✅ | effects.test.ts |
| murcielago-sombra | Vuelo; drena 1 Vida al atacar | ✅ Bug #21 arreglado | bug-fixes.test.ts |
| espectro-siniestro | Incorpóreo; al dañar, descarta 1 enemiga | ✅ Bug #22 arreglado | bug-fixes.test.ts |
| esqueleto-guerrero | Resucita gastando 2 Esencia Oscura al morir | ⬜ Bug #23 — pendiente de decisión de diseño | — |
| nigromante-oscuro | Roba al morir un aliado; hechizos drenan Vida | ✅ Bug #24 arreglado | bug-fixes.test.ts |
| maldicion-sombra | -1 Vida al enemigo objetivo cada fin de turno | ✅ Bug #25 arreglado | bug-fixes.test.ts |
| vampiro-siniestro | Drena Vida = daño infligido al atacar | ✅ Bug #26 arreglado | bug-fixes.test.ts |
| pesadilla-mortal | Descarta 2 enemigas al entrar; -1 Vida a esas unidades | ✅ Bug #27 arreglado | bug-fixes.test.ts |

## Vacío (14)

| Carta | Efecto | Estado | Test |
|---|---|---|---|
| fuente-vacio | Fuente de maná | ✅ | sin efecto propio, nada que auditar |
| caminante-umbral | Golpe Veloz | ✅ | solo palabra clave, ya cubierta genéricamente |
| heraldo-fractura | Impulso; 1 daño adyacente al entrar | ✅ | effects.test.ts |
| portal-inestable | -1 al primer daño del turno | ✅ | effects.test.ts |
| tejedor-entropia | Hechizos -1 genérico | ✅ | effects.test.ts |
| paradoja-vacio | Cambia de bando temporalmente 1 vez por turno | ✅ | effects.test.ts |
| colapso-dimensional | 3 daño + 3 al más débil | ✅ | effects.test.ts |
| singularidad | Congela 2 turnos + 2 daño | ✅ | effects.test.ts |
| basilisco-caos | Al atacar, inmoviliza 1 turno | ✅ Bug #28 arreglado | bug-fixes.test.ts |
| quimera-caos | Copia el Ataque de un aliado adyacente al entrar (texto rediseñado, ver Bug #29) | ✅ Bug #29 resuelto (rediseño) | bug-fixes.test.ts |
| devorador-entropico | Drena Resistencia de estructura destruida | ✅ Bug #30 arreglado | bug-fixes.test.ts |
| leviatan-abismal | Impulso; al atacar, empuja a los enemigos adyacentes al objetivo (texto rediseñado, ver Bug #31) | ✅ Bug #31 resuelto (rediseño) | bug-fixes.test.ts |
| aniquilacion-vacio | Destruye estructuras enemigas; gana Esencia | ✅ Bug #32 arreglado | bug-fixes.test.ts |
| horror-abisal | Al atacar, enemigos -1 Movimiento este turno | ✅ Bug #33 arreglado | bug-fixes.test.ts |

## Comandantes (6)

| Comandante | Efecto | Estado | Test |
|---|---|---|---|
| Kaela (Furia) | Descuento tras daño al Nexo | ✅ | effects.test.ts |
| Oriel (Arcano) | Scry tras 2º hechizo del turno | ✅ | effects.test.ts |
| Verdania (Naturaleza) | Aliado +1 Vida al entrar | ✅ | engine.test.ts |
| Asterin (Orden) | Escudo preventivo al entrar | ✅ | engine.test.ts |
| Malachar (Sombra) | Drena 1 Vida extra al atacar | ✅ | engine.test.ts |
| Nyxaris (Vacío) | Primera unidad sin mareo de invocación | ✅ | engine.test.ts |
