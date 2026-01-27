-- =============================================
-- CONTROL PANADERÍA APP - Schema de Base de Datos
-- =============================================
-- Ejecutar este archivo en el SQL Editor de Supabase
-- https://supabase.com/dashboard/project/_/sql/new
-- =============================================

-- =============================================
-- 1. EXTENSIONES NECESARIAS
-- =============================================

-- Habilitar UUID (ya viene habilitado en Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. TABLA DE PERFILES (extiende auth.users)
-- =============================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda por username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 3. TABLA DE CATEGORÍAS
-- =============================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. TABLA DE PRODUCTOS
-- =============================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. TABLA DE CONFIGURACIÓN
-- =============================================

CREATE TABLE IF NOT EXISTS public.config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial de PAN
INSERT INTO public.config (key, value) VALUES 
    ('pan_config', '{"kilos_por_bandeja": 3.2, "precio_por_kilo": 2000}')
ON CONFLICT (key) DO NOTHING;

CREATE TRIGGER update_config_updated_at
    BEFORE UPDATE ON public.config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. TABLA DE TURNOS (SHIFTS)
-- =============================================

CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    
    -- Apertura
    opening_cash NUMERIC(10, 2) NOT NULL DEFAULT 0,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    opened_by UUID REFERENCES public.profiles(id),
    opened_by_name TEXT,
    
    -- Datos del turno
    bandejas_sacadas INTEGER DEFAULT 0,
    ventas_no_pan NUMERIC(10, 2) DEFAULT 0,
    
    -- Snapshot de configuración al momento del turno
    config_snapshot JSONB DEFAULT '{"kilos_por_bandeja": 3.2, "precio_por_kilo": 2000}',
    
    -- Cierre
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES public.profiles(id),
    closed_by_name TEXT,
    closing_data JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_shifts_date ON public.shifts(date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON public.shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_opened_by ON public.shifts(opened_by);

CREATE TRIGGER update_shifts_updated_at
    BEFORE UPDATE ON public.shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. TABLA DE VENTAS
-- =============================================

CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    sold_by UUID REFERENCES public.profiles(id),
    sold_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_sales_shift ON public.sales(shift_id);
CREATE INDEX IF NOT EXISTS idx_sales_sold_by ON public.sales(sold_by);

-- =============================================
-- 8. TABLA DE ITEMS DE VENTA
-- =============================================

CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    
    -- Snapshot del producto al momento de la venta
    product_name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON public.sale_items(product_id);

-- =============================================
-- 9. TABLA DE GASTOS
-- =============================================

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    origin TEXT NOT NULL DEFAULT 'GENERAL' CHECK (origin IN ('GENERAL', 'PAN', 'NO_PAN')),
    from_cash BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_expenses_shift ON public.expenses(shift_id);
CREATE INDEX IF NOT EXISTS idx_expenses_origin ON public.expenses(origin);

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 11. POLÍTICAS DE ACCESO
-- =============================================

-- PROFILES: Los usuarios pueden ver todos los perfiles pero solo editar el suyo
CREATE POLICY "Usuarios pueden ver todos los perfiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins pueden insertar perfiles"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
        OR NOT EXISTS (SELECT 1 FROM public.profiles)
    );

CREATE POLICY "Admins pueden eliminar perfiles"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- CATEGORIES: Todos pueden leer, solo admins escriben
CREATE POLICY "Todos pueden ver categorías"
    ON public.categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins pueden gestionar categorías"
    ON public.categories FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- PRODUCTS: Todos pueden leer, solo admins escriben
CREATE POLICY "Todos pueden ver productos"
    ON public.products FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins pueden gestionar productos"
    ON public.products FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- CONFIG: Todos pueden leer, solo admins escriben
CREATE POLICY "Todos pueden ver configuración"
    ON public.config FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins pueden gestionar configuración"
    ON public.config FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- SHIFTS: Todos pueden leer y escribir (necesario para el POS)
CREATE POLICY "Usuarios autenticados pueden ver turnos"
    ON public.shifts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden gestionar turnos"
    ON public.shifts FOR ALL
    TO authenticated
    USING (true);

-- SALES: Todos pueden leer y escribir
CREATE POLICY "Usuarios autenticados pueden ver ventas"
    ON public.sales FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden gestionar ventas"
    ON public.sales FOR ALL
    TO authenticated
    USING (true);

-- SALE_ITEMS: Todos pueden leer y escribir
CREATE POLICY "Usuarios autenticados pueden ver items de venta"
    ON public.sale_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden gestionar items de venta"
    ON public.sale_items FOR ALL
    TO authenticated
    USING (true);

-- EXPENSES: Todos pueden leer y escribir
CREATE POLICY "Usuarios autenticados pueden ver gastos"
    ON public.expenses FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden gestionar gastos"
    ON public.expenses FOR ALL
    TO authenticated
    USING (true);

-- =============================================
-- 12. FUNCIÓN PARA CREAR PERFIL AL REGISTRAR USUARIO
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, username, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 13. VISTAS ÚTILES
-- =============================================

-- Vista de productos con nombre de categoría
CREATE OR REPLACE VIEW public.products_with_category AS
SELECT 
    p.*,
    c.name as category_name,
    CASE 
        WHEN p.price > 0 THEN ROUND(((p.price - p.cost) / p.price) * 100, 1)
        ELSE 0
    END as margin_percentage
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
WHERE p.is_active = true;

-- Vista de resumen del turno actual
CREATE OR REPLACE VIEW public.current_shift_summary AS
SELECT 
    s.*,
    COALESCE(SUM(e.amount) FILTER (WHERE e.from_cash = true), 0) as gastos_caja,
    COALESCE(SUM(e.amount) FILTER (WHERE e.origin = 'PAN'), 0) as gastos_pan,
    COALESCE(SUM(e.amount) FILTER (WHERE e.origin = 'NO_PAN'), 0) as gastos_no_pan,
    COALESCE(SUM(e.amount) FILTER (WHERE e.origin = 'GENERAL'), 0) as gastos_general,
    (s.bandejas_sacadas * (s.config_snapshot->>'kilos_por_bandeja')::numeric * 
     (s.config_snapshot->>'precio_por_kilo')::numeric) as venta_pan_estimada
FROM public.shifts s
LEFT JOIN public.expenses e ON e.shift_id = s.id
WHERE s.status = 'OPEN'
GROUP BY s.id;

-- =============================================
-- 14. HABILITAR REALTIME
-- =============================================

-- Habilitar realtime para tablas que necesitan actualizaciones en vivo
ALTER PUBLICATION supabase_realtime ADD TABLE public.shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;

-- =============================================
-- FIN DEL SCHEMA
-- =============================================
