"use client";

import { useMemo } from "react";
import { AgrifoodRecord } from "@/lib/types";

interface NutritionStatsProps {
  rawData: AgrifoodRecord[];
}

interface NutritionStat {
  label: string;
  description: string;
  avgLabel: string;
  yearRange: string;
  count: number;
}

export default function NutritionStats({ rawData }: NutritionStatsProps) {
  const nutritionStats = useMemo(() => {
    const percentFormatter = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
    });

    const buildStat = (
      label: string,
      description: string,
      values: Array<{ value: number | null | undefined; year: number }>
    ): NutritionStat => {
      const valid = values.filter(
        (item) => typeof item.value === "number" && item.value > 0
      ) as Array<{ value: number; year: number }>;

      if (valid.length === 0) {
        return {
          label,
          description,
          avgLabel: "No data",
          yearRange: "No valid years",
          count: 0,
        };
      }

      const total = valid.reduce((sum, item) => sum + item.value, 0);
      const avg = total / valid.length;
      const years = valid.map((item) => item.year);
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);

      return {
        label,
        description,
        avgLabel: `${percentFormatter.format(avg)}%`,
        yearRange: `${minYear}–${maxYear}`,
        count: valid.length,
      };
    };

    return [
      buildStat(
        "Dietary energy adequacy",
        "Percentage of dietary energy (calories) available compared to what the population needs.",
        rawData.map((record) => ({
          value: record.dietary_energy_adequacy_pct,
          year: record.year,
        }))
      ),
      buildStat(
        "Child wasting",
        "Percentage of children under 5 who are too thin for their height.",
        rawData.map((record) => ({
          value: record.child_wasting_pct,
          year: record.year,
        }))
      ),
      buildStat(
        "Prevalence of undernourishment",
        "Share of the population that consistently does not consume enough calories.",
        rawData.map((record) => ({
          value: record.prevalence_undernourishment_pct,
          year: record.year,
        }))
      ),
    ];
  }, [rawData]);

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      {nutritionStats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4"
        >
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {stat.label}
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {stat.avgLabel}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Average across {stat.yearRange} • {stat.count.toLocaleString()} records
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
}
