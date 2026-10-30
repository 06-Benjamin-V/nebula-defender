# Verificación final y pruebas manuales

Este registro describe comprobaciones efectivamente ejecutadas por Codex. No acredita pruebas del estudiante ni dispositivos que no se utilizaron.

## Develop — cinco sectores y campo ampliado

- 45 pruebas automáticas aprobadas, incluida la transición completa 1→2→3→4→5, victoria solo tras Némesis y puntuación total de 19.000. El ajuste comprueba pantallas por encima de escala ×2.
- Diagnóstico de campaña: semillas 1 y 3 ganan en 84 y 85 segundos simulados, ambas con dos vidas y 19.000 puntos. La semilla 2 pierde en el cuarto sector a los 58 segundos con 14.050 puntos. El controlador no recibió vidas adicionales ni cambios de salud; su derrota genera código de salida 1 por diseño.
- Navegador: accesos debug a 4 (Umbral del Vacío, cuatro filas) y 5 (Némesis, barra 80/80), pausa y vuelta al modo normal. Sin avisos ni errores en los registros consultados.
- Resoluciones comprobadas: 844×390, 667×375, 568×320, 390×844, 320×568 y 1920×1080. En todas, scrollWidth/scrollHeight coinciden con el viewport. En horizontal las flechas comparten coordenada vertical, miden 56×56 y quedan fuera del campo junto al botón de disparo del lado opuesto. En vertical los botones quedan al pie de la pantalla.
- Canvas en 844×390: 447×298, frente a los 339×226 de la versión anterior; en 1920×1080 alcanza 1369×912,66 sin deformación. La prueba mínima de 568×320 mantiene un campo de 294×196 con controles accesibles.
- Captura real: `captures/develop-landscape.png`, tomada en debug para mostrar el nuevo sector y sus hitboxes. Los cambios de viewport de prueba se restablecieron al terminar.
- Pendiente: probar simultáneamente dos dedos y áreas seguras en un teléfono físico, y valorar la dificultad con jugadores humanos.

## Pruebas reproducibles

Desde la raíz, con Node.js 24:

```powershell
node --test tests/*.test.mjs
node tools/simulate-campaign.mjs
node tools/check-project.mjs
```

| Comprobación | Resultado observado |
| --- | --- |
| Pruebas de lógica, arte, audio y controles | 42 aprobadas. Incluyen reanudación lenta de audio, inicio sincronizado, cancelaciones, múltiples punteros y ajuste 3:2. |
| Campaña con controlador automático | Tres victorias; 13.800 puntos; 64, 74 y 71 segundos simulados; 2, 1 y 3 vidas restantes. No es una partida humana ni un benchmark de FPS. |
| Recursos y módulos | 65 referencias locales verificadas; sin identificadores HTML duplicados ni referencias remotas en las páginas. |
| Contraste de seis combinaciones principales | Ratios 17,06; 15,77; 7,10; 13,43; 6,08 y 13,45. Todos superan 4,5:1. No equivale a una auditoría de accesibilidad integral. |

Web Audio y los eventos de puntero se prueban con dobles controlados. Las pruebas no pueden confirmar la calidad acústica de unos parlantes ni las particularidades físicas de una pantalla táctil.

## Navegador y tamaños revisados

Se abrió el juego en el navegador integrado, con servidor local y módulos reales. Se comprobaron menús, instrucciones, ajustes, inicio/pausa, HUD y ausencia de errores del juego en los registros consultados. Tras Jugar se observó el estado de audio preparado y la muestra habilitada. La revisión anterior de Fase 4 incluyó silencio/volumen persistentes, combate, mejoras, derrota, nuevo récord y reinicio.

| Tamaño de viewport solicitado | Comprobación |
| --- | --- |
| 320×568 | Menú compacto, botones principales visibles y ancho de documento igual al viewport, sin desbordamiento horizontal. |
| 390×844 | HUD reorganizado, campo proporcional, acceso a ajustes y comienzo de misión. |
| 844×390 | Encabezado decorativo oculto, menú compacto y campo de 339×226 en la comprobación: proporción 3:2. |
| Escritorio | Menú y controles de teclado, con campo limitado a escala máxima ×2. |
| Atlas a tamaño móvil | Las 14 tarjetas cargaron y el ancho del documento no se desbordó. Los sprites grandes conservan ×8 y tienen desplazamiento dentro de su tarjeta. |

La herramienta de navegador permite cambiar dimensiones, pero no emular una pantalla de dos dedos ni `any-pointer: coarse`. Por eso **no se declara una prueba táctil física**. La lógica de punteros simultáneos se verificó por pruebas automatizadas; el diseño reserva botones inferiores en vertical y laterales en horizontal para los dispositivos que sí anuncian puntero grueso.

Las capturas en `docs/captures/` son capturas reales del navegador, con nombres que identifican la fase. No son evidencia de una prueba en teléfono físico.

## Lista de prueba del estudiante

Marca solamente lo que hagas tú y añade tu evidencia en `proceso_ia.md`:

- [ ] Primer Jugar con sonido: comprobar que la señal de inicio acompaña al comienzo y que los primeros disparos ya se oyen. Probar también Continuar después de cambiar de pestaña.
- [ ] Silenciar, cambiar volumen, recargar y comprobar preferencias. Si el dispositivo no responde y el juego continúa en silencio, revisar el estado en Ajustes y volver a intentar tras recargar.
- [ ] En teléfono físico: mantener dirección y disparo con dos dedos; soltar uno sin cancelar el otro; girar el teléfono; pausar y comprobar que no quedan controles retenidos.
- [ ] Jugar los cuatro sectores sin debug, derrotar a Némesis y verificar la victoria.
- [ ] Recibir daños, comprobar invulnerabilidad/escudo y perder las tres vidas; verificar reintento limpio.
- [ ] Recoger cada mejora, combinarlas y comprobar expiración y pausa de sus temporizadores.
- [ ] Probar teclado, Tab, foco visible, Escape en diálogos y zoom del navegador.
- [ ] Activar movimiento reducido en el sistema y comprobar que no hay partículas, vibración ni parpadeo rápido de invulnerabilidad.
- [ ] Revisar fluidez en el equipo habitual. No se ha acreditado una medición sostenida de 60 FPS en todos los dispositivos.

## Límites conocidos de alcance

- El juego sigue siendo un arcade visual; se mejoraron navegación, etiquetas y avisos, pero no se realizó auditoría con lector de pantalla.
- Los récords y preferencias pertenecen a cada origen del navegador; `localhost` y `127.0.0.1` son distintos.
- Al reconstruir un sector por invasión se conserva el puntaje y los enemigos repetidos pueden volver a puntuar, según las reglas documentadas.
- La reflexión, los prompts de planificación previa y las intervenciones personales deben ser completados por el estudiante. Codex no los redactó en su nombre.

## Fase 6: música y pantalla fija

45 pruebas automáticas aprobadas. Nuevas comprobaciones de inicio inmediato de notas, ritmo sin acumulación tras interrupciones, pausa, silencio, volumen cero y prevención de desplazamiento con las cuatro flechas. 66 referencias locales verificadas. Navegador: inicio y pausa, audio indicado como listo, sin errores de consola; scrollY=0 y scrollHeight=innerHeight en escritorio (715 px de alto), 390×844, 320×568 y 844×390; consola completa dentro de la pantalla. Flechas arriba/abajo verificadas sin movimiento. La calidad auditiva y el comportamiento en altavoces reales requieren escucha del usuario.
