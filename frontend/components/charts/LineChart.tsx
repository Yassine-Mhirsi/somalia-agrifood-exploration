"use client";

import { useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { YearlyTrend } from "@/lib/types";

interface LineChartProps {
  data: YearlyTrend[];
  dataByCategory?: Map<string, YearlyTrend[]>;
  width?: number;
  height?: number;
  showMultipleLines?: boolean;
}

const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export default function LineChart({
  data,
  dataByCategory,
  width = 500,
  height = 300,
  showMultipleLines = false,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({ show: false, x: 0, y: 0, content: "" });

  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Get all data points for scales
  const allData = useMemo(() => {
    if (showMultipleLines && dataByCategory) {
      return Array.from(dataByCategory.values()).flat();
    }
    return data;
  }, [data, dataByCategory, showMultipleLines]);

  // Scales
  const xExtent = d3.extent(allData, (d) => d.year) as [number, number];
  const yMax = d3.max(allData, (d) => d.avgPrice) || 0;

  const xScale = d3
    .scaleLinear()
    .domain(xExtent)
    .range([0, innerWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, yMax * 1.1])
    .range([innerHeight, 0]);

  // Line generator
  const lineGenerator = d3
    .line<YearlyTrend>()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.avgPrice))
    .curve(d3.curveMonotoneX);

  // X-axis ticks
  const xTicks = xScale.ticks(6).map((tick) => ({
    value: tick,
    offset: xScale(tick),
  }));

  // Y-axis ticks
  const yTicks = yScale.ticks(5).map((tick) => ({
    value: tick,
    offset: yScale(tick),
  }));

  const handleMouseMove = (
    e: React.MouseEvent<SVGCircleElement>,
    point: YearlyTrend
  ) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        show: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        content: `${point.year}: $${point.avgPrice.toFixed(2)}${point.commodity ? ` (${point.commodity})` : ""}`,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  if (allData.length === 0) {
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
                  fontSize={11}
                  fill="currentColor"
                  className="text-zinc-500 dark:text-zinc-400"
                >
                  {value}
                </text>
              </g>
            ))}
            <text
              x={innerWidth / 2}
              y={35}
              textAnchor="middle"
              fontSize={11}
              fill="currentColor"
              className="text-zinc-500 dark:text-zinc-400"
            >
              Year
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
                  fontSize={11}
                  fill="currentColor"
                  dominantBaseline="middle"
                  className="text-zinc-500 dark:text-zinc-400"
                >
                  ${value.toFixed(0)}
                </text>
              </g>
            ))}
          </g>

          {/* Lines and points */}
          {showMultipleLines && dataByCategory ? (
            // Multiple lines for different categories
            Array.from(dataByCategory.entries())
              .slice(0, 8) // Limit to 8 categories for clarity
              .map(([category, categoryData], i) => (
                <g key={category}>
                  <path
                    d={lineGenerator(categoryData) || ""}
                    fill="none"
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {categoryData.map((point, j) => (
                    <circle
                      key={j}
                      cx={xScale(point.year)}
                      cy={yScale(point.avgPrice)}
                      r={3}
                      fill={COLORS[i % COLORS.length]}
                      className="cursor-pointer hover:r-4"
                      onMouseMove={(e) => handleMouseMove(e, point)}
                      onMouseLeave={handleMouseLeave}
                    />
                  ))}
                </g>
              ))
          ) : (
            // Single line
            <g>
              <path
                d={lineGenerator(data) || ""}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {data.map((point, i) => (
                <circle
                  key={i}
                  cx={xScale(point.year)}
                  cy={yScale(point.avgPrice)}
                  r={4}
                  fill="#3b82f6"
                  stroke="#fff"
                  strokeWidth={2}
                  className="cursor-pointer"
                  onMouseMove={(e) => handleMouseMove(e, point)}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </g>
          )}
        </g>
      </svg>

      {/* Legend for multiple lines */}
      {showMultipleLines && dataByCategory && (
        <div className="flex flex-wrap gap-2 mt-2 px-4 text-xs">
          {Array.from(dataByCategory.keys())
            .slice(0, 8)
            .map((category, i) => (
              <div key={category} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[100px]">
                  {category}
                </span>
              </div>
            ))}
        </div>
      )}

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
