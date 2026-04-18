-- =============================================
-- Migration: Add "units" (đơn vị) table
-- Separates the organizational unit concept from categories
-- =============================================

-- 1. Create units table
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add unit_id FK to equipments
ALTER TABLE public.equipments 
ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL;

-- 3. RLS
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow ALL on units" ON public.units FOR ALL USING (true) WITH CHECK (true);

-- 4. Sample data
INSERT INTO public.units (id, name, sort_order) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'SPCIT', 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HỆ THỐNG', 2)
ON CONFLICT (name) DO NOTHING;
