"use client";

import { Filters, FilterOptions } from "@/lib/types";
import Dropdown from "./ui/Dropdown";

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
  const handleYearChange = (value: string | string[]) => {
    const yearValue = Array.isArray(value) ? value[0] : value;
    onFiltersChange({
      ...filters,
      selectedYear: yearValue ? parseInt(yearValue, 10) : null,
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
    onFiltersChange({
      selectedYear: null,
      selectedRegions: [],
      selectedCommodities: [],
    });
  };

  const hasActiveFilters =
    filters.selectedYear !== null ||
    filters.selectedRegions.length > 0 ||
    filters.selectedCommodities.length > 0;

  // Create year options
  const yearOptions = filterOptions.years.map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

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

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex flex-wrap items-end gap-4">
        {/* Year Filter */}
        <Dropdown
          label="Year"
          options={yearOptions}
          value={filters.selectedYear?.toString() || ""}
          onChange={handleYearChange}
          placeholder="All Years"
        />

        {/* Region Filter */}
        <Dropdown
          label="Regions"
          options={regionOptions}
          value={filters.selectedRegions}
          onChange={handleRegionChange}
          placeholder="All Regions"
          multiple
        />

        {/* Commodity Filter */}
        <Dropdown
          label="Commodities"
          options={commodityOptions}
          value={filters.selectedCommodities}
          onChange={handleCommodityChange}
          placeholder="All Commodities"
          multiple
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium
              text-zinc-600 dark:text-zinc-400
              hover:text-zinc-900 dark:hover:text-zinc-100
              bg-zinc-100 dark:bg-zinc-800
              hover:bg-zinc-200 dark:hover:bg-zinc-700
              rounded-lg transition-all duration-200"
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
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-wrap gap-2">
            {filters.selectedYear && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {filters.selectedYear}
              </span>
            )}
            {filters.selectedRegions.map((region) => (
              <span
                key={region}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {region}
              </span>
            ))}
            {filters.selectedCommodities.map((commodity) => (
              <span
                key={commodity}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {commodity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
