import { ApiResponse } from '@/types';
import { TrendingResponse } from '@/types/trendingTypes';

import { api } from './api';

class TrendingService {
    private apiUrl = '/api/trendings';

    // Retourne les hashtags et les thématiques les plus consultés selon une période donnée (semaine ou overall)
    public async getTrendings(period: 'week' | 'overall'): Promise<ApiResponse<TrendingResponse>> {
        const response = await api.fetchRequest(`${this.apiUrl}/${period}`, 'GET', null, true);
        return response.data;
    }
}

export default new TrendingService();
