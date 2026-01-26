# 🥐 Control Panadería App

Sistema integral de gestión para panaderías - Control de ventas, producción, gastos y análisis financiero.

![Status](https://img.shields.io/badge/status-producción-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Docs](https://img.shields.io/badge/docs-disponible-blue)

---

## 📋 Descripción

**Control Panadería App** es una aplicación diseñada para resolver los desafíos únicos de gestión en panaderías pequeñas y medianas. El sistema permite controlar las operaciones diarias del negocio, desde el punto de venta hasta el análisis de rentabilidad.

### Características Principales

- 🛒 **Terminal de Venta (POS)** - Registro rápido de ventas de productos
- 🍞 **Control de Producción** - Seguimiento de bandejas de pan con cálculo automático de kilos y valor
- 💰 **Gestión de Turnos** - Apertura y cierre con arqueo de caja
- 📊 **Reportes Financieros** - Análisis de utilidad por línea de negocio (PAN vs Productos)
- 📈 **Resumen Semanal/Mensual** - Totales de venta Pan y Productos por separado con detalle diario
- 📦 **Catálogo de Productos** - Gestión con costos, precios y márgenes
- 💸 **Control de Gastos** - Clasificación por origen (General, PAN, Productos)
- 👥 **Multi-usuario** - Roles de administrador y vendedor
- 🌙 **Modo Oscuro** - Interfaz moderna y adaptable
- 📱 **Responsive** - Funciona en móvil, tablet y escritorio

---

## 🚀 Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Next.js 15** | Framework React con App Router |
| **TypeScript** | Tipado estático |
| **Supabase** | Base de datos PostgreSQL + Auth |
| **Tailwind CSS** | Estilos |
| **Lucide React** | Iconos |

---

## 📚 Documentación

Toda la documentación del proyecto se encuentra en la carpeta [`/docs`](./docs/):

| Documento | Descripción |
|-----------|-------------|
| [Visión General](./docs/01-VISION_GENERAL.md) | Objetivos y alcance del proyecto |
| [Requerimientos Funcionales](./docs/02-REQUERIMIENTOS_FUNCIONALES.md) | Funcionalidades del sistema |
| [Requerimientos No Funcionales](./docs/03-REQUERIMIENTOS_NO_FUNCIONALES.md) | Criterios de calidad |
| [Modelo de Datos](./docs/04-MODELO_DE_DATOS.md) | Entidades y relaciones |
| [Diseño UI](./docs/05-DISEÑO_UI.md) | Vistas y componentes |
| [Glosario](./docs/06-GLOSARIO.md) | Términos del dominio |

---

## 🏗️ Estado del Proyecto

| Fase | Estado |
|------|--------|
| ✅ Maqueta/Prototipo | Completada |
| ✅ Documentación | Completada |
| ✅ Definición de Stack | Completada |
| ✅ Desarrollo | **Completado** |
| ✅ Testing | Completado |
| ✅ Despliegue | Completado |

### 🎉 Proyecto en Producción

El proyecto ha sido completado exitosamente y se encuentra en **fase de mantenimiento**.

---

## 🛠️ Instalación y Desarrollo

```bash
# Clonar el repositorio
git clone <repo-url>

# Ir a la carpeta de la app
cd app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con las credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=<tu-url-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

---

## 📁 Estructura del Proyecto

```
ControlPanaderiaApp/
├── app/                     # Código fuente de la aplicación
│   ├── app/                # Rutas de Next.js (App Router)
│   │   ├── (dashboard)/    # Vistas protegidas del dashboard
│   │   ├── auth/           # Autenticación
│   │   └── api/            # API routes
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes UI base
│   │   ├── pos/           # Terminal de venta
│   │   ├── reports/       # Reportes y análisis
│   │   ├── products/      # Gestión de productos
│   │   ├── expenses/      # Control de gastos
│   │   └── shifts/        # Gestión de turnos
│   ├── lib/               # Utilidades y lógica
│   │   ├── actions/       # Server Actions
│   │   ├── supabase/      # Cliente Supabase
│   │   └── types/         # Tipos TypeScript
│   └── supabase/          # Schema SQL
├── docs/                   # Documentación del proyecto
└── README.md              # Este archivo
```

---

## 🔧 Mantenimiento

### Reiniciar Datos de Ventas

Para reiniciar solo los datos de ventas (sin afectar productos, categorías o usuarios), ejecutar las siguientes queries en el **SQL Editor de Supabase**:

```sql
-- ⚠️ ADVERTENCIA: Esto eliminará TODOS los datos de ventas

-- 1. Eliminar items de venta
DELETE FROM sale_items;

-- 2. Eliminar ventas
DELETE FROM sales;

-- 3. Eliminar gastos
DELETE FROM expenses;

-- 4. Eliminar turnos (esto reseteará todo el historial)
DELETE FROM shifts;
```

**Opcional**: Si solo quieres eliminar ventas pero mantener turnos y gastos:

```sql
-- Solo eliminar ventas, mantener turnos
DELETE FROM sale_items;
DELETE FROM sales;
UPDATE shifts SET ventas_no_pan = 0;
```

### Respaldo de Datos

Antes de cualquier operación de limpieza, se recomienda hacer un respaldo desde el dashboard de Supabase en **Settings > Database > Backups**.

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados.

---

<p align="center">
  <sub>Proyecto completado en Enero 2026 • En fase de mantenimiento</sub>
</p>
