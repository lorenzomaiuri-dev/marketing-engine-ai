import { describe, it, expect } from 'vitest';
import { analyzeSEO, analyzeSocial, calculateOmnichannelScore, analyzeContentSmart, calculateROIPotential } from './analyzers';

describe('Media Analyzers', () => {
  describe('analyzeSEO', () => {
    it('should identify ideal title and description', () => {
      const result = analyzeSEO({
        title: 'Digital Marketing Excellence - Master the Hub',
        description: 'Learn the secrets of omnichannel communication and SEO strategy in our comprehensive guide to modern marketing.',
        keywords: 'marketing, seo'
      });
      expect(result.titleStatus).toBe('ideal');
      expect(result.descriptionStatus).toBe('ideal');
      expect(result.score).toBe(100);
    });
  });

  describe('analyzeSocial', () => {
    it('should calculate engagement rate and CPE', () => {
      const result = analyzeSocial({
        reach: 1000,
        interactions: 50,
        cost: 100
      });
      expect(result.engagementRate).toBe(5);
      expect(result.costPerEngagement).toBe(2);
    });
  });

  describe('calculateROIPotential', () => {
    it('should return MAXIMAL for high ER and low CPE', () => {
      const result = calculateROIPotential({ reach: 1000, interactions: 100, cost: 10 });
      expect(result.label).toBe('MAXIMAL');
    });

    it('should return SKEWED for poor metrics', () => {
      const result = calculateROIPotential({ reach: 1000, interactions: 5, cost: 100 });
      expect(result.label).toBe('SKEWED');
    });
  });

  describe('calculateOmnichannelScore', () => {
    it('should calculate weighted score', () => {
      // Web (40) + Social (30) = 70
      expect(calculateOmnichannelScore({ web: true, social: true, email: false, offline: false })).toBe(70);
      // All + Synergy bonus (5) = 100 (clamped)
      expect(calculateOmnichannelScore({ web: true, social: true, email: true, offline: true })).toBe(100);
    });
  });

  describe('analyzeContentSmart', () => {
    it('should detect tone and readability', () => {
      const result = analyzeContentSmart('Join now to discover revolutionary secrets! This is punchy.');
      expect(result.readability).toBe('Punchy');
      expect(result.tone).toBe('Urgent / Exciting');
      expect(result.impactWords).toContain('revolutionary');
      expect(result.impactWords).toContain('join');
    });
  });
});

