"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AgrifoodRecord,
  ApiResponse,
  Filters,
  FilterOptions,
  RegionAggregation,
  YearlyTrend,
  CommodityComparison,
  HeatmapCell,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useAgrifoodData() {
  const [data, setData] = useState<AgrifoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    yearRange: null,
    selectedRegions: [],
    selectedCommodities: [],
  });

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/data`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json: ApiResponse = await response.json();
        setData(json.data);
        
        // Initialize year range after data is loaded
        const years = json.data.map((d) => d.year);
        if (years.length > 0) {
          const minYear = Math.min(...years);
          const maxYear = Math.max(...years);
          setFilters(prev => ({ ...prev, yearRange: [minYear, maxYear] }));
        }
        
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Extract filter options from data
  const filterOptions: FilterOptions = useMemo(() => {
    const years = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
    const regions = [...new Set(data.map((d) => d.admin1))].sort();
    const commodities = [...new Set(data.map((d) => d.commodity))].sort();
    return { years, regions, commodities };
  }, [data]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    return data.filter((record) => {
      if (filters.yearRange) {
        if (record.year < filters.yearRange[0] || record.year > filters.yearRange[1]) {
          return false;
        }
      }
      if (
        filters.selectedRegions.length > 0 &&
        !filters.selectedRegions.includes(record.admin1)
      ) {
        return false;
      }
      if (
        filters.selectedCommodities.length > 0 &&
        !filters.selectedCommodities.includes(record.commodity)
      ) {
        return false;
      }
      return true;
    });
  }, [data, filters]);

  // Aggregations for charts

  // Region aggregation for choropleth map
  const regionAggregation: RegionAggregation[] = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>();

    filteredData.forEach((record) => {
      if (record.usdprice !== null) {
        const existing = grouped.get(record.admin1) || { total: 0, count: 0 };
        existing.total += record.usdprice;
        existing.count += 1;
        grouped.set(record.admin1, existing);
      }
    });

    return Array.from(grouped.entries()).map(([admin1, stats]) => ({
      admin1,
      avgPrice: stats.total / stats.count,
      totalRecords: stats.count,
    }));
  }, [filteredData]);

  // Yearly trends for line chart
  const yearlyTrends: YearlyTrend[] = useMemo(() => {
    const grouped = new Map<number, { total: number; count: number }>();

    filteredData.forEach((record) => {
      if (record.usdprice !== null) {
        const existing = grouped.get(record.year) || { total: 0, count: 0 };
        existing.total += record.usdprice;
        existing.count += 1;
        grouped.set(record.year, existing);
      }
    });

    return Array.from(grouped.entries())
      .map(([year, stats]) => ({
        year,
        avgPrice: stats.total / stats.count,
      }))
      .sort((a, b) => a.year - b.year);
  }, [filteredData]);

  // Yearly trends by commodity for multi-line chart
  const yearlyTrendsByCommodity: Map<string, YearlyTrend[]> = useMemo(() => {
    const commodityMap = new Map<
      string,
      Map<number, { total: number; count: number }>
    >();

    filteredData.forEach((record) => {
      if (record.usdprice !== null) {
        if (!commodityMap.has(record.commodity)) {
          commodityMap.set(record.commodity, new Map());
        }
        const yearMap = commodityMap.get(record.commodity)!;
        const existing = yearMap.get(record.year) || { total: 0, count: 0 };
        existing.total += record.usdprice;
        existing.count += 1;
        yearMap.set(record.year, existing);
      }
    });

    const result = new Map<string, YearlyTrend[]>();
    commodityMap.forEach((yearMap, commodity) => {
      const trends = Array.from(yearMap.entries())
        .map(([year, stats]) => ({
          year,
          avgPrice: stats.total / stats.count,
          commodity,
        }))
        .sort((a, b) => a.year - b.year);
      result.set(commodity, trends);
    });

    return result;
  }, [filteredData]);

  // Commodity comparison for bar chart
  const commodityComparison: CommodityComparison[] = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>();

    filteredData.forEach((record) => {
      if (record.usdprice !== null) {
        const existing = grouped.get(record.commodity) || { total: 0, count: 0 };
        existing.total += record.usdprice;
        existing.count += 1;
        grouped.set(record.commodity, existing);
      }
    });

    return Array.from(grouped.entries())
      .map(([commodity, stats]) => ({
        commodity,
        avgPrice: stats.total / stats.count,
        count: stats.count,
      }))
      .sort((a, b) => b.avgPrice - a.avgPrice);
  }, [filteredData]);

  // Heatmap data (region x commodity matrix)
  const heatmapData: HeatmapCell[] = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>();

    filteredData.forEach((record) => {
      if (record.usdprice !== null) {
        const key = `${record.admin1}|${record.commodity}`;
        const existing = grouped.get(key) || { total: 0, count: 0 };
        existing.total += record.usdprice;
        existing.count += 1;
        grouped.set(key, existing);
      }
    });

    const cells: HeatmapCell[] = [];
    const regions = filterOptions.regions;
    const commodities = filterOptions.commodities;

    regions.forEach((admin1) => {
      commodities.forEach((commodity) => {
        const key = `${admin1}|${commodity}`;
        const stats = grouped.get(key);
        cells.push({
          admin1,
          commodity,
          value: stats ? stats.total / stats.count : null,
        });
      });
    });

    return cells;
  }, [filteredData, filterOptions.regions, filterOptions.commodities]);

  return {
    data: filteredData,
    rawData: data,
    loading,
    error,
    filters,
    setFilters,
    filterOptions,
    aggregations: {
      regionAggregation,
      yearlyTrends,
      yearlyTrendsByCommodity,
      commodityComparison,
      heatmapData,
    },
  };
}
