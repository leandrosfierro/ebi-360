# Evolución del Proyecto EBI 360: De la Planilla al SaaS

Este documento detalla la metamorfosis técnica de la plataforma, desde sus cimientos en algoritmos basados en Excel hasta la arquitectura modular e inteligente actual.

---

## 🏁 Origen: El Núcleo de la Planilla (V0)
El proyecto nació de la necesidad de digitalizar un modelo de diagnóstico complejo que residía en archivos Excel. 

### El Algoritmo Base
- **Fuente**: El modelo original utilizaba una estructura de 24 preguntas divididas en 6 dominios principales.
- **Lógica de Cálculo**: Promedios ponderados (`weighted_average`) con pesos específicos por pregunta (`weight`), severidad (`severity`) e impacto personal/organizacional.
- **Umbrales Tecnicos (Thresholds)**:
    - Bajo: 0-5
    - Medio: 5-7
    - Alto: 7-9
    - Excelente: 9-10

### La Estructura "Flat" Inicial
En el comienzo, la encuesta era estática. La base de datos era simple: una tabla de usuarios y una tabla de resultados que guardaba promedios finales, sin granularidad por pregunta.

---

## 🏗️ Fase 1: La Fundación de Datos (MVP)
Se migró la lógica del algoritmo a una base de datos relacional (PostgreSQL en Supabase).

- **Tablas de Cimentación**: `companies`, `profiles`, `surveys`.
- **Hito Técnico**: Implementación del primer script de "Seed" (`seed_ebi360_survey.sql`) que tradujo las preguntas del Excel a registros SQL, manteniendo el `calculation_algorithm` como un objeto JSON dentro de la encuesta.

---

## 🧩 Fase 2: El Salto a la Modularidad
Para escalar a múltiples empresas y diferentes tipos de encuestas (Regulatorias, Clima, etc.), el sistema se rediseñó por completo el **23 de Diciembre de 2025**.

### Cambios de Paradigma
- **Encuestas Dinámicas**: Las encuestas pasaron de ser fijas a ser objetos configurables con códigos únicos (`code`) y versiones (`version`).
- **Granularidad de Respuestas**: Creación de la tabla `survey_responses`. Ya no solo guardamos el promedio, sino cada respuesta individual vinculada a una pregunta (`question_id`).
- **Asignación Corporativa**: Se introdujo `company_surveys`, permitiendo que el Super Admin decida qué encuestas ve cada empresa cliente.
- **Evolución del Esquema**: Se reemplazaron columnas booleanas simples (`active`) por estados de ciclo de vida (`draft`, `active`, `archived`).

---

## 📊 Fase 3: Gestión de Encuestas e Informes
A medida que la plataforma creció en volumen de datos, el foco se desplazó hacia la capacidad del Administrador para procesar esa información.

- **Control Operativo**: Implementación de dashboards para el seguimiento de participación y estados de encuestas (Publicadas vs Archivadas).
- **Reportabilidad**: Desarrollo de módulos de exportación agregada que permiten al Admin de Empresa descargar la "foto" del bienestar organizacional sin comprometer la privacidad individual.
- **Carga Masiva**: Optimización de algoritmos de ingesta de datos para nóminas grandes vía Excel.

---

## 🧠 Fase 4: Inteligencia y Especialización (Actual)
La versión actual profesionaliza la plataforma añadiendo capas de experiencia de usuario e IA.

- **Rueda de Bienestar**: Un sistema de check-in diario (8 dominios) independiente de las encuestas formales.
- **Consorcio de Especialistas**: Implementación de Gemini 1.5 Flash para analizar datos históricos y generar planes de acción firmados por roles técnicos (Médicos, Psicólogos, Nutricionistas).
- **Diseño Premium**: Interfaz Glassmorphism y branding dinámico por empresa.

---

*Este documento permite entender que EBI 360 no es solo un software de encuestas, sino un motor de inteligencia de bienestar que evolucionó de un modelo matemático estático a un ecosistema dinámico.*
