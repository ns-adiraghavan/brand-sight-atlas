
-- Materialize ola_vendor_health
CREATE TABLE IF NOT EXISTS public.ola_vendor_health_mat AS
SELECT * FROM public.ola_vendor_health;

-- Materialize sos_vendor_health
CREATE TABLE IF NOT EXISTS public.sos_vendor_health_mat AS
SELECT * FROM public.sos_vendor_health;

-- Enable RLS
ALTER TABLE public.ola_vendor_health_mat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_vendor_health_mat ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read" ON public.ola_vendor_health_mat FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.sos_vendor_health_mat FOR SELECT USING (true);
