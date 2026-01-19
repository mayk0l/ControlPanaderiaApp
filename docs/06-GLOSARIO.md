# 📖 Glosario de Términos

Este documento define los términos específicos del dominio de negocio utilizados en el sistema.

---

## Términos del Negocio

### Bandeja
Unidad de producción de pan. Cada bandeja contiene una cantidad específica de kilos de pan (configurable en el sistema). Es la unidad base para calcular la producción y venta estimada de pan.

### Arqueo de Caja
Proceso de cierre de turno donde se cuenta el dinero físico en caja y se compara con el monto teórico esperado. Permite detectar diferencias (sobrantes o faltantes).

### Fondo Inicial / Fondo de Caja
Cantidad de dinero con la que se inicia un turno. Sirve como base para dar cambio y se suma al cálculo del dinero esperado al cierre.

### Turno
Período de trabajo que va desde la apertura de caja hasta el cierre. Durante un turno se registran todas las ventas, gastos y producción de pan.

### Merma
Pérdida de producto que no se logró vender. En el contexto del pan, representa bandejas que se produjeron pero no se vendieron (por daño, vencimiento, etc.).

### COGS (Cost of Goods Sold)
Costo de los bienes vendidos. Representa el costo de adquisición de los productos que se vendieron, usado para calcular la ganancia real.

---

## Términos de Productos

### Producto NO-PAN
Cualquier producto vendido que no sea pan: bebidas, pasteles, snacks, etc. Se registran individualmente en el carrito de venta.

### Producto PAN
El pan producido en la panadería. Se registra mediante el contador de bandejas y se calcula su valor según los parámetros de configuración.

### Categoría
Agrupación lógica de productos para mejor organización visual y gestión del catálogo.

### Margen de Ganancia
Porcentaje de utilidad sobre el precio de venta. Se calcula como: `((Precio - Costo) / Precio) × 100`

---

## Términos de Gastos

### Gasto GENERAL
Gasto que afecta al negocio en general y no puede atribuirse a una línea específica. Ejemplos: servicios básicos, arriendo, sueldos.

### Gasto PAN
Gasto directamente relacionado con la producción de pan. Ejemplos: harina, levadura, manteca, gas para hornos.

### Gasto NO-PAN
Gasto relacionado con la compra de productos para reventa. Ejemplos: reposición de bebidas, snacks, productos externos.

### Pago desde Caja
Gasto pagado con el efectivo disponible en la caja. Afecta el arqueo y el cálculo del dinero esperado al cierre.

---

## Términos Financieros

### Venta Bruta
Total de ingresos por ventas sin descontar costos ni gastos.

### Utilidad Operativa
Ganancia después de descontar los costos directos de cada línea de negocio, pero antes de gastos generales.

### Utilidad Neta
Ganancia final después de descontar todos los costos y gastos. Representa la ganancia real del negocio.

### Teórico en Caja
Cantidad de dinero que debería haber en la caja basado en cálculos: `Fondo Inicial + Ventas - Gastos en Efectivo`

### Diferencia de Caja
La diferencia entre el dinero contado real y el teórico esperado. Puede ser:
- **Sobrante**: Hay más dinero del esperado (positivo)
- **Faltante**: Hay menos dinero del esperado (negativo)

---

## Términos de Sistema

### Snapshot
Captura de valores en un momento específico. El sistema guarda snapshots de configuración y costos al registrar ventas para mantener la precisión histórica.

### Tiempo Real
Actualización automática de datos sin necesidad de refrescar la página. Los cambios se reflejan inmediatamente en todas las sesiones activas.

### Rol
Nivel de permisos de un usuario:
- **Admin**: Acceso completo a todas las funcionalidades
- **Vendedor**: Acceso limitado solo al punto de venta

---

## Fórmulas del Sistema

### Cálculo de Venta de Pan
```
Kilos Producidos = Bandejas × Kilos por Bandeja
Venta Pan = Kilos Producidos × Precio por Kilo
```

### Cálculo de Teórico en Caja
```
Teórico = Fondo Inicial + Ventas NO-PAN + Venta Pan - Gastos desde Caja
```

### Cálculo de Utilidad Neta del Turno
```
Utilidad = (Ventas NO-PAN + Venta Pan) - (COGS + Todos los Gastos)
```

### Cálculo de Margen de Producto
```
Margen (%) = ((Precio Venta - Costo) / Precio Venta) × 100
```

---

*Glosario de términos - Versión 1.0*
