# 📊 Sistema de Encuestas Modulares - Resumen Ejecutivo

## 🎯 Visión General

Transformar EBI 360 de un sistema con **una encuesta hardcodeada** a una **plataforma flexible** que soporta múltiples encuestas dinámicas, permitiendo:

- ✅ Encuesta base (EBI 360) para todos
- ✅ Encuestas regulatorias por país (NOM-035, Ley Karin, etc.)
- ✅ Encuestas personalizadas por empresa
- ✅ Gestión completa desde panel de Super Admin
- ✅ Carga mediante archivos Excel

---

## 📋 Propuesta en 3 Conceptos Clave

### 1️⃣ **Encuestas Dinámicas en Base de Datos**

**Antes:**
```typescript
// Hardcodeado en código
export const questions: Question[] = [
    { id: 0, domain: "Físico", text: "¿Dormís bien?", ... },
    // ... 35 preguntas más
];
```

**Después:**
```sql
-- Almacenado en BD, modificable sin deploy
surveys (id, code, name, type, country_code, ...)
survey_questions (id, survey_id, domain, text, ...)
company_surveys (company_id, survey_id, is_active, ...)
```

**Beneficio:** Actualizar encuestas sin tocar código ni hacer deploy

---

### 2️⃣ **Jerarquía de Encuestas**

```
┌─────────────────────────────────────────┐
│         ENCUESTA BASE (Obligatoria)     │
│              EBI 360 v2.0               │
│         Para TODAS las empresas         │
└─────────────────────────────────────────┘
                    +
┌─────────────────────────────────────────┐
│      ENCUESTAS REGULATORIAS (Opcional)  │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  NOM-035    │  │ Ley Karin   │      │
│  │  (México)   │  │  (Chile)    │      │
│  └─────────────┘  └─────────────┘      │
│         Según país de la empresa        │
└─────────────────────────────────────────┘
                    +
┌─────────────────────────────────────────┐
│    ENCUESTAS PERSONALIZADAS (Opcional)  │
│         Creadas para empresa            │
│         específica o industria          │
└─────────────────────────────────────────┘
```

**Beneficio:** Flexibilidad total para cumplir normativas locales

---

### 3️⃣ **Gestión mediante Excel**

**Flujo de Trabajo:**

```
Super Admin
    ↓
Prepara Excel con encuesta
    ↓
Sube a panel /admin/super/surveys
    ↓
Sistema valida automáticamente
    ↓
Vista previa de datos
    ↓
Publica encuesta
    ↓
Asigna a empresas
    ↓
Empleados pueden responder
```

**Beneficio:** No requiere conocimientos técnicos para gestionar encuestas

---

## 🗂️ Modelo de Datos Simplificado

```
surveys                     survey_questions              company_surveys
┌──────────────┐           ┌──────────────┐             ┌──────────────┐
│ id           │───┐       │ id           │             │ id           │
│ code         │   │       │ survey_id    │◄────┐       │ company_id   │
│ name         │   └──────►│ question_num │     │       │ survey_id    │
│ type         │           │ domain       │     │       │ is_active    │
│ country_code │           │ text         │     │       │ is_mandatory │
│ version      │           │ weight       │     │       └──────────────┘
│ status       │           └──────────────┘     │
│ is_base      │                                │
└──────────────┘                                │
                                                │
results                     survey_responses    │
┌──────────────┐           ┌──────────────┐    │
│ id           │───┐       │ id           │    │
│ user_id      │   │       │ result_id    │◄───┘
│ survey_id    │───┼──────►│ question_id  │
│ survey_ver   │   │       │ response_val │
│ total_score  │   │       └──────────────┘
└──────────────┘   │
                   │
                   └─ Vincula resultado con encuesta específica
```

---

## 🎨 Interfaces Clave

### Panel de Super Admin

```
/admin/super/surveys
├── Listado de encuestas
├── Nueva encuesta (upload Excel)
├── Editar encuesta
├── Publicar/Archivar
└── Asignar a empresas
```

### Panel de Company Admin

```
/admin/company
└── Ver encuestas asignadas
    ├── EBI 360 (base)
    ├── NOM-035 (si aplica)
    └── Estadísticas de completitud
```

### Vista de Empleado

```
/diagnostico
└── Selector de encuestas disponibles
    ├── [Realizar EBI 360]
    ├── [Realizar NOM-035]
    └── [Ver resultados anteriores]
```

---

## 📅 Plan de Implementación (10 Semanas)

| Fase | Semanas | Objetivo | Entregable |
|------|---------|----------|------------|
| 1 | 1-2 | Base de datos | Esquema + Migración EBI |
| 2 | 3 | Parser Excel | Función de importación |
| 3 | 4-5 | Panel Super Admin | CRUD de encuestas |
| 4 | 6 | Asignación | Vincular empresas |
| 5 | 7-8 | Diagnóstico dinámico | Flujo multi-encuesta |
| 6 | 9 | Resultados | Dashboard multi-encuesta |
| 7 | 10 | Testing | QA completo |

---

## 🔑 Decisiones Clave a Tomar

### 1. Versionado de Encuestas

**Opción A:** Versionado automático
- ✅ Más simple
- ❌ Menos control

**Opción B:** Versionado manual
- ✅ Control total
- ❌ Más complejo

**Recomendación:** Opción A (automático) con opción de override manual

---

### 2. Edición de Encuestas Publicadas

**Opción A:** No permitir edición, solo nueva versión
- ✅ Integridad de datos
- ❌ Menos flexible

**Opción B:** Permitir edición con advertencias
- ✅ Más flexible
- ❌ Riesgo de inconsistencias

**Recomendación:** Opción A (nueva versión) para encuestas con respuestas

---

### 3. Límite de Encuestas por Empresa

**Opción A:** Sin límite
- ✅ Máxima flexibilidad
- ❌ Posible confusión

**Opción B:** Límite por plan (Basic: 2, Pro: 5, Enterprise: ilimitado)
- ✅ Monetizable
- ❌ Menos flexible

**Recomendación:** Opción B (límite por plan)

---

### 4. Soporte Multiidioma

**Opción A:** Desde el inicio
- ✅ Preparado para expansión
- ❌ Más complejo

**Opción B:** Fase 2 (después de MVP)
- ✅ Más rápido
- ❌ Refactor futuro

**Recomendación:** Opción B (Fase 2), pero diseñar BD preparada

---

## 💡 Casos de Uso Reales

### Caso 1: Empresa Mexicana

```
Acme Corp (México)
├── EBI 360 (base) ✓
└── NOM-035 (regulatoria) ✓
    └── Obligatoria por ley mexicana
```

### Caso 2: Empresa Chilena

```
TechCorp (Chile)
├── EBI 360 (base) ✓
└── Ley Karin (regulatoria) ✓
    └── Obligatoria por ley chilena
```

### Caso 3: Empresa Multinacional

```
GlobalCorp (Multinacional)
├── EBI 360 (base) ✓
├── NOM-035 (México) ✓
├── Ley Karin (Chile) ✓
└── Encuesta Clima Laboral (custom) ✓
```

---

## ✅ Checklist de Revisión

### Modelo de Datos
- [ ] ¿Las tablas cubren todos los casos?
- [ ] ¿Los campos son suficientes?
- [ ] ¿Las relaciones son correctas?
- [ ] ¿Falta algún índice importante?

### Flujos de Trabajo
- [ ] ¿Los flujos son lógicos?
- [ ] ¿Hay casos edge no cubiertos?
- [ ] ¿La UX es intuitiva?
- [ ] ¿Falta algún paso crítico?

### Formato Excel
- [ ] ¿El formato es fácil de usar?
- [ ] ¿Las validaciones son suficientes?
- [ ] ¿Falta algún campo?
- [ ] ¿Hay campos redundantes?

### Plan de Implementación
- [ ] ¿Las fases son realistas?
- [ ] ¿Los tiempos son adecuados?
- [ ] ¿El orden es correcto?
- [ ] ¿Faltan dependencias?

---

## 🚀 Próximos Pasos

### Inmediatos (Esta Semana)

1. **Revisar este documento**
   - Leer sección por sección
   - Anotar dudas y sugerencias
   - Identificar puntos críticos

2. **Tomar decisiones clave**
   - Versionado (automático vs manual)
   - Edición de publicadas (sí vs no)
   - Límites por plan
   - Multiidioma (ahora vs después)

3. **Aprobar o ajustar**
   - Modelo de datos
   - Flujos de trabajo
   - Interfaces
   - Plan de implementación

### Siguiente Semana

4. **Comenzar Fase 1**
   - Crear migraciones SQL
   - Migrar encuesta EBI actual
   - Tests de integridad

---

## 📞 Preguntas para Discutir

1. **Prioridad:** ¿Qué es más urgente?
   - ¿Soporte para NOM-035?
   - ¿Flexibilidad para actualizar EBI?
   - ¿Encuestas personalizadas?

2. **Alcance:** ¿Qué incluir en MVP?
   - ¿Solo carga de Excel?
   - ¿También editor manual?
   - ¿Versionado completo?

3. **Usuarios:** ¿Quién gestionará esto?
   - ¿Solo super admins?
   - ¿También company admins?
   - ¿Necesitan capacitación?

4. **Datos:** ¿Qué hacer con resultados actuales?
   - ¿Migrar todos a nueva estructura?
   - ¿Mantener separados?
   - ¿Período de transición?

---

## 📊 Impacto Esperado

### Para Super Admins
- ⏱️ **Tiempo:** De 2 días (deploy) a 10 minutos (upload Excel)
- 🎯 **Control:** Total sobre encuestas sin depender de desarrollo
- 📈 **Escalabilidad:** Agregar nuevas encuestas sin límite

### Para Company Admins
- 📋 **Visibilidad:** Ver todas las encuestas asignadas
- 📊 **Reportes:** Comparar resultados entre encuestas
- ✅ **Cumplimiento:** Asegurar normativas locales

### Para Empleados
- 🎯 **Claridad:** Ver qué encuestas debe completar
- ⏰ **Flexibilidad:** Completar en su propio tiempo
- 📈 **Progreso:** Seguimiento de diagnósticos

### Para la Plataforma
- 🚀 **Competitividad:** Única plataforma con soporte multi-encuesta
- 🌍 **Expansión:** Fácil adaptación a nuevos países
- 💰 **Monetización:** Encuestas como feature premium

---

## 🎯 Conclusión

Este sistema transformará EBI 360 en una **plataforma verdaderamente modular y escalable**, preparada para:

- ✅ Expansión internacional
- ✅ Cumplimiento normativo
- ✅ Personalización por cliente
- ✅ Crecimiento sostenible

**El siguiente paso es tu feedback para ajustar y aprobar el diseño antes de comenzar la implementación.**

---

**Documento completo:** `.agent/DISEÑO-SISTEMA-ENCUESTAS.md`  
**Autor:** Antigravity AI + Equipo EBI 360  
**Estado:** 🔍 Pendiente de Revisión
