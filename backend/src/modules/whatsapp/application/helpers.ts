import { AppError } from '../../../shared/errors/AppError';

export function extractTemplateVariables(templateBody: string) {
  return Array.from(templateBody.matchAll(/{{\s*([\w.-]+)\s*}}/g)).map((match) => match[1]);
}

export function renderTemplate(body: string, variables: Record<string, string>) {
  const requiredVariables = extractTemplateVariables(body);
  const missingVariables = requiredVariables.filter((key) => !variables[key]?.trim());

  if (missingVariables.length > 0) {
    throw new AppError(
      `Compila prima queste variabili: ${missingVariables.join(', ')}`,
      400,
      'WHATSAPP_VARIABLES_MISSING',
      missingVariables
    );
  }

  return body.replace(/{{\s*([\w.-]+)\s*}}/g, (_match, key: string) => variables[key]?.trim() || '');
}

export function normalizePhoneNumber(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, '');

  if (!normalized) {
    throw new AppError('Il numero di telefono non è valido', 400, 'WHATSAPP_PHONE_INVALID');
  }

  return normalized;
}
