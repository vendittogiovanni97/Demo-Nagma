# Module Template Guide

This document explains how to create a new module using the provided template.

## Template Location
The module template is located at:
`backend/src/modules/_template/`

## Steps to Create a New Module

### 1. Copy the Template
Copy the entire `_template` directory to a new module name:
```bash
cp -r backend/src/modules/_template backend/src/modules/your-module-name
```

### 2. Rename Files
Rename all files in the new directory to match your module name:
- `_template.service.ts` → `your-module-name.service.ts`
- `_template.controller.ts` → `your-module-name.controller.ts`
- `_template.routes.ts` → `your-module-name.routes.ts`
- `_template.bootstrap.ts` → `your-module-name.bootstrap.ts`
- `_template.types.ts` → `your-module-name.types.ts`
- `_template.schema.ts` → `your-module-name.schema.ts`
- `_template.service.test.ts` → `your-module-name.service.test.ts`

### 3. Update Content
Open each file and replace:
- All instances of `_template` with your module name (kebab-case for files, camelCase for classes/variables)
- All instances of `Template` with your entity name (PascalCase)
- Update the service methods to match your entity's actual fields and business logic
- Adjust validation schemas as needed
- Update test cases to reflect your entity's behavior

### 4. Register the Module
Add your module's bootstrap function to the main bootstrap sequence:

In `backend/src/core/container/bootstrap.ts`:
```typescript
import { bootstrapAuth } from '../modules/auth/auth.bootstrap';
// ... other imports
import { bootstrapYourModuleName } from './modules/your-module-name/your-module-name.bootstrap';

export function bootstrapContainer(): void {
  // Bootstrap core services
  bootstrapLogger();
  bootstrapConfig();
  
  // Bootstrap modules
  bootstrapAuth();
  // ... other modules
  bootstrapYourModuleName(); // Add this line
  
  // Bootstrap error handling (should be last)
  bootstrapErrorHandler();
}
```

### 5. Register Routes
Add your module's routes to the main router:

In `backend/src/routes.ts`:
```typescript
import { registerAuthRoutes } from '../modules/auth/auth.routes';
// ... other imports
import { registerYourModuleNameRoutes } from './modules/your-module-name/your-module-name.routes';

export function registerRoutes(app: Express) {
  const apiRouter = Router();
  
  // Register module routes
  registerAuthRoutes(apiRouter);
  // ... other modules
  registerYourModuleNameRoutes(apiRouter); // Add this line
  
  app.use('/api', apiRouter);
}
```

### 6. Update Prisma Schema (if needed)
If your module requires new database tables:
1. Add the model to `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your-migration-name`
3. Update the service methods to use the new model

### 7. Update DTOs and Validation
Modify the schema file (`*.schema.ts`) to match your entity's validation requirements.

### 8. Implement Business Logic
Replace the generic CRUD operations in the service with your specific business logic:
- Add custom methods beyond basic CRUD
- Implement validation rules
- Add transaction handling where needed
- Integrate with other services as required

### 9. Update Tests
Modify the test file (`*.service.test.ts`) to:
- Use realistic test data for your entity
- Test your specific business logic
- Cover edge cases and error conditions
- Test integration with other services if applicable

### 10. Verify Implementation
Run the following to verify your module works correctly:
```bash
# Linting
npm run lint

# Unit tests (for your module)
npm test -- --testNamePattern="your-module-name"

# Build verification
npm run build

# Start application and test endpoints
npm run dev
```

## Template File Reference

### Service (`*.service.ts`)
Contains business logic and data access methods. Should:
- Handle data validation
- Implement transaction boundaries
- Convert between domain objects and DTOs
- Throw appropriate domain-specific exceptions

### Controller (`*.controller.ts`)
Handles HTTP requests and responses. Should:
- Extract data from request (params, query, body, headers)
- Call service methods
- Format responses appropriately
- Handle errors and convert to appropriate HTTP responses

### Routes (`*.routes.ts`)
Defines API endpoints. Should:
- Map HTTP methods and paths to controller methods
- Apply middleware (authentication, validation, etc.)
- Use expressive route naming

### Bootstrap (`*.bootstrap.ts`)
Registers services and controllers with the DI container. Should:
- Create service instances
- Create controller instances (injecting services)
- Register both in the container
- Follow the pattern: `container.register(ServiceClass, serviceInstance)`

### Types (`*.types.ts`)
Contains TypeScript interfaces and types specific to the module. Should:
- Define DTOs (Data Transfer Objects)
- Define entity interfaces if extending Prisma types
- Export types for use in other modules

### Schema (`*.schema.ts`)
Contains validation schemas using Zod or similar. Should:
- Define validation rules for incoming data
- Export typed schemas for use in controllers and services
- Include both creation and update variants where appropriate

## Best Practices

### Naming Conventions
- **Files**: kebab-case (e.g., `customer-service.ts`)
- **Classes/Interfaces**: PascalCase (e.g., `CustomerService`)
- **Functions/Variables**: camelCase (e.g., `getCustomerById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Database Tables**: PascalCase matching Prisma models
- **API Endpoints**: kebab-case (e.g., `/api/customers`)

### Service Layer
- Keep business logic in services, not controllers
- Return domain objects or DTOs, not Prisma models directly
- Handle transactions at service level when needed
- Throw domain-specific errors that controllers can map to HTTP responses

### Controller Layer
- Stay focused on HTTP concerns only
- Validate input early (using schema validation)
- Map service errors to appropriate HTTP status codes
- Keep responses consistent in format

### Testing
- Test service methods with mock dependencies where appropriate
- Test controller error handling
- Test edge cases and validation boundaries
- Use factory functions for test data creation
- Keep tests focused and independent

## Common Customizations

### Adding Custom Methods
Add methods to the service for domain-specific operations:
```typescript
// Example: Specialized search method
async searchByCriteria(criteria: SearchCriteria): Promise<Template[]> {
  // Complex business logic here
  return prisma.template.findMany({ /* ... */ });
}
```

### Handling Relationships
For entities with relations:
```typescript
// In service methods, include related data when needed
return await template.findMany({
  where: { /* ... */ },
  include: {
    author: true,
    categories: true,
  }
});
```

### Implementing Soft Delete
If your entity supports soft deletion:
```typescript
// Always filter out deleted records unless explicitly requested
where: {
  ...conditions,
  deletedAt: null,
}

// Provide methods to restore or permanently delete
async restore(id: string): Promise<Template> { /* ... */ }
async deleteForever(id: string): Promise<void> { /* ... */ }
```

## Troubleshooting

### Circular Dependencies
If you encounter circular dependency issues:
1. Consider if the dependency is really necessary
2. Move shared functionality to a shared service
3. Use dependency injection interfaces to break the cycle
4. As a last resort, use lazy initialization

### Missing Dependencies
If you get "Cannot find module" errors:
1. Check that all imports use correct relative paths
2. Verify the target file exists
3. Ensure tsconfig paths are configured correctly
4. Run `npm install` if you added new dependencies

### Type Errors
For TypeScript compilation errors:
1. Check that you've updated all instances of the template names
2. Verify that your custom properties match your database schema
3. Ensure you're importing from correct locations
4. Run `npx tsc --noEmit` to check for type issues

## Getting Help
If you encounter issues during module creation:
1. Check the console for error messages
2. Review existing modules for similar patterns
3. Consult the CLAUDE.md file for architectural guidelines
4. Ask team members for pair programming assistance

---
*Template Version: 1.0*
*Last updated: July 12, 2026*