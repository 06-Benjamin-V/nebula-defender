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

## Estado: Fase 1

Base jugable: una formación de 24 invasores, movimiento lateral y descenso, disparos desde las columnas inferiores, colisiones AABB, 100 puntos por invasor y estados explícitos de menú, juego, pausa, sector despejado y derrota. Un impacto o la llegada de la formación a la zona defensiva termina esta versión. Eliminar la formación completa despeja el sector; **no representa todavía la victoria final contra el jefe**.

La resolución lógica es 480×320: permite una formación horizontal amplia y espacio vertical para esquivar. CSS conserva la proporción 3:2 y desactiva suavizado; la escala puede ser fraccional para caber en la ventana. Los sprites provisionales originales son matrices de índices de paleta, convertidas una sola vez a canvas y reutilizadas desde caché. La simulación usa segundos y limita delta a 50 ms. Todo el balance actual está en `js/config.js`.

## Estructura

```text
index.html
css/                  global.css, menu.css, hud.css, animations.css, responsive.css
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
  sprites.js          Matrices originales y caché
  ui.js               HUD y pantallas
docs/                 Registro de implementación y verificaciones
```

## Próximas fases (requieren confirmación)

2. Arte definitivo, animaciones, parallax y galería de sprites.
3. Niveles, especies, power-ups, jefe, tres vidas, invulnerabilidad y récord persistente.
4. Interfaz definitiva, audio sintetizado, partículas y vibración de cámara.
5. Controles táctiles, revisión responsive/accesibilidad y documentación académica con espacios para evidencia del estudiante.

`?debug=1` muestra FPS y cajas de colisión. Los atajos para saltar niveles llegarán con los niveles en la Fase 3. Esta fase requiere teclado; los botones táctiles se implementarán en la Fase 5.

La planificación previa con ChatGPT será documentada por el estudiante. El trabajo de Codex y las pruebas realmente ejecutadas se registran en `docs/implementation-log.md`; no se atribuyen intervenciones humanas ni resultados de pruebas no observados.

## Verificación

Con Node.js 24: `node --test tests/game.test.mjs`. Estas pruebas comprueban la lógica; no sustituyen una partida real en navegador.

Prueba manual pendiente: iniciar; mantener A/D hasta ambos bordes; mantener Espacio y comprobar bajas y puntaje; pausar/continuar con P, Escape y el botón; cambiar de pestaña y comprobar la pausa; recibir un disparo y reintentar; eliminar los 24 enemigos y verificar 002400 puntos y sector despejado. Reiniciar desde pausa debe restablecer posición, formación, disparos y puntuación. Abrir `?debug=1` para ver FPS y hitboxes. Revisar la consola del navegador durante estas acciones.
