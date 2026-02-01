import { defineCollection, z } from 'astro:content';

const marketingCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    module: z.number(),
    description: z.string(),
  }),
});

export const collections = {
  'marketing': marketingCollection,
};