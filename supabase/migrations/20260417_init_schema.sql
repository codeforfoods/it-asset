-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories (Recursive Table for Tree Hierarchy)
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Device Types (Loại Thiết Bị)
CREATE TABLE public.device_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Functions (Nhiệm vụ Chức năng)
CREATE TABLE public.functions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Locations (Vị trí gắn)
CREATE TABLE public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. License Statuses (Trạng thái bản quyền)
CREATE TABLE public.license_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    color_code TEXT, -- To show colored badges on UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Core Equipments Table
CREATE TABLE public.equipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    device_type_id UUID REFERENCES public.device_types(id) ON DELETE SET NULL,
    model TEXT NOT NULL,
    ip_address TEXT,
    quantity INTEGER DEFAULT 1,
    function_id UUID REFERENCES public.functions(id) ON DELETE SET NULL,
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    location_qty INTEGER,
    eol_date DATE,
    eoss_date DATE,
    license_end_date DATE,
    license_status_id UUID REFERENCES public.license_statuses(id) ON DELETE SET NULL,
    replacement_phase TEXT,
    replaced_by_id UUID REFERENCES public.equipments(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Settings (Row Level Security)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;

-- Note: For demo/development purposes we allow anomymous full access.
-- In production, replace `true` with `auth.role() = 'authenticated'`
CREATE POLICY "Allow ALL on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on device_types" ON public.device_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on functions" ON public.functions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on locations" ON public.locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on license_statuses" ON public.license_statuses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL on equipments" ON public.equipments FOR ALL USING (true) WITH CHECK (true);

-- Functions triggers
CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipments_modtime BEFORE UPDATE ON public.equipments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

--- SAMPLE DATA INSERTION (MOCK DATA) ---
INSERT INTO public.categories (id, name, parent_id) VALUES 
('11111111-1111-1111-1111-111111111111', 'A. SPCIT', NULL),
('22222222-2222-2222-2222-222222222222', 'I. THIẾT BỊ MẠNG', '11111111-1111-1111-1111-111111111111');

INSERT INTO public.device_types (id, name) VALUES 
('33333333-3333-3333-3333-333333333333', 'Switch/router');

INSERT INTO public.functions (id, name) VALUES 
('44444444-4444-4444-4444-444444444441', 'Switch Distribution'),
('44444444-4444-4444-4444-444444444442', 'Switch DC'),
('44444444-4444-4444-4444-444444444443', 'Switch Core DC');

INSERT INTO public.locations (id, name) VALUES 
('55555555-5555-5555-5555-555555555555', '72 HBT');

INSERT INTO public.license_statuses (id, name, color_code) VALUES 
('66666666-6666-6666-6666-666666666661', 'Support', 'green'),
('66666666-6666-6666-6666-666666666662', 'Hết license', 'red');

INSERT INTO public.equipments (
    id, category_id, device_type_id, model, quantity, function_id, location_id, location_qty, eol_date, eoss_date, license_end_date, license_status_id, replacement_phase
) VALUES 
('77777777-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'FortiSwitch 1048E', 2, '44444444-4444-4444-4444-444444444441', '55555555-5555-5555-5555-555555555555', 2, '2026-04-01', '2031-04-01', '2027-12-01', '66666666-6666-6666-6666-666666666661', NULL),
('77777777-7777-7777-7777-777777777772', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'HP 5900AF-48XG-4QSFP+', 2, '44444444-4444-4444-4444-444444444443', '55555555-5555-5555-5555-555555555555', 2, '2022-02-28', '2024-10-31', NULL, '66666666-6666-6666-6666-666666666662', '1');
