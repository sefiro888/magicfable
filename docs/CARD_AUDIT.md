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
| Naturaleza | 14 | 2 | 1 | 0 | 11 |
| Orden | 14 | 1 | 0 | 0 | 13 |
| Sombra | 14 | 0 | 1 | 0 | 13 |
| Vacío | 14 | 0 | 1 | 0 | 13 |
| Comandantes | 6 | 6 | 0 | 0 | 0 |
| **Total** | **96** | **35** | **3** | **8** | **50** |

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
| oso-forestal | Demás aliados +1 Vida | ⚠️ | usado como pieza genérica, su aura no se comprueba |
| fuente-naturaleza | Fuente de maná | ⬜ | — |
| lobo-salvaje | Impulso | ⬜ | — |
| arboleda-sagrada | Aliados +1 Vida al entrar | ⬜ | — |
| crecimiento-salvaje | +2 Vida / +1 ATQ hasta fin de turno | ⬜ | — |
| centauro-cazador | Al atacar, aliados adyacentes +1 ATQ | ⬜ | — |
| elfo-ancestral | Roba 1 al entrar; instantes -1 genérico | ⬜ | — |
| driada-manantial | Nexo +3 Vida al entrar | ⬜ | — |
| jabali-embestida | Impulso + Golpe Veloz | ⬜ | — |
| savia-restauradora | Nexo +5 Vida + roba 1 | ⬜ | — |
| muralla-zarzas | 2 daño adyacente al alzarse | ⬜ | — |
| aliento-primavera | +3 ATQ + refresca movimiento | ⬜ | — |

## Orden (14)

| Carta | Efecto | Estado | Test |
|---|---|---|---|
| aguila-celestial | Vuelo | ✅ | engine.test.ts "palabras clave" |
| fuente-orden | Fuente de maná | ⬜ | — |
| angel-celestial | Escudo preventivo 1 al entrar | ⬜ | — |
| pegaso-celestial | Vuelo + impulso; cura 2 en primer ataque | ⬜ | — |
| paladin-glorioso | Aliados adyacentes inmunes a congelación | ⬜ | — |
| clerigo-luz | Aliado sanado gana +1 Vida ese turno | ⬜ | — |
| grifo-orden | Vigilancia; enemigos adyacentes -1 ATQ | ⬜ | — |
| juicio-divino | Destruye unidad con ≤2 Vida; +2 Vida | ⬜ | — |
| lancero-alba | -1 al primer daño del turno | ⬜ | — |
| bastion-marmoreo | Muro (solo estadísticas) | ⬜ | — |
| centinela-solar | Vigilancia a distancia (solo estadísticas) | ⬜ | — |
| bendicion-escudo | Nexo +4 Vida | ⬜ | — |
| heraldo-juicio | 2 daño adyacente al entrar | ⬜ | — |
| columna-luz | 5 daño a una pieza enemiga | ⬜ | — |

## Sombra (14)

| Carta | Efecto | Estado | Test |
|---|---|---|---|
| esqueleto-guerrero | Resucita gastando 2 Esencia Oscura al morir | ⚠️ | usado como atacante en el test de Malachar, su resurrección no se comprueba |
| fuente-sombra | Fuente de maná | ⬜ | — |
| murcielago-sombra | Vuelo; drena 1 Vida al atacar | ⬜ | — |
| espectro-siniestro | Incorpóreo; al dañar, descarta 1 enemiga | ⬜ | — |
| nigromante-oscuro | Roba al morir un aliado; hechizos drenan Vida | ⬜ | — |
| maldicion-sombra | -1 Vida al enemigo objetivo cada fin de turno | ⬜ | — |
| vampiro-siniestro | Drena Vida = daño infligido al atacar | ⬜ | — |
| pesadilla-mortal | Descarta 2 enemigas al entrar; -1 Vida a esas unidades | ⬜ | — |
| sabueso-tumba | Impulso + Golpe Veloz | ⬜ | — |
| sacerdote-carrona | Descarta 1 y roba 1 al entrar | ⬜ | — |
| ritual-sanguino | Nexo +4 Vida + descarta 1 | ⬜ | — |
| cripta-olvidada | Hechizos -1 genérico | ⬜ | — |
| guadana-espectral | 4 daño + 2 al más débil | ⬜ | — |
| senor-osario | 2 daño a todos los enemigos adyacentes al entrar | ⬜ | — |

## Vacío (14)

| Carta | Efecto | Estado | Test |
|---|---|---|---|
| horror-abisal | Al atacar, enemigos -1 Movimiento este turno | ⚠️ | usado en el test de Nyxaris (mareo de invocación), su ralentización no se comprueba |
| fuente-vacio | Fuente de maná | ⬜ | — |
| basilisco-caos | Al atacar, inmoviliza 1 turno | ⬜ | — |
| quimera-caos | Copia habilidad de un aliado al entrar | ⬜ | — |
| devorador-entropico | Drena Resistencia de estructura destruida | ⬜ | — |
| leviatan-abismal | Impulso; al atacar, distorsiona posiciones | ⬜ | — |
| aniquilacion-vacio | Destruye estructuras enemigas; gana Esencia | ⬜ | — |
| paradoja-vacio | Cambia de bando temporalmente 1 vez por turno | ⬜ | — |
| heraldo-fractura | Impulso; 1 daño adyacente al entrar | ⬜ | — |
| portal-inestable | -1 al primer daño del turno | ⬜ | — |
| caminante-umbral | Golpe Veloz | ⬜ | — |
| colapso-dimensional | 3 daño + 3 al más débil | ⬜ | — |
| tejedor-entropia | Hechizos -1 genérico | ⬜ | — |
| singularidad | Congela 2 turnos + 2 daño | ⬜ | — |

## Comandantes (6)

| Comandante | Efecto | Estado | Test |
|---|---|---|---|
| Kaela (Furia) | Descuento tras daño al Nexo | ✅ | effects.test.ts |
| Oriel (Arcano) | Scry tras 2º hechizo del turno | ✅ | effects.test.ts |
| Verdania (Naturaleza) | Aliado +1 Vida al entrar | ✅ | engine.test.ts |
| Asterin (Orden) | Escudo preventivo al entrar | ✅ | engine.test.ts |
| Malachar (Sombra) | Drena 1 Vida extra al atacar | ✅ | engine.test.ts |
| Nyxaris (Vacío) | Primera unidad sin mareo de invocación | ✅ | engine.test.ts |
