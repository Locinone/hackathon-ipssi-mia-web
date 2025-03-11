import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Search as SearchIcon, TrendingUp } from 'lucide-react';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

function SearchPage() {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Extraire le paramètre de recherche de l'URL
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const queryFromUrl = queryParams.get('q');

        if (queryFromUrl) {
            setSearchQuery(queryFromUrl);
            performSearch(queryFromUrl);
        }
    }, [location.search]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            performSearch(searchQuery);
        }
    };

    const performSearch = (query) => {
        setIsSearching(true);

        // Simulation d'une recherche (à remplacer par un vrai appel API)
        setTimeout(() => {
            // Exemple de résultats fictifs
            setSearchResults([
                {
                    id: 1,
                    title: `Résultat pour "${query}" #1`,
                    content: 'Contenu du premier résultat de recherche...',
                },
                {
                    id: 2,
                    title: `Résultat pour "${query}" #2`,
                    content: 'Contenu du deuxième résultat de recherche...',
                },
                {
                    id: 3,
                    title: `Résultat pour "${query}" #3`,
                    content: 'Contenu du troisième résultat de recherche...',
                },
            ]);
            setIsSearching(false);
        }, 1000);
    };

    const trendingHashtags = [
        { tag: '#programmation', posts: 1245 },
        { tag: '#voyage', posts: 987 },
        { tag: '#chats', posts: 756 },
        { tag: '#technologie', posts: 654 },
        { tag: '#nature', posts: 543 },
    ];

    const trendingTopics = [
        { title: 'Intelligence Artificielle', description: 'Les dernières avancées en IA' },
        { title: 'Développement Web', description: 'React, Vue, Angular et plus' },
        { title: 'Voyage en Europe', description: "Destinations populaires pour l'été" },
        { title: 'Photographie', description: 'Techniques et matériel' },
    ];

    const trendingPosts = [
        {
            content:
                "L'#IA va-t-elle remplacer les développeurs? Je ne pense pas, elle va plutôt augmenter notre productivité.",
            author: 'Tech Visionnaire',
            likes: 1245,
        },
        {
            content:
                '10 destinations #voyage incontournables pour 2023. Le #Portugal en tête de liste!',
            author: 'Globe Trotter',
            likes: 876,
        },
        {
            content:
                'La #photographie de rue: un art accessible à tous avec ces 5 conseils simples.',
            author: 'Photo Expert',
            likes: 543,
        },
    ];

    return (
        <div className="w-full min-h-screen bg-black text-white pt-20 pb-20 px-4 sm:px-8 md:px-16 lg:px-24">
            {/* Barre de recherche */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl mx-auto">
                <Input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    icon={<SearchIcon size={20} />}
                    className="flex-grow"
                />
                <Button type="submit" variant="primary">
                    Rechercher
                </Button>
            </form>

            {/* Résultats de recherche */}
            {searchQuery && (
                <section className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Résultats pour "{searchQuery}"</h2>

                    {isSearching ? (
                        <div className="flex justify-center my-8">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-4">
                            {searchResults.map((result) => (
                                <div key={result.id} className="bg-white/10 rounded-xl p-4">
                                    <h3 className="text-xl font-bold">{result.title}</h3>
                                    <p className="text-sm opacity-80">{result.content}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 my-8">
                            Aucun résultat trouvé pour "{searchQuery}"
                        </p>
                    )}
                </section>
            )}

            {/* Section Tendances (affichée seulement si pas de recherche active) */}
            {!searchQuery && (
                <div className="mt-8 space-y-10">
                    {/* Hashtags en tendance */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <TrendingUp size={24} />
                            Hashtags en tendance
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {trendingHashtags.map((item, index) => (
                                <div key={index} className="bg-white/10 rounded-xl p-4">
                                    <h3 className="text-xl font-bold">{item.tag}</h3>
                                    <p className="text-sm opacity-80">{item.posts} posts</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Sujets du moment */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <TrendingUp size={24} />
                            Sujets du moment
                        </h2>
                        <div className="space-y-4">
                            {trendingTopics.map((topic, index) => (
                                <div key={index} className="bg-white/10 rounded-xl p-4">
                                    <h3 className="text-xl font-bold">{topic.title}</h3>
                                    <p className="text-sm opacity-80">{topic.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Posts populaires */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <TrendingUp size={24} />
                            Posts populaires
                        </h2>
                        <div className="space-y-4">
                            {trendingPosts.map((post, index) => (
                                <div key={index} className="bg-white/10 rounded-xl p-4">
                                    <p className="text-lg mb-2">{post.content}</p>
                                    <div className="flex justify-between">
                                        <span className="text-sm opacity-80">
                                            Par {post.author}
                                        </span>
                                        <span className="text-sm opacity-80">
                                            {post.likes} likes
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default SearchPage;
