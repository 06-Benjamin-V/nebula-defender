# NEBULA DEFENDER

Arcade espacial original con HTML, CSS, JavaScript ES modules y Canvas 2D. Sin dependencias, npm, compilación ni recursos remotos. Desarrollo por fases para la evaluación de un curso de IA.

## Ejecutar

Desde esta carpeta, con Python 3 instalado:

```powershell
python -m http.server 8000
```

Abrir http://localhost:8000. No abrir `index.html` directamente: los módulos necesitan HTTP. Si Windows muestra la tienda en lugar de Python, instalar Python 3 o usar `py -m http.server 8000` si el lanzador está disponible.

Alternativa comprobada con Node.js 24 instalado, sin instalar paquetes:

```powershell
node tools/serve.mjs
```

Abrir http://127.0.0.1:8000. Detener el servidor con Ctrl+C.

## Controles

- A/D o flechas: mover la nave horizontalmente.
- Espacio: disparar (se puede mantener pulsado).
- P o Escape: pausar/continuar. También hay un botón de pausa.
- La partida se pausa al perder el foco u ocultar la pestaña.
- El botón de la pantalla final inicia una partida limpia; desde pausa también se puede reiniciar.

## Estado: Fase 2

Base jugable: una formación de 24 invasores, movimiento lateral y descenso, disparos desde las columnas inferiores, colisiones AABB, 100 puntos por invasor y estados explícitos de menú, juego, pausa, sector despejado y derrota. Un impacto o la llegada de la formación a la zona defensiva termina esta versión. Eliminar la formación completa despeja el sector; **no representa todavía la victoria final contra el jefe**.

La resolución lógica es 480×320: permite una formación horizontal amplia y espacio vertical para esquivar. CSS conserva la proporción 3:2 y desactiva suavizado; la escala puede ser fraccional para caber en la ventana. Los sprites originales definitivos son matrices de índices de paleta, convertidas una sola vez a canvas y reutilizadas desde caché. La simulación usa segundos y limita delta a 50 ms. Todo el balance actual está en `js/config.js`.

### Arte y galería

Abrir http://localhost:8000/sprites-preview.html (o http://127.0.0.1:8000/sprites-preview.html con el servidor Node). También se puede acceder desde el enlace «Atlas de sprites» al pie del juego.

- Nave Aurora de 16×16, con propulsión de dos frames, cabina y armamento lateral.
- Explorador Prisma, Espectro Violeta y Centinela Carmesí: tres siluetas de 12×12, dos frames por especie. El juego actual utiliza al Explorador; las otras especies tendrán mecánicas en la Fase 3.
- Fortaleza Némesis de 48×32 y cápsulas de 10×10 para doble disparo, rapidez y escudo. Solo arte en esta fase.
- Proyectiles de 3×7, destellos de disparo, impactos y explosión de cuatro frames.
- Galería con escala exacta ×8, botón de pausa, dimensiones, paleta e inspección de todos los frames por separado. En pantallas estrechas el jefe y las tiras tienen desplazamiento horizontal para conservar esa escala.
- Fondo con nebulosa tenue prerenderizada y tres capas de estrellas a distinta velocidad. No se rasterizan sprites ni se crean gradientes durante el loop.
- La pausa congela el parallax y las animaciones. `prefers-reduced-motion` detiene estrellas/propulsión/enemigos y usa un fotograma tenue y estable para los efectos; la galería comienza detenida y permite reproducir manualmente.

## Estructura

```text
index.html
sprites-preview.html  Atlas animado de arte ×8
css/                  global.css, menu.css, hud.css, animations.css, responsive.css, sprites-preview.css
js/
  main.js             Inicio
  config.js           Resolución, paleta y balance
  engine.js           Loop, simulación y renderizado
  state.js            Estados y transiciones
  input.js            Teclado
  player.js           Nave y cadencia de disparo
  enemies.js          Formación y disparos enemigos
  projectiles.js      Creación, movimiento y descarte
  collisions.js       Colisiones y consumo de proyectiles
  sprite-data.js      Matrices originales y secuencias de animación
  sprites.js          Rasterización inicial, caché y dibujo de frames
  background.js       Nebulosa y parallax de estrellas
  effects.js          Secuencias de disparo, impacto y destrucción
  sprites-preview.js  Catálogo visual independiente del juego
  ui.js               HUD y pantallas
docs/                 Registro de implementación y verificaciones
```

## Próximas fases (requieren confirmación)

3. Niveles, especies, power-ups, jefe, tres vidas, invulnerabilidad y récord persistente.
4. Interfaz definitiva, audio sintetizado, partículas y vibración de cámara.
5. Controles táctiles, revisión responsive/accesibilidad y documentación académica con espacios para evidencia del estudiante.

`?debug=1` muestra FPS y cajas de colisión. Los atajos para saltar niveles llegarán con los niveles en la Fase 3. Esta fase requiere teclado; los botones táctiles se implementarán en la Fase 5.

La planificación previa con ChatGPT será documentada por el estudiante. El trabajo de Codex y las pruebas realmente ejecutadas se registran en `docs/implementation-log.md`; no se atribuyen intervenciones humanas ni resultados de pruebas no observados.

## Verificación

Con Node.js 24: `node --test tests/*.test.mjs`. Las 11 pruebas comprueban lógica, arte, caché, limpieza de efectos y parallax; no sustituyen una partida completa en navegador.

Prueba manual pendiente: iniciar; mantener A/D hasta ambos bordes; mantener Espacio y comprobar bajas y puntaje; pausar/continuar con P, Escape y el botón; cambiar de pestaña y comprobar la pausa; recibir un disparo y reintentar; eliminar los 24 enemigos y verificar 002400 puntos y sector despejado. Reiniciar desde pausa debe restablecer posición, formación, disparos y puntuación. Abrir `?debug=1` para ver FPS y hitboxes. Revisar la consola del navegador durante estas acciones.

En Fase 2 Codex comprobó carga de ambas páginas, disparos y puntaje, pausa con P, derrota y reinicio en navegador, además de la galería y su pausa/inspección de frames. Queda pendiente la revisión del estudiante del arte animado, especialmente en su pantalla y con movimiento reducido activado en su sistema. La confirmación del estudiante de que la Fase 1 se ve bien en su navegador consta en el chat; no se supone que haya realizado pasos específicos que no informó.
