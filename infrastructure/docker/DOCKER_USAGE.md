# Demo-Nagma Docker Usage

## Development

To start the application in development mode:

```bash
# Make sure you have Docker and Docker Compose installed

# Copy the development environment template (if not already done)
cp .env.development .env

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check service status
docker compose ps

# Stop and remove containers
docker compose down

# Stop containers but keep volumes
docker compose stop
```

## Production

To deploy to production:

```bash
# Copy the production environment template
cp .env.example .env.production
# Edit .env.production with your production values
# IMPORTANT: Never commit .env.production to version control!

# Start services using the production compose file
docker compose -f docker-compose.prod.yml up -d

# For production with monitoring and scaling considerations,
# consider using orchestration platforms like Kubernetes or AWS ECS
```

## Environment Files

The project uses environment files for configuration:

- `.env.development` - Default development environment
- `.env.staging` - Staging environment (similar to production but with more verbose logging)
- `.env.production` - Production environment (requires all secrets to be set)
- `.env.example` - Template showing all expected variables

## Container Details

### Backend
- Built from: `./infrastructure/docker/backend.Dockerfile`
- Exposes: Port 3001 (API)
- Health check: `/health` endpoint
- Entrypoint: `docker-entrypoint.sh` (runs migrations and seed)

### Frontend
- Built from: `./infrastructure/docker/frontend.Dockerfile`
- Exposes: Port 3000 (UI)
- Health check: Root endpoint
- Uses Next.js standalone output for minimal image size

### Database
- Image: `postgres:17-alpine`
- Exposes: Port 5432
- Persists data: Docker volume `nagma_data`
- Initialization: Runs `./infrastructure/database/init.sql` on container startup

## Common Commands

### Viewing Logs
```bash
# Follow logs for all services
docker compose logs -f

# Follow logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Executing Commands in Containers
```bash
# Run Prisma commands in backend container
docker compose exec backend npx prisma migrate dev
docker compose exec backend npx prisma studio

# Run Node.js commands
docker compose exec backend node -v

# Access PostgreSQL CLI
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
```

### Database Management
```bash
# Backup database
docker compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql

# Restore database
cat backup.sql | docker compose exec -i postgres psql -U $POSTGRES_USER $POSTGRES_DB

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d
```

## Troubleshooting

### Container Won't Start
```bash
# Check container status
docker compose ps

# View recent logs
docker compose logs --tail=50 [service-name]

# Check Docker daemon logs
docker info
```

### Database Connection Issues
```bash
# Verify database container is healthy
docker compose ps postgres

# Check initialization script executed
docker compose logs postgres | grep -i "execute"

# Try connecting manually
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT version();"
```

### Application Errors
```bash
# Check backend logs for errors
docker compose logs backend | grep -i error

# Verify environment variables are set correctly
docker compose exec backend env | grep -E "(DATABASE|JWT|PORT|NODE_ENV)"

# Check if migrations ran successfully
docker compose exec backend npx prisma migrate status
```

## Development Workflow

### Making Changes
1. Modify source code in respective directories (`backend/`, `frontend/`)
2. Changes to backend TypeScript will be detected and restarted by nodemon (in dev)
3. Frontend changes trigger hot module replacement in development
4. For Dockerized development, rebuild containers when changing dependencies:
   ```bash
   docker compose build backend
   docker compose build frontend
   ```

### Adding Dependencies
```bash
# Backend dependencies
docker compose exec backend npm install <package-name>
# Or for host machine installation (recommended for development)
npm install --workspace=backend <package-name>

# Frontend dependencies
docker compose exec frontend npm install <package-name>
# Or for host machine installation
npm install --workspace=frontend <package-name>
```

### Database Migrations
```bash
# Create a new migration
docker compose exec backend npx prisma migrate dev --name migration-name

# Apply pending migrations
docker compose up -d  # Entrypoint handles this automatically
# Or manually:
docker compose exec backend npx prisma migrate deploy

# Generate Prisma client after schema changes
docker compose exec backend npx prisma generate

# View migration history
docker compose exec backend npx prisma migrate reset
```

## Performance Considerations

### Resource Limits
For production deployment, consider adding resource constraints:

```yaml
services:
  backend:
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

### Scaling
For horizontal scaling:
1. Use a load balancer in front of multiple backend instances
2. Ensure Redis is used for session storage
3. Consider database read replicas for heavy read workloads
4. Use CDN for static asset delivery

## Security Notes

### Secrets Management
- Never commit `.env` files containing secrets
- Use Docker secrets or orchestration platform secret management in production
- Rotate credentials regularly
- Use least-privilege database principles

### Network Security
- Consider using Docker Compose creates an isolated network by default
- For production, consider additional network segmentation
- Use reverse proxies (NGINX, Traefik) for TLS termination

## Maintenance

### Updating Images
```bash
# Pull latest base images
docker compose pull

# Rebuild with latest dependencies
docker compose build --no-cache

# Restart services
docker compose up -d
```

### Cleaning Up Resources
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes (careful - this deletes data!)
docker volume prune

# Full system prune
docker system prune -a
```

## Backups

### Database Backups
Regular automated backups are recommended:
```bash
# Example backup script (run via cron)
#!/bin/bash
BACKUP_DIR="/backups/demo-nagma"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME=$(docker compose ps -q postgres)

mkdir -p "$BACKUP_DIR"

docker exec $CONTAINER_NAME pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Keep only last 30 days
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +30 -delete
```

### Configuration Backup
```bash
# Backup environment files (store securely!)
cp .env.production /path/to/secure/backups/env_$(date +"%Y%m%d").backup
```

---
*Last updated: July 12, 2026*