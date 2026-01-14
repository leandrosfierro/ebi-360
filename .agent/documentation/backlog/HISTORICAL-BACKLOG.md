# Backlog Técnico Histórico (Retrospectivo)

Este documento organiza el desarrollo del proyecto como una hoja de ruta lógica desde cero. Sirve para entender la secuencia técnica necesaria para replicar o escalar la plataforma.

---

## 🏁 Etapa 0: Definición del Núcleo (El Algoritmo)
**Objetivo**: Traducir el conocimiento de dominio (Excel) a lógica computacional.

- [ ] **Análisis de Variables**: Identificar los 6/8 dominios base y sus fórmulas de peso.
- [ ] **Mapeo de Preguntas**: Definir el set de 24 preguntas originales con sus tags de severidad.
- [ ] **Prototipo de Cálculo**: Desarrollar la función de JavaScript/TypeScript que reciba un objeto de respuestas y devuelva el promedio ponderado.

---

## 🏗️ Etapa 1: Arquitectura Base y Datos
**Objetivo**: Establecer el cimiento sobre el cual correrá el algoritmo.

- [ ] **Setup de Supabase**: Configurar tablas de `Auth`, `Profiles` y `Companies`.
- [ ] **Esquema de Encuestas V1**: 
    - Crear tablas `surveys` y `survey_questions`.
    - Realizar la migración inicial de datos (Seed) desde el Excel mapeado.
- [ ] **API de Resultados**: Crear la tabla `results` para persistir la primera versión del diagnóstico.

---

## 🧩 Etapa 2: Transformación a Sistema Modular (El Motor)
**Objetivo**: Convertir el MVP estático en un SaaS escalable y multi-proposito.

- [ ] **Refactor de Base de Datos**:
    - Implementar UUIDs universales.
    - Separar la configuración de la encuesta (`json_config`) de su contenido.
- [ ] **Sistema de Asignaciones**: Desarrollar la tabla pivot `company_surveys` para permitir planes diferenciados por cliente.
- [ ] **Navegación Dinámica**: Implementar rutas en Next.js que carguen encuestas basadas en el `code` de la URL.
- [ ] **Branding Engine**: Crear el contexto de marca que inyecta colores y logos dinámicos.

---

## 📋 Etapa 3: Gestión de Encuestas e Informes (Operación Admin)
**Objetivo**: Implementar las herramientas de control y análisis para los administradores.

- [ ] **Control del Ciclo de Vida**:
    - Workflow de publicación/archivado de encuestas.
    - Seguimiento de tasas de respuesta en tiempo real.
- [ ] **Panel de Gestión de Empresa**:
    - Herramientas de carga masiva de empleados (CSV/Excel).
    - Gestión de nómina y asignación de encuestas por departamento.
- [ ] **Módulo de Informes Administrativos**:
    - Generación de reportes agregados por empresa.
    - Exportación de resultados a formatos legibles (HTML/PDF) para el Admin.

---

## 🎨 Etapa 4: Capa de Experiencia y Bienestar (El Frontend Premium)
**Objetivo**: Dar vida a los datos mediante una interfaz que genere "wow" y fidelidad.

- [ ] **Dashboard Bento**: Diseñar el home con widgets interactivos (Radar, estadísticas rápidas).
- [ ] **Módulo "Mi Rueda"**: Implementar el check-in diario simplificado con el radar de bienestar.
- [ ] **Refactor Visual**: Aplicar el sistema de diseño Glassmorphism (paneles traslúcidos, gradientes de malla).

---

## 🤖 Etapa 5: Inteligencia AI y Valor Agregado
**Objetivo**: Transformar el diagnóstico en acción mediante tecnología de punta.

- [ ] **Integración Gemini AI**: Desarrollar el Server Action para consultar el modelo de lenguaje.
- [ ] **Consorcio de Especialistas**: Configurar los Prompts para que la IA actúe como un equipo técnico.
- [ ] **Motor de Exportación de Planes**: Implementar `jspdf` para que el Usuario tenga su documento de bienestar personalizado.
- [ ] **Análisis de Tendencias**: Desarrollar la lógica de base de datos para detectar mejoras históricas.
