# Portfolio CMS Build & Deploy Script

This PowerShell script automates the complete build and deployment process for the Portfolio CMS application.

## Features

- ✅ **Prerequisites Validation**: Checks for required tools (Node.js, npm, Docker, Docker Compose, .NET SDK)
- ✅ **Frontend Build**: Compiles Angular application
- ✅ **Backend Build**: Compiles .NET API
- ✅ **Docker Image Building**: Creates optimized Docker images for both services
- ✅ **Service Management**: Stops, removes, and restarts all containers
- ✅ **Health Monitoring**: Waits for services to be healthy
- ✅ **Error Handling**: Comprehensive error checking and reporting
- ✅ **Colored Output**: Visual feedback with success/warning/error indicators
- ✅ **Timing Information**: Shows duration for each step
- ✅ **Flexible Options**: Command-line switches for different scenarios

## Usage

### Basic Usage
```powershell
.\build-and-deploy.ps1
```

### Advanced Options
```powershell
# Skip building source code (use existing builds)
.\build-and-deploy.ps1 --SkipBuild

# Skip Docker image building (use existing images)
.\build-and-deploy.ps1 --SkipDockerBuild

# Show detailed output from all commands
.\build-and-deploy.ps1 --Verbose

# Combine options
.\build-and-deploy.ps1 --SkipBuild --SkipDockerBuild --Verbose
```

## What the Script Does

1. **Validation Phase**
   - Checks for required tools and directories
   - Verifies project structure

2. **Build Phase** (unless `--SkipBuild`)
   - Builds Angular frontend with `npm run build`
   - Builds .NET backend with `dotnet build`

3. **Docker Phase** (unless `--SkipDockerBuild`)
   - Builds backend Docker image (`portfolio-backend-api:10.0`)
   - Builds frontend Docker image (`portfolio-frontend:latest`)

4. **Deployment Phase**
   - Stops all running containers
   - Removes existing containers
   - Starts all services with `docker-compose up -d`
   - Waits for services to be healthy

5. **Verification Phase**
   - Checks service health status
   - Reports access URLs
   - Provides troubleshooting commands

## Access URLs

After successful deployment, the application will be available at:

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8085/api
- **Public Portfolio**: http://localhost:4200/portfolio/{slug}
- **Public Blog**: http://localhost:4200/blog/{slug}

## Troubleshooting

### Check Service Status
```powershell
docker-compose ps
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend-api
```

### Stop Services
```powershell
docker-compose down
```

### Common Issues

1. **Port Conflicts**: Ensure ports 4200, 8085, 5432, etc. are available
2. **Build Failures**: Check that all dependencies are installed
3. **Docker Issues**: Ensure Docker Desktop is running
4. **Permission Issues**: Run PowerShell as Administrator if needed

## Requirements

- Windows PowerShell 5.1+ or PowerShell Core 7+
- Node.js 18+
- npm 8+
- Docker Desktop
- Docker Compose
- .NET 8+ SDK

## Script Location

Place this script in the root directory of your portfolio project:

```
portfolio/
├── build-and-deploy.ps1  ← This script
├── portfolio-cms-web/
├── portfolio.api/
├── docker-compose.yml
└── ...
```

## Execution Policy

If you encounter execution policy errors, run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then execute the script with:

```powershell
.\build-and-deploy.ps1
```