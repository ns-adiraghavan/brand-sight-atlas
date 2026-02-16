import { useEffect, useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Search } from "lucide-react";

interface VendorHealth {
  platform: string;
  availability_pct: number | null;
  skus_tracked: number | null;
}

interface VendorSearch {
  platform: string;
  top10_presence_pct: number | null;
  keywords_tracked: number | null;
}

export function VendorHealthOverview() {
  const [health, setHealth] = useState<VendorHealth[]>([]);
  const [search, setSearch] = useState<VendorSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("vendor_health_overview").select("platform, availability_pct, skus_tracked"),
      supabase.from("vendor_search_overview").select("platform, top10_presence_pct, keywords_tracked"),
    ]).then(([hRes, sRes]) => {
      if (hRes.data) setHealth(hRes.data as VendorHealth[]);
      if (sRes.data) setSearch(sRes.data as VendorSearch[]);
      setLoading(false);
    });
  }, []);

  // Merge by platform
  const platforms = Array.from(new Set([...health.map(h => h.platform), ...search.map(s => s.platform)])).filter(Boolean);

  return (
    <section>
      <SectionHeader
        title="Vendor Health Overview"
        subtitle="Cross-platform tracking coverage and headline performance"
      />

      <div className="bg-card rounded-xl border border-border p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
        ) : platforms.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No vendor data available</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {platforms.map((platform) => {
                const h = health.find(r => r.platform === platform);
                const s = search.find(r => r.platform === platform);
                return (
                  <div key={platform} className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3 capitalize">{platform}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {/* SKUs Tracked */}
                      <div className="flex items-start gap-2">
                        <Activity className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-lg font-bold text-foreground">{h?.skus_tracked?.toLocaleString() ?? "—"}</p>
                          <p className="text-[10px] text-muted-foreground">SKUs Tracked</p>
                        </div>
                      </div>
                      {/* Keywords Tracked */}
                      <div className="flex items-start gap-2">
                        <Search className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-lg font-bold text-foreground">{s?.keywords_tracked?.toLocaleString() ?? "—"}</p>
                          <p className="text-[10px] text-muted-foreground">Keywords Tracked</p>
                        </div>
                      </div>
                      {/* Availability % */}
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {h?.availability_pct != null ? `${(h.availability_pct * 100).toFixed(1)}%` : "—"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Availability %</p>
                      </div>
                      {/* Top10 Presence % */}
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {s?.top10_presence_pct != null ? `${(s.top10_presence_pct * 100).toFixed(1)}%` : "—"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Top10 Presence %</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Vendor comparisons normalized by tracked SKU/keyword coverage.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
