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
