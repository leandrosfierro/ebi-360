# 👑 Guía de Super Administrador - EBI 360
## Panel de Control Completo

**Versión:** 1.0  
**Última actualización:** Diciembre 2025  
**Nivel de Acceso:** Super Administrador

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso y Autenticación](#acceso-y-autenticación)
3. [Panel de Super Admin](#panel-de-super-admin)
4. [Gestión de Empresas](#gestión-de-empresas)
5. [Gestión de Administradores](#gestión-de-administradores)
6. [Sistema de Emails](#sistema-de-emails)
7. [Configuración Global](#configuración-global)
8. [Reportes y Analíticas](#reportes-y-analíticas)
9. [Cambio de Roles](#cambio-de-roles)
10. [Seguridad y Mejores Prácticas](#seguridad-y-mejores-prácticas)
11. [Troubleshooting](#troubleshooting)
12. [API y Integraciones](#api-y-integraciones)

---

## 🎯 Introducción

### ¿Qué es un Super Administrador?

Como **Super Administrador** de EBI 360, tienes el nivel más alto de acceso y control sobre la plataforma. Tus responsabilidades incluyen:

- ✅ Gestionar completa de empresas clientes
- ✅ Administración de usuarios y permisos
- ✅ Configuración global del sistema
- ✅ Monitoreo de métricas y analíticas
- ✅ Soporte técnico de primer nivel
- ✅ Gestión de comunicaciones masivas
- ✅ Gestión de enlaces de invitación directos

### Alcance de Permisos

**Puedes:**
- ✅ Crear, editar y eliminar empresas
- ✅ Invitar y gestionar administradores de empresa
- ✅ Invitar y gestionar otros super administradores
- ✅ Acceder a todas las estadísticas agregadas
- ✅ Configurar plantillas de email
- ✅ Modificar configuraciones globales
- ✅ Cambiar entre roles (Super Admin, Company Admin, Employee)
- ✅ Exportar datos y reportes

**No puedes:**
- ❌ Ver respuestas individuales de diagnósticos (privacidad)
- ❌ Modificar resultados de diagnósticos
- ❌ Acceder a información médica personal

---

## 🔐 Acceso y Autenticación

### Emails Autorizados

Los Super Administradores están definidos en la configuración del sistema:

```typescript
// Emails con acceso de Super Admin
- leandro.fierro@bs360.com
- leandrofierro@gmail.com
- admin@bs360.com
```

> **🔒 Seguridad:** Solo estos emails tienen acceso automático al panel de Super Admin.

### Proceso de Inicio de Sesión

1. **Accede a la plataforma**
   ```
   https://ebi360.com
   ```

2. **Autenticación con Google**
   - Haz clic en "Ingresar con Google"
   - Selecciona tu cuenta autorizada
   - Autoriza el acceso

3. **Verificación Automática**
   - El sistema detecta tu email
   - Asigna automáticamente el rol de Super Admin
   - Te otorga acceso a todos los roles:
     - Super Administrador
     - Administrador de Empresa
     - Colaborador

4. **Redirección**
   - Serás dirigido al Panel de Super Admin
   - URL: `/admin/super`

### Primer Acceso

En tu primer inicio de sesión:

1. **Completa tu perfil**
   - Nombre completo
   - Foto de perfil
   - Información de contacto

2. **Configura preferencias**
   - Notificaciones
   - Idioma
   - Tema (claro/oscuro)

3. **Revisa la configuración global**
   - Verifica ajustes del sistema
   - Confirma plantillas de email
   - Revisa empresas existentes

---

## 🏢 Panel de Super Admin

### Vista General del Dashboard

Al acceder al panel, verás:

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard General                                      │
│  Bienvenido al panel de control de EBI 360             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │Empresas  │  │Usuarios  │  │Encuestas │  │Promedio ││
│  │Activas   │  │Totales   │  │Completas │  │Global   ││
│  │          │  │          │  │          │  │         ││
│  │    24    │  │   1,247  │  │   3,891  │  │   7.6   ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│                                                         │
│  Empresas Recientes                                    │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Empresa A    │ Pro        │ Activo  │ 15 Dic   │  │
│  │ Empresa B    │ Enterprise │ Activo  │ 14 Dic   │  │
│  │ Empresa C    │ Basic      │ Activo  │ 12 Dic   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [Ver todas las empresas →]                            │
└─────────────────────────────────────────────────────────┘
```

### Navegación Principal

#### Menú Lateral (Desktop)

```
┌─────────────────────┐
│  🏠 Dashboard       │
│                     │
│  GESTIÓN            │
│  🏢 Empresas        │
│  👑 Super Admins    │
│  📧 Emails          │
│                     │
│  SISTEMA            │
│  ⚙️ Configuración   │
│                     │
│  🚪 Cerrar Sesión   │
└─────────────────────┘
```

#### Barra Superior (Móvil)

- **Menú hamburguesa** (☰) - Abre navegación
- **Título de sección** - Indica dónde estás
- **Logo EBI 360** - Volver al dashboard

### Estadísticas Clave

#### Tarjetas de Métricas

**1. Empresas Activas**
```
┌──────────────────┐
│ Empresas Activas │
│                  │
│       24         │
│                  │
│ Total registradas│
└──────────────────┘
```

**2. Usuarios Totales**
```
┌──────────────────┐
│ Usuarios Totales │
│                  │
│     1,247        │
│                  │
│ Usuarios registrados
└──────────────────┘
```

**3. Encuestas Completadas**
```
┌──────────────────┐
│ Encuestas        │
│ Completadas      │
│     3,891        │
│                  │
│ Total históricas │
└──────────────────┘
```

**4. Promedio Global**
```
┌──────────────────┐
│ Promedio Global  │
│                  │
│      7.6         │
│                  │
│ Promedio general │
└──────────────────┘
```

---

## 🏢 Gestión de Empresas

### Ver Todas las Empresas

**Acceso:** Dashboard → Empresas

#### Tabla de Empresas

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Empresas                                                                │
│ Gestiona las empresas clientes y sus suscripciones                     │
│                                                                         │
│ [Buscar empresa...]  [Filtrar: Todos los planes ▼]  [+ Nueva Empresa] │
├─────────────────────────────────────────────────────────────────────────┤
│ EMPRESA          │ PLAN       │ ESTADO  │ ADMINISTRADOR    │ ACCIONES  │
├─────────────────────────────────────────────────────────────────────────┤
│ 🏢 Empresa A     │ Pro        │ ✅ Activo│ Juan Pérez      │ ⋮         │
│    ID: abc123... │            │         │ juan@empresaa.com│           │
├─────────────────────────────────────────────────────────────────────────┤
│ 🏢 Empresa B     │ Enterprise │ ✅ Activo│ María García    │ ⋮         │
│    ID: def456... │            │         │ maria@empresab.com│          │
├─────────────────────────────────────────────────────────────────────────┤
│ 🏢 Empresa C     │ Basic      │ ⚠️ Inactivo│ Sin asignar   │ ⋮         │
│    ID: ghi789... │            │         │ [Invitar Admin] │           │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Funciones de Búsqueda y Filtrado

**Barra de Búsqueda:**
- Busca por nombre de empresa
- Busca por ID
- Búsqueda en tiempo real

**Filtros Disponibles:**
- **Por Plan:**
  - Todos los planes
  - Basic
  - Pro
  - Enterprise
  
- **Por Estado:**
  - Todos
  - Activos
  - Inactivos

### Crear Nueva Empresa

**Paso a Paso:**

1. **Acceder al Formulario**
   - Haz clic en **"+ Nueva Empresa"**
   - Se abrirá el formulario de registro

2. **Completar Información Básica**

```
┌─────────────────────────────────────┐
│  Nueva Empresa                      │
│  Registra una nueva organización    │
├─────────────────────────────────────┤
│                                     │
│  Nombre de la Empresa *             │
│  ┌─────────────────────────────┐   │
│  │ Ej: Acme Corporation        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Plan de Suscripción *              │
│  ┌─────────────────────────────┐   │
│  │ Seleccionar plan ▼          │   │
│  │ • Basic                     │   │
│  │ • Pro                       │   │
│  │ • Enterprise                │   │
│  └─────────────────────────────┘   │
│                                     │
│  Estado                             │
│  ☑ Empresa activa                   │
│  La empresa podrá usar la plataforma│
│                                     │
│  [Cancelar]  [Crear Empresa]       │
└─────────────────────────────────────┘
```

3. **Planes Disponibles**

| Plan | Usuarios | Características | Precio |
|------|----------|-----------------|--------|
| **Basic** | Hasta 50 | Diagnósticos básicos, Reportes estándar | $$ |
| **Pro** | Hasta 200 | + Reportes avanzados, Analíticas | $$$ |
| **Enterprise** | Ilimitado | + Personalización, API, Soporte prioritario | $$$$ |

4. **Confirmar Creación**
   - Revisa la información
   - Haz clic en **"Crear Empresa"**
   - La empresa se creará inmediatamente

5. **Siguiente Paso**
   - Invitar al administrador de la empresa
   - Configurar branding (opcional)

### Editar Empresa

**Acceso:** Menú de acciones (⋮) → Editar

**Campos Editables:**
- ✅ Nombre de la empresa
- ✅ Plan de suscripción
- ✅ Estado (activo/inactivo)
- ❌ ID (no editable)
- ❌ Fecha de creación (no editable)

**Proceso:**

1. Haz clic en el menú de acciones (⋮)
2. Selecciona **"Editar"**
3. Modifica los campos necesarios
4. Haz clic en **"Guardar Cambios"**

> **⚠️ Importante:** Cambiar el plan puede afectar las funcionalidades disponibles para la empresa.

### Desactivar/Activar Empresa

**Desactivar:**
1. Menú de acciones (⋮) → Editar
2. Desmarca **"Empresa activa"**
3. Guarda los cambios

**Efectos de Desactivación:**
- ❌ Los usuarios no podrán iniciar sesión
- ❌ No se podrán realizar nuevos diagnósticos
- ✅ Los datos históricos se mantienen
- ✅ Se puede reactivar en cualquier momento

**Reactivar:**
1. Menú de acciones (⋮) → Editar
2. Marca **"Empresa activa"**
3. Guarda los cambios

### Eliminar Empresa

> **⚠️ ADVERTENCIA:** Esta acción es IRREVERSIBLE.

**Proceso:**

1. Menú de acciones (⋮) → **Eliminar**
2. Aparecerá un diálogo de confirmación:

```
┌─────────────────────────────────────┐
│  ⚠️ Eliminar Empresa                │
├─────────────────────────────────────┤
│                                     │
│  ¿Estás seguro de que deseas        │
│  eliminar "Empresa A"?              │
│                                     │
│  Esta acción:                       │
│  • Eliminará todos los usuarios     │
│  • Eliminará todos los datos        │
│  • NO se puede deshacer             │
│                                     │
│  Escribe el nombre de la empresa    │
│  para confirmar:                    │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Cancelar]  [Eliminar Empresa]    │
└─────────────────────────────────────┘
```

3. Escribe el nombre exacto de la empresa
4. Haz clic en **"Eliminar Empresa"**

**Datos que se Eliminan:**
- ❌ Perfil de la empresa
- ❌ Todos los usuarios asociados
- ❌ Todos los diagnósticos
- ❌ Todas las configuraciones personalizadas

### Invitar Administrador de Empresa

**Desde la Tabla de Empresas:**

1. Encuentra la empresa sin administrador
2. Haz clic en **"Invitar Admin"**
3. Completa el formulario:

```
┌─────────────────────────────────────┐
│  Invitar Administrador              │
│  Para: Empresa A                    │
├─────────────────────────────────────┤
│                                     │
│  Email del Administrador *          │
│  ┌─────────────────────────────┐   │
│  │ admin@empresa.com           │   │
│  └─────────────────────────────┘   │
│                                     │
│  Nombre Completo                    │
│  ┌─────────────────────────────┐   │
│  │ Juan Pérez                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ☑ Enviar email de invitación      │
│                                     │
│  [Cancelar]  [Enviar Invitación]   │
└─────────────────────────────────────┘
```

4. Haz clic en **"Enviar Invitación"**

**Qué Sucede:**
- ✅ Se crea el perfil del administrador
- ✅ Se asigna a la empresa
- ✅ Se envía email de invitación
- ✅ El admin recibe instrucciones de acceso

**Email de Invitación:**
```
Asunto: Invitación a EBI 360 - Administrador de Empresa A

Hola Juan,

Has sido invitado como Administrador de Empresa A en EBI 360.

Como administrador, podrás:
• Gestionar colaboradores de tu empresa
• Ver reportes agregados de bienestar
• Configurar la apariencia de los reportes
• Invitar nuevos usuarios

Para comenzar:
1. Haz clic en el siguiente enlace
2. Inicia sesión con tu cuenta de Google (admin@empresa.com)
3. Completa tu perfil

[Acceder a EBI 360]

Si tienes preguntas, contacta a soporte@ebi360.com

Saludos,
Equipo EBI 360
```

---

## 👑 Gestión de Administradores

#### Vista de Administradores

Desde este panel puedes supervisar a todos los Super Administradores. También puedes copiar sus enlaces de invitación si aún no han activado su cuenta.

1. Identifica al Super Admin con estado **"Invitado"**.
2. Haz clic en el menú de acciones (`⋮`) al final de la fila.
3. Selecciona **"Copiar Link Invitación"**.

---

```
┌─────────────────────────────────────────────────────────────┐
│ Super Admins                                                │
│ Gestiona los usuarios con acceso administrativo completo   │
│                                                             │
│ [+ Invitar Super Admin]                                    │
├─────────────────────────────────────────────────────────────┤
│ ADMINISTRADOR        │ EMAIL                  │ ESTADO     │
├─────────────────────────────────────────────────────────────┤
│ 👑 Leandro Fierro   │ leandro.fierro@bs360   │ ✅ Activo  │
│    Super Admin      │                        │ 15 Dic     │
├─────────────────────────────────────────────────────────────┤
│ 👑 Admin Principal  │ admin@bs360.com        │ ✅ Activo  │
│    Super Admin      │                        │ 10 Dic     │
└─────────────────────────────────────────────────────────────┘
```

### Gestión de Enlaces de Invitación (Persistencia)

Ahora los enlaces de invitación se guardan automáticamente en la base de datos para facilitar el soporte manual.

#### Cómo copiar el enlace de un Administrador de Empresa
1. Ve a la tabla de **Empresas**.
2. Identifica al administrador invitado (estado "Invitado").
3. Haz clic en el menú de acciones (`⋮`) de la fila de la empresa.
4. Selecciona **"Copiar Link Invitación"**.
5. El link se copiará directamente a tu portapapeles.

Esto permite enviar el link por medios alternativos (WhatsApp, Slack, etc.) si el correo electrónico falla o se pierde.

---

### Invitar Nuevo Super Admin

> **⚠️ Precaución:** Solo invita a personas de máxima confianza. Los Super Admins tienen acceso total al sistema.

**Proceso:**

1. **Acceder al Formulario**
   - Haz clic en **"+ Invitar Super Admin"**

2. **Completar Información**

```
┌─────────────────────────────────────┐
│  Invitar Super Administrador        │
├─────────────────────────────────────┤
│                                     │
│  Email *                            │
│  ┌─────────────────────────────┐   │
│  │ nuevo.admin@bs360.com       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Nombre Completo *                  │
│  ┌─────────────────────────────┐   │
│  │ María González              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⚠️ Este usuario tendrá acceso     │
│     completo al sistema             │
│                                     │
│  [Cancelar]  [Enviar Invitación]   │
└─────────────────────────────────────┘
```

3. **Confirmar y Enviar**
   - Revisa la información
   - Haz clic en **"Enviar Invitación"**

4. **Configuración Adicional**
   - El email debe agregarse a la configuración del sistema
   - Archivo: `src/config/super-admins.ts`
   - Agregar email a `SUPER_ADMIN_EMAILS`

**Ejemplo de Configuración:**
```typescript
export const SUPER_ADMIN_EMAILS = [
    'leandro.fierro@bs360.com',
    'admin@bs360.com',
    'nuevo.admin@bs360.com', // ← Agregar aquí
];
```

### Revocar Acceso de Super Admin

**Proceso:**

1. **Eliminar del Sistema**
   - Menú de acciones (⋮) → Eliminar
   - Confirmar la acción

2. **Actualizar Configuración**
   - Editar `src/config/super-admins.ts`
   - Remover el email de la lista
   - Hacer commit y deploy

3. **Verificar**
   - El usuario ya no podrá acceder al panel de Super Admin
   - Mantendrá acceso como usuario regular si está en una empresa

---

## 📧 Sistema de Emails

### Panel de Gestión de Emails

**Acceso:** Dashboard → Emails

#### Funcionalidades

```
┌─────────────────────────────────────────────────────────────┐
│ Gestión de Emails                                           │
│ Administra las comunicaciones de la plataforma              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 Plantillas de Email                                    │
│  ┌───────────────────────────────────────────────────┐    │
│  │ • Invitación de Usuario                           │    │
│  │ • Invitación de Administrador                     │    │
│  │ • Recordatorio de Diagnóstico                     │    │
│  │ • Resultados Disponibles                          │    │
│  │ • Bienvenida a la Plataforma                      │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  📊 Estadísticas de Envío                                  │
│  ┌───────────────────────────────────────────────────┐    │
│  │ Emails enviados hoy: 47                           │    │
│  │ Emails pendientes: 3                              │    │
│  │ Tasa de apertura: 68%                             │    │
│  │ Tasa de rebote: 2%                                │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  🔧 Configuración SMTP                                     │
│  [Configurar Servidor de Email]                           │
└─────────────────────────────────────────────────────────────┘
```

### Plantillas de Email

#### Ver y Editar Plantillas

**Plantilla de Invitación:**

1. Selecciona **"Invitación de Usuario"**
2. Verás el editor de plantilla:

```
┌─────────────────────────────────────┐
│  Editar Plantilla: Invitación       │
├─────────────────────────────────────┤
│                                     │
│  Asunto:                            │
│  ┌─────────────────────────────┐   │
│  │ Bienvenido a EBI 360        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Cuerpo del Mensaje:                │
│  ┌─────────────────────────────┐   │
│  │ Hola {{nombre}},            │   │
│  │                             │   │
│  │ Has sido invitado a...      │   │
│  │                             │   │
│  │ Variables disponibles:      │   │
│  │ {{nombre}}                  │   │
│  │ {{empresa}}                 │   │
│  │ {{link_acceso}}             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Vista Previa]  [Guardar]         │
└─────────────────────────────────────┘
```

#### Variables Disponibles

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{nombre}}` | Nombre del destinatario | Juan Pérez |
| `{{empresa}}` | Nombre de la empresa | Acme Corp |
| `{{link_acceso}}` | URL de acceso | https://ebi360.com |
| `{{fecha}}` | Fecha actual | 15 Dic 2025 |
| `{{puntuacion}}` | Puntuación del diagnóstico | 7.8 |

### Envío de Emails Masivos

**Funcionalidad:** Enviar comunicaciones a múltiples usuarios

**Proceso:**

1. **Acceder a Envío Masivo**
   - Panel de Emails → **"Envío Masivo"**

2. **Configurar Envío**

```
┌─────────────────────────────────────┐
│  Envío Masivo de Emails             │
├─────────────────────────────────────┤
│                                     │
│  Destinatarios:                     │
│  ○ Todos los usuarios               │
│  ○ Por empresa                      │
│  ○ Por rol                          │
│  ● Lista personalizada              │
│                                     │
│  Plantilla:                         │
│  ┌─────────────────────────────┐   │
│  │ Seleccionar plantilla ▼     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Programar envío:                   │
│  ○ Enviar ahora                     │
│  ● Programar para:                  │
│    [15/12/2025] [10:00]            │
│                                     │
│  [Vista Previa]  [Programar Envío] │
└─────────────────────────────────────┘
```

3. **Revisar y Confirmar**
   - Vista previa del email
   - Confirmar lista de destinatarios
   - Programar o enviar

### Monitoreo de Emails

**Métricas Disponibles:**

- **Enviados:** Total de emails enviados
- **Entregados:** Emails que llegaron exitosamente
- **Abiertos:** Emails que fueron abiertos
- **Clicks:** Enlaces clickeados
- **Rebotados:** Emails que no pudieron entregarse
- **Spam:** Marcados como spam

**Dashboard de Métricas:**

```
┌─────────────────────────────────────┐
│  Estadísticas de Email - Últimos 30 días
├─────────────────────────────────────┤
│                                     │
│  Enviados:     1,247  ━━━━━━━━━━   │
│  Entregados:   1,223  ━━━━━━━━━░   │
│  Abiertos:       847  ━━━━━━░░░░   │
│  Clicks:         423  ━━━░░░░░░░   │
│  Rebotados:       24  ░░░░░░░░░░   │
│  Spam:             0  ░░░░░░░░░░   │
│                                     │
│  Tasa de apertura: 68%              │
│  Tasa de clicks: 34%                │
│  Tasa de rebote: 2%                 │
└─────────────────────────────────────┘
```

---

## ⚙️ Configuración Global

### Panel de Configuración

**Acceso:** Dashboard → Configuración

#### Secciones Disponibles

```
┌─────────────────────────────────────┐
│  Configuración del Sistema          │
├─────────────────────────────────────┤
│                                     │
│  👤 Perfil Personal                 │
│  Nombre, foto, información          │
│                                     │
│  🔔 Notificaciones                  │
│  Preferencias de alertas            │
│                                     │
│  🎨 Apariencia                      │
│  Tema, idioma, personalización      │
│                                     │
│  🔐 Seguridad                       │
│  Contraseña, 2FA, sesiones          │
│                                     │
│  📊 Configuración de Reportes       │
│  Formatos, plantillas, branding     │
│                                     │
│  🔧 Configuración Técnica           │
│  API, webhooks, integraciones       │
└─────────────────────────────────────┘
```

### Perfil Personal

**Información Editable:**

- ✅ Nombre completo
- ✅ Foto de perfil
- ✅ Teléfono de contacto
- ✅ Biografía
- ❌ Email (no editable)
- ❌ Rol (asignado automáticamente)

### Configuración de Notificaciones

**Tipos de Notificaciones:**

```
┌─────────────────────────────────────┐
│  Preferencias de Notificaciones     │
├─────────────────────────────────────┤
│                                     │
│  📧 Email                           │
│  ☑ Nueva empresa registrada         │
│  ☑ Nuevo administrador invitado     │
│  ☑ Error del sistema                │
│  ☑ Reporte semanal                  │
│                                     │
│  🔔 En Plataforma                   │
│  ☑ Actividad importante             │
│  ☐ Todas las actividades            │
│                                     │
│  Frecuencia de Reportes:            │
│  ○ Diario                           │
│  ● Semanal                          │
│  ○ Mensual                          │
│                                     │
│  [Guardar Preferencias]             │
└─────────────────────────────────────┘
```

### Configuración de Seguridad

**Opciones Disponibles:**

1. **Autenticación de Dos Factores (2FA)**
   - Activar/Desactivar
   - Configurar app de autenticación
   - Códigos de respaldo

2. **Sesiones Activas**
   - Ver dispositivos conectados
   - Cerrar sesiones remotas
   - Historial de accesos

3. **Logs de Auditoría**
   - Ver todas las acciones realizadas
   - Filtrar por fecha y tipo
   - Exportar logs

**Ejemplo de Log:**

```
┌─────────────────────────────────────────────────────┐
│  Logs de Auditoría                                  │
├─────────────────────────────────────────────────────┤
│ FECHA/HORA       │ ACCIÓN              │ DETALLES   │
├─────────────────────────────────────────────────────┤
│ 15 Dic 10:30    │ Empresa creada      │ Acme Corp  │
│ 15 Dic 10:25    │ Admin invitado      │ juan@...   │
│ 15 Dic 10:20    │ Inicio de sesión    │ IP: 192... │
│ 14 Dic 18:45    │ Configuración       │ Email SMTP │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Reportes y Analíticas

### Dashboard de Analíticas

**Métricas Globales:**

```
┌─────────────────────────────────────────────────────┐
│  Analíticas Globales - Diciembre 2025               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📈 Crecimiento                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Nuevas empresas: +5 este mes                │   │
│  │ Nuevos usuarios: +247 este mes              │   │
│  │ Diagnósticos: +891 este mes                 │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  🎯 Engagement                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Tasa de completación: 87%                   │   │
│  │ Usuarios activos (30d): 1,089               │   │
│  │ Promedio diagnósticos/usuario: 3.1          │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  💡 Insights                                        │
│  ┌─────────────────────────────────────────────┐   │
│  │ Dimensión más baja: Financiero (6.2)        │   │
│  │ Dimensión más alta: Social (7.9)            │   │
│  │ Tendencia general: ↑ +0.3 vs mes anterior  │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Reportes por Empresa

**Acceso:** Empresas → [Seleccionar empresa] → Reportes

**Información Disponible:**

1. **Participación**
   - Total de colaboradores
   - Diagnósticos completados
   - Tasa de participación

2. **Puntuaciones**
   - Promedio global de la empresa
   - Promedio por dimensión
   - Distribución de puntuaciones

3. **Tendencias**
   - Evolución mes a mes
   - Comparación con promedio general
   - Áreas de mejora

4. **Demografía** (si disponible)
   - Por departamento
   - Por antigüedad
   - Por ubicación

### Exportar Reportes

**Formatos Disponibles:**

1. **PDF**
   - Reporte ejecutivo
   - Reporte detallado
   - Reporte personalizado

2. **Excel/CSV**
   - Datos crudos
   - Tablas dinámicas
   - Gráficos incluidos

3. **PowerPoint**
   - Presentación ejecutiva
   - Gráficos y visualizaciones

**Proceso de Exportación:**

1. Selecciona el tipo de reporte
2. Elige el rango de fechas
3. Selecciona empresas (todas o específicas)
4. Configura opciones de formato
5. Haz clic en **"Exportar"**
6. El archivo se descargará automáticamente

---

## 🔄 Cambio de Roles

### Sistema Multi-Rol

Como Super Admin, tienes acceso a **tres roles diferentes**:

1. **👑 Super Administrador** - Gestión global
2. **🏢 Administrador de Empresa** - Gestión de empresa específica
3. **👤 Colaborador** - Vista de usuario final

### Cambiar de Rol

**Ubicación del Selector:**

- **Desktop:** Esquina superior derecha
- **Móvil:** Menú de navegación

**Interfaz:**

```
┌─────────────────────────────┐
│  Super Administrador  ▼     │
└─────────────────────────────┘

Al hacer clic:

┌─────────────────────────────┐
│  CAMBIAR ROL                │
├─────────────────────────────┤
│  ● Super Administrador      │
│    (actual)                 │
│                             │
│  ○ Admin de Empresa         │
│                             │
│  ○ Colaborador              │
└─────────────────────────────┘
```

### Funcionalidades por Rol

#### Como Super Administrador
- ✅ Gestión de empresas
- ✅ Gestión de super admins
- ✅ Configuración global
- ✅ Analíticas globales
- ✅ Sistema de emails

#### Como Administrador de Empresa
- ✅ Gestión de colaboradores de UNA empresa
- ✅ Reportes de la empresa
- ✅ Configuración de branding
- ✅ Invitación de empleados
- ❌ No puede ver otras empresas

#### Como Colaborador
- ✅ Realizar diagnósticos
- ✅ Ver resultados propios
- ✅ Descargar reportes personales
- ❌ No puede ver datos de otros
- ❌ No puede gestionar usuarios

### Casos de Uso

**Escenario 1: Probar la Experiencia del Usuario**
1. Cambia a rol **"Colaborador"**
2. Realiza un diagnóstico
3. Verifica que todo funcione correctamente
4. Vuelve a **"Super Administrador"**

**Escenario 2: Configurar una Empresa**
1. Cambia a rol **"Admin de Empresa"**
2. Configura el branding
3. Invita colaboradores
4. Vuelve a **"Super Administrador"**

**Escenario 3: Soporte a Cliente**
1. Cambia a **"Admin de Empresa"** de la empresa del cliente
2. Revisa la configuración
3. Identifica el problema
4. Vuelve a **"Super Administrador"** para solucionarlo

---

## 🔒 Seguridad y Mejores Prácticas

### Principios de Seguridad

#### 1. Principio de Mínimo Privilegio

**Regla:** Solo otorga el nivel de acceso necesario.

- ✅ Colaboradores: Solo acceso a sus datos
- ✅ Admins de Empresa: Solo su empresa
- ✅ Super Admins: Solo personal de confianza

#### 2. Auditoría Continua

**Acciones a Monitorear:**

- Creación/eliminación de empresas
- Invitaciones de administradores
- Cambios en configuración global
- Accesos desde IPs inusuales
- Exportación masiva de datos

**Revisar Logs:**
- Diariamente: Actividad sospechosa
- Semanalmente: Resumen de actividades
- Mensualmente: Análisis de tendencias

#### 3. Gestión de Accesos

**Checklist Mensual:**

```
□ Revisar lista de Super Admins
□ Verificar empresas activas
□ Revisar administradores de empresa
□ Eliminar cuentas inactivas
□ Actualizar contraseñas
□ Revisar sesiones activas
□ Verificar configuración 2FA
```

### Mejores Prácticas

#### Para Gestión de Empresas

1. **Antes de Crear:**
   - ✅ Verifica que la empresa no existe
   - ✅ Confirma el plan adecuado
   - ✅ Ten el email del admin listo

2. **Al Crear:**
   - ✅ Usa nombres descriptivos
   - ✅ Activa la empresa inmediatamente
   - ✅ Invita al admin de inmediato

3. **Después de Crear:**
   - ✅ Verifica que el admin recibió el email
   - ✅ Confirma que puede acceder
   - ✅ Programa seguimiento

#### Para Gestión de Usuarios

1. **Invitaciones:**
   - ✅ Verifica el email antes de enviar
   - ✅ Usa plantillas profesionales
   - ✅ Incluye instrucciones claras
   - ✅ Establece expectativas

2. **Seguimiento:**
   - ✅ Confirma que aceptaron la invitación
   - ✅ Verifica su primer acceso
   - ✅ Ofrece soporte si es necesario

3. **Desactivación:**
   - ✅ Desactiva usuarios inactivos
   - ✅ Documenta el motivo
   - ✅ Archiva datos si es necesario

#### Para Comunicaciones

1. **Emails:**
   - ✅ Personaliza el contenido
   - ✅ Usa un tono profesional
   - ✅ Incluye call-to-action claro
   - ✅ Prueba antes de envío masivo

2. **Notificaciones:**
   - ✅ No satures a los usuarios
   - ✅ Agrupa notificaciones similares
   - ✅ Permite desuscripción
   - ✅ Respeta preferencias

### Respaldo y Recuperación

#### Respaldos Automáticos

**Frecuencia:**
- Base de datos: Cada 6 horas
- Archivos: Diariamente
- Configuración: Cada cambio

**Retención:**
- Diarios: 7 días
- Semanales: 4 semanas
- Mensuales: 12 meses

#### Recuperación de Datos

**En caso de pérdida de datos:**

1. **Contacta a Soporte Técnico**
   - Email: tech@ebi360.com
   - Urgente: +54 11 xxxx-xxxx

2. **Proporciona Información:**
   - Qué datos se perdieron
   - Cuándo ocurrió
   - Última vez que estaban disponibles

3. **Proceso de Recuperación:**
   - Evaluación: 1-2 horas
   - Recuperación: 2-4 horas
   - Verificación: 1 hora

---

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Usuario No Puede Iniciar Sesión

**Posibles Causas:**
- Email no autorizado
- Empresa desactivada
- Problemas de autenticación con Google

**Solución:**

1. **Verificar Email:**
   - Busca al usuario en la base de datos
   - Confirma que el email es correcto
   - Verifica que la empresa está activa

2. **Verificar Estado:**
   ```
   Dashboard → Empresas → [Buscar empresa]
   → Ver usuarios → [Buscar usuario]
   ```

3. **Reenviar Invitación:**
   - Si no existe, invítalo nuevamente
   - Verifica que reciba el email

#### 2. Empresa No Aparece en la Lista

**Posibles Causas:**
- Filtros activos
- Empresa eliminada
- Error de búsqueda

**Solución:**

1. **Limpiar Filtros:**
   - Selecciona "Todos los planes"
   - Selecciona "Todos los estados"

2. **Buscar por ID:**
   - Si tienes el ID, búscalo directamente

3. **Verificar Eliminación:**
   - Revisa logs de auditoría
   - Confirma si fue eliminada

#### 3. Emails No Se Envían

**Posibles Causas:**
- Configuración SMTP incorrecta
- Email en lista de spam
- Límite de envío alcanzado

**Solución:**

1. **Verificar Configuración SMTP:**
   ```
   Dashboard → Emails → Configuración SMTP
   → Probar Conexión
   ```

2. **Revisar Cola de Envío:**
   ```
   Dashboard → Emails → Emails Pendientes
   ```

3. **Verificar Logs:**
   ```
   Dashboard → Configuración → Logs
   → Filtrar por "Email"
   ```

#### 4. Datos No Se Actualizan

**Posibles Causas:**
- Caché del navegador
- Sesión expirada
- Error de sincronización

**Solución:**

1. **Refrescar Página:**
   - Presiona F5 o Ctrl+R
   - Fuerza recarga: Ctrl+Shift+R

2. **Limpiar Caché:**
   - Chrome: Ctrl+Shift+Delete
   - Selecciona "Caché"
   - Limpia y recarga

3. **Cerrar y Reabrir Sesión:**
   - Cierra sesión completamente
   - Vuelve a iniciar sesión

### Errores del Sistema

#### Error 500 - Error del Servidor

**Qué Hacer:**

1. **Captura de Pantalla:**
   - Toma screenshot del error
   - Anota la hora exacta

2. **Verifica el Estado:**
   - Revisa si afecta a todos los usuarios
   - Prueba en modo incógnito

3. **Contacta Soporte:**
   - Envía screenshot
   - Describe qué estabas haciendo
   - Proporciona hora del error

#### Error 403 - Acceso Denegado

**Causas:**
- Permisos insuficientes
- Sesión expirada
- Rol incorrecto

**Solución:**

1. **Verifica tu Rol:**
   - Confirma que estás en el rol correcto
   - Cambia de rol si es necesario

2. **Refresca la Sesión:**
   - Cierra y vuelve a iniciar sesión

3. **Verifica Permisos:**
   - Contacta a otro Super Admin
   - Verifica que tu email está en la lista autorizada

---

## 🔌 API y Integraciones

### API de EBI 360

**Documentación:** `https://api.ebi360.com/docs`

#### Autenticación

**Método:** API Key

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.ebi360.com/v1/companies
```

#### Endpoints Principales

**1. Empresas**

```
GET    /v1/companies           # Listar empresas
POST   /v1/companies           # Crear empresa
GET    /v1/companies/:id       # Obtener empresa
PUT    /v1/companies/:id       # Actualizar empresa
DELETE /v1/companies/:id       # Eliminar empresa
```

**2. Usuarios**

```
GET    /v1/users               # Listar usuarios
POST   /v1/users               # Crear usuario
GET    /v1/users/:id           # Obtener usuario
PUT    /v1/users/:id           # Actualizar usuario
DELETE /v1/users/:id           # Eliminar usuario
```

**3. Diagnósticos**

```
GET    /v1/diagnostics         # Listar diagnósticos
GET    /v1/diagnostics/:id     # Obtener diagnóstico
GET    /v1/diagnostics/stats   # Estadísticas agregadas
```

#### Webhooks

**Configurar Webhooks:**

```
Dashboard → Configuración → Webhooks
→ Agregar Webhook
```

**Eventos Disponibles:**

- `company.created` - Nueva empresa creada
- `company.updated` - Empresa actualizada
- `user.invited` - Usuario invitado
- `diagnostic.completed` - Diagnóstico completado
- `report.generated` - Reporte generado

**Ejemplo de Payload:**

```json
{
  "event": "diagnostic.completed",
  "timestamp": "2025-12-15T10:30:00Z",
  "data": {
    "user_id": "abc123",
    "company_id": "xyz789",
    "score": 7.8,
    "dimensions": {
      "physical": 8.2,
      "emotional": 7.5,
      "social": 7.9,
      "professional": 7.6,
      "intellectual": 7.4,
      "financial": 7.2
    }
  }
}
```

### Integraciones

#### HRIS (Sistemas de RRHH)

**Sistemas Soportados:**
- Workday
- BambooHR
- SAP SuccessFactors
- ADP

**Sincronización:**
- Importación automática de empleados
- Actualización de departamentos
- Gestión de altas/bajas

#### Comunicaciones

**Plataformas:**
- Slack
- Microsoft Teams
- Email (SMTP)

**Notificaciones:**
- Nuevos diagnósticos
- Alertas de bienestar
- Recordatorios

---

## 📚 Recursos Adicionales

### Documentación Técnica

- **API Docs:** https://api.ebi360.com/docs
- **GitHub:** https://github.com/ebi360
- **Changelog:** https://ebi360.com/changelog

### Soporte

**Canales de Soporte:**

- 📧 **Email:** support@ebi360.com
- 💬 **Chat:** Disponible en plataforma
- 📞 **Teléfono:** +54 11 xxxx-xxxx (Urgencias)
- 🎫 **Tickets:** https://support.ebi360.com

**Horarios:**
- Lunes a Viernes: 9:00 - 18:00 (GMT-3)
- Urgencias: 24/7

### Capacitación

**Webinars Mensuales:**
- Nuevas funcionalidades
- Mejores prácticas
- Casos de éxito

**Certificación:**
- Curso de Super Admin
- Examen de certificación
- Certificado oficial

---

## ✅ Checklist del Super Admin

### Diario

```
□ Revisar dashboard de métricas
□ Verificar emails pendientes
□ Revisar logs de errores
□ Responder tickets de soporte
```

### Semanal

```
□ Revisar nuevas empresas
□ Verificar tasa de participación
□ Analizar tendencias de bienestar
□ Revisar reportes de email
□ Actualizar documentación
```

### Mensual

```
□ Auditoría de usuarios
□ Revisión de seguridad
□ Análisis de métricas globales
□ Planificación de mejoras
□ Backup de configuración
□ Reunión con equipo
```

### Trimestral

```
□ Revisión estratégica
□ Evaluación de satisfacción
□ Planificación de nuevas features
□ Capacitación del equipo
□ Auditoría completa del sistema
```

---

## 🎓 Conclusión

Como Super Administrador de EBI 360, tienes la responsabilidad y el poder de:

- 🏢 Gestionar múltiples organizaciones
- 👥 Impactar positivamente en miles de personas
- 📊 Tomar decisiones basadas en datos
- 🔒 Mantener la seguridad y privacidad
- 🚀 Impulsar el bienestar organizacional

### Recuerda

> **"Con gran poder viene gran responsabilidad"**

- ✅ Usa tus permisos sabiamente
- ✅ Protege la privacidad de los usuarios
- ✅ Documenta tus acciones
- ✅ Mantente actualizado
- ✅ Busca ayuda cuando la necesites

---

**¡Bienvenido al equipo de Super Administradores de EBI 360!**

Estamos aquí para apoyarte en tu misión de promover el bienestar integral en las organizaciones de LATAM.

---

**Versión del Documento:** 1.0  
**Última Actualización:** Diciembre 2025  
**Próxima Revisión:** Marzo 2026  
**Autor:** Equipo EBI 360

---

*© 2025 EBI 360 - Todos los derechos reservados*  
*Documento Confidencial - Solo para Super Administradores*
