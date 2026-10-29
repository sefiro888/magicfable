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
