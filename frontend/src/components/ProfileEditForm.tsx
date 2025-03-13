import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useDeleteUser } from '../services/queries/userQueries';

interface ProfileEditFormProps {
    initialData: {
        name: string;
        username: string;
        biography: string;
        location: string;
        link: string;
    };
    onSubmit: (formData: any) => void;
    isUpdating?: boolean;
    onClose?: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
    initialData,
    onSubmit,
    isUpdating = false,
    onClose,
}) => {
    const [formData, setFormData] = useState(initialData);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Données du formulaire avant soumission:', formData);
        try {
            onSubmit(formData);
        } catch (error) {
            console.error('Erreur lors de la soumission du formulaire:', error);
            toast.error('Une erreur est survenue lors de la mise à jour du profil');
        }
    };

    const handleDeleteAccount = () => {
        if (showDeleteConfirm) {
            // Afficher un toast de chargement
            const loadingToast = toast.loading('Suppression du compte en cours...');

            // Exécuter la suppression
            deleteUser(undefined, {
                onSuccess: () => {
                    toast.dismiss(loadingToast);
                    toast.success('Votre compte a été supprimé avec succès');
                },
                onError: (error) => {
                    toast.dismiss(loadingToast);
                    toast.error(`Échec de la suppression: ${error.message}`);
                },
            });
        } else {
            // Afficher la confirmation
            setShowDeleteConfirm(true);
            // Notification pour informer l'utilisateur
            toast.info(
                'Cliquez à nouveau sur le bouton pour confirmer la suppression de votre compte',
                {
                    autoClose: 5000,
                }
            );

            // Masquer automatiquement après 5 secondes pour des raisons de sécurité
            setTimeout(() => {
                setShowDeleteConfirm(false);
            }, 5000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                        Nom
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="Votre nom"
                    />
                </div>

                <div>
                    <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-300 mb-1"
                    >
                        Nom d'utilisateur
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="@username"
                    />
                </div>

                <div>
                    <label
                        htmlFor="biography"
                        className="block text-sm font-medium text-gray-300 mb-1"
                    >
                        Biographie
                    </label>
                    <textarea
                        id="biography"
                        name="biography"
                        value={formData.biography}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white resize-none"
                        placeholder="Parlez-nous de vous"
                    />
                </div>

                <div>
                    <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-300 mb-1"
                    >
                        Localisation
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="Votre localisation"
                    />
                </div>

                <div>
                    <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-1">
                        Site web
                    </label>
                    <input
                        type="text"
                        id="link"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        placeholder="exemple.com"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-transparent border border-gray-700 text-gray-300 rounded-full hover:bg-gray-800 transition-colors"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={isUpdating}
                    className={`px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors ${
                        isUpdating ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                    {isUpdating ? (
                        <div className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Mise à jour...
                        </div>
                    ) : (
                        'Enregistrer'
                    )}
                </button>
            </div>

            {/* Section de suppression de compte séparée visuellement */}
            <div className="mt-8 pt-4 border-t border-gray-800">
                <h3 className="text-red-500 text-sm font-medium mb-2">Zone dangereuse</h3>
                <p className="text-gray-400 text-xs mb-3">
                    La suppression de votre compte est irréversible. Toutes vos données seront
                    définitivement supprimées.
                </p>
                <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className={`w-full px-4 py-2 ${
                        showDeleteConfirm
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-gray-800 hover:bg-red-900'
                    } text-white rounded transition-colors`}
                >
                    {isDeleting ? (
                        <div className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Suppression en cours...
                        </div>
                    ) : showDeleteConfirm ? (
                        'Confirmer la suppression'
                    ) : (
                        'Supprimer mon compte'
                    )}
                </button>
                {showDeleteConfirm && (
                    <p className="text-red-400 text-xs mt-2 animate-pulse">
                        Cliquez à nouveau pour confirmer la suppression définitive de votre compte.
                    </p>
                )}
            </div>
        </form>
    );
};

export default ProfileEditForm;
