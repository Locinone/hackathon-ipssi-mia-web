const z = require('zod');

// Messages d'erreur personnalisés en français
const errorMessages = {
    required: 'Ce champ est obligatoire',
    email: "Format d'email invalide",
    password:
        'Le mot de passe doit contenir au moins 8 caractères, incluant une majuscule, une minuscule et un chiffre',
    terms: "Vous devez accepter les conditions d'utilisation",
};

// Schéma pour le formulaire de connexion
const loginSchema = z.object({
    email: z.string({ required_error: errorMessages.required }).email(errorMessages.email),
    password: z.string({ required_error: errorMessages.required }).min(1, errorMessages.required),
});

// Schéma pour le formulaire d'inscription
const registerSchema = z.object({
    name: z.string({ required_error: errorMessages.required }),
    username: z
        .string({ required_error: errorMessages.required })
        .min(4, "Le nom d'utilisateur doit contenir au moins 3 caractères (sans compter le @)")
        .max(51, "Le nom d'utilisateur est trop long")
        .refine(val => val.startsWith('@'), {
            message: "Le nom d'utilisateur doit commencer par @"
        }),
    email: z.string({ required_error: errorMessages.required }).email(errorMessages.email),
    password: z
        .string({ required_error: errorMessages.required })
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
            'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
        ),
    image: z.string().optional(),
    banner: z.string().optional(),
    acceptNotification: z.string().refine(val => val === "true" || val === "false", {
        message: "Doit être soit 'true' soit 'false'"
    }).default("false"),
    acceptTerms: z.string().refine(val => val === "true" || val === "false", {
        message: "Doit être soit 'true' soit 'false'"
    }).default("false"),
    acceptCamera: z.string().refine(val => val === "true" || val === "false", {
        message: "Doit être soit 'true' soit 'false'"
    }).default("false"),
});

module.exports = { loginSchema, registerSchema }