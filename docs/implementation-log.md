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
