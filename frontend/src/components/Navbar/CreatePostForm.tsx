import { PostSchema, postSchema } from '@/schemas/postSchemas';
import { useCreatePost } from '@/services/queries/postQueries';
import { FileValidationResult } from '@/types/postTypes';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Images } from 'lucide-react';

import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];

const CreatePostForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<PostSchema>({
        resolver: zodResolver(postSchema),
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [fileErrors, setFileErrors] = useState<string[]>([]);

    const { mutate: createPost, isPending } = useCreatePost();

    const validateFile = (file: File): FileValidationResult => {
        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'Le fichier ne doit pas dépasser 10MB' };
        }
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            return { valid: false, error: 'Type de fichier non supporté' };
        }
        return { valid: true };
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        // Prendre uniquement les 4 premiers fichiers
        const newFiles = Array.from(selectedFiles).slice(0, 4);
        const validationResults = newFiles.map(validateFile);
        const validFiles = newFiles.filter((_, index) => validationResults[index].valid);
        const errors = validationResults
            .filter((result) => !result.valid)
            .map((result) => result.error) as string[];

        // Limiter à 4 fichiers au total
        const updatedFiles = [...files, ...validFiles].slice(0, 4);

        setFiles(updatedFiles);
        setFileErrors(errors);
        setValue(
            'media',
            updatedFiles.map((file) => URL.createObjectURL(file))
        );
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        setValue(
            'media',
            newFiles.map((file) => URL.createObjectURL(file))
        );
    };

    const onSubmit = (data: PostSchema) => {
        const formData = new FormData();

        // S'assurer que le contenu est correctement ajouté à FormData
        formData.append('content', data.content);

        // Ajouter les fichiers
        files.forEach((file) => {
            // Ne pas créer un nouveau Blob, utiliser directement le fichier
            formData.append('files', file);
        });

        // Vérifier que les données sont correctement ajoutées
        console.log('Contenu:', data.content);
        console.log('Nombre de fichiers:', files.length);

        createPost(formData);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
            <p className="text-white text-lg font-bold">Nouveau post</p>
            <Textarea
                {...register('content')}
                placeholder="Quoi de neuf ?"
                error={errors.content?.message}
            />

            <div className="grid grid-cols-2 gap-2">
                {files.map((file, index) => (
                    <div key={index} className="relative">
                        {file.type.startsWith('image') ? (
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Media ${index}`}
                                className="w-full h-20 object-cover rounded col-span-1"
                            />
                        ) : (
                            <video
                                src={URL.createObjectURL(file)}
                                className="w-full h-20 object-cover rounded col-span-1"
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            {fileErrors.map((error, index) => (
                <p key={index} className="text-red-500 text-sm">
                    {error}
                </p>
            ))}

            <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,video/mp4"
                onChange={handleFileChange}
                className="hidden"
            />

            <button
                type="button"
                className="flex items-center gap-1 my-3 p-2 bg-white rounded-full text-black cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <Images size={20} />
                <p className="text-sm">Ajouter un media (4 max.)</p>
            </button>

            <Button
                type="submit"
                className="w-full mt-2 cursor-pointer"
                disabled={isPending || fileErrors.length > 0}
            >
                Publier
            </Button>
            {errors.root && <p className="text-red-500">{errors.root.message}</p>}
        </form>
    );
};

export default CreatePostForm;
