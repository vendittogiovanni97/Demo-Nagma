# Demo-Nagma Runbook

Operational procedures for common scenarios and troubleshooting.

## Scenario 1: Customer Reports "I Can't See Any Data"

### Initial Assessment
1. **Verify scope**: Is this affecting all users or just one customer/tenant?
2. **Check login**: Can the user log in successfully?
3. **Confirm tenant**: Is the user logging into the correct tenant/account?

### Diagnostic Steps
1. **Check tenant status**:
   ```bash
   # Check if tenant exists and is active
   docker compose exec backend npx prisma client --execute "SELECT * FROM \"ClientConfig\" WHERE id = '<customer-id>';"
   ```

2. **Verify data exists**:
   ```bash
   # Check for customer data
   docker compose exec backend npx prisma client --execute "SELECT COUNT(*) FROM \"Client\" WHERE \"clientId\" = '<customer-id>' AND \"deletedAt\" IS NULL;"
   
   # Check for bookings
   docker compose exec backend npx prisma client --execute "SELECT COUNT(*) FROM \"Booking\" WHERE \"clientId\" = '<customer-id>' AND \"deletedAt\" IS NULL;"
   ```

3. **Check for accidental deletion**:
   ```bash
   # Look for soft-deleted records
   docker compose exec backend npx prisma client --execute "SELECT COUNT(*) FROM \"Client\" WHERE \"clientId\" = '<customer-id>' AND \"deletedAt\" IS NOT NULL;"
   ```

### Resolution
- If data exists but not visible: Check if user has correct permissions/role
- If data missing: Restore from backup if deletion was accidental
- If never existed: Guide user through initial data setup
- If soft-deleted: Restore records using `UPDATE ... SET "deletedAt" = NULL`

### Prevention
- Implement role-based access checks before mass operations
- Add confirmation dialogs for bulk delete operations
- Regular backup verification

---

## Scenario 2: Performance Degradation

### Initial Assessment
1. **Define scope**: Is it slow for all operations or specific actions?
2. **Measure baseline**: Compare current performance to historical norms
3. **Check timing**: Is it time-of-day related (peak usage)?

### Diagnostic Steps
1. **Check system resources**:
   ```bash
   # Container stats
   docker compose stats
   
   # Host system (if on-prem)
   top -o %CPU
   ```

2. **Database performance**:
   ```bash
   # Check for long-running queries
   docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT * FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '5 minutes';"
   
   # Check cache hit ratio
   docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS cache_hit_ratio FROM pg_statio_user_tables;"
   ```

3. **Application metrics**:
   ```bash
   # Check backend logs for slow queries
   docker compose logs --tail=100 backend | grep -i "duration\|slow\|timeout"
   
   # Check response times (if monitoring enabled)
   ```

### Resolution
- **Database issues**:
  - Add missing indexes based on query patterns
  - Vacuum and analyze tables
  - Consider read replicas for heavy reporting
  
- **Application issues**:
  - Check for memory leaks in Node.js process
  - Review recent code changes for performance regressions
  - Consider horizontal scaling or caching
  
- **Resource issues**:
  - Increase container resource limits
  - Scale up host resources
  - Optimize Docker container settings

### Prevention
- Implement query performance monitoring
- Set up automated index recommendation tools
- Regular performance testing against production-like data

---

## Scenario 3: Upgrading to New Version

### Pre-Upgrade Checklist
1. **Backup**: Complete database and configuration backup
2. **Review changelog**: Check for breaking changes
3. **Test environment**: Validate upgrade in staging first
4. **Schedule**: Plan for low-traffic period
5. **Notify users**: Communicate expected downtime

### Upgrade Steps
1. **Pull latest code**:
   ```bash
   git fetch origin
   git checkout main  # or your release branch
   git pull origin main
   ```

2. **Review new requirements**:
   ```bash
   # Check for new dependencies
   cat backend/package.json
   docker compose build --no-cache  # Rebuild with new dependencies
   ```

3. **Apply database migrations**:
   ```bash
   # Preview changes first
   docker compose run --rm backend npx prisma migrate deploy --skip-seed
   
   # Then apply with seed if appropriate
   docker compose up -d  # This will run migrations via entrypoint
   ```

4. **Verify upgrade**:
   ```bash
   # Check application health
   docker compose ps
   
   # Verify version (if implemented)
   curl http://localhost:3001/version
   
   # Test critical functionality
   ```

### Rollback Procedure
1. **Stop new version**:
   ```bash
   docker compose down
   ```

2. **Restore database** (from pre-upgrade backup):
   ```bash
   # Stop containers
   docker compose down
   
   # Restore database volume from backup or
   # Point to previous database backup
   ```

3. **Restart previous version**:
   ```bash
   git checkout previous-tag
   docker compose up -d
   ```

### Post-Upgrade Tasks
- Monitor logs for errors
- Verify backup procedures still work
- Check for deprecated features usage
- Update documentation if needed

---

## Scenario 4: Scaling from 10 to 100 Users

### Pre-Scaling Assessment
1. **Current metrics**: Document baseline performance at 10 users
2. **Identify bottlenecks**: Determine what limits scaling
3. **Capacity planning**: Estimate resource needs at 100 users

### Scaling Steps

#### Phase 1: Vertical Scaling (Immediate)
1. **Increase container resources**:
   ```yaml
   # In docker-compose.override.yml or prod override
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: "4.0"
             memory: 4G
     frontend:
       deploy:
         resources:
           limits:
             cpus: "2.0"
             memory: 2G
   ```

2. **Optimize database**:
   ```bash
   # Increase connection limits
   docker compose exec postgres psql -c "ALTER SYSTEM SET max_connections = 200;"
   
   # Increase shared buffers (25% of RAM)
   docker compose exec postgres psql -c "ALTER SYSTEM SET shared_buffers = '2GB';"
   
   # Apply changes
   docker compose restart postgres
   ```

#### Phase 2: Application Optimizations
1. **Enable response compression** (if not already):
   - Verify Express compression middleware is active
   
2. **Implement caching layer**:
   - Add Redis for session store and API caching
   - Update application to use cache (may require code changes)
   
3. **Optimize frontend**:
   - Enable production build optimizations
   - Implement code splitting if not present
   - Optimize image assets

#### Phase 3: Horizontal Scaling (If Needed)
1. **Database read replicas**:
   - Set up PostgreSQL streaming replication
   - Direct read-heavy operations (reports, exports) to replica
   
2. **Application load balancing**:
   - Deploy multiple backend instances behind load balancer
   - Use sticky sessions if needed for WebSocket connections
   
3. **Separate services**:
   - Consider moving WebSocket notifications to dedicated service
   - Offload file processing to worker queues

### Validation
- Load test with expected user count
- Monitor all metrics during peak simulation
- Verify backup and recovery procedures work at scale
- Document new baseline performance

---

## Scenario 5: Adding a New Customer (Onboarding)

### 5-Step Process

#### Step 1: Provision Infrastructure
1. **Create DNS record** for customer domain (if using subdomains)
2. **Allocate resources** based on customer size tier
3. **Prepare environment** with appropriate resource limits

#### Step 2: Configure Instance
1. **Create environment file**:
   ```bash
   cp .env.example .env.customer-name
   # Edit with customer-specific values:
   # - JWT_SECRET (generate new strong secret)
   # - Database credentials (unique per customer if isolated)
   # - Branding settings (name, logo, colors)
   # - Feature flags based on contract
   ```

2. **Set up database**:
   - If using shared database: Ensure row-level security or tenant ID filtering
   - If using separate database: Create new database and user

#### Step 3: Customize Branding
1. **Upload logo** to `/public/logos/` or configure external URL
2. **Set primary/secondary colors** via Admin UI → Settings → Branding
3. **Configure default values**:
   - Work hours
   - Booking durations
   - Service types
   - Tax rates

#### Step 4: Configure Features
1. **Enable/disable modules** based on contract:
   - Go to Settings → Feature Flags
   - Toggle: Cream sales, WhatsApp, Form Templates, etc.
2. **Set limits** (if applicable):
   - Max users
   - Max bookings/month
   - Storage limits

#### Step 5: User Training & Handoff
1. **Create initial admin user**:
   - Use setup wizard or create manually
   - Provide secure credentials
   
2. **Conduct training session**:
   - Core functionality: Customers, bookings, sales
   - Administrative functions: Settings, users, reports
   
3. **Provide documentation**:
   - Link to user guide
   - Emergency contact procedures
   - Backup and restore instructions

4. **Verify completion**:
   - Test critical workflows
   - Confirm data persistence
   - Validate backup procedures

---

*Last updated: July 12, 2026*