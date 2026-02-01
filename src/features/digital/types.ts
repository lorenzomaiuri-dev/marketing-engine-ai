export interface BusinessModel {
  cac: number;
  arpu: number;
  cogs: number;
  churnRate: number; // monthly percentage (0-100)
  months: number;
}

export interface MonthlyData {
  month: number;
  revenue: number;
  cumulativeRevenue: number;
  cumulativeCost: number;
  profit: number;
}

export interface SimulationResult {
  ltv: number;
  ltvCacRatio: number;
  paybackPeriod: number | null; // months to recover CAC
  monthlyProjection: MonthlyData[];
  isSustainable: boolean;
}
