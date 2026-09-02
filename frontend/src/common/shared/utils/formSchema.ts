import type { FieldDef } from '@/modules/form-templates/model/form-template.types';

// Codec Base64 UTF-8-safe per lo schema dei form template.
// btoa/atob gestiscono solo Latin1: senza il passaggio UTF-8 caratteri come
// € / apostrofi tipografici / emoji fanno lanciare InvalidCharacterError in
// encode (salvataggio impossibile) e corrompono la decode.
export function decodeFields(schemaB64: string): FieldDef[] {
  try {
    const binary = atob(schemaB64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return [];
  }
}

export function encodeFields(fields: FieldDef[]): string {
  const bytes = new TextEncoder().encode(JSON.stringify(fields));
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}
