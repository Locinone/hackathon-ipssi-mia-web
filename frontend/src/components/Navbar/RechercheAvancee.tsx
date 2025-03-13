import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import { Calendar, Hash, Search, SortAsc, User } from 'lucide-react';

function RechercheAvancee({ onClose }: { onClose: () => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let params = '?';

        // Déterminer si la recherche est un utilisateur, hashtag ou contenu général
        if (searchTerm.startsWith('@')) {
            params += `u=${searchTerm.substring(1)}&`;
        } else if (searchTerm.startsWith('#')) {
            params += `h=${searchTerm.substring(1)}&`;
        } else if (searchTerm) {
            params += `s=${searchTerm}&`;
        }

        // Ajouter les dates si définies
        if (startDate) params += `ed=${startDate}&`;
        if (endDate) params += `sd=${endDate}&`;

        // Ajouter l'ordre de tri si défini
        if (sortOrder) params += `order=${sortOrder}&`;

        // Rediriger vers la page des posts avec les paramètres
        console.log(params);
        navigate(`/posts${params}`);
        onClose();
    };

    return (
        <div className="bg-black/80 backdrop-blur-md rounded-lg shadow-md w-full p-4">
            <h3 className="text-white text-xl font-bold mb-4">Recherche avancée</h3>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-white flex items-center gap-2">
                        <Search size={16} />
                        <span>Terme de recherche</span>
                    </label>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User size={14} /> <span>@utilisateur</span>
                        <Hash size={14} className="ml-2" /> <span>#hashtag</span>
                        <Search size={14} className="ml-2" /> <span>ou texte libre</span>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher..."
                        className="text-lg w-full bg-gray-900 text-white px-3 py-2 rounded-md border border-gray-700"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-white flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Date de début</span>
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-lg w-full bg-gray-900 text-white px-3 py-2 rounded-md border border-gray-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-white flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Date de fin</span>
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-lg w-full bg-gray-900 text-white px-3 py-2 rounded-md border border-gray-700"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-white flex items-center gap-2">
                        <SortAsc size={16} />
                        <span>Trier par</span>
                    </label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="text-lg w-full bg-gray-900 text-white px-3 py-2 rounded-md border border-gray-700"
                    >
                        <option value="">Date (plus récent)</option>
                        <option value="likes">Nombre de likes</option>
                        <option value="dislikes">Nombre de dislikes</option>
                        <option value="shares">Nombre de partages</option>
                    </select>
                </div>

                <div className="flex justify-end pt-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        onClick={handleSubmit}
                        className="text-lg bg-gradient-to-r bg-white text-black px-4 py-2 rounded-md font-medium"
                    >
                        Rechercher
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

export default RechercheAvancee;
