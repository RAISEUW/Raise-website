import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const publications = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    date: z.coerce.date(),
    topics: z.array(z.string()).default([]),
    pdf: z.string().optional(),
    doi: z.string().optional(),
    abstract: z.string().optional(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    speaker: z.string(),
    speakerBio: z.string().optional(),
    speakerPhoto: z.string().optional(),
    date: z.coerce.date(),
    time: z.string().optional(),
    location: z.string().default('Online'),
    abstract: z.string().optional(),
    recording: z.string().optional(),
    slides: z.string().optional(),
    upcoming: z.boolean().default(false),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string().default('RAISE Team'),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    excerpt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/people' }),
  schema: z.object({
    name: z.string(),
    role: z.enum(['leadership', 'affiliate', 'staff', 'alumni']),
    title: z.string(),
    department: z.string().optional(),
    email: z.string().email().optional(),
    x: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
    photo: z.string().optional(),
    researchAreas: z.array(z.string()).default([]),
    order: z.number().default(99),
    linkedPublications: z.array(reference('publications')).default([]),
    linkedTalks: z.array(reference('events')).default([]),
  }),
});

export const collections = { publications, events, articles, people };
