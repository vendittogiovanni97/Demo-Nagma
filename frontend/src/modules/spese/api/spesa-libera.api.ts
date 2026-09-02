import { ENDPOINTS } from '@/common/shared/api/endpoints';
import { createLiberaApi } from '@/common/shared/api/liberaApi';
import type { SpesaLibera, CreateSpesaLiberaData } from '../model/spese.types';

export const spesaLiberaApi = createLiberaApi<SpesaLibera, CreateSpesaLiberaData>(ENDPOINTS.SPESE_LIBERE);
