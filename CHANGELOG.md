# Changelog

All notable changes to Nagma CRM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-05-14

### Added
- ✨ **Backend (Express + PostgreSQL)**
  - Complete CRM system with modular architecture (DDD pattern)
  - User authentication & authorization (JWT with role-based access)
  - Booking management system with scheduling
  - Customer management & tracking
  - Staff management with shifts
  - Finance tracking (income/expenses, transactions)
  - Attachment handling (file uploads for bookings)
  - WhatsApp integration (templates & message logs)
  - Form templates & cream tattoo management
  - API documentation with Swagger/OpenAPI 3.0
  - Health check endpoint
  - Request tracking with unique IDs
  - Graceful shutdown with connection cleanup
  - Database connection pooling

- 🛡️ **Security Features**
  - JWT authentication with configurable expiry
  - Bcrypt password hashing (salt rounds: 10)
  - Helmet.js for security headers
  - CORS protection with whitelist
  - Rate limiting (login, auth, API endpoints)
  - Input validation with Zod schemas
  - Sensitive data sanitization in logs (passwords, tokens redacted)
  - SQL injection protection via Prisma parametrized queries

- 📝 **Infrastructure**
  - Docker containerization (multi-stage builds)
  - Docker Compose with PostgreSQL 17
  - Prisma ORM with automatic migrations
  - Database seeding for development
  - Environment-based configuration (development, production)

- 🎨 **Frontend (Next.js + React 19)**
  - Modern UI with Material-UI components
  - Authentication flow with token refresh
  - Booking calendar view with FullCalendar
  - Customer management dashboard
  - Staff & shift scheduling
  - Finance tracking & reporting
  - Transaction export to Excel
  - Data tables with ag-grid
  - Charts & analytics with Recharts
  - Responsive design (mobile-friendly)
  - Error boundary with fallback UI
  - Toast notifications for user feedback

- 🌐 **Additional Services**
  - Landing page (separate repository reference)
  - PostgreSQL database service
  - Multi-service health checks
  - Network isolation with Docker bridge network
  - Volume persistence for database

### Security Improvements (Week 1)
- 🔒 Moved secrets from docker-compose.yml to `.env.local` (gitignored)
- 🔒 Removed JWT token from query string parameter (Authorization header only)
- 🔒 Added `.env.local.example` as secure configuration template

### Documentation
- 📚 `/backend/README.md` - Backend architecture & setup guide
- 📚 `/CONTRIBUTING.md` - Contribution guidelines & conventions
- 📚 `/CHANGELOG.md` - This file
- 📚 `/README.md` - Project overview & quick start

### Technical Stack
- **Backend**: Node.js 24+, Express 5.2.1, TypeScript 6.0.2, Prisma 6
- **Frontend**: Next.js 16.2.4, React 19.2.5, MUI 9.0.0, TypeScript 6
- **Database**: PostgreSQL 17
- **Security**: JWT, Bcrypt, Helmet, CORS
- **Utilities**: Zod validation, date-fns, SWR, Axios

---

## [Unreleased]

### Planned Features
- ⚙️ CI/CD pipeline (GitHub Actions)
- 🧪 Unit & integration test suite (target 70% coverage)
- 📊 Monitoring & alerting (Sentry, DataDog)
- 🔴 Redis integration for distributed cache & rate limiting
- 📈 Prometheus metrics & Grafana dashboard
- 🔄 Horizontal scaling with load balancer (Nginx/Traefik)
- 💾 Automated database backups
- 📱 Mobile app (React Native planned)
- 🌍 Multi-language support (i18n)
- 📧 Email notifications for bookings & updates

### Known Issues
- Query parameter fallback for JWT removed (now Authorization header only)
- Rate limiting & cache not distributed across multiple instances (Redis TODO)
- No centralized logging/error tracking yet (ELK/Sentry planned)

---

## Notes for Future Releases

### v1.1.0 (Planned)
- Add comprehensive test suite
- Implement CI/CD pipeline
- Integrate Redis for distributed caching
- Add monitoring/alerting

### v1.2.0 (Planned)
- Load balancer & horizontal scaling
- Automated backups
- Enhanced reporting

### v2.0.0 (Planned)
- Multi-language support
- Mobile app release
- Advanced analytics

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

Proprietary - Nagma Tattoo Studio
