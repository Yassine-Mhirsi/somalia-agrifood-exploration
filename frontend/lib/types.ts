// TypeScript interfaces for Somalia Agrifood Dashboard

export interface AgrifoodRecord {
  admin1: string;
  commodity: string;
  usdprice: number | null;
  year: number;
  crop_production_value_usd: number | null;
  dietary_energy_adequacy_pct: number | null;
  child_wasting_pct: number | null;
  prevalence_undernourishment_pct: number | null;
}

export interface ApiResponse {
  count: number;
  data: AgrifoodRecord[];
}

export interface Filters {
  yearRange: [number, number] | null;
  selectedRegions: string[];
  selectedCommodities: string[];
}

export interface FilterOptions {
  years: number[];
  regions: string[];
  commodities: string[];
}

// Aggregated data for charts
export interface RegionAggregation {
  admin1: string;
  avgPrice: number;
  totalRecords: number;
}

export interface YearlyTrend {
  year: number;
  avgPrice: number;
  commodity?: string;
  admin1?: string;
}

export interface CommodityComparison {
  commodity: string;
  avgPrice: number;
  count: number;
}

export interface HeatmapCell {
  admin1: string;
  commodity: string;
  value: number | null;
}

// GeoJSON types for the map
export interface GeoFeature {
  type: "Feature";
  properties: {
    admin1Name: string;
    [key: string]: unknown;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJSON {
  type: "FeatureCollection";
  features: GeoFeature[];
}
