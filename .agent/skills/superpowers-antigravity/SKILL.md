---
name: superpowers-antigravity
description: "Framework de ingeniería de alta disciplina adaptado a Antigravity: bifurcación lógica/UI, planes atómicos de 5 minutos, aislamiento en Git y protocolo de depuración con interruptor de circuito."
---

# Superpowers Antigravity Protocol

## Propósito
Imponer disciplina de ingeniería de producción al agente eliminando la improvisación, la sobreescritura descontrolada de archivos y el desgaste innecesario de tokens.

---

## 1. Reglas Innegociables (Guardrails)

* **Cero código en frío:** Prohibido modificar archivos de producción sin un plan atómico explícito y aprobado.
* **Aislamiento de contexto:** Modificar una sola capa técnica a la vez (Base de datos -> Lógica/API -> UI). Prohibido tocar backend y frontend en la misma microtarea.
* **Bifurcación estricta por tipo de tarea:**
  * **Vía A (Lógica de negocio, APIs, cálculos, utilidades):** TDD obligatorio.
    1. Escribir test que reproduzca el caso o falle.
    2. Confirmar fallo rojo en terminal.
    3. Escribir la implementación mínima.
    4. Confirmar paso verde.
  * **Vía B (Frontend, componentes UI, maquetación, estilos):** Contrato de tipos y estados.
    1. Prohibido inventar tests unitarios frágiles para CSS/layout.
    2. Verificación mediante `tsc --noEmit` o linter estricto.
    3. Cobertura obligatoria de 4 estados visuales: Carga (Loading), Error, Vacío (Empty) y Éxito (Success).
* **Interruptor de circuito (Circuit Breaker):** Si un comando de prueba o build falla 2 veces consecutivas, el agente tiene prohibido seguir editando código. Debe detenerse, emitir el análisis de causa raíz y esperar confirmación.

---

## 2. Flujo Operativo en 4 Fases

### Fase 1: Arquitectura y Especificación (Scope)
- Aclarar dependencias, contratos de interfaz y casos límite antes de redactar código.
- Definir criterios de aceptación objetivos y medibles.
- Si hay ambigüedades, plantear de 1 a 3 preguntas directas con opciones binarias.

### Fase 2: Plan Atómico de 5 Minutos
- Estructurar el trabajo en microtareas que no superen 5 minutos de ejecución.
- Formato por microtarea:
  * **Archivo(s):** Ruta completa y exacta.
  * **Acción:** Creación / Modificación / Eliminación.
  * **Comando de verificación:** Script o comando ejecutable en la terminal de Antigravity.

### Fase 3: Ejecución y Aislamiento
- Ejecutar únicamente la microtarea aprobada sin contaminar otros archivos.
- Correr el comando de verificación de forma inmediata.

### Fase 4: Protocolo de Depuración e Interruptor de Circuito
- Si un comando o prueba falla por segunda vez consecutiva, se activa el interruptor de circuito:
  1. Detener toda edición de archivos.
  2. Aislar el fallo con el comando mínimo.
  3. Formular una sola hipótesis comprobable basada en logs y trazas reales.
  4. Presentar el diagnóstico y solicitar confirmación antes de reanudar cambios.
