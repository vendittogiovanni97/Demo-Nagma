import { z } from 'zod';

import { nonEmptyString } from './common';

export const staffTypeSchema = z.enum(['TATTOO_ARTIST', 'PIERCER', 'OTHER']);

export const createStaffSchema = z.object({
  name: nonEmptyString('Il nome è obbligatorio'),
  type: nonEmptyString('Il tipo è obbligatorio'),
  color: nonEmptyString('Il colore è obbligatorio'),
});
