# Proyecto EBI 360 - Bienestar Integral
## Visión General del Proyecto
EBI 360 es una plataforma SaaS diseñada para monitorear, diagnosticar y mejorar el bienestar integral de los colaboradores dentro de diversas organizaciones. Utiliza un enfoque basado en la "Rueda de Bienestar" y sistemas de diagnósticos modulares para proporcionar planes de acción personalizados impulsados por IA.

---

## 📂 Estructura de Documentación Técnica
- [**Flujos de Usuario y de Trabajo**](./flows/USER-FLOWS.md): Análisis detallado de los caminos que siguen los distintos roles de administración y usuarios finales.
- [**Backlog Técnico y Roadmap**](./backlog/TECHNICAL-BACKLOG.md): Listado de funcionalidades implementadas y pendientes, organizadas por etapas.
- [**Reglas de Negocio**](./business-rules/BUSINESS-RULES.md): Definición de parámetros, lógica de cálculos, permisos y restricciones del sistema.
- [**Arquitectura de Datos**](./architecture/DATABASE-SCHEMA.md): (Pendiente) Diagrama E-R y diccionario de datos de Supabase.

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

## Etapa 3: Inteligencia de Datos y Reportes (Por Iniciar)
- [ ] **Reporte Organizacional**: Vista para el Admin de Empresa con promedios agregados de bienestar por departamento.
- [ ] **Heatmap de Bienestar**: Visualización de qué dominios están más afectados a nivel de toda la compañía.
- [ ] **Filtros de Datos**: Análisis por fecha, departamento y género (anonimizado).
- [ ] **Alertas Tempranas**: Sistema para notificar al Admin si el promedio de bienestar de un área cae por debajo de un umbral técnico.

## Etapa 4: Engagement y Gamificación (En backlog)
- [ ] **Sistema de Insignias (Badges)**: Implementación visual de los logros obtenidos por el colaborador.
- [ ] **Retos de Bienestar**: Funcionalidad para que la empresa lance desafíos (Ej: "Semana de la Hidratación").
- [ ] **Notificaciones Push/PWA**: Recordatorios para realizar el check-in diario.

## 🛠️ Deuda Técnica y Mantenimiento
- [ ] **Optimización de PDF**: Reducir el peso de los archivos generados.
- [ ] **Unit Testing**: Implementar pruebas para la lógica de cálculo de promedios.
- [ ] **Documentación de API**: Documentar los Server Actions para futuros desarrolladores.
- [ ] **RLS Audit**: Revisión exhaustiva de las políticas de seguridad en Supabase para asegurar aislamiento total entre empresas.
