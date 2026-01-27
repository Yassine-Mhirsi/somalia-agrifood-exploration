"use client";

import { useState } from "react";
import { Filters, FilterOptions } from "@/lib/types";
import Dropdown from "./ui/Dropdown";
import RangeSlider from "./ui/RangeSlider";

interface FilterPanelProps {
  filters: Filters;
  filterOptions: FilterOptions;
  onFiltersChange: (filters: Filters) => void;
}

export default function FilterPanel({
  filters,
  filterOptions,
  onFiltersChange,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleYearRangeChange = (value: [number, number]) => {
    onFiltersChange({
      ...filters,
      yearRange: value,
    });
  };

  const handleRegionChange = (value: string | string[]) => {
    const regions = Array.isArray(value) ? value : value ? [value] : [];
    onFiltersChange({
      ...filters,
      selectedRegions: regions,
    });
  };

  const handleCommodityChange = (value: string | string[]) => {
    const commodities = Array.isArray(value) ? value : value ? [value] : [];
    onFiltersChange({
      ...filters,
      selectedCommodities: commodities,
    });
  };

  const clearFilters = () => {
    const minYear = filterOptions.years[0];
    const maxYear = filterOptions.years[filterOptions.years.length - 1];
    onFiltersChange({
      yearRange: [minYear, maxYear],
      selectedRegions: [],
      selectedCommodities: [],
    });
  };

  const hasActiveFilters =
    filters.selectedRegions.length > 0 ||
    filters.selectedCommodities.length > 0;

  // Create region options
  const regionOptions = filterOptions.regions.map((region) => ({
    value: region,
    label: region,
  }));

  // Create commodity options
  const commodityOptions = filterOptions.commodities.map((commodity) => ({
    value: commodity,
    label: commodity,
  }));

  const minYear = filterOptions.years.length > 0 ? filterOptions.years[0] : 1995;
  const maxYear = filterOptions.years.length > 0 ? filterOptions.years[filterOptions.years.length - 1] : 2024;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4">
      {/* Primary Filter: Time Interval */}
      <div className="max-w-3xl mx-auto mb-4">
        {filterOptions.years.length > 0 && (
          <RangeSlider
            min={minYear}
            max={maxYear}
            value={filters.yearRange || [minYear, maxYear]}
            onChange={handleYearRangeChange}
            label="Time Interval"
          />
        )}
      </div>

      {/* Expand/Collapse Toggle */}
      <div className="flex justify-center mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Hide Advanced Filters</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>Show Advanced Filters</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Collapsible Section: Regions and Commodities */}
      {isExpanded && (
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <Dropdown
            label="Regions"
            options={regionOptions}
            value={filters.selectedRegions}
            onChange={handleRegionChange}
            placeholder="All Regions"
            multiple
          />

          <Dropdown
            label="Commodities"
            options={commodityOptions}
            value={filters.selectedCommodities}
            onChange={handleCommodityChange}
            placeholder="All Commodities"
            multiple
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider
                text-zinc-500 dark:text-zinc-400
                hover:text-red-600 dark:hover:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/10
                rounded-xl transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Reset
            </button>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {(hasActiveFilters || (filters.yearRange && (filters.yearRange[0] !== minYear || filters.yearRange[1] !== maxYear))) && (
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          {filters.yearRange && (filters.yearRange[0] !== minYear || filters.yearRange[1] !== maxYear) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-tight bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              {filters.yearRange[0]} - {filters.yearRange[1]}
            </span>
          )}
          {filters.selectedRegions.map((region) => (
            <span
              key={region}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-tight bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full"
            >
              {region}
            </span>
          ))}
          {filters.selectedCommodities.map((commodity) => (
            <span
              key={commodity}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-tight bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full"
            >
              {commodity}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}