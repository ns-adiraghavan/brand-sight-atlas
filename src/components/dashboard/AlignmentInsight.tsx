import { Link2 } from "lucide-react";
import { MetricTooltip } from "./MetricTooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlatformAlignment {
  platform: string;
  correlation: number;
}

function getCorrelationBadge(c: number) {
  if (c > 0.3) return "bg-status-success/10 text-status-success";
  if (c < -0.3) return "bg-status-error/10 text-status-error";
  return "bg-status-warning/10 text-status-warning";
}

function getInterpretation(data: PlatformAlignment[]): string {
  if (!data.length) return "";
  const avg = data.reduce((s, d) => s + d.correlation, 0) / data.length;
  if (avg > 0.3) return "Strong execution-visibility alignment across platforms—availability gains are compounding into search prominence.";
  if (avg < -0.3) return "Structural misalignment detected: stock execution is not translating into search visibility, suggesting supply-demand disconnect.";
  return "Weak linkage between availability and search visibility—platform-specific strategies may be needed to strengthen the connection.";
}

export function AlignmentInsight() {
  const [data, setData] = useState<PlatformAlignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("cross_platform_correlation_mat")
      .select("platform, alignment_correlation")
      .then(({ data: rows }) => {
        if (rows) {
          setData(
            rows
              .filter((r) => r.platform && r.alignment_correlation != null)
              .map((r) => ({ platform: r.platform!, correlation: r.alignment_correlation! }))
          );
        }
        setLoading(false);
      });
  }, []);

  if (loading || !data.length) return null;

  return (
    <div className="bg-card/50 border border-border/60 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold text-foreground">Execution × Visibility Alignment</h4>
        <MetricTooltip definition="Alignment Correlation = Pearson correlation between Availability % and Top-10 Presence % across platforms." />
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {data.map((item) => (
          <div key={item.platform} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{item.platform}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getCorrelationBadge(item.correlation)}`}>
              {item.correlation > 0 ? "+" : ""}{item.correlation.toFixed(2)}
            </span>
          </div>
        ))}
        <span className="text-xs text-muted-foreground leading-relaxed ml-auto max-w-md">
          {getInterpretation(data)}
        </span>
      </div>
    </div>
  );
}
