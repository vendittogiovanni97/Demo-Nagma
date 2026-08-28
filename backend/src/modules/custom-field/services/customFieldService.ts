import { Prisma } from '@prisma/client';
import prisma from '../../../core/shared/utils/prisma';
import { AppError } from '../../../core/shared/errors/AppError';

export interface CustomFieldData {
  entityType: string;
  fieldName: string;
  fieldType: string;
  fieldLabel: string;
  isRequired?: boolean;
  options?: Prisma.InputJsonValue;
  defaultValue?: Prisma.InputJsonValue;
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
      throw new AppError('Custom field not found', 404, 'CUSTOM_FIELD_NOT_FOUND');
    }

    return prisma.customField.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, clientId: number) {
    const existing = await this.getById(id, clientId);
    if (!existing) {
      throw new AppError('Custom field not found', 404, 'CUSTOM_FIELD_NOT_FOUND');
    }

    return prisma.customField.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async validateCustomData(entityType: string, clientId: number, customData: Record<string, unknown>) {
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
          if (isNaN(Date.parse(String(value)))) {
            errors.push(`Campo "${field.fieldLabel}" deve essere una data valida`);
          }
          break;
        case 'select':
          if (field.options && !(Object.values(field.options) as unknown[]).includes(value)) {
            errors.push(`Campo "${field.fieldLabel}" deve essere uno dei valori consentiti`);
          }
          break;
        case 'multiselect':
          if (!Array.isArray(value)) {
            errors.push(`Campo "${field.fieldLabel}" deve essere un array`);
          } else if (field.options) {
            const validValues: unknown[] = Object.values(field.options);
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