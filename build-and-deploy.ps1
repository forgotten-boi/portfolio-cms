param(
    [switch]$SkipBuild,
    [switch]$SkipDockerBuild,
    [switch]$SkipTests,
    [switch]$Verbose
)

# Configuration
$ProjectRoot = $PSScriptRoot
$FrontendDir = Join-Path $ProjectRoot "portfolio-cms-web"
$BackendDir = Join-Path $ProjectRoot "portfolio.api"
$DockerComposeFile = Join-Path $ProjectRoot "docker-compose.yml"

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"
$White = "White"

function Write-Step {
    param([string]$Message)
    Write-Host "`n$([char]0x25B6) $Message" -ForegroundColor $Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "$([char]0x2705) $Message" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "$([char]0x274C) $Message" -ForegroundColor $Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$([char]0x26A0) $Message" -ForegroundColor $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "$([char]0x2139) $Message" -ForegroundColor $White
}

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

function Invoke-Step {
    param(
        [string]$Description,
        [scriptblock]$Action,
        [switch]$ContinueOnError
    )

    Write-Step $Description

    try {
        $startTime = Get-Date
        & $Action
        $endTime = Get-Date
        $duration = $endTime - $startTime

        if ($LASTEXITCODE -eq 0 -or $ContinueOnError) {
            Write-Success "$Description completed in $($duration.TotalSeconds.ToString("F2")) seconds"
            return $true
        }
        else {
            Write-Error "$Description failed with exit code $LASTEXITCODE"
            return $false
        }
    }
    catch {
        Write-Error "$Description failed: $($_.Exception.Message)"
        return $false
    }
}

# Pre-flight checks
Write-Info "Portfolio CMS Build & Deploy Script"
Write-Info "=================================="
Write-Info "Project Root: $ProjectRoot"
Write-Info "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Info ""

# Check prerequisites
$prerequisites = @(
    @{Name = "Node.js"; Command = "node"; Required = $true},
    @{Name = "npm"; Command = "npm"; Required = $true},
    @{Name = "Docker"; Command = "docker"; Required = $true},
    @{Name = "Docker Compose"; Command = "docker-compose"; Required = $true},
    @{Name = ".NET SDK"; Command = "dotnet"; Required = $true}
)

$missingPrerequisites = @()
foreach ($prereq in $prerequisites) {
    if (-not (Test-Command $prereq.Command)) {
        if ($prereq.Required) {
            $missingPrerequisites += $prereq.Name
        }
        else {
            Write-Warning "$($prereq.Name) not found (optional)"
        }
    }
}

if ($missingPrerequisites.Count -gt 0) {
    Write-Error "Missing required prerequisites: $($missingPrerequisites -join ', ')"
    exit 1
}

Write-Success "All prerequisites found"

# Check if directories exist
if (-not (Test-Path $FrontendDir)) {
    Write-Error "Frontend directory not found: $FrontendDir"
    exit 1
}

if (-not (Test-Path $BackendDir)) {
    Write-Error "Backend directory not found: $BackendDir"
    exit 1
}

if (-not (Test-Path $DockerComposeFile)) {
    Write-Error "Docker Compose file not found: $DockerComposeFile"
    exit 1
}

Write-Success "Project directories verified"

# Build Frontend
if (-not $SkipBuild) {
    $frontendSuccess = Invoke-Step "Building Frontend (Angular)" {
        Push-Location $FrontendDir
        try {
            if ($Verbose) {
                npm run build
            }
            else {
                npm run build 2>&1 | Out-Null
            }
        }
        finally {
            Pop-Location
        }
    }

    if (-not $frontendSuccess) {
        Write-Error "Frontend build failed"
        exit 1
    }
}
else {
    Write-Info "Skipping frontend build (--SkipBuild)"
}

# Build Backend
if (-not $SkipBuild) {
    $backendSuccess = Invoke-Step "Building Backend (.NET)" {
        Push-Location $BackendDir
        try {
            if ($Verbose) {
                dotnet build
            }
            else {
                dotnet build 2>&1 | Out-Null
            }
        }
        finally {
            Pop-Location
        }
    }

    if (-not $backendSuccess) {
        Write-Error "Backend build failed"
        exit 1
    }
}
else {
    Write-Info "Skipping backend build (--SkipBuild)"
}

# Build Docker Images
if (-not $SkipDockerBuild) {
    # Build Backend Docker Image
    $backendDockerSuccess = Invoke-Step "Building Backend Docker Image" {
        Push-Location $ProjectRoot
        try {
            if ($Verbose) {
                docker build -t portfolio-backend-api:10.0 -f portfolio.api/Dockerfile ./portfolio.api
            }
            else {
                docker build -t portfolio-backend-api:10.0 -f portfolio.api/Dockerfile ./portfolio.api 2>&1 | Out-Null
            }
        }
        finally {
            Pop-Location
        }
    }

    if (-not $backendDockerSuccess) {
        Write-Error "Backend Docker build failed"
        exit 1
    }

    # Build Frontend Docker Image
    $frontendDockerSuccess = Invoke-Step "Building Frontend Docker Image" {
        Push-Location $ProjectRoot
        try {
            if ($Verbose) {
                docker build -t portfolio-frontend:latest -f portfolio-cms-web/Dockerfile ./portfolio-cms-web
            }
            else {
                docker build -t portfolio-frontend:latest -f portfolio-cms-web/Dockerfile ./portfolio-cms-web 2>&1 | Out-Null
            }
        }
        finally {
            Pop-Location
        }
    }

    if (-not $frontendDockerSuccess) {
        Write-Error "Frontend Docker build failed"
        exit 1
    }
}
else {
    Write-Info "Skipping Docker builds (--SkipDockerBuild)"
}

# Stop existing containers
$stopSuccess = Invoke-Step "Stopping existing containers" {
    Push-Location $ProjectRoot
    try {
        if ($Verbose) {
            docker-compose stop
        }
        else {
            docker-compose stop 2>&1 | Out-Null
        }
    }
    finally {
        Pop-Location
    }
}

# Remove existing containers
$removeSuccess = Invoke-Step "Removing existing containers" {
    Push-Location $ProjectRoot
    try {
        if ($Verbose) {
            docker-compose rm -f
        }
        else {
            docker-compose rm -f 2>&1 | Out-Null
        }
    }
    finally {
        Pop-Location
    }
}

# Start all services
$startSuccess = Invoke-Step "Starting all services" {
    Push-Location $ProjectRoot
    try {
        if ($Verbose) {
            docker-compose up -d
        }
        else {
            docker-compose up -d 2>&1 | Out-Null
        }
    }
    finally {
        Pop-Location
    }
}

if (-not $startSuccess) {
    Write-Error "Failed to start services"
    exit 1
}

# Wait for services to be healthy
Write-Step "Waiting for services to be healthy"
Start-Sleep -Seconds 10

$healthCheckSuccess = Invoke-Step "Checking service health" {
    Push-Location $ProjectRoot
    try {
        $services = docker-compose ps --format "table {{.Name}}\t{{.Status}}"
        if ($Verbose) {
            Write-Host $services
        }

        # Check if all services are running
        $lines = $services -split "`n" | Where-Object { $_ -match "^portfolio-" }
        $unhealthyServices = @()

        foreach ($line in $lines) {
            if ($line -notmatch "healthy|running") {
                $unhealthyServices += $line
            }
        }

        if ($unhealthyServices.Count -gt 0) {
            Write-Warning "Some services may not be healthy yet:"
            $unhealthyServices | ForEach-Object { Write-Host "  $_" -ForegroundColor $Yellow }
            Write-Info "Waiting additional 20 seconds for services to fully start..."
            Start-Sleep -Seconds 20

            # Check again
            $services2 = docker-compose ps --format "table {{.Name}}\t{{.Status}}"
            $lines2 = $services2 -split "`n" | Where-Object { $_ -match "^portfolio-" }
            $stillUnhealthy = @()

            foreach ($line in $lines2) {
                if ($line -notmatch "healthy|running") {
                    $stillUnhealthy += $line
                }
            }

            if ($stillUnhealthy.Count -gt 0) {
                Write-Error "Services still not healthy:"
                $stillUnhealthy | ForEach-Object { Write-Host "  $_" -ForegroundColor $Red }
                return $false
            }
        }

        return $true
    }
    finally {
        Pop-Location
    }
}

# Final status
Write-Step "Deployment Summary"
Write-Info "================================"

if ($healthCheckSuccess) {
    Write-Success "All services are running and healthy!"
    Write-Info ""
    Write-Info "Access URLs:"
    Write-Info "  Frontend: http://localhost:4200"
    Write-Info "  Backend API: http://localhost:8085/api"
    Write-Info "  Public Portfolio: http://localhost:4200/portfolio/{slug}"
    Write-Info "  Public Blog: http://localhost:4200/blog/{slug}"
    Write-Info ""
    Write-Info "To view service status: docker-compose ps"
    Write-Info "To view logs: docker-compose logs -f [service-name]"
    Write-Info "To stop services: docker-compose down"
}
else {
    Write-Warning "Some services may still be starting. Check status with: docker-compose ps"
    exit 1
}

Write-Info ""
Write-Success "Build and deployment completed successfully!"
Write-Info "Total execution time: $((Get-Date) - $scriptStartTime | ForEach-Object { $_.TotalSeconds.ToString("F2") }) seconds"

# Usage information
Write-Info ""
Write-Info "Script Options:"
Write-Info "  --SkipBuild      : Skip building frontend and backend code"
Write-Info "  --SkipDockerBuild: Skip building Docker images"
Write-Info "  --SkipTests      : Skip running tests (not implemented yet)"
Write-Info "  --Verbose        : Show detailed output from all commands"
Write-Info ""
Write-Info "Example: .\build-and-deploy.ps1 --SkipBuild --Verbose"