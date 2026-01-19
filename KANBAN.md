# 📋 KANBAN - Control Panadería App

> **Stack:** Next.js 14+ (App Router) + Supabase + Tailwind CSS + Vercel
> 
> **Última actualización:** Enero 2026

---

## 📊 Resumen de Progreso

| Estado | Cantidad |
|--------|----------|
| ✅ Completado | 6 |
| 🔄 En Progreso | 1 |
| 📋 Pendiente | 17 |

---

## ✅ COMPLETADO

- [x] **SETUP-01** | Crear proyecto Next.js 14+ con App Router
  - Usado template `with-supabase`
  - TypeScript, ESLint, Tailwind incluidos
  - Cliente Supabase para Server/Client ya configurado

- [x] **SETUP-03** | Configurar variables de entorno
  - `.env.local` creado con template
  - Documentación de variables incluida

- [x] **SETUP-04** | Configurar Tailwind personalizado
  - Paleta de colores slate/blue
  - Colores success, warning, destructive
  - Animaciones personalizadas
  - Modo oscuro configurado

- [x] **DB-01** | Crear schema de base de datos
  - Archivo `supabase/schema.sql` con todas las tablas
  - RLS y políticas de acceso configuradas
  - Tipos TypeScript en `lib/types/database.ts`
  - Vistas útiles y realtime habilitado

- [x] **LAYOUT-01** | Estructura de carpetas dashboard
  - Route group `(dashboard)` con layout protegido
  - Páginas: pos, gastos, reportes, productos, config
  - Componentes: DashboardShell, Sidebar, MobileNav

- [x] **UI-01** | Componentes UI base personalizados
  - Button, Input, Badge extendidos
  - DashboardCard, FormField, Counter creados
  - StatCard, EmptyState, LoadingSpinner

---

## 🔄 EN PROGRESO

- [ ] **POS-02** | Gestión de turnos
  - Modal abrir turno con monto inicial caja
  - Modal cerrar turno con resumen
  - Estado de turno en header
  - Server actions para turnos

---

## 📋 BACKLOG

### 🏗️ Fase 1: Setup Inicial

- [ ] **SETUP-01** | Crear proyecto Next.js 14+ con App Router
  - `npx create-next-app@latest`
  - Configurar TypeScript, ESLint, Tailwind
  - Estructura de carpetas base

- [ ] **SETUP-02** | Configurar Supabase
  - Crear proyecto en supabase.com
  - Obtener credenciales (URL, anon key)
  - Instalar `@supabase/supabase-js` y `@supabase/ssr`
  - Configurar cliente para Server/Client components

- [ ] **SETUP-03** | Configurar variables de entorno
  - `.env.local` para desarrollo
  - Documentar variables necesarias

- [ ] **SETUP-04** | Configurar Tailwind personalizado
  - Paleta de colores del diseño
  - Componentes base (Card, Button, Input)
  - Modo oscuro

---

### 🗄️ Fase 2: Base de Datos

- [ ] **DB-01** | Crear schema de base de datos
  - Tabla `users` (con Supabase Auth)
  - Tabla `profiles` (datos adicionales del usuario)
  - Tabla `products`
  - Tabla `categories`
  - Tabla `shifts` (turnos)
  - Tabla `expenses` (gastos)
  - Tabla `sales` (ventas)
  - Tabla `sale_items` (items de venta)
  - Tabla `config` (configuración del negocio)

- [ ] **DB-02** | Configurar Row Level Security (RLS)
  - Políticas de acceso por usuario/rol
  - Proteger datos sensibles

- [ ] **DB-03** | Crear migrations SQL
  - Archivo de migración inicial
  - Seeds para datos de prueba

- [ ] **DB-04** | Configurar Realtime
  - Subscripciones para turnos
  - Subscripciones para ventas del día

---

### 🔐 Fase 3: Autenticación

- [ ] **AUTH-01** | Implementar login con Supabase Auth
  - Página de login `/login`
  - Formulario usuario/contraseña
  - Manejo de errores

- [ ] **AUTH-02** | Middleware de protección de rutas
  - Verificar sesión en rutas protegidas
  - Redirección si no autenticado

- [ ] **AUTH-03** | Sistema de roles
  - Verificar rol admin/vendedor
  - Proteger rutas admin

- [ ] **AUTH-04** | Gestión de usuarios (Admin)
  - CRUD de usuarios
  - Asignación de roles

---

### 🛒 Fase 4: Punto de Venta (POS)

- [ ] **POS-01** | Layout principal del dashboard
  - Sidebar (desktop) / Bottom nav (móvil)
  - Header con estado del turno
  - Área de contenido

- [ ] **POS-02** | Gestión de turnos
  - Abrir turno (modal fondo inicial)
  - Cerrar turno (wizard de arqueo)
  - Estado del turno en tiempo real

- [ ] **POS-03** | Contador de bandejas
  - Componente +/- con contador grande
  - Cálculo automático kilos/valor
  - Persistencia en tiempo real

- [ ] **POS-04** | Catálogo de productos (vista venta)
  - Grid de productos por categoría
  - Buscador
  - Agregar al carrito

- [ ] **POS-05** | Carrito de compras
  - Lista de items
  - Ajuste de cantidades
  - Eliminar items
  - Total

- [ ] **POS-06** | Confirmar venta
  - Modal de confirmación
  - Guardar en base de datos
  - Actualizar totales del turno

---

### 💸 Fase 5: Gastos

- [ ] **GASTOS-01** | CRUD de gastos
  - Formulario: descripción, monto, origen, método pago
  - Lista de gastos del turno
  - Editar/Eliminar gastos

---

### 📦 Fase 6: Productos y Categorías

- [ ] **PROD-01** | CRUD de productos
  - Formulario: nombre, precio, costo, categoría
  - Tabla con margen calculado
  - Editar/Eliminar

- [ ] **PROD-02** | CRUD de categorías
  - Crear/Eliminar categorías
  - Asignar a productos

---

### 📊 Fase 7: Reportes

- [ ] **REP-01** | Dashboard de reportes
  - Filtros por período (día/semana/mes)
  - Cards por línea de negocio

- [ ] **REP-02** | Reporte línea PAN
  - Ventas, gastos, utilidad
  - Historial editable

- [ ] **REP-03** | Reporte línea PRODUCTOS
  - Ventas, COGS, gastos, utilidad
  - Historial editable

- [ ] **REP-04** | Reporte consolidado
  - Utilidad neta total

---

### ⚙️ Fase 8: Configuración

- [ ] **CONFIG-01** | Parámetros del pan
  - Kilos por bandeja
  - Precio por kilo

- [ ] **CONFIG-02** | Tema claro/oscuro
  - Toggle con persistencia

- [ ] **CONFIG-03** | Historial de turnos (admin)
  - Lista de turnos pasados
  - Cierre remoto

---

### 🚀 Fase 9: Deploy

- [ ] **DEPLOY-01** | Configurar Vercel
  - Conectar repositorio
  - Variables de entorno en Vercel
  - Dominio personalizado

- [ ] **DEPLOY-02** | Testing final
  - Probar flujo completo
  - Verificar móvil/desktop
  - Verificar modo oscuro

---

## 📝 Notas Técnicas

### Comandos útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Supabase CLI (opcional)
npx supabase init
npx supabase db push
```

### Links de documentación

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

### Credenciales (NO COMMITEAR)

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 🎯 Prioridades

1. **MVP Mínimo:** Login + POS + Turnos + Ventas
2. **Iteración 2:** Gastos + Productos
3. **Iteración 3:** Reportes + Configuración
4. **Iteración 4:** Polish + Deploy

---

*Creado: Enero 2026 | Proyecto: Control Panadería App*
