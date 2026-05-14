# Contributing to Nagma CRM

Thank you for your interest in contributing to Nagma CRM! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites
- Node.js >= 24
- npm >= 11
- Docker & Docker Compose
- PostgreSQL 17 (via Docker recommended)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd agents-audit-progetto-completo
   ```

2. **Copy environment template:**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your local configuration (for development, defaults are fine).

3. **Start the stack:**
   ```bash
   docker-compose up -d
   ```

4. **Backend setup:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. **Frontend setup (in another terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The app will be available at `http://localhost:3000` (frontend) and backend at `http://localhost:3001`.

---

## Development Workflow

### Branch Naming Convention

Use meaningful branch names that describe the work:

- **Feature**: `feature/user-authentication`, `feature/booking-system`
- **Bug fix**: `bugfix/token-validation`, `bugfix/login-error`
- **Refactor**: `refactor/auth-module`, `refactor/database-queries`
- **Chore**: `chore/update-dependencies`, `chore/docker-config`
- **Docs**: `docs/contributing-guide`, `docs/api-documentation`

**Format**: `<type>/<short-description>` (lowercase, kebab-case)

### Commit Message Convention

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance, dependencies, build configuration

**Examples:**
```
feat(auth): add JWT token refresh mechanism
fix(booking): prevent double booking on concurrent requests
docs(backend): update database schema documentation
refactor(middleware): simplify error handling
chore(deps): upgrade Express to v5.2.1
```

**Scope** (optional): The module/area being changed (auth, booking, customer, etc.)
**Subject** (required): Short description, imperative mood, no period
**Body** (optional): Detailed explanation of changes
**Footer** (optional): Breaking changes, closes issues

### Pull Request Guidelines

1. **Create a descriptive PR title** using conventional commits format:
   - ✅ Good: `feat(auth): implement password reset flow`
   - ❌ Bad: `update`, `fix stuff`, `WIP`

2. **Describe your changes in the PR body:**
   - What was the problem?
   - How does this PR solve it?
   - Any breaking changes?
   - Related issues (closes #123)

3. **Ensure your code passes checks:**
   ```bash
   # Backend
   cd backend
   npm run lint
   npm run build
   npm test

   # Frontend
   cd frontend
   npm run lint
   npm run build
   npm test
   ```

4. **Request reviewers** and respond to feedback promptly.

5. **Before merging:**
   - All CI checks pass ✅
   - At least 1 approval from a maintainer ✅
   - Commits are clean and follow conventions ✅

---

## Code Standards

### Backend (Express + TypeScript)

- **Language**: TypeScript with strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for classes/types
- **Architecture**: Follow DDD (Domain-Driven Design) with layers:
  - `domain/` - Business logic, entities
  - `application/` - Use cases, services
  - `infrastructure/` - Repositories, database
  - `interfaces/` - Controllers, routes, DTOs
- **Error Handling**: Use `AppError` class from shared utils
- **Logging**: Use provided `logger` utility, avoid `console.log()`
- **Validation**: Use Zod schemas for input validation
- **Documentation**: Add JSDoc comments for public functions

### Frontend (React + Next.js + TypeScript)

- **Language**: TypeScript with strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Components**: Functional components with hooks
- **State**: Use Context API for global state, hooks for local state
- **Styling**: MUI components with Emotion/Tailwind CSS
- **Type Safety**: Avoid `any`, use proper interfaces/types
- **Documentation**: Add comments for complex logic, component props

### Common Guidelines

- **No hardcoded values**: Use configuration or constants
- **DRY principle**: Don't repeat yourself, extract reusable code
- **Security**: No secrets in code, validate/sanitize inputs
- **Performance**: Optimize queries, use pagination, lazy load when needed
- **Testing**: Write tests for critical business logic
- **Comments**: Only comment "why", not "what" (code should be self-documenting)

---

## Testing

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Writing Tests

- **Unit tests**: Test individual functions/components in isolation
- **Integration tests**: Test module interactions
- **Coverage goal**: Aim for 70%+ coverage on business logic

---

## Reporting Issues

1. **Check existing issues** to avoid duplicates
2. **Use clear title**: `[BUG] Login fails with email containing +`, not `bug`
3. **Provide details:**
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (OS, Node version, browser)
   - Screenshots/logs if applicable

---

## Code Review Process

- Reviews are constructive and focused on code quality
- Respond to feedback, ask for clarification if needed
- Small, focused PRs are reviewed faster
- Request changes mean "needs work", approval means "looks good"

---

## Deployment

- Development: Continuous from `develop` branch
- Staging: Tag releases as `v1.x.x` on `main` branch
- Production: Manual approval required

See `/backend/README.md` for detailed deployment instructions.

---

## Questions or Need Help?

- Check existing documentation in `/backend/README.md`
- Open an issue with the `question` label
- Reach out to maintainers on the team

Happy coding! 🚀
