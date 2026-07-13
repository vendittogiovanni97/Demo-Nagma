# Demo-Nagma Deployment Guide

Comprehensive guide for deploying Demo-Nagma in various environments.

## On-Premise Deployment

### Hardware Requirements
- **Minimum** (1-5 users):
  - CPU: 2 cores
  - Memory: 4 GB RAM
  - Storage: 20 GB SSD
  - Network: 10 Mbps bandwidth

- **Recommended** (6-50 users):
  - CPU: 4 cores
  - Memory: 8 GB RAM
  - Storage: 50 GB SSD
  - Network: 25 Mbps bandwidth

- **Enterprise** (50+ users):
  - CPU: 8+ cores
  - Memory: 16+ GB RAM
  - Storage: 100+ GB SSD
  - Network: 100+ Mbps bandwidth

### Installation Steps

#### 1. Prerequisites
Ensure the host system has:
- Docker Engine 20.10+
- Docker Compose v2.0+
- Git
- Optional: Fail2Ban, UFW/FirewallD for security

#### 2. Deployment Process
```bash
# 1. Clone repository
git clone https://github.com/yourusername/demo-nagma.git
cd demo-nagma

# 2. Configura gli .env di produzione
#    backend/.env.production e frontend/.env.production sono già template pronti

# 3. Edit .env.production with your values
#    - Set strong passwords for JWT_SECRET, DB passwords, etc.
#    - Configure domain names in CORS_ORIGINS and NEXT_PUBLIC_API_BASE_URL
#    - Set NODE_ENV=production
#    - Set RUN_SEEDS=false (important for production)

# 4. Start services using production compose file
docker compose -f docker-compose.prod.yml up -d

# 5. Verify deployment
docker compose -f docker-compose.prod.yml ps
# All services should show "healthy" or "running"

# 6. Access application
#    Frontend: http://your-domain.com
#    API: http://your-domain.com:3001
```

### Backup Strategy

#### Database Backups
```bash
# Daily backup script (run via cron)
#!/bin/bash
BACKUP_DIR="/var/backups/demo-nagma"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="demo-nagma-postgres-1"

mkdir -p "$BACKUP_DIR"

docker exec $CONTAINER_NAME pg_dump -U $POSTGRES_USER $POSTGRES_DB \
  | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Retain last 30 days
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +30 -delete
```

#### Application Data
- Uploaded files are stored in the PostgreSQL database (via bytea or external storage configured separately)
- Database backup includes all user-uploaded content

#### Configuration Backup
```bash
# Backup environment file (keep secure!)
cp .env.production /path/to/secure/backup/env_$(date +"%Y%m%d").backup
```

### Maintenance Tasks
- **Monthly**: Test restore from backup
- **Quarterly**: Review logs for unusual patterns
- **Annually**: Hardware health check, consider capacity planning

## Cloud Deployment Examples

### AWS (ECS/Fargate)
1. **Prerequisites**:
   - AWS CLI configured
   - ECS Cluster created
   - RDS PostgreSQL instance
   - Application Load Balancer
   - ECR Repository for images

2. **Build and Push Images**:
```bash
# Build backend
docker build -t demo-nagma-backend:latest -f ./backend/Dockerfile .
docker tag demo-nagma-backend:latest [ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/demo-nagma-backend:latest
docker push [ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/demo-nagma-backend:latest

# Build frontend
docker build -t demo-nagma-frontend:latest -f ./frontend/Dockerfile .
docker tag demo-nagma-frontend:latest [ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/demo-nagma-frontend:latest
docker push [ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/demo-nagma-frontend:latest
```

3. **Task Definition**:
   - Use two containers: backend and frontend
   - Set environment variables from Task Definition or Parameter Store
   - Configure health checks
   - Set up service discovery for internal communication

### Render.com
1. **Create Services**:
   - **Backend Service**:
     - Dockerfile: `./backend/Dockerfile`
     - Build Command: Empty (uses Dockerfile)
     - Start Command: Empty (uses Dockerfile ENTRYPOINT)
     - Environment Variables: Set from dashboard
   - **Frontend Service**:
     - Dockerfile: `./frontend/Dockerfile`
     - Same configuration as backend

2. **Database**:
   - Use Render PostgreSQL or connect to external DB
   - Set DATABASE_URL in backend service environment

3. **Domains**:
   - Configure custom domains in Render dashboard
   - Set CORS_ORIGINS accordingly

### Railway.app
1. **Project Setup**:
   - Create new project
   - Add PostgreSQL plugin
   - Deploy from GitHub repository

2. **Service Configuration**:
   - **Backend Service**:
     - Dockerfile path: `./infrastructure/docker/backend.Dockerfile`
     - Set environment variables (including DATABASE_URL from PostgreSQL plugin)
   - **Frontend Service**:
     - Dockerfile: `./frontend/Dockerfile`
     - Set NEXT_PUBLIC_API_BASE_URL to backend service URL

3. **Domains**:
   - Railway provides automatic domains
   - Custom domains available in Pro plan

### Vercel (Frontend Only)
> Note: Vercel is only suitable for the frontend. Backend must be hosted elsewhere.

1. **Project Import**:
   - Import frontend directory
   - Set build command: `npm run build` (in frontend/)
   - Set output directory: `frontend/.next`

3. **Environment Variables**:
   - Set NEXT_PUBLIC_API_BASE_URL to your backend URL
   - Other NEXT_PUBLIC_* variables as needed

4. **Backend**:
   - Deploy backend separately (Docker, traditional server, etc.)
   - Ensure CORS allows your Vercel domain

## Monitoring

### Logs to Monitor
- **Backend**:
  - Error logs: Look for `ERROR` level in `docker compose logs backend`
  - Database connection issues: `connection refused`, `timeout`
  - JWT validation errors: `Invalid token`, `TokenExpiredError`
  - File upload issues: `ENOSPD`, `EACCES`

- **Frontend**:
  - React errors: Check browser console
  - API call failures: Network tab in dev tools
  - Performance warnings: Long running React renders

- **Database** (via `docker compose logs postgres`):
  - Connection failures
  - Deadlock warnings
  - Checkpoint issues
  - Autovacuum activity

### Key Metrics to Track
- **Application**:
  - HTTP 5xx error rate (< 1%)
  - API response time (p95 < 2s)
  - Request throughput (requests/minute)
  - Active user sessions

- **Database**:
  - Connection pool usage (< 80%)
  - Query execution time (p95 < 100ms)
  - Disk usage (< 80%)
  - Cache hit ratio (> 95%)

- **System**:
  - CPU usage (< 70% sustained)
  - Memory usage (< 80%)
  - Disk I/O wait (< 10%)
  - Network throughput

### Alerting Recommendations
Set up alerts for:
- **Critical** (page immediately):
  - Application downtime (> 2 min)
  - Database connection failure
  - Disk space < 10%
  - Memory exhaustion

- **Warning** (notify within hour):
  - Error rate > 5%
  - Response time p95 > 5s for 5 min
  - CPU > 85% for 15 min
  - Memory > 85% for 15 min
  - Backup failure

## Scaling Guidelines

### Vertical Scaling (Increase Resources)
**When to consider**:
- Consistent CPU > 80%
- Memory pressure (swapping, OOM kills)
- Slow query performance despite optimization

**How**:
1. Increase container resource limits in docker-compose
2. For databases: Increase `shared_buffers`, `max_connections`
3. Monitor after changes

### Horizontal Scaling (Add Instances)
**Database Read Replicas**:
**When**: Reporting queries affecting OLTP performance
**How**:
1. Set up PostgreSQL streaming replication
2. Route read-only queries (reports, exports) to replica
3. Keep writes on primary

**Application Caching**:
**When**: High read volume, repetitive API calls
**How**:
1. Add Redis layer for:
   - Session storage (replace default memory store)
   - Frequently accessed configuration
   - API response caching (short TTL)
2. Modify application to use cache (requires code changes)

**CDN for Static Assets**:
**When**: Global user base, high latency complaints
**How**:
1. Serve `frontend/public` via CDN
2. Configure cache headers for static assets
3. Use versioned filenames for cache busting

### Microservices Consideration
For very large installations (>500 concurrent users):
- Consider splitting frontend/backend into separate scalable units
- Extract high-traffic services (e.g., WebSocket notifications) separately
- Implement API gateway for rate limiting, authentication

## Validation Checklist
After deployment, verify:
- [ ] All services healthy (`docker compose ps`)
- [ ] Application loads and authenticates
- [ ] Core functionality works (create booking, customer, etc.)
- [ ] Email/SMS notifications work (if configured)
- [ ] Backup job runs successfully
- [ ] Monitoring alerts are configured
- [ ] SSL certificates valid (if using HTTPS)
- [ ] Performance baseline established

---

*Ultimo aggiornamento: 13 Luglio 2026*