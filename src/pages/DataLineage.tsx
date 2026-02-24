import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

const DATA_SOURCE_MAP = [
  // OLA Page
  { component: "OnlineAvailability (Exec Snapshot)", page: "OLA", table: "ola_exec_summary_mat", columns: "platform, availability_pct, must_have_availability_pct, sku_reliability_pct" },
  { component: "AvailabilityTrendChart", page: "OLA", table: "ola_weekly_trend_mat", columns: "week, platform, availability_pct, must_have_availability_pct" },
  { component: "AvailabilityDistribution", page: "OLA", table: "ola_availability_distribution_mat", columns: "availability_band, platform, sku_count" },
  { component: "PincodeVolatilityScatter", page: "OLA", table: "ola_pincode_volatility_mat", columns: "location, platform, avg_availability, volatility_index" },
  { component: "BottomSKUsTable", page: "OLA", table: "ola_bottom_skus", columns: "base_pack, business_group_clean, platform, risk_band, sku_availability_ratio, total_days" },
  { component: "VendorHealthOverview (OLA)", page: "OLA", table: "ola_vendor_health_mat", columns: "platform, skus_tracked, availability_pct, must_have_availability_pct, sku_reliability_pct" },
  { component: "ExecutionDiagnostics (OLA)", page: "OLA", table: "ola_vendor_health_mat, ola_category_health_mat, ola_pincode_volatility_mat, ola_weekly_trend_mat", columns: "platform, skus_tracked, availability_pct, must_have_availability_pct, sku_reliability_pct, business_group, location, avg_availability, volatility_index, week" },
  { component: "KeyTakeaways (OLA)", page: "OLA", table: "ola_exec_summary_mat, ola_weekly_trend_mat", columns: "platform, availability_pct, must_have_availability_pct, week" },

  // SOS Page
  { component: "ShareOfSearch (Exec Snapshot)", page: "SOS", table: "sos_exec_summary_mat", columns: "platform, top10_presence_pct, elite_rank_share_pct" },
  { component: "ShareOfSearch (Rank Distribution)", page: "SOS", table: "sos_rank_distribution_mat", columns: "rank_bucket, listing_count, platform" },
  { component: "ShareOfSearch (Keyword Volatility)", page: "SOS", table: "sos_keyword_volatility_mat", columns: "search_keyword, mean_rank, rank_volatility, platform" },
  { component: "ShareOfSearch (Keyword Risk)", page: "SOS", table: "sos_keyword_risk_mat", columns: "search_keyword, mean_rank, performance_band, platform" },
  { component: "SearchVisibilityTrendChart", page: "SOS", table: "sos_weekly_trend_mat", columns: "week, platform, top10_presence_pct, elite_rank_share_pct" },
  { component: "VendorHealthOverview (SOS)", page: "SOS", table: "sos_vendor_health_mat", columns: "platform, keywords_tracked, top10_presence_pct, elite_rank_share_pct, organic_share_pct, avg_rank_volatility" },
  { component: "ExecutionDiagnostics (SOS)", page: "SOS", table: "sos_vendor_health_mat, sos_keyword_risk_mat, sos_weekly_trend_mat", columns: "platform, keywords_tracked, top10_presence_pct, elite_rank_share_pct, avg_rank_volatility, search_keyword, performance_band, week" },
  { component: "KeyTakeaways (SOS)", page: "SOS", table: "sos_exec_summary_mat, sos_weekly_trend_mat", columns: "platform, top10_presence_pct, elite_rank_share_pct, week" },

  // Cross-module
  { component: "AlignmentInsight", page: "Executive", table: "cross_platform_correlation_mat", columns: "platform, alignment_correlation" },
  { component: "DateRangeFilter", page: "Global", table: "ola_weekly_trend_mat, sos_weekly_trend_mat", columns: "week" },
];

export default function DataLineage() {
  return (
    <div className="min-h-screen bg-background p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Data Source Map</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Which Supabase table each dashboard component reads from. Static reference only.
      </p>
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Component</TableHead>
              <TableHead className="font-semibold">Page</TableHead>
              <TableHead className="font-semibold">Supabase Table</TableHead>
              <TableHead className="font-semibold">Columns Used</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DATA_SOURCE_MAP.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium text-foreground">{row.component}</TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                    row.page === "OLA" ? "bg-blue-500/10 text-blue-600" :
                    row.page === "SOS" ? "bg-purple-500/10 text-purple-600" :
                    row.page === "Executive" ? "bg-amber-500/10 text-amber-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {row.page}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{row.table}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs">{row.columns}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
