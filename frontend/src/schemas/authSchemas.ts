import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, { message: "L'email est requis" })
        .email({ message: "Format d'email invalide" }),
    password: z.string().min(1, { message: 'Le mot de passe est requis' }),
});

export const registerSchema = z.object({
    name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
    username: z
        .string()
        .min(2, { message: "Le nom d'utilisateur doit contenir au moins 2 caractères" })
        .regex(/^@/, { message: "Le nom d'utilisateur doit commencer par @" }),
    email: z
        .string()
        .min(1, { message: "L'email est requis" })
        .email({ message: "Format d'email invalide" }),
    password: z
        .string()
        .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
        .regex(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une majuscule' })
        .regex(/[a-z]/, { message: 'Le mot de passe doit contenir au moins une minuscule' })
        .regex(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' }),
    image: z
        .string()
        .optional()
        .refine(
            (value) => {
                if (!value) return true;
                return value.startsWith('data:image/');
            },
            {
                message: 'Le fichier doit être une image',
            }
        ),
    banner: z
        .string()
        .optional()
        .refine(
            (value) => {
                if (!value) return true;
                return value.startsWith('data:image/');
            },
            {
                message: 'Le fichier doit être une image',
            }
        ),
    acceptNotification: z.boolean().optional(),
    acceptCamera: z.boolean().optional(),
    acceptTerms: z.literal(true, {
        errorMap: () => ({ message: "Vous devez accepter les conditions d'utilisation" }),
    }),
});

export const updateUserSchema = z.object({
    name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
    username: z
        .string()
        .min(2, { message: "Le nom d'utilisateur doit contenir au moins 2 caractères" }),
    location: z.string().optional(),
    link: z.string().optional(),
    biography: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
