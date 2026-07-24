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

## Estado global (24 jul. 2026)

| Facción | Total | Verificadas | Dudosas | Bugs | Pendientes |
|---|---|---|---|---|---|
| Furia | 17 | 12 | 0 | 5 | 0 |
| Arcano | 17 | 14 | 0 | 3 | 0 |
| Naturaleza | 14 | 8 | 0 | 6 | 0 |
| Orden | 14 | 8 | 0 | 6 | 0 |
| Sombra | 14 | 7 | 0 | 7 | 0 |
| Vacío | 14 | 8 | 0 | 6 | 0 |
| Comandantes | 6 | 6 | 0 | 0 | 0 |
| **Total** | **96** | **63** | **0** | **33** | **0** |

**Auditoría completa: las 96 cartas y comandantes están revisados.** Quedan
33 bugs anotados y pendientes de arreglar en un lote final conjunto (ver
abajo). Nada queda ya por mirar por primera vez.

## Bugs encontrados (pendientes de arreglar todos juntos al final)

1. **Elemental de Tormenta** (Furia) — el texto promete +1 daño adicional al
   atacar; ese efecto no está conectado a nada, nunca se aplica. Arreglo
   pequeño: sumarlo en `attackPiece`, igual que ya se hace con el bono de
   Ariete Volcánico.
2. **Draco de Magma** (Furia) — el texto dice "cuando ataca"; el motor lo
   dispara al entrar en juego (como el Dragón de la Caldera), no al atacar.
   Arreglo mediano: añadir un campo que distinga el disparador (entrada vs.
   ataque) para el efecto `adjacent-damage`.
3. **Gigante de Magma** (Furia) — el pasivo `scorch-adjacents` no está
   conectado a nada: nunca abrasa ninguna casilla. Arreglo mediano
   (propuesto): abrasar las 4 casillas adyacentes al entrar en juego, como
   efecto puntual — un aura que se mueva con la unidad sería mucho más
   trabajo y habría que decidir si compensa.
4. **Infiltrado Volcánico** (Furia) — el pasivo `bonus-damage-isolated-target`
   no está conectado a nada. Arreglo mediano: en `attackPiece`, sumar el
   bono si el objetivo no tiene ninguna otra unidad adyacente.
5. **Erupción Volcánica** (Furia) — el texto promete daño a **todas** las
   unidades enemigas; el motor solo golpea a la única unidad seleccionada
   como objetivo (se comporta igual que Lluvia de Ceniza). Es el más
   grande: el motor no tiene ningún mecanismo de daño en área a "todos los
   enemigos", habría que crearlo desde cero (nuevo tipo de efecto, además
   de enseñarle a la IA a lanzarlo sin elegir objetivo).
6. **Dragón de Escarcha** (Arcano) — el texto dice "cuando ataca, congela
   el objetivo"; el efecto `freeze` de la carta solo se interpreta cuando
   se lanza un hechizo (`resolveSpell`), nunca durante un ataque. El dragón
   nunca congela a nadie. Arreglo mediano: añadir el mismo tipo de gancho
   que ya existe para `freeze-on-damage` (Tejedora de Escarcha), pero para
   congelar en vez de solo marcar el daño.
7. **Guardián Escarchado** (Arcano) — el pasivo `pacify-adjacent-enemies`
   no está conectado a nada: las unidades enemigas adyacentes atacan con
   normalidad. Arreglo mediano: hay que decidir dónde se comprueba esta
   restricción (en `getValidAttacks`, para que ni siquiera aparezca como
   opción).
8. **Mago Celestial** (Arcano) — el pasivo `ranged-attack-bonus` no está
   conectado a nada: nunca gana el +1 Ataque prometido al atacar a
   distancia. Arreglo mediano: sumarlo en `attackPiece` cuando la distancia
   entre atacante y objetivo sea mayor que 1.
9. **Oso Forestal** (Naturaleza) — el pasivo `buff-allied-units-health` no
   está conectado a nada: las demás unidades aliadas no ganan Vida.
   Arreglo mediano: aplicarlo al desplegar cada aliado (similar a Verdania)
   mientras el Oso siga en el tablero.
10. **Arboleda Sagrada** (Naturaleza) — mismo problema que el Oso Forestal
    pero para una estructura: `entry-allied-units-gain-health` no está
    conectado a nada.
11. **Crecimiento Salvaje** (Naturaleza) — el pasivo `unit-buff-health-attack`
    no está conectado a nada. Además, el efecto solo guarda un `value`
    (1), pero el texto promete dos números distintos (+2 Vida y +1
    Ataque): habría que corregir también el dato de la carta, no solo
    conectar el efecto.
12. **Centauro Cazador** (Naturaleza) — el pasivo `attack-buff-nearby-allies`
    no está conectado a nada: al atacar, los aliados adyacentes no ganan
    Ataque.
13. **Elfo Ancestral** (Naturaleza) — roba 1 carta al entrar correctamente,
    pero su otra mitad (`instant-cost-discount`, instantes -1 genérico) no
    está conectada a nada.
14. **Dríade del Manantial** (Naturaleza) — `heal-nexus` solo se interpreta
    cuando lo lanza un hechizo (`resolveSpell`); al ser una unidad, su
    curación de 3 Vida al entrar nunca se aplica. Mismo patrón que el
    Elemental de Tormenta: efecto de "hechizo" puesto en una carta que no
    lo es.
15. **Ángel Celestial** (Orden) — el pasivo `entry-shield-gain` no está
    conectado a nada. El único sitio del motor que concede el estado
    "escudo" está codificado a mano solo para el comandante Asterin; la
    propia carta nunca lo otorga.
16. **Pégaso Celestial** (Orden) — el pasivo `first-attack-heal` no está
    conectado a nada: nunca recupera las 2 de Vida prometidas en su
    primer ataque.
17. **Paladín Glorioso** (Orden) — el pasivo `protect-adjacent-from-freeze`
    no está conectado a nada: sus aliados adyacentes se pueden congelar
    con total normalidad.
18. **Clérigo de Luz** (Orden) — el pasivo `heal-support-buff` no está
    conectado a nada.
19. **Grifo de Orden** (Orden) — el pasivo `weaken-adjacent-enemies` no
    está conectado a nada: los enemigos adyacentes no sufren ningún -1
    Ataque.
20. **Juicio Divino** (Orden) — sí inflige el daño y cura el Nexo, pero le
    falta la restricción que promete el texto ("con 2 Vida o menos"): tal
    y como está implementado (99 de daño sin condición) destruye
    cualquier unidad enemiga, tenga la vida que tenga. Es más fuerte de lo
    que su propio texto dice.
21. **Murciélago Sombra** (Sombra) — el pasivo `drain-life-on-attack` no
    está conectado a nada: nunca drena Vida al atacar.
22. **Espectro Siniestro** (Sombra) — dos problemas: el pasivo
    `unblockable-ghost` no está conectado a nada (se le puede bloquear con
    normalidad), y su descarte no dispara "cuando daña" como dice el
    texto, sino al entrar en juego, y descarta una carta de **su propia
    mano** en vez de una carta enemiga (el mecanismo genérico de
    `discard` al desplegarse siempre descarta del propio dueño de la
    carta que entra).
23. **Esqueleto Guerrero** (Sombra) — el pasivo `undead-resurrection` no
    está conectado a nada: al morir, no ofrece ninguna opción de
    resucitar.
24. **Nigromante Oscuro** (Sombra) — dos problemas: `drain-spells` no está
    conectado a nada, y el robo de carta no dispara "cuando muere un
    aliado" como dice el texto, sino una sola vez al entrar en juego el
    propio Nigromante (mismo patrón de disparador equivocado).
25. **Maldición Sombra** (Sombra) — el pasivo `curse-drain-health` no está
    conectado a nada: la unidad marcada no pierde Vida al final de los
    turnos.
26. **Vampiro Siniestro** (Sombra) — el pasivo `lifesteal-on-attack` no
    está conectado a nada.
27. **Pesadilla Mortal** (Sombra) — mismo problema de "mano equivocada"
    que el Espectro Siniestro: descarta 2 cartas de **su propio** dueño en
    vez de 2 cartas enemigas (el disparador "al entrar en juego" sí es
    correcto esta vez). Además, el pasivo `discarded-units-weaken` no
    está conectado a nada.
28. **Basilisco del Caos** (Vacío) — el texto dice "cuando ataca, sujeta
    (congela) al objetivo"; igual que el Dragón de Escarcha, el efecto
    `freeze` de una unidad solo se interpreta al lanzar un hechizo, nunca
    al atacar. Nunca congela a nadie.
29. **Quimera del Caos** (Vacío) — el pasivo `copy-ally-ability` no está
    conectado a nada: nunca copia ninguna habilidad al entrar en juego.
30. **Devorador Entrópico** (Vacío) — el pasivo `devour-structure-resistance`
    no está conectado a nada: no gana Vida cuando se destruye una
    estructura.
31. **Leviatán Abismal** (Vacío) — dos problemas: el efecto usado
    (`adjacent-damage`) ni siquiera coincide con lo que describe el
    texto (el texto habla de *mover* todas las unidades una casilla, no
    de infligir daño), y además se dispara al entrar en juego en vez de
    "cuando ataca". Habría que decidir primero qué se quiere que haga de
    verdad antes de arreglarlo.
32. **Aniquilación del Vacío** (Vacío) — su único efecto es
    `destroy-all-structures`, que no está conectado a nada. Tal cual está
    hoy, esta carta no hace absolutamente nada al lanzarla (más allá de
    gastar Esencia y descartarse).
33. **Horror Abisal** (Vacío) — el pasivo `slow-enemies-on-attack` no está
    conectado a nada: al atacar, los enemigos no pierden Movimiento.

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
| erupcion-volcanica | 2 daño a todas las unidades enemigas + abrasa | ❌ Bug #5 | — |
| gigante-magma | Casillas adyacentes abrasadas | ❌ Bug #3 | — |
| draco-magma | Impulso; al atacar, daño en área | ❌ Bug #2 | — |
| infiltrado-volcanico | Impulso; +1 ATQ vs unidad solitaria | ❌ Bug #4 | — |
| elemental-tormenta | Rango 2; +1 daño extra al atacar | ❌ Bug #1 | — |

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
| dragon-escarcha | Congela al atacar | ❌ Bug #6 | — |
| guardian-escarchado | Enemigos adyacentes no pueden atacar | ❌ Bug #7 | — |
| destello-runico | 2 daño + roba 1 | ✅ | effects.test.ts |
| mago-celestial | Rango 3; +1 ATQ a distancia | ❌ Bug #8 | — |

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
| oso-forestal | Demás aliados +1 Vida | ❌ Bug #9 | — |
| arboleda-sagrada | Aliados +1 Vida al entrar | ❌ Bug #10 | — |
| crecimiento-salvaje | +2 Vida / +1 ATQ hasta fin de turno | ❌ Bug #11 | — |
| centauro-cazador | Al atacar, aliados adyacentes +1 ATQ | ❌ Bug #12 | — |
| elfo-ancestral | Roba 1 al entrar; instantes -1 genérico | ❌ Bug #13 | (el robo sí funciona; el descuento no) |
| driada-manantial | Nexo +3 Vida al entrar | ❌ Bug #14 | — |

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
| angel-celestial | Escudo preventivo 1 al entrar | ❌ Bug #15 | — |
| pegaso-celestial | Vuelo + impulso; cura 2 en primer ataque | ❌ Bug #16 | — |
| paladin-glorioso | Aliados adyacentes inmunes a congelación | ❌ Bug #17 | — |
| clerigo-luz | Aliado sanado gana +1 Vida ese turno | ❌ Bug #18 | — |
| grifo-orden | Vigilancia; enemigos adyacentes -1 ATQ | ❌ Bug #19 | — |
| juicio-divino | Destruye unidad con ≤2 Vida; +2 Vida | ❌ Bug #20 | (daño y curación sí funcionan; falta la condición de vida) |

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
| murcielago-sombra | Vuelo; drena 1 Vida al atacar | ❌ Bug #21 | — |
| espectro-siniestro | Incorpóreo; al dañar, descarta 1 enemiga | ❌ Bug #22 | — |
| esqueleto-guerrero | Resucita gastando 2 Esencia Oscura al morir | ❌ Bug #23 | — |
| nigromante-oscuro | Roba al morir un aliado; hechizos drenan Vida | ❌ Bug #24 | — |
| maldicion-sombra | -1 Vida al enemigo objetivo cada fin de turno | ❌ Bug #25 | — |
| vampiro-siniestro | Drena Vida = daño infligido al atacar | ❌ Bug #26 | — |
| pesadilla-mortal | Descarta 2 enemigas al entrar; -1 Vida a esas unidades | ❌ Bug #27 | — |

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
| basilisco-caos | Al atacar, inmoviliza 1 turno | ❌ Bug #28 | — |
| quimera-caos | Copia habilidad de un aliado al entrar | ❌ Bug #29 | — |
| devorador-entropico | Drena Resistencia de estructura destruida | ❌ Bug #30 | — |
| leviatan-abismal | Impulso; al atacar, distorsiona posiciones | ❌ Bug #31 | (el efecto ni siquiera coincide con el texto) |
| aniquilacion-vacio | Destruye estructuras enemigas; gana Esencia | ❌ Bug #32 | (no hace nada en absoluto) |
| horror-abisal | Al atacar, enemigos -1 Movimiento este turno | ❌ Bug #33 | — |

## Comandantes (6)

| Comandante | Efecto | Estado | Test |
|---|---|---|---|
| Kaela (Furia) | Descuento tras daño al Nexo | ✅ | effects.test.ts |
| Oriel (Arcano) | Scry tras 2º hechizo del turno | ✅ | effects.test.ts |
| Verdania (Naturaleza) | Aliado +1 Vida al entrar | ✅ | engine.test.ts |
| Asterin (Orden) | Escudo preventivo al entrar | ✅ | engine.test.ts |
| Malachar (Sombra) | Drena 1 Vida extra al atacar | ✅ | engine.test.ts |
| Nyxaris (Vacío) | Primera unidad sin mareo de invocación | ✅ | engine.test.ts |
