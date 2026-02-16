
-- Materialize vendor_health_overview
CREATE TABLE IF NOT EXISTS public.vendor_health_overview_mat AS
SELECT * FROM public.vendor_health_overview;

-- Materialize vendor_search_overview
CREATE TABLE IF NOT EXISTS public.vendor_search_overview_mat AS
SELECT * FROM public.vendor_search_overview;

-- Enable RLS
ALTER TABLE public.vendor_health_overview_mat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_search_overview_mat ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read" ON public.vendor_health_overview_mat FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.vendor_search_overview_mat FOR SELECT USING (true);
