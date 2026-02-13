import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { IllustrativeLabel } from "./IllustrativeLabel";
import { CHART_LIMITS } from "@/lib/metrics";
import { olaLowAvailabilitySKUs } from "@/data/mockData";
import { useDateRange } from "@/contexts/DateRangeContext";

export function BottomSKUsTable() {
  const { getTimePhrase } = useDateRange();
  const items = olaLowAvailabilitySKUs.slice(0, CHART_LIMITS.maxRows);

  return (
    <div className="bg-card rounded-xl border border-border p-6 relative">
      <IllustrativeLabel variant="corner" />
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-foreground">Bottom SKUs by Availability</h4>
        <p className="text-xs text-muted-foreground">
          Lowest availability products {getTimePhrase()}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-xs">#</TableHead>
            <TableHead className="text-xs">Product</TableHead>
            <TableHead className="text-xs text-right">Availability</TableHead>
            <TableHead className="text-xs text-right">Risk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-xs font-medium text-muted-foreground py-2.5">
                {item.rank}
              </TableCell>
              <TableCell className="py-2.5">
                <p className="text-xs font-medium text-foreground">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
              </TableCell>
              <TableCell className="text-right py-2.5">
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </TableCell>
              <TableCell className="text-right py-2.5">
                <StatusBadge level={item.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {olaLowAvailabilitySKUs.length > CHART_LIMITS.maxRows && (
        <p className="text-[10px] text-muted-foreground mt-2">
          Showing {CHART_LIMITS.maxRows} of {olaLowAvailabilitySKUs.length}
        </p>
      )}
    </div>
  );
}
