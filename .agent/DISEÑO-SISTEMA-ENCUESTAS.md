# 📊 Sistema Modular de Gestión de Encuestas - EBI 360
## Documento de Diseño y Arquitectura

**Versión:** 1.0  
**Fecha:** 23 de Diciembre de 2025  
**Estado:** 🔍 En Revisión

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Análisis de la Situación Actual](#análisis-de-la-situación-actual)
3. [Objetivos del Sistema](#objetivos-del-sistema)
4. [Arquitectura Propuesta](#arquitectura-propuesta)
5. [Modelo de Datos](#modelo-de-datos)
6. [Flujos de Trabajo](#flujos-de-trabajo)
7. [Interfaces de Usuario](#interfaces-de-usuario)
8. [Plan de Implementación](#plan-de-implementación)
9. [Consideraciones Técnicas](#consideraciones-técnicas)
10. [Riesgos y Mitigaciones](#riesgos-y-mitigaciones)

---

## 🎯 Resumen Ejecutivo

### Problema Actual
- Las preguntas de la encuesta EBI están **hardcodeadas** en `src/lib/logic.ts`
- No existe flexibilidad para actualizar encuestas sin modificar código
- No hay soporte para múltiples encuestas por empresa
- No se pueden asignar encuestas específicas por país/normativa

### Solución Propuesta
Sistema modular de gestión de encuestas que permite:
- ✅ Gestión dinámica de encuestas desde panel de Super Admin
- ✅ Carga de encuestas mediante archivos Excel
- ✅ Asignación de múltiples encuestas por empresa
- ✅ Encuestas base (EBI) + encuestas complementarias (normativas)
- ✅ Configuración por país y plan de suscripción

---

## 📊 Análisis de la Situación Actual

### Estructura Actual

```typescript
// src/lib/logic.ts
export interface Question {
    id: number;
    domain: string;
    construct: string;
    type: QuestionType; // "RP" | "FO"
    text: string;
    weight: number;
    severity: number;
    personal_weight: number;
    org_weight: number;
}

export const questions: Question[] = [
    // 36 preguntas hardcodeadas
];
```

### Limitaciones Identificadas

1. **Rigidez**
   - ❌ Cambios requieren modificar código
   - ❌ Deploy necesario para actualizar encuestas
   - ❌ No versionado de encuestas

2. **Escalabilidad**
   - ❌ Una sola encuesta para todos
   - ❌ No soporta múltiples idiomas
   - ❌ No permite personalización por empresa

3. **Gestión**
   - ❌ Sin interfaz administrativa
   - ❌ No hay historial de cambios
   - ❌ Difícil auditoría

---

## 🎯 Objetivos del Sistema

### Objetivos Principales

1. **Flexibilidad**
   - ✅ Actualizar encuestas sin modificar código
   - ✅ Múltiples encuestas activas simultáneamente
   - ✅ Versionado de encuestas

2. **Modularidad**
   - ✅ Encuesta base (EBI) obligatoria
   - ✅ Encuestas complementarias opcionales
   - ✅ Asignación por empresa/país/plan

3. **Usabilidad**
   - ✅ Carga mediante Excel (formato familiar)
   - ✅ Interfaz intuitiva para Super Admins
   - ✅ Validación automática de datos

4. **Trazabilidad**
   - ✅ Historial de versiones
   - ✅ Auditoría de cambios
   - ✅ Respuestas vinculadas a versión específica

---

## 🏗️ Arquitectura Propuesta

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   SUPER ADMIN PANEL                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Encuestas  │  │  Asignación  │  │   Reportes   │ │
│  │   Gestión    │  │   Empresas   │  │  Analíticas  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE LÓGICA                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Parser     │  │  Validador   │  │  Calculador  │ │
│  │   Excel      │  │   Datos      │  │  Puntajes    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  BASE DE DATOS (Supabase)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   surveys    │  │survey_       │  │  company_    │ │
│  │              │  │questions     │  │  surveys     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │   results    │  │  responses   │                   │
│  │              │  │              │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  COMPANY ADMIN PANEL                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Encuestas Asignadas a la Empresa                │  │
│  │  - EBI 360 (Base)                                │  │
│  │  - NOM-035 (México)                              │  │
│  │  - Ley Karin (Chile)                             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   EMPLOYEE INTERFACE                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Diagnósticos Disponibles                        │  │
│  │  [Realizar EBI 360]  [Realizar NOM-035]          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 💾 Modelo de Datos

### Tablas Principales

#### 1. `surveys` (Encuestas)

```sql
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Información básica
    code VARCHAR(50) UNIQUE NOT NULL,  -- 'EBI360', 'NOM035', 'LEY_KARIN'
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Tipo y categoría
    survey_type VARCHAR(50) NOT NULL,  -- 'base', 'regulatory', 'custom'
    category VARCHAR(100),              -- 'wellness', 'safety', 'compliance'
    
    -- Geografía y normativa
    country_code VARCHAR(3),            -- 'MX', 'CL', 'AR', NULL (global)
    regulation_name VARCHAR(200),       -- 'NOM-035-STPS-2018'
    
    -- Versión y estado
    version VARCHAR(20) NOT NULL,       -- '1.0', '1.1', '2.0'
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'archived'
    
    -- Configuración
    is_base BOOLEAN DEFAULT false,      -- true solo para EBI360
    is_mandatory BOOLEAN DEFAULT false, -- obligatoria para empresas
    requires_approval BOOLEAN DEFAULT true,
    
    -- Algoritmo de cálculo
    calculation_algorithm JSONB,        -- Configuración del algoritmo
    scoring_config JSONB,               -- Configuración de puntajes
    
    -- Metadatos
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP,
    archived_at TIMESTAMP,
    
    -- Archivo original
    source_file_url TEXT,               -- URL del Excel original
    source_file_name VARCHAR(255),
    
    CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'archived')),
    CONSTRAINT valid_type CHECK (survey_type IN ('base', 'regulatory', 'custom'))
);

-- Índices
CREATE INDEX idx_surveys_code ON surveys(code);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_country ON surveys(country_code);
CREATE INDEX idx_surveys_type ON surveys(survey_type);
```

#### 2. `survey_questions` (Preguntas de Encuestas)

```sql
CREATE TABLE survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    
    -- Identificación
    question_number INTEGER NOT NULL,   -- Orden en la encuesta
    question_code VARCHAR(50),          -- Código único opcional
    
    -- Contenido
    domain VARCHAR(100) NOT NULL,       -- 'Físico', 'Emocional', etc.
    construct VARCHAR(200),             -- 'Bienestar corporal básico'
    question_text TEXT NOT NULL,
    
    -- Tipo y clasificación
    question_type VARCHAR(10) NOT NULL, -- 'RP' (Responsabilidad Personal), 'FO' (Factor Organizacional)
    
    -- Pesos y severidad
    weight DECIMAL(3,2) DEFAULT 1.0,
    severity DECIMAL(3,2) DEFAULT 1.0,
    personal_weight DECIMAL(3,2) DEFAULT 0,
    org_weight DECIMAL(3,2) DEFAULT 0,
    
    -- Configuración de respuesta
    response_type VARCHAR(20) DEFAULT 'scale', -- 'scale', 'multiple_choice', 'text'
    response_config JSONB,              -- Configuración específica del tipo
    
    -- Validación
    is_required BOOLEAN DEFAULT true,
    validation_rules JSONB,
    
    -- Orden y agrupación
    section VARCHAR(100),
    subsection VARCHAR(100),
    display_order INTEGER,
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_question_type CHECK (question_type IN ('RP', 'FO', 'MIXED')),
    CONSTRAINT valid_response_type CHECK (response_type IN ('scale', 'multiple_choice', 'text', 'boolean'))
);

-- Índices
CREATE INDEX idx_survey_questions_survey ON survey_questions(survey_id);
CREATE INDEX idx_survey_questions_domain ON survey_questions(domain);
CREATE INDEX idx_survey_questions_order ON survey_questions(survey_id, display_order);
```

#### 3. `company_surveys` (Asignación de Encuestas a Empresas)

```sql
CREATE TABLE company_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    
    -- Configuración
    is_active BOOLEAN DEFAULT true,
    is_mandatory BOOLEAN DEFAULT false,  -- Obligatoria para empleados
    
    -- Programación
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    frequency VARCHAR(20),               -- 'once', 'monthly', 'quarterly', 'yearly'
    
    -- Permisos
    assigned_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    
    -- Configuración específica de empresa
    custom_config JSONB,                 -- Personalizaciones
    
    -- Metadatos
    assigned_at TIMESTAMP DEFAULT NOW(),
    activated_at TIMESTAMP,
    deactivated_at TIMESTAMP,
    
    -- Constraint único
    UNIQUE(company_id, survey_id)
);

-- Índices
CREATE INDEX idx_company_surveys_company ON company_surveys(company_id);
CREATE INDEX idx_company_surveys_active ON company_surveys(company_id, is_active);
```

#### 4. Modificación de `results` (Resultados)

```sql
-- Agregar columna para vincular con encuesta específica
ALTER TABLE results ADD COLUMN survey_id UUID REFERENCES surveys(id);
ALTER TABLE results ADD COLUMN survey_version VARCHAR(20);

-- Índice
CREATE INDEX idx_results_survey ON results(survey_id);
```

#### 5. `survey_responses` (Respuestas Individuales)

```sql
CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    result_id UUID REFERENCES results(id) ON DELETE CASCADE,
    question_id UUID REFERENCES survey_questions(id),
    
    -- Respuesta
    response_value DECIMAL(3,1),        -- Para escalas 1-10
    response_text TEXT,                 -- Para respuestas abiertas
    response_data JSONB,                -- Para respuestas complejas
    
    -- Metadatos
    answered_at TIMESTAMP DEFAULT NOW(),
    time_spent_seconds INTEGER,
    
    UNIQUE(result_id, question_id)
);

-- Índices
CREATE INDEX idx_survey_responses_result ON survey_responses(result_id);
CREATE INDEX idx_survey_responses_question ON survey_responses(question_id);
```

---

## 📋 Formato de Excel para Carga de Encuestas

### Estructura del Archivo Excel

**Nombre de archivo:** `[CODIGO_ENCUESTA]_v[VERSION].xlsx`  
**Ejemplo:** `NOM035_v1.0.xlsx`

#### Hoja 1: "Metadata" (Metadatos de la Encuesta)

| Campo | Valor | Descripción |
|-------|-------|-------------|
| Código | NOM035 | Código único |
| Nombre | NOM-035 STPS 2018 | Nombre completo |
| Descripción | Encuesta de factores de riesgo psicosocial | Descripción |
| Tipo | regulatory | base / regulatory / custom |
| País | MX | Código ISO del país |
| Normativa | NOM-035-STPS-2018 | Nombre de la normativa |
| Versión | 1.0 | Versión de la encuesta |
| Es Base | NO | SI / NO |
| Es Obligatoria | SI | SI / NO |

#### Hoja 2: "Questions" (Preguntas)

| # | Dominio | Constructo | Tipo | Pregunta | Peso | Severidad | Peso_Personal | Peso_Org |
|---|---------|------------|------|----------|------|-----------|---------------|----------|
| 1 | Físico | Bienestar corporal | RP | ¿Dormís lo suficiente? | 0.6 | 0.9 | 1 | 0 |
| 2 | Físico | Bienestar corporal | FO | ¿Tu jornada permite descanso? | 0.6 | 0.9 | 0 | 1 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

#### Hoja 3: "Algorithm" (Algoritmo de Cálculo)

```json
{
  "scoring_method": "weighted_average",
  "domains": [
    {
      "name": "Físico",
      "weight": 1.0,
      "questions": [1, 2, 3, 4, 5, 6]
    },
    {
      "name": "Emocional",
      "weight": 1.0,
      "questions": [7, 8, 9, 10, 11, 12]
    }
  ],
  "thresholds": {
    "low": 0,
    "medium": 5,
    "high": 7,
    "excellent": 9
  }
}
```

---

## 🔄 Flujos de Trabajo

### Flujo 1: Crear Nueva Encuesta

```
Super Admin
    ↓
[Panel de Encuestas] → [Nueva Encuesta]
    ↓
[Subir Excel] → Validación Automática
    ↓
    ├─ ✅ Válido → [Vista Previa]
    │                    ↓
    │              [Confirmar] → Guardar en BD
    │                    ↓
    │              Estado: DRAFT
    │
    └─ ❌ Inválido → [Mostrar Errores]
                          ↓
                    [Corregir y Reintentar]
```

### Flujo 2: Publicar Encuesta

```
Super Admin
    ↓
[Encuestas] → [Seleccionar Encuesta DRAFT]
    ↓
[Revisar Configuración]
    ↓
[Publicar]
    ↓
Estado: ACTIVE
    ↓
Disponible para Asignación
```

### Flujo 3: Asignar Encuesta a Empresa

```
Super Admin
    ↓
[Empresas] → [Seleccionar Empresa]
    ↓
[Gestionar Encuestas]
    ↓
[Ver Encuestas Disponibles]
    ↓
    ├─ Encuestas Base (siempre asignadas)
    │   └─ EBI 360 ✓
    │
    └─ Encuestas Complementarias
        ├─ Por País
        │   ├─ NOM-035 (México) □
        │   ├─ Ley Karin (Chile) □
        │   └─ Res 1016 (Colombia) □
        │
        └─ Personalizadas
            └─ [Lista de encuestas custom] □
    ↓
[Seleccionar Encuestas] → [Configurar]
    ↓
    ├─ Obligatoria: SI/NO
    ├─ Fecha Inicio
    ├─ Fecha Fin
    └─ Frecuencia
    ↓
[Asignar]
    ↓
Encuestas Activas para la Empresa
```

### Flujo 4: Empleado Realiza Diagnóstico

```
Empleado
    ↓
[Dashboard] → [Diagnósticos Disponibles]
    ↓
    ├─ EBI 360 (Base) [Realizar]
    ├─ NOM-035 [Realizar]
    └─ Ley Karin [Realizar]
    ↓
[Seleccionar Encuesta]
    ↓
[Cargar Preguntas de BD]
    ↓
[Responder Cuestionario]
    ↓
[Calcular Puntaje según Algoritmo]
    ↓
[Guardar Resultado]
    ↓
[Mostrar Resultados]
```

---

## 🎨 Interfaces de Usuario

### 1. Panel de Super Admin - Gestión de Encuestas

```
┌─────────────────────────────────────────────────────────────┐
│  Encuestas                                                  │
│  Gestiona las encuestas disponibles en la plataforma       │
│                                                             │
│  [+ Nueva Encuesta]  [Importar desde Excel]  [Exportar]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filtros: [Todas ▼] [País: Todos ▼] [Estado: Activas ▼]  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ CÓDIGO    │ NOMBRE           │ TIPO        │ PAÍS │ ESTADO │
├─────────────────────────────────────────────────────────────┤
│ 🏠 EBI360 │ EBI 360 Base    │ Base        │ --   │ ✅ Activa│
│           │ v2.0             │             │      │ 1,247 usos│
│           │ [Editar] [Ver] [Versiones]                      │
├─────────────────────────────────────────────────────────────┤
│ 🇲🇽 NOM035│ NOM-035 STPS    │ Regulatoria │ MX   │ ✅ Activa│
│           │ v1.0             │             │      │ 89 usos  │
│           │ [Editar] [Ver] [Asignar]                        │
├─────────────────────────────────────────────────────────────┤
│ 🇨🇱 KARIN │ Ley Karin       │ Regulatoria │ CL   │ 📝 Draft │
│           │ v1.0             │             │      │ 0 usos   │
│           │ [Editar] [Publicar] [Eliminar]                  │
└─────────────────────────────────────────────────────────────┘
```

### 2. Formulario de Nueva Encuesta

```
┌─────────────────────────────────────────────────────────────┐
│  Nueva Encuesta                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Método de Creación:                                        │
│  ○ Subir archivo Excel                                      │
│  ○ Crear manualmente                                        │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │  📎 Arrastra tu archivo Excel aquí                │     │
│  │     o haz clic para seleccionar                   │     │
│  │                                                    │     │
│  │  Formato aceptado: .xlsx, .xls                    │     │
│  │  Tamaño máximo: 5MB                               │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  📥 Descargar plantilla de ejemplo                          │
│                                                             │
│  [Cancelar]  [Subir y Validar]                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Vista Previa de Encuesta Importada

```
┌─────────────────────────────────────────────────────────────┐
│  Vista Previa: NOM-035 STPS 2018                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Archivo validado correctamente                          │
│                                                             │
│  Información General:                                       │
│  • Código: NOM035                                           │
│  • Nombre: NOM-035 STPS 2018                               │
│  • Tipo: Regulatoria                                        │
│  • País: México (MX)                                        │
│  • Versión: 1.0                                             │
│  • Total de preguntas: 72                                   │
│                                                             │
│  Dominios detectados:                                       │
│  • Condiciones del ambiente de trabajo (12 preguntas)      │
│  • Carga de trabajo (15 preguntas)                         │
│  • Falta de control (10 preguntas)                         │
│  • Jornada de trabajo (8 preguntas)                        │
│  • Interferencia trabajo-familia (6 preguntas)             │
│  • Liderazgo (12 preguntas)                                │
│  • Relaciones en el trabajo (9 preguntas)                  │
│                                                             │
│  [Ver Preguntas Completas]  [Editar Metadatos]             │
│                                                             │
│  [Cancelar]  [Guardar como Borrador]  [Publicar]          │
└─────────────────────────────────────────────────────────────┘
```

### 4. Asignación de Encuestas a Empresa

```
┌─────────────────────────────────────────────────────────────┐
│  Encuestas Asignadas: Acme Corporation                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Encuesta Base (Obligatoria)                               │
│  ┌───────────────────────────────────────────────────┐     │
│  │ ✅ EBI 360 v2.0                                   │     │
│  │    Estado: Activa                                 │     │
│  │    Empleados completados: 45/120 (37%)           │     │
│  │    [Ver Resultados]                               │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  Encuestas Complementarias                                 │
│  ┌───────────────────────────────────────────────────┐     │
│  │ ✅ NOM-035 STPS 2018 v1.0                        │     │
│  │    País: México                                   │     │
│  │    Obligatoria: Sí                                │     │
│  │    Empleados completados: 38/120 (32%)           │     │
│  │    [Configurar] [Desactivar]                      │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  [+ Asignar Nueva Encuesta]                                │
│                                                             │
│  Encuestas Disponibles:                                    │
│  ┌───────────────────────────────────────────────────┐     │
│  │ □ Ley Karin (Chile)                               │     │
│  │ □ Resolución 1016 (Colombia)                      │     │
│  │ □ Encuesta de Clima Laboral Custom                │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  [Asignar Seleccionadas]                                   │
└─────────────────────────────────────────────────────────────┘
```

### 5. Vista de Empleado - Diagnósticos Disponibles

```
┌─────────────────────────────────────────────────────────────┐
│  Mis Diagnósticos                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Diagnósticos Pendientes                                   │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │ 🏠 EBI 360 - Evaluación de Bienestar Integral    │     │
│  │    Tiempo estimado: 10-15 minutos                │     │
│  │    Última realización: 15 Nov 2025               │     │
│  │    [Realizar Diagnóstico →]                       │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │ 🇲🇽 NOM-035 - Factores de Riesgo Psicosocial    │     │
│  │    Tiempo estimado: 20-25 minutos                │     │
│  │    ⚠️ Obligatorio - Vence: 31 Dic 2025           │     │
│  │    [Realizar Diagnóstico →]                       │     │
│  └───────────────────────────────────────────────────┘     │
│                                                             │
│  Diagnósticos Completados                                  │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │ ✅ EBI 360 - Completado el 15 Nov 2025           │     │
│  │    Puntuación: 7.8/10                             │     │
│  │    [Ver Resultados]                               │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 Plan de Implementación por Etapas

### Fase 1: Fundamentos (Semana 1-2) 🔵

**Objetivo:** Crear la base de datos y migración de datos actuales

**Tareas:**
1. ✅ Crear migraciones SQL para nuevas tablas
2. ✅ Migrar encuesta EBI actual a BD
3. ✅ Crear funciones de utilidad para queries
4. ✅ Tests de integridad de datos

**Entregables:**
- Esquema de BD completo
- Encuesta EBI en BD
- Documentación de tablas

**Criterios de Aceptación:**
- [ ] Todas las tablas creadas sin errores
- [ ] Encuesta EBI migrada con 36 preguntas
- [ ] Queries básicos funcionando
- [ ] Tests pasando

---

### Fase 2: Parser de Excel (Semana 3) 🟢

**Objetivo:** Implementar carga de encuestas desde Excel

**Tareas:**
1. ✅ Crear librería de parsing de Excel
2. ✅ Validador de formato
3. ✅ Transformador de datos
4. ✅ Manejo de errores

**Entregables:**
- Función `parseExcelSurvey(file)`
- Validaciones completas
- Mensajes de error descriptivos

**Criterios de Aceptación:**
- [ ] Parser lee correctamente Excel
- [ ] Validaciones detectan errores
- [ ] Datos transformados correctamente
- [ ] Manejo de errores robusto

---

### Fase 3: Panel de Super Admin - Encuestas (Semana 4-5) 🟡

**Objetivo:** Interfaz de gestión de encuestas

**Tareas:**
1. ✅ Página de listado de encuestas
2. ✅ Formulario de carga de Excel
3. ✅ Vista previa de encuesta
4. ✅ Publicación/Archivado
5. ✅ Versionado

**Entregables:**
- `/admin/super/surveys` completo
- CRUD de encuestas
- Upload de archivos

**Criterios de Aceptación:**
- [ ] Super admin puede subir Excel
- [ ] Vista previa muestra datos correctos
- [ ] Puede publicar/archivar encuestas
- [ ] Versionado funciona

---

### Fase 4: Asignación a Empresas (Semana 6) 🟠

**Objetivo:** Vincular encuestas con empresas

**Tareas:**
1. ✅ Interfaz de asignación
2. ✅ Configuración de encuestas por empresa
3. ✅ Validaciones de compatibilidad
4. ✅ Activación/Desactivación

**Entregables:**
- Módulo de asignación
- Configuración por empresa
- Validaciones

**Criterios de Aceptación:**
- [ ] Super admin puede asignar encuestas
- [ ] Configuración se guarda correctamente
- [ ] Validaciones previenen conflictos
- [ ] Estado se actualiza en tiempo real

---

### Fase 5: Adaptación del Diagnóstico (Semana 7-8) 🔴

**Objetivo:** Modificar flujo de diagnóstico para usar BD

**Tareas:**
1. ✅ Refactorizar `/diagnostico` para cargar de BD
2. ✅ Selector de encuesta disponible
3. ✅ Cálculo dinámico de puntajes
4. ✅ Guardar respuestas vinculadas

**Entregables:**
- Diagnóstico dinámico
- Selector de encuestas
- Cálculo de algoritmos

**Criterios de Aceptación:**
- [ ] Empleado ve encuestas asignadas
- [ ] Puede completar cualquier encuesta
- [ ] Puntajes se calculan correctamente
- [ ] Respuestas se guardan con versión

---

### Fase 6: Resultados y Reportes (Semana 9) 🟣

**Objetivo:** Visualización de resultados multi-encuesta

**Tareas:**
1. ✅ Dashboard con múltiples encuestas
2. ✅ Comparación de resultados
3. ✅ Exportación por encuesta
4. ✅ Analíticas agregadas

**Entregables:**
- Dashboard multi-encuesta
- Reportes por encuesta
- Comparativas

**Criterios de Aceptación:**
- [ ] Resultados se muestran por encuesta
- [ ] Comparación funciona
- [ ] Exportación incluye todas las encuestas
- [ ] Analíticas correctas

---

### Fase 7: Testing y Optimización (Semana 10) ⚫

**Objetivo:** Asegurar calidad y performance

**Tareas:**
1. ✅ Tests end-to-end
2. ✅ Optimización de queries
3. ✅ Validación de UX
4. ✅ Documentación

**Entregables:**
- Suite de tests completa
- Performance optimizado
- Documentación de usuario

**Criterios de Aceptación:**
- [ ] Todos los tests pasan
- [ ] Performance < 2s carga
- [ ] UX validada
- [ ] Documentación completa

---

## 🔧 Consideraciones Técnicas

### Tecnologías Requeridas

```typescript
// Nuevas dependencias
{
  "xlsx": "^0.18.5",           // Parsing de Excel
  "zod": "^3.22.4",            // Validación de esquemas
  "react-dropzone": "^14.2.3", // Upload de archivos
  "recharts": "^2.10.3"        // Gráficos avanzados
}
```

### Estructura de Archivos

```
src/
├── app/
│   └── admin/
│       └── super/
│           └── surveys/                    # NUEVO
│               ├── page.tsx                # Listado
│               ├── new/
│               │   └── page.tsx            # Nueva encuesta
│               ├── [id]/
│               │   ├── page.tsx            # Ver/Editar
│               │   ├── preview/
│               │   │   └── page.tsx        # Vista previa
│               │   └── assign/
│               │       └── page.tsx        # Asignar a empresas
│               └── components/
│                   ├── SurveyList.tsx
│                   ├── SurveyUploader.tsx
│                   ├── SurveyPreview.tsx
│                   └── SurveyAssignment.tsx
│
├── lib/
│   ├── surveys/                            # NUEVO
│   │   ├── parser.ts                       # Parser de Excel
│   │   ├── validator.ts                    # Validaciones
│   │   ├── calculator.ts                   # Cálculo de puntajes
│   │   └── types.ts                        # Tipos TypeScript
│   └── logic.ts                            # DEPRECAR gradualmente
│
└── components/
    └── surveys/                            # NUEVO
        ├── SurveySelector.tsx              # Selector de encuestas
        ├── QuestionRenderer.tsx            # Renderizado dinámico
        └── ResultsComparison.tsx           # Comparación
```

### APIs y Endpoints

```typescript
// src/app/api/surveys/route.ts
GET    /api/surveys              // Listar encuestas
POST   /api/surveys              // Crear encuesta
GET    /api/surveys/[id]         // Obtener encuesta
PUT    /api/surveys/[id]         // Actualizar encuesta
DELETE /api/surveys/[id]         // Eliminar encuesta

// src/app/api/surveys/upload/route.ts
POST   /api/surveys/upload       // Subir y parsear Excel

// src/app/api/surveys/[id]/publish/route.ts
POST   /api/surveys/[id]/publish // Publicar encuesta

// src/app/api/companies/[id]/surveys/route.ts
GET    /api/companies/[id]/surveys        // Encuestas de empresa
POST   /api/companies/[id]/surveys        // Asignar encuesta
DELETE /api/companies/[id]/surveys/[sid]  // Desasignar encuesta
```

---

## ⚠️ Riesgos y Mitigaciones

### Riesgo 1: Migración de Datos Existentes

**Problema:** Resultados actuales no están vinculados a encuesta específica

**Mitigación:**
```sql
-- Script de migración
UPDATE results 
SET survey_id = (SELECT id FROM surveys WHERE code = 'EBI360'),
    survey_version = '2.0'
WHERE survey_id IS NULL;
```

### Riesgo 2: Performance con Múltiples Encuestas

**Problema:** Queries lentos con muchas preguntas

**Mitigación:**
- Índices optimizados
- Caché de encuestas activas
- Paginación de resultados
- Lazy loading de preguntas

### Riesgo 3: Validación de Algoritmos Complejos

**Problema:** Algoritmos de cálculo pueden ser complejos

**Mitigación:**
- Validador de algoritmos
- Tests exhaustivos
- Documentación clara
- Ejemplos de referencia

### Riesgo 4: Compatibilidad con Código Existente

**Problema:** Código actual usa `questions` hardcodeado

**Mitigación:**
- Migración gradual
- Mantener compatibilidad temporal
- Feature flags
- Tests de regresión

---

## 📊 Métricas de Éxito

### KPIs del Sistema

1. **Funcionalidad**
   - ✅ 100% de encuestas migrables desde Excel
   - ✅ 0 errores en cálculo de puntajes
   - ✅ < 5 segundos para cargar encuesta

2. **Usabilidad**
   - ✅ Super admin puede crear encuesta en < 5 minutos
   - ✅ 0 errores de validación falsos positivos
   - ✅ Interfaz intuitiva (< 2 clics para acción)

3. **Escalabilidad**
   - ✅ Soporta > 100 encuestas simultáneas
   - ✅ < 2 segundos para cargar listado
   - ✅ Maneja archivos Excel de hasta 5MB

---

## 🎯 Próximos Pasos

### Para Revisión y Aprobación

1. **Revisar Modelo de Datos**
   - ¿Las tablas cubren todos los casos de uso?
   - ¿Falta algún campo importante?
   - ¿Los tipos de datos son correctos?

2. **Validar Flujos de Trabajo**
   - ¿Los flujos son lógicos?
   - ¿Falta algún paso crítico?
   - ¿Hay casos edge no cubiertos?

3. **Aprobar Interfaces**
   - ¿El diseño es intuitivo?
   - ¿Falta alguna funcionalidad?
   - ¿La navegación es clara?

4. **Confirmar Plan de Implementación**
   - ¿Las fases son realistas?
   - ¿El orden es correcto?
   - ¿Los tiempos son adecuados?

### Decisiones Pendientes

- [ ] ¿Permitir edición de encuestas publicadas?
- [ ] ¿Versionado automático o manual?
- [ ] ¿Límite de encuestas por empresa?
- [ ] ¿Soporte para múltiples idiomas desde el inicio?
- [ ] ¿Importar/Exportar configuraciones entre ambientes?

---

## 📝 Notas Finales

Este documento es un **punto de partida** para la discusión. Está diseñado para ser:

- ✅ **Completo:** Cubre todos los aspectos del sistema
- ✅ **Flexible:** Puede adaptarse según feedback
- ✅ **Práctico:** Enfocado en implementación real
- ✅ **Escalable:** Preparado para crecimiento futuro

**Siguiente paso:** Revisar este documento sección por sección y aprobar/ajustar cada componente antes de comenzar la implementación.

---

**Autor:** Antigravity AI + Equipo EBI 360  
**Versión:** 1.0 - Borrador para Revisión  
**Fecha:** 23 de Diciembre de 2025
