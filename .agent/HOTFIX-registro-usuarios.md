# 🔧 Corrección de Errores de Registro y Asignación de Usuarios

## Problema Identificado

Los nuevos usuarios (tanto los que se registran desde el login como los administradores invitados a empresas) fallan porque:

1. **Falta la columna `roles` (array)** en la tabla `profiles` para soporte multi-rol
2. **Falta la columna `active_role`** para gestionar el rol activo del usuario 
3. **No existe un trigger automático** que cree perfiles cuando se registra un usuario nuevo en `auth.users`

## Migraciones Creadas

He creado 3 archivos de migración SQL que deben ejecutarse **en orden** en tu base de datos de Supabase:

### 1. `20260116_fix_profiles_roles.sql`
- Agrega la columna `roles` (array de roles) a `profiles`
- Agrega la columna `active_role` para el rol activo actual
- Migra datos existentes del campo `role` al nuevo array `roles`

### 2. `20260116_auto_create_profile_trigger.sql`
- Crea una función `handle_new_user()` que se ejecuta automáticamente
- Crea un trigger que se dispara al insertar en `auth.users`
- Asegura que siempre se cree un perfil cuando se registra un usuario nuevo

## Pasos para Aplicar la Solución

### Opción A: Desde el Panel de Supabase (Recomendado)

1. Abre tu proyecto en [dashboard.supabase.com](https://dashboard.supabase.com)
2. Ve a **SQL Editor**
3. Ejecuta **cada archivo en orden**:
   - Primero: `20260116_fix_profiles_roles.sql`
   - Segundo: `20260116_auto_create_profile_trigger.sql`

### Opción B: Desde CLI (Si tienes Supabase CLI instalado)

```bash
cd /Users/leandrofierro/Workspaces/ebi-360

# Aplicar migraciones
supabase db push
```

## Verificación

Después de ejecutar las migraciones, verifica que:

1. **La columna `roles` existe**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' AND column_name = 'roles';
   ```

2. **El trigger existe**:
   ```sql
   SELECT trigger_name 
   FROM information_schema.triggers 
   WHERE event_object_table = 'users' 
   AND trigger_name = 'on_auth_user_created';
   ```

3. **Prueba registrando un nuevo usuario** desde `/login` con modo "Registro"

4. **Prueba invitando un administrador** desde el panel Super Admin

## Archivos Modificados

- ✅ `supabase/migrations/20260116_fix_profiles_roles.sql` (nuevo)
- ✅ `supabase/migrations/20260116_auto_create_profile_trigger.sql` (nuevo)

## Próximos Pasos

Una vez aplicadas estas migraciones en **producción** (Supabase), los problemas de registro y asignación de usuarios deberían resolverse automáticamente.

---

**Fecha**: 16 de enero de 2026  
**Issue**: Errores de registro y asignación de administradores  
**Solución**: Migraciones para columnas faltantes y trigger automático
