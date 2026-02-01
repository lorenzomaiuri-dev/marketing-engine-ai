import type { SEOConfig, SEOAnalysis, SocialMetrics, SocialAnalysis } from '../types';

export function analyzeSEO(config: SEOConfig): SEOAnalysis {
  const { title, description } = config;
  
  const titleLength = title.length;
  const descriptionLength = description.length;

  let titleStatus: SEOAnalysis['titleStatus'] = 'ideal';
  if (titleLength === 0 || titleLength > 60) {
    titleStatus = 'critical';
  } else if (titleLength < 30) {
    titleStatus = 'warning';
  }

  let descriptionStatus: SEOAnalysis['descriptionStatus'] = 'ideal';
  if (descriptionLength === 0 || descriptionLength > 160) {
    descriptionStatus = 'critical';
  } else if (descriptionLength < 70) {
    descriptionStatus = 'warning';
  }

  let score = 0;
  if (titleStatus === 'ideal') score += 50;
  else if (titleStatus === 'warning') score += 25;

  if (descriptionStatus === 'ideal') score += 50;
  else if (descriptionStatus === 'warning') score += 25;

  return {
    titleLength,
    descriptionLength,
    titleStatus,
    descriptionStatus,
    score
  };
}

export function analyzeSocial(metrics: SocialMetrics): SocialAnalysis {
  const { reach, interactions, cost } = metrics;
  
  const engagementRate = reach > 0 ? (interactions / reach) * 100 : 0;
  const costPerEngagement = interactions > 0 ? cost / interactions : 0;

  return {
    engagementRate,
    costPerEngagement
  };
}

export function calculateROIPotential(metrics: SocialMetrics): { label: string; color: string; value: number } {
  const { engagementRate, costPerEngagement } = analyzeSocial(metrics);
  
  if (engagementRate === 0) return { label: 'NULL', color: 'text-slate-500', value: 0 };

  // Logic: High ER and Low CPE is the goal
  // Ideal: ER > 5%, CPE < 1.0
  let roiScore = (engagementRate * 10) - (costPerEngagement * 5);
  roiScore = Math.max(0, Math.min(100, roiScore + 50)); // Normalize around 50

  if (roiScore > 80) return { label: 'MAXIMAL', color: 'text-emerald-400', value: roiScore };
  if (roiScore > 50) return { label: 'OPTIMIZED', color: 'text-indigo-400', value: roiScore };
  if (roiScore > 30) return { label: 'MODERATE', color: 'text-amber-400', value: roiScore };
  return { label: 'SKEWED', color: 'text-rose-400', value: roiScore };
}

export function calculateOmnichannelScore(checklist: { web: boolean; social: boolean; email: boolean; offline: boolean }): number {
  const weights = {
    web: 40,
    social: 30,
    email: 20,
    offline: 10
  };

  let score = 0;
  if (checklist.web) score += weights.web;
  if (checklist.social) score += weights.social;
  if (checklist.email) score += weights.email;
  if (checklist.offline) score += weights.offline;

  // Synergy bonus: Web + Social + Email
  if (checklist.web && checklist.social && checklist.email) {
    score += 5; // Integration bonus
  }

  return Math.min(score, 100);
}

export interface ContentAnalysis {
  score: number;
  tone: string;
  readability: 'Punchy' | 'Standard' | 'Dense';
  impactWords: string[];
}

export function analyzeContentSmart(content: string): ContentAnalysis {
  const powerWords = ['revolutionary', 'proven', 'secret', 'instant', 'free', 'save', 'money', 'new', 'easy', 'discover', 'master', 'guaranteed'];
  const actionVerbs = ['get', 'join', 'start', 'build', 'create', 'launch', 'transform', 'optimize'];
  
  const words = content.toLowerCase().split(/\s+/);
  const foundPower = words.filter(w => powerWords.includes(w.replace(/[^a-z]/g, '')));
  const foundActions = words.filter(w => actionVerbs.includes(w.replace(/[^a-z]/g, '')));
  
  // 1. Base Score from Vocabulary
  let score = (foundPower.length * 8) + (foundActions.length * 12);
  
  // 2. Readability / Length Penalty
  const avgWordLength = content.length / (words.length || 1);
  let readability: ContentAnalysis['readability'] = 'Standard';
  if (words.length > 0 && words.length < 15) {
    score += 15;
    readability = 'Punchy';
  } else if (words.length > 30) {
    score -= 10;
    readability = 'Dense';
  }

  // 3. Tone Detection
  let tone = 'Neutral';
  if (content.includes('!')) {
    score += 5;
    tone = 'Urgent / Exciting';
  } else if (foundActions.length > 2) {
    tone = 'Action-Oriented';
  } else if (avgWordLength > 6) {
    tone = 'Professional / Formal';
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    tone,
    readability,
    impactWords: Array.from(new Set([...foundPower, ...foundActions])).slice(0, 5)
  };
}

