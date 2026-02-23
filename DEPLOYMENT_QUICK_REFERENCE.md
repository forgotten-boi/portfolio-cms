# 🚀 Deployment Quick Reference

A quick cheat sheet for common deployment and management tasks.

## One-Line Deploy

```powershell
cd portfolio && .\build-and-deploy.ps1
```

---

## Deployment Commands

### Full Build & Deploy
```powershell
# Complete rebuild with Docker images
.\build-and-deploy.ps1

# With verbose output
.\build-and-deploy.ps1 -Verbose

# Log to specific file
.\build-and-deploy.ps1 -LogFile "C:\logs\deploy.log"
```

### Quick Redeploy (Existing Images)
```powershell
# Skip code build, use existing Docker images
.\build-and-deploy.ps1 -SkipBuild
```

### Check Status Only
```powershell
# View service status without deploying
.\build-and-deploy.ps1 -StatusOnly

# Alternative: docker command
docker-compose ps
```

### Clean Deployment
```powershell
# Remove all containers and volumes
.\build-and-deploy.ps1 -CleanOnly

# Start fresh deployment
.\build-and-deploy.ps1
```

### Enhanced Script
```powershell
# Use enhanced version with better logging
.\build-and-deploy-enhanced.ps1 -Verbose
```

---

## Service Management

### View Services
```powershell
# List all containers
docker-compose ps

# Detailed container info
docker-compose ps --format "json"
```

### View Logs
```powershell
# All services combined
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 50 lines
docker-compose logs -f --tail 50

# With timestamps
docker-compose logs -f -t
```

### Stop/Start Services
```powershell
# Stop all services (data persists)
docker-compose stop

# Start all services
docker-compose start

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Stop and remove containers (clean slate)
docker-compose down

# Stop and remove all data (volumes too)
docker-compose down -v
```

---

## Individual Service Commands

### Backend API
```powershell
# View logs
docker-compose logs -f backend

# Restart
docker-compose restart backend

# Execute command in container
docker exec -it portfolio-backend-api bash
```

### Frontend
```powershell
# View logs
docker-compose logs -f frontend

# Restart
docker-compose restart frontend

# Execute command in container
docker exec -it portfolio-frontend sh
```

### Database
```powershell
# View logs
docker-compose logs -f postgres

# Connect to database
docker exec -it portfolio-postgres psql -U postgres -d portfolio

# Backup database
docker exec portfolio-postgres pg_dump -U postgres portfolio > backup.sql

# Restore database
docker exec -i portfolio-postgres psql -U postgres -d portfolio < backup.sql
```

---

## Access URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:4200 | 4200 |
| Backend API | http://localhost:8085/api | 8085 |
| API Docs | http://localhost:8085/swagger | 8085 |
| PostgreSQL | localhost:5432 | 5432 |
| Kafka | localhost:9092 | 9092 |

---

## Troubleshooting

### Port Already in Use
```powershell
# Find process using port 4200
Get-NetTCPConnection -LocalPort 4200

# Kill process
Stop-Process -Id <PID> -Force

# Or use docker-compose with different port
# Edit docker-compose.yml and change port mapping
```

### Service Won't Start
```powershell
# Check logs
docker-compose logs -f <service>

# Restart all services
docker-compose down
docker-compose up -d

# Rebuild images
.\build-and-deploy.ps1 -SkipBuild
```

### Connection Refused
```powershell
# Verify services are running
docker-compose ps

# Check service health
docker-compose logs -f

# Wait 30 seconds for services to fully start
Start-Sleep -Seconds 30
docker-compose ps
```

### Out of Disk Space
```powershell
# Clean unused Docker resources
docker system prune -a

# Remove dangling images
docker image prune -a

# Remove unused volumes
docker volume prune
```

### Database Connection Issues
```powershell
# Verify PostgreSQL is running
docker-compose ps postgres

# Check connection string
# Default: Server=postgres;Port=5432;Database=portfolio;Username=postgres;Password=postgres

# Test connection from backend container
docker exec portfolio-backend-api ping postgres

# Connect directly to database
docker exec -it portfolio-postgres psql -U postgres
```

---

## Build Commands

### Frontend Only
```powershell
cd portfolio-cms-web

# Install dependencies
npm install

# Development build
npm run build:dev

# Production build
npm run build

# Run locally
npm start

# Run tests
npm test
```

### Backend Only
```powershell
cd portfolio.api

# Restore dependencies
dotnet restore

# Build project
dotnet build

# Run project
dotnet run

# Run tests
dotnet test

# Publish for production
dotnet publish -c Release
```

### Docker Images
```powershell
# Build backend image
docker build -t portfolio-backend-api:10.0 -f portfolio.api/Dockerfile ./portfolio.api

# Build frontend image
docker build -t portfolio-frontend:latest -f portfolio-cms-web/Dockerfile ./portfolio-cms-web

# List images
docker images | grep portfolio

# Remove image
docker rmi portfolio-backend-api:10.0
```

---

## Environment Variables

### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=postgres;Port=5432;Database=portfolio;Username=postgres;Password=postgres"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### Frontend (.env)
```
NG_APP_API_URL=http://localhost:8085
NG_APP_ENVIRONMENT=production
```

---

## Deployment Scenarios

### Quick Update (Code Changes)
```powershell
# Rebuild and redeploy
.\build-and-deploy.ps1
```

### Emergency Rollback
```powershell
# Stop current services
docker-compose down

# Remove problematic images
docker rmi portfolio-backend-api:10.0
docker rmi portfolio-frontend:latest

# Deploy previous version or rebuild
.\build-and-deploy.ps1
```

### Database Reset
```powershell
# Stop services
docker-compose down -v

# This removes all data volumes
# Rebuild and restart
.\build-and-deploy.ps1
```

### Scaling (Add More Instances)
```powershell
# Update docker-compose.yml with multiple service definitions
# Then restart
docker-compose up -d --scale backend=3

# Check running instances
docker-compose ps
```

---

## Performance Monitoring

### View Container Stats
```powershell
# Real-time stats for all containers
docker stats

# Stats for specific container
docker stats portfolio-backend-api

# Refresh every 5 seconds
docker stats --no-stream portfolio-backend-api
```

### Check Disk Usage
```powershell
# Docker system usage
docker system df

# Detailed breakdown
docker images
docker volume ls
docker container ls -a
```

### Network Diagnostics
```powershell
# View networks
docker network ls

# Inspect network
docker network inspect portfolio_default

# Test connectivity between containers
docker exec -it portfolio-frontend ping backend
```

---

## Backup & Recovery

### Backup Database
```powershell
# Dump entire database
docker exec portfolio-postgres pg_dump -U postgres portfolio > backup.sql

# Backup with timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
docker exec portfolio-postgres pg_dump -U postgres portfolio | Out-File "backup-$timestamp.sql"
```

### Restore Database
```powershell
# Restore from backup
Get-Content backup.sql | docker exec -i portfolio-postgres psql -U postgres -d portfolio

# Restore to new database
docker exec -i portfolio-postgres psql -U postgres -c "CREATE DATABASE portfolio_restore;"
Get-Content backup.sql | docker exec -i portfolio-postgres psql -U postgres -d portfolio_restore
```

### Backup Application Files
```powershell
# Backup entire project
$date = Get-Date -Format "yyyyMMdd-HHmmss"
Compress-Archive -Path . -DestinationPath "portfolio-backup-$date.zip"
```

---

## Security Checklist

- [ ] Change default database password in docker-compose.yml
- [ ] Change JWT secret key in appsettings.json
- [ ] Enable HTTPS in production
- [ ] Set up firewall rules for ports
- [ ] Enable database backups
- [ ] Configure logging retention
- [ ] Set up monitoring/alerts
- [ ] Use environment-specific configs
- [ ] Enable API authentication for all endpoints
- [ ] Keep Docker images updated

---

## Regular Maintenance

### Daily
```powershell
# Check service health
docker-compose ps

# Review error logs
docker-compose logs | Select-String "ERROR"
```

### Weekly
```powershell
# Clean unused Docker resources
docker system prune

# Check disk space
docker system df

# Review application logs
docker-compose logs --tail 1000
```

### Monthly
```powershell
# Full backup
docker exec portfolio-postgres pg_dump -U postgres portfolio > monthly-backup.sql

# Update Docker images to latest
docker-compose pull
.\build-and-deploy.ps1

# Review and clean old logs
Remove-Item logs\*.log -OlderThan (Get-Date).AddMonths(-1)
```

---

## Advanced Tasks

### View Real-Time Metrics
```powershell
# Install Prometheus and Grafana first
# Then add to docker-compose.yml and configure

# Or use Docker's built-in stats
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" --no-stream
```

### Export Configuration
```powershell
# Dump current docker-compose config
docker-compose config > current-config.yml

# Export container volumes
docker inspect portfolio-postgres | ConvertFrom-Json | Select -ExpandProperty Mounts
```

### Create Development Shell
```powershell
# Interactive bash in backend container
docker exec -it portfolio-backend-api bash

# Python/Node shell in container
docker exec -it portfolio-frontend sh
```

---

**Quick Tip:** Bookmark this file for fast access to common commands!

Last Updated: 2024
