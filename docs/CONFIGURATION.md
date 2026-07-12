# Demo-Nagma Configuration Reference

Complete reference for all configuration options, environment variables, and system settings.

## Environment Variables

### Database Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `POSTGRES_USER` | PostgreSQL username | `root` | `dbadmin` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `root123` | `secure_password_123` |
| `POSTGRES_DB` | PostgreSQL database name | `nagmadb_` | `tattoo_crm_prod` |

### Backend Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `JWT_SECRET` | Secret for JWT token signing (min 32 chars) | `a3f8c2d7e1b94056f2a8c3d6e0b7f1a4c9d2e5f8b1a3c6d9e2f5a8b4c7d0e3f6` | `your-ultra-secure-random-string-here-min-32-chars` |
| `PORT` | Port for backend API server | `3001` | `4000` |
| `NODE_ENV` | Node environment (`development`, `production`) | `development` | `production` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` | `https://app.example.com,https://studio.example.com` |
| `DEBUG_HTTP` | Enable HTTP request/response logging | `false` | `true` |
| `BOOKING_UPDATE_PASSWORD` | Password required to modify existing bookings | `nagmatatto12` | `secure-booking-pin` |
| `ADMIN_PASSWORD` | Default admin user password (for seed) | `admin123` | `StrongAdminPass!` |
| `SUPER_ADMIN_PASSWORD` | Default super admin user password (for seed) | `superadmin123` | `SuperAdminSecure!` |
| `RUN_SEEDS` | Whether to run seed scripts on startup | `true` | `false` (in production) |
| `DB_POOL_SIZE` | Database connection pool size | `20` | `50` |
| `DB_IDLE_TIMEOUT_MS` | Idle connection timeout (ms) | `30000` | `60000` |
| `DB_CONNECTION_TIMEOUT_MS` | Connection acquisition timeout (ms) | `5000` | `10000` |
| `LOG_LEVEL` | Logging level (`DEBUG`, `INFO`, `WARN`, `ERROR`) | `INFO` | `DEBUG` |

### Frontend Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for API calls | `http://localhost:3001` | `https://api.yourstudio.com` |
| `NEXT_PUBLIC_PORTAL_NAME` | Full application name | `Nagma Tattoo CRM` | `StudioInk Management System` |
| `NEXT_PUBLIC_PORTAL_SHORT_NAME` | Short application name | `Nagma` | `StudioInk` |
| `NEXT_PUBLIC_PORTAL_DESCRIPTION` | Application description | `Gestionale completo Nagma Tattoo Studio` | `Complete tattoo studio management` |
| `NEXT_PUBLIC_PORTAL_LOGO` | Logo path (relative to public folder) | `/logo.svg` | `/logos/main-logo.svg` |
| `NEXT_PUBLIC_DEFAULT_PAGE_LIMIT` | Default items per page in lists | `20` | `50` |
| `NEXT_PUBLIC_EXPORT_FETCH_LIMIT` | Max records for export operations | `1000` | `5000` |
| `NEXT_PUBLIC_DEBOUNCE_SEARCH_DELAY` | Search input debounce delay (ms) | `250` | `500` |
| `NEXT_PUBLIC_DEFAULT_BOOKING_DURATION` | Default booking duration (minutes) | `60` | `90` |
| `NEXT_PUBLIC_DEFAULT_BOOKING_TYPE` | Default booking type | `Tattoo` | `Piercing` |
| `NEXT_PUBLIC_DEFAULT_SHIFT_START` | Default shift start time (HH:MM) | `09:00` | `08:00` |
| `NEXT_PUBLIC_DEFAULT_SHIFT_END` | Default shift end time (HH:MM) | `18:00` | `17:00` |
| `NEXT_PUBLIC_DEFAULT_TRENDS_MONTHS` | Default months for trend analysis | `6` | `12` |

## Feature Flags

Feature flags control which modules/functionalities are enabled. These are stored in the `ClientConfig` table in the database and can be toggled via the admin UI.

| Feature Flag | Description | When Disabled |
|--------------|-------------|---------------|
| `enableCream` | Cream/products sales module | Hides cream sales UI and blocks `/api/cream/*` endpoints |
| `enableWhatsApp` | WhatsApp messaging integration | Hides WhatsApp templates and blocks `/api/whatsapp/*` endpoints |
| `enableFormTemplate` | Dynamic form templates module | Hides form template builder and blocks `/api/form-template/*` endpoints |
| `enableConfig` | System configuration management | Hides settings UI and blocks `/api/config/*` endpoints (except public) |

### Setting Feature Flags

Feature flags can be set in two ways:

1. **Via Admin UI** (Recommended):
   - Login as admin or super admin
   - Navigate to Settings → Feature Flags
   - Toggle switches and save

2. **Via Database** (Advanced):
   ```sql
   -- Example: Disable cream module
   UPDATE "ClientConfig" 
   SET features = jsonb_set(features, '{enableCream}', 'false')
   WHERE id = (SELECT id FROM "ClientConfig" LIMIT 1);
   ```

## Branding Customization

### Logo
- **Format**: SVG recommended (for scalability), PNG/JPG also supported
- **Size**: Ideal dimensions 200x60px (width x height)
- **Path**: Place in `/public/logos/` or similar, then set `NEXT_PUBLIC_PORTAL_LOGO` to the path
- **Example**: If logo is at `/public/logos/my-studio.svg`, set `NEXT_PUBLIC_PORTAL_LOGO=/logos/my-studio.svg`

### Colors
The application uses Material Design theming with primary and secondary colors:

| Variable | Purpose | Default | Customization Method |
|----------|---------|---------|----------------------|
| Primary Color | Main brand color (buttons, links, active states) | `#1976d2` (Blue) | Set via Admin UI → Settings → Branding |
| Secondary Color | Accent color (floating action buttons, highlights) | `#ff9800` (Amber) | Set via Admin UI → Settings → Branding |

Colors are stored in the `ClientConfig table:
```json
{
  "branding": {
    "primaryColor": "#1976d2",
    "secondaryColor": "#ff9800"
  }
}
```

### Text & Localization
- Application text is loaded from JSON locale files in `/locales/`
- Currently supported: `it` (Italian), `en` (English)
- To add a new language:
  1. Create `/locales/your-lang-code.json`
  2. Copy structure from existing files
  3. Translate values
  4. Add to supported languages in Admin UI → Settings → Localization

## Database

### Schema Overview
Demo-Nagma uses a single PostgreSQL schema with the following key characteristics:

- **Soft Delete**: All primary entities (except audit tables) have a `deletedAt` timestamp
- **Audit Trails**: Critical tables have corresponding `_history` tables for changes
- **UUID Primary Keys**: All tables use UUIDs as primary keys (`uuid-ossp` extension)
- **Multi-tenancy Ready**: Single-tenant deployment with client configuration isolation

### Core Tables
- `users`: System users and authentication
- `clients`: Customer information  
- `bookings`: Appointments and sessions
- `staff`: Artists and employees
- `services`: Service catalog (tattoo types, piercings, etc.)
- `products`: Retail products and consumables
- `transactions`: Financial transactions and payments
- `client_config`: Per-client settings and feature flags

### Indexes
Standard indexes are created on:
- Foreign key columns
- Frequently queried fields (email, name, dates)
- JSONB columns for client configuration
- Soft delete filters (`deletedAt IS NULL`)

### Maintenance
- **Backups**: Use `pg_dump` for logical backups or filesystem snapshots for physical
- **Vacuum**: Regular vacuuming recommended for write-heavy workloads
- **Extensions**: Required extensions: `uuid-ossp`, `pgcrypto`

## Performance Recommendations

### For 1-10 Users (Small Studio)
- **Database**: Default PostgreSQL settings
- **Connections**: Pool size 10-20
- **Memory**: 512MB-1GB RAM allocated to container
- **Storage**: Standard SSD

### For 11-50 Users (Medium Studio)
- **Database**: 
  - `max_connections`: 100
  - `shared_buffers`: 25% of RAM
  - `effective_cache_size`: 75% of RAM
- **Application**: 
  - Increase `DB_POOL_SIZE` to 30-50
  - Enable HTTP caching headers (via reverse proxy)
- **Resources**: 2GB RAM, 2 vCPU

### For 51+ Users (Large Studio/Enterprise)
- **Database**:
  - Consider read replicas for reporting queries
  - `max_connections`: 200+
  - `work_mem`: 64MB (adjust based on concurrent complex queries)
  - Regular vacuum analyze schedule
- **Application**:
  - `DB_POOL_SIZE`: 60-100
  - Implement Redis caching for frequent queries
  - Consider CDN for static assets
- **Resources**: 4GB+ RAM, 4+ vCPU, SSD storage

### Monitoring
Key metrics to monitor:
- Database connection usage
- Query response times (target: <200ms for 95th percentile)
- HTTP request rates and error rates
- System memory and CPU usage
- Disk I/O and storage capacity

## Docker-Specific Configuration

When using Docker Compose, you can override settings via:

1. **Environment Files**: `.env`, `.env.development`, `.env.production`
2. **Command Line**: `docker compose --env-file custom.env up`
3. **Override Files**: `docker-compose.override.yml` (for local development)

### Example Production Override
Create `docker-compose.prod.override.yml`:
```yaml
services:
  backend:
    environment:
      NODE_ENV: production
      LOG_LEVEL: warn
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 2G
  frontend:
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
```

---

*Last updated: July 12, 2026*