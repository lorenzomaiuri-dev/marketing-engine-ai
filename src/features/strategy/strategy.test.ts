import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import SwotCanvas from './components/SwotCanvas.svelte';
import MarketingMixModeler from './components/MarketingMixModeler.svelte';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

describe('SwotCanvas Component', () => {
  beforeEach(() => {
    cleanup();
    localStorageMock.clear();
  });

  // it('renders correctly', () => {
  //   const { getByText } = render(SwotCanvas);
  //   expect(getByText('Strategic Lab')).toBeTruthy();
  // });

  it('adds a new strength correctly', async () => {
    const { getByPlaceholderText, findByText, getByLabelText } = render(SwotCanvas);
    
    const input = getByPlaceholderText('Enter strategic factor...');
    const addButton = getByLabelText('Add factor');
    
    await fireEvent.input(input, { target: { value: 'Market Leader' } });
    await fireEvent.click(addButton);
    await tick();
    
    expect(await findByText('Market Leader')).toBeTruthy();
  });

  it('removes a factor correctly', async () => {
    const { getByPlaceholderText, getByLabelText, queryByText, findByLabelText } = render(SwotCanvas);
    
    const input = getByPlaceholderText('Enter strategic factor...');
    const addButton = getByLabelText('Add factor');
    
    await fireEvent.input(input, { target: { value: 'To be removed' } });
    await fireEvent.click(addButton);
    await tick();
    
    const removeButton = await findByLabelText('Remove To be removed from Strengths');
    await fireEvent.click(removeButton);
    await tick();
    
    await waitFor(() => expect(queryByText('To be removed')).toBeNull());
  });
});

describe('MarketingMixModeler Component', () => {
  beforeEach(() => {
    cleanup();
    localStorageMock.clear();
  });

  it('updates product strategy correctly', async () => {
    const { getByLabelText } = render(MarketingMixModeler);
    
    const productTextarea = getByLabelText('product strategy description');
    await fireEvent.input(productTextarea, { target: { value: 'Innovative AI tool' } });
    
    expect((productTextarea as HTMLTextAreaElement).value).toBe('Innovative AI tool');
  });

  it('persists data to localStorage', async () => {
    const { getByLabelText } = render(MarketingMixModeler);
    
    const productTextarea = getByLabelText('product strategy description');
    await fireEvent.input(productTextarea, { target: { value: 'Persisted strategy' } });
    
    const saved = JSON.parse(localStorage.getItem('marketing-engine-mix') || '{}');
    expect(saved.product).toBe('Persisted strategy');
  });
});
