# Demo-Nagma Installation Guide

Quickly install and run Demo-Nagma (Tattoo CRM) in under 15 minutes.

## Prerequisites

Make sure you have the following installed:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [PostgreSQL client](https://www.postgresql.org/download/) (optional, for direct DB access)

## Quickstart (10 Minutes)

Follow these steps to get Demo-Nagma running:

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/demo-nagma.git
cd demo-nagma
```

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
> **Note**: For production, review and update the values in `.env` as needed.

### 3. Start the Application
```bash
docker compose up -d
```

Docker will:
- Pull/download necessary images
- Build the backend and frontend containers
- Start PostgreSQL, backend, and frontend services
- Automatically apply database migrations
- Seed initial data

### 4. Verify Installation
Wait for all services to be healthy (this takes ~1-2 minutes), then:
```bash
docker compose ps
```
You should see all services showing "healthy" or "running".

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

Default login credentials:
- **Admin**: admin@demo-nagma.local / admin123
- **Super Admin**: superadmin@demo-nagma.local / superadmin123

## Troubleshooting

### Port Conflicts
If you see errors like `port is already allocated`, stop conflicting services or change the ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:3001"  # Change first number to host port
```

### Database Connection Issues
1. Verify PostgreSQL is healthy: `docker compose ps postgres`
2. Check logs: `docker compose logs postgres`
3. Ensure the volume is properly mounted: `docker volume inspect nagma_data`

### Docker Build Failures
1. Ensure you have enough disk space and memory
2. Try rebuilding with no cache: `docker compose build --no-cache`
3. Check Docker daemon logs for detailed errors

### Application Not Responding
1. Check service status: `docker compose ps`
2. View logs: `docker compose logs -f` (follow logs in real-time)
3. Check backend specifically: `docker compose logs -f backend`

## Next Steps

1. **Configure your instance**: Log in as admin and visit Settings to customize branding, feature flags, etc.
2. **Read the Configuration Guide**: See `docs/CONFIGURATION.md` for detailed environment variable reference
3. **Learn about Deployment**: See `docs/DEPLOYMENT.md` for production deployment options
4. **Explore the API**: Visit http://localhost:3001/api/docs for interactive API documentation

## Need Help?

If you encounter issues not covered here:
1. Check the troubleshooting section above
2. Review the logs with `docker compose logs`
3. Consult the full documentation in the `docs/` directory
4. For persistent issues, file an issue on the GitHub repository

---

*Last updated: July 12, 2026*