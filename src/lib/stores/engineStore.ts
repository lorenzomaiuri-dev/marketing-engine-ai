import { writable } from 'svelte/store';
import type { StrategicPlan } from '../../features/strategy/types';
import type { BuyerPersona } from '../../features/customer/types';
import type { BusinessModel } from '../../features/digital/types';
import type { CommunicationPlan } from '../../features/media/types';

export interface EngineState {
  strategy: StrategicPlan;
  persona: BuyerPersona | null;
  economics: BusinessModel;
  media: CommunicationPlan;
  lastUpdated: string;
}

const initialState: EngineState = {
  strategy: {
    brandName: '',
    positioning: '',
    swot: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    },
    marketingMix: {
      product: '',
      price: '0',
      place: '',
      promotion: ''
    }
  },
  persona: null,
  economics: {
    cac: 50,
    arpu: 100,
    cogs: 20,
    churnRate: 5,
    months: 12
  },
  media: {
    seo: {
      title: '',
      description: '',
      keywords: ''
    },
    social: {
      reach: 0,
      interactions: 0,
      cost: 0
    },
    omnichannel: {
      web: false,
      social: false,
      email: false,
      offline: false
    },
    content: ''
  },
  lastUpdated: new Date().toISOString()
};

function createEngineStore() {
  // Initialize with initialState, then try to load from localStorage in browser
  const isBrowser = typeof window !== 'undefined';
  const savedState = isBrowser ? localStorage.getItem('marketing_engine_state') : null;
  const initial = savedState ? JSON.parse(savedState) : initialState;

  const { subscribe, set, update } = writable<EngineState>(initial);

  return {
    subscribe,
    updateStrategy: (strategy: Partial<StrategicPlan>) => {
      update(state => {
        const newState = {
          ...state,
          strategy: { ...state.strategy, ...strategy },
          lastUpdated: new Date().toISOString()
        };
        // Sync to Economics if price changed
        if (strategy.marketingMix?.price) {
            newState.economics.arpu = parseFloat(strategy.marketingMix.price) || 0;
        }
        if (isBrowser) localStorage.setItem('marketing_engine_state', JSON.stringify(newState));
        return newState;
      });
    },
    updatePersona: (persona: BuyerPersona) => {
      update(state => {
        const newState = {
          ...state,
          persona,
          lastUpdated: new Date().toISOString()
        };
        if (isBrowser) localStorage.setItem('marketing_engine_state', JSON.stringify(newState));
        return newState;
      });
    },
    updateEconomics: (economics: Partial<BusinessModel>) => {
      update(state => {
        const newState = {
          ...state,
          economics: { ...state.economics, ...economics },
          lastUpdated: new Date().toISOString()
        };
        if (isBrowser) localStorage.setItem('marketing_engine_state', JSON.stringify(newState));
        return newState;
      });
    },
    updateMedia: (media: Partial<CommunicationPlan>) => {
      update(state => {
        const newState = {
          ...state,
          media: { 
            ...state.media, 
            ...media,
            seo: media.seo ? { ...state.media.seo, ...media.seo } : state.media.seo,
            social: media.social ? { ...state.media.social, ...media.social } : state.media.social,
            omnichannel: media.omnichannel ? { ...state.media.omnichannel, ...media.omnichannel } : state.media.omnichannel
          },
          lastUpdated: new Date().toISOString()
        };
        
        // Sync CAC if social cost changed or reach changed
        const currentSocial = newState.media.social;
        if (currentSocial.cost > 0 && currentSocial.reach > 0) {
            // Very simplified CAC estimation: (Cost / (Reach * 0.02 conversion))
            const estimatedCac = currentSocial.cost / (currentSocial.reach * 0.02);
            newState.economics.cac = Math.round(estimatedCac * 100) / 100;
        }

        if (isBrowser) localStorage.setItem('marketing_engine_state', JSON.stringify(newState));
        return newState;
      });
    },
    reset: () => {
      set(initialState);
      if (isBrowser) localStorage.removeItem('marketing_engine_state');
    }
  };
}

export const engineStore = createEngineStore();
