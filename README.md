# 🎨 Nagma CRM - Complete Tattoo Studio Management System

A modern, full-stack web application for managing tattoo studio operations including bookings, customer management, staff scheduling, and financial tracking.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![License](https://img.shields.io/badge/license-proprietary-blue)
![Node](https://img.shields.io/badge/node-%3E%3D24-green)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-blue)

---

## 🎯 Quick Start

### Prerequisites
- **Node.js** >= 24
- **npm** >= 11
- **Docker** & **Docker Compose**
- **PostgreSQL** 17 (via Docker, recommended)

### 5-Minute Setup

```bash
# 1. Clone and navigate
git clone <repository-url>
cd agents-audit-progetto-completo

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your settings (defaults work locally)

# 3. Start the stack
docker-compose up -d

# 4. Backend (terminal 1)
cd backend && npm install && npm run dev

# 5. Frontend (terminal 2)
cd frontend && npm install && npm run dev

# 6. Open http://localhost:3000 in your browser
```

**Default Credentials (dev only):**
- Email: `admin@nagma.it`
- Password: `admin123`

---

## 📦 Project Structure

```
agents-audit-progetto-completo/
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── modules/         # 12 feature modules (auth, booking, customer, etc.)
│   │   ├── middlewares/     # Auth, error handling, rate limiting
│   │   ├── shared/          # Utils, logger, validation
│   │   └── config/          # Swagger, environment setup
│   ├── prisma/              # Database schema & migrations
│   └── README.md            # Backend-specific documentation
│
├── frontend/                # Next.js application
│   ├── src/
│   │   ├── app/            # Routes & pages (Next.js App Router)
│   │   ├── modules/        # Feature modules
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   └── context/        # Global state (auth, theme)
│   └── next.config.ts      # Next.js configuration
│
├── landing-page/            # Static landing page
├── docs/                     # Documentation & guides
├── docker-compose.yml        # Services: postgres, backend, frontend
├── .env.local.example        # Environment template (copy to .env.local)
├── CONTRIBUTING.md           # Contribution guidelines
├── CHANGELOG.md              # Version history
└── README.md                 # This file
```

---

## 🚀 Technology Stack

### Backend
| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 24+, Express 5.2.1 |
| **Language** | TypeScript 6 (strict mode) |
| **Database** | PostgreSQL 17 + Prisma 6 ORM |
| **Security** | JWT, Bcrypt, Helmet, CORS, Rate Limiting |
| **Validation** | Zod 4.3.6 |
| **Documentation** | Swagger/OpenAPI 3.0 |
| **File Uploads** | busboy 1.6.0 |
| **Logging** | Custom logger with sanitization |

### Frontend
| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2.4, React 19.2.5 |
| **Language** | TypeScript 6 (strict mode) |
| **UI Components** | Material-UI 9.0.0, Radix UI, Lucide Icons |
| **Styling** | Emotion, Tailwind CSS |
| **Data Fetching** | SWR 2.4.1, Axios 1.15.2 |
| **State** | Context API, custom hooks |
| **Calendar** | FullCalendar 6.1.20 |
| **Tables** | ag-grid 32.3.9 |
| **Charts** | Recharts 3.8.1 |
| **Export** | XLSX 0.18.5 (Excel) |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| **Containerization** | Docker, Docker Compose |
| **Database** | PostgreSQL 17 (Alpine image) |
| **Networking** | Bridge network (nagma_network) |
| **Volumes** | Persistent storage (nagma_data) |

---

## 🔑 Key Features

### 👥 User Management
- Role-based access control (SUPER_ADMIN, ADMIN, USER, ARTIST)
- JWT-based authentication with refresh tokens
- Secure password hashing with Bcrypt
- Rate limiting on login attempts

### 📅 Booking System
- Calendar view of bookings
- Booking status tracking (created, confirmed, completed, etc.)
- Booking history & audit trail
- Automatic email/SMS notifications (WhatsApp integration)
- Tattoo placement tracking

### 👨‍👩‍👧 Customer Management
- Customer database with contact info
- Booking history per customer
- Preferences & tags
- Transaction history

### 👔 Staff Management
- Staff profiles (type: COLLABORATORE, APPRENDISTA)
- Shift scheduling
- Performance tracking
- Availability management

### 💰 Finance Module
- Income/expense tracking
- Transaction categorization
- Invoice generation (PDF)
- Financial reports & analytics
- Monthly/yearly summaries

### 🎨 Additional Features
- Form template management
- Cream tattoo catalog
- WhatsApp template integration
- Document attachments (PDFs, images)
- Configurable business settings

---

## 📡 API Documentation

Backend API documentation is available at:
```
http://localhost:3001/api-docs
```

**Swagger/OpenAPI** specification includes all endpoints, request/response schemas, and authentication details.

**Main Endpoints:**
```
POST   /api/auth/login                    # User login
POST   /api/auth/register                 # New user registration
GET    /api/auth/me                       # Current user profile
POST   /api/customers                     # Create customer
GET    /api/customers/:id                 # Get customer details
GET    /api/bookings                      # List bookings
POST   /api/bookings                      # Create booking
GET    /api/finance/transactions          # Get transactions
GET    /api/staff/members                 # List staff
GET    /health                            # Health check
```

See [`/backend/README.md`](./backend/README.md) for complete API reference.

---

## 🛡️ Security

- **Authentication**: JWT with 32+ char secret, configurable expiry (default 8h)
- **Authorization**: Role-based access control on all endpoints
- **Password Security**: Bcrypt hashing with 10 salt rounds
- **HTTP Security**: Helmet.js headers, CORS whitelist
- **Rate Limiting**: Login (5/15min), Auth (10/15min), API (100/15min)
- **Input Validation**: Zod schemas on all inputs
- **Secret Management**: Secrets stored in `.env.local` (gitignored)
- **Logging**: Sensitive data redacted (passwords, tokens, secrets)
- **SQL Injection**: Prevented via Prisma parametrized queries

**Note**: JWT tokens must be sent via Authorization header:
```bash
Authorization: Bearer <token>
```

---

## 🐳 Docker

### Start Services
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services
```bash
docker-compose down
```

### Rebuild Images
```bash
docker-compose up -d --build
```

### Database Backup
```bash
docker-compose exec postgres pg_dump -U root -d nagmadb_ > backup.sql
```

### Database Restore
```bash
docker-compose exec -T postgres psql -U root -d nagmadb_ < backup.sql
```

---

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

**Coverage Target**: 70% on business logic

---

## 📊 Monitoring & Debugging

### Backend Logs
```bash
# View logs
docker-compose logs backend

# Follow logs
docker-compose logs -f backend

# Set debug level
NODE_ENV=development LOG_LEVEL=DEBUG docker-compose up
```

### Health Check
```bash
curl http://localhost:3001/health
```

### Database Connection
```bash
docker-compose exec postgres psql -U root -d nagmadb_
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Set strong `JWT_SECRET` (32+ chars)
- [ ] Update admin passwords (`ADMIN_PASSWORD`, `SUPER_ADMIN_PASSWORD`)
- [ ] Set `NODE_ENV=production`
- [ ] Update `CORS_ORIGINS` to production domain
- [ ] Enable HTTPS/SSL
- [ ] Configure external database (not local container)
- [ ] Setup monitoring (Sentry, DataDog)
- [ ] Setup automated backups
- [ ] Configure load balancer (if multi-instance)

See [`/backend/README.md`](./backend/README.md) for detailed deployment guide.

---

## 📚 Documentation

- **[Backend README](./backend/README.md)** - Architecture, API, setup, troubleshooting
- **[Contributing Guide](./CONTRIBUTING.md)** - Development workflow, conventions, code standards
- **[Changelog](./CHANGELOG.md)** - Version history & planned features
- **[Swagger API Docs](http://localhost:3001/api-docs)** - Interactive API documentation

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Branch naming conventions
- Commit message format
- Code standards
- Pull request process

---

## 🐛 Known Issues & Limitations

- **Single-instance only**: Cache & rate limiting use in-memory (TODO: Redis for multi-instance)
- **No centralized logging**: Logs to stdout only (TODO: ELK/Sentry integration)
- **No automated backups**: Manual backup required (TODO: automated strategy)
- **No load balancer**: Single point of entry (TODO: Nginx/Traefik)

---

## 🗺️ Roadmap

### v1.1.0 (Next)
- Comprehensive test suite (70% coverage)
- CI/CD pipeline (GitHub Actions)
- Redis integration for distributed cache

### v1.2.0 (Planned)
- Load balancer & horizontal scaling
- Automated database backups
- Enhanced reporting & analytics

### v2.0.0 (Future)
- Multi-language support (i18n)
- Mobile app (React Native)
- Advanced AI-powered recommendations

---

## 📞 Support & Contact

For issues, questions, or feature requests:
1. Check [Contributing Guide](./CONTRIBUTING.md)
2. Review [Backend README](./backend/README.md)
3. Open an issue with detailed information
4. Contact maintainers

---

## 📄 License

Proprietary - Nagma Tattoo Studio. All rights reserved.

---

## ✨ Credits

Built with modern web technologies and best practices for scalability, security, and maintainability.

**Team**: Nagma CRM Development Team

---

**Last Updated**: May 14, 2026 | **Version**: 1.0.0
