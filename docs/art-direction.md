# Dirección artística — Crónicas del Nexo

## Propósito visual

`Crónicas del Nexo` combina fantasía oscura elegante, materiales antiguos y magia de alto contraste. La carta es siempre la miniatura, la interfaz y la pieza de juego: el tablero, los efectos y el entorno deben enmarcarla, nunca competir con ella. La imagen debe poder leerse en tres escalas: una masa cromática inequívoca en mano, una escena reconocible sobre el tablero y una narración rica al inspeccionarla.

Las ilustraciones provisionales son vectores originales de 800 × 560. No contienen texto ni marcos y se pueden sustituir individualmente por arte final WebP manteniendo el mismo identificador.

## Dirección de atelier

Cada carta debe sentirse como una pieza comisionada a un pequeño equipo, no como una plantilla repetida. El crédito visible puede incluir dos artistas ficticios y un taller de especialidad: dirección de criatura, color script, composición, acabado pictórico o iluminación. La intención no es imitar artistas reales vivos, sino dar variedad de oficio dentro de una biblia visual común.

Los respaldos SVG de prototipo siguen esta lógica:

- Furia alterna mural épico, óleo heroico, pintura ritual íntima, paisaje cataclísmico y perspectiva baja.
- Arcano alterna acuarela lumínica, retrato simbolista, arquitectura fría, geometría cósmica y criatura mineral.
- Las cartas míticas y comandantes reciben composición más central, más halo y lectura de escala.
- Las cartas comunes mantienen silueta rápida, pero con mejor luz, grano, profundidad y formas menos infantiles.

## Lenguaje de facción

| Facción | Base | Luz mágica | Sombra | Forma y material | Estado en este slice |
| --- | --- | --- | --- | --- | --- |
| Furia | `#9f261f` | `#ffb13b`, `#fff0a0` | `#120a0e` | diagonales, grietas, hierro quemado, basalto | jugable |
| Arcano | `#245aa8` | `#78e9f5`, `#d9ffff` | `#071321` | círculos, prismas, cristal, agua y hielo | jugable |
| Naturaleza | `#337a47` | `#a8dc65` | `#102018` | espirales, raíces, madera y jade | preparada, bloqueada |
| Orden | `#d6c9a2` | `#f2cf71` | `#353128` | simetría, arcos, mármol y latón | preparada, bloqueada |
| Sombra | `#241b2f` | `#8754ad` | `#070609` | velos, puntas, obsidiana y humo | preparada, bloqueada |
| Vacío | `#6435a1` | `#cb79ff` | `#100821` | elipses rotas, portales y vidrio iridiscente | preparada, bloqueada |

El oro envejecido de interfaz usa `#b99754`; el pergamino frío, `#d8ccb2`; la piedra de fondo, `#0c1015`. El blanco puro se reserva para el punto de máxima emisión mágica.

## Marco de carta

- Silueta vertical original con esquinas biseladas, borde exterior de piedra oscura y filete interior de metal envejecido.
- Banda de nombre horizontal y estable. La facción se expresa en el filete, el cristal de coste y una filigrana secundaria; nunca mediante un baño de color que reduzca la legibilidad del arte.
- El arte ocupa aproximadamente el 48 % superior. La ventana tiene un arco muy leve y un corte inferior recto para no recordar marcos comerciales concretos.
- Común: un remache; infrecuente: dos incisiones; rara: tres piezas de metal; mítica: halo fino animado. La rareza no cambia el tamaño de la información.
- Ataque, vida o resistencia se presentan en medallones separados del coste. La forma es angular para Furia y facetada/circular para Arcano.
- La selección añade contorno exterior y elevación. Los estados se dibujan fuera de la caja de reglas o en una tira compacta, sin cubrir nombre, coste ni estadísticas.

## Iconos

Los iconos se construyen en una retícula de 24 unidades, con trazo aparente de 1.75–2 unidades y un área respirable mínima de 2 unidades.

- Furia: una grieta triangular que rodea una brasa central; no es una llama genérica.
- Arcano: una lente hexagonal cruzada por una órbita incompleta.
- Naturaleza: tres nervaduras que nacen de una semilla.
- Orden: un arco cerrado por una barra de horizonte.
- Sombra: un eclipse mordido por dos agujas.
- Vacío: dos umbrales desalineados.
- Rareza: remache, doble incisión, tríada o corona radial; siempre distinguible sin color.
- Estados: hielo = facetas y candado; abrasado = grieta ondulante; agotado = icono inclinado 35° y menor luminancia.

No se usan letras dentro de iconos. Todos deben conservar su significado en monocromo y con deuteranopia.

## Luz y atmósfera

Cada escena emplea tres estratos: fondo oscuro con silueta legible, luz de facción sobre el sujeto y un acento cálido o frío de contraste. Furia ilumina desde abajo o desde grietas internas; Arcano ilumina lateralmente y desde núcleos de cristal. La niebla debe separar planos, no ocultar la silueta. Se permiten bloom y partículas, pero ningún punto secundario debe superar en luminancia el rostro, núcleo u objeto narrativo principal.

En el tablero, los efectos duran normalmente 180–480 ms. Un efecto persistente respira con baja amplitud y no atraviesa la caja de texto. Con movimiento reducido se eliminan sacudidas, órbitas rápidas y traslaciones amplias; se conserva un fundido de estado.

## Composición y lectura

- Relación de aspecto de ilustración: 10:7.
- Una silueta principal ocupa entre el 38 % y el 68 % del ancho.
- El foco primario queda en el tercio central; las diagonales conducen hacia él.
- Unidades: gesto o dirección de mirada hacia el interior de la carta.
- Hechizos: causa y consecuencia visibles en una misma lectura.
- Estructuras: base clara y escala indicada por figuras, puertas o paisaje.
- Maná: fuente inequívoca, monumental y sin personaje dominante.
- Evitar más de tres focos de igual peso, microdetalle uniforme y fondos de valor medio sin separación.

### Zona segura

El archivo maestro debe incluir un 8 % de sangrado visual en los cuatro lados. El sujeto esencial, rostros, manos, armas y núcleos se mantienen dentro del rectángulo central comprendido entre `x=96…704` y `y=56…504` en el lienzo 800 × 560. La franja inferior de 70 px puede quedar parcialmente oculta por tratamientos de marco; no debe contener información narrativa indispensable. No colocar detalles únicos a menos de 40 px de un borde.

## Formatos y entrega

| Uso | Formato | Tamaño recomendado | Perfil |
| --- | --- | --- | --- |
| Arte final maestro | PNG/TIFF sin pérdida | 3200 × 2240 o mayor | Display P3 o Adobe RGB, archivado |
| Juego | WebP | 1600 × 1120, calidad 82–88 | sRGB, metadatos eliminados |
| Respaldo/prototipo | SVG | `viewBox="0 0 800 560"` | vectores y gradientes propios |
| Miniatura QA | PNG | 400 × 280 | sRGB |

Los WebP no deben incluir marco, nombre, coste ni símbolos de interfaz. Peso objetivo: 180–450 KB por carta; máximo recomendado: 700 KB. No ampliar imágenes generadas pequeñas para cumplir la resolución: regenerar o repintar el maestro.

## Convención de nombres

- Arte: `public/assets/cards/art/<card-id>.webp`.
- Respaldo: `public/assets/cards/art/<card-id>.svg`.
- El `card-id` usa minúsculas ASCII y guiones, coincide exactamente con `CardDefinition.id` y no lleva versión.
- Maestros y revisiones viven fuera del runtime: `<card-id>_master_v003.psd`, `<card-id>_review_v003.png`.
- No usar espacios, tildes, sufijos `final`, nombres de artista ni dimensiones en el archivo servido.

## Sustitución SVG → WebP

1. Crear o aprobar el maestro con la zona segura y la relación 10:7.
2. Convertir a sRGB y exportar a 1600 × 1120 WebP, calidad 85 como punto de partida.
3. Guardarlo junto al SVG con el mismo `card-id`; por ejemplo, `sabueso-brasa.webp` al lado de `sabueso-brasa.svg`.
4. No borrar el SVG: es el respaldo de carga y mantiene el prototipo autónomo.
5. Abrir galería, inspección, mano y tablero a 1920 × 1080 y 1366 × 768. Confirmar recorte, contraste y ausencia de texto incrustado.
6. Verificar que el WebP responde con MIME `image/webp`, que no supera el presupuesto y que su canal de color es sRGB.
7. Si el WebP falla, el componente de arte usa `art.fallback`; por ello la sustitución no requiere modificar TypeScript ni el registro de cartas.

## Prompts específicos de producción

Prefijo común sugerido para todos: **Ilustración original para juego de cartas de fantasía oscura elegante, composición cinematográfica 10:7, pintura digital detallada, sujeto central legible en miniatura, materiales creíbles, profundidad atmosférica, alto contraste controlado, sin marco ni interfaz**.

### Furia

1. **`fuente-furia` — Fuente de Furia.** Cámara bajo una montaña, pozo circular de basalto que contiene un corazón de magma blanco-naranja, ríos de lava salen por grietas radiales, arcos de roca negra y diminutas brasas suspendidas, luz ascendente que revela escala monumental, sin personajes dominantes.
2. **`sabueso-brasa` — Sabueso de Brasa.** Bestia cuadrúpeda de carbón vivo corriendo de izquierda a derecha, anatomía ágil y claramente canina, costillas iluminadas por brasas internas, melena convertida en chispas, suelo volcánico quebrado y rastro de ceniza, mirada amarilla enfocada hacia el interior.
3. **`berserker-ignivoro` — Berserker Ignívoro.** Guerrero curtido con armadura de hierro ennegrecido, dos hojas pesadas y cicatrices incandescentes, absorbe fuego hacia el pecho mientras avanza, gesto feroz no grotesco, ruinas de una forja al fondo, contraluz rojo y bordes dorados.
4. **`dragon-caldera` — Dragón de la Caldera.** Dragón ancestral de placas basálticas emerge del cráter, alas abiertas como paredes volcánicas, garganta y uniones llenas de magma, onda de choque que empuja roca y ceniza, escala colosal, cámara baja, ojos como hornos.
5. **`lluvia-ceniza` — Lluvia de Ceniza.** Ciudadela oscura bajo nubes densas, ceniza caliente cae en diagonales y enciende tejados aislados, una unidad pequeña busca refugio mientras su casilla se agrieta, cielo gris carbón con resplandor rojo distante, sensación de daño persistente.
6. **`forja-carmesi` — Forja Carmesí.** Forja ritual monumental, horno con forma de mandíbula abstracta, gran yunque central y armas al rojo flotando sobre cadenas, artesanos diminutos como escala, luz naranja desde el interior, hierro, cobre envejecido y humo estratificado.
7. **`lancera-magma` — Lancera de Magma.** Guerrera de silueta atlética cruza un puente estrecho sobre lava, lanza larga con filo de obsidiana y vena ígnea, armadura asimétrica de escoria, capa llevada por el calor, postura de avance veloz, diagonales fuertes y chispas laterales.
8. **`fenix-pavesa` — Fénix de Pavesa.** Ave ígnea renace de un montón de ceniza oscura, alas extendidas compuestas por plumas de carbón con bordes naranja y oro pálido, corriente de pavesas forma una corona incompleta, ruinas nocturnas debajo, majestuoso y no ornamental.
9. **`temblor-rojo` — Temblor Rojo.** Fortaleza dividida por una falla recién abierta, placas de terreno elevándose, grieta central de magma que serpentea hacia el espectador, bloques y estandartes suspendidos en el impacto, polvo rojo, lectura clara de cataclismo localizado.
10. **`altar-combustion` — Altar de Combustión.** Altar de piedra negra en una nave subterránea, llama vertical contenida por un sigilo original de cinco cortes, dos acólitos de espaldas aportan escala, ofrendas convertidas en luz, simetría tensa y sombras profundas.
11. **`ariete-volcanico` — Ariete Volcánico.** Máquina de asedio baja y pesada construida con basalto, hierro remachado y ruedas masivas, cabeza del ariete incandescente a punto de golpear una puerta, tripulación protegida bajo placas, vapor y grava expulsados, perspectiva dinámica a ras de suelo.
12. **`pacto-ascuas` — Pacto de Ascuas.** Dos manos con guanteletes distintos se encuentran sobre un brasero, una brasa brillante flota entre ambas y dibuja un sello angular en el aire, rostros apenas sugeridos a ambos lados, intimidad ritual, rojo oscuro, oro caliente y humo fino.

### Arcano

13. **`fuente-arcana` — Fuente Arcana.** Gruta azul profunda con estanque circular luminoso, cristal central se eleva desde el agua y contiene una pregunta visual en forma de órbita incompleta, prismas flotantes, reflejos turquesa sobre roca húmeda, calma monumental sin personaje dominante.
14. **`centinela-cristal` — Centinela de Cristal.** Constructo guardián alto formado por facetas de cuarzo azul y un núcleo hexagonal, quieto ante una puerta rúnica, dos posibles futuros reflejados en sus hombros, postura protectora, luz fría interna y bordes translúcidos.
15. **`tejedora-escarcha` — Tejedora de Escarcha.** Hechicera de túnica azul teje con ambas manos filamentos de hielo sobre un campo, la red geométrica inmoviliza los pies de un adversario distante, copos como agujas, expresión serena, perspectiva lateral y luna fría difusa.
16. **`prision-glacial` — Prisión Glacial.** Unidad atrapada dentro de un poliedro de hielo translúcido, placas cruzadas como barrotes y runas detenidas a mitad de giro, aire congelado alrededor, sujeto visible pero inmóvil, luz cian blanca y cavernas azul marino.
17. **`cometa-arcano` — Cometa Arcano.** Cometa mágico blanco-cian atraviesa un cielo estrellado y desciende hacia un objetivo helado, cola compuesta por glifos y fragmentos prismáticos, observatorio en primer plano, enorme escala y trayectoria diagonal inequívoca.
18. **`torre-horizonte` — Torre del Horizonte.** Torre-observatorio esbelta sobre acantilados y nubes, gran lente orbital en la cúspide muestra varios horizontes superpuestos, ventanas cian, amanecer azul pálido, verticalidad majestuosa y pequeñas figuras en balcones.
19. **`duelista-prisma` — Duelista del Prisma.** Duelista místico con abrigo estructurado divide un rayo mediante una hoja de cristal, el haz se separa en tres colores suaves que iluminan una arena oscura, postura precisa y ligera, rostro concentrado, movimiento contenido.
20. **`golem-azur` — Gólem Azur.** Gólem ancho tallado en piedra azul y cristal húmedo, núcleo que encierra un pequeño mar con oleaje, se incorpora en una cantera, brazos como contrafuertes y postura de guardia, niebla de agua y reflejos cian.
21. **`niebla-espejada` — Niebla Espejada.** Lago nocturno cubierto por bancos de niebla, dos figuras en la orilla tienen reflejos que miran en direcciones imposibles, fragmentos de espejo suspendidos revelan cartas o caminos alternativos sin texto, atmósfera ambigua y elegante.
22. **`eco-cronomante` — Eco Cronomante.** Cronomante encapuchado repetido en tres exposiciones temporales, círculo mecánico-rúnico detrás, gesto de lanzar un hechizo capturado antes y después, transparencias cian y violeta, partículas inmóviles y fondo oscuro sin relojes modernos.
23. **`archivo-viviente` — Archivo Viviente.** Biblioteca imposible cuyo archivista está formado por libros abiertos, páginas y constelaciones, pasillos curvos desaparecen en un cielo interior, dos volúmenes vuelan hacia el espectador, sabiduría antigua, azul profundo y luz de pergamino frío.
24. **`convergencia-astral` — Convergencia Astral.** Varias órbitas y constelaciones se alinean alrededor de un portal circular, dos posiciones del mismo viajero unidas por un pliegue de espacio, planetas pequeños indican escala, blanco-cian en el núcleo, azul y violeta en el borde, geometría limpia.

## Prompt negativo común

**texto legible, letras, números, tipografía, logotipo, firma, marca de agua, marco de carta, interfaz, medallones, barras de estadísticas, composición de póster, borde decorativo, personaje recortado por el borde, foco fuera de la zona segura, arte de franquicia, personaje reconocible, símbolo comercial, estilo de artista vivo, fotografía, 3D plástico, render de juguete, colores neón uniformes, sobreexposición, negros empastados, manos deformes, dedos extra, extremidades extra, anatomía rota, rostros duplicados, armas fusionadas, perspectiva incoherente, detalle caótico, ruido, baja resolución, compresión**.

## Lista de comprobación de aprobación

- El concepto se identifica sin leer el nombre.
- La facción se reconoce por forma, luz y material, no solo por color.
- El foco sobrevive a una miniatura de 200 × 140.
- Rostros, manos, núcleos y armas quedan dentro de la zona segura.
- No hay texto, firma, marco, logotipo ni iconos de interfaz incrustados.
- Existe separación clara de valores entre sujeto y fondo.
- El WebP y el SVG comparten exactamente el mismo `card-id`.
