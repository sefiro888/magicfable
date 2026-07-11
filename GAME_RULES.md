# GAME_RULES — Reglas de Crónicas del Nexo (vertical slice)

Reglas consolidadas de la primera experiencia jugable. Este documento es la
referencia canónica; `docs/game-design.md` conserva la visión original.

## 1. Partida

- **Jugadores**: 2 (humano contra IA en este slice).
- **Vida inicial**: cada Nexo comienza con **25** puntos.
- **Mazo**: exactamente **50 cartas** — 20 fuentes de Esencia + 30 cartas de
  acción. Máximo 4 copias por carta normal; 1 copia si es única (✦).
- **Comandante**: cada mazo tiene un comandante fuera del mazo, con una
  pasiva propia que define el estilo de la facción.
- **Mano inicial**: 5 cartas.
- **Mulligan**: una única vez, al comienzo, puedes devolver cualquier
  subconjunto de tu mano y robar el mismo número de reemplazos.
- **Victoria**: reduce el Nexo rival a 0.
- **Derrota**: tu Nexo llega a 0.
- **Mazo agotado**: no se roba (sin daño por fatiga en este slice; pendiente
  de balance posterior, documentado como decisión provisional).

## 2. Esencia (el recurso)

La **Esencia** es la energía residual de las runas quebradas del Santuario.
Cada facción canaliza una variante:

| Facción | Variante | Carta fuente |
| --- | --- | --- |
| Furia | **Esencia Carmesí** | Fuente de Furia |
| Arcano | **Esencia Celeste** | Fuente Arcana |
| (futuras) | Verde, Áurea, Umbría, del Vacío | reservadas |

- Puedes jugar **una fuente por turno** desde la mano (no cuesta nada).
- Cada fuente en tu reserva produce 1 de Esencia de su variante por turno.
- Pagar una carta **agota** fuentes (giradas/apagadas). Al comenzar tu
  turno, todas tus fuentes se **restauran**.
- Los costes tienen parte **de color** (solo pagable con esa variante) y
  parte **genérica** (pagable con cualquier variante).
- La interfaz muestra siempre: Esencia disponible / total, fuentes agotadas
  y qué fuentes se gastarían al pagar la carta seleccionada.

## 3. Estructura del turno

1. **Inicio**: tus fuentes se restauran; tus piezas limpian sus marcas de
   movimiento/ataque; expiran estados caducados.
2. **Robo**: robas 1 carta.
3. **Principal**: en cualquier orden — jugar 1 fuente, desplegar unidades y
   estructuras (pagando su coste) en tu **fila de despliegue**, lanzar
   hechizos, mover y atacar con tus piezas.
4. **Fin**: pulsa «Finalizar turno»; el rival comienza su turno.

## 4. El tablero

- Rejilla de **8 × 8** casillas (64 en total) sobre la plataforma del Santuario.
- Tu fila de despliegue es la más cercana a tu Nexo; la de la IA, la opuesta.
- Una casilla solo admite una pieza (unidad o estructura).
- Tu **Nexo** está detrás de tu fila; solo puede ser atacado si el atacante
  tiene línea y alcance hasta él.

## 5. Piezas

- **Unidades**: tienen Ataque (ATQ) y Vida (VID). Mueven en ortogonal
  (movimiento 1 salvo que indiquen otro valor) con la ruta libre; atacan a
  distancia ≤ alcance (1 salvo indicación) con línea recta libre.
- **Estructuras**: no se mueven ni atacan; tienen Resistencia (RES). Ocupan
  y bloquean la casilla.
- Una pieza recién jugada **no puede actuar ese turno** (mareo de
  invocación), salvo palabras clave.
- Cada unidad puede mover **una vez** y atacar **una vez** por turno.
- Al atacar a una pieza, el atacante inflige su ATQ (más modificadores) a la
  vida/resistencia del objetivo. El daño **permanece** entre turnos.
- Una pieza con vida/resistencia 0 se destruye y va al descarte de su dueño.

## 6. Hechizos

- **Inmediatos**: efecto único y van al descarte.
- **Persistentes**: efecto que deja huella (congelación, casilla abrasada…)
  y van al descarte tras resolverse.
- Si un hechizo necesita objetivo, la interfaz solo ilumina objetivos
  legales; sin objetivo legal, no puede lanzarse.

## 7. Estados y palabras clave del slice

| Término | Significado |
| --- | --- |
| **Impulso** | Puede moverse el turno en que entra en juego (no atacar). |
| **Golpe veloz** | Puede atacar el turno en que entra en juego. *(reservada)* |
| **Congelada** | No puede mover ni atacar hasta que expire. |
| **Abrasada** (casilla) | Casilla marcada por fuego hasta que expire. |
| **Guardia** | Presencia defensiva; bloquea la ruta como toda pieza. |
| **Canalizar** | Marca sinergias de Esencia. *(reservada)* |
| **Agotada** | Fuente ya gastada este turno / pieza que ya actuó. |
| **Única ✦** | Máximo una copia por mazo. |

## 8. Efectos implementados por el motor

- Daño directo (a pieza enemiga o cualquiera), daño adyacente al entrar,
  daño adicional contra estructuras, bonus al atacar.
- Congelar (con bonus de daño sobre objetivos congelados: Cometa Arcano).
- Robar, descartar, mirar y reordenar la parte superior del mazo (scry).
- Curar el Nexo (hasta su máximo).
- Reducción del primer daño recibido cada turno (Gólem Azur).
- Descuento genérico de hechizos (Archivo Viviente).
- Refrescar el movimiento de una unidad aliada (Convergencia Astral).
- Réplica de daño sobre la unidad enemiga más debilitada (Temblor Rojo).
- Pasivas de comandante: Kaela (descuento tras recibir daño el Nexo),
  Oriel (observar la primera carta tras el segundo hechizo del turno).
- Buff del primer despliegue de Furia (Forja Carmesí) y robo/descarte tras
  hechizo (Torre del Horizonte).

Regla de oro: **si el texto de una carta lo promete, el motor lo cumple**.

## 9. Límites

- Sin límite de tamaño de mano en este slice (documentado; el robo es lento
  por diseño).
- La IA está acotada a 64 acciones por turno (garantía anti-bucle).
- Todo el azar deriva de la semilla de la partida: una misma semilla y los
  mismos mazos reproducen la misma partida.
