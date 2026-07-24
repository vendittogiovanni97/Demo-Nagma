import { createStaffSchema, updateStaffSchema } from '../../../src/modules/staff/controllers/staff.schemas';

describe('Staff schemas', () => {
  it('accetta il payload usato dalla modale per creare uno staff', () => {
    expect(createStaffSchema.safeParse({
      name: 'Mario Rossi',
      type: 'COLLABORATORE',
      color: '#25D366',
    }).success).toBe(true);
  });

  it('accetta la modifica del colore di uno staff', () => {
    expect(updateStaffSchema.safeParse({
      name: 'Mario Rossi',
      type: 'APPRENDISTA',
      color: '#9B6DFF',
    }).success).toBe(true);
  });

  it('rifiuta i vecchi ruoli utente non validi per lo staff', () => {
    expect(updateStaffSchema.safeParse({ type: 'ARTIST' }).success).toBe(false);
  });

  it('rifiuta una modifica priva di campi', () => {
    expect(updateStaffSchema.safeParse({}).success).toBe(false);
  });
});
