# 🔍 Auditoría Completa de Flujos por Rol

## Objetivo
Verificar el flujo completo de datos y funcionalidad para cada tipo de rol en la plataforma EBI 360.

---

## 📊 FLUJO 1: Usuario Común (Employee)

### 1.1 Registro / Invitación
**Punto de entrada**: `/login` (registro) o invitación por email

**Flujo técnico**:
```
1. Usuario se registra con email/password o Google OAuth
   ↓
2. Se crea registro en auth.users
   ↓
3. TRIGGER: handle_new_user() se ejecuta automáticamente
   ↓
4. Se crea perfil en profiles con:
   - role: 'employee'
   - roles: ['employee']
   - active_role: 'employee'
   - company_id: (desde metadata si fue invitado)
   ↓
5. Callback redirige a /perfil
```

**Archivos involucrados**:
- `src/app/login/page.tsx` (UI de registro)
- `src/app/auth/callback/route.ts` (sincronización de perfil)
- `supabase/migrations/20260116_auto_create_profile_trigger.sql` (trigger)

**Estado actual**: ✅ DEBE FUNCIONAR (con trigger nuevo)

---

### 1.2 Navegación y Acceso a Encuestas
**Punto de entrada**: `/perfil` → Botón "Diagnóstico"

**Flujo técnico**:
```
1. Usuario navega a /diagnostico
   ↓
2. Sistema carga:
   - Perfil del usuario (company_id)
   - Encuestas asignadas a su empresa (company_surveys)
   ↓
3. Si hay encuestas disponibles:
   - Selector de diagnóstico (DiagnosisSelector)
   - Usuario selecciona una encuesta
   ↓
4. Carga preguntas de la encuesta (survey_questions)
   ↓
5. Usuario responde pregunta por pregunta
   - Respuestas se guardan en localStorage
   - Key: `ebi_answers_${surveyId}`
```

**Archivos involucrados**:
- `src/app/diagnostico/page.tsx` (lógica de encuesta)
- `src/components/diagnosis/DiagnosisSelector.tsx` (selector)

**Estado actual**: ✅ FUNCIONAL

---

### 1.3 Guardado de Resultados
**Punto de entrada**: Al completar última pregunta → `/resultados`

**Flujo técnico**:
```
1. Usuario termina encuesta
   ↓
2. ResultsPageClient carga respuestas desde localStorage
   ↓
3. Calcula scores usando algoritmo de la encuesta:
   - Global score
   - Domain scores (por cada dominio)
   ↓
4. Llama a saveDiagnosticResult() (server action)
   ↓
5. Se inserta en tabla 'results':
   - user_id
   - survey_id
   - global_score
   - domain_scores (JSONB)
   - answers (JSONB)
   - created_at
   ↓
6. Se marca en localStorage como guardado
```

**Archivos involucrados**:
- `src/app/resultados/ResultsPageClient.tsx` (cálculos)
- `src/lib/actions.ts` → `saveDiagnosticResult()` (guardado en DB)

**Estado actual**: ✅ FUNCIONAL

**⚠️ PUNTO CRÍTICO**: Verificar que `results` tenga RLS que permita a empleados INSERT

---

## 🏢 FLUJO 2: Administrador de Empresa (company_admin)

### 2.1 Dashboard Principal
**Punto de entrada**: `/admin/company`

**Flujo técnico**:
```
1. Admin accede al dashboard
   ↓
2. Sistema carga (desde server):
   - Total de empleados (profiles con company_id)
   - Respuestas recientes (results)
   - Encuestas asignadas (company_surveys)
   ↓
3. Dashboard muestra:
   - Métricas globales
   - Tasa de participación
   - Score promedio
```

**Archivos involucrados**:
- `src/app/admin/company/page.tsx` (dashboard)

**Estado actual**: ⚠️ NECESITA VERIFICACIÓN

**Acciones a revisar**:
- [ ] ¿El query de participación funciona correctamente?
- [ ] ¿Se filtran solo empleados de su company_id?
- [ ] ¿Los resultados se filtran por company_id?

---

### 2.2 Gestión de Empleados
**Punto de entrada**: `/admin/company/employees`

**Flujo técnico**:
```
1. Admin ve lista de empleados
   ↓
2. Query: SELECT * FROM profiles WHERE company_id = [su_company]
   ↓
3. Admin puede:
   - Invitar nuevos empleados (bulkUploadUsers)
   - Asignar áreas (assignAreaToUser)
   - Ver resultados individuales
```

**Archivos involucrados**:
- `src/app/admin/company/employees/page.tsx`
- `src/components/admin/company/EmployeeTableClient.tsx`
- `src/lib/actions.ts` → `bulkUploadUsers()`
- `src/lib/areas-actions.ts` → `assignAreaToUser()`

**Estado actual**: ✅ FUNCIONAL (con invitaciones ya implementadas)

---

### 2.3 Visualización de Reportes
**Punto de entrada**: `/admin/company/reports`

**Flujo técnico**:
```
1. Admin accede a reportes
   ↓
2. Sistema carga:
   - Encuestas asignadas (company_surveys)
   - Resultados agregados (results) filtrados por company_id
   ↓
3. Procesa datos:
   - Agrupa por dominio
   - Calcula promedios
   - Genera gráficos (Recharts)
   ↓
4. Muestra:
   - Wellbeing Wheel (RadarChart)
   - Desglose por dominio (BarChart)
   - Tabla de área (opcional)
   ↓
5. Admin puede:
   - Filtrar por encuesta
   - Exportar PDF
   - Ver recomendaciones de IA
```

**Archivos involucrados**:
- `src/app/admin/company/reports/page.tsx` (página principal)
- `src/components/admin/company/reports/HistoricReportsList.tsx`
- `src/components/admin/company/reports/RecommendationsList.tsx`
- `src/lib/reports-db-actions.ts`
- `src/lib/recommendations-actions.ts`

**Estado actual**: ✅ FUNCIONAL

**⚠️ PUNTO CRÍTICO A VERIFICAR**:
```sql
-- ¿Este query funciona correctamente?
SELECT r.*, p.full_name, p.area_id
FROM results r
JOIN profiles p ON r.user_id = p.id
WHERE p.company_id = [admin_company_id]
AND r.survey_id = [selected_survey]
```

---

### 2.4 Gestión de Campañas (Cerrar Evaluación)
**Punto de entrada**: `/admin/company/evaluations`

**Flujo técnico**:
```
1. Admin ve lista de evaluaciones asignadas
   ↓
2. Query: SELECT * FROM company_surveys WHERE company_id = [su_company]
   ↓
3. Admin puede cerrar evaluación:
   - Llama a closeEvaluation(evaluationId)
   ↓
4. Server action actualiza:
   - status: 'closed'
   - end_date: NOW()
   ↓
5. Sistema puede (futuro):
   - Generar PDF automático
   - Enviar notificaciones
```

**Archivos involucrados**:
- `src/app/admin/company/evaluations/page.tsx`
- `src/components/admin/company/CampaignList.tsx`
- `src/lib/surveys/actions.ts` → `closeEvaluation()`

**Estado actual**: ✅ FUNCIONAL

---

## 🔧 FLUJO 3: Super Administrador (super_admin)

### 3.1 Creación de Empresas
**Punto de entrada**: `/admin/super/companies`

**Flujo técnico**:
```
1. Super Admin crea empresa
   ↓
2. Form envía datos a createCompany()
   ↓
3. Se inserta en 'companies':
   - name
   - subscription_plan
   - active
   - primary_color (default)
   ↓
4. Empresa queda lista para asignar admin
```

**Archivos involucrados**:
- `src/app/admin/super/companies/page.tsx`
- `src/lib/actions.ts` → `createCompany()`

**Estado actual**: ✅ FUNCIONAL

---

### 3.2 Asignación de Administradores
**Punto de entrada**: `/admin/super/companies` → Botón "Asignar Admin"

**Flujo técnico**:
```
1. Super Admin invita a company_admin
   ↓
2. Llama a inviteCompanyAdmin(email, fullName, companyId)
   ↓
3. Crea usuario con generateLink():
   - type: 'invite'
   - metadata: {
       role: 'company_admin',
       roles: ['company_admin'],
       active_role: 'company_admin',
       company_id: [id_empresa]
     }
   ↓
4. TRIGGER automático crea perfil
   ↓
5. Se envía email de invitación (Resend)
   ↓
6. Admin invitado hace clic en link
   ↓
7. Callback sincroniza perfil con metadata
   ↓
8. Redirige a /admin/company
```

**Archivos involucrados**:
- `src/lib/actions.ts` → `inviteCompanyAdmin()`
- `src/app/auth/callback/route.ts` (sincronización)
- `supabase/migrations/20260116_auto_create_profile_trigger.sql`

**Estado actual**: ✅ DEBE FUNCIONAR (con trigger nuevo)

**⚠️ CRÍTICO**: El metadata DEBE incluir `company_id` para que el trigger lo capture

---

### 3.3 Gestión de Encuestas (Módulos)
**Punto de entrada**: `/admin/super/surveys`

**Flujo técnico**:
```
1. Super Admin sube Excel con nueva encuesta
   ↓
2. Parser procesa archivo (parseSurveyExcel):
   - Carga sheet 'Metadata'
   - Carga sheet 'Questions' o 'Respuestas'
   - Carga sheet 'Algorithm' (opcional)
   ↓
3. Se inserta en 'surveys':
   - name
   - description
   - is_base (true si es oficial)
   - calculation_algorithm (JSONB)
   ↓
4. Se insertan preguntas en 'survey_questions':
   - question_number
   - domain
   - construct
   - question_text
   - weight
   - severity
   ↓
5. Super Admin asigna encuesta a empresa:
   - Inserta en 'company_surveys'
   - company_id
   - survey_id
   - assigned_at
   - status: 'open'
```

**Archivos involucrados**:
- `src/app/admin/super/surveys/page.tsx`
- `src/components/admin/surveys/SurveyUploader.tsx`
- `src/lib/surveys/parser.ts`
- `src/lib/surveys/actions.ts` → `createSurvey()`, `assignSurveyToCompany()`

**Estado actual**: ✅ FUNCIONAL

---

## 🔗 Diagrama de Flujo de Datos Completo

```
┌─────────────────┐
│  USUARIO        │
│  (Employee)     │
└────────┬────────┘
         │
         │ 1. Registro
         ↓
┌─────────────────┐
│  auth.users     │ ← Trigger automático
└────────┬────────┘
         │
         │ 2. Perfil creado
         ↓
┌─────────────────┐
│  profiles       │
│  company_id     │
│  role: employee │
└────────┬────────┘
         │
         │ 3. Responde encuesta
         ↓
┌─────────────────┐
│  results        │
│  user_id        │
│  survey_id      │
│  global_score   │
│  domain_scores  │
└────────┬────────┘
         │
         │ 4. Agregación
         ↓
┌─────────────────────────┐
│  ADMIN DASHBOARD        │
│  - Total respuestas     │
│  - Score promedio       │
│  - Gráficos por dominio │
│  - Recomendaciones IA   │
└─────────────────────────┘
```

---

## ✅ Checklist de Verificación

### Base de Datos
- [x] Trigger `handle_new_user()` existe
- [x] Columnas `roles` y `active_role` existen
- [ ] RLS en `results` permite INSERT a employees
- [ ] RLS en `results` permite SELECT a admins de misma company
- [ ] RLS en `profiles` permite SELECT a admins de misma company

### Código Backend
- [x] `saveDiagnosticResult()` guarda en `results`
- [x] `bulkUploadUsers()` incluye metadata con `company_id`
- [x] `inviteCompanyAdmin()` incluye metadata con `company_id` y `role`
- [ ] Dashboard de admin filtra por `company_id`
- [ ] Reportes agregan resultados por `company_id`

### Código Frontend
- [x] Login/Registro funcional
- [x] Diagnóstico carga encuestas asignadas
- [x] Resultados calculan scores correctamente
- [x] Dashboard admin muestra métricas
- [ ] Reportes muestran datos de su empresa

---

## 🚨 Puntos Críticos a Revisar AHORA

### 1. RLS en tabla `results`
**Verificar en Supabase**:
```sql
-- ¿Existen estas políticas?
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'results';
```

**Políticas necesarias**:
```sql
-- Empleados pueden insertar sus propios resultados
CREATE POLICY "Users can insert their own results"
  ON public.results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins pueden ver resultados de su empresa
CREATE POLICY "Admins can view company results"
  ON public.results
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE company_id = (
        SELECT company_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );
```

### 2. Dashboard de Admin - Query de Participación
**Archivo**: `src/app/admin/company/page.tsx`

**Verificar**:
- ¿Se filtra por `company_id`?
- ¿Se cuenta correctamente el total de empleados?
- ¿Se cuenta correctamente el total de respuestas?

### 3. Metadata en Invitaciones
**Archivo**: `src/lib/actions.ts` → `inviteCompanyAdmin()`

**Verificar** que incluya:
```typescript
{
  full_name: fullName,
  company_id: companyId,  // ← CRÍTICO
  role: 'company_admin',
  active_role: 'company_admin',
  roles: ['company_admin'],
  admin_status: 'invited',
}
```

---

## 📋 Plan de Acción

1. **INMEDIATO**: Verificar/crear RLS en `results`
2. **INMEDIATO**: Revisar query del dashboard de admin
3. **CORTO PLAZO**: Crear test de flujo completo (employee → results → admin dashboard)
4. **CORTO PLAZO**: Verificar exportación de PDF
5. **MEDIANO PLAZO**: Automatizar generación de reportes al cerrar evaluación

