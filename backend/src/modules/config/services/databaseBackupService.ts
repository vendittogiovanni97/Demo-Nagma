import prisma from '../../../core/shared/utils/prisma';

type BackupTable = {
  tableName: string;
  records: Record<string, unknown>[];
};

function escapeSqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  if (value instanceof Date) return `'${value.toISOString()}'`;
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

export class DatabaseBackupService {
  async buildSqlBackup(exportedAt = new Date()): Promise<string> {
    const tables: BackupTable[] = [
      { tableName: 'users', records: await prisma.user.findMany() },
      { tableName: 'staff', records: await prisma.staff.findMany() },
      { tableName: 'shifts', records: await prisma.shift.findMany() },
      { tableName: 'customers', records: await prisma.customer.findMany() },
      { tableName: 'bookings', records: await prisma.booking.findMany() },
      { tableName: 'cream_tattoos', records: await prisma.creamTattoo.findMany() },
      { tableName: 'cream_sales', records: await prisma.creamSale.findMany() },
      { tableName: 'booking_histories', records: await prisma.bookingHistory.findMany() },
      { tableName: 'transactions', records: await prisma.transaction.findMany() },
      { tableName: 'transaction_histories', records: await prisma.transactionHistory.findMany() },
      { tableName: 'form_templates', records: await prisma.formTemplate.findMany() },
      { tableName: 'spese_libere', records: await prisma.spesaLibera.findMany() },
      { tableName: 'whatsapp_templates', records: await prisma.whatsAppTemplate.findMany() },
      { tableName: 'whatsapp_message_logs', records: await prisma.whatsAppMessageLog.findMany() },
      { tableName: 'configs', records: await prisma.config.findMany() },
      { tableName: 'client_configs', records: await prisma.clientConfig.findMany() },
      { tableName: 'custom_fields', records: await prisma.customField.findMany() },
      { tableName: 'attachments', records: await prisma.attachment.findMany() },
      { tableName: 'booking_placements', records: await prisma.bookingPlacement.findMany() },
      { tableName: 'user_preferences', records: await prisma.userPreference.findMany() },
      { tableName: 'saved_views', records: await prisma.savedView.findMany() },
    ];

    const lines = [
      '-- NAGMA STUDIO DATABASE BACKUP',
      `-- Exported At: ${exportedAt.toISOString()}`,
      '-- Contiene dati sensibili e hash password: conservare in modo sicuro.',
      '',
      "SET session_replication_role = 'replica';",
      '',
    ];

    for (const { tableName, records } of tables) {
      lines.push(`-- Table: "${tableName}"`, `TRUNCATE TABLE "${tableName}" CASCADE;`);
      for (const record of records) {
        const columns = Object.keys(record);
        const values = Object.values(record).map(escapeSqlValue);
        lines.push(
          `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${values.join(', ')});`
        );
      }
      lines.push('');
    }

    lines.push("SET session_replication_role = 'origin';", '');
    return lines.join('\n');
  }
}
