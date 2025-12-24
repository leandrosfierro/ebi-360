# 📋 Plantilla de Excel para Encuestas - EBI 360
## Guía de Uso y Formato

---

## 📄 Estructura del Archivo

El archivo Excel debe tener **3 hojas** obligatorias:

1. **Metadata** - Información general de la encuesta
2. **Questions** - Listado de preguntas
3. **Algorithm** - Configuración del algoritmo de cálculo

---

## 📊 Hoja 1: "Metadata"

### Formato

| Campo | Valor | Tipo | Obligatorio | Descripción |
|-------|-------|------|-------------|-------------|
| Código | NOM035 | Texto | ✅ | Código único (sin espacios, mayúsculas) |
| Nombre | NOM-035 STPS 2018 | Texto | ✅ | Nombre completo de la encuesta |
| Descripción | Identificación y análisis de factores de riesgo psicosocial | Texto | ✅ | Descripción breve |
| Tipo | regulatory | Texto | ✅ | base / regulatory / custom |
| País | MX | Texto | ❌ | Código ISO 2 letras (MX, CL, AR, etc.) |
| Normativa | NOM-035-STPS-2018 | Texto | ❌ | Nombre oficial de la normativa |
| Versión | 1.0 | Texto | ✅ | Versión de la encuesta |
| Es Base | NO | SI/NO | ✅ | Solo SI para EBI360 |
| Es Obligatoria | SI | SI/NO | ✅ | Si es obligatoria para empresas |

### Ejemplo Real

```
┌─────────────────┬───────────────────────────────────────────────────┐
│ Campo           │ Valor                                             │
├─────────────────┼───────────────────────────────────────────────────┤
│ Código          │ NOM035                                            │
│ Nombre          │ NOM-035 STPS 2018                                │
│ Descripción     │ Identificación y análisis de factores de riesgo  │
│                 │ psicosocial y evaluación del entorno organizacional│
│ Tipo            │ regulatory                                        │
│ País            │ MX                                                │
│ Normativa       │ NOM-035-STPS-2018                                │
│ Versión         │ 1.0                                               │
│ Es Base         │ NO                                                │
│ Es Obligatoria  │ SI                                                │
└─────────────────┴───────────────────────────────────────────────────┘
```

---

## 📊 Hoja 2: "Questions"

### Formato de Columnas

| # | Columna | Tipo | Obligatorio | Valores Permitidos | Descripción |
|---|---------|------|-------------|--------------------|-------------|
| A | Número | Entero | ✅ | 1, 2, 3, ... | Número de pregunta (secuencial) |
| B | Dominio | Texto | ✅ | Cualquier texto | Dimensión o categoría |
| C | Constructo | Texto | ❌ | Cualquier texto | Subcategoría o tema |
| D | Tipo | Texto | ✅ | RP, FO, MIXED | Tipo de pregunta |
| E | Pregunta | Texto | ✅ | Cualquier texto | Texto de la pregunta |
| F | Peso | Decimal | ✅ | 0.0 - 1.0 | Peso en el cálculo |
| G | Severidad | Decimal | ✅ | 0.0 - 1.0 | Nivel de severidad |
| H | Peso_Personal | Decimal | ✅ | 0.0 - 1.0 | Peso responsabilidad personal |
| I | Peso_Org | Decimal | ✅ | 0.0 - 1.0 | Peso factor organizacional |

### Tipos de Pregunta

- **RP** (Responsabilidad Personal): Depende del individuo
- **FO** (Factor Organizacional): Depende de la organización
- **MIXED**: Combinación de ambos

### Ejemplo de Datos

```
┌───┬─────────────┬──────────────────┬──────┬────────────────────────────────┬──────┬──────────┬──────────────┬─────────┐
│ # │ Dominio     │ Constructo       │ Tipo │ Pregunta                       │ Peso │ Severidad│ Peso_Personal│ Peso_Org│
├───┼─────────────┼──────────────────┼──────┼────────────────────────────────┼──────┼──────────┼──────────────┼─────────┤
│ 1 │ Físico      │ Bienestar básico │ RP   │ ¿Dormís lo suficiente?         │ 0.6  │ 0.9      │ 1.0          │ 0.0     │
│ 2 │ Físico      │ Bienestar básico │ FO   │ ¿Tu jornada permite descanso?  │ 0.6  │ 0.9      │ 0.0          │ 1.0     │
│ 3 │ Físico      │ Cuidado diario   │ RP   │ ¿Te movés durante la jornada?  │ 0.4  │ 0.8      │ 1.0          │ 0.0     │
│ 4 │ Físico      │ Cuidado diario   │ FO   │ ¿Hay espacios para pausas?     │ 0.4  │ 0.8      │ 0.0          │ 1.0     │
│ 5 │ Emocional   │ Gestión emocional│ RP   │ ¿Manejás bien el estrés?       │ 0.7  │ 0.9      │ 1.0          │ 0.0     │
│ 6 │ Emocional   │ Gestión emocional│ FO   │ ¿Hay apoyo emocional?          │ 0.7  │ 0.9      │ 0.0          │ 1.0     │
└───┴─────────────┴──────────────────┴──────┴────────────────────────────────┴──────┴──────────┴──────────────┴─────────┘
```

---

## 📊 Hoja 3: "Algorithm"

### Formato JSON

Esta hoja contiene **una sola celda** (A1) con un JSON que define el algoritmo de cálculo.

### Estructura del JSON

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
    },
    {
      "name": "Social",
      "weight": 1.0,
      "questions": [13, 14, 15, 16, 17, 18]
    },
    {
      "name": "Profesional",
      "weight": 1.0,
      "questions": [19, 20, 21, 22, 23, 24]
    },
    {
      "name": "Intelectual",
      "weight": 1.0,
      "questions": [25, 26, 27, 28, 29, 30]
    },
    {
      "name": "Financiero",
      "weight": 1.0,
      "questions": [31, 32, 33, 34, 35, 36]
    }
  ],
  "thresholds": {
    "low": 0,
    "medium": 5,
    "high": 7,
    "excellent": 9
  },
  "recommendations": {
    "low": "Requiere atención urgente",
    "medium": "Área de oportunidad",
    "high": "Buen nivel, mantener",
    "excellent": "Excelente, ejemplo a seguir"
  }
}
```

### Campos del Algoritmo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `scoring_method` | String | Método de cálculo: "weighted_average", "sum", "custom" |
| `domains` | Array | Lista de dominios con sus configuraciones |
| `domains[].name` | String | Nombre del dominio (debe coincidir con hoja Questions) |
| `domains[].weight` | Number | Peso del dominio en el cálculo global (0.0 - 1.0) |
| `domains[].questions` | Array | Números de preguntas que pertenecen a este dominio |
| `thresholds` | Object | Umbrales para clasificación de puntajes |
| `recommendations` | Object | Mensajes según nivel de puntaje |

---

## ✅ Validaciones Automáticas

El sistema validará automáticamente:

### Validaciones de Metadata

- ✅ Código único (no existe otra encuesta con ese código)
- ✅ Código sin espacios ni caracteres especiales
- ✅ Tipo válido (base, regulatory, custom)
- ✅ País en formato ISO (2 letras)
- ✅ Versión en formato X.Y
- ✅ Solo una encuesta puede ser "Base"

### Validaciones de Questions

- ✅ Números secuenciales (1, 2, 3, ...)
- ✅ Sin números duplicados
- ✅ Tipo válido (RP, FO, MIXED)
- ✅ Pesos entre 0.0 y 1.0
- ✅ Suma de Peso_Personal + Peso_Org = 1.0
- ✅ Texto de pregunta no vacío
- ✅ Dominio no vacío

### Validaciones de Algorithm

- ✅ JSON válido
- ✅ Todos los dominios existen en Questions
- ✅ Todas las preguntas están asignadas a un dominio
- ✅ No hay preguntas duplicadas en dominios
- ✅ Suma de weights de dominios = número de dominios (si weighted_average)
- ✅ Thresholds en orden ascendente

---

## ❌ Errores Comunes

### Error 1: Código Duplicado

```
❌ ERROR: El código "NOM035" ya existe en el sistema.
   Solución: Usar un código diferente o incrementar versión.
```

### Error 2: Pregunta sin Dominio

```
❌ ERROR: Pregunta #15 no tiene dominio asignado.
   Solución: Completar la columna "Dominio" en la fila 15.
```

### Error 3: Pesos Incorrectos

```
❌ ERROR: Pregunta #8 - Peso_Personal (0.6) + Peso_Org (0.6) ≠ 1.0
   Solución: Ajustar los pesos para que sumen exactamente 1.0
```

### Error 4: JSON Inválido

```
❌ ERROR: El algoritmo no es un JSON válido.
   Línea 5: Falta coma después de "weight": 1.0
   Solución: Validar JSON en jsonlint.com
```

### Error 5: Pregunta No Asignada

```
❌ ERROR: Pregunta #23 no está asignada a ningún dominio en el algoritmo.
   Solución: Agregar el número 23 al array "questions" de un dominio.
```

---

## 📝 Ejemplo Completo: NOM-035

### Archivo: `NOM035_v1.0.xlsx`

#### Metadata
```
Código: NOM035
Nombre: NOM-035 STPS 2018
Descripción: Factores de riesgo psicosocial en el trabajo
Tipo: regulatory
País: MX
Normativa: NOM-035-STPS-2018
Versión: 1.0
Es Base: NO
Es Obligatoria: SI
```

#### Questions (primeras 6 de 72)
```
1 | Condiciones ambiente | Iluminación      | FO | ¿La iluminación es adecuada?           | 0.5 | 0.7 | 0.0 | 1.0
2 | Condiciones ambiente | Temperatura      | FO | ¿La temperatura es confortable?        | 0.5 | 0.7 | 0.0 | 1.0
3 | Condiciones ambiente | Ruido            | FO | ¿El ruido permite concentración?       | 0.6 | 0.8 | 0.0 | 1.0
4 | Carga de trabajo     | Volumen          | FO | ¿El volumen de trabajo es razonable?   | 0.8 | 0.9 | 0.0 | 1.0
5 | Carga de trabajo     | Ritmo            | FO | ¿El ritmo de trabajo es sostenible?    | 0.8 | 0.9 | 0.0 | 1.0
6 | Carga de trabajo     | Autonomía        | RP | ¿Tienes control sobre tu trabajo?      | 0.7 | 0.8 | 1.0 | 0.0
```

#### Algorithm
```json
{
  "scoring_method": "weighted_average",
  "domains": [
    {
      "name": "Condiciones ambiente",
      "weight": 1.0,
      "questions": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
      "name": "Carga de trabajo",
      "weight": 1.2,
      "questions": [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
    },
    {
      "name": "Falta de control",
      "weight": 1.1,
      "questions": [28, 29, 30, 31, 32, 33, 34, 35, 36, 37]
    },
    {
      "name": "Jornada de trabajo",
      "weight": 1.0,
      "questions": [38, 39, 40, 41, 42, 43, 44, 45]
    },
    {
      "name": "Interferencia trabajo-familia",
      "weight": 0.9,
      "questions": [46, 47, 48, 49, 50, 51]
    },
    {
      "name": "Liderazgo",
      "weight": 1.3,
      "questions": [52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63]
    },
    {
      "name": "Relaciones en el trabajo",
      "weight": 1.1,
      "questions": [64, 65, 66, 67, 68, 69, 70, 71, 72]
    }
  ],
  "thresholds": {
    "nulo": 0,
    "bajo": 15,
    "medio": 30,
    "alto": 45,
    "muy_alto": 60
  },
  "recommendations": {
    "nulo": "Sin riesgo psicosocial",
    "bajo": "Riesgo bajo - Monitorear",
    "medio": "Riesgo medio - Implementar acciones",
    "alto": "Riesgo alto - Acciones urgentes",
    "muy_alto": "Riesgo muy alto - Intervención inmediata"
  }
}
```

---

## 🎯 Mejores Prácticas

### 1. Nomenclatura de Códigos

✅ **Bueno:**
- `EBI360`
- `NOM035`
- `LEY_KARIN`
- `CLIMA_2025`

❌ **Malo:**
- `nom-035` (minúsculas)
- `Ley Karin` (espacios)
- `NOM 035 STPS` (espacios)
- `encuesta_1` (poco descriptivo)

### 2. Organización de Dominios

✅ **Bueno:**
- Agrupar preguntas relacionadas
- Máximo 6-8 dominios
- Nombres claros y descriptivos

❌ **Malo:**
- Demasiados dominios (>10)
- Nombres genéricos ("Categoría 1")
- Dominios con 1-2 preguntas

### 3. Balance de Preguntas

✅ **Bueno:**
- 5-10 preguntas por dominio
- Balance entre RP y FO
- Total 30-80 preguntas

❌ **Malo:**
- Dominios con 1 pregunta
- Solo preguntas RP o solo FO
- Más de 100 preguntas (fatiga)

### 4. Pesos y Severidad

✅ **Bueno:**
- Usar escala completa (0.1 - 1.0)
- Diferenciar importancia
- Documentar criterios

❌ **Malo:**
- Todo peso 1.0 (no diferencia)
- Valores arbitrarios
- Sin justificación

---

## 📥 Descarga de Plantilla

### Plantillas Disponibles

1. **Plantilla Básica** - `plantilla_encuesta_basica.xlsx`
   - Estructura mínima
   - Ejemplo con 12 preguntas
   - Ideal para empezar

2. **Plantilla EBI 360** - `plantilla_ebi360.xlsx`
   - Encuesta base completa
   - 36 preguntas en 6 dominios
   - Referencia de buenas prácticas

3. **Plantilla NOM-035** - `plantilla_nom035.xlsx`
   - Encuesta regulatoria completa
   - 72 preguntas
   - Ejemplo de normativa mexicana

---

## 🔄 Proceso de Actualización

### Actualizar Encuesta Existente

1. **Descargar versión actual**
   - Exportar desde panel de Super Admin
   - Archivo: `[CODIGO]_v[VERSION_ACTUAL].xlsx`

2. **Modificar**
   - Hacer cambios necesarios
   - Incrementar versión en Metadata
   - Validar formato

3. **Subir nueva versión**
   - Upload en panel de Super Admin
   - Sistema detecta versión nueva
   - Crea nueva entrada en BD

4. **Activar**
   - Revisar vista previa
   - Publicar nueva versión
   - Versión anterior queda archivada

### Versionado Semántico

```
v1.0 - Versión inicial
v1.1 - Cambios menores (correcciones, ajustes)
v2.0 - Cambios mayores (nuevas preguntas, dominios)
```

---

## 📞 Soporte

Si tienes dudas sobre el formato:

1. **Revisar esta guía**
2. **Descargar plantilla de ejemplo**
3. **Validar en el sistema** (te mostrará errores específicos)
4. **Contactar soporte:** tech@ebi360.com

---

**Última actualización:** Diciembre 2025  
**Versión de la guía:** 1.0
