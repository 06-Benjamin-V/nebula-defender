# Registro de Codex

## Fase 1 — Base jugable

Codex inspeccionó el directorio inicialmente vacío y creó la estructura modular, el juego base con sprites provisionales originales y las instrucciones de ejecución. No se utilizaron recursos externos ni herramientas de compilación. Las fases siguientes requieren confirmación del estudiante.

Verificaciones reales:

- `node --check` sobre los 12 módulos JavaScript: sin errores de sintaxis.
- `node --test tests/game.test.mjs`: siete pruebas aprobadas sobre límites/cadencia, colisiones y puntaje único, derrota, formación, descarte de proyectiles, transiciones y validez de las matrices.
- Se inició el servidor opcional de Node.js y anunció 127.0.0.1:8000. La comprobación HTTP desde PowerShell fue bloqueada por permisos del socket; al reintentarse fuera del entorno restringido agotó el tiempo de conexión. Por tanto, no se confirmó la entrega de recursos por HTTP en este entorno.
- Revisión de código: se corrigió el atajo de pausa para permitir continuar con P/Escape aunque el botón del panel tenga foco.
- Se intentó abrir el juego en el navegador integrado; devolvió `ERR_CONNECTION_TIMED_OUT`. El intento de usar Brave mediante Computer Use fue detenido por la herramienta porque no pudo verificar con confianza la URL actual. No se verificó visualmente el juego ni se completó una partida en navegador. No se generaron capturas.

Pendientes: prueba manual detallada en README y funcionalidades de las fases 2–5. El arte y la presentación actuales son provisionales; la derrota con un impacto es intencional en esta fase, antes del sistema de tres vidas de la Fase 3.

## Fase 2 — Arte

El estudiante informó en el chat que el juego se ve bien en su navegador y dio por terminada la Fase 1; autorizó comenzar esta fase. No se infieren pruebas adicionales del estudiante.

Codex reemplazó el arte provisional por matrices originales: nave, propulsión, tres especies de dos frames, jefe de 48×32, dos proyectiles, tres cápsulas, destello, impacto y explosión de cuatro frames. Añadió fondo prerenderizado con nebulosa y parallax de tres capas, secuencias de efectos con límite y limpieza, y atlas independiente a escala ×8 con paleta e inspección de frames. Las mecánicas de la Fase 1 permanecen; el jefe, las otras dos especies y los objetos solo tienen arte por ahora.

Verificaciones reales:

- `node --check` sobre todos los módulos JavaScript y `git diff --check`: sin errores.
- `node --test tests/*.test.mjs`: 11 pruebas aprobadas, incluidas las siete anteriores. Las nuevas verifican dimensiones y cobertura de frames, reutilización de caché, duración/límite de efectos y parallax detenido con movimiento reducido.
- Servidor Node iniciado fuera del entorno restringido: respuestas HTTP 200 para el juego, atlas y los cinco recursos nuevos comprobados.
- Navegador integrado: carga del atlas con todas las tarjetas, revisión visual de nave, especies, jefe, proyectiles y cápsulas; botón de pausa cambió a «Reproducir animaciones»; se expandió la inspección de los cuatro frames de explosión.
- Partida en navegador: inicio, movimiento, disparos, dos bajas y 200 puntos, pausa con P; se observó la derrota y se comprobó reintento con nuevos disparos y puntaje. Tras recargar se verificaron los sprites integrados y el fondo. Sin avisos ni errores en los registros de consola consultados de ambas páginas.
- Captura real del atlas guardada por Codex en `docs/captures/phase-2-atlas.png`; corresponde al navegador integrado durante esta fase.

Límites: no se completó una partida hasta sector despejado ni se midieron 60 FPS de forma sostenida. Movimiento reducido fue comprobado por pruebas de lógica y revisión de código; queda por probar con la preferencia del sistema real. No se validaron dispositivos móviles físicos. Partículas, audio y vibración de cámara corresponden a fases posteriores. La Fase 3 requiere confirmación del estudiante.

## Fase 3 — Contenido y campaña

El estudiante confirmó en el chat que la Fase 2 está correcta y autorizó esta fase. Codex añadió cuatro niveles reales, resistencia y patrones propios por especie, tres mejoras combinables, vidas, invulnerabilidad, jefe de dos fases, victoria/derrota y récord persistente. Se integraron HUD de vidas/mejoras/récord, introducciones de sector, barra de salud del jefe y atajos debug 1–4. Las partidas debug no escriben el récord normal.

La simulación quedó en `session.js`, separada del motor visual, con módulos específicos para niveles, jefe, cápsulas y almacenamiento. Todos los valores de balance están en `config.js`. Los proyectiles usan barrido de trayectoria; un impacto no puede puntuar dos bajas. Una invasión reconstruye el sector y consume una vida; se conservaron las mecánicas de pausa y los sprites existentes. Las descripciones del atlas se actualizaron al contenido jugable.

Verificaciones reales:

- `node --check` sobre todos los módulos JavaScript: sin errores de sintaxis.
- `node --test tests/*.test.mjs`: 23 pruebas aprobadas. Se adaptaron dos pruebas anteriores a las reglas de vidas y cadencia individual. Las nuevas cubren introducción y progresión 1→2→3→4, victoria y puntaje, daños simultáneos/invulnerabilidad, invasión, mejoras/renovación/expiración, recogida y descarte de cápsulas, resistencia del centinela, barrido de trayectoria, tipos de disparo, dos fases del jefe y sus límites, datos corruptos/almacenamiento bloqueado, reinicio y aislamiento del récord en debug.
- `node tools/simulate-campaign.mjs`: tres campañas completas con controlador automático y semillas 1, 2 y 3. Usaron las reglas reales sin modificar salud, daño o resultados: victoria en 64, 74 y 71 segundos simulados, respectivamente; dos, una y tres vidas restantes; 13.800 puntos en cada caso. Es una prueba de integración de la simulación, no una partida humana ni un benchmark de renderizado.
- Navegador integrado: carga, HUD de tres vidas/récord, atajos a sectores 2, 3 y 4, pausa y continuación con P, Némesis visible con barra de salud. Inicialmente el entorno mostró cerca de 1 FPS y un intento de mantener una tecla durante 30 s alcanzó el límite de la herramienta; se descartó ese intento como evidencia de combate. Tras recuperar la sesión, se observó derrota con 0/3 vidas; al reiniciar el sector 4, seis segundos de disparo causaron daño al jefe (78/80 al leer su barra en pausa) y pérdida de una vida. Las siguientes capturas mostraron aproximadamente 60 FPS puntuales; no se considera un benchmark sostenido.
- Partida normal en navegador: ocho bajas, 800 puntos, récord de 800 y tres vidas. Tras recargar: menú, cero puntos, tres vidas y récord de 800 conservado. La tecla 4 no cambió el sector en modo normal. Sin avisos ni errores del juego en los registros de consola consultados.
- Captura real final del combate debug contra Némesis guardada en `docs/captures/phase-3-boss.png`.
- Comprobación HTTP final: respuestas 200 para el juego y los siete módulos comprobados (`session`, `levels`, `boss`, `power-ups`, `storage`, `engine` y `ui`). `git diff --check` no detectó errores de espacios.

Pendientes de verificación manual: campaña completa a velocidad normal en el navegador habitual, sensaciones de dificultad, recogida visual de todas las mejoras y preferencia real de movimiento reducido. Se documentaron pasos en README. Audio, partículas, screen shake y documentación académica final corresponden a fases 4–5; no se avanzó a ellas.

## Fase 4 — Interfaz, audio y efectos

El estudiante confirmó que la Fase 3 está en orden y autorizó comenzar esta fase. Codex pulió menú, controles superiores y pantallas de pausa/resultado; añadió emblema original, resumen final y aviso de récord, instrucciones y ajustes mediante diálogos nativos. Se añadió síntesis Web Audio para disparos, impactos, explosiones, mejoras, protección, botones y señales de misión; silencio y volumen persistentes. El contexto se crea desde Jugar/Reintentar y las voces se limitan, detienen y desconectan al terminar. No se usaron archivos de audio ni recursos remotos.

Se crearon módulos independientes para audio, partículas, cámara y diálogos. La vibración solo modifica el dibujo, el HUD permanece fijo y las colisiones conservan sus coordenadas. Las partículas están limitadas y se descartan al expirar; ambas funciones se anulan con movimiento reducido. Se respetó la pausa y se limpiaron los efectos al reiniciar o cambiar de sector. Las reglas de la campaña permanecen iguales; se añadió notificación de impactos bloqueados para darles respuesta audiovisual.

Verificaciones reales:

- `node --check` sobre todos los módulos JavaScript y `git diff --check`: sin errores.
- `node --test tests/*.test.mjs`: 32 pruebas aprobadas. Las nueve nuevas verifican audio diferido, persistencia/silencio, cadencia y límite de voces, limpieza, compatibilidad/almacenamiento bloqueados, volumen cero/corrupto, partículas y cámara con movimiento reducido, exclusión de teclas de juego dentro de diálogos y retorno del foco después de cerrar. Web Audio se comprueba con dobles; no se atribuye una escucha a estas pruebas.
- `node tools/simulate-campaign.mjs`: las tres semillas conservan victoria, 13.800 puntos y resultados de 64/74/71 segundos simulados con 2/1/3 vidas; la presentación no cambió la simulación de combate.
- El puerto 8000 ya estaba ocupado por un servidor que entregaba estos archivos actualizados; se reutilizó para las pruebas sin detener ese servicio existente.
- Navegador: ajustes antes de Jugar mostraron muestra deshabilitada. Se silenció y cambió volumen a 25 %; tras recargar persistieron ambos valores. Se reactivó el sonido, se inició una misión, se obtuvieron 500 puntos y, al abrir ajustes, apareció «Efectos de sonido listos» con «Probar sonido» habilitado. Se activó la muestra y se consultó la consola sin avisos ni errores del juego. No se afirma una evaluación auditiva de calidad.
- Se comprobó que abrir ajustes o instrucciones pausa la misión, P dentro del diálogo no la reanuda y Escape cierra sin continuar. Durante la revisión se corrigió el retorno del foco al botón original; al continuar o silenciar desde la barra, el foco se devuelve al canvas para mantener los controles de vuelo. Se verificaron movimiento/disparos después de silenciar y, tras continuar, se observaron 900 puntos con doble y rápido simultáneos en el HUD.
- Al terminar la comprobación de preferencias se restablecieron sonido activo y volumen 40 %. Se guardó una captura real de los ajustes en `docs/captures/phase-4-settings.png`.
- La partida real terminó en derrota y se verificaron el resumen de 900 puntos, sector 01/04, 0/3 vidas y el aviso de nuevo récord. También se comprobó reinicio desde pausa: regresó a jugando con tres vidas y cero puntos. Capturas reales adicionales: `docs/captures/phase-4-result.png` y `docs/captures/phase-4-menu.png`. Se consultó de nuevo la consola final sin errores ni avisos del juego.
- Recursos comprobados por HTTP con respuesta 200: página principal, `css/dialogs.css` y los módulos nuevos de audio, cámara, partículas y diálogos. Se retiró una línea vacía final detectada por `git diff --check`; la comprobación final quedó sin errores de espacios.

Pendientes: escucha y valoración del volumen en el equipo del estudiante, prueba con movimiento reducido real y revisión responsive/accesibilidad de Fase 5. No se completó manualmente la campaña entera en esta fase ni se midieron FPS sostenidos. Los controles táctiles y la documentación académica final siguen reservados para la Fase 5, que requiere confirmación.

## Corrección de Fase 4 antes de Fase 5 — Inicio del audio

El estudiante informó que el audio empezaba segundos después de la partida y autorizó corregirlo y continuar con Fase 5. Codex encontró que `begin()` arrancaba la simulación sin esperar la promesa de `AudioContext.resume()`. Ahora Jugar y Continuar esperan esa confirmación, muestran «Preparando misión», comparten un único desbloqueo y cancelan respuestas tardías si se pierde foco o se abre un diálogo. El contexto solicita latencia interactiva y una espera acotada de tres segundos permite continuar en silencio si el dispositivo no responde.

Verificación real: `node --test tests/*.test.mjs`, 37 pruebas aprobadas. Las cinco nuevas reproducen reanudación lenta, llamadas simultáneas, dispositivo sin respuesta, sincronización de inicio, cancelación tardía y continuidad de una partida pausada. Son pruebas de control de flujo; la escucha en el equipo del estudiante sigue pendiente.
