"use client";

import { useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { AgrifoodRecord } from "@/lib/types";

interface ProductionVsPriceScatterProps {
  data: AgrifoodRecord[];
  selectedRegions?: string[];
  width?: number;
  height?: number;
}

interface ScatterPoint {
  admin1: string;
  commodity: string;
  productionValue: number;
  avgPrice: number;
  priceCount: number;
}

const YEAR_SNAPSHOT = 2018;

export default function ProductionVsPriceScatter({
  data,
  selectedRegions = [],
  width = 520,
  height = 420,
}: ProductionVsPriceScatterProps) {
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

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const candidateRecords = useMemo(() => {
    return data.filter((record) => {
      if (record.year !== YEAR_SNAPSHOT) return false;
      if (!record.crop_production_value_usd || record.crop_production_value_usd <= 0) {
        return false;
      }
      if (record.usdprice === null) return false;
      if (selectedRegions.length > 0 && !selectedRegions.includes(record.admin1)) {
        return false;
      }
      return true;
    });
  }, [data, selectedRegions]);

  const commodityOptions = useMemo(() => {
    const commodities = new Set(
      data
        .filter(
          (record) =>
            record.year === YEAR_SNAPSHOT &&
            record.crop_production_value_usd !== null &&
            record.crop_production_value_usd > 0
        )
        .map((record) => record.commodity)
    );
    return Array.from(commodities).sort();
  }, [data]);

  const points: ScatterPoint[] = useMemo(() => {
    const grouped = new Map<
      string,
      { admin1: string; commodity: string; productionTotal: number; count: number; priceTotal: number; priceCount: number }
    >();

    candidateRecords.forEach((record) => {
      const key = `${record.admin1}__${record.commodity}`;
      const existing =
        grouped.get(key) || {
          admin1: record.admin1,
          commodity: record.commodity,
          productionTotal: 0,
          count: 0,
          priceTotal: 0,
          priceCount: 0,
        };
      existing.productionTotal += record.crop_production_value_usd || 0;
      existing.count += 1;
      existing.priceTotal += record.usdprice || 0;
      existing.priceCount += 1;
      grouped.set(key, existing);
    });

    return Array.from(grouped.values()).map((item) => ({
      admin1: item.admin1,
      commodity: item.commodity,
      productionValue: item.productionTotal / item.count,
      avgPrice: item.priceTotal / item.priceCount,
      priceCount: item.priceCount,
    }));
  }, [candidateRecords]);

  const margin = { top: 10, right: 30, bottom: 50, left: 90 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const productionExtent = d3.extent(points, (d) => d.productionValue) as [
    number,
    number
  ];
  const priceMax = d3.max(points, (d) => d.avgPrice) || 0;

  const xScale = d3
    .scaleLinear()
    .domain([0, (productionExtent[1] || 1) * 1.1])
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, priceMax * 1.15])
    .range([innerHeight, 0]);

  const commodityScale = d3
    .scaleOrdinal<string, string>()
    .domain(commodityOptions)
    .range(d3.schemeTableau10);

  const xTicks = xScale.ticks(5).map((tick) => ({
    value: tick,
    offset: xScale(tick),
  }));

  const yTicks = yScale.ticks(5).map((tick) => ({
    value: tick,
    offset: yScale(tick),
  }));

  const handleMouseMove = (
    e: React.MouseEvent<SVGCircleElement>,
    point: ScatterPoint
  ) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        show: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        content: `${point.admin1} • ${point.commodity}\nAvg price: ${priceFormatter.format(
          point.avgPrice
        )}\nProduction: ${currencyFormatter.format(point.productionValue)}`,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-zinc-500"
        style={{ width, height }}
      >
        No production-price matches for 2018
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        Each point links average food price to crop production value (2018).
      </div>

      <div className="relative">
        <svg ref={svgRef} width={width} height={height}>
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {yTicks.map(({ value, offset }) => (
              <g key={value} transform={`translate(0, ${offset})`}>
                <line
                  x1={0}
                  x2={innerWidth}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  className="text-zinc-400"
                />
              </g>
            ))}

            {/* X-axis */}
            <g transform={`translate(0, ${innerHeight})`}>
              <line
                x1={0}
                x2={innerWidth}
                stroke="currentColor"
                className="text-zinc-300 dark:text-zinc-600"
              />
              {xTicks.map(({ value, offset }) => (
                <g key={value} transform={`translate(${offset}, 0)`}>
                  <line
                    y2={6}
                    stroke="currentColor"
                    className="text-zinc-300 dark:text-zinc-600"
                  />
                  <text
                    y={20}
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
                y={34}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
                className="text-zinc-500 dark:text-zinc-400"
              >
                Crop production value (USD)
              </text>
            </g>

            {/* Y-axis */}
            <g>
              <line
                y1={0}
                y2={innerHeight}
                stroke="currentColor"
                className="text-zinc-300 dark:text-zinc-600"
              />
              {yTicks.map(({ value, offset }) => (
                <g key={value} transform={`translate(0, ${offset})`}>
                  <line
                    x2={-6}
                    stroke="currentColor"
                    className="text-zinc-300 dark:text-zinc-600"
                  />
                  <text
                    x={-10}
                    textAnchor="end"
                    fontSize={10}
                    fill="currentColor"
                    dominantBaseline="middle"
                    className="text-zinc-500 dark:text-zinc-400"
                  >
                    {priceFormatter.format(value)}
                  </text>
                </g>
              ))}
              <text
                x={-55}
                y={innerHeight / 2}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
                transform={`rotate(-90, -55, ${innerHeight / 2})`}
                className="text-zinc-500 dark:text-zinc-400"
              >
                Average price (USD)
              </text>
            </g>

            {/* Points */}
            {points.map((point) => (
              <circle
                key={`${point.admin1}-${point.commodity}`}
                cx={xScale(point.productionValue)}
                cy={yScale(point.avgPrice)}
                r={5}
                fill={commodityScale(point.commodity)}
                opacity={0.85}
                className="cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, point)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </g>
        </svg>

        {tooltip.show && (
          <div
            className="absolute pointer-events-none bg-zinc-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-pre-line"
            style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}
          >
            {tooltip.content}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        {commodityOptions.map((commodity) => (
          <div key={commodity} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: commodityScale(commodity) }}
            />
            <span>{commodity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
