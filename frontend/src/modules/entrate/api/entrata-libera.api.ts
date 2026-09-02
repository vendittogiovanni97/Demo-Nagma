import { ENDPOINTS } from '@/common/shared/api/endpoints';
import { createLiberaApi } from '@/common/shared/api/liberaApi';
import type { EntrataLibera, CreateEntrataLiberaData } from '../model/entrate.types';

export const entrataLiberaApi = createLiberaApi<EntrataLibera, CreateEntrataLiberaData>(ENDPOINTS.ENTRATE_LIBERE);
