# 🎨 Diseño de Interfaz de Usuario

Este documento describe las vistas y flujos de usuario de la aplicación.

---

## Arquitectura de Navegación

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN                                   │
│                  (Autenticación)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   APLICACIÓN PRINCIPAL                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    SIDEBAR / NAV                         ││
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              ││
│  │  │Venta│ │Gast.│ │Repo.│ │Prod.│ │Conf.│              ││
│  │  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘              ││
│  └─────┼───────┼───────┼───────┼───────┼────────────────────┘│
│        │       │       │       │       │                     │
│        ▼       ▼       ▼       ▼       ▼                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    CONTENIDO                            ││
│  │                 (Vista Activa)                          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Vista 1: Login

### Descripción
Pantalla de autenticación. Es la puerta de entrada al sistema.

### Elementos
- Logo/Icono de la aplicación
- Título: "Panadería Cloud"
- Subtítulo: "Sistema Integral de Gestión"
- Campo de usuario
- Campo de contraseña con toggle de visibilidad
- Botón "Entrar al Sistema"
- Mensaje de error (condicional)

### Comportamiento
- Al autenticar exitosamente → Navegar a vista POS
- Usuario admin → Acceso a todas las vistas
- Usuario vendedor → Solo acceso a vista POS

---

## Vista 2: Terminal de Venta (POS)

### Descripción
Vista principal para operaciones diarias. Dividida en secciones para venta de productos y control de pan.

### Layout (2 columnas en desktop, stack en móvil)

**Columna Izquierda: Catálogo y Carrito**
- Buscador de productos
- Productos agrupados por categoría
- Cada producto muestra: nombre y precio
- Al hacer tap: se agrega al carrito
- Carrito:
  - Lista de items (nombre, cantidad, subtotal)
  - Botón eliminar por item
  - Botón limpiar todo
  - Total
  - Botón "Confirmar Venta"

**Columna Derecha: Pan y Resumen**
- **Card Bandejas de Pan:**
  - Botón (-) | Contador | Botón (+)
  - Kilos estimados
  - Venta estimada
  
- **Card Panel de Turno:**
  - Fondo inicial
  - Ventas NO PAN
  - Ventas PAN (estimado)
  - Gastos caja
  - Separador
  - Teórico en caja
  - Utilidad neta (destacado)
  - Botón Abrir/Cerrar Turno

### Estados
- **Turno Cerrado:** Overlay de bloqueo sobre áreas de venta. Solo visible el botón para abrir turno.
- **Turno Abierto:** Funcionalidad completa habilitada.

### Modales
1. **Modal Apertura de Turno:** Campo para fondo inicial
2. **Modal Confirmación de Venta:** Lista de productos con ajuste de cantidad
3. **Modal Cierre de Turno:** Wizard de 3 pasos (ver RF-02.3)

---

## Vista 3: Control de Gastos

### Descripción
Gestión de gastos del turno actual.

### Layout (2 columnas en desktop)

**Columna Principal: Historial**
- Tabla con columnas:
  - Descripción
  - Origen (badge con color)
  - Método de pago
  - Monto
  - Acciones (editar, eliminar)

**Columna Lateral: Formulario**
- Campo descripción
- Campo monto
- Select de origen (General, PAN, NO_PAN)
- Checkbox "Pagado con efectivo"
- Botón Registrar/Actualizar

### Estados
- Formulario en modo edición: borde destacado, botón "Actualizar"

---

## Vista 4: Reportes (Business Intelligence)

### Descripción
Dashboard de análisis financiero con filtros por período.

### Layout

**Header: Selector de Período**
- Tabs: Hoy | Semana | Mes

**Grid de 3 columnas:**

1. **Card Línea PAN**
   - Ventas
   - Gastos directos
   - Utilidad PAN
   - Botón "Historial"

2. **Card Línea PRODUCTOS**
   - Ventas
   - Costo mercadería
   - Gastos directos
   - Utilidad Productos
   - Botón "Historial"

3. **Card Consolidado**
   - Utilidad operativa
   - Gastos generales
   - **Utilidad Neta** (destacado grande)
   - Botón "Historial"

### Modales
- **Modal Historial:** Tabla detallada por día con opción de edición

---

## Vista 5: Catálogo de Productos

### Descripción
Gestión del catálogo maestro de productos y categorías.

### Layout

**Header:**
- Título y descripción
- Botón "Categorías"
- Botón "Nuevo Producto"

**Grid (2 columnas en desktop):**

**Columna Principal: Tabla de Productos**
- Columnas: Producto (nombre + precio), Categoría (badge), Margen (% con indicador visual), Acciones
- Hover: opciones de editar/eliminar

**Columna Lateral: Lista de Categorías**
- Cards por cada categoría
- Hover: opción eliminar

### Modales
1. **Modal Nueva Categoría:** Campo nombre + botón crear
2. **Modal Producto:** Formulario completo con opción de crear categoría inline

---

## Vista 6: Configuración

### Descripción
Ajustes del sistema y gestión de usuarios.

### Layout (Cards apiladas)

1. **Card Apariencia**
   - Toggle Modo Claro/Oscuro con iconos

2. **Grid 2 columnas:**
   - **Card Parámetros PAN:** Campos kilos/bandeja y precio/kilo + Guardar
   - **Card Agregar Usuario:** Formulario nombre, username, password, rol + Crear

3. **Grid 2 columnas:**
   - **Card Usuarios del Sistema:** Tabla con nombre, username, rol, acciones
   - **Card Historial de Turnos:** Tabla con fecha, responsable, estado, acción (cerrar remoto)

---

## Componentes Reutilizables

### Card
Contenedor base con título opcional, borde redondeado, sombra sutil.

### Button
Variantes: primary, secondary, danger, success, outline
Tamaños: normal, small
Props: icono, full-width, disabled

### FormInput
Label superior, input con fondo claro, estados de focus

### Badge/Chip
Para estados y categorías, con colores por tipo

### Modal
Overlay oscuro, card centrada, header con título y botón cerrar

---

## Paleta de Colores (Sistema de Diseño)

| Uso              | Claro          | Oscuro         |
|------------------|----------------|----------------|
| Primario         | blue-600       | blue-500       |
| Éxito            | emerald-500    | emerald-400    |
| Peligro          | red-500        | red-400        |
| Advertencia      | amber-500      | amber-400      |
| Fondo            | slate-50       | slate-900      |
| Card             | white          | slate-800      |
| Texto principal  | slate-900      | white          |
| Texto secundario | slate-500      | slate-400      |
| Bordes           | slate-200      | slate-700      |

---

*Documento de diseño UI - Versión 1.0*
