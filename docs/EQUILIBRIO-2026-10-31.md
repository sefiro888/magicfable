# Medición de equilibrio — 31 de octubre de 2026

Medición sin tocar ninguna carta, por petición expresa del propietario: «solo
mide y deja el informe para más adelante». Las decisiones de ajuste quedan
para cuando se puedan contrastar con partidas humanas.

## Cómo se ha medido

```bash
RUN_BALANCE=1 BALANCE_SEEDS=8 npx vitest run src/game/balance-sim.test.ts --testTimeout=0
```

- 19 facciones, todos los cruces, cada uno en los dos asientos: **2736
  partidas**, 8 semillas por cruce.
- La misma IA juega los dos bandos, así que las diferencias son del mazo… o de
  lo bien que la IA sabe jugar ese mazo. Esto último pesa mucho (ver Goblins).
- Duración: media 53 turnos, mediana 42; 7 partidas llegaron al tope de turnos.
- El banco exigía 16 mazos y fallaba con 19. Se corrigió el recuento en
  `balance-sim.test.ts`; la medición en sí ya era válida.

## Victorias por facción

| Facción | Mazo | % | Septiembre (16 facciones) |
| --- | --- | ---: | ---: |
| Samsara | La Rueda que no se Detiene | **92** | 82 |
| Olimpo | La Medida y el Exceso | **80** | 75 |
| Kalevala | Los Cantores de Pohjola | **79** | nueva |
| Bestiario | Bestiario | 77 | 80 |
| Jade | El Mandato del Cielo | 75 | 71 |
| Plaga | Lo que Muerde, no Perdona | 74 | 73 |
| Arcano | Secretos del Arcano | 67 | 50 |
| Naturaleza | Sabiduría del Bosque | 49 | 39 |
| Orden | Orden Celestial | 49 | 58 |
| Fimbul | El Invierno que No Termina | 48 | 48 |
| Vacío | Fractura del Vacío | 45 | 40 |
| Duna | Tribunal de Arena | 40 | 29 |
| Forja | El Gremio de los Engranajes | 36 | 40 |
| Sombra | Reidores de la Sombra | 36 | 31 |
| Furia | Furia de la Caldera | 34 | 41 |
| Quinto Sol | El que hay que Alimentar | 26 | 20 |
| Marea | El Ciclo de las Aguas | 25 | 28 |
| Tercios | El Cuadro de Picas | **15** | nueva |
| Goblins | El Gremio de la Chispa | **2** | nueva |

Los porcentajes de septiembre son de otra medición (12 semillas, 16
facciones); sirven para ver tendencias, no para comparar puntos sueltos.

## Lo que salta a la vista

1. **Goblins (2 %) no es un problema de cartas, o no solo.** Pierde el 100 %
   contra 16 de las 18 facciones. Una sonda (Goblins contra Furia, semilla 3)
   muestra que la IA vacía la mano hacia el turno 10, sus unidades **no
   dañan el Nexo rival en 30 turnos** y se van destruyendo entre sí:
   Petardazo hace 2 de daño a los adyacentes, **aliados incluidos**, y la IA
   las coloca juntas. Después la mitad de lo que roba son fuentes. Su mazo
   es además el más barato y flojo del juego (coste total 59, ATQ 1,53 por
   carta, ninguna Guardia).
   **Siguiente paso recomendado:** que la IA evite colocar o atacar con una
   pieza de Petardazo junto a aliados que el estallido mataría, y volver a
   medir. Corregir la IA antes de tocar las cartas, como pide la guía.
2. **Tercios (15 %) repite el patrón de Goblins.** Sonda Tercios contra
   Furia, semilla 3: la IA arma su bloque en la esquina izquierda (columnas
   0 a 2, filas 3 a 7), vacía la mano hacia el turno 14 y **en 44 turnos no
   hace ni un punto de daño al Nexo rival**. Formación la lleva a apelotonarse
   lejos del centro, y nadie empuja hacia el Nexo.
   **Patrón común de las dos facciones nuevas más flojas:** mano vacía antes
   del turno 15 y ninguna presión sobre el Nexo. Antes de tocar sus cartas,
   comprobar si la IA sabe avanzar con ellas: es muy probable que gran parte
   de su cifra sea de la IA, como ya se vio con Marea.
3. **Samsara sube a 92 %.** Ya estaba marcado como techo estructural (su
   comandante y Renacer) y el propietario decidió no recortarla sin
   playtesting humano. Kalevala (Canto, que hunde sin matar) debía ser su
   antídoto, pero en el cruce directo Samsara gana el **69 %** (Kalevala el
   31 %): es de lo poco que le planta cara, aunque no lo bastante.
4. **Kalevala entra muy alta (79 %).** Es nueva: vigilar que Runo (contadores
   que no se gastan) no escale sin techo en partidas largas.
5. **Marea, Quinto Sol y Duna** siguen abajo por el diagnóstico ya
   conocido: su valor es posicional o de recursos y la IA no lo aprovecha.
   No sobreajustar contra la IA.

## Para reproducir y profundizar

- Resultado completo con todos los cruces: se genera en `balance-result.txt`
  (ignorado por Git); composición de cada mazo en `balance-decks.txt`.
- Para diagnosticar una facción, una sonda que imprima por turno la mano, el
  tablero y la vida de los Nexos resuelve en minutos lo que la tabla no
  explica. Es la que destapó lo de Goblins.
