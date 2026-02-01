export interface BuyerPersona {
  name: string;
  archetype: string;
  demographics: {
    ageRange: string;
    occupation: string;
    location: string;
  };
  painPoints: string[];
  buyingBehavior: string;
  goals: string[];
}

export type LLMState = 'idle' | 'loading' | 'ready' | 'generating' | 'error';

export interface EngineProgress {
  progress: number;
  text: string;
}
