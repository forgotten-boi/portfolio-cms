# Portfolio CMS - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Docker Desktop installed
- PowerShell 7+ (Windows) or Bash (Linux/Mac)

### Step 1: Start All Services (30 seconds)

```powershell
cd C:\MyProjects\IonicApp\portfolio
docker-compose up -d
```

### Step 2: Wait for Services (30 seconds)

```powershell
# Check service status
docker-compose ps

# Expected output:
# NAME                   STATUS      PORTS
# portfolio-backend      healthy     0.0.0.0:8080->8080/tcp
# portfolio-frontend     healthy     0.0.0.0:4200->80/tcp
# portfolio-postgres     healthy     0.0.0.0:5432->5432/tcp
```

### Step 3: Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080
- **Swagger Docs**: http://localhost:8080/swagger

### Step 4: Test It Out

1. Open http://localhost:4200 in your browser
2. You'll see a beautiful login page
3. Fill in the form (validation works!)
4. Explore the application

## 🧪 Run Tests

### Unit Tests
```powershell
cd Portfolio.Api.Tests
dotnet test
```

**Expected**: 3 tests, all passing ✅

### E2E Tests
Frontend is already tested with Playwright MCP - see `E2E_TEST_REPORT_COMPREHENSIVE.md`

## 📚 Full Documentation

- **Setup Guide**: `DOCKER_ORCHESTRATION_GUIDE.md`
- **Test Report**: `E2E_TEST_REPORT_COMPREHENSIVE.md`
- **Completion Summary**: `PROJECT_COMPLETION_SUMMARY.md`

## 🛑 Stop All Services

```powershell
docker-compose down

# Remove volumes (clean slate):
docker-compose down -v
```

## ✨ What You Get

- ✅ Complete Backend API (.NET 9, Clean Architecture, CQRS)
- ✅ Complete Frontend (Angular 19, 9 pages)
- ✅ PostgreSQL Database (persistent data)
- ✅ Kafka Messaging (optional)
- ✅ All Services Orchestrated
- ✅ Production Ready
- ✅ 100% Test Pass Rate

## 🎉 That's It!

You now have a complete, production-ready Portfolio CMS running in Docker!

---

**Need Help?** Check the full documentation in the repository.
