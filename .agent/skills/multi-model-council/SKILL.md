---
name: multi-model-council
description: "Protocolo de consenso y arbitraje crítico multi-perspectiva. Despacha análisis concurrentes (Diseño vs. Red Team vs. Árbitro) para decisiones de arquitectura y bugs críticos sin caer en sesgo de mayoría ni desperdicio de tokens."
---

# Multi-Model Council Protocol (Optimized Octopus)

## Propósito
Sustituir el consenso masivo ineficiente por un consejo especializado de 3 roles técnicos. El objetivo no es promediar respuestas, sino someter cada propuesta a estrés crítico y validar el resultado final contra criterios demostrables.

---

## Cuándo Activar el Consejo
* **Permitido:**
  - Decisiones de arquitectura de datos y esquemas relacionales.
  - Diseño de contratos de API o modelos de autenticación/permisos.
  - Bugs críticos intermitentes o fallas de concurrencia difíciles de reproducir.
* **Prohibido:**
  - Maquetación CSS, ajustes de UI o estilos de componentes.
  - Tareas CRUD estándar o refactorizaciones menores de una sola línea.

---

## Las 3 Perspectivas Operativas

### 1. El Diseñador (Arquitectura Pragmática)
- Propone la solución más simple y directa que resuelva el 100% de los requerimientos actuales.
- Prohibida la sobreingeniería: cero capas innecesarias de abstracción.

### 2. El Red Team (Destructor de Suposiciones)
- Su único objetivo es demostrar por qué la propuesta del Diseñador va a fallar.
- Evalúa:
  * Estados de carrera (*race conditions*) y concurrencia.
  * Inyección de datos nulos, payloads gigantes o tipos corruptos.
  * Fallos silenciosos de red o timeout de base de datos.
  * Costo computacional en bordes extremos ($O(n^2)$, memoria en fuga).

### 3. El Árbitro (Verificación Empírica)
- **Cero falacia de mayoría:** No gana la idea que tenga más defensores; gana la que resista el ataque del Red Team con el menor número de líneas.
- Formula el **criterio duro de validación** (comando exacto de consola, script de stress test o verificación de tipos) que debe pasar la solución antes de tocar archivos de producción.

---

## Formato Obligatorio de Salida

Toda respuesta bajo este protocolo debe estructurarse estrictamente en estos 4 bloques:

```text
### [FASE 1: PROPUESTA INICIAL - DISEÑO]
- Enfoque técnico propuesto.
- Código/Diff preliminar.

### [FASE 2: RED TEAM - ATAQUE DE VULNERABILIDADES]
- Vector de falla 1: <cómo se rompe en producción>
- Vector de falla 2: <caso límite omitido>

### [FASE 3: ARBITRAJE Y CORRECCIÓN QUIRÚRGICA]
- Ajustes aplicados a la propuesta para neutralizar las fallas del Red Team.
- Código definitivo blindado.

### [FASE 4: COMANDO DE VERIFICACIÓN DURA]
- Comando exacto para ejecutar en Antigravity (test / typecheck / build).
```
