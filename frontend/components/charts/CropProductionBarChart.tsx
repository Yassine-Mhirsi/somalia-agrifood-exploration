"use client";

import { useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { AgrifoodRecord } from "@/lib/types";

interface CropProductionBarChartProps {
  data: AgrifoodRecord[];
  selectedRegions?: string[];
  width?: number;
  height?: number;
  maxBars?: number;
}

interface ProductionByRegion {
  admin1: string;
  commodity: string;
  totalProductionValue: number;
}

const YEAR_SNAPSHOT = 2018;

export default function CropProductionBarChart({
  data,
  selectedRegions = [],
  width = 520,
  height = 420,
  maxBars = 18,
}: CropProductionBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({ show: false, x: 0, y: 0, content: "" });

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const productionRecords = useMemo(() => {
    return data.filter((record) => {
      if (record.year !== YEAR_SNAPSHOT) return false;
      if (!record.crop_production_value_usd || record.crop_production_value_usd <= 0) {
        return false;
      }
      if (selectedRegions.length > 0 && !selectedRegions.includes(record.admin1)) {
        return false;
      }
      return true;
    });
  }, [data, selectedRegions]);

  const commodityTargets = useMemo(
    () =>
      [
        { key: "maize", label: "Maize", color: "#f59e0b" },
        { key: "rice", label: "Rice", color: "#3b82f6" },
      ] as const,
    []
  );

  const regionOrder = useMemo(() => {
    const filtered = productionRecords.filter((record) =>
      commodityTargets.some((target) =>
        record.commodity.toLowerCase().includes(target.key)
      )
    );
    const totals = d3.rollup(
      filtered,
      (records) => d3.sum(records, (record) => record.crop_production_value_usd || 0),
      (record) => record.admin1
    );
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxBars)
      .map(([admin1]) => admin1);
  }, [productionRecords, commodityTargets, maxBars]);

  const barData: ProductionByRegion[] = useMemo(() => {
    const grouped = d3.rollup(
      productionRecords.filter((record) =>
        commodityTargets.some((target) =>
          record.commodity.toLowerCase().includes(target.key)
        )
      ),
      (records) => d3.sum(records, (record) => record.crop_production_value_usd || 0),
      (record) => record.admin1,
      (record) =>
        commodityTargets.find((target) =>
          record.commodity.toLowerCase().includes(target.key)
        )?.label || "Other"
    );

    const rows: ProductionByRegion[] = [];
    regionOrder.forEach((admin1) => {
      const commodityMap = grouped.get(admin1);
      if (!commodityMap) return;
      commodityTargets.forEach((target) => {
        const totalProductionValue = commodityMap.get(target.label) || 0;
        if (totalProductionValue > 0) {
          rows.push({
            admin1,
            commodity: target.label,
            totalProductionValue,
          });
        }
      });
    });

    return rows;
  }, [productionRecords, commodityTargets, regionOrder]);

  const margin = { top: 10, right: 30, bottom: 30, left: 150 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xMax = d3.max(barData, (d) => d.totalProductionValue) || 0;
  const xScale = d3
    .scaleLinear()
    .domain([0, xMax * 1.1])
    .range([0, innerWidth]);

  const regions = regionOrder.length > 0 ? regionOrder : Array.from(new Set(barData.map((d) => d.admin1)));
  const yScale = d3
    .scaleBand()
    .domain(regions)
    .range([0, innerHeight])
    .padding(0.25);

  const ySubScale = d3
    .scaleBand()
    .domain(commodityTargets.map((target) => target.label))
    .range([0, yScale.bandwidth()])
    .padding(0.15);

  const xTicks = xScale.ticks(5).map((tick) => ({
    value: tick,
    offset: xScale(tick),
  }));

  const handleMouseMove = (
    e: React.MouseEvent<SVGRectElement>,
    item: ProductionByRegion
  ) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        show: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        content: `${item.admin1} • ${item.commodity}: ${currencyFormatter.format(
          item.totalProductionValue
        )}`,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  if (barData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-zinc-500"
        style={{ width, height }}
      >
        No maize/rice production data available for 2018
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          2018 snapshot of crop production value (USD) for maize and rice.
        </p>
      </div>

      <div className="relative">
        <svg ref={svgRef} width={width} height={height}>
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {xTicks.map(({ value, offset }) => (
              <g key={value} transform={`translate(${offset}, 0)`}>
                <line
                  y1={0}
                  y2={innerHeight}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  className="text-zinc-400"
                />
              </g>
            ))}

            {/* X-axis */}
            <g transform={`translate(0, ${innerHeight})`}>
              {xTicks.map(({ value, offset }) => (
                <g key={value} transform={`translate(${offset}, 0)`}>
                  <text
                    y={16}
                    textAnchor="middle"
                    fontSize={10}
                    fill="currentColor"
                    className="text-zinc-500 dark:text-zinc-400"
                  >
                    {d3.format("$,.2s")(value)}
                  </text>
                </g>
              ))}
              <text
                x={innerWidth / 2}
                y={28}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
                className="text-zinc-500 dark:text-zinc-400"
              >
                Crop production value (USD)
              </text>
            </g>

            {/* Y-axis labels */}
            {regions.map((admin1) => (
              <text
                key={admin1}
                x={-10}
                y={(yScale(admin1) || 0) + yScale.bandwidth() / 2}
                textAnchor="end"
                fontSize={11}
                fill="currentColor"
                dominantBaseline="middle"
                className="text-zinc-600 dark:text-zinc-400"
              >
                {admin1.length > 18 ? `${admin1.slice(0, 18)}...` : admin1}
              </text>
            ))}

            {/* Bars */}
            {barData.map((item) => (
              <rect
                key={`${item.admin1}-${item.commodity}`}
                x={0}
                y={
                  (yScale(item.admin1) || 0) +
                  (ySubScale(item.commodity) || 0)
                }
                width={xScale(item.totalProductionValue)}
                height={ySubScale.bandwidth()}
                fill={
                  commodityTargets.find((target) => target.label === item.commodity)
                    ?.color || "#10b981"
                }
                rx={3}
                className="transition-opacity hover:opacity-80 cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, item)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </g>
        </svg>

        {tooltip.show && (
          <div
            className="absolute pointer-events-none bg-zinc-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10"
            style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}
          >
            {tooltip.content}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        {commodityTargets.map((target) => (
          <div key={target.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: target.color }}
            />
            <span>{target.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
