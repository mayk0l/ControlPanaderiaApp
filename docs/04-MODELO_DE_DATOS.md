# 🗄️ Modelo de Datos

Este documento describe las entidades principales del sistema y sus relaciones.

---

## Entidades Principales

### 1. Usuario (User)

Representa a los usuarios que pueden acceder al sistema.

| Campo      | Tipo     | Descripción                              |
|------------|----------|------------------------------------------|
| id         | String   | Identificador único                      |
| name       | String   | Nombre completo del usuario              |
| username   | String   | Nombre de usuario para login             |
| password   | String   | Contraseña (encriptada en producción)    |
| role       | Enum     | Rol: `admin` \| `vendedor`               |
| createdAt  | DateTime | Fecha de creación                        |

---

### 2. Turno (Shift)

Representa un turno de trabajo (apertura a cierre de caja).

| Campo              | Tipo       | Descripción                                    |
|--------------------|------------|------------------------------------------------|
| id                 | String     | Identificador único (formato: YYYY-MM-DD)      |
| date               | String     | Fecha del turno                                |
| status             | Enum       | Estado: `OPEN` \| `CLOSED`                     |
| openingCash        | Number     | Fondo inicial de caja                          |
| openedAt           | DateTime   | Fecha/hora de apertura                         |
| openedBy           | String     | ID del usuario que abrió                       |
| openedByName       | String     | Nombre del usuario que abrió                   |
| closedAt           | DateTime   | Fecha/hora de cierre (nullable)                |
| bandejasSacadas    | Number     | Cantidad de bandejas de pan producidas         |
| ventasNoPan        | Number     | Total acumulado de ventas no-pan               |
| ventasItems        | Array      | Detalle de items vendidos                      |
| configSnapshot     | Object     | Snapshot de configuración al momento del turno |
| closingData        | Object     | Datos del arqueo de cierre                     |

**Subobjeto: ventasItems[]**
| Campo         | Tipo   | Descripción                      |
|---------------|--------|----------------------------------|
| productId     | String | ID del producto vendido          |
| name          | String | Nombre del producto              |
| price         | Number | Precio de venta al momento       |
| costSnapshot  | Number | Costo al momento de la venta     |
| qty           | Number | Cantidad vendida                 |

**Subobjeto: configSnapshot**
| Campo           | Tipo   | Descripción              |
|-----------------|--------|--------------------------|
| kilosPorBandeja | Number | Kilos por bandeja        |
| precioPorKilo   | Number | Precio por kilo de pan   |

**Subobjeto: closingData**
| Campo          | Tipo   | Descripción                     |
|----------------|--------|---------------------------------|
| panAdjustment  | Number | Ajuste de bandejas (+/-)        |
| panReason      | String | Motivo del ajuste               |
| countedCash    | Number | Dinero contado real             |
| expectedCash   | Number | Dinero esperado (calculado)     |
| difference     | Number | Diferencia (sobrante/faltante)  |

---

### 3. Producto (Product)

Representa un producto del catálogo (excepto pan).

| Campo    | Tipo   | Descripción                    |
|----------|--------|--------------------------------|
| id       | String | Identificador único            |
| name     | String | Nombre comercial del producto  |
| price    | Number | Precio de venta                |
| cost     | Number | Costo unitario                 |
| category | String | Nombre de la categoría         |

---

### 4. Categoría (Category)

Agrupa productos para mejor organización.

| Campo | Tipo   | Descripción           |
|-------|--------|-----------------------|
| id    | String | Identificador único   |
| name  | String | Nombre de la categoría|

---

### 5. Gasto (Expense)

Representa un gasto realizado durante un turno.

| Campo       | Tipo    | Descripción                                          |
|-------------|---------|------------------------------------------------------|
| id          | String  | Identificador único                                  |
| description | String  | Descripción del gasto                                |
| amount      | Number  | Monto del gasto                                      |
| origin      | Enum    | Clasificación: `GENERAL` \| `PAN` \| `NO_PAN`        |
| fromCash    | Boolean | Si fue pagado con efectivo de caja                   |
| date        | DateTime| Fecha/hora del registro                              |
| shiftId     | String  | ID del turno asociado                                |

---

### 6. Configuración (PanConfig)

Parámetros configurables del negocio.

| Campo           | Tipo   | Descripción                      |
|-----------------|--------|----------------------------------|
| kilosPorBandeja | Number | Kilos de pan por bandeja         |
| precioPorKilo   | Number | Precio de venta por kilo de pan  |

---

## Diagrama de Relaciones

```
┌─────────────┐         ┌─────────────┐
│   Usuario   │         │  Categoría  │
│             │         │             │
│ - id        │         │ - id        │
│ - name      │         │ - name      │
│ - username  │         └──────┬──────┘
│ - password  │                │
│ - role      │                │ 1:N
└──────┬──────┘                │
       │                 ┌─────┴──────┐
       │                 │  Producto  │
       │ 1:N             │            │
       │                 │ - id       │
┌──────┴──────┐          │ - name     │
│    Turno    │          │ - price    │
│             │          │ - cost     │
│ - id        │          │ - category │
│ - status    │          └────────────┘
│ - openingCash│
│ - bandejas  │
│ - ventasNoPan│
│ - ventasItems│◄─────── Snapshot de productos vendidos
└──────┬──────┘
       │
       │ 1:N
       │
┌──────┴──────┐
│    Gasto    │
│             │
│ - id        │
│ - description│
│ - amount    │
│ - origin    │
│ - fromCash  │
└─────────────┘
```

---

## Cálculos Derivados

Los siguientes valores se calculan en tiempo real:

### En el Turno
- **Kilos Estimados** = `bandejasSacadas × kilosPorBandeja`
- **Venta Pan Estimada** = `Kilos Estimados × precioPorKilo`
- **Gastos Caja** = Suma de gastos donde `fromCash = true`
- **Teórico en Caja** = `openingCash + ventasNoPan + ventaPanEstimada - gastosCaja`
- **Utilidad Neta** = `ventasNoPan + ventaPanEstimada - todosLosGastos - costoMercadería`

### En Reportes
- **Utilidad PAN** = `ventasPan - gastosPAN`
- **Utilidad Productos** = `ventasNoPan - COGS - gastosNO_PAN`
- **Utilidad Neta** = `UtilidadPAN + UtilidadProductos - gastosGENERAL`

---

*Documento de modelo de datos - Versión 1.0*
