import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VendorHealthOLA {
  platform: string;
  availability_pct: number | null;
  must_have_availability_pct: number | null;
  sku_reliability_pct: number | null;
}

interface VendorHealthSoS {
  platform: string;
  top10_presence_pct: number | null;
  elite_rank_share_pct: number | null;
  organic_share_pct: number | null;
}

interface WeeklyTrendOLA {
  week: string;
  platform: string;
  availability_pct: number | null;
}

interface WeeklyTrendSoS {
  week: string;
  platform: string;
  top10_presence_pct: number | null;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pct(v: number | null) {
  return v != null ? `${(v * 100).toFixed(0)}%` : "—";
}

function trendDirection(rows: { week: string; value: number | null }[]): "up" | "down" | "flat" {
  if (rows.length < 2) return "flat";
  const sorted = [...rows].sort((a, b) => a.week.localeCompare(b.week));
  const recent = sorted.slice(-2);
  const diff = (recent[1].value ?? 0) - (recent[0].value ?? 0);
  if (diff > 0.005) return "up";
  if (diff < -0.005) return "down";
  return "flat";
}

interface KeyTakeawaysProps {
  variant: "ola" | "sos";
}

export function KeyTakeaways({ variant }: KeyTakeawaysProps) {
  const [bullets, setBullets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (variant === "ola") {
        const [healthRes, trendRes] = await Promise.all([
          supabase.from("ola_vendor_health_mat").select("platform, availability_pct, must_have_availability_pct, sku_reliability_pct"),
          supabase.from("ola_weekly_trend_mat").select("week, platform, availability_pct").order("week", { ascending: true }),
        ]);

        const health = (healthRes.data ?? []) as VendorHealthOLA[];
        const trend = (trendRes.data ?? []) as WeeklyTrendOLA[];

        if (health.length === 0) { setLoading(false); return; }

        const sorted = [...health].sort((a, b) => (b.availability_pct ?? 0) - (a.availability_pct ?? 0));
        const top = sorted[0];
        const bottom = sorted[sorted.length - 1];

        // Bullet 1: vendor comparison
        const b1 = sorted.length > 1 && top.platform !== bottom.platform
          ? `${cap(top.platform)} leads availability at ${pct(top.availability_pct)}; ${cap(bottom.platform)} lags at ${pct(bottom.availability_pct)}.`
          : `Overall availability is ${pct(top.availability_pct)} across platforms.`;

        // Bullet 2: trend
        const weeklyAgg = new Map<string, number[]>();
        for (const r of trend) {
          if (r.week && r.availability_pct != null) {
            const arr = weeklyAgg.get(r.week) || [];
            arr.push(r.availability_pct);
            weeklyAgg.set(r.week, arr);
          }
        }
        const avgByWeek = Array.from(weeklyAgg.entries()).map(([week, vals]) => ({
          week,
          value: vals.reduce((s, v) => s + v, 0) / vals.length,
        }));
        const dir = trendDirection(avgByWeek);
        const b2 = dir === "up"
          ? "Availability has been improving over the last few weeks."
          : dir === "down"
            ? "Availability has been declining over the last few weeks."
            : "Availability has remained steady over the last few weeks.";

        // Bullet 3: action
        const mustHaveLow = health.find(h => (h.must_have_availability_pct ?? 1) < 0.9);
        const b3 = mustHaveLow
          ? `Focus on must-have products on ${cap(mustHaveLow.platform)} where gaps are largest.`
          : "Maintain current replenishment discipline across all platforms.";

        setBullets([b1, b2, b3]);
      } else {
        const [healthRes, trendRes] = await Promise.all([
          supabase.from("sos_vendor_health_mat").select("platform, top10_presence_pct, elite_rank_share_pct, organic_share_pct"),
          supabase.from("sos_weekly_trend_mat").select("week, platform, top10_presence_pct").order("week", { ascending: true }),
        ]);

        const health = (healthRes.data ?? []) as VendorHealthSoS[];
        const trend = (trendRes.data ?? []) as WeeklyTrendSoS[];

        if (health.length === 0) { setLoading(false); return; }

        const sorted = [...health].sort((a, b) => (b.top10_presence_pct ?? 0) - (a.top10_presence_pct ?? 0));
        const top = sorted[0];
        const bottom = sorted[sorted.length - 1];

        // Bullet 1: vendor comparison
        const b1 = sorted.length > 1 && top.platform !== bottom.platform
          ? `${cap(top.platform)} holds stronger page-1 presence at ${pct(top.top10_presence_pct)} vs ${cap(bottom.platform)} at ${pct(bottom.top10_presence_pct)}.`
          : `Page-1 presence is ${pct(top.top10_presence_pct)} across platforms.`;

        // Bullet 2: trend
        const weeklyAgg = new Map<string, number[]>();
        for (const r of trend) {
          if (r.week && r.top10_presence_pct != null) {
            const arr = weeklyAgg.get(r.week) || [];
            arr.push(r.top10_presence_pct);
            weeklyAgg.set(r.week, arr);
          }
        }
        const avgByWeek = Array.from(weeklyAgg.entries()).map(([week, vals]) => ({
          week,
          value: vals.reduce((s, v) => s + v, 0) / vals.length,
        }));
        const dir = trendDirection(avgByWeek);
        const b2 = dir === "up"
          ? "Search visibility has been trending upward recently."
          : dir === "down"
            ? "Search visibility has been slipping over recent weeks."
            : "Search visibility has held steady over recent weeks.";

        // Bullet 3: action
        const lowElite = health.find(h => (h.elite_rank_share_pct ?? 1) < 0.3);
        const b3 = lowElite
          ? `Improve top-3 rankings on ${cap(lowElite.platform)} to increase click-through rates.`
          : "Continue optimising keyword bids to sustain strong positions.";

        setBullets([b1, b2, b3]);
      }
      setLoading(false);
    }
    load();
  }, [variant]);

  if (loading || bullets.length === 0) return null;

  return (
    <section className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Key Takeaways</h3>
      </div>
      <ul className="space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-foreground leading-snug">
            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}
