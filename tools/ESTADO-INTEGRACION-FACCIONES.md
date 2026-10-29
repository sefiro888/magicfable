# Goblins, Tercios y Kalevala

29 de octubre de 2026. Publicación de prueba solicitada expresamente por el usuario antes de cerrar toda la validación de interfaz.

- Integrados 93 diseños, 3 comandantes, 3 mazos legales de 50 cartas y las 96 ilustraciones originales facilitadas por el proyecto.
- Conectadas Chispa, Petardazo, Formación, Descarga, Runo y Canto; decisiones manuales y decisiones de la IA usan las mismas opciones legales.
- Verificación: 672 pruebas correctas y 5 omitidas; incluye 24 partidas completas en ambos asientos con las tres facciones. Compilación y lint correctos.
- Batería de interfaz cerrada: 88 pruebas correctas y 43 sondas opcionales omitidas, sin fallos. Incluye Chispa y batalla a 1920 × 1080 y 1366 × 768.
- Selección de facción: 2 pruebas adicionales correctas; las tres tarjetas tienen ilustraciones, descripción, comandante, métricas y botón de entrada, como pidió el usuario. Capturas revisadas a ambas resoluciones.
- Publicados 30a15d5 y dd28da9. Ambos despliegues correctos en GitHub Pages; se abrió una partida con cada facción desde la web publicada, sin errores de aplicación.

## Pendientes tras publicar esta versión de prueba

- Decisiones tácticas de Tercios y Kalevala verificadas con cuatro pruebas adicionales correctas a ambas resoluciones, incluidas dos selecciones distintas y persistencia del resultado. Captura de Canto revisada. Queda mejorar el acabado visual de los controles de estos diálogos dentro de la renovación.
- Ampliar casos de interacción entre cartas particulares y facciones anteriores; revisar indicaciones de combate de Canto y estados silenciados.
- Equilibrio: estas partidas comprueban funcionamiento, no demuestran equilibrio competitivo.
- Continuar las 50 mejoras visuales, conservadas localmente y separadas de esta publicación. No declararlas terminadas.
- No editar los dosieres del usuario. Única excepción autorizada: checklist de nombres de archivo de Inmortales, añadido sin modificar sus cartas.

Los originales de las ilustraciones permanecen en tools/art-inbox, ignorados por Git. No se han utilizado restablecimientos de límites de uso.

## Revisión local posterior, sin publicar

- Previsión y decisión de IA de Canto de ataque comparten la regla real: hundimiento temporal sin daño, muerte, Petardazo ni contragolpe.
- La IA descuenta la Chispa silenciada y el Pino deja de prestar bonos de volador a una unidad silenciada.
- Las curaciones y comprobaciones de heridas respetan mejoras de Vida y pérdida permanente de Tuonela.
- Diálogos tácticos y de Chispa con arte, controles amplios, foco visible y adaptación móvil.
- 17 pruebas de interacción adicionales: Farnesio y empujes, Último Cuadro, Canto, Rocroi, Motín, Sampo, escudos y curaciones. Gate: 689 unitarias correctas/5 omitidas; compilación y lint correctos; 97 e2e correctos/43 sondas opcionales omitidas. Capturas de diálogos revisadas en escritorio y móvil.
- Nueva prioridad humana: hacer inequívocas las casillas con daño y riesgo mortal antes de colocar o mover una unidad. En preparación, sin publicar.

## Cierre solicitado por el usuario: aviso del suelo y pausa

El usuario aclaró que jugaba con Tercios contra Fractura del Vacío y perdía Vida sin un ataque. Se reprodujo una muerte al mover un Piquero herido fuera del apoyo de Farnesio: pierde los dos puntos extra de Vida de Formación. No se dispone del registro de su partida para afirmar que fuese exactamente ese caso.

- Los destinos que restan Vida al mover se muestran sobre el suelo en ámbar; los que causan una muerte, en rojo con grietas y calavera. El azul de movimiento no tapa el peligro.
- Se ensaya el movimiento real del motor sin alterar la partida: incluye la unidad que se mueve, otras aliadas que pierden apoyo y caídas en cadena. Se informa qué pieza pierde Formación y muere.
- No se añadió daño por pisar lava ni se confundió el hollín decorativo con una trampa. El prototipo anterior de avisos de ataques se apartó sin integrarlo en `tools/art-inbox/prototipo-avisos-alcance/`, con extensión de borrador de texto para no interferir con las pruebas.
- Verificación: 697 unitarias correctas y 5 omitidas; compilación y lint correctos. Primera pasada de interfaz afectada: 41 correctas y un fallo de carga por ERR_NETWORK_CHANGED en battle-ui a 1366; repetición aislada correcta 2/2 a ambas resoluciones. Sin errores de juego reproducibles ni pruebas pendientes. Las siete comprobaciones de suelo en Ciudadela, Caldera y Fiordo a 1920 × 1080 y 1366 × 768, y Caldera en móvil pasaron. Capturas revisadas en escritorio y móvil.
- Cambio guardado localmente, sin publicar. El usuario pidió parar después de cerrar este aviso; las 50 mejoras y las demás revisiones siguen pendientes hasta que pida continuar.

Estado de continuidad: PAUSA solicitada por el usuario tras cerrar este aviso. No retomar las 50 mejoras ni publicar hasta una nueva petición humana.
