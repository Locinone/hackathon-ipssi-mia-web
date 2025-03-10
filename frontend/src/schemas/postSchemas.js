import { z } from 'zod';

// Messages d'erreur personnalisés en français
const errorMessages = {
    required: 'Ce champ est obligatoire',
    content: 'Le contenu ne peut pas être vide',
    files: 'Vous pouvez télécharger au maximum 4 fichiers',
    fileSize: 'La taille du fichier ne doit pas dépasser 10 Mo',
    fileType: 'Format de fichier non pris en charge. Utilisez des images ou vidéos',
};

// Schéma pour le formulaire de création de post
export const createPostSchema = z.object({
    content: z
        .string({ required_error: errorMessages.required })
        .min(1, errorMessages.content)
        .max(1000, 'Le contenu ne doit pas dépasser 1000 caractères'),
    files: z.array(z.any()).max(4, errorMessages.files).optional().nullable(),
});

// Fonction utilitaire pour valider les données avec un schéma Zod
export const validatePostForm = (data) => {
    try {
        const result = createPostSchema.parse(data);
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

// Fonction pour valider les fichiers
export const validateFiles = (files) => {
    if (!files || files.length === 0) return { valid: true };

    if (files.length > 4) {
        return { valid: false, error: errorMessages.files };
    }

    const maxSize = 10 * 1024 * 1024; // 10 Mo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];

    for (const file of files) {
        if (file.size > maxSize) {
            return { valid: false, error: errorMessages.fileSize };
        }

        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: errorMessages.fileType };
        }
    }

    return { valid: true };
};
