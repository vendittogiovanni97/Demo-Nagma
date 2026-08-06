import { z } from 'zod';

import { nonEmptyString } from '@/common/shared/schemas/common';

export const createStaffSchema = z.object({
  name: nonEmptyString('Il nome è obbligatorio'),
  type: nonEmptyString('Il tipo è obbligatorio'),
  color: nonEmptyString('Il colore è obbligatorio'),
  isRentPayee: z.boolean().optional().default(false),
});
