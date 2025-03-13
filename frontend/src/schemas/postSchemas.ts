import { z } from 'zod';

export const postSchema = z.object({
    content: z
        .string()
        .min(1, { message: 'Le contenu est requis' })
        .max(140, { message: 'Le contenu ne doit pas dépasser 140 caractères' }),
    media: z.array(z.string()).optional(),
});

export const commentSchema = z.object({
    content: z
        .string()
        .min(1, { message: 'Le contenu est requis' })
        .max(140, { message: 'Le contenu ne doit pas dépasser 140 caractères' }),
    postId: z.string(),
});

export type PostSchema = z.infer<typeof postSchema>;
export type CommentSchema = z.infer<typeof commentSchema>;
