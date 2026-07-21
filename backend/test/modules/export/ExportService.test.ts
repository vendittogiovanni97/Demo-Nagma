import { ExportService } from '../../../src/modules/export/services/export.service';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    service = new ExportService();
  });

  describe('generateCsv', () => {
    it('should generate CSV string with UTF-8 BOM', async () => {
      const columns = [{ key: 'name', label: 'Nome' }, { key: 'email', label: 'Email' }];
      const data = [{ name: 'Mario Rossi', email: 'mario@test.com' }];

      const csvString = await service.generateCsv(
        { format: 'csv', title: 'Report Utenti', columns },
        data
      );

      expect(typeof csvString).toBe('string');
      expect(csvString.startsWith('\uFEFF')).toBe(true);
      expect(csvString).toContain('Mario Rossi');
    });
  });

  describe('generateExcel', () => {
    it('should generate valid Excel (.xlsx) buffer', async () => {
      const columns = [{ key: 'name', label: 'Nome' }];
      const data = [{ name: 'Mario Rossi' }];

      const buffer = await service.generateExcel(
        { format: 'xlsx', title: 'Report Utenti', columns },
        data
      );

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('generatePdf', () => {
    it('should generate valid PDF buffer', async () => {
      const columns = [{ key: 'name', label: 'Nome' }];
      const data = [{ name: 'Mario Rossi' }];

      const buffer = await service.generatePdf(
        { format: 'pdf', title: 'Report Utenti', columns },
        data
      );

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.toString('utf-8', 0, 4)).toBe('%PDF');
    });
  });
});
