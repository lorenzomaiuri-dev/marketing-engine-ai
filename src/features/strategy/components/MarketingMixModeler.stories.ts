import type { Meta, StoryObj } from '@storybook/svelte';
import MarketingMixModeler from './MarketingMixModeler.svelte';

const meta = {
  title: 'Features/Strategy/MarketingMixModeler',
  component: MarketingMixModeler,
  render: (args) => ({
    Component: MarketingMixModeler,
    props: args,
  }),
} satisfies Meta<MarketingMixModeler>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    mix: {
      product: "",
      price: "",
      place: "",
      promotion: ""
    },
  },
};

export const PartiallyFilled: Story = {
  args: {
    mix: {
      product: "Premium AI Marketing Platform",
      price: "$99/month subscription",
      place: "",
      promotion: ""
    },
  },
};

export const Full: Story = {
  args: {
    mix: {
      product: "Deep Space Marketing Engine",
      price: "Freemium with Enterprise Tier",
      place: "Global SaaS / Digital Distribution",
      promotion: "Technical content marketing, SEO, and developer advocacy."
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
