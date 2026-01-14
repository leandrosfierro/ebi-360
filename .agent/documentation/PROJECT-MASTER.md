# Proyecto EBI 360 - Bienestar Integral
## Visión General del Proyecto
EBI 360 es una plataforma SaaS diseñada para monitorear, diagnosticar y mejorar el bienestar integral de los colaboradores dentro de diversas organizaciones. Utiliza un enfoque basado en la "Rueda de Bienestar" y sistemas de diagnósticos modulares para proporcionar planes de acción personalizados impulsados por IA.

---

## 📂 Estructura de Documentación Técnica
- [**Génesis y Evolución**](./PROJECT-EVOLUTION.md): De dónde venimos (Excel/Algoritmo) y cómo llegamos hasta aquí.
- [**Backlog Histórico (Step-by-Step)**](./backlog/HISTORICAL-BACKLOG.md): Hoja de ruta técnica detallada desde el día 0 hasta el estado actual.
- [**Flujos de Usuario y de Trabajo**](./flows/USER-FLOWS.md): Análisis detallado de los caminos que siguen los distintos roles.
- [**Backlog de Upgrades y Roadmap**](./backlog/TECHNICAL-BACKLOG.md): Funcionalidades actuales y planes futuros.
- [**Reglas de Negocio**](./business-rules/BUSINESS-RULES.md): Definición de parámetros, lógica de cálculos y permisos.

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
