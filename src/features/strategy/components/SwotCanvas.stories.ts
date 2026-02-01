import type { Meta, StoryObj } from '@storybook/svelte';
import SwotCanvas from './SwotCanvas.svelte';

const meta = {
  title: 'Features/Strategy/SwotCanvas',
  component: SwotCanvas,
  render: (args) => ({
    Component: SwotCanvas,
    props: args,
  }),
} satisfies Meta<SwotCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    data: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
  },
};

export const PartiallyFilled: Story = {
  args: {
    data: {
      strengths: ['Brand Reputation', 'Experienced Team'],
      weaknesses: ['Limited Budget'],
      opportunities: ['Emerging Markets'],
      threats: [],
    },
  },
};

export const Full: Story = {
  args: {
    data: {
      strengths: ['Svelte 5 Runes', 'Tailwind 4', 'Fast Bundle'],
      weaknesses: ['New Ecosystem', 'Learning Curve'],
      opportunities: ['High Performance', 'Better Developer Experience'],
      threats: ['Breaking Changes', 'Migration Effort'],
    },
  },
};

export const MobileView: Story = {
  args: {
    ...Full.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};