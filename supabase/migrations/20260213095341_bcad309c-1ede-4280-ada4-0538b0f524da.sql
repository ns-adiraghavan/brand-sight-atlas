
-- Increase statement timeout for this session
SET statement_timeout = '120s';

-- Materialize ola_exec_summary
CREATE TABLE IF NOT EXISTS public.ola_exec_summary_mat AS
SELECT * FROM public.ola_exec_summary;

-- Materialize ola_weekly_trend
CREATE TABLE IF NOT EXISTS public.ola_weekly_trend_mat AS
SELECT * FROM public.ola_weekly_trend;

-- Materialize ola_availability_distribution
CREATE TABLE IF NOT EXISTS public.ola_availability_distribution_mat AS
SELECT * FROM public.ola_availability_distribution;

-- Materialize ola_pincode_volatility
CREATE TABLE IF NOT EXISTS public.ola_pincode_volatility_mat AS
SELECT * FROM public.ola_pincode_volatility;

-- Materialize ola_bottom_skus
CREATE TABLE IF NOT EXISTS public.ola_bottom_skus_mat AS
SELECT * FROM public.ola_bottom_skus;

-- Materialize ola_platform_gap
CREATE TABLE IF NOT EXISTS public.ola_platform_gap_mat AS
SELECT * FROM public.ola_platform_gap;

-- Materialize cross_platform_correlation
CREATE TABLE IF NOT EXISTS public.cross_platform_correlation_mat AS
SELECT * FROM public.cross_platform_correlation;

-- Enable RLS on all materialized tables (allow public read)
ALTER TABLE public.ola_exec_summary_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.ola_exec_summary_mat FOR SELECT USING (true);

ALTER TABLE public.ola_weekly_trend_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.ola_weekly_trend_mat FOR SELECT USING (true);

ALTER TABLE public.ola_availability_distribution_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.ola_availability_distribution_mat FOR SELECT USING (true);

ALTER TABLE public.ola_pincode_volatility_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.ola_pincode_volatility_mat FOR SELECT USING (true);

ALTER TABLE public.ola_bottom_skus_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.ola_bottom_skus_mat FOR SELECT USING (true);

ALTER TABLE public.ola_platform_gap_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.ola_platform_gap_mat FOR SELECT USING (true);

ALTER TABLE public.cross_platform_correlation_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.cross_platform_correlation_mat FOR SELECT USING (true);
