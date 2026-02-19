# Portfolio CMS - Orchestration Host

This project provides flexible orchestration for the Portfolio CMS application.

## Configuration Options

Edit `appsettings.json` to configure orchestration behavior:

```json
{
  "USE_MOCKS": false,              // Use in-memory mocks instead of Kafka
  "REBUILD_FRONTEND": false,       // Force rebuild frontend Docker image
  "USE_ASPIRE_DASHBOARD": false    // Enable Aspire Dashboard (requires workload)
}
```

### Option 1: Custom Docker Orchestration (Default - Recommended)

**Configuration:**
```json
{
  "USE_ASPIRE_DASHBOARD": false
}
```

**Features:**
- ✅ No additional workload installation required
- ✅ Works with just Docker Desktop + .NET SDK
- ✅ Full control over container lifecycle
- ✅ Simple console-based monitoring
- ✅ Supports all services (PostgreSQL, Kafka, Redis, pgAdmin, Frontend, API)

**Usage:**
```powershell
dotnet run --project .\portfolio.api\src\Portfolio.AppHost\Portfolio.AppHost.csproj
```

**Services Available:**
- Frontend: http://localhost:4200
- API: http://localhost:8085
- Swagger: http://localhost:8085/swagger
- Health: http://localhost:8085/health
- pgAdmin: http://localhost:5050
- PostgreSQL: localhost:5432
- Kafka: localhost:9092 (when USE_MOCKS=false)

---

### Option 2: .NET Aspire Dashboard (Advanced)

**Configuration:**
```json
{
  "USE_ASPIRE_DASHBOARD": true
}
```

**Prerequisites:**
```powershell
# Install Aspire workload
dotnet workload install aspire

# Rebuild project with Aspire packages
dotnet build .\portfolio.api\Portfolio.sln /p:UseAspireDashboard=true
```

**Features:**
- ✅ Visual dashboard for monitoring services
- ✅ Real-time telemetry and logs
- ✅ Structured console output
- ✅ Resource management UI
- ⚠️ Requires Aspire workload installation
- ⚠️ Additional setup complexity

**Dashboard URL:**
- Typically available at: http://localhost:15888
- Check console output for actual URL and access token

---

## Quick Start

### For Most Users (Custom Mode):

1. **Start Docker Desktop**

2. **Run orchestration:**
   ```powershell
   dotnet run --project .\portfolio.api\src\Portfolio.AppHost\Portfolio.AppHost.csproj
   ```

3. **Access services:**
   - Frontend: http://localhost:4200
   - API Swagger: http://localhost:8085/swagger

### For Advanced Users (Aspire Dashboard):

1. **Install Aspire workload:**
   ```powershell
   dotnet workload install aspire
   ```

2. **Update configuration:**
   Edit `appsettings.json`:
   ```json
   {
     "USE_ASPIRE_DASHBOARD": true
   }
   ```

3. **Build with Aspire:**
   ```powershell
   dotnet build /p:UseAspireDashboard=true
   ```

4. **Run:**
   ```powershell
   dotnet run --project .\portfolio.api\src\Portfolio.AppHost\Portfolio.AppHost.csproj
   ```

---

## Environment Variables

You can override settings with environment variables:

```powershell
# Custom mode with mocks
$env:USE_MOCKS='true'
$env:USE_ASPIRE_DASHBOARD='false'
dotnet run --project .\portfolio.api\src\Portfolio.AppHost\Portfolio.AppHost.csproj

# Aspire mode
$env:USE_ASPIRE_DASHBOARD='true'
dotnet run --project .\portfolio.api\src\Portfolio.AppHost\Portfolio.AppHost.csproj
```

---

## Troubleshooting

### "Aspire SDK not found"
- Solution: Set `USE_ASPIRE_DASHBOARD=false` in `appsettings.json`
- Or install: `dotnet workload install aspire`

### Docker errors
- Ensure Docker Desktop is running
- Check: `docker ps` works

### Port conflicts
- Stop existing services: `docker stop $(docker ps -q)`
- Kill dotnet processes: `Get-Process -Name dotnet | Stop-Process -Force`

### Frontend not building
- Set `REBUILD_FRONTEND=true` in `appsettings.json`
- Or manually: `docker build -t portfolio-frontend:latest .\portfolio-cms-web`

---

## Architecture

### Custom Mode (Docker.DotNet)
```
AppHost (C# Console)
├── Docker.DotNet Client
│   ├── PostgreSQL Container
│   ├── pgAdmin Container
│   ├── Kafka Container (optional)
│   ├── Zookeeper Container (optional)
│   └── Frontend Container
└── API Process (dotnet run)
```

### Aspire Mode
```
Aspire AppHost
├── Aspire Dashboard (Web UI)
├── Resource Management
└── Telemetry/Logging
    ├── Docker Resources
    └── .NET Projects
```

---

## Recommendation

**Use Custom Mode (USE_ASPIRE_DASHBOARD=false)** unless you specifically need:
- Visual dashboard UI
- Advanced telemetry
- Structured logging UI
- Multi-service dependency visualization

Custom mode is simpler, requires no additional workload installation, and works immediately with just Docker Desktop.
