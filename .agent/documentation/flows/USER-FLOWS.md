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
