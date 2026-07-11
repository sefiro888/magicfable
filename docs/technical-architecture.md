# Arquitectura técnica

## Objetivo

Aplicación local de React + TypeScript estricto construida con Vite. La arquitectura protege una frontera principal: **el motor decide el resultado; React, Three.js, audio y VFX solo lo presentan**. Esto permite probar partidas sin DOM ni WebGL y evita que una animación altere reglas.

## Capas

```text
Datos validados (Zod)
        ↓
Motor puro de reglas ← IA heurística
        ↓ ActionResult + AnimationEvent[]
Estado de partida / orquestación (Zustand)
        ↓
React UI ───── Tablero R3F ───── Audio/VFX
        ↓
Preferencias y borradores locales
```

### Datos

- `src/game/types.ts`: contratos inmutables de cartas, mazos, partida, acciones y eventos.
- `src/game/schemas.ts`: validación Zod en el límite de datos.
- `src/game/cards.ts`, `decks.ts`, `factions.ts`: contenido declarado, no lógica de interfaz.
- Los registros derivados (`CARD_BY_ID`, `DECK_BY_ID`) evitan búsquedas y cadenas duplicadas.

Los datos se validan al cargar en desarrollo y pruebas. Una definición inválida debe fallar pronto con contexto, no convertirse en un error visual tardío.

### Motor de reglas

Funciones puras reciben `MatchState` y `GameAction`, validan legalidad y devuelven `ActionResult`. El estado no se muta. Las responsabilidades se dividen en:

- creación/barajado sembrado de partida;
- plan de pago y agotamiento de fuentes;
- validación de casillas, ruta, alcance y propiedad;
- reproducción de daño, destrucción y estados;
- transiciones de fase/turno y victoria;
- aplicación de efectos declarativos;
- emisión de eventos visuales.

Los errores usan códigos estables (`insufficient-mana`, `occupied`, `out-of-range`, etc.) y un mensaje legible. La UI puede traducir el código sin interpretar el motor.

### Estado y controladores

Zustand conserva la partida activa y estado efímero de interacción: selección, carta inspeccionada, destino señalado y velocidad de presentación. Los selectores deben ser pequeños para evitar redibujar el tablero completo por cada hover.

El controlador despacha una acción una sola vez. Si `ok=false`, muestra el motivo y conserva la selección apropiada. Si `ok=true`, publica el nuevo estado y entrega los eventos a la cola. Ningún callback de animación recalcula daño.

### Presentación React

Las rutas del slice son Inicio, Jugar, Galería, Mazos y Ajustes. Los componentes de carta reciben una definición y un modo (`thumbnail`, `hand`, `board`, `gallery`, `inspection`) y no consultan reglas globales para decidir su contenido.

- CSS Modules encapsula componentes.
- Variables globales definen color, espaciado, elevación y movimiento.
- Framer Motion se limita a transiciones de interfaz y respeta movimiento reducido.
- Error boundaries aíslan la escena 3D y permiten una presentación degradada.

### Tablero 3D

React Three Fiber representa tablero, planos de carta, luces, sombras, selección y proyectiles. Cada carta es una pieza plana con profundidad mínima; no hay criaturas 3D.

- La cuadrícula lógica sigue siendo entera 5 × 5; una función única convierte coordenadas de juego a mundo.
- El raycast devuelve una casilla o un `instanceId`; nunca modifica el estado directamente.
- La cámara isométrica usa límites y un objetivo fijo para impedir perder el tablero.
- Texturas y efectos se precargan al entrar en Jugar, no en la pantalla inicial.
- El render puede reducir DPR, sombras o partículas en equipos modestos sin cambiar reglas.

### Cola audiovisual

`AnimationEvent` es un dato serializable. La cola reproduce en orden eventos cortos como robo, flujo de maná, invocación, movimiento, ataque, daño, destrucción y victoria. Los VFX se resuelven mediante un registro `effectId → factory`; los SFX usan un registro equivalente.

Una opción de velocidad o movimiento reducido modifica duración/presentación, no la secuencia lógica. La cola tiene tiempo máximo por evento y mecanismo de vaciado para evitar bloqueos al navegar.

### IA

La IA usa la misma enumeración y validación de acciones que el humano. Un evaluador puntúa estados y un generador sembrado resuelve empates. Se limita el número de iteraciones y acciones por turno. Las pruebas pueden ejecutar la IA sin temporizadores; el retardo visible pertenece al controlador de presentación.

## Flujo de una acción

1. La UI solicita destinos legales o construye una acción candidata.
2. El motor revalida turno, fase, propiedad, coste y objetivo.
3. Se calcula un plan de pago determinista.
4. Se crea un estado nuevo y se resuelven efectos/victoria.
5. Se adjuntan eventos visuales en el orden causal.
6. El store publica el estado resuelto inmediatamente.
7. La cola reproduce esos eventos; la interacción se bloquea solo donde evite ambigüedad.

La revalidación en el paso 2 es obligatoria incluso cuando la interfaz ya resaltó el destino.

## Recursos

Las cartas declaran dos rutas:

```ts
art: {
  webp: '/assets/cards/art/sabueso-brasa.webp',
  fallback: '/assets/cards/art/sabueso-brasa.svg',
  alt: 'Ilustración de Sabueso de Brasa'
}
```

El cargador intenta WebP y usa SVG al fallar. Ningún import con hash une contenido y código; por ello un artista puede añadir el WebP con el mismo ID. Audio sigue el mismo principio de IDs semánticos y un fallback silencioso seguro.

## Persistencia

No hay backend. `localStorage` guarda únicamente valores versionados y no sensibles:

- volumen maestro, música y efectos;
- silencio, movimiento reducido y calidad gráfica;
- último mazo seleccionado;
- opcionalmente, borradores de mazo.

Cada bloque incluye versión y valores por defecto. Una lectura inválida se descarta sin impedir arrancar. El estado de una partida no se promete persistente en este slice.

## Rendimiento

- Objetivo: interfaz fluida a 60 fps en escritorio medio; degradación aceptable a 30 fps durante VFX densos.
- Presupuesto orientativo por WebP: 450 KB, máximo 700 KB.
- Una textura por carta visible se comparte por caché; no se recrean materiales por frame.
- Instanciar casillas y partículas repetidas; limitar luces con sombra.
- Pausar el canvas cuando la ruta no contiene tablero.
- Evitar selectores de store que devuelvan objetos nuevos en cada render.

## Accesibilidad y resiliencia

- Navegación de menús por teclado y foco visible.
- Estados expresados por forma, texto y color.
- Ajuste de movimiento reducido detecta la preferencia del sistema y permite sobrescribirla.
- Los textos de reglas permanecen en HTML aun cuando la carta se renderiza en 3D.
- Si falta un WebP se usa SVG; si falla audio se continúa; si WebGL no inicia se muestra diagnóstico y acceso al resto de pantallas.

## Estrategia de pruebas

| Nivel | Herramienta | Riesgo cubierto |
| --- | --- | --- |
| Esquemas y mazos | Vitest | datos inválidos, conteos, copias, facción |
| Motor puro | Vitest | maná, turnos, movimiento, alcance, daño, victoria |
| IA | Vitest con semilla | turno finito, acción legal, partida simulable |
| Componentes | Testing Library | carta legible, filtros, selección, ajustes |
| Flujo | Playwright | inicio → mazo → partida → acción básica |
| Arte | parser XML + inspección | SVG válido, 800 × 560, rutas existentes |

Las pruebas de motor no deben montar React. Playwright cubre un camino representativo, no todas las combinaciones de reglas.

## Decisiones y deuda explícita

- La semilla hace repetibles barajado y desempates; no pretende seguridad criptográfica.
- El registro inicial de efectos usa una unión pequeña más IDs de pasivas. Antes de añadir muchas cartas, las pasivas repetidas deben convertirse en efectos declarativos o disparadores tipados.
- Los 24 diseños viven en TypeScript para un slice pequeño. Migrarlos a JSON o herramienta editorial solo compensa cuando autores no técnicos necesiten editar contenido.
- No se implementa servidor «por si acaso». Si llega multijugador, el motor puro puede ejecutarse de forma autoritativa, pero sincronización, versiones y prevención de trampas requerirán diseño propio.
- No se promete guardado de partida ni replay. Los eventos existentes son útiles para presentación, pero un replay fiable exige registrar acciones, versión de reglas y semilla.
- El 3D es presentación progresiva. La validez jugable y las pruebas no dependen de GPU.
