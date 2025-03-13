import { useGetTrendings } from '@/services/queries/trendingQueries';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Trending = () => {
    const [period, setPeriod] = useState<'week' | 'overall'>('week');
    const { data, isLoading, error, refetch } = useGetTrendings(period);
    const navigate = useNavigate();

    const handleTrendingClick = (name: string) => {
        alert(name);
        navigate(`/posts?h=${encodeURIComponent(name.replace('#', ''))}`);
    };

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div>Erreur : {error.message}</div>;
    }

    const handlePeriodChange = (period: 'week' | 'overall') => {
        setPeriod(period);
        refetch();
    };

    return (
        <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-md p-6 w-full max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-white">Tendances</h1>

            <div className="flex space-x-2 mb-6">
                <button
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        period === 'week'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    onClick={() => handlePeriodChange('week')}
                >
                    Cette semaine
                </button>
                <button
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        period === 'overall'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                    onClick={() => handlePeriodChange('overall')}
                >
                    Tous le temps
                </button>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-200">Hashtags</h2>
                <ul>
                    {(data as any)?.hashtags.map((hashtag: any, index: number) => (
                        <li
                            key={index}
                            onClick={() => handleTrendingClick(`${hashtag.name}`)}
                            className="flex justify-between items-center py-2 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                        >
                            <span className="text-blue-400 font-medium">{hashtag.name}</span>
                            <span className="text-sm text-gray-300">
                                {hashtag.posts.length} posts
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-200">Thématiques</h2>
                <ul className="space-y-2">
                    {(data as any)?.themes.map((theme: any, index: number) => (
                        <li
                            key={index}
                            onClick={() => handleTrendingClick(theme.name)}
                            className="flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                        >
                            <span className="text-gray-100 font-medium">{theme.name}</span>
                            <span className="text-sm text-gray-300">
                                {theme.posts.length} posts
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Trending;
