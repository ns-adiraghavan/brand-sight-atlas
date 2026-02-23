import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, ShieldCheck, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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

function pctDiff(v: number | null) {
  if (v == null) return null;
  const val = (v * 100);
  return val >= 0 ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`;
}

function trendDirection(rows: { week: string; value: number | null }[]): { dir: "up" | "down" | "flat"; diff: number } {
  if (rows.length < 2) return { dir: "flat", diff: 0 };
  const sorted = [...rows].sort((a, b) => a.week.localeCompare(b.week));
  const recent = sorted.slice(-2);
  const diff = (recent[1].value ?? 0) - (recent[0].value ?? 0);
  if (diff > 0.005) return { dir: "up", diff };
  if (diff < -0.005) return { dir: "down", diff };
  return { dir: "flat", diff: 0 };
}

type TrendDir = "up" | "down" | "flat";

interface InsightCard {
  icon: typeof ShieldCheck;
  headline: string;
  explanation: string;
  metric: string;
  trend: TrendDir;
  tint: "green" | "red" | "amber";
}

interface KeyTakeawaysProps {
  variant: "ola" | "sos";
}

const tintStyles: Record<string, string> = {
  green: "bg-emerald-500/8 border-emerald-500/20",
  red: "bg-red-500/8 border-red-500/20",
  amber: "bg-amber-500/8 border-amber-500/20",
};

const tintIconBg: Record<string, string> = {
  green: "bg-emerald-500/15 text-emerald-600",
  red: "bg-red-500/15 text-red-600",
  amber: "bg-amber-500/15 text-amber-600",
};

const trendColor: Record<TrendDir, string> = {
  up: "text-emerald-600",
  down: "text-red-500",
  flat: "text-amber-500",
};

const TrendIcon = ({ dir }: { dir: TrendDir }) => {
  if (dir === "up") return <TrendingUp className="w-3.5 h-3.5" />;
  if (dir === "down") return <TrendingDown className="w-3.5 h-3.5" />;
  return <Minus className="w-3.5 h-3.5" />;
};

export function KeyTakeaways({ variant }: KeyTakeawaysProps) {
  const [cards, setCards] = useState<InsightCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (variant === "ola") {
        // Get latest week from ola_exec_summary_mat for exec data
        const latestWeekRes = await supabase.from("ola_exec_summary_mat").select("week").order("week", { ascending: false }).limit(1);
        const latestWeek = latestWeekRes.data?.[0]?.week;
        const [execRes, trendRes] = await Promise.all([
          latestWeek
            ? supabase.from("ola_exec_summary_mat").select("platform, availability_pct, must_have_availability_pct").eq("week", latestWeek)
            : Promise.resolve({ data: [] }),
          supabase.from("ola_weekly_trend_mat").select("week, platform, availability_pct")
            .order("week", { ascending: true }),
        ]);

        const health = (execRes.data ?? []).filter((r: any) => r.platform) as { platform: string; availability_pct: number | null; must_have_availability_pct: number | null }[];
        const trend = (trendRes.data ?? []) as WeeklyTrendOLA[];

        if (health.length === 0) { setLoading(false); return; }

        const sorted = [...health].sort((a, b) => (b.availability_pct ?? 0) - (a.availability_pct ?? 0));
        const top = sorted[0];
        const bottom = sorted[sorted.length - 1];

        const gap = ((top.availability_pct ?? 0) - (bottom.availability_pct ?? 0));
        const card1: InsightCard = {
          icon: Target,
          headline: sorted.length > 1 && top.platform !== bottom.platform
            ? `${cap(top.platform)} Leads Availability`
            : "Availability Consistent",
          explanation: sorted.length > 1 && top.platform !== bottom.platform
            ? `${cap(bottom.platform)} trails at ${pct(bottom.availability_pct)}`
            : `All platforms at ${pct(top.availability_pct)}`,
          metric: sorted.length > 1 && top.platform !== bottom.platform
            ? `${pct(top.availability_pct)} vs ${pct(bottom.availability_pct)}`
            : pct(top.availability_pct),
          trend: gap > 0.05 ? "down" : "up",
          tint: gap > 0.1 ? "red" : gap > 0.05 ? "amber" : "green",
        };

        // Card 2: trend (uses all trend data, no date filter)
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
        const { dir, diff } = trendDirection(avgByWeek);
        const card2: InsightCard = {
          icon: TrendingUp,
          headline: dir === "up" ? "Availability Improving" : dir === "down" ? "Availability Declining" : "Availability Steady",
          explanation: dir === "up"
            ? "Upward momentum over recent weeks"
            : dir === "down"
              ? "Downward drift needs attention"
              : "Holding steady across weeks",
          metric: pctDiff(diff) ?? "0%",
          trend: dir,
          tint: dir === "up" ? "green" : dir === "down" ? "red" : "amber",
        };

        // Card 3: action
        const mustHaveLow = health.find(h => (h.must_have_availability_pct ?? 1) < 0.9);
        const card3: InsightCard = {
          icon: mustHaveLow ? Zap : ShieldCheck,
          headline: mustHaveLow
            ? `Fix ${cap(mustHaveLow.platform)} Must-Haves`
            : "Replenishment On Track",
          explanation: mustHaveLow
            ? `Must-have gaps at ${pct(mustHaveLow.must_have_availability_pct)}`
            : "All must-have SKUs well stocked",
          metric: mustHaveLow
            ? pct(mustHaveLow.must_have_availability_pct)
            : "✓ 90%+",
          trend: mustHaveLow ? "down" : "up",
          tint: mustHaveLow ? "red" : "green",
        };

        setCards([card1, card2, card3]);
      } else {
        const [execRes, trendRes] = await Promise.all([
          supabase.from("sos_exec_summary").select("platform, top10_presence_pct, elite_rank_share_pct"),
          supabase.from("sos_weekly_trend_mat").select("week, platform, top10_presence_pct")
            .order("week", { ascending: true }),
        ]);

        const health = (execRes.data ?? []).filter((r: any) => r.platform) as { platform: string; top10_presence_pct: number | null; elite_rank_share_pct: number | null }[];
        const trend = (trendRes.data ?? []) as WeeklyTrendSoS[];

        if (health.length === 0) { setLoading(false); return; }

        const sorted = [...health].sort((a, b) => (b.top10_presence_pct ?? 0) - (a.top10_presence_pct ?? 0));
        const top = sorted[0];
        const bottom = sorted[sorted.length - 1];

        const gap = ((top.top10_presence_pct ?? 0) - (bottom.top10_presence_pct ?? 0));
        const card1: InsightCard = {
          icon: Target,
          headline: sorted.length > 1 && top.platform !== bottom.platform
            ? `${cap(top.platform)} Wins Page 1`
            : "Page 1 Presence Uniform",
          explanation: sorted.length > 1 && top.platform !== bottom.platform
            ? `${cap(bottom.platform)} at ${pct(bottom.top10_presence_pct)}`
            : `All platforms at ${pct(top.top10_presence_pct)}`,
          metric: sorted.length > 1 && top.platform !== bottom.platform
            ? `${pct(top.top10_presence_pct)} vs ${pct(bottom.top10_presence_pct)}`
            : pct(top.top10_presence_pct),
          trend: gap > 0.05 ? "down" : "up",
          tint: gap > 0.1 ? "red" : gap > 0.05 ? "amber" : "green",
        };

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
        const { dir, diff } = trendDirection(avgByWeek);
        const card2: InsightCard = {
          icon: TrendingUp,
          headline: dir === "up" ? "Visibility Trending Up" : dir === "down" ? "Visibility Slipping" : "Visibility Holding",
          explanation: dir === "up"
            ? "Search presence gaining momentum"
            : dir === "down"
              ? "Losing ground on key terms"
              : "Stable search performance",
          metric: pctDiff(diff) ?? "0%",
          trend: dir,
          tint: dir === "up" ? "green" : dir === "down" ? "red" : "amber",
        };

        const lowElite = health.find(h => (h.elite_rank_share_pct ?? 1) < 0.3);
        const card3: InsightCard = {
          icon: lowElite ? Zap : ShieldCheck,
          headline: lowElite
            ? `Boost ${cap(lowElite.platform)} Rankings`
            : "Rankings Well Positioned",
          explanation: lowElite
            ? `Elite rank share only ${pct(lowElite.elite_rank_share_pct)}`
            : "Strong top-3 presence maintained",
          metric: lowElite
            ? pct(lowElite.elite_rank_share_pct)
            : "✓ 30%+",
          trend: lowElite ? "down" : "up",
          tint: lowElite ? "red" : "green",
        };

        setCards([card1, card2, card3]);
      }
      setLoading(false);
    }
    load();
  }, [variant]);

  if (loading || cards.length === 0) return null;

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={cn(
                "relative rounded-xl border px-4 py-4 flex flex-col gap-2.5 transition-shadow hover:shadow-md",
                tintStyles[card.tint]
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className={cn("p-1.5 rounded-lg shrink-0", tintIconBg[card.tint])}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-foreground leading-tight tracking-tight">
                    {card.headline}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {card.explanation}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-foreground/5">
                <span className="text-base font-semibold text-foreground tracking-tight">
                  {card.metric}
                </span>
                <span className={cn("flex items-center gap-1 text-xs font-semibold", trendColor[card.trend])}>
                  <TrendIcon dir={card.trend} />
                  {card.trend === "up" ? "Improving" : card.trend === "down" ? "Declining" : "Steady"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
