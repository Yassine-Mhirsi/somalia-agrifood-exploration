"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import type { GeoPermissibleObjects } from "d3";
import { RegionAggregation } from "@/lib/types";

interface ChoroplethMapProps {
  data: RegionAggregation[];
  width?: number;
  height?: number;
}

// Mapping between GeoJSON names and database names
const REGION_NAME_MAP: Record<string, string> = {
  "Middle Shabelle": "Shabelle Dhexe",
  "Lower Shabelle": "Shabelle Hoose",
  "Middle Juba": "Juba Dhexe",
  "Lower Juba": "Juba Hoose",
  Hiraan: "Hiraan",
};

interface GeoJSONFeature {
  type: "Feature";
  properties: {
    name: string;
    [key: string]: unknown;
  };
  geometry: GeoJSON.Geometry;
}

interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export default function ChoroplethMap({
  data,
  width = 400,
  height = 450,
}: ChoroplethMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<GeoJSONFeatureCollection | null>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: string;
  }>({ show: false, x: 0, y: 0, content: "" });

  // Load GeoJSON
  useEffect(() => {
    fetch("/so.json")
      .then((res) => res.json())
      .then((rawData) => {
        setGeoData(rawData);
      })
      .catch((err) => console.error("Failed to load GeoJSON:", err));
  }, []);

  // Create data lookup map
  const dataByRegion = useMemo(
    () => new Map(data.map((d) => [d.admin1, d])),
    [data]
  );

  // Get min/max values for color scale
  const { minValue, maxValue } = useMemo(() => {
    const values = data.map((d) => d.avgPrice).filter((v) => v != null);
    return {
      minValue: values.length > 0 ? Math.min(...values) : 0,
      maxValue: values.length > 0 ? Math.max(...values) : 100,
    };
  }, [data]);

  // Color scale
  const colorScale = useMemo(
    () => d3.scaleSequential(d3.interpolateYlOrRd).domain([minValue, maxValue]),
    [minValue, maxValue]
  );

  // Projection and path generator
  const { projection, pathGenerator } = useMemo(() => {
    if (!geoData) return { projection: null, pathGenerator: null };

    const proj = d3.geoMercator().fitSize([width - 40, height - 80], geoData);
    const path = d3.geoPath().projection(proj);

    return { projection: proj, pathGenerator: path };
  }, [geoData, width, height]);

  if (!geoData || !pathGenerator) {
    return (
      <div
        className="flex items-center justify-center text-zinc-500"
        style={{ width, height }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  const handleMouseMove = (
    e: React.MouseEvent<SVGPathElement>,
    feature: GeoJSONFeature
  ) => {
    const geoName = feature.properties.name;
    const dbName = REGION_NAME_MAP[geoName] || geoName;
    const regionData = dataByRegion.get(dbName);

    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        show: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        content: regionData
          ? `${dbName}: $${regionData.avgPrice.toFixed(2)} avg`
          : `${dbName}: No data`,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" });
  };

  return (
    <div className="relative">
      <svg ref={svgRef} width={width} height={height}>
        <g transform="translate(20, 10)">
          {geoData.features.map((feature, i) => {
            const geoName = feature.properties.name;
            const dbName = REGION_NAME_MAP[geoName] || geoName;
            const regionData = dataByRegion.get(dbName);
            const fillColor = regionData
              ? colorScale(regionData.avgPrice)
              : "#d1d5db";

            const pathD = pathGenerator(feature as unknown as GeoPermissibleObjects);

            return (
              <path
                key={`${geoName}-${i}`}
                d={pathD || ""}
                fill={fillColor}
                stroke="#374151"
                strokeWidth={0.5}
                className="transition-all duration-200 hover:brightness-110 cursor-pointer"
                onMouseMove={(e) => handleMouseMove(e, feature)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </g>

        {/* Legend */}
        <g transform={`translate(${width - 130}, ${height - 55})`}>
          <text
            x={0}
            y={-8}
            fontSize={11}
            fontWeight={500}
            fill="currentColor"
            className="text-zinc-700 dark:text-zinc-300"
          >
            Avg Price (USD)
          </text>
          <defs>
            <linearGradient
              id="map-legend-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={colorScale(minValue)} />
              <stop offset="50%" stopColor={colorScale((minValue + maxValue) / 2)} />
              <stop offset="100%" stopColor={colorScale(maxValue)} />
            </linearGradient>
          </defs>
          <rect
            width={110}
            height={12}
            fill="url(#map-legend-gradient)"
            rx={3}
          />
          <text
            x={0}
            y={28}
            fontSize={10}
            fill="currentColor"
            className="text-zinc-600 dark:text-zinc-400"
          >
            ${minValue.toFixed(0)}
          </text>
          <text
            x={110}
            y={28}
            fontSize={10}
            fill="currentColor"
            textAnchor="end"
            className="text-zinc-600 dark:text-zinc-400"
          >
            ${maxValue.toFixed(0)}
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="absolute pointer-events-none bg-zinc-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl z-10 font-medium"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 12,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
