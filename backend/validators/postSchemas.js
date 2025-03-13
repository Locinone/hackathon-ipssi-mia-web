const z = require('zod');

const postSchema = z.object({
    content: z
        .string()
        .min(1, { message: 'Le contenu est requis' })
        .max(140, { message: 'Le contenu ne doit pas dépasser 140 caractères' }),
    // Les fichiers peuvent être fournis sous différentes formes selon le middleware utilisé
    media: z.union([
        z.array(z.string()).optional(),
        z.undefined()
    ]).optional(),
});

const commentSchema = z.object({
    content: z
        .string()
        .min(1, { message: 'Le contenu est requis' })
        .max(140, { message: 'Le contenu ne doit pas dépasser 140 caractères' }),
});

module.exports = { postSchema, commentSchema };
