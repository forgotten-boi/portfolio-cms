#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Portfolio CMS Orchestration Helper

.DESCRIPTION
    Simplified launcher for the Portfolio CMS orchestration host.
    Handles environment setup and provides quick commands.

.PARAMETER Mode
    Operation mode: start, stop, mock, rebuild, or clean

.EXAMPLE
    .\orchestrate.ps1 start
    .\orchestrate.ps1 -Mode mock
    .\orchestrate.ps1 stop

.NOTES
    Requires: .NET 10 SDK, Docker Desktop
#>

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'mock', 'rebuild', 'clean', 'status')]
    [string]$Mode = 'start'
)

$ErrorActionPreference = 'Stop'

Write-Host "=======================================================`n" -ForegroundColor Cyan
Write-Host "  Portfolio CMS - Orchestration Helper`n" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $scriptDir "portfolio.api"
$appHostProject = Join-Path $apiDir "src\Portfolio.AppHost\Portfolio.AppHost.csproj"

switch ($Mode) {
    'start' {
        Write-Host "`n▶️  Starting all services (normal mode)...`n" -ForegroundColor Green
        Set-Location $apiDir
        dotnet run --project $appHostProject
    }
    
    'mock' {
        Write-Host "`n▶️  Starting all services (MOCK mode - no Kafka)...`n" -ForegroundColor Yellow
        $env:USE_MOCKS = 'true'
        Set-Location $apiDir
        dotnet run --project $appHostProject
    }
    
    'rebuild' {
        Write-Host "`n🔨 Starting with frontend rebuild...`n" -ForegroundColor Magenta
        $env:REBUILD_FRONTEND = 'true'
        Set-Location $apiDir
        dotnet run --project $appHostProject
    }
    
    'stop' {
        Write-Host "`n⏹️  Stopping containers...`n" -ForegroundColor Red
        
        $containers = @(
            'portfolio-frontend-aspire',
            'portfolio-kafka-aspire',
            'portfolio-zookeeper-aspire',
            'portfolio-pgadmin-aspire',
            'portfolio-postgres-aspire'
        )
        
        foreach ($container in $containers) {
            try {
                docker stop $container 2>$null
                Write-Host "  ✅ Stopped $container" -ForegroundColor Green
            }
            catch {
                Write-Host "  ⏭️  $container not running" -ForegroundColor Gray
            }
        }
        
        Write-Host "`nAll services stopped." -ForegroundColor Green
    }
    
    'clean' {
        Write-Host "`n🧹 Cleaning up containers and images...`n" -ForegroundColor Yellow
        
        # Stop containers
        & $MyInvocation.MyCommand.Path stop
        
        # Remove containers
        $containers = @(
            'portfolio-frontend-aspire',
            'portfolio-kafka-aspire',
            'portfolio-zookeeper-aspire',
            'portfolio-pgadmin-aspire',
            'portfolio-postgres-aspire'
        )
        
        foreach ($container in $containers) {
            try {
                docker rm $container 2>$null
                Write-Host "  🗑️  Removed $container" -ForegroundColor Yellow
            }
            catch {}
        }
        
        # Optionally remove frontend image
        $response = Read-Host "`nRemove frontend image (portfolio-frontend:latest)? [y/N]"
        if ($response -eq 'y' -or $response -eq 'Y') {
            try {
                docker rmi portfolio-frontend:latest
                Write-Host "  🗑️  Removed frontend image" -ForegroundColor Yellow
            }
            catch {
                Write-Host "  ⚠️  Frontend image not found or in use" -ForegroundColor Gray
            }
        }
        
        Write-Host "`nCleanup complete." -ForegroundColor Green
    }
    
    'status' {
        Write-Host "`n📊 Service Status:`n" -ForegroundColor Cyan
        
        $containers = @(
            @{Name='Frontend'; Container='portfolio-frontend-aspire'; Port='4200'},
            @{Name='API'; Container='dotnet'; Port='8085'},
            @{Name='PostgreSQL'; Container='portfolio-postgres-aspire'; Port='5432'},
            @{Name='pgAdmin'; Container='portfolio-pgadmin-aspire'; Port='5050'},
            @{Name='Kafka'; Container='portfolio-kafka-aspire'; Port='9092'},
            @{Name='Zookeeper'; Container='portfolio-zookeeper-aspire'; Port='2181'}
        )
        
        foreach ($svc in $containers) {
            $status = docker ps --filter "name=$($svc.Container)" --format "{{.Status}}" 2>$null
            if ($status) {
                Write-Host "  ✅ $($svc.Name.PadRight(12)) Running on port $($svc.Port)" -ForegroundColor Green
            }
            else {
                Write-Host "  ❌ $($svc.Name.PadRight(12)) Not running" -ForegroundColor Red
            }
        }
        
        Write-Host "`n📍 Access URLs:" -ForegroundColor Cyan
        Write-Host "  Frontend:  http://localhost:4200" -ForegroundColor White
        Write-Host "  API:       http://localhost:8085" -ForegroundColor White
        Write-Host "  Swagger:   http://localhost:8085/swagger" -ForegroundColor White
        Write-Host "  pgAdmin:   http://localhost:5050" -ForegroundColor White
    }
}

Write-Host ""
