import { useQuery } from '@tanstack/react-query';

import trendingService from '../trendingService';

export const useGetTrendings = (period: 'week' | 'overall') => {
    return useQuery({
        queryKey: ['trendings', period],
        queryFn: async () => {
            const response = await trendingService.getTrendings(period);
            console.log(response);
            return response;
        },
    });
};
