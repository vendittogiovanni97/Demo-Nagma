#!/usr/bin/env node
/**
 * Generate OpenAPI spec from Zod schemas using @asteasolutions/zod-to-openapi
 * Run with: npx tsx scripts/generate-openapi.ts
 */

import { z } from 'zod';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import fs from 'fs';
import path from 'path';

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

// Create OpenAPI registry
const registry = new OpenAPIRegistry();

// Common schemas
const nonEmptyString = z.string().min(1, 'Campo obbligatorio');
const positiveNumber = z.number().positive('Deve essere un numero positivo');
const positiveInt = z.number().int().positive('Deve essere un intero positivo');

// Register all schemas with the registry
function registerSchema(name: string, schema: z.ZodTypeAny) {
  registry.register(name, schema);
}

// Booking schemas
const createBookingSchema = z.object({
  customerId: z.coerce.number().int().min(1).max(999999, 'customerId non valido'),
  artistId: z.coerce.number().int().min(1).max(999999, 'artistId non valido'),
  date: z.string().min(1, 'Campo obbligatorio'),
  duration: z.number().int().min(30).max(480).default(120).optional(),
  price: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  notes: z.string().optional(),
  type: z.string().optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
});

const updateBookingSchema = z.object({
  artistId: z.coerce.number().int().min(1).max(999999, 'artistId non valido').optional(),
  customerId: z.coerce.number().int().min(1).max(999999, 'customerId non valido').optional(),
  status: z.enum(['CREATO', 'CONFERMATO', 'COMPLETATO', 'MODIFICATO', 'SPOSTATO', 'ANNULLATO', 'CANCELLATO']).optional(),
  date: z.string().optional(),
  duration: z.number().int().min(30).max(480).optional(),
  price: z.number().positive().optional(),
  deposit: z.number().positive().optional(),
  notes: z.string().optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
});

const verifyPasswordSchema = z.object({
  password: z.string().min(1, 'Password obbligatoria'),
});

// Customer schemas
const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'Campo obbligatorio'),
  lastName: z.string().min(1, 'Campo obbligatorio'),
  phone: z.string().min(1, 'Campo obbligatorio'),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  notes: z.string().optional(),
});

const updateCustomerSchema = z.object({
  firstName: z.string().min(1, 'Campo obbligatorio').optional(),
  lastName: z.string().min(1, 'Campo obbligatorio').optional(),
  phone: z.string().min(1, 'Campo obbligatorio').optional(),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  notes: z.string().optional(),
});

// Staff schemas
const createStaffSchema = z.object({
  name: z.string().min(1, 'Campo obbligatorio'),
  type: z.enum(['COLLABORATORE', 'APPRENDISTA']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Formato colore non valido (es. #FF0000)'),
});

const updateStaffSchema = z.object({
  name: z.string().min(1, 'Campo obbligatorio').optional(),
  type: z.enum(['COLLABORATORE', 'APPRENDISTA']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Formato colore non valido').optional(),
});

const createShiftSchema = z.object({
  staffId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido (YYYY-MM-DD)'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato ora non valido (HH:MM)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato ora non valido (HH:MM)'),
  notes: z.string().optional(),
});

const updateShiftSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato ora non valido').optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato ora non valido').optional(),
  notes: z.string().optional(),
});

// Cream schemas
const createCreamSchema = z.object({
  name: z.string().min(1, 'Campo obbligatorio'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const createCreamSaleSchema = z.object({
  creamId: z.coerce.number().int().positive(),
  artistId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().default(1),
});

// Finance schemas
const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Campo obbligatorio'),
  description: z.string().min(1, 'Campo obbligatorio'),
  amount: z.number().positive('Deve essere un numero positivo'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido (YYYY-MM-DD)'),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
});

const updateTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().min(1, 'Campo obbligatorio').optional(),
  description: z.string().min(1, 'Campo obbligatorio').optional(),
  amount: z.number().positive('Deve essere un numero positivo').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
});

const createSpesaLiberaSchema = z.object({
  name: z.string().min(1, 'Campo obbligatorio'),
  price: z.number().positive('Deve essere un numero positivo'),
});

const updateSpesaLiberaSchema = z.object({
  name: z.string().min(1, 'Campo obbligatorio').optional(),
  price: z.number().positive('Deve essere un numero positivo').optional(),
});

// WhatsApp schemas
const createWhatsAppTemplateSchema = z.object({
  name: z.string().min(1, 'Campo obbligatorio'),
  category: z.string().optional(),
  body: z.string().min(1, 'Campo obbligatorio'),
  isActive: z.boolean().default(true),
});

const updateWhatsAppTemplateSchema = z.object({
  name: z.string().min(1, 'Campo obbligatorio').optional(),
  category: z.string().optional(),
  body: z.string().min(1, 'Campo obbligatorio').optional(),
  isActive: z.boolean().optional(),
});

const sendWhatsAppMessageSchema = z.object({
  templateId: z.coerce.number().int().positive().optional(),
  recipientName: z.string().optional(),
  recipientPhone: z.string().min(1, 'Campo obbligatorio'),
  templateName: z.string().optional(),
  message: z.string().min(1, 'Campo obbligatorio'),
  variables: z.record(z.string(), z.string()).optional(),
});

// Form Template schemas
const createFormTemplateSchema = z.object({
  name: z.string().min(1, 'Campo obbligatorio'),
  schemaB64: z.string().min(1, 'Campo obbligatorio'),
});

const updateFormTemplateSchema = z.object({
  name: z.string().min(1, 'Campo obbligatorio').optional(),
  schemaB64: z.string().min(1, 'Campo obbligatorio').optional(),
});

// Config schemas
const updateConfigSchema = z.object({
  SHOW_CONSENSI: z.boolean().optional(),
  SHOW_POSIZIONAMENTO: z.boolean().optional(),
  DEFAULT_PHONE_PREFIX: z.string().optional(),
});

// ClientConfig schemas
const updateClientConfigSchema = z.object({
  clientName: z.string().min(1, 'Campo obbligatorio').optional(),
  clientLogoUrl: z.string().url().optional().or(z.literal('')),
  clientTimeZone: z.string().optional(),
  clientLocale: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  features: z.object({
    enableCream: z.boolean(),
    enableWhatsApp: z.boolean(),
    enableFormTemplate: z.boolean(),
    enableConfig: z.boolean(),
  }).optional(),
  maxUsers: z.coerce.number().int().positive().optional(),
  maxBookings: z.coerce.number().int().positive().optional(),
  maxAttachmentSizeMB: z.coerce.number().int().positive().optional(),
  apiRateLimitPerMinute: z.coerce.number().int().positive().optional(),
});

// CustomField schemas
const createCustomFieldSchema = z.object({
  entityType: z.string().min(1, 'Campo obbligatorio'),
  fieldName: z.string().regex(/^[a-z][a-zA-Z0-9]*$/, 'Deve iniziare con minuscola e contenere solo caratteri alfanumerici (camelCase)'),
  fieldType: z.enum(['string', 'number', 'boolean', 'date', 'select', 'multiselect']),
  fieldLabel: z.string().min(1, 'Campo obbligatorio'),
  isRequired: z.boolean().default(false),
  options: z.record(z.string(), z.string()).optional(),
  defaultValue: z.unknown().optional(),
});

const updateCustomFieldSchema = z.object({
  fieldLabel: z.string().min(1, 'Campo obbligatorio').optional(),
  fieldType: z.enum(['string', 'number', 'boolean', 'date', 'select', 'multiselect']).optional(),
  isRequired: z.boolean().optional(),
  options: z.record(z.string(), z.string()).optional(),
  defaultValue: z.unknown().optional(),
});

const validateCustomDataSchema = z.object({
  entityType: z.string().min(1, 'Campo obbligatorio'),
  customData: z.record(z.string(), z.unknown()),
});

// Auth schemas
const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'Password obbligatoria'),
});

const registerSchemaZod = z.object({
  name: z.string().min(1, 'Campo obbligatorio'),
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'Password deve essere almeno 8 caratteri'),
  phone: z.string().optional(),
});

// Response schemas
const bookingResponseSchema = z.object({
  id: z.number().int(),
  customerId: z.number().int(),
  artistId: z.number().int().nullable(),
  date: z.string().datetime(),
  duration: z.number().int(),
  status: z.enum(['CREATO', 'CONFERMATO', 'COMPLETATO', 'MODIFICATO', 'SPOSTATO', 'ANNULLATO', 'CANCELLATO']),
  price: z.number().nullable(),
  deposit: z.number().nullable(),
  notes: z.string().nullable(),
  formData: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const customerResponseSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const staffResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  type: z.enum(['COLLABORATORE', 'APPRENDISTA']),
  color: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const creamResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const creamSaleResponseSchema = z.object({
  id: z.number().int(),
  creamId: z.number().int(),
  artistId: z.number().int(),
  quantity: z.number().int(),
  soldAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const transactionResponseSchema = z.object({
  id: z.number().int(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string(),
  description: z.string(),
  amount: z.number(),
  date: z.string().datetime(),
  attachmentUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const whatsAppTemplateResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  category: z.string().nullable(),
  body: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const formTemplateResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  schemaB64: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const clientConfigResponseSchema = z.object({
  id: z.number().int(),
  clientName: z.string(),
  clientLogoUrl: z.string().nullable(),
  clientTimeZone: z.string(),
  clientLocale: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  features: z.object({
    enableCream: z.boolean(),
    enableWhatsApp: z.boolean(),
    enableFormTemplate: z.boolean(),
    enableConfig: z.boolean(),
  }),
  maxUsers: z.number().int(),
  maxBookings: z.number().int(),
  maxAttachmentSizeMB: z.number().int(),
  apiRateLimitPerMinute: z.number().int(),
  customFields: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const customFieldResponseSchema = z.object({
  id: z.string(),
  entityType: z.string(),
  fieldName: z.string(),
  fieldType: z.enum(['string', 'number', 'boolean', 'date', 'select', 'multiselect']),
  fieldLabel: z.string(),
  isRequired: z.boolean(),
  options: z.record(z.string(), z.string()).nullable(),
  defaultValue: z.unknown().nullable(),
  clientId: z.number().int(),
  deletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Register all schemas
// Booking schemas
registry.register('CreateBooking', createBookingSchema);
registry.register('UpdateBooking', updateBookingSchema);
registry.register('VerifyPassword', verifyPasswordSchema);

// Customer schemas
registry.register('CreateCustomer', createCustomerSchema);
registry.register('UpdateCustomer', updateCustomerSchema);

// Staff schemas
registry.register('CreateStaff', createStaffSchema);
registry.register('UpdateStaff', updateStaffSchema);
registry.register('CreateShift', createShiftSchema);
registry.register('UpdateShift', updateShiftSchema);

// Cream schemas
registry.register('CreateCream', createCreamSchema);
registry.register('CreateCreamSale', createCreamSaleSchema);

// Finance schemas
registry.register('CreateTransaction', createTransactionSchema);
registry.register('UpdateTransaction', updateTransactionSchema);
registry.register('CreateSpesaLibera', createSpesaLiberaSchema);
registry.register('UpdateSpesaLibera', updateSpesaLiberaSchema);

// WhatsApp schemas
registry.register('CreateWhatsAppTemplate', createWhatsAppTemplateSchema);
registry.register('UpdateWhatsAppTemplate', updateWhatsAppTemplateSchema);
registry.register('SendWhatsAppMessage', sendWhatsAppMessageSchema);

// Form Template schemas
registry.register('CreateFormTemplate', createFormTemplateSchema);
registry.register('UpdateFormTemplate', updateFormTemplateSchema);

// Config schemas
registry.register('UpdateConfig', updateConfigSchema);
registry.register('UpdateClientConfig', updateClientConfigSchema);

// CustomField schemas
registry.register('CreateCustomField', createCustomFieldSchema);
registry.register('UpdateCustomField', updateCustomFieldSchema);
registry.register('ValidateCustomData', validateCustomDataSchema);

// Auth schemas
registry.register('Login', loginSchema);
registry.register('Register', registerSchemaZod);

// Response schemas
registry.register('BookingResponse', bookingResponseSchema);
registry.register('CustomerResponse', customerResponseSchema);
registry.register('StaffResponse', staffResponseSchema);
registry.register('CreamResponse', creamResponseSchema);
registry.register('CreamSaleResponse', creamSaleResponseSchema);
registry.register('TransactionResponse', transactionResponseSchema);
registry.register('WhatsAppTemplateResponse', whatsAppTemplateResponseSchema);
registry.register('FormTemplateResponse', formTemplateResponseSchema);
registry.register('ClientConfigResponse', clientConfigResponseSchema);
registry.register('CustomFieldResponse', customFieldResponseSchema);

// Generate OpenAPI spec
function generateOpenAPISpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const spec = generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Demo-Nagma API',
      version: '1.0.0',
      description: 'Tattoo Studio Management CRM API',
      contact: {
        name: 'Demo-Nagma Team',
      },
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development server' },
      { url: 'https://api.demo-nagma.com', description: 'Production server' },
    ],
  });

  return spec;
}

// Generate and write spec
function generateAndWriteSpec() {
  const spec = generateOpenAPISpec();

  const outputDir = path.join(__dirname, '../../docs/openapi');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));

  console.log('OpenAPI spec generated at docs/openapi/openapi.json');
  console.log(`Schemas registered: ${Object.keys(registry.definitions).length}`);
}

// Run
generateAndWriteSpec();