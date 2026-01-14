# Proyecto EBI 360 - Bienestar Integral
## Visión General del Proyecto
EBI 360 es una plataforma SaaS diseñada para monitorear, diagnosticar y mejorar el bienestar integral de los colaboradores dentro de diversas organizaciones. Utiliza un enfoque basado en la "Rueda de Bienestar" y sistemas de diagnósticos modulares para proporcionar planes de acción personalizados impulsados por IA.

---

## 📂 Estructura de Documentación Técnica
- [**Génesis y Evolución**](./PROJECT-EVOLUTION.md): De dónde venimos (Excel/Algoritmo) y cómo llegamos hasta aquí.
- [**Backlog Histórico (Step-by-Step)**](./backlog/HISTORICAL-BACKLOG.md): Hoja de ruta técnica detallada desde el día 0 hasta el estado actual.
- [**Flujos de Usuario y de Trabajo**](./flows/USER-FLOWS.md): Análisis detallado de los caminos que siguen los distintos roles.
- [**Backlog de Upgrades y Roadmap**](./backlog/TECHNICAL-BACKLOG.md): Funcionalidades actuales y planes futuros.
- [**Reglas de Negocio**](./business-rules/BUSINESS-RULES.md): Definición de parámetros, lógica de cálculos y permisos.

---

## 🛠️ Stack Tecnológico
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilo**: CSS Premium Customizado (Glassmorphismo, Gradientes de Malla)
- **Backend/Base de Datos**: Supabase (PostgreSQL + RLS)
- **Autenticación**: Supabase Auth
- **IA**: Google Gemini 1.5 Flash (Generación de Planes de Acción)
- **Correos**: Resend (Invitaciones Brandeadas)
- **Icons**: Lucide React
- **Gráficos**: Recharts (Wellbeing Radar & History)

---

## 👥 Roles del Sistema
1. **Super Administrador (Global)**: Visionario del ecosistema. Gestiona empresas, planes de suscripción, plantillas globales y usuarios maestros.
2. **Administrador de Empresa**: Gestor operativo de una cuenta cliente. Administra nómina de empleados, asigna diagnósticos, personaliza marca y analiza reportes de su organización.
3. **Usuario Final (Colaborador)**: Centro de la plataforma. Realiza check-ins de bienestar, completa encuestas asignadas, visualiza su evolución y descarga su plan de acción personalizado.

---

## 📋 Secciones Críticas
- **Dashboard Inteligente (Home)**: Vista bento optimizada con acceso rápido a las herramientas principales.
- **Rueda de Bienestar (Mi Rueda)**: Herramienta de autodiagnóstico diario en 8 dominios de la vida.
- **Sistemas de Diagnóstico**: Encuestas modulares personalizables enviadas por la empresa.
- **Plan de Acción IA**: Recomendación diaria generada por un consorcio de especialistas virtuales.
- **Panel Administrativo**: Centro de gestión de datos y configuraciones.

---
*Este documento es dinámico y se actualiza con cada hito del proyecto.*
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
# Flujos de Usuario y de Trabajo (Admin Focus)

## 1. Flujo de Configuración Inicial (Super Admin)
*Este flujo es realizado por el operador maestro de la plataforma para onbordear una nueva empresa.*

1. **Creación de Entidad**: Registro de la empresa en el sistema (Nombre, Dominio, Plan).
2. **Definición de Marca**: Configuración del logo y color primario que heredará el portal de la empresa.
3. **Asignación de Admin Empresa**: Creación o asociación de un usuario con rol `company_admin`.
4. **Activación de Suscripción**: Habilitación de módulos (Ej: "Mi Rueda" activo, encuestas ilimitadas, etc.).

---

## 2. Flujo de Operación de Empresa (Admin Empresa)
*El camino diario del administrador de una cuenta corporativa.*

### A. Gestión de Nómina
1. **Carga de Empleados**: Importación masiva o manual de usuarios.
2. **Invitación Brandeada**: Disparo de correos vía Resend con el color y logo de la empresa.
3. **Monitoreo de Acceso**: Control de quiénes han activado su cuenta.

### B. Ciclo de Diagnóstico
1. **Selección de Encuesta**: Elección del sistema de diagnóstico a aplicar.
2. **Asignación**: Definición de qué colaboradores o departamentos deben responder.
3. **Seguimiento**: Visualización de tasas de participación en tiempo real.
4. **Análisis de Resultados**: Exportación de reportes agregados para toma de decisiones.

---

## 3. Flujo de Experiencia del Colaborador (Usuario Final)
*Visto desde la perspectiva de qué datos genera para el Admin.*

1. **Check-in "Mi Rueda"**: Entrada diaria de autopercepción en 8 dominios.
    - *Input de Negocio*: Genera datos para el índice de bienestar organizacional.
2. **Completado de Diagnóstico**: Resolución de encuestas formales asignadas.
    - *Input de Negocio*: Alimenta el Dashboard de Resultados de la empresa.
3. **Consumo de Plan de Acción**: Lectura y descarga de recomendaciones.

---

## 4. Workflows Técnicos (Lógica Detrás de Escena)

### Generación de Plan IA
1. **Trigger**: El usuario envía su check-in.
2. **Context Fetching**: El sistema busca los últimos 10 registros del usuario para análisis de tendencias.
3. **Prompt Engineering**: Se envía a Gemini 1.5 Flash el estado actual + historial + rol de especialistas.
4. **Parsing & Storage**: Se valida el JSON resultante y se guarda en la tabla `wellbeing_checkins`.
5. **PDF Assembly**: Generación dinámica en cliente usando `jspdf` con la estructura del plan.

### Sistema de Invitación Automatizada
1. **Webhook/Action**: El Admin hace clic en "Invitar".
2. **Branding Fetch**: Se obtienen los activos visuales de la empresa asociada.
3. **Email Template Parsing**: Inyección de variables en la plantilla de correo.
4. **Dispatch**: Envío vía API de Resend.
# Reglas de Negocio - Plataforma EBI 360

## 1. Jerarquía de Roles y Permisos
- **Super Admin**:
    - Acceso total a todas las tablas de Supabase (vía Admin Client).
    - Puede crear/borrar empresas.
    - Define los diagnósticos globales disponibles.
- **Company Admin**:
    - Solo accede a datos (`profiles`, `results`, `wellbeing_checkins`) de su propia `company_id`.
    - No puede modificar la configuración del sistema global.
    - Controla su propio branding (logo/color) dentro de los límites del diseño.
- **Collaborator (User)**:
    - Acceso solo a sus propios datos personales y resultados de encuestas.
    - No puede ver datos agregados de la empresa sin permiso explícito (reportes).

---

## 2. Lógica de "Mi Rueda" (Wellbeing Wheel)
- **Frecuencia**: Un check-in permitido por día (Regla de negocio para evitar spam de datos, aunque el sistema técnico permite más, se recomienda 1).
- **Dominios**: 8 dimensiones fijas (Físico, Emocional, Nutricional, Social, Familiar, Financiero, Mental, Profesional).
- **Puntuación**: Escala de 1 a 10.
- **Cálculo de Promedio**: Sumatoria de los 8 dominios dividida por 8.
- **Identificación de Prioridad**: El sistema selecciona automáticamente el dominio con el puntaje más bajo para priorizarlo en el Plan de Acción.

---

## 3. Plan de Acción del Día (IA)
- **Consorcio de Especialistas**: La IA debe personificar roles específicos según el dominio para dar autoridad al mensaje.
- **Análisis de Tendencias**: Requiere al menos 2 registros previos para activar el bloque de "Evolución".
- **Privacidad**: El contenido del Plan de Acción IA es privado para el colaborador y no es visible para el Admin de la Empresa (Directiva de Confidencialidad).

---

## 4. Gestión de Diagnósticos Corporativos
- **Segmentación**: Las encuestas solo aparecen a usuarios cuya `company_id` coincide con la asignación de la encuesta.
- **Estado de Encuesta**:
    - *Pendiente*: Asignada pero no respondida.
    - *Completada*: Registro en la tabla `results`. Una vez completada, no se puede volver a editar (Inmutabilidad de datos).

---

## 5. Sistema de Invitaciones
- **Vigencia**: (Pendiente definir si el link expira).
- **Branding**: Los correos deben reflejar el color de la empresa para evitar percepción de "Phishing" y mejorar el sentido de pertenencia.
# Backlog Técnico y Roadmap del Proyecto

## Etapa 1: Cimientos y Estándar Visual (100% Completado)
- [x] Configuración inicial Next.js + Supabase.
- [x] Implementación de Diseño Premium (Glassmorphismo) en toda la UI.
- [x] Refactorización de layouts para evitar duplicaciones en el Panel Admin.
- [x] Sistema de branding dinámico (Color primario por empresa).

## Etapa 2: Módulos Core (90% Completado)
- [x] **Rueda de Bienestar**: Formulario, Radar y Dashboard.
- [x] **Plan de Acción IA**: Integración con Gemini, Consorcio de Especialistas y Exportación PDF.
- [x] **Dashboard Home**: Vista unificada y bento grid funcional.
- [x] **Gestión de Empresas**: CRUD básico en el Super Admin.
- [x] **Gestión de Empleados**: Carga manual e invitaciones por correo.
- [ ] **Importación Masiva**: Refinar la lógica de carga masiva de usuarios desde CSV/Excel (En progreso).

## Etapa 3: Gestión de Encuestas e Informes (90% Completado)
- [x] **Control de Ciclo de Vida**: Dashboard para el Super Admin con estados de encuesta.
- [x] **Asignación Corporativa**: Lógica de asignación de sistemas a empresas.
- [x] **Filtros y Seguimiento**: Vista de participación en tiempo real para el Admin.
- [ ] **Generación de Informes**: Exportación de reportes administrativos agregados (En desarrollo).

## Etapa 4: Bienestar, IA y Experiencia Premium (En desarrollo)
- [x] **Rueda de Bienestar**: Check-in diario y radar interactivo.
- [x] **Plan de Acción IA**: Consorcio de especialistas y consejos dinámicos.
- [x] **Exportación PDF Usuario**: Plan de acción descargable.
- [ ] **Análisis de Tendencias**: Comparativa histórica automática.

## Etapa 5: Engagement y Gamificación (En backlog)
- [ ] **Sistema de Insignias**: Logros por constancia en el bienestar.
- [ ] **Retos Organizacionales**: Desafíos lanzados por el Admin de Empresa.

## 🛠️ Deuda Técnica y Mantenimiento
- [ ] **Optimización de PDF**: Reducir el peso de los archivos generados.
- [ ] **Unit Testing**: Implementar pruebas para la lógica de cálculo de promedios.
- [ ] **Documentación de API**: Documentar los Server Actions para futuros desarrolladores.
- [ ] **RLS Audit**: Revisión exhaustiva de las políticas de seguridad en Supabase para asegurar aislamiento total entre empresas.
