import { createContext, useContext, useState, ReactNode } from "react";
import { subDays, startOfYear, format } from "date-fns";

export type DatePreset = "7d" | "30d" | "90d" | "ytd" | "custom";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeContextType {
  dateRange: DateRange;
  preset: DatePreset;
  setPreset: (preset: DatePreset) => void;
  setCustomRange: (from: Date, to: Date) => void;
  getLabel: () => string;
  getTimePhrase: () => string;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

function getDateRangeFromPreset(preset: DatePreset): DateRange {
  const today = new Date();
  switch (preset) {
    case "7d":
      return { from: subDays(today, 7), to: today };
    case "30d":
      return { from: subDays(today, 30), to: today };
    case "90d":
      return { from: subDays(today, 90), to: today };
    case "ytd":
      return { from: startOfYear(today), to: today };
    default:
      return { from: subDays(today, 30), to: today };
  }
}

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<DatePreset>("30d");
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset("30d"));

  const setPreset = (newPreset: DatePreset) => {
    setPresetState(newPreset);
    if (newPreset !== "custom") {
      setDateRange(getDateRangeFromPreset(newPreset));
    }
  };

  const setCustomRange = (from: Date, to: Date) => {
    setPresetState("custom");
    setDateRange({ from, to });
  };

  const getLabel = (): string => {
    switch (preset) {
      case "7d": return "Last 7 days";
      case "30d": return "Last 30 days";
      case "90d": return "Last 90 days";
      case "ytd": return "Year to date";
      default: return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }
  };

  const getTimePhrase = (): string => {
    switch (preset) {
      case "7d": return "over the past 7 days";
      case "30d": return "over the past 30 days";
      case "90d": return "over the past 90 days";
      case "ytd": return "since the start of the year";
      default: return "during the selected period";
    }
  };

  return (
    <DateRangeContext.Provider value={{ dateRange, preset, setPreset, setCustomRange, getLabel, getTimePhrase }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
}
