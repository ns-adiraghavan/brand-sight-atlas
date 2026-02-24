import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { IllustrativeLabel } from "./IllustrativeLabel";
import { CHART_LIMITS } from "@/lib/metrics";
import { useDateRange } from "@/contexts/DateRangeContext";
import { supabase } from "@/integrations/supabase/client";

interface BottomSKU {
  base_pack: string;
  business_group_clean: string;
  platform: string;
  risk_band: string;
  sku_availability_ratio: number;
  total_days: number;
}

function riskToStatus(risk: string): "critical" | "high" | "medium" | "low" {
  if (risk === "High Risk") return "critical";
  if (risk === "Medium Risk") return "high";
  return "medium";
}

export function BottomSKUsTable() {
  const { getTimePhrase } = useDateRange();
  const [items, setItems] = useState<BottomSKU[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("ola_bottom_skus")
      .select("base_pack, business_group_clean, platform, risk_band, sku_availability_ratio, total_days")
      .order("sku_availability_ratio", { ascending: true })
      .limit(CHART_LIMITS.maxRows)
      .then(({ data: rows, count }) => {
        if (rows) {
          setItems(
            rows.filter((r) => r.base_pack != null) as BottomSKU[]
          );
          setTotalCount(count ?? rows.length);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-6 relative">
      <IllustrativeLabel variant="corner" />
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-foreground">Bottom SKUs by Availability</h4>
        <p className="text-xs text-muted-foreground">
          Lowest availability products {getTimePhrase()}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-xs">#</TableHead>
              <TableHead className="text-xs">Product</TableHead>
              <TableHead className="text-xs">Platform</TableHead>
              <TableHead className="text-xs text-right">Availability</TableHead>
              <TableHead className="text-xs text-right">Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={`${item.base_pack}-${item.platform}-${idx}`}>
                <TableCell className="text-xs font-medium text-muted-foreground py-2.5">
                  {idx + 1}
                </TableCell>
                <TableCell className="py-2.5">
                  <p className="text-xs font-medium text-foreground">{item.base_pack}</p>
                  <p className="text-[10px] text-muted-foreground">{item.business_group_clean}</p>
                </TableCell>
                <TableCell className="py-2.5">
                  <span className="text-xs text-muted-foreground capitalize">{item.platform}</span>
                </TableCell>
                <TableCell className="text-right py-2.5">
                  <span className="text-sm font-semibold text-foreground">
                    {(item.sku_availability_ratio * 100).toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right py-2.5">
                  <StatusBadge level={riskToStatus(item.risk_band)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {totalCount > CHART_LIMITS.maxRows && (
        <p className="text-[10px] text-muted-foreground mt-2">
          Showing {CHART_LIMITS.maxRows} of {totalCount}
        </p>
      )}
    </div>
  );
}
