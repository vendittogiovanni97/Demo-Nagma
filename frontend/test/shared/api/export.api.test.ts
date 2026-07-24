import { exportService } from '@/common/shared/api/export.api';

jest.mock('@/common/shared/utils/auth', () => ({
  getToken: () => 'test-token',
}));

describe('exportService', () => {
  const createObjectURL = jest.fn(() => 'blob:test');
  const revokeObjectURL = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window.URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(window.URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });
  });

  it('invia tutti i formati al modulo backend generico', async () => {
    const blob = new Blob(['file']);
    global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => blob });
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await exportService.download({
      format: 'xlsx',
      filename: 'movimenti',
      title: 'Movimenti',
      columns: [{ key: 'amount', label: 'Importo', type: 'currency' }],
      data: [{ amount: 42 }],
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/export'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
    click.mockRestore();
  });

  it('propaga un errore quando il backend rifiuta l’export', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    await expect(exportService.download({
      format: 'csv',
      columns: [{ key: 'name', label: 'Nome' }],
      data: [{ name: 'Mario' }],
    })).rejects.toThrow('Errore durante la generazione dell\'export');
  });
});
