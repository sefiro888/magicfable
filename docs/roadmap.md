# Roadmap

## Criterio de priorización

El orden busca reducir incertidumbre, no acumular pantallas. Primero una partida local completa y verificable; después claridad, balance y herramientas; por último contenido y servicios. Cada hito debe poder demostrarse con un build estático.

## M0 — Fundamento del slice

**Resultado:** proyecto React/TypeScript, navegación, tema, esquemas Zod, seis facciones registradas, 24 cartas originales, dos comandantes y dos mazos válidos de 50.

Aceptación:

- instalación y build reproducibles;
- TypeScript estricto sin errores;
- datos fallan pronto si son inválidos;
- 24 SVG 800 × 560 visibles, uno por diseño;
- preferencias locales versionadas;
- documentación de diseño, arquitectura, arte y esquema alineada con el código.

## M1 — Partida vertical completa

**Resultado:** jugador contra IA desde selección de mazo hasta victoria o derrota.

Aceptación:

- barajado sembrado, mano, robo y una fuente por turno;
- pago de color y genérico con agotamiento/restauración;
- tablero 5 × 5, despliegue, movimiento, ataque y destrucción;
- 25 de vida por Nexo y estado terminal;
- IA solo ejecuta acciones legales, termina turno y puede completar una partida;
- resumen final y opción de repetir;
- pruebas unitarias de reglas y simulación sin bucles.

La prioridad dentro de M1 es que todas las acciones básicas sean reales. Una pasiva adicional puede quedar marcada como no resuelta antes que fingir una implementación.

## M2 — Lectura y presentación

**Resultado:** el mismo juego es fácil de comprender y agradable de manipular.

Aceptación:

- carta reutilizable en mano, tablero, galería e inspección;
- coste, tipo, reglas, narración y estadísticas legibles a 1366 × 768;
- filtros de galería y visor de los dos mazos;
- casillas y objetivos legales inequívocos;
- tablero isométrico con cartas físicas, sombras moderadas y cámara limitada;
- cola de VFX/SFX que no cambia reglas;
- movimiento reducido y degradación segura sin audio/WebGL;
- flujo Playwright de inicio, mazo y primera acción.

## M3 — Cierre de calidad del prototipo

**Resultado:** una build compartible para pruebas internas.

- resolver o retirar de las listas todas las pasivas que no tengan semántica completa;
- probar cada una de las 24 cartas en una partida dirigida;
- balancear curvas, mano inicial y duración con al menos 30 partidas simuladas por emparejamiento;
- auditoría de contraste, teclado, movimiento reducido y textos;
- presupuesto de texturas, canvas pausado fuera de batalla y perfiles de equipo;
- capturas de 1920 × 1080 y 1366 × 768;
- cero errores graves de consola y cero recursos rotos;
- registrar versión y limitaciones conocidas en el cierre.

## M4 — Alfa de contenido local

Solo después de validar M3:

- editor de mazos completo con borradores y mensajes de validez;
- más cartas para dar decisiones reales de construcción;
- vocabulario de disparadores tipado en lugar de proliferar IDs de pasiva;
- arte WebP final por lotes, manteniendo SVG como fallback;
- mezcla de audio original, tutorial corto y registro de combate mejorado;
- replays locales basados en semilla, versión y log de acciones.

No se deben desbloquear todavía las cuatro facciones restantes con listas incompletas.

## M5 — Expansión de facciones

Orden sugerido según contraste mecánico:

1. Naturaleza: curación, crecimiento y economía adicional.
2. Orden: formación, escudos y estructuras.
3. Sombra: descarte, veneno y cementerio.
4. Vacío: portales, intercambio de posiciones y casillas alteradas.

Cada facción exige comandante, mínimo de contenido para un mazo con alternativas, arte e iconos, IA con valoración de su mecánica y pruebas de interacción contra todas las facciones existentes. Registrar una definición bloqueada no cuenta como implementación.

## M6 — Decisión sobre producto conectado

Multijugador, cuentas, nube, ranking o monetización no se inician por inercia. Antes se necesita:

- evidencia de retención y calidad del núcleo local;
- reglas versionadas y protocolo autoritativo;
- diseño de reconexión, tiempo, rendición y resolución de disputas;
- presupuesto operativo, privacidad y moderación;
- estrategia de contenido que no perjudique el balance.

## Deuda conocida que bloquea escalar

- Balance basado en intuición y simulación pequeña, no telemetría humana.
- Conjunto de 24 diseños insuficiente para una economía coleccionable.
- Semántica de ciertas pasivas aún específica de carta.
- Reliquias y persistentes necesitan una zona/ciclo más general antes de crecer.
- Sin localización estructurada, versionado de guardado, replay ni migraciones.
- Arte vectorial provisional y sonido de producción pendiente.

## Próximo hito recomendado

Cerrar M1 y M2 como una única demo de 10–15 minutos, después ejecutar M3. No añadir una tercera facción hasta que una partida Furia–Arcano pueda terminar repetidamente, explicar por qué cada acción es legal o ilegal y mantener legibles las cartas en las dos resoluciones objetivo.
