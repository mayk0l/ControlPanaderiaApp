# 🚨 Issues Reportados por Kevin - Control Panadería App

> **Fecha reporte:** 21 Enero 2026
> **Última actualización:** 23 Enero 2026
> **Estado:** En progreso

---

## 📋 Estado de Issues

| # | Issue | Estado | Notas |
|---|-------|--------|-------|
| 1 | Turnos Multi-Usuario | ⏸️ Pendiente deploy | Código listo, esperando confirmación |
| 2 | Modal Venta Editable | ✅ Completado | Modal con +/- y eliminar |
| 3 | Acceso sin Turno | ✅ Completado | Gastos muestra historial |
| 4 | Historial Detallado | ✅ Completado | Más info en selector |
| 5 | Gestión Usuarios | 📋 Pendiente | Requiere API admin |

---

## 📋 Listado de Issues

### 🔴 ISSUE-01 | Turnos Multi-Usuario (CRÍTICO)
**Problema:** Los turnos están vinculados a una sola cuenta y se bugean cuando hay múltiples usuarios simultáneos.

**Comportamiento esperado:**
- Cada usuario debe poder abrir su propio turno independiente
- Las ventas de un usuario no deben afectar el turno de otro
- Solo el stock de productos debe ser compartido entre todos

**Cambios necesarios:**
- [ ] Modificar schema para que turnos sean por usuario
- [ ] Ajustar queries de ventas para filtrar por turno del usuario actual
- [ ] Ajustar UI para mostrar solo el turno del usuario logueado
- [ ] Verificar que el stock se actualice globalmente

---

### 🟠 ISSUE-02 | Modal de Venta con Edición
**Problema:** Al realizar una venta de productos (no pan), no hay posibilidad de modificar los items antes de confirmar.

**Comportamiento esperado:**
- Al hacer click en confirmar venta, mostrar un popup/modal
- En el modal se debe poder:
  - Ver todos los productos del carrito
  - Modificar cantidades (+/-)
  - Eliminar productos
  - Ver total actualizado
- Recién al confirmar en el modal, se registra la venta

**Cambios necesarios:**
- [ ] Crear modal de confirmación de venta con lista editable
- [ ] Permitir editar cantidades en el modal
- [ ] Permitir eliminar items en el modal
- [ ] Botón final de confirmar venta

---

### 🟠 ISSUE-03 | Acceso sin Turno Abierto
**Problema:** No se puede ver gastos, turnos anteriores ni reportes si no hay un turno abierto.

**Comportamiento esperado:**
- Poder acceder a las páginas de Gastos, Reportes sin necesidad de turno abierto
- Solo el módulo de ventas (POS) debería requerir turno abierto
- Historial de turnos siempre visible

**Cambios necesarios:**
- [ ] Quitar restricción de turno en página de Gastos
- [ ] Quitar restricción de turno en página de Reportes
- [ ] Mantener restricción solo en funcionalidades de venta

---

### 🟡 ISSUE-04 | Historial de Turnos Detallado
**Problema:** El historial de turnos no muestra suficientes detalles.

**Comportamiento esperado:**
- Ver lista completa de turnos cerrados
- Por cada turno ver:
  - Fecha y hora apertura/cierre
  - Usuario responsable
  - Fondo inicial y final
  - Total ventas PAN y NO PAN
  - Total gastos
  - Diferencia de caja (sobrante/faltante)
  - Utilidad neta del turno

**Cambios necesarios:**
- [ ] Crear vista de historial de turnos en Reportes o Config
- [ ] Mostrar cards con resumen de cada turno
- [ ] Opción de ver detalle completo de un turno

---

### 🟡 ISSUE-05 | Gestión de Usuarios (Admin)
**Problema:** Un admin no puede crear nuevas cuentas ni modificar contraseñas desde la app.

**Comportamiento esperado:**
- Desde Configuración, un admin debe poder:
  - Crear nueva cuenta (nombre, email, contraseña, rol)
  - Cambiar contraseña de usuarios existentes
  - Eliminar usuarios (excepto a sí mismo)
  - Cambiar roles (ya funciona)

**Cambios necesarios:**
- [ ] Agregar botón "Crear Usuario" en lista de usuarios
- [ ] Modal para crear usuario con todos los campos
- [ ] Opción de cambiar contraseña por usuario
- [ ] Botón eliminar usuario (con confirmación)
- [ ] Implementar server actions con Supabase Admin API

---

## 🎯 Prioridad de Resolución

| Prioridad | Issue | Razón |
|-----------|-------|-------|
| 1️⃣ | ISSUE-01 | Crítico - Afecta operación con múltiples usuarios |
| 2️⃣ | ISSUE-02 | Alto - UX de ventas incompleta |
| 3️⃣ | ISSUE-03 | Medio - Bloquea acceso a información |
| 4️⃣ | ISSUE-04 | Bajo - Mejora de visualización |
| 5️⃣ | ISSUE-05 | Bajo - Workaround disponible (Supabase Dashboard) |

---

## 📝 Notas Técnicas

### ISSUE-01 - Turnos Multi-Usuario
El problema actual es que `getCurrentShift()` busca cualquier turno abierto del usuario, pero las ventas pueden estar filtrando incorrectamente. Necesitamos:
1. Verificar que cada usuario solo vea/use su turno
2. Asegurar que las políticas RLS permitan turnos simultáneos
3. El stock de productos es global (tabla `products`) y no necesita cambios

### ISSUE-05 - Supabase Admin API
Para crear usuarios desde la app necesitamos:
1. Usar `supabase.auth.admin.createUser()` (requiere service_role key)
2. Crear un Route Handler API para esto (no se puede usar service_role en cliente)
3. Proteger el endpoint para solo admins

---

*Documento creado: 23 Enero 2026*
