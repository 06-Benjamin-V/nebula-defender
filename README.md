# NEBULA DEFENDER

## Fase 6 — Música y pantalla fija

Tema original de 8 bits sintetizado localmente (melodía, arpegios y bajo, 132 BPM), sin descargas ni dependencias. Empieza con la partida; pausa, diálogos, pérdida de foco y final detienen la música. Sonido y volumen controlan tanto música como efectos.

La pantalla principal ocupa el alto disponible y no se desplaza. Las cuatro flechas bloquean el desplazamiento fuera de campos y diálogos; el canvas conserva la proporción 3:2. El atlas y los diálogos largos mantienen su desplazamiento interno para poder consultar su contenido.

Arcade espacial original con HTML5, CSS3, JavaScript ES modules y Canvas 2D. Sin frameworks, npm, compilación, fuentes remotas ni servicios externos. Desarrollo por fases para la evaluación de un curso de IA.

## Ejecutar

Desde esta carpeta, con Python 3 instalado:

```powershell
python -m http.server 8000
```

Abrir http://localhost:8000. No abrir `index.html` directamente: los módulos necesitan HTTP. Si Windows muestra la tienda en lugar de Python, usar `py -m http.server 8000` si está instalado el lanzador.

Alternativa con Node.js 24, sin instalar paquetes:

```powershell
node tools/serve.mjs
```

Abrir http://127.0.0.1:8000. Detener el servidor con Ctrl+C. El servidor de Node escucha exclusivamente en la máquina local.

## Controles

- A/D o flechas: mover horizontalmente.
- Espacio: disparar (se puede mantener pulsado).
- P o Escape: pausar/continuar. También hay un botón de pausa.
- La partida se pausa al perder el foco u ocultar la pestaña.
- Reintentar después de ganar o perder empieza una campaña limpia; también se puede reiniciar desde pausa.
- En dispositivos táctiles aparecen botones de izquierda, derecha y disparo. Mantén una dirección y Disparar con dos dedos; al soltar o cancelar un toque se libera esa acción. En menú y pausa están deshabilitados.

## Estado: develop — cinco niveles y vista ampliada

Campaña jugable de cinco sectores. Los sectores 1–3 contienen 24 invasores cada uno; el cuarto reúne 32 enemigos de las tres especies y el quinto es exclusivo del jefe.

| Sector | Contenido y diferencia |
| --- | --- |
| 1 · Órbita exterior | Exploradores Prisma, un impacto de resistencia, tiros verticales. |
| 2 · Cinturón espectral | Espectros Violeta con oscilación vertical y tiro dirigido, mezclados con exploradores; mayor velocidad y presión. |
| 3 · Bastión carmesí | Centinelas de dos impactos con desplazamiento lateral y abanico triple, mezclados con espectros; formación más rápida. |
| 4 · Umbral del Vacío | Cuatro filas de centinelas, espectros y exploradores; velocidad de 43 px/s, descenso de 12 px y hasta 12 disparos enemigos. Última formación antes del reactor. |
| 5 · Némesis | Jefe de 80 puntos de salud, patrulla lateral, abanicos y torretas dirigidas alternados. Al 50 % de salud, aumenta velocidad, cadencia y amplitud del abanico. Barra de salud y breve aviso visual antes del disparo. |

Al vaciar una formación se limpia el campo de proyectiles y cápsulas y comienza el siguiente sector, con una introducción de 1,5 segundos. Durante ella puedes mover la nave, pero no hay disparos. La victoria se obtiene únicamente al destruir a Némesis. Cada nueva campaña comienza con tres vidas y cero puntos.

### Vidas y mejoras

- Cada impacto sin protección consume una vida. La nave reaparece centrada y recibe 1,8 segundos de invulnerabilidad con parpadeo; los disparos enemigos presentes se eliminan. Varios impactos en un mismo frame solo cuestan una vida.
- Si los invasores cruzan la zona defensiva, pierdes una vida incluso con escudo o invulnerabilidad y se reconstruye el sector actual. Se conserva el puntaje ya ganado; los enemigos repetidos pueden volver a conceder puntos.
- Al perder una vida se eliminan las mejoras. Con cero vidas, aparece la pantalla de derrota.
- Cada baja de un enemigo común tiene una probabilidad inicial del 20 % de soltar una cápsula. Hay como máximo cuatro en pantalla; caen y deben tocar la nave para recogerse.
- Disparo doble: dos proyectiles paralelos. Disparo rápido: reduce el intervalo al 48 % del original. Escudo: bloquea disparos mientras está activo.
- Cada mejora dura ocho segundos de simulación, puede combinarse con las otras y renueva su duración al recoger otra del mismo tipo. No acumula duración.
- Las mejoras y la invulnerabilidad se congelan al pausar. Se conservan al avanzar de sector y sus temporizadores continúan durante la introducción.

### Puntuación y récord

Explorador: 100 puntos; espectro: 150; centinela: 250; Némesis: 3.000. Una campaña sin repetir sectores por invasión suma **19.000 puntos**. Cada baja puntúa una sola vez y el jefe solo concede puntos al ser destruido.

El récord se guarda en `localStorage`, con acceso protegido por `try/catch` y validación del valor leído. Si no hay almacenamiento disponible, se mantiene en memoria durante la sesión. Se conserva al reiniciar la campaña. El récord pertenece al origen: `localhost` y `127.0.0.1` mantienen registros separados.

Todo el balance del juego está en `js/config.js`: salud, velocidades, cadencias, composiciones, puntuaciones, probabilidades, duración de mejoras, vidas y protección. Los límites globales de disparos se combinan con la cadencia individual de cada especie; solo dispara el invasor inferior de cada columna.

## Interfaz, sonido y efectos

El menú incluye el emblema pixel art de Aurora y accesos a «Cómo jugar» y «Ajustes de sonido». La barra superior permite consultar las instrucciones, activar/silenciar los efectos y ajustar el volumen durante la sesión. Las pantallas de pausa, victoria y derrota mantienen el mismo estilo; las pantallas finales muestran puntuación, sector y vidas restantes, además de un aviso cuando se supera el récord que había al iniciar la campaña.

Abrir instrucciones o ajustes durante el combate pausa la misión y detiene las voces que estaban sonando. Los diálogos contienen el foco, se cierran con Escape y devuelven el foco al control que los abrió; cerrarlos **no reanuda** la partida. Al pulsar Continuar o P, el foco vuelve al campo de juego. Silenciar desde la barra durante el combate también devuelve el control a la nave.

El audio usa exclusivamente osciladores y envolventes de Web Audio API: disparos, impactos, explosiones, protección, mejoras, botones y señales de inicio, pausa, sector, victoria y derrota. No hay archivos de audio ni música externa. Se crea un único `AudioContext` al pulsar Jugar/Reintentar, nunca al cargar la página, abrir ajustes o cambiar preferencias antes de jugar. Entrar directamente a un sector con debug no desbloquea el audio por sí solo.

Se corrigió el retraso inicial informado por el estudiante: la simulación y la señal de inicio ahora esperan la confirmación de `AudioContext.resume()`. Mientras tanto aparece «Preparando misión» y se bloquean inicios duplicados. Continuar usa la misma sincronización; perder el foco o abrir un diálogo cancela un inicio pendiente. El contexto solicita latencia interactiva. Si el dispositivo no responde en tres segundos, el juego continúa en silencio con un mensaje en ajustes, sin incorporar sonidos atrasados a mitad del combate. Recargar permite volver a intentar la activación en ese caso.

Silencio y volumen se guardan en `localStorage` dentro de `try/catch`. El volumen inicial es 40 %, con ganancia maestra moderada. «Probar sonido» se habilita cuando el audio está disponible y desbloqueado; no se habilita antes de Jugar ni mientras está silenciado o con volumen cero. Si Web Audio no está disponible, el juego continúa en silencio e informa el estado en ajustes. Pausar, reiniciar, perder el foco u ocultar la pestaña cancela las voces pendientes; al volver no se reproduce una ráfaga de sonidos atrasados.

Las explosiones, impactos y mejoras producen pequeñas partículas cuadradas, con un máximo simultáneo de 160 y descarte al expirar. La cámara vibra de forma breve al recibir daño o destruir centinelas/Némesis: como máximo tres píxeles lógicos. El HUD permanece fijo y las coordenadas de colisión no cambian. Pausa congela los efectos; reinicio y cambio de sector los limpian. `prefers-reduced-motion` elimina partículas y vibración, además de reducir las animaciones existentes. Las voces están limitadas a 12, con protección contra efectos repetidos en el mismo instante y desconexión al terminar.

La configuración visual y las notas de cada efecto de sonido están también en `js/config.js`, separadas del balance de combate. La presentación no modifica las reglas de la campaña; los impactos bloqueados por escudo o invulnerabilidad tienen una señal visual y sonora propia.

## Responsive y accesibilidad

- El campo mantiene siempre 3:2 y la resolución interna de 480×320. Aprovecha el ancho y el alto disponibles sin límite de escala ×2 ni ancho máximo de 1040 px. La interfaz decorativa cede espacio al juego; el escalado conserva el pixelado y no deforma las colisiones.
- En horizontal las flechas quedan juntas en una fila a la izquierda y Disparar a la derecha, fuera del canvas. El HUD se compacta y la barra de mejoras vacía se oculta. En vertical los controles quedan al pie de la pantalla. El campo se recalcula al rotar o cambiar la altura del HUD sin desplazar la página.
- Los controles se muestran en pantallas táctiles y vistas móviles estrechas, también con ratón. El cambio de tamaño, la pérdida de captura, la cancelación de un puntero, pausa y reinicio limpian pulsaciones retenidas. Los botones también admiten mantener Espacio/Enter cuando reciben foco de teclado.
- No se bloquea el zoom del navegador. Se respetan las áreas seguras de pantalla; el zoom no se contrarresta encogiendo el campo por el cambio del viewport visual.
- Hay enlace para saltar al campo de juego, foco visible, etiquetas de controles, volumen y barra del jefe, diálogos nativos con retorno del foco y avisos discretos de estado, pérdida de vida y recogida de mejoras.
- El contraste comprobado de las seis combinaciones principales supera 4,5:1: texto/fondo 17,06; texto/panel 15,77; secundario/panel 7,10; cian/panel 13,43; violeta/panel 6,08; botón principal 13,45. Esto no equivale a una auditoría completa con lectores de pantalla.

Para probar en un teléfono físico, ejecuta el servidor Python en el equipo y abre `http://IP_LOCAL_DEL_EQUIPO:8000` desde un teléfono en la misma red, sustituyendo el marcador por la dirección local del equipo. El servidor opcional de Node está limitado a `127.0.0.1` y sirve para pruebas en ese mismo equipo. La prueba de dos dedos y los detalles específicos de cada teléfono requieren dispositivo físico; la emulación de tamaño del navegador no los reproduce por sí sola.

## Arte y galería

Abrir http://localhost:8000/sprites-preview.html o http://127.0.0.1:8000/sprites-preview.html. También hay un enlace «Atlas de sprites» al pie del juego.

Sprites originales como matrices de caracteres que indexan una paleta: nave de 16×16, tres especies de 12×12 con dos frames cada una, jefe de 48×32, proyectiles de 3×7, mejoras de 10×10 y explosión de cuatro frames. La propulsión, los destellos y los impactos también usan secuencias originales.

Cada matriz se convierte una sola vez a canvas y se reutiliza desde caché, sin suavizado. La galería muestra escala exacta ×8, dimensiones, paleta, pausa de animaciones e inspección de frames por separado. El jefe y las tiras permiten desplazamiento horizontal en pantallas estrechas para conservar esa escala.

Fondo con nebulosa tenue prerenderizada y tres capas de estrellas. `prefers-reduced-motion` detiene parallax y animaciones decorativas, sustituye el parpadeo de invulnerabilidad por opacidad estable y usa efectos tenues; los desplazamientos necesarios para jugar se conservan. La galería comienza detenida con esta preferencia y permite reproducir manualmente.

## Arquitectura

Resolución lógica de **480×320**, elegida para dar espacio horizontal a las formaciones y margen vertical para esquivar. CSS conserva 3:2 y `image-rendering: pixelated`; la escala puede ser fraccional para caber en la ventana. El loop usa `requestAnimationFrame` y delta en segundos limitado a 50 ms. Las colisiones barren la trayectoria de los proyectiles para evitar atravesar blancos entre frames; la nave tiene una caja ligeramente menor que su dibujo.

```text
index.html              Juego y HUD
sprites-preview.html    Atlas animado ×8
css/                    Globales, menú, HUD, animaciones, responsive y atlas separados
js/
  main.js               Inicio
  config.js             Todo el balance y la paleta
  engine.js             Loop, render y conexión con interfaz/input
  session.js            Simulación de una campaña, sin DOM
  state.js              Menú, jugando, pausa, victoria y derrota
  levels.js             Construcción y transición de los cinco sectores
  player.js             Movimiento, vidas, protección y mejoras activas
  enemies.js            Formación, especies y sus patrones de disparo
  boss.js               Movimiento, fases, torretas y abanicos de Némesis
  power-ups.js          Caída, recogida y descarte de cápsulas
  projectiles.js        Trayectorias y descarte de balas
  collisions.js         Barrido de colisiones, resistencia e impactos
  storage.js            Récord persistente con recuperación ante errores
  sprite-data.js        Matrices originales y secuencias
  sprites.js            Rasterización inicial y caché
  background.js         Nebulosa y parallax
  effects.js            Secuencias de disparo, impacto y destrucción
  particles.js          Partículas limitadas y limpieza
  camera.js             Vibración exclusivamente visual
  audio.js              Síntesis, preferencias, voces y desbloqueo diferido
  dialogs.js            Instrucciones/ajustes y devolución del foco
  sprites-preview.js    Galería independiente
  input.js              Teclado y atajos de debug
  touch.js              Punteros simultáneos, captura y liberación de controles
  layout.js             Ajuste proporcional del campo y visibilidad en móvil
  ui.js                 HUD, barra del jefe y pantallas
tests/                  Pruebas de lógica y arte con Node
tools/                  Servidor opcional y simulación diagnóstica
docs/                   Registro real de Codex y capturas
```

Reiniciar crea una sesión limpia y descarta entidades y efectos anteriores; no duplica listeners ni el loop.

## Debug y verificación

Abrir http://127.0.0.1:8000/?debug=1. Muestra FPS y hitboxes; las teclas **1, 2, 3, 4 y 5** (también numpad) inician directamente ese sector con tres vidas, cero puntos y sin mejoras. Funcionan desde menú, pausa o partida terminada. En modo normal no hacen nada. Las partidas debug no modifican el récord.

Con Node.js 24:

```powershell
node --test tests/*.test.mjs
node tools/simulate-campaign.mjs
node tools/check-project.mjs
```

Las 45 pruebas cubren arte y caché, colisiones, resistencia, introducción/transiciones de cinco sectores, vidas, invulnerabilidad, mejoras, límites de disparos, jefe, reinicio y almacenamiento. Incluyen audio diferido/sincronizado, música, silencio/volumen, limpieza de voces, fallos de compatibilidad, partículas, vibración, diálogos, bloqueo de flechas, punteros simultáneos, cancelación/rotación y proporción del campo incluso por encima de escala ×2. El audio y los eventos táctiles se comprueban con dobles: esas pruebas no equivalen a una escucha ni a una prueba física con dos dedos. Las pruebas de transición colocan proyectiles controlados para verificar cada baja; no son partidas humanas.

`check-project.mjs` comprueba 66 referencias locales/importaciones, identificadores HTML únicos, ausencia de referencias remotas en las páginas y las seis combinaciones de contraste indicadas arriba. No instala dependencias ni modifica archivos.

El diagnóstico adicional ejecuta un controlador automático sobre la misma simulación a pasos de 1/60 s, con tres semillas reproducibles y sin modificar daño o salud. En develop, las semillas 1 y 3 ganaron en 84 y 85 segundos simulados, con dos vidas y 19.000 puntos; la semilla 2 perdió en el sector 4 a los 58 segundos, con 14.050 puntos. El diagnóstico devuelve código 1 si alguna simulación pierde. Esto no mide FPS ni demuestra una dificultad adecuada para cualquier jugador.

Codex abrió la versión de Fase 3 en navegador y comprobó accesos debug a sectores 2–4, pausa/continuación, HUD, daño a Némesis (78/80 al consultar la barra), pérdida de vidas y derrota. En una partida normal obtuvo 800 puntos y comprobó que el récord de 800 se conserva tras recargar, con puntuación de partida reiniciada a cero; la tecla 4 permaneció deshabilitada fuera de debug. Sin avisos ni errores del juego en los registros consultados. Tras un problema inicial de renderizado limitado, la sesión nueva mostró aproximadamente 60 FPS en capturas puntuales: no es una medición sostenida. No se completó manualmente toda la campaña en navegador.

En Fase 4 Codex comprobó menú, instrucciones, ajustes, persistencia de silencio y volumen al 25 % tras recarga, cierre con Escape, foco y pausa al abrir diálogos. Después de Jugar, el navegador indicó «Efectos de sonido listos» y habilitó la muestra de audio; se activó sin errores de consola. Se restablecieron sonido activo y volumen 40 % al finalizar esa comprobación. En combate se alcanzaron 900 puntos y se observaron doble y rápido activos simultáneamente. La partida terminó en derrota con resumen de 900 puntos, sector 01/04, cero vidas y aviso de nuevo récord. Se verificó reinicio desde pausa con cero puntos y tres vidas. Las preferencias de movimiento reducido se verificaron por lógica y código; queda pendiente su revisión con la preferencia real del sistema y una escucha del sonido en el equipo del estudiante.

### Pruebas manuales pendientes

1. Jugar sin debug: comprobar que los niveles avanzan automáticamente, se conservan vidas y el jefe es necesario para ganar.
2. Recoger cada cápsula; combinar doble y rápido, probar el escudo y comprobar su expiración y congelación durante pausa.
3. Recibir impactos separados, comprobar protección temporal, perder las tres vidas y reintentar.
4. Dejar llegar una formación a la zona defensiva: debe consumir una sola vida y reiniciar ese sector.
5. Obtener puntos sin debug, recargar la página en el mismo origen y comprobar el récord.
6. Probar `?debug=1`, saltar a cada sector y comprobar que no afecta al récord normal.
7. Revisar movimiento reducido con la preferencia real del sistema y comprobar fluidez en el navegador habitual.
8. Escuchar los efectos con volumen moderado, silenciar/reactivar y cambiar de pestaña durante el combate. Comprobar que no quedan sonidos pendientes al pausar o reiniciar y que el balance entre efectos resulta cómodo.

## Documentación de la evaluación

- [docs/proceso_ia.md](docs/proceso_ia.md): plantilla con herramientas, prompts reales, evidencias, bugs, intervenciones propias y comparación de versiones. Todos los apartados personales están marcados **[COMPLETAR POR EL ESTUDIANTE]**.
- [documento_acompanamiento.md](documento_acompanamiento.md): estructura breve con preguntas guía para una página, sin reflexión redactada por la IA.
- [docs/implementation-log.md](docs/implementation-log.md): acciones y pruebas realmente realizadas por Codex.
- [docs/testing.md](docs/testing.md): comprobaciones finales y límites de la verificación, con pasos manuales para el equipo del estudiante.

La planificación previa con ChatGPT y la reflexión académica serán completadas por el estudiante. Solo se registran acciones y verificaciones reales de Codex en `docs/implementation-log.md`; no se inventan intervenciones humanas ni capturas.
