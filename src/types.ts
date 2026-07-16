export interface CivicAlert {
  id: string;
  title: string;
  description: string;
  time: string;
  status: "active" | "pending" | "resolved";
  category: "water" | "pothole" | "grid" | "sensor" | "other";
  district: string;
}

export interface SimulationParams {
  greenSpaceRatio: number; // 0 - 100
  publicTransitFrequency: number; // 1 - 20 (min)
  buildingHeightLimits: number; // 10 - 500 (m)
  optimizeAlbedo: boolean;
}

export interface SimulationResult {
  co2Reduction: string;
  co2Detail: string;
  estimatedRoi: string;
  roiPeriod: string;
  roiDetail: string;
  trafficImpact: string;
  trafficDetail: string;
  recommendation: string;
  riskAssessment: string;
  gridLoadImpact: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  image?: {
    data: string;
    mimeType: string;
  };
}

export interface ActiveLayerState {
  powerGrid: boolean;
  waterNetworks: boolean;
  evCharging: boolean;
  airQuality: boolean;
}

export type ViewType = "dashboard" | "simulation" | "reports" | "maps" | "analytics";

export interface EmployeeSuggestion {
  id: string;
  author: string;
  authorImg: string;
  viewContext: string;
  content: string;
  timestamp: string;
  status: "pending" | "approved" | "dismissed";
}

