---
name: karpathy-hardcore
description: "Ingeniería de software minimalista y quirúrgica: prohíbe abstracciones prematuras, impone límite estricto de diff, elimina refactorizaciones parásitas y exige validación doble (estática y en runtime)."
---

# Karpathy Hardcore Protocol (Optimized for Antigravity)

## Propósito
Eliminar la sobreingeniería, el código defensivo excesivo y la tendencia de los LLMs a reescribir módulos completos cuando solo se requiere una modificación puntual.

---

## 1. Principios Operativos Innegociables

### A. Simplicidad Radical (KISS Absoluto)
* **Regla de 1 uso:** Si una función, tipo o constante se usa en un solo lugar, debe vivir en ese lugar. Prohibido crear archivos `utils/`, `helpers/` o abstracciones genéricas especulativas.
* **Bloqueo de dependencias:** Prohibido agregar paquetes a `package.json`, `requirements.txt` o equivalentes sin autorización explícita. Resuelve siempre con la biblioteca estándar o con lo ya instalado.
* **Cero código muerto:** No dejes código comentado, bloques `# TODO` vacíos ni imports sin usar tras completar la tarea.

### B. Cirugía con Presupuesto de Diff (Diff Budget)
* **Presupuesto estándar:** Máximo 30 líneas netas modificadas por tarea estándar. Si la solución supera este presupuesto, debes desglosarla o justificar por qué es indivisible.
* **Prohibido el *drive-by refactoring*:**
  * No toques saltos de línea, orden de imports ni formato de código fuera de las líneas intervenidas.
  * No renombre variables o tipos existentes que ya funcionan solo por preferencia estilística.
* **Protocolo de escape de deuda técnica:** Si la modificación requerida te obliga a montar un parche sucio sobre un antipatrón evidente:
  1. Detente antes de escribir código.
  2. Expón el antipatrón en 2 líneas.
  3. Propón la refactorización mínima que sustituya la deuda sin expandir el alcance de la tarea.

### C. Verificación de Dos Fases (Gatekeeper)
Para dar por cerrada cualquier tarea, el agente debe reportar ambos resultados en la terminal integrada:
1. **Fase 1 (Estática):** `npx tsc --noEmit` o linter del proyecto sin advertencias nuevas.
2. **Fase 2 (Runtime / Lógica):** Ejecución de prueba unitaria, script de comprobación o ejecución directa demostrando que la salida esperada coincide con la obtenida. Prohibido asumir que funciona sin ver la salida en terminal.

---

## 2. Formato Obligatorio de Salida

Cada respuesta técnica bajo esta skill debe estructurarse sin introducciones ni textos de relleno:

```text
[ANÁLISIS]: <1 línea identificando el archivo y la línea exacta del problema>
[ACCIONES]:
- Modificar: <ruta/archivo.ext> (Líneas X-Y)
- Justificación: <por qué este es el cambio mínimo posible>
[DIFF]:
<bloque de código exacto mostrando solo las líneas que cambian>
[VERIFICACIÓN]:
- Estática: <comando ejecutado y resultado>
- Runtime: <comando ejecutado y salida obtenida>
```
