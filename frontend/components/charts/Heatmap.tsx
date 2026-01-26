"use client";

import { useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { HeatmapCell } from "@/lib/types";

interface HeatmapProps {
  data: HeatmapCell[];
  width?: number;
  height?: number;
  maxCommodities?: number;
}

export default function Heatmap({
  data,
  width = 600,
  height = 400,
  maxCommodities = 12,
}: HeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({ show: false, x: 0, y: 0, content: "" });

  const margin = { top: 100, right: 30, bottom: 20, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Get unique regions and commodities
  const regions = useMemo(() => {
    return [...new Set(data.map((d) => d.admin1))].sort();
  }, [data]);

  // Get top commodities by average value
  const commodities = useMemo(() => {
    const commodityAvgs = new Map<string, { total: number; count: number }>();
    data.forEach((d) => {
      if (d.value !== null) {
        const existing = commodityAvgs.get(d.commodity) || { total: 0, count: 0 };
        existing.total += d.value;
        existing.count += 1;
        commodityAvgs.set(d.commodity, existing);
      }
    });
    return [...commodityAvgs.entries()]
      .sort((a, b) => b[1].total / b[1].count - a[1].total / a[1].count)
      .slice(0, maxCommodities)
      .map(([name]) => name);
  }, [data, maxCommodities]);

  // Filter data to only include selected commodities
  const filteredData = useMemo(() => {
    return data.filter((d) => commodities.includes(d.commodity));
  }, [data, commodities]);

  // Get min/max values for color scale
  const values = filteredData.map((d) => d.value).filter((v): v is number => v !== null);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 100;

  // Scales
  const xScale = d3
    .scaleBand()
    .domain(commodities)
    .range([0, innerWidth])
    .padding(0.05);

  const yScale = d3
    .scaleBand()
    .domain(regions)
    .range([0, innerHeight])
    .padding(0.05);

  // Color scale
  const colorScale = d3
    .scaleSequential(d3.interpolateYlOrRd)
    .domain([minValue, maxValue]);

  // Create data lookup map
  const dataMap = useMemo(() => {
    const map = new Map<string, number | null>();
    filteredData.forEach((d) => {
      map.set(`${d.admin1}-${d.commodity}`, d.value);
    });
    return map;
  }, [filteredData]);

  const handleMouseMove = (
    e: React.MouseEvent<SVGRectElement>,
    region: string,
    commodity: string
  ) => {
    const value = dataMap.get(`${region}-${commodity}`);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        show: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        content: value !== null ? `${region} / ${commodity}: $${value.toFixed(2)}` : `${region} / ${commodity}: No data`,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  if (filteredData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-zinc-500"
        style={{ width, height }}
      >
        No data available
      </div>
    );
  }

  return (
    <div className="relative">
      <svg ref={svgRef} width={width} height={height}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* X-axis labels (commodities) - rotated */}
          {commodities.map((commodity) => (
            <g
              key={commodity}
              transform={`translate(${(xScale(commodity) || 0) + xScale.bandwidth() / 2}, -10)`}
            >
              <text
                transform="rotate(-45)"
                textAnchor="end"
                fontSize={10}
                fill="currentColor"
                className="text-zinc-600 dark:text-zinc-400"
              >
                {commodity.length > 15 ? commodity.slice(0, 15) + "..." : commodity}
              </text>
            </g>
          ))}

          {/* Y-axis labels (regions) */}
          {regions.map((region) => (
            <text
              key={region}
              x={-10}
              y={(yScale(region) || 0) + yScale.bandwidth() / 2}
              textAnchor="end"
              fontSize={10}
              fill="currentColor"
              dominantBaseline="middle"
              className="text-zinc-600 dark:text-zinc-400"
            >
              {region.length > 15 ? region.slice(0, 15) + "..." : region}
            </text>
          ))}

          {/* Heatmap cells */}
          {regions.map((region) =>
            commodities.map((commodity) => {
              const value = dataMap.get(`${region}-${commodity}`);
              return (
                <rect
                  key={`${region}-${commodity}`}
                  x={xScale(commodity) || 0}
                  y={yScale(region) || 0}
                  width={xScale.bandwidth()}
                  height={yScale.bandwidth()}
                  fill={value !== null ? colorScale(value) : "#f4f4f5"}
                  rx={2}
                  className="transition-opacity hover:opacity-80 cursor-pointer"
                  onMouseMove={(e) => handleMouseMove(e, region, commodity)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })
          )}
        </g>

        {/* Legend */}
        <g transform={`translate(${width - 120}, ${margin.top - 30})`}>
          <text
            x={0}
            y={-5}
            fontSize={10}
            fill="currentColor"
            className="text-zinc-500 dark:text-zinc-400"
          >
            Avg Price (USD)
          </text>
          <defs>
            <linearGradient id="heatmap-legend-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorScale(minValue)} />
              <stop offset="50%" stopColor={colorScale((minValue + maxValue) / 2)} />
              <stop offset="100%" stopColor={colorScale(maxValue)} />
            </linearGradient>
          </defs>
          <rect width={80} height={10} fill="url(#heatmap-legend-gradient)" rx={2} />
          <text x={0} y={22} fontSize={9} fill="currentColor" className="text-zinc-500 dark:text-zinc-400">
            ${minValue.toFixed(0)}
          </text>
          <text x={80} y={22} fontSize={9} fill="currentColor" textAnchor="end" className="text-zinc-500 dark:text-zinc-400">
            ${maxValue.toFixed(0)}
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="absolute pointer-events-none bg-zinc-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10 max-w-[200px]"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
