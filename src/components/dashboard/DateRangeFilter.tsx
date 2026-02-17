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

  // Load min/max from data
  useEffect(() => {
    supabase
      .from("ola_weekly_trend_mat")
      .select("week")
      .order("week", { ascending: true })
      .limit(1)
      .then(({ data: minRows }) => {
        supabase
          .from("ola_weekly_trend_mat")
          .select("week")
          .order("week", { ascending: false })
          .limit(1)
          .then(({ data: maxRows }) => {
            if (minRows?.[0]?.week && maxRows?.[0]?.week) {
              const mn = new Date(minRows[0].week);
              const mx = new Date(maxRows[0].week);
              setMinDate(mn);
              setMaxDate(mx);
              setTotalDays(Math.max(differenceInDays(mx, mn), 1));
            }
          });
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
