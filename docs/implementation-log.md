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
