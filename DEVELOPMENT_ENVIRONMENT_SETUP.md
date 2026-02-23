# 🛠️ Development Environment Setup Guide

**Complete step-by-step instructions for setting up Portfolio CMS development environment**

---

## 📋 TABLE OF CONTENTS

1. [System Requirements](#system-requirements)
2. [Prerequisites Installation](#prerequisites-installation)
3. [Repository Setup](#repository-setup)
4. [Database Configuration](#database-configuration)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Docker Development Setup](#docker-development-setup)
8. [Running Development Environment](#running-development-environment)
9. [IDE Configuration](#ide-configuration)
10. [Troubleshooting](#troubleshooting)

---

## 🖥️ SYSTEM REQUIREMENTS

### Minimum Requirements
- **OS:** Windows 10/11, macOS, or Linux
- **RAM:** 8 GB minimum (16 GB recommended)
- **Disk Space:** 15 GB free
- **Internet:** Required for npm/NuGet package downloads

### Windows-Specific
- PowerShell 5.1+ (or PowerShell 7+ recommended)
- Windows Terminal (optional but recommended)

---

## 📦 PREREQUISITES INSTALLATION

### Step 1: Install Node.js & npm

**For Windows (Using Chocolatey):**
```powershell
# If you don't have Chocolatey, install it first:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs -y

# Verify installation
node --version  # Should be v18+
npm --version   # Should be 9+
```

**For Windows (Using Node Installer):**
1. Visit https://nodejs.org/
2. Download LTS version
3. Run installer with default settings
4. Restart PowerShell/terminal

**For macOS:**
```bash
brew install node
```

**For Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify Installation:**
```powershell
node -v
npm -v
```

---

### Step 2: Install .NET 10 SDK

**For Windows:**
1. Visit https://dotnet.microsoft.com/download/dotnet/10.0
2. Download .NET 10 SDK for Windows
3. Run installer with default settings

**Using Chocolatey:**
```powershell
choco install dotnet-sdk -y
```

**For macOS:**
```bash
brew install dotnet-sdk@10
```

**For Linux:**
```bash
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x ./dotnet-install.sh
./dotnet-install.sh --version latest
```

**Verify Installation:**
```powershell
dotnet --version   # Should be 10.x
dotnet --list-sdks
```

---

### Step 3: Install Docker & Docker Compose

**For Windows 11:**
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Run installer and complete setup
3. Enable WSL 2 if prompted
4. Restart computer

**For macOS:**
```bash
brew install docker
brew install docker-compose
```

**For Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Verify Installation:**
```powershell
docker --version           # Should be 24+
docker-compose --version   # Should be 2+
docker run hello-world     # Should display hello message
```

---

### Step 4: Install Git

**For Windows:**
```powershell
choco install git -y
```

Or download from https://git-scm.com/download/win

**For macOS:**
```bash
brew install git
```

**For Linux:**
```bash
sudo apt-get install git
```

**Verify Installation:**
```powershell
git --version
```

---

### Step 5: Install IDE/Editor

**Option A: Visual Studio Code (Recommended for lightweight development)**
```powershell
choco install vscode -y
```
Visit: https://code.visualstudio.com/

**Option B: Visual Studio Community (Recommended for .NET)**
Visit: https://visualstudio.microsoft.com/downloads/

**Option C: JetBrains Rider**
Visit: https://www.jetbrains.com/rider/

---

### Step 6: Install Database Tools (Optional)

**PostgreSQL Client (for direct database access):**
```powershell
choco install pgadmin4 -y
```

**DBeaver (Universal DB tool):**
```powershell
choco install dbeaver -y
```

---

## 📂 REPOSITORY SETUP

### Step 1: Clone Repository

```powershell
# Navigate to desired directory
cd C:\Projects

# Clone repository
git clone https://github.com/your-repo/portfolio-cms.git

# Navigate to project
cd portfolio-cms
```

### Step 2: Create Local Configuration Files

```powershell
# Navigate to backend
cd portfolio.api

# Copy development configuration
Copy-Item appsettings.json appsettings.Development.json

# Navigate to frontend
cd ..\portfolio-cms-web

# Create environment file
New-Item src/environments/environment.development.ts -Force
```

### Step 3: Initialize Git Hooks

```powershell
# From project root
git config core.hooksPath .githooks
```

---

## 🗄️ DATABASE CONFIGURATION

### Step 1: Install PostgreSQL (If not using Docker)

**Windows:**
```powershell
choco install postgresql -y --params '/Password:postgres /Port:5432'
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Step 2: Create Development Database

```powershell
# Connect to PostgreSQL
# Default: user=postgres, password=postgres

# Create database
$psqlCmd = @"
CREATE DATABASE portfolio_dev;
CREATE USER portfolio_dev_user WITH PASSWORD 'portfolio_dev_pass';
ALTER ROLE portfolio_dev_user WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE portfolio_dev TO portfolio_dev_user;
"@

psql -U postgres -c $psqlCmd
```

### Step 3: Update Connection String

Edit `portfolio.api/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=portfolio_dev;Username=portfolio_dev_user;Password=portfolio_dev_pass"
  }
}
```

---

## 🔧 BACKEND SETUP

### Step 1: Restore NuGet Packages

```powershell
cd portfolio.api

# Restore dependencies
dotnet restore

# This downloads all required packages
```

### Step 2: Apply Database Migrations

```powershell
cd portfolio.api

# Apply migrations
dotnet ef database update --project .\src\Portfolio.Api\Portfolio.Api.csproj --startup-project .\src\Portfolio.Api\Portfolio.Api.csproj

# Or using Package Manager Console in Visual Studio
Update-Database
```

### Step 3: Build Backend

```powershell
dotnet build -c Debug

# Expected output:
# Build succeeded. 0 Warning(s)
```

### Step 4: Run Backend Locally

```powershell
# From portfolio.api directory
dotnet run --project .\src\Portfolio.Api\Portfolio.Api.csproj

# Alternative (using IDE):
# Press F5 in Visual Studio or Run button in VS Code
```

**Expected Output:**
```
Now listening on: http://localhost:5000
Now listening on: https://localhost:5001
Application started. Press Ctrl+C to stop.
```

**Access:**
- API: http://localhost:5000 or https://localhost:5001
- Health Check: http://localhost:5000/health
- Swagger: https://localhost:5001/swagger/index.html

---

## 🎨 FRONTEND SETUP

### Step 1: Install Dependencies

```powershell
cd portfolio-cms-web

# Install npm packages (this may take 2-3 minutes)
npm install

# Clean install (if you encounter issues)
npm ci
```

### Step 2: Create Environment Configuration

Create `src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  wsUrl: 'ws://localhost:5000'
};
```

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:5000/api',
  wsUrl: 'ws://localhost:5000'
};
```

### Step 3: Run Development Server

```powershell
# From portfolio-cms-web directory
npm start

# Or
npm run dev

# This starts ng serve with dev config
```

**Expected Output:**
```
✔ Compiled successfully.
Application bundle generation complete. [2.145 seconds]

Watch mode enabled. Watching for file changes...
```

**Access:**
- Frontend: http://localhost:4200

---

## 🐳 DOCKER DEVELOPMENT SETUP

### Step 1: Create Development Docker Compose File

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:17
    container_name: portfolio-postgres-dev
    environment:
      POSTGRES_USER: portfolio_dev_user
      POSTGRES_PASSWORD: portfolio_dev_pass
      POSTGRES_DB: portfolio_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    networks:
      - portfolio-dev-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U portfolio_dev_user -d portfolio_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  # pgAdmin (Database UI)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: portfolio-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@portfolio.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - portfolio-dev-network

  # Kafka (Message Queue)
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: portfolio-kafka-dev
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    ports:
      - "9092:9092"
    depends_on:
      - zookeeper
    networks:
      - portfolio-dev-network

  # Zookeeper (Kafka Coordination)
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: portfolio-zookeeper-dev
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"
    networks:
      - portfolio-dev-network

networks:
  portfolio-dev-network:
    driver: bridge

volumes:
  postgres_dev_data:
```

### Step 2: Start Development Containers

```powershell
# From project root
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f postgres

# Verify all services
docker-compose -f docker-compose.dev.yml ps
```

### Step 3: Access Development Services

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | localhost:5432 | portfolio_dev_user / portfolio_dev_pass |
| pgAdmin | http://localhost:5050 | admin@portfolio.local / admin |
| Kafka | localhost:9092 | N/A |
| Zookeeper | localhost:2181 | N/A |

---

## ▶️ RUNNING DEVELOPMENT ENVIRONMENT

### Complete Startup (All Services)

**Option 1: Using Docker for services + Local for code**

```powershell
# Terminal 1: Start database and services
docker-compose -f docker-compose.dev.yml up -d

# Terminal 2: Start backend
cd portfolio.api
dotnet run --project .\src\Portfolio.Api\Portfolio.Api.csproj

# Terminal 3: Start frontend
cd portfolio-cms-web
npm start

# Access:
# Frontend: http://localhost:4200
# Backend: http://localhost:5000
# Swagger: http://localhost:5001/swagger
```

**Option 2: Using Enhanced Deployment Script (Development Mode)**

```powershell
# Copy and modify build script for development
Copy-Item build-and-deploy.ps1 build-and-deploy-dev.ps1

# Edit the script to use dev compose file and skip docker builds
.\build-and-deploy-dev.ps1 -Dev
```

---

## 💻 IDE CONFIGURATION

### Visual Studio Code

**Extensions to Install:**

```powershell
code --install-extension ms-dotnettools.csharp
code --install-extension ms-dotnettools.vscode-dotnet-runtime
code --install-extension Angular.ng-template
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension esbenp.prettier-vscode
code --install-extension EditorConfig.EditorConfig
```

**Workspace Settings (.vscode/settings.json):**

```json
{
  "[csharp]": {
    "editor.defaultFormatter": "ms-dotnettools.csharp",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "omnisharp.useRoslynAnalyzers": true,
  "omnisharp.enableRoslynAnalyzers": true
}
```

### Visual Studio

**Extensions:**

- Productivity Power Tools
- Visual Assist (optional)
- Docker Tools
- Entity Framework Power Tools

**Debugging:**

1. Set startup project: `Portfolio.Api`
2. Press `F5` to debug
3. Browser will open to Swagger UI

---

## 🐛 TROUBLESHOOTING

### Issue 1: Port Already in Use

**Problem:** Error when starting services on ports 5000, 4200, 5432

**Solution:**

```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess

# Kill process
Stop-Process -Id <PID> -Force

# Or use different ports in configuration
```

### Issue 2: Database Connection Failed

**Problem:** "Unable to connect to PostgreSQL"

**Solution:**

```powershell
# Verify PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# Check connection string in appsettings.Development.json

# Test connection manually
psql -U portfolio_dev_user -h localhost -d portfolio_dev -W

# Restart services
docker-compose -f docker-compose.dev.yml restart postgres
```

### Issue 3: npm Dependencies Conflict

**Problem:** Errors during `npm install`

**Solution:**

```powershell
# Clear cache and reinstall
npm cache clean --force
rm -r node_modules
rm package-lock.json
npm install

# Or use clean install
npm ci
```

### Issue 4: .NET Build Errors

**Problem:** "Project does not exist or was not found"

**Solution:**

```powershell
# Verify you're in correct directory
cd portfolio.api

# Clean build
dotnet clean
dotnet restore
dotnet build

# Check .NET installation
dotnet --info
```

### Issue 5: CORS Errors

**Problem:** Frontend can't call backend API

**Solution:**

Edit `Program.cs` in backend:

```csharp
// Add CORS policy for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Use CORS
app.UseCors("DevelopmentPolicy");
```

### Issue 6: Angular Compilation Error

**Problem:** "ng" command not found

**Solution:**

```powershell
# Install Angular CLI globally
npm install -g @angular/cli

# Or run through npx
npx ng serve

# Verify installation
ng version
```

---

## ✅ VERIFICATION CHECKLIST

After setup, verify everything works:

- [ ] Node.js installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] .NET SDK installed (`dotnet --version`)
- [ ] Docker running (`docker ps`)
- [ ] PostgreSQL container running
- [ ] Backend builds successfully (`dotnet build`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend starts without errors (`dotnet run`)
- [ ] Frontend starts without errors (`npm start`)
- [ ] Can access frontend at http://localhost:4200
- [ ] Can access backend API at http://localhost:5000/health
- [ ] Can access Swagger at http://localhost:5001/swagger
- [ ] Database migrations applied successfully
- [ ] Can login to application

---

## 📝 DEVELOPMENT WORKFLOW

### Daily Development Workflow

```powershell
# Morning: Start services
docker-compose -f docker-compose.dev.yml up -d

# Terminal 1: Backend
cd portfolio.api && dotnet run

# Terminal 2: Frontend
cd portfolio-cms-web && npm start

# Browser: Navigate to http://localhost:4200

# Make changes to code - both services auto-reload

# Testing
npm test  # Frontend tests
dotnet test  # Backend tests

# Before committing
git status
git add .
git commit -m "Feature: description"
git push
```

### Before Deployment

```powershell
# Backend
cd portfolio.api
dotnet build -c Release
dotnet test

# Frontend
cd portfolio-cms-web
npm run build
npm run lint

# Both
docker-compose -f docker-compose.dev.yml down
```

---

## 🎯 QUICK COMMANDS REFERENCE

```powershell
# Backend
dotnet restore           # Restore packages
dotnet build            # Build project
dotnet run              # Run development server
dotnet test             # Run tests
dotnet ef database update  # Apply migrations

# Frontend
npm install             # Install dependencies
npm start               # Start dev server
npm run build           # Production build
npm test                # Run tests
npm run lint            # Check code style

# Docker
docker-compose -f docker-compose.dev.yml up -d    # Start services
docker-compose -f docker-compose.dev.yml down      # Stop services
docker-compose -f docker-compose.dev.yml logs -f   # View logs
docker-compose -f docker-compose.dev.yml ps        # List services

# Git
git status              # Check status
git pull                # Get latest changes
git checkout -b feature/name  # Create feature branch
git commit -m "message" # Commit changes
git push                # Push to remote
```

---

## 📚 ADDITIONAL RESOURCES

- [.NET Documentation](https://docs.microsoft.com/dotnet)
- [Angular Documentation](https://angular.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Docker Documentation](https://docs.docker.com)
- [Entity Framework Core](https://docs.microsoft.com/ef/core/)

---

**Setup Complete!** You're now ready to start developing on Portfolio CMS.

For issues or questions, refer to the troubleshooting section or check the project's GitHub issues.
