# Estado del proyecto y por dónde seguir

Documento de traspaso. Está escrito para que un agente que llega de cero pueda
continuar sin preguntar nada. Última actualización: **22 de octubre de 2026**.

---

## 1. Dónde está el proyecto ahora

| | |
| --- | --- |
| Facciones jugables | **16** |
| Cartas | **424** (90 de NEX-01, 24 de NEX-02 y 31 por cada set de NEX-03 a NEX-12) |
| Comandantes | 22 |
| Escenarios 3D | **10** |
| Estilos de suelo del tablero | **10** (uno por escenario) |
| Tests | 558 en verde, 5 omitidos |

El gate local (`npm run test`, `npm run build`, `npm run lint`) pasa limpio.
La mejora de reposicionamiento de la IA descrita en el punto 10 está guardada
en el commit local `2134dc9`, pendiente de despliegue. Verificación de navegador:
78 pruebas activas en verde y 37 omitidas (capturas bajo demanda), con los hechizos
dirigidos probados a 1920 × 1080 y 1366 × 768. Se actualizaron dos expectativas
antiguas de la galería para que su recuento y altura acompañen al catálogo actual.
Última pasada completa `68781`: 78 e2e verdes, 37 omitidas (22 oct, 11:39). El campo ampliado
saturaba el rasterizado por CPU con tres navegadores. La configuración usa
dos, sin ampliar límites de comprobación. No compilar a la vez que WebGL.
El campo renderiza bajo demanda con movimiento reducido o tras un modal
opaco, conservando reloj de reglas y actualizaciones de React/OrbitControls.
La pose reducida se aplica directamente: no depende de fotogramas futuros.
El mulligan presenta ambos comandantes y el escenario sin otra pantalla.
Su foco y teclado están contenidos. La guía inicial no se superpone a él;
el coach posterior mide con un getter estable y no reinicia su anclaje por
cada render (hacía saltar el botón «Saltar guía» bajo el cursor).
Ciudadela renovada: arquitectura de dovelas/columnas acanaladas en cotas
inferiores, plaza que sostiene las cuatro esquinas del tablero, mármol con
bisel físico y Nexo de caliza. Revisión de calidad alta/baja y mano visible/
recogida a ambas resoluciones en `e2e/scenery-renewal.spec.ts` (opcional).
Vista distante original integrada y documentada en `docs/arte-escenarios.md`.
Caldera renovada: meseta fracturada que sostiene las esquinas, roca
instanciada asimétrica, yunque continuo de cuerno horizontal, lava con canales
entre costras, vapor por capas, paisaje original y luz cálida/fría localizada.
Losas de basalto con bisel físico y normales suaves; Nexo conserva color de
piedra. Matriz visual alta/baja y mano visible/recogida a ambas resoluciones,
con poses amplias de foto. 557 unitarias, build/lint y suite completa 78/37
verdes. Caldera/Ciudadela son avances validados pendientes del pulido global.
Santuario renovado: granito erosionado con mapas minerales y grabados que
siguen la cara, dintel partido en un patio hundido, isla de esquinas cortadas,
pavimento, cuencos de luz fría, bruma por planos y paisaje original. Agua con
reflejo planar real único en alta/media (512/256 px, 24/12 Hz), baja sin captura;
movimiento reducido inmoviliza las ondas. Una sonda cambia una piedra y exige
cambio/restauración de píxeles en el reflejo. Revisado a ambas resoluciones,
alta/media/baja y alta reducida, mano visible/recogida y modo foto. Gate completo
558 unitarias, build/lint y 78/37 e2e verdes. Estos escenarios son avances
validados pendientes de pulido global; las 50 mejoras no están terminadas.
Duna integrada: pilono en talud y gola, relieves propios, fustes en haces y
capiteles papiriformes, lino plegado, obeliscos y patio rectangular excavado.
Panorama original y arena granular. Casillas de arenisca con relieve fino,
bisel y juntas estrechas; la ondulación exterior ya no parece madera en ellas.
Alta/baja y alta reducida a ambas resoluciones revisadas, mano visible/oculta
y dos poses de foto. Unitarias 558/5, build/lint y suite completa 78/37 verdes.
Media y alta reducida también verdes a ambas resoluciones. Queda pulido global, incluido el fondo negro
fuera de la banda de pintura al orbitar (comprobar attach del fallback).
Siguiente: integrar Fiordo. Panorama y borradores de placa, escarcha, casco
naval y fracturas próximos preparados, **sin importar ni verificar todavía**.
Leer el registro para sesiones activas; no duplicar verificaciones.


**Renovación visual en curso hasta el 22 oct 2026 a las 20:00 Europe/Madrid.**
Leer también `docs/RENOVACION-VISUAL.md`: contiene las 50 tareas autorizadas,
el estado individual, capturas, verificaciones y el siguiente bloque. Primero
cartas/tablero, combate e interfaz; escenarios después. No publicar automáticamente.

### Las 16 facciones

`fury` `arcane` `nature` `order` `shadow` `void` — las seis originales
`duna` `fimbul` `samsara` `jade` `olimpo` `sol` `bestiario` `plaga` `marea` `forja`

Cada una tiene su dosier en `docs/FACCION_*.md`: identidad visual, mecánica,
comandante y las 31 cartas con su descripción. **Son la fuente de la verdad
para el arte y el tono**; si algo del código contradice al dosier, suele ser
que el código tomó un atajo, y está anotado en el comentario.

### Los 10 escenarios y quién juega en cada uno

| Escenario | Archivo | Suelo | Facciones |
| --- | --- | --- | --- |
| Aether Citadel | `AetherCitadel.tsx` | `stone` | Arcano, Orden, Olimpo |
| Santuario de las Runas | `RunicSanctuary.tsx` * | `moss` | Sombra, Vacío |
| Fragua de la Caldera | `CalderaScenario.tsx` | `basalt` | Furia, Quinto Sol |
| Necrópolis de Duna | `DunaNecropolis.tsx` | `sand` | Duna, Plaga |
| Fiordo de Fimbul | `FimbulFjord.tsx` | `ice` | Fimbul, Bestiario |
| Claro del Bosque | `VerdantGrove.tsx` | `forest` | Naturaleza |
| Rompiente de Nerith | `TidalShore.tsx` | `tide` | Marea |
| Patio del Gremio | `ForgeYard.tsx` | `forge` | Forja |
| Corte de Jade | `JadeCourt.tsx` | `glaze` | Jade |
| Escalinata de la Rueda | `WheelGhat.tsx` | `sandstone` | Samsara |

\* `SanctuaryScenario.tsx` es solo un envoltorio de una línea sobre
`RunicSanctuary.tsx`. No es código muerto, pero tampoco hace nada: si tocas ese
escenario, el contenido está en el segundo.

Ya **no queda ningún escenario con tres facciones** salvo la Ciudadela, y esas
tres (Arcano, Orden, Olimpo) comparten estética grecolatina a propósito.

---

## 2. Arquitectura en cuatro líneas

- `src/game/` — el motor. Puro, sin React ni Three.js. Estado inmutable
  (`MatchState`), un despachador `applyAction`, y una cola de `AnimationEvent`
  que la interfaz consume después. **Las animaciones nunca deciden reglas.**
- `src/battle/` — el render 3D. `Board3D.tsx` es el orquestador; los escenarios
  van en `scenarios/`, las texturas procedurales en `textures.ts`, los
  obstáculos en `terrain/TerrainMarks.tsx`.
- `src/store/` — Zustand con `persist`. Preferencias y estado de partida.
- `src/pages/`, `src/components/` — interfaz.

Los materiales del escenario usan texturas **procedurales**, dibujadas con Canvas 2D en
`textures.ts`, `materials/` y los auxiliares de escenarios, cacheadas por clave.
Los materiales nuevos se dibujan con código. Las vistas panorámicas originales
generadas con `imagegen` se documentan aparte en `docs/arte-escenarios.md`;
los maestros privados se conservan y el juego consume WebP optimizado.

---

## 3. Lo que cuesta una tarde si no lo sabes

Esta sección es la más valiosa del documento. Todo lo de aquí se descubrió
rompiendo algo.

### 3.1 La cámara: el error que he cometido CUATRO veces

**Desde la renovación del 22 oct:** el lienzo llega bajo los paneles mediante
`--scene-bleed`, mientras el cálculo de encuadre conserva el ancho seguro.
Recoger la mano o quedarse sin cartas también amplía el alto del campo.
`ResponsiveCamera` ajusta distancia/proyección al tamaño efectivo; las cifras
siguientes explican la dirección de vista, pero no sustituyen medir la cámara
real del estado que se esté revisando. No colocar decorado solo a ojo.

La cámara está en `z = 8,8`, mira **37° en picado**, y deja tan poco cielo que
en la práctica **no se ve ninguno**. Consecuencias:

- **El borde superior del cuadro cae en el suelo alrededor de `z = -11`.**
  Todo lo que esté más lejos se dibuja entero fuera de cuadro.
- **Lo alto y lejano NO CABE.** Un edificio de 7 m a 26 de fondo es invisible.
  El decorado que se ve de verdad está **entre 6 y 12 de fondo y por debajo de
  unos 4 de alto**.
- En horizontal el margen es `(8,8 + |z|) · 0,45` (semiángulo de unos 24°).
- **Estar por debajo del suelo no salva.** Lo que decide es el ángulo:
  `atan((y − 6,7) / profundidad)`, comparado con el borde superior que está
  alrededor de **−18,7°**. Un río 2,4 m por debajo del suelo pero a 19,5 de
  fondo daba −17,9° y quedaba fuera.

Víctimas de este error, por orden: el faro del Rompiente, el horno del Patio
del Gremio, el pabellón de la Corte de Jade y el ghat de la Escalinata. **Haz
la cuenta antes de colocar nada.**

### 3.2 Luz

- **Clave cálida ⇒ relleno frío**, y al revés. El sol calienta lo que ilumina;
  lo que queda en sombra lo alumbra el cielo, que es azul. Si pones los dos del
  mismo tono **y el material también lo es**, la escena entera sale de un color
  y no se distingue nada (me pasó en la Escalinata: arenisca rosada + luz
  cálida + niebla cálida = todo óxido).
- **El relleno plano debe ser ~⅓ de la clave**, no ⅔. Un `bumpMap` o un
  `roughnessMap` solo se nota si hay luz DIRECCIONAL que lo module.
- **El ángulo de la clave manda, por el coseno.** Sobre una superficie
  horizontal —el tablero lo es— llega la intensidad por el coseno del ángulo
  con la vertical. A 14° sobre el horizonte llega solo el **24 %** (eso dejó el
  Rompiente casi negro); a 32°, el 53 %. **La ventana buena es 30-45°.**
- **R3F aplica ACESFilmicToneMapping por defecto.** Pasarse de luz sobre
  materiales claros no recorta: DESATURA hacia el blanco y se lleva la textura.
  Con piedra o arena claras, el total (clave + relleno) no debería pasar
  de ~4,3.
- Las luces que proyectan sombra necesitan `shadow-camera-left/right/top/bottom`
  explícitos (el ±5 por defecto recorta) y `shadow-bias={-0.0006}`.

### 3.3 Materiales

- **Subir `metalness` sin mapa de entorno deja el material NEGRO.** Era el
  caso de las escenas antiguas. Ahora `MaterialEnvironment` captura tres
  paneles neutros propios una vez, sin HDR externo: los filetes de carta
  admiten metalness 0,6. Piedra y papel siguen en ≤ 0,05. No convertir todo
  en metal ni confundir ese entorno con reflejos de piezas en el suelo,
  que todavía están pendientes en la lista de renovación.
- **Los mapas de datos (rugosidad, normales) NO pueden ir en sRGB.**
  `finishTexture()` marca todo como `SRGBColorSpace`, que está bien para color
  pero no para datos. Sobrescribe con `NoColorSpace` después.
- `scale={[-1,1,1]}` **+** `side={BackSide}` en una cúpula de cielo se cancelan
  y la dejan invisible. Con `BackSide` basta.
- En una cúpula esférica **`v = 0` es el cénit y `v = 1` el NADIR**: el
  horizonte está en la MITAD de la textura. Puse un atardecer entre 0,82 y 1 y
  quedó enterrado bajo el mar.

### 3.4 Composición

- **Nunca plantes decorado en círculo completo alrededor del tablero.** La
  cámara mira desde z positivo, así que el arco cercano (`sin(ángulo) > 0,1`)
  cae ENTRE el jugador y el tablero. Pasó con los troncos del Claro (un tronco
  negro cruzaba media pantalla) y con los monolitos del Santuario.
- **El tablero es CUADRADO**: su media diagonal mide `3,68 × √2 = 5,20`. Un
  anillo de decorado tiene que ir por fuera de 5,20, no de 3,68.
- **Un objeto del lado por el que entra el sol se ve solo en sombra.** Si la
  clave viene de x negativo, lo que plantes en x negativo enseña a la cámara su
  cara oscura. Se resuelve moviéndolo, no subiendo luces.
- **La niebla tiene dos fallos simétricos y he cometido los dos**: demasiado
  cerca se traga el fondo y el sitio queda vacío; demasiado lejos deja el
  decorado FUERA de ella y, si además está a contraluz, se ve como un recorte
  negro. **La niebla tiene que empezar antes de donde está el decorado.**

### 3.5 Cómo verificar de verdad lo que se ve

Las capturas del panel del navegador salen a escala reducida y **no sirven**
para juzgar una escena. Lo que sí funciona:

- `canvas.toDataURL()` devuelve NEGRO (el `<Canvas>` va con
  `preserveDrawingBuffer: false`).
- **`gl.readPixels` dentro de un `requestAnimationFrame` SÍ funciona**: R3F
  registró su bucle antes, así que su render ya ocurrió y el búfer aún no se ha
  compuesto. Ojo: la fila 0 va ABAJO, hay que invertir la Y.
- Promediando por celdas en una rejilla (48×22) y mapeando cada celda a una
  letra por tono sale un **mapa ASCII de la escena** que sí se puede leer: dónde
  está cada cosa y de qué color. Es lo que destapó que el pabellón de Jade
  estaba fuera de cuadro.
- **Cuidado al interpretarlo**: la mitad rival del tablero queda MUY comprimida
  por la perspectiva (una banda fina arriba, no media pantalla). Yo la leí mal
  y estuve a punto de «arreglar» un tinte que funcionaba.
- Para estados transitorios (casillas chamuscadas, estados de pieza) el truco
  es inyectar el estado en `localStorage['cronicas-nexo-match']` y recargar.

---

## 4. Recetas

### 4.1 Añadir una facción

El sistema de tipos te guía en casi todo: añade el id a `FACTION_IDS`
(`src/game/types.ts`) y `tsc` va señalando los `Record<FactionId, X>` que
faltan. Los sitios:

`factions.ts` (definición + `FACTION_BY_ID`) · `schemas.ts` (coste de maná **y**
los efectos nuevos en la unión Zod) · `cardLabels.ts` · `FactionSigil.tsx`
(nombre + icono SVG) · `EventEffects.tsx` · `scenarioForFaction.ts` ·
`PlayPage.tsx` (3 cartas destacadas + descripción) · `cards.ts` (bloque de
cartas + `CARDS` + la guarda de recuento) · `decks.ts` (comandante + mazo +
`STARTER_DECKS`).

**Ojo con `schemas.ts`: `tsc` NO lo pilla.** Si olvidas registrar un efecto
nuevo en la unión Zod, el catálogo revienta en tiempo de ejecución al cargarse,
y todos los tests fallan a la vez con un error que no señala la causa.

**Recuentos que hay que subir a mano** (el CI los comprueba): `data.test.ts`
(nº de facciones, de cartas, de comandantes, lista literal de ids, tabla
`newFactionSets`), `alt-commanders.test.ts` (`soloCommanderFactions`),
`engine.test.ts` (`SOURCE_BY_FACTION`) y `balance-sim.test.ts`.

Un mazo son 50: 20 fuentes + 30 no-fuente. Cuadra la suma antes de correr los
tests o pierdes una vuelta.

### 4.2 Añadir un escenario

Tocar: `ScenarioId` (`store/preferences.ts`) · `TERRAIN_STYLE`, el `lazy()` y
la rama del switch (`battle/Board3D.tsx`) · `HOME`
(`battle/scenarioForFaction.ts`) · `SCENARIOS` (`pages/PlayPage.tsx`) ·
`MusicTheme` y `AMBIENCE` (`services/audio.ts`).

Si además lleva suelo propio: `BoardTileStyle` y los tres switches de
`textures.ts` (color, relieve, rugosidad), más `ZONE_TINTS_BY_STYLE`,
`NEXUS_STONE`, `BoardAtmosphere` y `Midline` en `Board3D.tsx`, `DRIFT` en
`BoardDrift.tsx` y `TERRAIN_LOOK` + las dos ramas de obstáculos en
`terrain/TerrainMarks.tsx`.

### 4.3 Editar `cards.ts`

Es un archivo enorme y los heredocs de shell se rompen con él. Escribe el
script de parcheo a un archivo temporal y ejecútalo con `python <ruta>`: evita
todos los problemas de comillas y acentos.

---

## 5. Audio

Cada escenario tiene su perfil en `AMBIENCE` (`services/audio.ts`) con **cuatro
capas**: `air` (lecho de ruido), `drone` (tono grave), `detail` (sucesos
sueltos) y `motif` (la música). Más `echo`, que es la reverberación propia del
sitio.

La música **no es un bucle a propósito**: es un paseo aleatorio por los grados
de una escala, en frases cortas separadas por silencios largos. Esto suena
debajo de una partida de media hora y una melodía cerrada se aprende a la
tercera vuelta. Lo que distingue un sitio de otro es el **modo**: frigio
dominante en la Caldera, pentatónica en la Corte de Jade, Bhairav en la
Escalinata.

**`echo.feedback` tiene que quedarse por debajo de 0,5**: por encima el eco se
suma a sí mismo y satura la mezcla.

El doble de audio para tests está en `src/test/fakeAudioContext.ts`. Si usas un
nodo de WebAudio que no esté ahí, los tests fallan (me pasó con `createDelay`).

---

## 6. Equilibrio

Hay un banco de pruebas en `src/game/balance-sim.test.ts`. **No forma parte del
gate**; se lanza a mano:

```bash
RUN_BALANCE=1 BALANCE_SEEDS=12 npx vitest run src/game/balance-sim.test.ts
```

Juega todos los cruces con la MISMA IA en los dos bandos y cada emparejamiento
en los dos asientos, así que las diferencias son del mazo.

### Último ranking (5 sep 2026, 2880 partidas)

Samsara 82 · Bestiario 80 · Olimpo 75 · Plaga 73 · Jade 71 · Orden 58 ·
Arcano 50 · Fimbul 48 · Furia 41 · Forja 40 · Vacío 40 · Naturaleza 39 ·
Sombra 31 · Duna 29 · Marea 28 · Quinto Sol 20

**El reparto está muy abierto**: cinco facciones por encima del 70 % y cinco por
debajo del 40 %. Es el problema de equilibrio más gordo que hay ahora mismo.

### Dos cosas que conviene no repetir

1. **Antes de tocar cartas, descarta un fallo de integración.** Los tests
   unitarios de los ayudantes no prueban que el efecto llegue a la partida. Una
   sonda que imprima el tablero real lo resuelve en minutos.
2. **Mira si la IA está gastando el arranque en estructuras.** Marea salió al
   16 % y lo que más subió la aguja (22 → 28 %) fue quitarle las dos estructuras
   del mazo: la IA gastaba los turnos 3 y 4 levantándolas mientras el rival
   desplegaba.

### Lo que NO hay que sobreajustar

Marea (28), Duna (29) y Quinto Sol (20) comparten diagnóstico: su valor es
**posicional o de recursos**, y la IA valora presencia y daño pero no
reposicionamiento ni pagar costes. Apretarlos más sería ajustar contra el
jugador equivocado. Necesitan que una persona los juegue.

Samsara (82) ya se dio por **techo estructural**: viene de su comandante y de
Renacer, no de una carta suelta, y el dueño del proyecto decidió no recortar
más la lista sin playtesting humano.

---

## 7. Lo que está pendiente

### Bloqueado, esperando al dueño del proyecto

- **Facción Enjambre.** El dosier está (`docs/FACCION_ENJAMBRE.md` + PDF) y el
  arte también, en `tools/art-inbox/enjambre-ilustraciones`, **pero los 32
  archivos tienen nombres genéricos** (`exec-<uuid>.png`) en vez del id de cada
  carta, que es como venían las demás facciones. Hasta que se renombren no se
  puede importar. El dueño dijo que lo haría él.

### Decisiones firmes (no re-litigar)

- **Facción Anunna**: diseño y arte existen, pero fue **descartada**. No
  integrar sin que lo pidan.
- **PvP local**: aparcado explícitamente.
- **Inglés / i18n**: aparcado, «mucho mucho más adelante».
- **Escenario «Bastión de los Pilares»** (repo aparte): probado y rechazado.
- Todas las facciones abiertas desde el principio, sin progresión ni desbloqueos.

### Verificado solo a medias

Las capturas del panel salen pequeñas, así que de los escenarios nuevos está
confirmada la composición, el color y que nada tape el tablero, **pero el
detalle fino de las texturas no**. Y la música **nunca se ha oído**: está
verificada por estructura (tests) y por lectura del grafo de audio.

---

## 8. Ideas para seguir

No están ordenadas por prioridad, sino agrupadas. Son propuestas: conviene
contrastarlas con el dueño antes de meterse en las grandes.

### Visual — barato y con mucho retorno

1. **Sombras de contacto bajo las unidades.** Hay una textura
   (`contactShadowTexture`) ya hecha. Las piezas tienden a parecer flotando
   sobre la losa; una mancha suave bajo cada una las asienta.
2. **El tablero no reacciona al ciclo de la partida.** La luz es idéntica en el
   turno 1 y en el 30. Un desplazamiento lentísimo de la clave (el sol avanzando
   unos grados por turno) daría sensación de duración sin distraer.
3. **Las casillas amenazadas, de despliegue y válidas comparten vocabulario con
   los avisos de daño.** Vale la pena revisar que un jugador nuevo distinga de
   un vistazo qué es información y qué es decorado.
4. **Reflejo de las piezas en los suelos brillantes.** El Rompiente (roca
   mojada), la Corte (esmalte) y el Patio (acero) tienen rugosidad muy baja y se
   nota que les falta devolver algo. Sin `envMap` no hay reflejo real, pero una
   copia espejada y muy transparente de la pieza bajo la losa es barata.
5. **Los seis escenarios antiguos no tienen el nivel de los cuatro nuevos.**
   Ciudadela, Santuario, Caldera, Duna, Fiordo y Claro se hicieron antes de
   aprender lo de la sección 3. Revisarlos con esas reglas en la mano —sobre
   todo la del encuadre— probablemente destape decorado invisible.

### Visual — más grande

6. **Un escenario propio para las facciones que aún comparten.** Quedan Arcano,
   Orden y Olimpo juntos en la Ciudadela (coherente), pero Furia/Quinto Sol y
   Fimbul/Bestiario podrían separarse. Quinto Sol (mexica: obsidiana, sangre,
   cuenta de los días) es la que más chirría en la Caldera.
7. **Animación de las cartas al entrar en juego.** Ahora aparecen; podrían
   llegar.

### Jugabilidad

8. **El reparto de victorias está muy abierto** (sección 6). Es el problema más
   gordo. Pero ojo: buena parte se explica por límites de la IA, no de las
   cartas, así que lo primero es decidir si se arregla la IA o las listas.
9. **La IA no planifica a varios turnos vista.** Es la causa de que los mazos de
   control rindan por debajo. Mejorarla levantaría a Arcano, Marea, Duna y
   Quinto Sol de golpe, sin tocar una sola carta — probablemente el cambio con
   más efecto por línea escrita de todo el proyecto.
10. **La IA ya valora los hechizos de reposicionamiento** (21 oct 2026).
    Resaca Súbita, Canto de la Sirena, Marea Viva y Vorágine se simulan con
    `applyAction`: se compara material, intercambios habilitados y amenaza al
    Nexo en la siguiente respuesta rival, incluyendo mover antes de atacar.
    Conserva empujes inútiles y evita atracciones peligrosas. Se corrigió
    además la integración de `push-target`: faltaba en `spellNeedsPiece`, por
    lo que Resaca y Canto se podían gastar sin objetivo y sin mover nada.
    Las pruebas de `ai-positioning.test.ts` cubren los efectos reales en ambos
    asientos, inmunidad, bloqueo, remate, atracción y aturdimiento.
    **Pendiente:** valorar el empuje de ataques y despliegues, planear varios
    turnos y medir de nuevo el balance. La amenaza prevista es conservadora:
    prueba cada atacante por separado, sin combinaciones ni mano rival.
11. **`Esqueleto Guerrero`** sigue sin arreglar a propósito: resucitar es una
    acción de jugador con coste y UI propia, una feature de verdad y no un
    bugfix. No la emprendas sin que lo pidan.
12. **Las partidas duran mucho** (media de 55 turnos en simulación, mediana 47).
    Merece la pena mirar si eso es lo que se quiere.

### Mantenimiento

13. **`Board3D.tsx` ha vuelto a crecer.** Los obstáculos ya se extrajeron a
    `terrain/`; los tintes, la atmósfera y la costura del mediocampo podrían
    seguir el mismo camino.
14. **`SanctuaryScenario.tsx`** es un envoltorio de una línea. O se le da
    contenido o se elimina y se usa `RunicSanctuary` directamente.
