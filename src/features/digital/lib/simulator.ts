import type { BusinessModel, SimulationResult, MonthlyData } from '../types';
import type { EngineState } from '../../../lib/stores/engineStore';

export function calculateSimulation(model: BusinessModel): SimulationResult {
  const { cac, arpu, cogs, churnRate, months } = model;
  
  // Convert churn percentage to decimal
  const monthlyChurn = churnRate / 100;
  
  // Contribution Margin
  const margin = arpu - cogs;
  
  // LTV = Contribution Margin / Churn Rate
  const ltv = monthlyChurn > 0 ? margin / monthlyChurn : margin * 100; 
  
  const ltvCacRatio = cac > 0 ? ltv / cac : ltv;
  
  const monthlyProjection: MonthlyData[] = [];
  let cumulativeRevenue = 0;
  let cumulativeCost = cac; // Initial cost is CAC
  let paybackPeriod: number | null = null;

  for (let i = 1; i <= months; i++) {
    const retentionProb = Math.pow(1 - monthlyChurn, i - 1);
    const monthlyRevenue = margin * retentionProb;
    
    cumulativeRevenue += monthlyRevenue;
    
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

export function calculateMarketFit(state: EngineState) {
    let score = 50; // Base score
    const { strategy, persona, economics } = state;

    // 1. SWOT Balance
    if (strategy.swot.strengths.length > strategy.swot.weaknesses.length) score += 10;
    if (strategy.swot.opportunities.length > strategy.swot.threats.length) score += 10;

    // 2. Price/Positioning Consistency
    const priceValue = economics.arpu;
    const hasPremiumKeywords = strategy.marketingMix.product.toLowerCase().includes('premium') || 
                               strategy.marketingMix.product.toLowerCase().includes('luxury') ||
                               strategy.marketingMix.product.toLowerCase().includes('high-end');
    
    if (priceValue > 200 && !hasPremiumKeywords) score -= 15;
    if (priceValue > 200 && hasPremiumKeywords) score += 10;

    // 3. Persona Alignment
    if (persona) {
        score += 15;
        if (persona.painPoints.length > 3) score += 5;
    }

    // 4. Unit Economics
    const ltvCac = economics.cac > 0 ? (economics.arpu / economics.cac) : 1;
    if (ltvCac > 3) score += 10;
    if (economics.churnRate < 5) score += 10;
    if (economics.churnRate > 15) score -= 20;

    return Math.min(100, Math.max(0, score));
}

export interface AgentResult {
    total: number;
    converted: number;
    churned: number;
    revenue: number;
    fitScore: number;
}

export function runAgentSimulation(state: EngineState, sampleSize = 500): AgentResult {
    const { strategy, economics } = state;
    const price = economics.arpu;
    const strengthsCount = strategy.swot.strengths.length;
    
    let converted = 0;
    let churned = 0;
    let totalRevenue = 0;

    // Create and simulate each agent
    for (let i = 0; i < sampleSize; i++) {
        // Stochastic attributes
        const budget = Math.random() * 500 + 50; // Budget between 50 and 550
        const brandSensitivity = Math.random(); // 0 to 1
        const needUrgency = Math.random() * 10; // 0 to 10
        
        // Value Perception logic
        const perceivedValue = (strengthsCount * 2) + (brandSensitivity * 5);
        
        // Decision logic
        const willBuy = perceivedValue > (needUrgency / 2) && budget >= price;
        
        if (willBuy) {
            converted++;
            // Churn simulation for this specific agent
            const loyaltyThreshold = Math.random() * 100;
            if (loyaltyThreshold < economics.churnRate) {
                churned++;
                totalRevenue += price * 0.5; // Only stayed half the period
            } else {
                totalRevenue += price;
            }
        }
    }

    return {
        total: sampleSize,
        converted,
        churned,
        revenue: totalRevenue,
        fitScore: converted > 0 ? Math.round(((converted - churned) / sampleSize) * 100) : 0
    };
}
