# Cómo se escribe un prompt de arte en este proyecto

Esto no es teoría: cada regla de aquí está porque una tanda de ilustraciones se
fue a la basura por no cumplirla. Lee esto **antes** de escribir el dosier de
una facción nueva, y repásalo antes de dar los prompts por buenos.

Facciones de las que salen estas lecciones: Enjambre (nombres de archivo),
Inmortales (luz, encuadre, especie), Goblins (paleta no declarada).

---

## 1. El generador solo ve el prompt

**La lección más caras de todas.** Los 31 prompts de Goblins terminaban en
«Paleta Goblins», y esa paleta estaba definida en una tabla preciosa del
dosier… que el generador nunca lee. Con Inmortales fue peor: los prompts
describían el vestuario como una ficha de museo y no pedían luz, así que las
seis primeras imágenes salieron a merced del estilo por defecto — plano medio,
mediodía, gris. El fallo no era del generador.

**Regla**: toda la dirección artística va escrita en una **instrucción
permanente** que se pega una sola vez al empezar la conversación, y los prompts
individuales la invocan. Nada de la identidad visual puede vivir solo en una
tabla del dosier.

Lo que la instrucción permanente tiene que declarar siempre:

- **Color**, con los cuatro papeles separados: base, luz, sombra, acento.
- **Luz**: de dónde sale, de qué color es y qué hora del día es.
- **Tono**: qué sensación debe dar y, muy importante, cuál **no**.
- **Formas y materiales** característicos.
- **Formato**: vertical 2:3, mínimo 1024 × 1536.

---

## 2. Usa ChatGPT

Se probó en paralelo con Gemini usando prompts idénticos. Gemini se atasca en
gris y plano medio, **ignora las instrucciones de cámara** aunque se las
repitas, y repite composición entre cartas. ChatGPT devuelve el color saturado,
el detalle denso y poses con energía.

Si en algún momento hay que volver a Gemini, cuenta con rehacer más de la
mitad.

---

## 3. Lenguaje de escena, nunca jerga de cámara

«Contrapicado» se ignoró dos veces seguidas. Lo que sí funciona es describir
**lo que se ve**:

| No escribas | Escribe |
| --- | --- |
| Contrapicado | La figura se recorta contra el cielo, los pies casi tocando el borde inferior |
| Plano detalle | Primerísimo plano de dos manos, el resto desenfocado |
| Picado | Visto desde arriba, como si volaras por encima |
| Gran angular | Las columnas más cercanas, enormes y cortadas por el borde |

---

## 4. La luz es lo que convierte una lámina en una carta

Sin pedirla explícitamente, el generador pone mediodía plano. Dos exigencias
que dieron el salto de calidad más grande en Inmortales:

- **Hora dramática**: atardecer muy bajo, incendio lejano, antorchas, luz de
  dentro de la escena. Nunca mediodía.
- **Sombras de color, no grises.** Pedir «sombras largas en AZUL PROFUNDO»
  cambió por completo el resultado. En Goblins el equivalente es que la luz
  salga de una explosión o un soplete y deje media figura en negro.

Añade siempre algo en el aire: polvo en suspensión, chispas, humo iluminado por
detrás, pavesas. Es lo que da profundidad.

---

## 5. Varía el encuadre entre cartas o saldrán 31 iguales

El problema de las seis primeras de Inmortales no era solo la luz: **todas eran
un plano medio de una figura de pie**. Reparte los 31 prompts entre varios
tipos de encuadre:

- Figura recortada contra el cielo, vista desde muy abajo.
- Macro de manos o de un objeto, con el fondo desenfocado.
- Multitud o formación que se pierde en la distancia.
- Paisaje o arquitectura **sin ninguna figura** (las estructuras y varios
  hechizos deberían ir así).
- Vista hacia arriba, desde el suelo.
- Instante congelado a mitad de una acción violenta.

Si al repasar el dosier tres prompts seguidos empiezan igual, reescíbelos.

---

## 6. El juego habla de criaturas, no de personas

Una facción histórica corre el peligro de ser treinta y un señores con lanza, y
al lado de Bestiario o Enjambre eso no se sostiene. En Inmortales hubo que
cambiar cuatro cartas por este motivo.

**Regla**: toda facción, por histórica que sea, necesita **al menos cuatro o
cinco cartas de espectáculo**: un coloso, una bestia mítica, un fenómeno
sobrenatural, una obra de ingeniería imposible. Y conviene que salgan de la
mitología o de las anécdotas reales de esa cultura, no inventadas: el toro
alado despertando, el simurgh, Jerjes azotando el mar, el puente de barcas
sobre el Helesponto.

---

## 7. Un truco narrativo propio por facción

Lo mejor que salió de Inmortales fue accidental: en una ilustración, el muro de
ladrillo del fondo tenía al **mismo soldado repetido** en el friso. La carta
cuenta la mecánica de la facción dos veces sin explicarla.

Busca uno equivalente para cada facción y escríbelo en el dosier para que se
repita a propósito en varias cartas.

---

## 8. Di de qué facción hay que diferenciarse

Con dieciséis facciones ya hay solapes. Los prompts tienen que llevar la
prohibición explícita:

- **Desierto y piedra** → chocan Duna e Inmortales. Duna es necrópolis, ocre
  pálido y arena; Inmortales es imperio vivo, azul saturado y oro. *Si una
  ilustración de Inmortales sale color arena, está mal.*
- **Antigüedad clásica** → chocan Olimpo e Inmortales. Nada de mármol blanco
  ni desnudos heroicos fuera de Olimpo.
- **Repugnancia** → chocan Plaga, Enjambre y Goblins. Plaga da asco a propósito;
  Goblins tiene que dar risa. *Si un goblin da asco en vez de risa, está mal.*
- **Hielo** → chocan Fímbul y Marea.
- **Metal y máquinas** → chocan Forja y Goblins. Forja es precisión y
  simetría; Goblins es todo remachado mal y nada nivelado.

Decir lo que **no** debe aparecer funciona mejor que describir solo lo que sí.

---

## 8 bis. Cada facción puede tener su propio acabado

**Decisión del usuario, 29 oct 2026. No la deshagas unificando el estilo.**

Las primeras de Goblins salieron con un acabado de render 3D muy detallado,
distinto del tratamiento más pictórico de Inmortales. Se planteó si había que
igualarlas y la respuesta fue que no: con dieciséis facciones, que cada una
tenga su propia esencia visual es una ventaja.

Y además funciona. El render hiperdetallado le va a Goblins porque la facción
es chatarra, remaches y metal abollado, y ahí se nota la textura; a Kalevala,
que es bruma y agua quieta, le irá lo contrario.

Lo que **sí** hay que mantener uniforme es el formato (vertical 2:3) y la
coherencia **dentro** de cada facción.

---

## 8 ter. Varía también el escenario, no solo el encuadre

La regla 5 habla del encuadre, pero hay un segundo modo de que salgan treinta y
una cartas iguales: **repetir el decorado**. En las primeras de Goblins, dos de
tres compartían empalizada de madera con banderolas rojas al atardecer; la
tercera pasaba en un taller en penumbra y se notaba la diferencia al instante.

Si el prompt no dice dónde pasa la escena, el generador reutiliza el último
decorado que le funcionó. Dos remedios:

- Situar explícitamente cada carta: interior, bajo tierra, de noche, en el agua,
  a cielo abierto.
- Añadir al final de los prompts que no lo digan: *«Cambia el escenario respecto
  a las imágenes anteriores»*.

Lo mismo con la hora y el color de la luz. Si todas llevan atardecer cálido, la
facción acaba siendo monócroma aunque cada carta por separado esté bien.

---

## 9. Nombres de archivo: el id de la carta, y una lista al final

Las 32 imágenes de Enjambre llegaron llamadas `exec-a1bf5c0b-1143.png`, sin
metadatos y con la misma marca de tiempo. Hubo que identificarlas una a una
mirándolas, con hojas de contactos numeradas, y aun así aparecieron dos
repetidas y dos que faltaban. Se perdió una tarde.

**Regla**: el dosier abre con las instrucciones de nombrado, y cierra con la
**lista completa de nombres exactos** en un bloque de código, para poder
comprobarla de un vistazo. Minúsculas, guiones, sin acentos, sin numeración.

Y marca siempre las que **ya estén aprobadas**, para no regenerarlas.

---

## 10. Cuenta las cartas antes de entregar

El primer dosier de Inmortales tenía 32 cartas donde van 31, y la sección de
unidades decía 15 teniendo 16. El CI tiene recuentos codificados a mano, así
que un dosier descuadrado se convierte en pruebas rotas más tarde.

La estructura que estamos usando, y que conviene mantener:

| Bloque | Cartas |
| --- | --- |
| Fuente | 1 |
| Unidades | 15 |
| Hechizos | 8 |
| Estructuras | 7 |
| **Total** | **31** |

Más el comandante aparte, que no cuenta como carta de mazo.

Comprobación rápida:

```bash
python -c "import io,re; t=io.open('docs/FACCION_X.md',encoding='utf-8').read(); c=re.findall(r'^#### .([a-z-]+).',t,re.M); print(len(c), [x for x in set(c) if c.count(x)>1])"
```

---

## 11. Plantilla de la sección 0 del dosier

Todo dosier nuevo empieza así:

```markdown
## 0. CÓMO GENERAR EL ARTE

### Qué generador usar
ChatGPT. (Y el porqué, para que nadie vuelva a probar con Gemini.)

### Instrucción permanente — pégala UNA VEZ al empezar la conversación
> [bloque con color, luz, tono, formas, formato]

### Cómo se nombran los archivos
[id de la carta, minúsculas, guiones, sin acentos]

### Ya ilustradas — NO repetir
[lista]
```
