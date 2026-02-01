import type { BusinessModel, SimulationResult, MonthlyData } from '../types';

export function calculateSimulation(model: BusinessModel): SimulationResult {
  const { cac, arpu, cogs, churnRate, months } = model;
  
  // Convert churn percentage to decimal
  const monthlyChurn = churnRate / 100;
  
  // Contribution Margin
  const margin = arpu - cogs;
  
  // LTV = Contribution Margin / Churn Rate
  // If churn is 0, LTV is effectively infinite in this simplified model, 
  // but we'll cap it or handle the division by zero.
  const ltv = monthlyChurn > 0 ? margin / monthlyChurn : margin * 100; 
  
  const ltvCacRatio = cac > 0 ? ltv / cac : ltv;
  
  const monthlyProjection: MonthlyData[] = [];
  let cumulativeRevenue = 0;
  let cumulativeCost = cac; // Initial cost is CAC
  let paybackPeriod: number | null = null;

  for (let i = 1; i <= months; i++) {
    // Simplified: we assume we are tracking 1 customer acquired at month 0
    // Probability of customer still being there at month i
    const retentionProb = Math.pow(1 - monthlyChurn, i - 1);
    const monthlyRevenue = margin * retentionProb;
    
    cumulativeRevenue += monthlyRevenue;
    // COGS is already in margin, so cumulativeCost here is just the initial CAC
    // for this single customer analysis.
    
    const profit = cumulativeRevenue - cumulativeCost;
    
    if (paybackPeriod === null && cumulativeRevenue >= cumulativeCost) {
      paybackPeriod = i;
    }

    monthlyProjection.push({
      month: i,
      revenue: monthlyRevenue,
      cumulativeRevenue,
      cumulativeCost,
      profit
    });
  }

  const isSustainable = ltvCacRatio >= 3 && (paybackPeriod !== null && paybackPeriod <= 12);

  return {
    ltv,
    ltvCacRatio,
    paybackPeriod,
    monthlyProjection,
    isSustainable
  };
}
