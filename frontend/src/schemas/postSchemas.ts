import { z } from 'zod';

export const postSchema = z.object({
    content: z
        .string()
        .min(1, { message: 'Le contenu est requis' })
        .max(140, { message: 'Le contenu ne doit pas dépasser 140 caractères' }),
    media: z.array(z.string()).optional(),
});

export type PostSchema = z.infer<typeof postSchema>;
