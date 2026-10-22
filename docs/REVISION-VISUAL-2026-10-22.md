# Revisión artística de cierre — 22 de octubre de 2026

Estado funcional publicado: `481a373` (juego en `2a028a5`, reglas en `3f7b88d`).
588 pruebas en verde, 5 omitidas; build/lint limpios; 85 e2e verdes, 37 omitidas.
Matriz de 12 escenarios: 48 casos verdes, alta/baja a 1920 × 1080 y 1366 × 768.
Las reglas de mano inicial de diez cartas y reciclaje están terminadas y publicadas.

Las verificaciones funcionales y de encuadre no certifican el acabado artístico.
Se conservan **11 tareas V y 39 A** en RENOVACION-VISUAL.md. No están acabadas
las cincuenta mejoras al nivel visual solicitado. Esta revisión deja un orden
concreto de pulido, sin modificar el juego publicado cerca del límite horario.

## Hallazgo prioritario: cielo de Ciudadela en foto orbital

En `ciudadela-foto-orbita.png` aparece un arco azul claro en el primer plano.
Se reproduce con cámara `[20, 12, 8]`, objetivo `[0, 0, 0]`, calidad alta y mano
recogida. La esfera del cielo de DawnAtmosphere tiene radio 70, mientras el
extremo inferior de la banda cilíndrica está a distancia aproximada 86
(`sqrt(50² + 70²)`). El cielo escribe profundidad y tapa parte del panorama.

Una sonda reversible en memoria cambió **solo** la escala de esa esfera de
1 a 1,5 (radio efectivo 105): el arco desaparece manteniendo la cámara en
`[20, 12, 8]`. No se modificó ninguna fuente del juego ni se publicó esa sonda.
El primer intento no servía para comparar porque recoger la mano todavía
estaba recolocando la cámara; la comparación válida espera esa transición
antes de fijar la pose.

Evidencia local en `tools/captures/` (carpeta ignorada):

- `probe-citadel-sky-20261022.mjs`, sonda de un único navegador que se cierra al acabar.
- `ciudadela-cielo-radio70.png`, arco visible.
- `ciudadela-cielo-radio105.png`, misma pose, arco eliminado.

Siguiente implementación propuesta: que el cielo envuelva por completo la
banda y sus desplazamientos, conservando centrado mundial para el invitado.
No basta con ocultar el defecto limitando la cámara. Verificar alta/baja,
1920/1366, ambas poses de foto y encuadre normal; añadir regresión que compare
las envolventes y ejecutar el gate completo antes de entregar. No se inició
ese cambio al cierre porque exige volver a validar batalla y la suite completa
había tardado 7,2 minutos, además de compilación y capturas.

## Pulido artístico pendiente

| Grupo | Evidencia revisada | Qué falta para aceptarlo como acabado |
| --- | --- | --- |
| Ciudadela y Sol | Batalla y vistas amplias | Piedra y arquitectura 3D demasiado uniformes frente al detalle de las pinturas; más jerarquía de desgaste y relieve en los protagonistas. Resolver primero el arco del cielo de Ciudadela. |
| Santuario | Batalla y órbita | Los pilares y dinteles siguen teniendo siluetas demasiado rectas y simples; incorporar fracturas, estratos y apoyos convincentes sin perder las cartas. |
| Caldera | Batalla y órbita | Meseta y prismas volcánicos aún se leen como bloques separados; conectar fracturas, bordes y variación de roca con el paisaje pintado. |
| Fiordo | Batalla y órbita | Los bancos de nieve terminan con cortes rectos visibles desde foto y el barco queda separado de su orilla; resolver transición de hielo/nieve, estratos y escala del protagonista. |
| Claro | Batalla y órbita | La copa del árbol y el tronco necesitan una transición de detalle más natural; evitar masas triangulares repetidas que contrastan con la pintura. |
| Rompiente | Batalla y órbita | El agua conserva reflejo funcional; arco rocoso, faro y plataforma requieren más erosión y una integración de costa menos aislada. |
| Gremio | Batalla y bronce crítico | Mejoró la lectura del Nexo; queda dar oficio a maquinaria y pavimento, y revisar de nuevo fisuras con daño real en movimiento. |
| Jade y Escalinata | Batalla y fotos amplias | El patio conecta mejor con el entorno; aún se percibe diferencia de escala y riqueza material entre edificios pintados y protagonistas 3D. |
| Bestiario | Batalla y órbita | Colmillos y estratos tienen silueta reconocible, pero son demasiado lisos y aislados; trabajar hueso erosionado y una transición orgánica de suelo. |

La primera pasada debe resolver defectos de integración y material, no añadir
partículas para esconderlos. Mantener la carta como pieza, sus estadísticas
legibles, los dos niveles de calidad y el movimiento reducido. Reabrir una tarea
V solo si aparece una regresión concreta; no convertir las A en V por el mero
hecho de que las pruebas automáticas pasen.
