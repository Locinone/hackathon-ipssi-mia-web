import { z } from 'zod';

// Messages d'erreur personnalisés en français
const errorMessages = {
    required: 'Ce champ est obligatoire',
    email: "Format d'email invalide",
    password:
        'Le mot de passe doit contenir au moins 8 caractères, incluant une majuscule, une minuscule et un chiffre',
    terms: "Vous devez accepter les conditions d'utilisation",
};

// Schéma pour le formulaire de connexion
export const loginSchema = z.object({
    email: z.string({ required_error: errorMessages.required }).email(errorMessages.email),
    password: z.string({ required_error: errorMessages.required }).min(1, errorMessages.required),
});

// Schéma pour le formulaire d'inscription
export const registerSchema = z.object({
    username: z
        .string({ required_error: errorMessages.required })
        .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
        .max(50, "Le nom d'utilisateur est trop long"),
    email: z.string({ required_error: errorMessages.required }).email(errorMessages.email),
    password: z
        .string({ required_error: errorMessages.required })
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
            'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
        ),
    image: z.any().optional(), // Pour gérer le fichier d'image de profil
    banner: z.any().optional(), // Pour gérer le fichier de bannière
    acceptNotification: z.boolean().default(false),
    acceptTerms: z.boolean().refine((val) => val === true, { message: errorMessages.terms }),
    acceptCamera: z.boolean().default(false),
});

// Fonction utilitaire pour valider les données avec un schéma Zod
export const validateForm = (schema, data) => {
    try {
        const result = schema.parse(data);
        return { success: true, data: result, error: null };
    } catch (error) {
        // Formatage des erreurs Zod pour un usage simplifié
        const formattedErrors = {};
        if (error.errors) {
            error.errors.forEach((err) => {
                const path = err.path[0];
                formattedErrors[path] = err.message;
            });
        }
        return { success: false, data: null, error: formattedErrors };
    }
};
