# 📚 Guías de Usuario EBI 360

Este directorio contiene las guías de usuario profesionales para la plataforma EBI 360.

## 📁 Archivos Generados

### Guías en Markdown
- `guia-usuario-colaborador.md` - Guía completa para colaboradores
- `guia-superadministrador.md` - Guía completa para super administradores

### Guías en HTML (Carpeta `/pdfs`)
- `EBI360-Guia-Usuario-Colaborador.html` - Versión HTML con diseño profesional
- `EBI360-Guia-Super-Administrador.html` - Versión HTML con diseño profesional

### Reportes de Código
- `code-review-report.md` - Análisis completo de código
- `corrections-summary.md` - Resumen de correcciones implementadas

## 🎨 Características del Diseño HTML

Las guías HTML incluyen:

✅ **Portada Profesional**
- Logo animado de EBI 360
- Gradientes premium
- Animaciones sutiles

✅ **Diseño Responsive**
- Optimizado para desktop
- Adaptado para tablet
- Perfecto en móvil

✅ **Estilos de Impresión**
- Optimizado para PDF
- Saltos de página inteligentes
- Márgenes profesionales

✅ **Elementos Visuales**
- Tablas con gradientes
- Cajas informativas de colores
- Código con syntax highlighting
- Tipografía premium (Inter font)

## 📄 Generar PDFs

### Opción 1: Desde el Navegador (Recomendado)

1. **Abrir el archivo HTML**
   ```bash
   open .agent/pdfs/EBI360-Guia-Usuario-Colaborador.html
   # o
   open .agent/pdfs/EBI360-Guia-Super-Administrador.html
   ```

2. **Usar el botón de impresión**
   - Haz clic en el botón flotante "🖨️ Imprimir / Guardar PDF"
   - O usa `Cmd + P` (Mac) / `Ctrl + P` (Windows)

3. **Configurar la impresión**
   - Destino: **Guardar como PDF**
   - Diseño: **Vertical**
   - Márgenes: **Predeterminados** o **Mínimos**
   - Opciones: ✅ Gráficos de fondo

4. **Guardar**
   - Elige la ubicación
   - Nombre sugerido: `EBI360-Guia-[Tipo]-v1.0.pdf`
   - Guarda el archivo

### Opción 2: Usando Chrome Headless

```bash
# Guía de Colaborador
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless \
  --disable-gpu \
  --print-to-pdf=".agent/pdfs/EBI360-Guia-Usuario-Colaborador.pdf" \
  --print-to-pdf-no-header \
  "file://$(pwd)/.agent/pdfs/EBI360-Guia-Usuario-Colaborador.html"

# Guía de Super Admin
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless \
  --disable-gpu \
  --print-to-pdf=".agent/pdfs/EBI360-Guia-Super-Administrador.pdf" \
  --print-to-pdf-no-header \
  "file://$(pwd)/.agent/pdfs/EBI360-Guia-Super-Administrador.html"
```

### Opción 3: Regenerar HTML

Si necesitas regenerar los archivos HTML:

```bash
python3 .agent/generate_html_guides.py
```

## 📖 Contenido de las Guías

### Guía de Usuario (Colaboradores)

**Audiencia:** Empleados que usarán la plataforma para diagnósticos

**Contenido:**
- Introducción a EBI 360
- Primeros pasos y autenticación
- Cómo realizar un diagnóstico
- Interpretación de resultados
- Gestión de perfil
- Preguntas frecuentes
- Soporte y contacto

**Páginas:** ~30 páginas
**Nivel:** Básico - Intermedio
**Idioma:** Español
**Formato:** Paso a paso con ejemplos visuales

### Guía de Super Administrador

**Audiencia:** Administradores con acceso completo al sistema

**Contenido:**
- Acceso y autenticación
- Panel de control y métricas
- Gestión de empresas
- Gestión de usuarios y permisos
- Sistema de emails y comunicaciones
- Configuración global
- Reportes y analíticas
- Sistema multi-rol
- Seguridad y mejores prácticas
- Troubleshooting
- API y webhooks
- Integraciones

**Páginas:** ~60 páginas
**Nivel:** Avanzado - Técnico
**Idioma:** Español
**Formato:** Documentación técnica completa

## 🎯 Uso Recomendado

### Para Colaboradores
1. **Onboarding**
   - Enviar por email al momento de la invitación
   - Incluir en el portal de bienvenida

2. **Referencia**
   - Disponible en el centro de ayuda
   - Descargable desde el perfil de usuario

3. **Capacitación**
   - Material de apoyo en sesiones de inducción
   - Guía de consulta rápida

### Para Super Administradores
1. **Capacitación Inicial**
   - Material obligatorio para nuevos admins
   - Base de conocimiento interna

2. **Referencia Técnica**
   - Documentación de procedimientos
   - Guía de troubleshooting

3. **Onboarding de Equipo**
   - Capacitación de nuevos miembros del equipo técnico
   - Estándares y mejores prácticas

## 🔄 Actualización de Guías

### Cuándo Actualizar

Actualiza las guías cuando:
- Se agreguen nuevas funcionalidades
- Se modifique la interfaz significativamente
- Se cambien procesos importantes
- Se detecten errores o información desactualizada

### Cómo Actualizar

1. **Editar el Markdown**
   ```bash
   # Editar la guía correspondiente
   code .agent/guia-usuario-colaborador.md
   # o
   code .agent/guia-superadministrador.md
   ```

2. **Regenerar HTML**
   ```bash
   python3 .agent/generate_html_guides.py
   ```

3. **Generar nuevo PDF**
   - Seguir las instrucciones de "Generar PDFs"

4. **Actualizar versión**
   - Incrementar número de versión en el documento
   - Actualizar fecha de última modificación

## 📊 Métricas de Calidad

### Guía de Colaborador
- ✅ Lenguaje claro y accesible
- ✅ Ejemplos visuales en cada sección
- ✅ Instrucciones paso a paso
- ✅ FAQ completo
- ✅ Información de soporte

### Guía de Super Admin
- ✅ Documentación técnica completa
- ✅ Ejemplos de código y API
- ✅ Troubleshooting detallado
- ✅ Mejores prácticas de seguridad
- ✅ Checklists operativos

## 🎨 Personalización

### Cambiar Colores

Edita el archivo `generate_html_guides.py`:

```python
files = [
    {
        "color": "#6366f1"  # Color para guía de colaborador
    },
    {
        "color": "#8b5cf6"  # Color para guía de super admin
    }
]
```

### Cambiar Fuente

Modifica la línea de Google Fonts en el template:

```html
<link href="https://fonts.googleapis.com/css2?family=TU_FUENTE:wght@400;600;700;900&display=swap" rel="stylesheet">
```

## 📞 Soporte

Si tienes problemas generando las guías:

1. **Verifica Python**
   ```bash
   python3 --version
   # Debe ser Python 3.6+
   ```

2. **Revisa los archivos Markdown**
   - Asegúrate de que existen
   - Verifica que no tengan errores de sintaxis

3. **Contacta al equipo técnico**
   - Email: tech@ebi360.com
   - Slack: #ebi360-tech

## 📝 Notas Adicionales

- Los archivos HTML son completamente autónomos (no requieren archivos externos)
- Las guías funcionan offline una vez descargadas
- El diseño es print-friendly y optimizado para PDF
- Todos los estilos están inline para máxima compatibilidad

## 🚀 Próximos Pasos

- [ ] Agregar screenshots reales de la plataforma
- [ ] Crear videos tutoriales complementarios
- [ ] Traducir a inglés y portugués
- [ ] Implementar sistema de versionado automático
- [ ] Crear guía para Administradores de Empresa

---

**Última actualización:** Diciembre 2025  
**Versión:** 1.0  
**Mantenido por:** Equipo EBI 360
