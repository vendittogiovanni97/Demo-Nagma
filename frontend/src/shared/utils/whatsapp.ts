import type { Booking } from '@/modules/booking/model/booking.types';
import type { CustomerModel as Customer } from '@/modules/customer/model/customer.model';

export function extractTemplateVariables(templateBody: string) {
  return Array.from(new Set(Array.from(templateBody.matchAll(/{{\s*([\w.-]+)\s*}}/g)).map((match) => match[1])));
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function renderTemplatePreview(template: string, variables: Record<string, string>) {
  return template.replace(/{{\s*([\w.-]+)\s*}}/g, (_match, key: string) => variables[key]?.trim() || `{{${key}}}`);
}

export function getSuggestedVariableValue(
  key: string,
  customer: Customer | null,
  queryValues: Record<string, string>
) {
  const normalized = normalizeKey(key);

  if (normalized === 'nome') return customer?.firstName || queryValues.customerName || '';
  if (normalized === 'cognome') return customer?.lastName || '';
  if (normalized === 'telefono') return customer?.phone || queryValues.customerPhone || '';
  if (normalized === 'email') return customer?.email || '';
  if (normalized === 'data') return queryValues.bookingDate || '';
  if (normalized === 'ora') return queryValues.bookingTime || '';
  if (normalized === 'artista') return queryValues.artistName || '';
  if (normalized === 'tipo' || normalized === 'tipoappuntamento' || normalized === 'servizio') {
    return queryValues.bookingType || '';
  }

  return '';
}

export function getBookingVariableValue(
  key: string,
  selectedCustomer: Customer | null | undefined,
  booking?: Booking | null
) {
  const normalized = normalizeKey(key);

  if (normalized === 'nome') return selectedCustomer?.firstName || booking?.customer?.firstName || '';
  if (normalized === 'cognome') return selectedCustomer?.lastName || booking?.customer?.lastName || '';
  if (normalized === 'telefono') return selectedCustomer?.phone || '';
  if (normalized === 'email') return selectedCustomer?.email || '';
  if (normalized === 'data' && booking?.date) return new Date(booking.date).toLocaleDateString('it-IT');
  if (normalized === 'ora' && booking?.date) {
    return new Date(booking.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
  if (normalized === 'artista') return booking?.artist?.name || '';

  return '';
}
