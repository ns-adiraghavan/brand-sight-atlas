import { Link2 } from "lucide-react";

interface PlatformAlignment {
  platform: string;
  correlation: number; // -1 to 1
  interpretation: string;
}

interface AlignmentInsightProps {
  data: PlatformAlignment[];
}

export function AlignmentInsight({ data }: AlignmentInsightProps) {
  return (
    <div className="bg-card/50 border border-border/60 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold text-foreground">Execution × Visibility Alignment</h4>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {data.map((item) => {
          const isPositive = item.correlation >= 0;
          return (
            <div key={item.platform} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{item.platform}</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isPositive
                    ? "bg-status-success/10 text-status-success"
                    : "bg-status-error/10 text-status-error"
                }`}
              >
                {isPositive ? "+" : ""}{item.correlation.toFixed(2)}
              </span>
            </div>
          );
        })}
        <span className="text-xs text-muted-foreground leading-relaxed ml-auto max-w-md">
          {data[0]?.interpretation}
        </span>
      </div>
    </div>
  );
}
