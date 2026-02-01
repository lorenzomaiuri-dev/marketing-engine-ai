import type { StorybookConfig } from '@storybook/svelte-vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|ts|svelte)"
  ],
  "addons": [
    "@storybook/addon-svelte-csf",
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": {
    "name": "@storybook/svelte-vite",
    "options": {
      "docgen": false
    }
  },
  async viteFinal(config) {
    const hasSvelte = config.plugins?.some((p: any) => p && p.name === 'vite-plugin-svelte');
    if (!hasSvelte) {
        config.plugins = [...(config.plugins || []), svelte()];
    }

    config.plugins = [...(config.plugins || []), tailwindcss()];

    config.resolve = config.resolve || {};
    config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(process.cwd(), 'src'),
        '$lib': path.resolve(process.cwd(), 'src/lib'),
    };

    return config;
  }
};
export default config;