"use client";

import { useAgrifoodData } from "@/hooks/useAgrifoodData";
import FilterPanel from "./FilterPanel";
import Card from "./ui/Card";
import ChoroplethMap from "./charts/ChoroplethMap";
import LineChart from "./charts/LineChart";
import BarChart from "./charts/BarChart";
import CropProductionBarChart from "./charts/CropProductionBarChart";
import ProductionVsPriceScatter from "./charts/ProductionVsPriceScatter";

export default function Dashboard() {
  const {
    loading,
    error,
    filters,
    setFilters,
    filterOptions,
    aggregations,
    data,
    rawData,
  } = useAgrifoodData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Failed to load data
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">{error}</p>
          <p className="text-sm text-zinc-500">
            Make sure the backend is running at{" "}
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
              http://localhost:8000
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Somalia Agrifood Dashboard
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Food prices, nutrition, and regional analysis
              </p>
            </div>
            <div className="text-right text-sm text-zinc-500 dark:text-zinc-400">
              <div>{data.length.toLocaleString()} records</div>
              <div>
                {filterOptions.years[0]} - {filterOptions.years[filterOptions.years.length - 1]}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Filters */}
        <div className="mb-4">
          <FilterPanel
            filters={filters}
            filterOptions={filterOptions}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Choropleth Map */}
          <Card title="Average Food Prices by Region in Somalia">
            <div className="flex justify-center">
              <ChoroplethMap
                data={aggregations.regionAggregation}
                width={400}
                height={450}
              />
            </div>
          </Card>

          {/* Line Chart */}
          <Card title="Food Prices Trends Over Time in Somalia">
            <LineChart
              data={aggregations.yearlyTrends}
              dataByCategory={
                filters.selectedCommodities.length > 0
                  ? aggregations.yearlyTrendsByCommodity
                  : undefined
              }
              showMultipleLines={filters.selectedCommodities.length > 0}
              width={500}
              height={350}
            />
          </Card>

          {/* Bar Chart */}
          <Card title="Top Commodities by Average Price">
            <BarChart
              data={aggregations.commodityComparison}
              width={500}
              height={400}
              maxBars={12}
            />
          </Card>

          {/* Crop Production Distribution */}
          <Card title="Crop Production Distribution by Region (2018)">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Compare 2018 production value across regions to see where output is most concentrated.
            </p>
            <CropProductionBarChart
              data={rawData}
              selectedRegions={filters.selectedRegions}
              width={520}
              height={420}
            />
          </Card>

          {/* Production vs Price Scatter */}
          <Card title="Production vs Food Prices (2018)" className="lg:col-span-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Explore how production value aligns with average food prices by commodity and region.
            </p>
            <ProductionVsPriceScatter
              data={rawData}
              selectedRegions={filters.selectedRegions}
              width={1040}
              height={460}
            />
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            Data source: HDX - Humanitarian Data Exchange | Somalia Agrifood Exploration Project
          </p>
        </footer>
      </main>
    </div>
  );
}
