"use client";

import { useRef, useState } from "react";
import * as d3 from "d3";
import { CommodityComparison } from "@/lib/types";

interface BarChartProps {
  data: CommodityComparison[];
  width?: number;
  height?: number;
  maxBars?: number;
}

export default function BarChart({
  data,
  width = 500,
  height = 400,
  maxBars = 15,
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({ show: false, x: 0, y: 0, content: "" });

  const margin = { top: 20, right: 30, bottom: 20, left: 140 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Sort and limit data
  const sortedData = [...data]
    .sort((a, b) => b.avgPrice - a.avgPrice)
    .slice(0, maxBars);

  // Scales
  const xMax = d3.max(sortedData, (d) => d.avgPrice) || 0;

  const xScale = d3
    .scaleLinear()
    .domain([0, xMax * 1.1])
    .range([0, innerWidth]);

  const yScale = d3
    .scaleBand()
    .domain(sortedData.map((d) => d.commodity))
    .range([0, innerHeight])
    .padding(0.2);

  // Color scale based on value
  const colorScale = d3
    .scaleSequential(d3.interpolateBlues)
    .domain([0, xMax]);

  // X-axis ticks
  const xTicks = xScale.ticks(5).map((tick) => ({
    value: tick,
    offset: xScale(tick),
  }));

  const handleMouseMove = (
    e: React.MouseEvent<SVGRectElement>,
    item: CommodityComparison
  ) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        show: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        content: `${item.commodity}: $${item.avgPrice.toFixed(2)} (${item.count} records)`,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  if (sortedData.length === 0) {
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
                  y={15}
                  textAnchor="middle"
                  fontSize={10}
                  fill="currentColor"
                  className="text-zinc-500 dark:text-zinc-400"
                >
                  ${value.toFixed(0)}
                </text>
              </g>
            ))}
          </g>

          {/* Y-axis labels */}
          {sortedData.map((item) => (
            <text
              key={item.commodity}
              x={-10}
              y={(yScale(item.commodity) || 0) + yScale.bandwidth() / 2}
              textAnchor="end"
              fontSize={11}
              fill="currentColor"
              dominantBaseline="middle"
              className="text-zinc-600 dark:text-zinc-400"
            >
              {item.commodity.length > 18
                ? item.commodity.slice(0, 18) + "..."
                : item.commodity}
            </text>
          ))}

          {/* Bars */}
          {sortedData.map((item) => (
            <rect
              key={item.commodity}
              x={0}
              y={yScale(item.commodity) || 0}
              width={xScale(item.avgPrice)}
              height={yScale.bandwidth()}
              fill={colorScale(item.avgPrice)}
              rx={3}
              className="transition-opacity hover:opacity-80 cursor-pointer"
              onMouseMove={(e) => handleMouseMove(e, item)}
              onMouseLeave={handleMouseLeave}
            />
          ))}

          {/* Value labels on bars */}
          {sortedData.map((item) => {
            const barWidth = xScale(item.avgPrice);
            const showInside = barWidth > 50;
            return (
              <text
                key={`label-${item.commodity}`}
                x={showInside ? barWidth - 5 : barWidth + 5}
                y={(yScale(item.commodity) || 0) + yScale.bandwidth() / 2}
                textAnchor={showInside ? "end" : "start"}
                fontSize={10}
                fill={showInside ? "white" : "currentColor"}
                dominantBaseline="middle"
                className={showInside ? "" : "text-zinc-600 dark:text-zinc-400"}
              >
                ${item.avgPrice.toFixed(1)}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="absolute pointer-events-none bg-zinc-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10"
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
