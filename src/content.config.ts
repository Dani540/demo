import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    minQuantity: z.number(),
    image: z.string().optional(),
    galleryImages: z.array(z.string()).optional(),
  })
});

export const collections = {
  products,
};
