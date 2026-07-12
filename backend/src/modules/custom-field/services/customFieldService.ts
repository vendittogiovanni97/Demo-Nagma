import prisma from '../../../core/shared/utils/prisma';

export interface CustomFieldData {
  entityType: string;
  fieldName: string;
  fieldType: string;
  fieldLabel: string;
  isRequired?: boolean;
  options?: Record<string, any>;
  defaultValue?: any;
}

export class CustomFieldService {
  async getAll(clientId: number, entityType?: string) {
    return prisma.customField.findMany({
      where: {
        clientId,
        deletedAt: null,
        ...(entityType && { entityType }),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getById(id: string, clientId: number) {
    return prisma.customField.findFirst({
      where: { id, clientId, deletedAt: null },
    });
  }

  async create(clientId: number, data: CustomFieldData) {
    return prisma.customField.create({
      data: {
        ...data,
        clientId,
        isRequired: data.isRequired ?? false,
      },
    });
  }

  async update(id: string, clientId: number, data: Partial<CustomFieldData>) {
    const existing = await this.getById(id, clientId);
    if (!existing) {
      throw new Error('Custom field not found');
    }

    return prisma.customField.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, clientId: number) {
    const existing = await this.getById(id, clientId);
    if (!existing) {
      throw new Error('Custom field not found');
    }

    return prisma.customField.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async validateCustomData(entityType: string, clientId: number, customData: Record<string, any>) {
    const fields = await this.getAll(clientId, entityType);
    const errors: string[] = [];

    for (const field of fields) {
      const value = customData[field.fieldName];

      // Check required
      if (field.isRequired && (value === undefined || value === null || value === '')) {
        errors.push(`Campo "${field.fieldLabel}" è obbligatorio`);
        continue;
      }

      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Type validation
      switch (field.fieldType) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`Campo "${field.fieldLabel}" deve essere un numero`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`Campo "${field.fieldLabel}" deve essere un booleano`);
          }
          break;
        case 'date':
          if (isNaN(Date.parse(value))) {
            errors.push(`Campo "${field.fieldLabel}" deve essere una data valida`);
          }
          break;
        case 'select':
          if (field.options && !Object.values(field.options).includes(value)) {
            errors.push(`Campo "${field.fieldLabel}" deve essere uno dei valori consentiti`);
          }
          break;
        case 'multiselect':
          if (!Array.isArray(value)) {
            errors.push(`Campo "${field.fieldLabel}" deve essere un array`);
          } else if (field.options) {
            const validValues = Object.values(field.options);
            for (const v of value) {
              if (!validValues.includes(v)) {
                errors.push(`Campo "${field.fieldLabel}" contiene valori non validi`);
                break;
              }
            }
          }
          break;
      }
    }

    return { valid: errors.length === 0, errors };
  }
}