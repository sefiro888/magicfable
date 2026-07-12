# GAME_DESIGN_ANALYSIS — Estado de los sistemas de juego

Análisis sistema a sistema del proyecto tal como se encontró (2026-07-11),
con veredicto sobre reutilización. Complementa a `PROJECT_AUDIT.md` y a
`docs/game-design.md` (visión original del slice).

Leyenda de veredicto: ✅ funciona y se conserva · 🔧 funciona pero se mejora ·
🩹 incompleto, se completa en esta fase · ❌ no existe.

| Sistema | ¿Existe? | ¿Funciona? | Veredicto | Notas |
| --- | --- | --- | --- | --- |
| Turnos alternos | Sí | Sí | ✅ | `endTurn` restaura fuentes y marcas |
| Fases (`start/draw/main/combat/end/finished`) | Sí | Sí | 🔧 | La UI mostraba el nombre interno en inglés; se traduce y se hace legible |
| Mano | Sí | Sí | 🔧 | Lógica correcta; presentación plana → abanico con marco rico |
| Mazo (50 cartas, semilla) | Sí | Sí | ✅ | Barajado determinista reproducible |
| Robo | Sí | Sí | ✅ | 1 por turno + efectos de robo |
| Mulligan | Sí | Sí | ✅ | Único, parcial, al inicio |
| Descarte | Sí | Sí | ✅ | Pila por jugador, efectos de descarte |
| Recursos (fuentes con color) | Sí | Sí | 🔧 | Sólido; recibe identidad «Esencia» (nombre, variantes, UI) |
| Pago de costes (color + genérico) | Sí | Sí | ✅ | `planManaPayment` con plan visible en el HUD |
| Invocación / despliegue | Sí | Sí | ✅ | Fila propia, casilla libre |
| Movimiento | Sí | Sí | ✅ | Ortogonal, ruta libre, Impulso |
| Ataques (pieza y Nexo) | Sí | Sí | ✅ | Alcance, línea, marcas por turno |
| Bloqueos | Implícito | Sí | ✅ | El bloqueo es posicional (piezas cierran rutas); no hay fase de bloqueo tipo Magic y no se añade: la identidad del juego es táctica espacial |
| Resolución de daño | Sí | Sí | 🔧 | Correcta; faltaba `first-damage-reduction` (Gólem) → se implementa |
| Vida del jugador (Nexo 25) | Sí | Sí | ✅ | |
| Muerte / destrucción | Sí | Sí | 🔧 | Correcta; faltaba VFX/feedback → director de animaciones |
| Estados (congelada, abrasada) | Sí | Parcial | 🔧 | Motor sí; visibilidad en tablero pobre → estados visuales |
| Efectos de cartas | Sí | Parcial | 🩹 | 8 pasivas declaradas sin resolver (ver PROJECT_AUDIT §5.1) → se implementan o se reescriben con honestidad |
| Scry / observar | Motor sí, UI no | Parcial | 🩹 | `reorderTopCards` existe; falta UI de revelación/orden |
| Comandantes | Sí | Parcial | 🩹 | Definidos y visibles; sus pasivas no se resolvían → se implementan |
| IA | Sí | Sí | 🔧 | Legal, determinista, acotada; se adapta a los efectos nuevos |
| Condición de victoria | Sí | Sí | ✅ | Nexo a 0 |
| Condición de derrota | Sí | Sí | ✅ | Tu Nexo a 0; mazo vacío no mata (robo se omite): decisión provisional aceptada, documentada en GAME_RULES |
| Animaciones | Cola emitida, no consumida | No | 🩹 | El motor emite `AnimationEvent[]`; la vista solo pintaba un pulso genérico → director secuencial |
| Sonido | Sí (sintetizado) | Sí | 🔧 | Placeholders legítimos; se conectan a la cola de eventos |
| Escenario | No | — | ❌→🩹 | Se construye «El Santuario de las Runas Quebradas» |
| Guardado de partida | No | — | ❌ | Fuera de alcance del slice (preferencias sí persisten) |
| Multijugador | No | — | ❌ | Fuera de alcance declarado |

## Errores conceptuales detectados

1. **Cartas con texto sin efecto** — el mayor riesgo de confianza del
   jugador. Decisión: cada carta del set debe cumplir su texto o cambiar su
   texto. Nada de reglas fantasma.
2. **Animación desacoplada del estado** — correcto en diseño (el motor
   resuelve primero), pero la vista ignoraba la cola, perdiendo todo el
   impacto. Decisión: director de animaciones que consume la cola en orden,
   con omisión y velocidad.
3. **Recurso sin identidad** — «maná» genérico contradice la dirección
   creativa. Decisión: «Esencia» (Carmesí para Furia, Celeste para Arcano),
   sin cambiar la mecánica subyacente, que es sólida.

## Qué NO se rediseña (y por qué)

- **El sistema de recursos** (20 fuentes en 50 cartas, 1 por turno, colores):
  es comprensible, estratégico (¿fuente o presión?), evita el «mana screw»
  extremo gracias al mulligan y densidad 40 %, y escala a nuevas facciones.
- **El tablero táctico** (8 × 8 desde julio de 2026; 5 × 5 en el slice original): es la identidad diferencial frente a Magic/Hearthstone.
  El encargo pide identidad propia; esta ya existe y funciona.
- **El formato de mazo 50 = 20 + 30** con máximo 4 copias (1 si única).
- **La estructura de datos de cartas** (CardDefinition + Zod): cumple todo lo
  que pide la dirección (id, tipo, subtipo, facción, coste, arte, rareza,
  stats, palabras clave, reglas, narrativa, vfx, sfx, estado) y es ampliable.
