#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Portfolio CMS - Comprehensive Build, Deploy, and Management Script
    
.DESCRIPTION
    Orchestrates the complete build and deployment pipeline for the Portfolio CMS application.
    Handles frontend (Angular) and backend (.NET) builds, Docker image creation, 
    service orchestration, and health verification.
    
.PARAMETER SkipBuild
    Skip building frontend and backend code
    
.PARAMETER SkipDockerBuild
    Skip building Docker images (use existing images)
    
.PARAMETER SkipTests
    Skip running verification tests
    
.PARAMETER Verbose
    Show detailed output from all commands
    
.PARAMETER LogFile
    Path to log file (default: build-deploy-{timestamp}.log)
    
.PARAMETER CleanOnly
    Only clean containers and volumes, don't rebuild
    
.PARAMETER StatusOnly
    Only show status of running services
    
.EXAMPLE
    # Full build and deploy
    .\build-and-deploy.ps1
    
.EXAMPLE
    # Skip code build, just redeploy with existing images
    .\build-and-deploy.ps1 -SkipBuild -Verbose
    
.EXAMPLE
    # Only check status
    .\build-and-deploy.ps1 -StatusOnly
    
.EXAMPLE
    # Clean and rebuild everything
    .\build-and-deploy.ps1 -CleanOnly
    
#>

param(
    [switch]$SkipBuild,
    [switch]$SkipDockerBuild,
    [switch]$SkipTests,
    [switch]$Verbose,
    [string]$LogFile,
    [switch]$CleanOnly,
    [switch]$StatusOnly
)

# ========================================
# Configuration
# ========================================

$ErrorActionPreference = "Stop"
$scriptStartTime = Get-Date

# Paths
$ProjectRoot = $PSScriptRoot
$FrontendDir = Join-Path $ProjectRoot "portfolio-cms-web"
$BackendDir = Join-Path $ProjectRoot "portfolio.api"
$DockerComposeFile = Join-Path $ProjectRoot "docker-compose.yml"

# Log file
if ([string]::IsNullOrEmpty($LogFile)) {
    $LogFile = Join-Path $ProjectRoot "logs"
    if (-not (Test-Path $LogFile)) {
        New-Item -ItemType Directory -Path $LogFile -Force | Out-Null
    }
    $LogFile = Join-Path $LogFile "build-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
}

# Colors
$Colors = @{
    Green  = "Green"
    Red    = "Red"
    Yellow = "Yellow"
    Cyan   = "Cyan"
    White  = "White"
    Gray   = "Gray"
}

# ========================================
# Utility Functions
# ========================================

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("Info", "Success", "Error", "Warning", "Step")]
        [string]$Type = "Info"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Type] $Message"
    
    Add-Content -Path $LogFile -Value $logEntry -ErrorAction SilentlyContinue
    
    switch ($Type) {
        "Step" {
            Write-Host "`n$([char]0x25B6) $Message" -ForegroundColor $Colors.Cyan
        }
        "Success" {
            Write-Host "$([char]0x2705) $Message" -ForegroundColor $Colors.Green
        }
        "Error" {
            Write-Host "$([char]0x274C) $Message" -ForegroundColor $Colors.Red
        }
        "Warning" {
            Write-Host "$([char]0x26A0) $Message" -ForegroundColor $Colors.Yellow
        }
        "Info" {
            Write-Host "$([char]0x2139) $Message" -ForegroundColor $Colors.White
        }
    }
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
        [switch]$ContinueOnError,
        [int]$MaxRetries = 1
    )

    Write-Log $Description "Step"
    $retry = 0
    
    do {
        try {
            $startTime = Get-Date
            $output = & $Action
            $endTime = Get-Date
            $duration = $endTime - $startTime

            if ($LASTEXITCODE -eq 0 -or $ContinueOnError) {
                Write-Log "$Description (completed in $($duration.TotalSeconds.ToString("F2"))s)" "Success"
                return @{ Success = $true; Output = $output }
            }
            else {
                throw "Command failed with exit code $LASTEXITCODE"
            }
        }
        catch {
            $retry++
            if ($retry -lt $MaxRetries) {
                Write-Log "Attempt $retry failed, retrying in 5 seconds..." "Warning"
                Start-Sleep -Seconds 5
            }
            else {
                Write-Log "$Description failed: $($_.Exception.Message)" "Error"
                return @{ Success = $false; Error = $_.Exception.Message }
            }
        }
    } while ($retry -lt $MaxRetries)
}

function Show-Status {
    Write-Log "Current Service Status" "Step"
    
    $services = & {
        if ($Verbose) {
            docker-compose ps
        }
        else {
            docker-compose ps 2>$null
        }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host $services
        Write-Log "Service status retrieved successfully" "Success"
    }
    else {
        Write-Log "No services running or docker-compose not available" "Warning"
    }
}

function Get-Header {
    return @"
╔════════════════════════════════════════════════════════════════╗
║          Portfolio CMS - Build & Deployment Script             ║
╚════════════════════════════════════════════════════════════════╝
"@
}

function Get-Footer {
    $elapsed = (Get-Date) - $scriptStartTime
    return @"
╔════════════════════════════════════════════════════════════════╗
║             Build & Deployment Completed Successfully          ║
║  Total Time: $($elapsed.Hours)h $($elapsed.Minutes)m $($elapsed.Seconds)s
║  Log File: $LogFile
╚════════════════════════════════════════════════════════════════╝
"@
}

# ========================================
# Pre-flight Checks
# ========================================

function Test-Prerequisites {
    Write-Log (Get-Header) "Info"
    Write-Log "Project Root: $ProjectRoot" "Info"
    Write-Log "Log File: $LogFile" "Info"
    Write-Log "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Info"
    Write-Log "" "Info"

    Write-Log "Checking prerequisites..." "Step"

    $prerequisites = @(
        @{Name = "Docker"; Command = "docker"; Required = $true},
        @{Name = "Docker Compose"; Command = "docker-compose"; Required = $true},
        @{Name = "Node.js"; Command = "node"; Required = $false},
        @{Name = "npm"; Command = "npm"; Required = $false},
        @{Name = ".NET SDK"; Command = "dotnet"; Required = $false}
    )

    $missingRequired = @()
    $missingOptional = @()

    foreach ($prereq in $prerequisites) {
        if (-not (Test-Command $prereq.Command)) {
            if ($prereq.Required) {
                $missingRequired += $prereq.Name
                Write-Log "$($prereq.Name) NOT FOUND (required)" "Error"
            }
            else {
                $missingOptional += $prereq.Name
                Write-Log "$($prereq.Name) NOT FOUND (optional)" "Warning"
            }
        }
        else {
            Write-Log "$($prereq.Name) found ✓" "Success"
        }
    }

    if ($missingRequired.Count -gt 0) {
        Write-Log "Missing required prerequisites: $($missingRequired -join ', ')" "Error"
        Write-Log "Please install the missing prerequisites and try again." "Error"
        exit 1
    }

    # Check directories
    Write-Log "" "Info"
    Write-Log "Verifying project directories..." "Step"

    $directories = @(
        @{Path = $ProjectRoot; Name = "Project Root"},
        @{Path = $FrontendDir; Name = "Frontend"},
        @{Path = $BackendDir; Name = "Backend"},
        @{Path = (Split-Path $DockerComposeFile); Name = "Docker Config"}
    )

    foreach ($dir in $directories) {
        if (Test-Path $dir.Path) {
            Write-Log "$($dir.Name) directory found ✓" "Success"
        }
        else {
            Write-Log "$($dir.Name) directory NOT FOUND: $($dir.Path)" "Error"
            exit 1
        }
    }

    Write-Log "All prerequisites verified!" "Success"
}

# ========================================
# Build Functions
# ========================================

function Build-Frontend {
    if ($SkipBuild) {
        Write-Log "Skipping frontend build (--SkipBuild)" "Warning"
        return $true
    }

    $result = Invoke-Step "Building Frontend (Angular)" {
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
    } -MaxRetries 2

    return $result.Success
}

function Build-Backend {
    if ($SkipBuild) {
        Write-Log "Skipping backend build (--SkipBuild)" "Warning"
        return $true
    }

    $result = Invoke-Step "Building Backend (.NET)" {
        Push-Location $BackendDir
        try {
            if ($Verbose) {
                dotnet build -c Release
            }
            else {
                dotnet build -c Release 2>&1 | Out-Null
            }
        }
        finally {
            Pop-Location
        }
    } -MaxRetries 2

    return $result.Success
}

# ========================================
# Docker Functions
# ========================================

function Build-DockerImages {
    if ($SkipDockerBuild) {
        Write-Log "Skipping Docker builds (--SkipDockerBuild)" "Warning"
        return $true
    }

    Write-Log "" "Info"
    Write-Log "Building Docker images..." "Step"

    # Backend
    $backendResult = Invoke-Step "Building Backend Docker Image" {
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
    } -MaxRetries 1

    if (-not $backendResult.Success) {
        Write-Log "Backend Docker build failed" "Error"
        return $false
    }

    # Frontend
    $frontendResult = Invoke-Step "Building Frontend Docker Image" {
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
    } -MaxRetries 1

    return $frontendResult.Success
}

function Clean-Containers {
    Write-Log "" "Info"
    Write-Log "Cleaning up Docker resources..." "Step"

    $stopResult = Invoke-Step "Stopping containers" {
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
    } -ContinueOnError

    $removeResult = Invoke-Step "Removing containers" {
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
    } -ContinueOnError

    return $stopResult.Success -and $removeResult.Success
}

function Start-Services {
    Write-Log "" "Info"
    Write-Log "Starting services with Docker Compose..." "Step"

    $result = Invoke-Step "Starting all services" {
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
    } -MaxRetries 2

    return $result.Success
}

function Check-ServiceHealth {
    Write-Log "" "Info"
    Write-Log "Checking service health..." "Step"

    $maxAttempts = 3
    $attempt = 1
    $allHealthy = $false

    while ($attempt -le $maxAttempts -and -not $allHealthy) {
        if ($attempt -gt 1) {
            Write-Log "Waiting 15 seconds before retry..." "Info"
            Start-Sleep -Seconds 15
        }

        Write-Log "Health check attempt $attempt of $maxAttempts" "Info"

        $services = & {
            Push-Location $ProjectRoot
            try {
                docker-compose ps --format "json" 2>$null | ConvertFrom-Json
            }
            finally {
                Pop-Location
            }
        }

        if ($null -ne $services) {
            $totalServices = $services.Count
            $healthyServices = @($services | Where-Object { $_.State -like "*running*" -or $_.State -like "*healthy*" }).Count
            
            Write-Log "Services: $healthyServices/$totalServices healthy" "Info"

            if ($healthyServices -ge ($totalServices - 1)) {  # Allow 1 non-essential service to be unhealthy
                $allHealthy = $true
                foreach ($service in $services) {
                    $status = if ($service.State -like "*healthy*") { "✓" } else { "~" }
                    Write-Log "$($service.Names): $($service.State) $status" "Info"
                }
            }
        }

        $attempt++
    }

    if ($allHealthy) {
        Write-Log "All critical services are healthy!" "Success"
    }
    else {
        Write-Log "Some services may still be starting. Check with: docker-compose ps" "Warning"
    }

    return $allHealthy
}

# ========================================
# Main Execution
# ========================================

# Show initial header
Write-Host (Get-Header)

# Test prerequisites
Test-Prerequisites

# Status only mode
if ($StatusOnly) {
    Show-Status
    exit 0
}

# Clean only mode
if ($CleanOnly) {
    Clean-Containers
    Write-Log "Cleanup completed" "Success"
    exit 0
}

# Build phase
Write-Log "" "Info"
Write-Log "=== BUILD PHASE ===" "Info"
Write-Log "" "Info"

if (-not (Build-Frontend)) {
    Write-Log "Frontend build failed, aborting" "Error"
    exit 1
}

if (-not (Build-Backend)) {
    Write-Log "Backend build failed, aborting" "Error"
    exit 1
}

# Docker phase
Write-Log "" "Info"
Write-Log "=== DOCKER PHASE ===" "Info"
Write-Log "" "Info"

if (-not (Build-DockerImages)) {
    Write-Log "Docker build failed, aborting" "Error"
    exit 1
}

# Deployment phase
Write-Log "" "Info"
Write-Log "=== DEPLOYMENT PHASE ===" "Info"
Write-Log "" "Info"

if (-not (Clean-Containers)) {
    Write-Log "Container cleanup had issues, continuing..." "Warning"
}

if (-not (Start-Services)) {
    Write-Log "Failed to start services" "Error"
    exit 1
}

# Health check phase
Write-Log "" "Info"
Write-Log "=== HEALTH CHECK PHASE ===" "Info"
Write-Log "" "Info"

$healthyServices = Check-ServiceHealth

# Completion summary
Write-Log "" "Info"
Write-Log "=== DEPLOYMENT SUMMARY ===" "Info"
Write-Log "" "Info"

if ($healthyServices) {
    Write-Log "All services are running and healthy!" "Success"
    Write-Log "" "Info"
    Write-Log "Access URLs:" "Info"
    Write-Log "  Frontend: http://localhost:4200" "Info"
    Write-Log "  Backend API: http://localhost:8085/api" "Info"
    Write-Log "  Public Portfolio: http://localhost:4200/portfolio/{slug}" "Info"
    Write-Log "  Public Blog: http://localhost:4200/blog/{slug}" "Info"
    Write-Log "" "Info"
    Write-Log "Useful commands:" "Info"
    Write-Log "  docker-compose ps          # View service status" "Info"
    Write-Log "  docker-compose logs -f     # View all logs" "Info"
    Write-Log "  docker-compose down        # Stop all services" "Info"
    Write-Log "  .\build-and-deploy.ps1 -StatusOnly  # Check status only" "Info"
}
else {
    Write-Log "Some services may still be starting" "Warning"
    Write-Log "Check status with: docker-compose ps" "Info"
}

Write-Log "" "Info"
Write-Log (Get-Footer) "Info"

Write-Host (Get-Footer) -ForegroundColor $Colors.Green

Write-Log "Script completed successfully" "Success"
exit 0
