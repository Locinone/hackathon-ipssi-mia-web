import { useEffect, useState } from 'react';

interface ProfileEditFormProps {
    onSubmit: (formData: {
        name: string;
        username: string;
        biography: string;
        location: string;
        link: string;
    }) => void;
    initialData: {
        name: string;
        username: string;
        biography: string;
        location: string;
        link: string;
    };
}

const ProfileEditForm = ({ onSubmit, initialData }: ProfileEditFormProps) => {
    const [formData, setFormData] = useState(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Mettre à jour le formulaire si les données initiales changent
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Log des données avant soumission
            console.log('Données du formulaire avant soumission:', formData);

            // Appeler la fonction onSubmit fournie par le parent avec les données du formulaire
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Nom d'utilisateur
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label htmlFor="biography" className="block text-sm font-medium text-gray-700">
                    Biographie
                </label>
                <textarea
                    id="biography"
                    name="biography"
                    value={formData.biography}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Localisation
                </label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700">
                    Lien
                </label>
                <input
                    type="text"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                        isSubmitting
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                >
                    {isSubmitting ? 'Mise à jour...' : 'Enregistrer'}
                </button>
            </div>
        </form>
    );
};

export default ProfileEditForm;
