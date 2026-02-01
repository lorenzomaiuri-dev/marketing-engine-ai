export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
}

export interface SEOAnalysis {
  titleLength: number;
  descriptionLength: number;
  titleStatus: 'ideal' | 'warning' | 'critical';
  descriptionStatus: 'ideal' | 'warning' | 'critical';
  score: number;
}

export interface SocialMetrics {
  reach: number;
  interactions: number;
  cost: number;
}

export interface SocialAnalysis {
  engagementRate: number;
  costPerEngagement: number;
}

export interface OmnichannelChecklist {
  web: boolean;
  social: boolean;
  email: boolean;
  offline: boolean;
}

export interface CommunicationPlan {
  seo: SEOConfig;
  social: SocialMetrics;
  omnichannel: OmnichannelChecklist;
  content: string;
}
