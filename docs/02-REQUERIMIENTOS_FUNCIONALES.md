# 📋 Requerimientos Funcionales

## RF-01: Autenticación y Usuarios

### RF-01.1: Inicio de Sesión
- El sistema debe permitir el acceso mediante usuario y contraseña
- Debe mostrar mensajes de error claros ante credenciales incorrectas
- Debe ocultar/mostrar la contraseña con un toggle visual

### RF-01.2: Gestión de Usuarios (Admin)
- Crear nuevos usuarios con nombre, username, contraseña y rol
- Eliminar usuarios existentes
- Visualizar lista de todos los usuarios del sistema
- Roles disponibles: `admin` y `vendedor`

### RF-01.3: Control de Sesión
- Cerrar sesión desde cualquier vista
- Mostrar información del usuario actual (nombre, rol)

---

## RF-02: Gestión de Turnos

### RF-02.1: Apertura de Turno
- Registrar el fondo inicial de caja (dinero de apertura)
- Asociar el turno al usuario que lo abre
- Registrar fecha y hora de apertura
- Solo puede existir un turno abierto a la vez

### RF-02.2: Durante el Turno
- Visualizar estado actual del turno (ABIERTO/CERRADO)
- Mostrar nombre del responsable del turno
- Actualizar en tiempo real las métricas del turno

### RF-02.3: Cierre de Turno (Arqueo)
**Paso 1 - Ajuste de Producción:**
- Mostrar bandejas registradas durante el turno
- Permitir ajustes (+/-) por mermas o errores
- Registrar motivo del ajuste

**Paso 2 - Arqueo de Caja:**
- Mostrar resumen de: fondo inicial, ventas, gastos
- Calcular el "esperado" en caja
- Ingresar el dinero contado real
- Calcular y mostrar diferencia (sobrante/faltante)

**Paso 3 - Confirmación:**
- Resumen final antes de confirmar cierre
- Guardar toda la información del turno cerrado

### RF-02.4: Historial de Turnos (Admin)
- Visualizar histórico de turnos pasados
- Ver responsable, fecha, estado de cada turno
- Opción de cierre remoto/forzado de turnos abiertos

---

## RF-03: Punto de Venta (POS)

### RF-03.1: Control de Bandejas de Pan
- Contador visual de bandejas sacadas (+/-)
- Cálculo automático de kilos estimados (bandejas × kilos por bandeja)
- Cálculo automático de venta estimada (kilos × precio por kilo)
- Bloqueo del contador si el turno está cerrado

### RF-03.2: Ventas de Productos (No Pan)
- Búsqueda de productos por nombre
- Productos agrupados por categoría
- Añadir productos al carrito con un tap/click
- Carrito con:
  - Lista de productos agregados
  - Cantidad por producto
  - Subtotal por línea
  - Total general
  - Opción de eliminar items individuales
  - Opción de limpiar carrito completo

### RF-03.3: Confirmación de Venta
- Modal de revisión antes de confirmar
- Posibilidad de ajustar cantidades
- Registro de venta con fecha/hora
- Acumulación al total del turno

### RF-03.4: Panel de Resumen del Turno
- Fondo inicial
- Ventas NO PAN acumuladas
- Ventas PAN estimadas
- Gastos desde caja
- Teórico en caja (calculado)
- Utilidad neta del turno

---

## RF-04: Gestión de Gastos

### RF-04.1: Registro de Gastos
- Descripción del gasto
- Monto
- Origen/Clasificación:
  - `GENERAL`: Gastos generales del negocio
  - `PAN`: Insumos para producción de pan
  - `NO_PAN`: Insumos para otros productos
- Método de pago:
  - Efectivo de caja (afecta arqueo)
  - Transferencia/Otro (no afecta caja física)

### RF-04.2: Historial de Gastos
- Lista de gastos del turno actual
- Visualización de descripción, origen, método, monto
- Edición de gastos existentes
- Eliminación de gastos

---

## RF-05: Catálogo de Productos

### RF-05.1: Gestión de Productos
- Crear producto nuevo con:
  - Nombre comercial
  - Precio de venta
  - Costo unitario
  - Categoría
- Editar productos existentes
- Eliminar productos
- Visualizar margen de ganancia (%)

### RF-05.2: Gestión de Categorías
- Crear nuevas categorías
- Eliminar categorías vacías
- Asignar/cambiar categoría de productos
- Crear categoría directamente al crear producto

---

## RF-06: Reportes y Análisis

### RF-06.1: Filtros de Período
- Hoy (día actual)
- Semana (lunes a domingo de la semana actual)
- Mes (mes calendario actual)

### RF-06.2: Reporte Línea PAN
- Total de ventas de pan (estimado)
- Gastos directos (insumos pan)
- Utilidad de la línea PAN
- Historial diario con opción de edición

### RF-06.3: Reporte Línea PRODUCTOS
- Total de ventas de productos
- Costo de mercadería vendida (COGS)
- Gastos directos (insumos productos)
- Utilidad de la línea de productos
- Historial diario con opción de edición

### RF-06.4: Reporte Consolidado
- Utilidad operativa (PAN + PRODUCTOS)
- Gastos generales
- **Utilidad neta del negocio**
- Historial consolidado

### RF-06.5: Historial Editable (Admin)
- Edición de valores históricos (bandejas, ventas)
- Corrección de errores pasados

---

## RF-07: Configuración del Sistema

### RF-07.1: Parámetros de Pan
- Kilos por bandeja (valor configurable)
- Precio por kilo (valor configurable)
- Guardar cambios de configuración

### RF-07.2: Apariencia
- Modo claro / Modo oscuro
- Persistencia de preferencia

---

*Documento de requerimientos funcionales - Versión 1.0*
