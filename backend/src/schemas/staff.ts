import { z } from 'zod';
import { StaffType } from '@prisma/client';

import { nonEmptyString } from './common';

export const createStaffSchema = z.object({
  name:  nonEmptyString('Il nome è obbligatorio'),
  type:  z.nativeEnum(StaffType),
  color: nonEmptyString('Il colore è obbligatorio'),
});

export const updateStaffSchema = createStaffSchema.partial();
