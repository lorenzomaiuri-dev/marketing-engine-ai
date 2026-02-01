import { describe, it, expect } from 'vitest';
import { calculateSimulation } from './simulator';
import type { BusinessModel } from '../types';

describe('calculateSimulation', () => {
  it('calculates sustainable business model correctly', () => {
    const model: BusinessModel = {
      cac: 100,
      arpu: 50,
      cogs: 10,
      churnRate: 5,
      months: 24
    };

    const result = calculateSimulation(model);

    // LTV = (50 - 10) / 0.05 = 40 / 0.05 = 800
    expect(result.ltv).toBe(800);
    // LTV/CAC = 800 / 100 = 8
    expect(result.ltvCacRatio).toBe(8);
    // Payback period: 100 / 40 = 2.5 months -> 3 months
    expect(result.paybackPeriod).toBe(3);
    expect(result.isSustainable).toBe(true);
  });

  it('identifies unsustainable business model due to high churn', () => {
    const model: BusinessModel = {
      cac: 100,
      arpu: 50,
      cogs: 10,
      churnRate: 50, // 50% churn is massive
      months: 24
    };

    const result = calculateSimulation(model);

    // LTV = (50 - 10) / 0.5 = 80
    // LTV/CAC = 80 / 100 = 0.8
    expect(result.ltvCacRatio).toBeLessThan(3);
    expect(result.isSustainable).toBe(false);
  });

  it('identifies unsustainable business model due to high CAC', () => {
    const model: BusinessModel = {
      cac: 1000,
      arpu: 50,
      cogs: 10,
      churnRate: 5,
      months: 24
    };

    const result = calculateSimulation(model);

    // LTV = 800
    // LTV/CAC = 800 / 1000 = 0.8
    expect(result.isSustainable).toBe(false);
  });
});
