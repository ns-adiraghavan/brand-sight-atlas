import { useEffect, useState, useCallback } from "react";
import { Calendar } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { useDateRange } from "@/contexts/DateRangeContext";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";

export function DateRangeFilter() {
  const { dateRange, setCustomRange } = useDateRange();

  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);
  const [totalDays, setTotalDays] = useState(1);

  // Load min/max from both OLA and SOS data
  useEffect(() => {
    Promise.all([
      supabase.from("ola_weekly_trend_mat").select("week").order("week", { ascending: true }).limit(1),
      supabase.from("ola_weekly_trend_mat").select("week").order("week", { ascending: false }).limit(1),
      supabase.from("sos_weekly_trend_mat").select("week").order("week", { ascending: true }).limit(1),
      supabase.from("sos_weekly_trend_mat").select("week").order("week", { ascending: false }).limit(1),
    ]).then(([olaMin, olaMax, sosMin, sosMax]) => {
      const candidates: Date[] = [];
      if (olaMin.data?.[0]?.week) candidates.push(new Date(olaMin.data[0].week));
      if (sosMin.data?.[0]?.week) candidates.push(new Date(sosMin.data[0].week));
      const maxCandidates: Date[] = [];
      if (olaMax.data?.[0]?.week) maxCandidates.push(new Date(olaMax.data[0].week));
      if (sosMax.data?.[0]?.week) maxCandidates.push(new Date(sosMax.data[0].week));

      if (candidates.length > 0 && maxCandidates.length > 0) {
        const mn = new Date(Math.min(...candidates.map(d => d.getTime())));
        const mx = new Date(Math.max(...maxCandidates.map(d => d.getTime())));
        setMinDate(mn);
        setMaxDate(mx);
        const days = Math.max(differenceInDays(mx, mn), 1);
        setTotalDays(days);
        // Initialize the range to the full data extent
        setCustomRange(mn, mx);
      }
    });
  }, []);

  const dateToSlider = useCallback(
    (d: Date) => {
      if (!minDate) return 0;
      return differenceInDays(d, minDate);
    },
    [minDate]
  );

  const sliderToDate = useCallback(
    (v: number) => {
      if (!minDate) return new Date();
      return addDays(minDate, v);
    },
    [minDate]
  );

  if (!minDate || !maxDate) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>Loading dates…</span>
      </div>
    );
  }

  const fromVal = dateToSlider(dateRange.from < minDate ? minDate : dateRange.from);
  const toVal = dateToSlider(dateRange.to > maxDate ? maxDate : dateRange.to);

  return (
    <div className="flex items-center gap-3 min-w-[280px]">
      <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{format(dateRange.from, "MMM d, yyyy")}</span>
          <span>{format(dateRange.to, "MMM d, yyyy")}</span>
        </div>
        <Slider
          min={0}
          max={totalDays}
          step={1}
          value={[fromVal, toVal]}
          onValueChange={([f, t]) => {
            setCustomRange(sliderToDate(f), sliderToDate(t));
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
