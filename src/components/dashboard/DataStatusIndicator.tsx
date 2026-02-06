import { Clock, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataStatus {
  lastUpdated: Date;
  coverage: "complete" | "partial" | "limited";
  recordCount?: number;
  missingDates?: number;
}

interface DataStatusIndicatorProps {
  status: DataStatus;
  className?: string;
}

export function DataStatusIndicator({ status, className }: DataStatusIndicatorProps) {
  const coverageConfig = {
    complete: {
      label: "Complete",
      icon: CheckCircle2,
      color: "text-status-success",
      bg: "bg-status-success/10",
    },
    partial: {
      label: "Partial",
      icon: AlertCircle,
      color: "text-status-warning",
      bg: "bg-status-warning/10",
    },
    limited: {
      label: "Limited",
      icon: AlertCircle,
      color: "text-status-error",
      bg: "bg-status-error/10",
    },
  };

  const config = coverageConfig[status.coverage];
  const CoverageIcon = config.icon;

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Updated just now";
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    if (diffDays === 1) return "Updated yesterday";
    return `Updated ${diffDays} days ago`;
  };

  return (
    <div className={cn("flex items-center gap-4 text-xs", className)}>
      {/* Last Updated */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>{formatLastUpdated(status.lastUpdated)}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border" />

      {/* Coverage Status */}
      <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md", config.bg)}>
        <CoverageIcon className={cn("w-3.5 h-3.5", config.color)} />
        <span className={config.color}>{config.label} coverage</span>
      </div>

      {/* Optional: Missing data indicator */}
      {status.missingDates && status.missingDates > 0 && (
        <>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Database className="w-3.5 h-3.5" />
            <span>{status.missingDates} gaps</span>
          </div>
        </>
      )}
    </div>
  );
}

// Hook to generate mock data status based on date range
export function useDataStatus(preset: string): DataStatus {
  // Simulate different coverage based on time range
  const now = new Date();
  const hoursAgo = Math.floor(Math.random() * 6) + 1;
  const lastUpdated = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

  // Longer time ranges tend to have more gaps
  const coverageMap: Record<string, { coverage: DataStatus["coverage"]; missingDates: number }> = {
    "7d": { coverage: "complete", missingDates: 0 },
    "30d": { coverage: Math.random() > 0.3 ? "complete" : "partial", missingDates: Math.floor(Math.random() * 3) },
    "90d": { coverage: "partial", missingDates: Math.floor(Math.random() * 5) + 2 },
    "ytd": { coverage: Math.random() > 0.5 ? "partial" : "limited", missingDates: Math.floor(Math.random() * 8) + 3 },
  };

  const config = coverageMap[preset] || coverageMap["30d"];

  return {
    lastUpdated,
    coverage: config.coverage,
    missingDates: config.missingDates,
  };
}
