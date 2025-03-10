import { useState } from 'react';

import { TrendingUp } from 'lucide-react';

function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');

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
                                    <span className="text-sm opacity-80">Par {post.author}</span>
                                    <span className="text-sm opacity-80">{post.likes} likes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default SearchPage;
