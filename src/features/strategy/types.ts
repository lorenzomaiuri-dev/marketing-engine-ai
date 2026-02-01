export interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface MarketingMix {
  product: string;
  price: string;
  place: string;
  promotion: string;
}

export interface StrategicPlan {
  brandName: string;
  positioning: string;
  swot: SwotData;
  marketingMix: MarketingMix;
}