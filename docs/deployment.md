# WatchBird Production Deployment Guide

This guide covers deploying the WatchBird bird watching platform using Docker Compose.

## Prerequisites

Before starting, ensure you have the following installed:

- **Docker** (version 24.0 or higher)
  - [Install Docker](https://docs.docker.com/get-docker/)
  - Verify: `docker --version`

- **Docker Compose** (version 2.20 or higher)
  - Usually included with Docker Desktop
  - Verify: `docker compose version`

- **Git** (for cloning the repository)
  - Verify: `git --version`

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd watchbird-mvp
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

Edit `.env` and set the required variables:

```bash
# Required: Generate a strong secret for NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Required: Update database password for production
DB_PASSWORD=your-secure-password-here
DATABASE_URL="postgresql://postgres:your-secure-password-here@db:5432/watchbird?schema=public"

# Optional: WeChat integration (for payments and OAuth)
WECHAT_APP_ID="your-wechat-app-id"
WECHAT_APP_SECRET="your-wechat-app-secret"
WECHAT_MCH_ID="your-merchant-id"
WECHAT_API_KEY="your-api-key"
```

**Important:** Never commit the `.env` file to version control. It contains sensitive information.

## Build and Start

### 1. Build the Docker Images

```bash
docker compose build
```

This will build the Next.js application using a multi-stage Dockerfile for optimal size and security.

### 2. Start the Services

```bash
# Start in detached mode (background)
docker compose up -d

# Or start with logs visible
docker compose up
```

This will start:
- **watchbird-app**: Next.js application on port 3000
- **watchbird-db**: PostgreSQL database on port 5432

### 3. Verify Services are Running

```bash
docker compose ps
```

You should see both services with status "healthy" or "running".

## Database Migration

After the first deployment, you need to run database migrations:

```bash
# Run migrations
docker compose exec app npx prisma migrate deploy

# (Optional) Seed the database with initial data
docker compose exec app npx prisma db seed
```

### Check Migration Status

```bash
docker compose exec app npx prisma migrate status
```

## Health Checks

### Application Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Database Health Check

```bash
docker compose exec db pg_isready -U postgres
```

Expected output: `/var/run/postgresql:5432 - accepting connections`

### View Service Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs app
docker compose logs db

# Follow logs in real-time
docker compose logs -f app
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords (DB_PASSWORD, NEXTAUTH_SECRET)
- [ ] Set up a reverse proxy (nginx, traefik, or cloud load balancer)
- [ ] Configure SSL/TLS certificates
- [ ] Set up proper domain name and DNS records
- [ ] Update `NEXTAUTH_URL` to your production domain
- [ ] Configure firewall rules (only expose ports 80/443)
- [ ] Set up log aggregation and monitoring
- [ ] Configure automated backups for the database
- [ ] Review and update CORS settings if needed

## Troubleshooting

### Container Fails to Start

Check the logs for errors:
```bash
docker compose logs app
```

Common issues:
- Missing environment variables
- Database connection failures
- Port conflicts (3000 or 5432 already in use)

### Database Connection Issues

1. Verify database is running:
   ```bash
   docker compose ps db
   ```

2. Check database logs:
   ```bash
   docker compose logs db
   ```

3. Test connection from app container:
   ```bash
   docker compose exec app node -e "console.log(process.env.DATABASE_URL)"
   ```

### Migration Failures

If migrations fail:

1. Check migration status:
   ```bash
   docker compose exec app npx prisma migrate status
   ```

2. Reset database (WARNING: This will delete all data):
   ```bash
   docker compose exec app npx prisma migrate reset --force
   ```

### Port Already in Use

If ports 3000 or 5432 are already in use:

1. Change ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Map host port 3001 to container port 3000
   ```

2. Or stop the conflicting service on your host machine.

### Rebuild After Code Changes

After making code changes:

```bash
# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Run migrations if needed
docker compose exec app npx prisma migrate deploy
```

### Reset Everything (Clean Slate)

**WARNING: This will delete all data!**

```bash
# Stop and remove containers, networks, volumes
docker compose down -v

# Rebuild and start fresh
docker compose up -d --build

# Run migrations
docker compose exec app npx prisma migrate deploy
```

## Updating the Application

To deploy a new version:

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Run any pending migrations
docker compose exec app npx prisma migrate deploy
```

## Backup and Restore

### Backup Database

```bash
# Create backup
docker compose exec db pg_dump -U postgres watchbird > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker compose exec -T db psql -U postgres watchbird < backup_file.sql
```

## Security Notes

1. **Change default passwords** before production deployment
2. **Use a reverse proxy** (nginx/traefik) with SSL/TLS in production
3. **Keep Docker images updated** regularly
4. **Review and restrict environment variables** - don't expose sensitive data
5. **Enable firewall rules** to restrict access to necessary ports only
6. **Regular security audits** of dependencies: `npm audit`

## Support

For issues or questions:
- Check the logs: `docker compose logs`
- Review this troubleshooting guide
- Open an issue in the project repository
