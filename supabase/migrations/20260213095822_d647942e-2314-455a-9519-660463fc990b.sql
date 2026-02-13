
SET statement_timeout = '120s';

-- Materialize sos_exec_summary
CREATE TABLE IF NOT EXISTS public.sos_exec_summary_mat AS
SELECT * FROM public.sos_exec_summary;

-- Materialize sos_weekly_trend
CREATE TABLE IF NOT EXISTS public.sos_weekly_trend_mat AS
SELECT * FROM public.sos_weekly_trend;

-- Materialize sos_rank_distribution
CREATE TABLE IF NOT EXISTS public.sos_rank_distribution_mat AS
SELECT * FROM public.sos_rank_distribution;

-- Materialize sos_keyword_volatility
CREATE TABLE IF NOT EXISTS public.sos_keyword_volatility_mat AS
SELECT * FROM public.sos_keyword_volatility;

-- Materialize sos_keyword_risk
CREATE TABLE IF NOT EXISTS public.sos_keyword_risk_mat AS
SELECT * FROM public.sos_keyword_risk;

-- Materialize sos_exclusive_weekly
CREATE TABLE IF NOT EXISTS public.sos_exclusive_weekly_mat AS
SELECT * FROM public.sos_exclusive_weekly;

-- Enable RLS with public read on all
ALTER TABLE public.sos_exec_summary_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.sos_exec_summary_mat FOR SELECT USING (true);

ALTER TABLE public.sos_weekly_trend_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.sos_weekly_trend_mat FOR SELECT USING (true);

ALTER TABLE public.sos_rank_distribution_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.sos_rank_distribution_mat FOR SELECT USING (true);

ALTER TABLE public.sos_keyword_volatility_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.sos_keyword_volatility_mat FOR SELECT USING (true);

ALTER TABLE public.sos_keyword_risk_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.sos_keyword_risk_mat FOR SELECT USING (true);

ALTER TABLE public.sos_exclusive_weekly_mat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.sos_exclusive_weekly_mat FOR SELECT USING (true);
