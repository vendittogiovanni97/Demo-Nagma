// swagger.ts — Swagger/OpenAPI configuration
// Uses dynamic require because swagger-jsdoc is a CommonJS-only package.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerJsdoc = require('swagger-jsdoc');

let cachedSwaggerSpec: ReturnType<typeof swaggerJsdoc> | null = null;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nagma Tattoo CRM API',
      version: '1.0.0',
      description: 'API documentation for Nagma Tattoo CRM - Gestionale completo per studio tatuaggi',
      contact: {
        name: 'Nagma Team',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Inserisci il token JWT senza il prefisso "Bearer "',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            requestId: { type: 'string', format: 'uuid' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                statusCode: { type: 'integer' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN'] },
            phone: { type: 'string' },
            color: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            customerId: { type: 'integer' },
            artistId: { type: 'integer', nullable: true },
            date: { type: 'string', format: 'date-time' },
            duration: { type: 'integer', description: 'Durata in minuti' },
            status: { type: 'string', enum: ['CREATO', 'CONFERMATO', 'COMPLETATO', 'MODIFICATO', 'SPOSTATO', 'ANNULLATO', 'CANCELLATO'] },
            type: { type: 'string', description: 'Tipo servizio (Tattoo, Touch-up, Consulenza)' },
            price: { type: 'number' },
            deposit: { type: 'number' },
            notes: { type: 'string' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            type: { type: 'string', enum: ['ENTRATA', 'USCITA'] },
            category: { type: 'string' },
            description: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date-time' },
            artistId: { type: 'integer', nullable: true },
          },
        },
        FormTemplate: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            schemaB64: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { type: 'object' } },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticazione e gestione sessione' },
      { name: 'Customers', description: 'Anagrafica clienti' },
      { name: 'Bookings', description: 'Appuntamenti e prenotazioni' },
      { name: 'Transactions', description: 'Transazioni finanziarie' },
      { name: 'Team', description: 'Gestione team e turni' },
      { name: 'FormTemplates', description: 'Template form dinamici' },
      { name: 'WhatsApp', description: 'Template e invio messaggi WhatsApp' },
      { name: 'Health', description: 'Health check' },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

export function getSwaggerSpec() {
  if (!cachedSwaggerSpec) {
    cachedSwaggerSpec = swaggerJsdoc(options);
  }

  return cachedSwaggerSpec;
}
