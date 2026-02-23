# Portfolio CMS - Orchestration Guide

## Overview

The Portfolio CMS orchestration host (`Portfolio.AppHost`) provides a unified way to run the entire application stack with a single command. It automatically:

- Builds the frontend Docker image (if needed)
- Starts all backend services (PostgreSQL, pgAdmin, Kafka/Zookeeper)
- Launches the .NET API with proper configuration
- Starts the Angular frontend
- Manages service lifecycle and cleanup

## Quick Start

### 1. Start All Services

```powershell
cd portfolio.api
dotnet run --project .\src\Portfolio.AppHost\Portfolio.AppHost.csproj
```

### 2. Access Services

Once started, access:
- **Frontend**: http://localhost:4200
- **API**: http://localhost:8085
- **Swagger**: http://localhost:8085/swagger
- **pgAdmin**: http://localhost:5050
- **PostgreSQL**: localhost:5432
- **Kafka** (if not in mock mode): localhost:9092

### 3. Stop Services

Press `Ctrl+C` in the terminal. The orchestrator will automatically clean up all containers.

## Configuration Options

### Mock Mode

Skip Kafka, Zookeeper, and use in-memory message bus:

```powershell
$env:USE_MOCKS='true'
dotnet run --project .\src\Portfolio.AppHost\Portfolio.AppHost.csproj
```

### Force Frontend Rebuild

Rebuild the frontend image even if it exists:

```powershell
$env:REBUILD_FRONTEND='true'
dotnet run --project .\src\Portfolio.AppHost\Portfolio.AppHost.csproj
```

### Combine Options

```powershell
$env:USE_MOCKS='true'
$env:REBUILD_FRONTEND='true'
dotnet run --project .\src\Portfolio.AppHost\Portfolio.AppHost.csproj
```

## Configuration File

Edit `portfolio.api/src/Portfolio.AppHost/appsettings.json` to set defaults:

```json
{
  "USE_MOCKS": false,
  "REBUILD_FRONTEND": false
}
```

## Running Services Individually

### API Only

```powershell
cd portfolio.api\src\Portfolio.Api
dotnet run
```

### Frontend Only (Dev Server)

```powershell
cd portfolio-cms-web
npm start
```

### Frontend Only (Docker)

```powershell
cd portfolio-cms-web
docker build -t portfolio-frontend:latest -f Dockerfile .
docker run -p 4200:80 -e API_URL=http://host.docker.internal:8085 portfolio-frontend:latest
```

## Troubleshooting

### Frontend Image Not Building

Ensure you have:
- Node.js 18+ installed
- npm dependencies installed in `portfolio-cms-web`
- Docker Desktop running

### Ports Already in Use

If ports are occupied, stop conflicting services:

```powershell
# Check what's using a port (e.g., 4200)
Get-NetTCPConnection -LocalPort 4200

# Stop the process
Stop-Process -Id <PID> -Force
```

### Database Connection Issues

The API uses `localhost` for database connections. Ensure:
- PostgreSQL container is running: `docker ps | grep portfolio-postgres-aspire`
- Port 5432 is not blocked
- Connection string is correct in API configuration

### Kafka Connection Issues

If not using mock mode and Kafka fails:
- Check Zookeeper started first (3-second delay built-in)
- Verify port 9092 is available
- Try mock mode: `$env:USE_MOCKS='true'`

## Service Dependencies

```
┌─────────────────────────────────────────────┐
│         Orchestration Host                  │
└─────────────┬───────────────────────────────┘
              │
      ┌───────┼────────┬──────────┬──────────┐
      │       │        │          │          │
      ▼       ▼        ▼          ▼          ▼
  Postgres  pgAdmin  Kafka*   Zookeeper*  Frontend
      │                │          │          │
      │                └──────────┘          │
      │                                      │
      └──────────────┬───────────────────────┘
                     │
                     ▼
                   API
                     
* Only started when USE_MOCKS=false
```

## Architecture Notes

### Auto-Build Frontend

The orchestrator checks if `portfolio-frontend:latest` image exists. If not (or `REBUILD_FRONTEND=true`), it runs:

```bash
docker build -t portfolio-frontend:latest -f Dockerfile .
```

in the `portfolio-cms-web` directory.

### Container Naming

All containers use the suffix `-aspire` to avoid conflicts with docker-compose:
- `portfolio-postgres-aspire`
- `portfolio-pgadmin-aspire`
- `portfolio-kafka-aspire`
- `portfolio-zookeeper-aspire`
- `portfolio-frontend-aspire`

### API Process

The API runs as a native process (not containerized) for easier debugging. It connects to containerized services via `localhost`.

### Frontend Container

The frontend runs in a container and connects to the API via `host.docker.internal:8085` (Docker Desktop's host gateway).

## Development Workflow

### Typical Development Flow

1. Start orchestrator with mock mode for faster startup:
   ```powershell
   $env:USE_MOCKS='true'
   dotnet run --project .\src\Portfolio.AppHost\Portfolio.AppHost.csproj
   ```

2. Make changes to API or frontend code

3. For API changes: The orchestrator doesn't hot-reload. Stop (Ctrl+C) and restart.

4. For frontend changes: Stop, set `$env:REBUILD_FRONTEND='true'`, restart.

### Testing Production-like Setup

```powershell
# Full stack with Kafka
$env:USE_MOCKS='false'
dotnet run --project .\src\Portfolio.AppHost\Portfolio.AppHost.csproj
```

## Comparison with Docker Compose

| Feature | Orchestration Host | Docker Compose |
|---------|-------------------|----------------|
| Frontend auto-build | ✅ Yes | ❌ Manual |
| API debugging | ✅ Native process | ⚠️ Container (slower) |
| Mock mode | ✅ Built-in | ❌ Manual config |
| Cleanup | ✅ Automatic | ⚠️ Manual `down` |
| Logs | 📊 Multiplexed | 📄 Separate streams |
| Hot reload (API) | ❌ No | ❌ No |
| Startup time | ⚡ 30-60s | ⚡ 30-60s |

## API Endpoint Verification

After startup, test API endpoints:

```powershell
# Health check
curl http://localhost:8085/health

# Swagger
Start-Process http://localhost:8085/swagger
```

## Next Steps

- Add more environment variables for custom configuration
- Implement health checks for all services
- Add retry logic for service dependencies
- Support remote Docker hosts
- Add telemetry and metrics collection
