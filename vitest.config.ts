import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    globals: true,
    projects: [
        {
            extends: true,
            test: {
                include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
                name: 'unit',
                environment: 'jsdom',
            },
            plugins: [svelte(), svelteTesting()]
        },
        {
            test: {
                name: 'storybook',
                include: ['src/**/*.stories.svelte', 'src/**/*.stories.ts'],
                browser: {
                    enabled: true,
                    headless: true,
                    provider: playwright({}),
                    instances: [{
                        browser: 'chromium'
                    }]
                },
                setupFiles: ['.storybook/vitest.setup.ts']
            },
            plugins: [
                storybookTest({
                    configDir: path.join(dirname, '.storybook')
                })
            ]
        }
    ]
  }
});