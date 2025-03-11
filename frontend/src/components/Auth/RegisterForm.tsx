import { RegisterData } from '@/types';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Upload } from 'lucide-react';

import { RegisterFormData, registerSchema } from '../../schemas/authSchemas';
import Button from '../ui/Button';

const RegisterForm = ({
    onSubmit,
    error,
}: {
    onSubmit: (data: FormData) => void;
    error: string | null;
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewBanner, setPreviewBanner] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            username: '@',
            email: '',
            password: '',
            acceptNotification: false,
            acceptTerms: true,
            acceptCamera: false,
        },
    });

    useEffect(() => {
        // Nettoyer les URLs des aperçus lors du démontage
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage);
            if (previewBanner) URL.revokeObjectURL(previewBanner);
        };
    }, [previewImage, previewBanner]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            // Vérifier la taille du fichier (10 MB maximum)
            if (file.size > 10 * 1024 * 1024) {
                alert("L'image est trop grande. La taille maximale est de 10 MB.");
                return;
            }

            // Convertir le fichier en base64 pour le stocker comme string
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result && typeof reader.result === 'string') {
                    setValue(fieldName as keyof RegisterData, reader.result);
                }

                // Créer un aperçu pour l'image
                const previewUrl = URL.createObjectURL(file);
                if (fieldName === 'image') {
                    if (previewImage) URL.revokeObjectURL(previewImage);
                    setPreviewImage(previewUrl);
                } else if (fieldName === 'banner') {
                    if (previewBanner) URL.revokeObjectURL(previewBanner);
                    setPreviewBanner(previewUrl);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const renderCheckbox = (name: any, label: any) => (
        <div className="flex items-center cursor-pointer">
            <input
                type="checkbox"
                id={name}
                {...register(name)}
                className="h-4 w-4 text-black focus:ring-black rounded cursor-pointer"
            />
            <label htmlFor={name} className="ml-2 block text-sm text-gray-700 cursor-pointer">
                {label}
            </label>
            {errors[name as keyof typeof errors] && (
                <p className="text-red-500 text-xs ml-2">
                    {errors[name as keyof typeof errors]?.message}
                </p>
            )}
        </div>
    );

    const handleSubmitForm = async (data: RegisterFormData) => {
        const formData = new FormData();

        // Ajouter les champs texte
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'image' && key !== 'banner') {
                formData.append(key, value as string);
            }
        });

        // Ajouter les fichiers
        if (data.image) {
            const imageBlob = await fetch(data.image).then((res) => res.blob());
            formData.append('image', imageBlob);
        }
        if (data.banner) {
            const bannerBlob = await fetch(data.banner).then((res) => res.blob());
            formData.append('banner', bannerBlob);
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
            <div className="relative mb-10">
                {/* Bannière */}
                <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image de bannière
                    </label>
                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative">
                        {previewBanner ? (
                            <img
                                src={previewBanner}
                                alt="Bannière"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Upload size={24} className="text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">
                                    Cliquez pour sélectionner une bannière
                                </p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'banner')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    {errors.banner && (
                        <p className="text-red-500 text-xs mt-1">{errors.banner.message}</p>
                    )}
                </div>

                {/* Photo de profil positionnée sur la bannière */}
                <div className="absolute right-4 -bottom-10">
                    <div className="w-20 h-20 border-2 border-white bg-white rounded-full overflow-hidden shadow-lg relative">
                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt="Photo de profil"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Upload size={16} className="text-gray-400" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'image')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Photo de profil
                        </label>
                    </div>
                    {errors.image && (
                        <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                    type="text"
                    placeholder="Super Pseudo Giga Cool"
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur
                </label>
                <input
                    type="text"
                    placeholder="@pseudo"
                    {...register('username')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                {errors.username && (
                    <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                    type="email"
                    placeholder="super@email.com"
                    {...register('email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
            </div>

            <div className="relative mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="********"
                        {...register('password')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
            </div>

            <div className="space-y-2 mb-4">
                {renderCheckbox('acceptNotification', 'Accepter les notifications')}
                {renderCheckbox('acceptCamera', "Autoriser l'accès à la caméra")}
                {renderCheckbox('acceptTerms', "J'accepte les conditions d'utilisation")}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={status === 'loading'}
            >
                {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                    "S'inscrire"
                )}
            </Button>
        </form>
    );
};

export default RegisterForm;
