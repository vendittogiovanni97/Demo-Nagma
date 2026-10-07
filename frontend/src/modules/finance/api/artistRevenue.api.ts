import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';
import type {
  ArtistRevenueFilterParams,
  ArtistRevenueResponse,
} from '../model/artistRevenue.types';

export const artistRevenueApi = {
  getArtistRevenue: async (params?: ArtistRevenueFilterParams): Promise<ArtistRevenueResponse> => {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params?.mode) queryParams.mode = params.mode;
    if (params?.year) queryParams.year = params.year;
    if (params?.month) queryParams.month = params.month;
    if (params?.day) queryParams.day = params.day;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;

    const res = await apiClient.get<{ success: boolean; data: ArtistRevenueResponse }>(
      ENDPOINTS.REPORTS.ARTISTS_REVENUE,
      queryParams
    );
    return res.data;
  },
};
