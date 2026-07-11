# Diseño de juego — vertical slice

## Visión

`Crónicas del Nexo` es un juego táctico de cartas para PC en el que las cartas siguen siendo las piezas sobre un tablero de 5 × 5. El valor diferencial no es una colección inmensa, sino la tensión entre economía de mano, colocación espacial y un combate breve de lectura clara.

Este slice responde a una pregunta concreta: **¿es divertido decidir entre desarrollar maná, ocupar una casilla y retirar una amenaza en partidas cortas contra una IA legible?** Todo sistema que no contribuya a probarla queda fuera del primer hito.

## Pilares

1. **La carta es la protagonista.** Arte, nombre, coste y estadísticas siguen visibles en mano, tablero e inspección; no se sustituyen por miniaturas.
2. **Posición con consecuencias.** Alcance, adyacencia, casillas ocupadas y ruta al Nexo convierten cada carta en una decisión espacial.
3. **Ritmo sin fricción.** Las acciones normales se resuelven rápido, los destinos válidos se resaltan y la IA no bloquea el turno.
4. **Identidad mecánica visible.** Furia presiona y convierte vida/posición en daño; Arcano controla el ritmo, congela y filtra cartas.
5. **Reglas antes que espectáculo.** El motor resuelve una acción de forma determinista; después, una cola reproduce su representación visual.

## Contenido del slice

| Elemento | Furia de la Caldera | Secretos del Arcano |
| --- | --- | --- |
| Comandante | Kaela, Corazón de la Caldera | Oriel, Custodio de la Séptima Runa |
| Vida del Nexo | 25 | 25 |
| Cartas del mazo | 50 | 50 |
| Fuentes | 20 × Fuente de Furia | 20 × Fuente Arcana |
| No recursos | 30 | 30 |
| Diseños distintos | 12 | 12 |
| Plan | presión, daño y avance | control, hielo y ventaja de cartas |

Los comandantes quedan fuera del mazo. Las otras cuatro facciones —Naturaleza, Orden, Sombra y Vacío— tienen identidad y colores reservados, pero están bloqueadas y no prometen contenido jugable.

## Preparación y objetivo

- Cada jugador comienza con su Nexo a 25, un mazo barajado mediante semilla y una mano inicial.
- El jugador humano despliega en la fila más cercana a su lado; la IA, en la opuesta.
- Se gana al reducir el Nexo rival a 0. Si el mazo se agota, el slice evita bloquear la partida; una política definitiva de fatiga queda para balance posterior.
- El resumen final muestra ganador, turnos, daño y cartas jugadas, además de repetir o volver al menú.

## Tablero y combate

- Coordenadas: `x=0…4`, `y=0…4`.
- Una unidad normal mueve una casilla ortogonal. Algunas cartas declaran movimiento 2; todas las casillas recorridas deben estar libres.
- Las unidades cuerpo a cuerpo atacan a distancia 1. Una unidad de alcance 2 puede atacar según la métrica y validación expuestas por el motor.
- Una casilla solo puede contener una unidad o estructura.
- Las estructuras no se mueven y usan resistencia en lugar de vida impresa.
- Una unidad recién jugada no ataca ese turno. `Impulso` permite moverla de inmediato, no atacar.
- Cada unidad mueve como máximo una vez y ataca como máximo una vez por turno.
- Al atacar una carta, ambas estadísticas y el resultado se resuelven antes de reproducir golpe, daño y destrucción.
- El Nexo solo es objetivo cuando el motor considera que la línea y el alcance son válidos; la interfaz no ofrece objetivos ilegales.

## Turno

La máquina interna conserva fases explícitas para impedir acciones fuera de contexto:

1. `start`: restaura fuentes y marcas de acción, resuelve caducidades.
2. `draw`: roba la carta de turno.
3. `main`: permite jugar una fuente, cartas y hechizos.
4. `combat`: movimiento y ataques; en la interfaz del slice puede presentarse como una continuidad de la fase principal.
5. `end`: resuelve efectos finales y entrega el turno.
6. `finished`: estado terminal, sin nuevas acciones de juego.

Cancelar una selección nunca consume acción. Finalizar turno sigue disponible aunque no haya movimientos posibles.

## Economía de maná

- Las fuentes están dentro del mazo y no tienen coste.
- Solo se juega una fuente por turno en una zona separada.
- Cada fuente produce un punto de su facción y queda agotada al pagar.
- Al inicio del turno del propietario se restauran todas sus fuentes.
- Primero se reservan los símbolos de color; el coste genérico se paga con cualquier fuente restante.
- La elección de fuentes es determinista para que previsualización y resolución coincidan.
- La interfaz debe indicar fuentes disponibles/totales, fuentes agotadas y coste que falta. Nunca se envía una acción que la previsualización sabe que no se puede pagar.

## Construcción de mazo

- Exactamente 50 cartas: 20 de maná y 30 no maná.
- Mazo monofacción en este slice.
- Máximo 4 copias de una carta normal y 1 de una carta única.
- Comandante conocido, de la misma facción y fuera de las 50.
- El validador devuelve todos los motivos encontrados, no solo el primero.

La pantalla de mazos prioriza inspeccionar las dos listas iniciales y comprender su curva. Un editor libre completo no es requisito de la partida demostrable; si se ofrece edición, la lista inválida se puede guardar como borrador pero no iniciar.

## Facciones jugables

### Furia

Curva temprana, diagonales de ataque y efectos de entrada. `Sabueso de Brasa` y `Lancera de Magma` ganan iniciativa espacial; `Berserker Ignívoro` premia combatir; `Lluvia de Ceniza` y `Temblor Rojo` abren rutas; `Dragón de la Caldera` cierra partidas con riesgo de daño adyacente también para aliados.

El jugador debe sentir que cada turno sin presión tiene un coste. La debilidad provisional es quedarse sin mano y exponer unidades frágiles.

### Arcano

Mejor resistencia, alcance y selección de cartas. `Centinela de Cristal` ordena robos; `Tejedora de Escarcha` y `Prisión Glacial` reducen opciones enemigas; `Gólem Azur` protege; `Cometa Arcano` capitaliza un objetivo congelado; `Archivo Viviente` es el remate de valor.

El jugador debe sentir que prepara dos acciones conectadas. La debilidad provisional es una salida lenta y costes de color más exigentes.

## Efectos y estados

- `frozen`: no mueve ni ataca hasta su caducidad.
- `scorched`: marca visual y efecto temporal declarado por la carta.
- Daño, robo, descarte, observación, bonificación de ataque y daño adyacente se representan como efectos de datos.
- Las pasivas complejas usan identificadores estables. Que exista un identificador no implica que deba vivir en el componente visual.
- La cola de animación incluye actor, objetivo, posiciones, magnitud, `effectId` y duración. Puede acelerarse o simplificarse con movimiento reducido.

## IA del prototipo

La IA usa reglas y puntuaciones, no aprendizaje automático:

1. Juega una fuente si mejora su economía y no ha usado la acción del turno.
2. Enumera solo acciones legales.
3. Puntúa retirada letal, supervivencia, eficiencia de maná, presión al Nexo, avance y exposición.
4. Prefiere ataques que destruyen sin perder una pieza; si puede infligir daño seguro al Nexo, lo valora por encima de intercambios pobres.
5. Desempata con el generador sembrado.
6. Tiene un máximo de acciones por turno y finaliza aunque no encuentre una jugada.

La IA debe ser comprensible y terminar partidas, no simular un oponente competitivo.

## Presentación y accesibilidad

- Inspección disponible por clic secundario o control visible; los términos de reglas ofrecen ayuda contextual.
- Las casillas válidas combinan color, contorno y forma.
- La información esencial no depende solo de rojo/azul.
- `Escape` cancela; el foco de teclado se conserva en menús y diálogos.
- Movimiento reducido elimina inclinación, sacudida y desplazamientos largos sin eliminar confirmación de resultado.
- La cámara es ligeramente isométrica y limitada. Las cartas permanecen de frente lo suficiente para ser reconocibles.

## Límites conocidos y decisiones conscientes

- Solo Furia y Arcano son jugables; no existe progresión, sobres, tienda ni metajuego.
- Los dos mazos son listas cerradas de validación y balance provisional. Veinticuatro diseños no constituyen un entorno coleccionable.
- Reliquia está preparada en datos, pero su zona y su ciclo completo pueden presentarse solo de forma demostrativa.
- Algunas pasivas de las cartas adicionales se apoyan en identificadores de efecto; el slice debe señalar honestamente cualquier pasiva que solo tenga presentación y no resolución completa.
- No hay red, cuentas, guardado en nube, reconexión ni antitrampas.
- El guardado local cubre preferencias y, si está expuesto, borradores de mazo; no es una persistencia de campaña.
- El arte SVG es original y funcional, pero provisional. No sustituye una pasada final de ilustración, iconografía ni accesibilidad de contraste.
- Sonido, partículas y tablero 3D son capas de presentación. El juego debe conservar controles básicos si WebGL o audio no están disponibles.
- El balance busca una partida demostrable, no igualdad competitiva. Requiere telemetría y pruebas humanas antes de ampliar el conjunto.

## Criterio de slice jugable

El hito es válido cuando se puede elegir cualquiera de los dos mazos, iniciar una partida contra IA, jugar fuente y cartas con pago correcto, mover y atacar sobre 5 × 5, terminar turnos, alcanzar victoria/derrota y volver a iniciar; además, la galería muestra e inspecciona los 24 diseños con arte visible. Build y pruebas automatizadas deben pasar sin depender de un servidor externo.
