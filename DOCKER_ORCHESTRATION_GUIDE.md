# Portfolio CMS - Complete Orchestration Setup

## 🚀 Project Overview

A complete full-stack Portfolio CMS application with:
- **Backend API**: .NET 9 with Clean Architecture, CQRS pattern
- **Frontend**: Angular 19 with standalone components
- **Database**: PostgreSQL 16
- **Orchestration**: Docker Compose
- **Testing**: Unit tests (xUnit) + E2E tests (Playwright MCP)

## 📋 Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.x
- .NET 9 SDK (for local development)
- Node.js 20+ (for local frontend development)
- PowerShell 7+ (Windows) or Bash (Linux/Mac)

## 🏗️ Architecture

```
portfolio/
├── docker-compose.yml          # Orchestration configuration
├── portfolio.api/              # Backend API (.NET 9)
│   ├── Dockerfile             # Multi-stage Docker build
│   └── src/
│       ├── Portfolio.Domain/
│       ├── Portfolio.Application/
│       ├── Portfolio.Infrastructure/
│       └── Portfolio.Api/
├── portfolio-cms-web/          # Frontend (Angular 19)
│   ├── Dockerfile             # Multi-stage build with nginx
│   ├── nginx.conf             # Nginx configuration
│   └── src/
└── Portfolio.Api.Tests/        # Unit tests (xUnit)
```

## 🐳 Docker Services

### 1. PostgreSQL Database
- **Image**: `postgres:16-alpine`
- **Port**: `5432`
- **Database**: `portfolio_db`
- **Credentials**: `portfolio_user` / `portfolio_pass`
- **Volume**: Persistent data storage

### 2. Backend API
- **Framework**: .NET 9
- **Port**: `8080`
- **Environment**: Development
- **Features**:
  - Clean Architecture (Domain, Application, Infrastructure, API)
  - CQRS with Command/Query handlers
  - JWT Authentication with BCrypt
  - Multi-tenancy support
  - Kafka messaging (optional)
  - Health checks at `/health`

### 3. Frontend Application
- **Framework**: Angular 19
- **Port**: `4200` (exposed as `80` in container)
- **Server**: Nginx
- **Features**:
  - Standalone components (no NgModules)
  - Lazy loading
  - Reactive forms
  - HTTP interceptors for auth
  - Responsive design with SCSS

### 4. Kafka + Zookeeper (Optional)
- **Kafka Port**: `9092`
- **Zookeeper Port**: `2181`
- **Purpose**: Event-driven architecture

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```powershell
# Navigate to project root
cd C:\MyProjects\IonicApp\portfolio

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Option 2: Local Development

#### Backend API
```powershell
cd portfolio.api\src\Portfolio.Api
dotnet restore
dotnet ef database update --project ..\Portfolio.Infrastructure
dotnet run
```

Backend will be available at `http://localhost:8080`

#### Frontend
```powershell
cd portfolio-cms-web
npm install
npm start
```

Frontend will be available at `http://localhost:4200`

## 🔧 Configuration

### Environment Variables (docker-compose.yml)

#### Backend API
```yaml
ASPNETCORE_ENVIRONMENT: Development
ASPNETCORE_URLS: http://+:8080
ConnectionStrings__DefaultConnection: "Host=postgres;Port=5432;Database=portfolio_db;Username=portfolio_user;Password=portfolio_pass"
JwtSettings__Secret: "YourSuperSecretKeyForJWTTokenGenerationThatIsAtLeast32CharactersLong"
JwtSettings__Issuer: "PortfolioCMS"
JwtSettings__Audience: "PortfolioCMS"
JwtSettings__ExpiryMinutes: "60"
```

#### Frontend
```yaml
API_URL: http://backend-api:8080
```

### Database Connection Strings

**Docker Compose** (Service-to-Service):
```
Host=postgres;Port=5432;Database=portfolio_db;Username=portfolio_user;Password=portfolio_pass
```

**Local Development** (Host Machine):
```
Host=localhost;Port=5432;Database=portfolio_db;Username=portfolio_user;Password=portfolio_pass
```

## 🧪 Testing

### Unit Tests (xUnit)

```powershell
cd Portfolio.Api.Tests

# Run all tests
dotnet test

# Run with detailed output
dotnet test --verbosity detailed

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

**Test Coverage**:
- ✅ TenantHandlerTests (3 tests)
  - GetAllTenantsQueryHandler
  - GetTenantByIdQueryHandler
  - GetTenantBySubdomainQueryHandler

### E2E Tests (Playwright MCP)

Playwright MCP is running on port 9000. To execute E2E tests:

```powershell
# Ensure services are running
docker-compose up -d

# Wait for services to be healthy
Start-Sleep -Seconds 30

# Run E2E tests (using Playwright MCP on port 9000)
# Tests will be executed through the MCP server
```

**E2E Test Scenarios**:
1. Login flow
2. Blog CRUD operations
3. Portfolio CRUD operations
4. User management
5. Tenant management
6. Navigation and routing
7. Form validation
8. Responsive design

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

### Blogs
- `GET /api/blogs` - Get all blogs (paginated)
- `GET /api/blogs/{id}` - Get blog by ID
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/{id}` - Update blog
- `DELETE /api/blogs/{id}` - Delete blog
- `POST /api/blogs/{id}/publish` - Publish blog

### Portfolios
- `GET /api/portfolios` - Get all portfolios
- `GET /api/portfolios/{id}` - Get portfolio by ID
- `GET /api/portfolios/slug/{slug}` - Get portfolio by slug
- `POST /api/portfolios` - Create new portfolio
- `PUT /api/portfolios/{id}` - Update portfolio
- `DELETE /api/portfolios/{id}` - Delete portfolio

### Users
- `GET /api/users` - Get all users (tenant-scoped)
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Tenants
- `GET /api/tenants` - Get all tenants
- `GET /api/tenants/{id}` - Get tenant by ID
- `GET /api/tenants/subdomain/{subdomain}` - Get tenant by subdomain
- `POST /api/tenants` - Create new tenant
- `PUT /api/tenants/{id}` - Update tenant

## 🔍 Monitoring & Health Checks

### Service Health Endpoints

- **Backend API**: `http://localhost:8080/health`
- **Frontend**: `http://localhost:4200`
- **PostgreSQL**: `pg_isready -U portfolio_user -d portfolio_db`

### Docker Health Checks

```powershell
# Check container health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# View logs for specific service
docker-compose logs backend-api
docker-compose logs frontend
docker-compose logs postgres
```

## 🐛 Troubleshooting

### Backend API Not Starting

```powershell
# Check logs
docker-compose logs backend-api

# Common issues:
# 1. PostgreSQL not ready - wait for postgres healthy status
# 2. Port 8080 already in use - change port in docker-compose.yml
# 3. Migration issues - run migrations manually
```

### Frontend Not Loading

```powershell
# Check logs
docker-compose logs frontend

# Common issues:
# 1. Backend API not reachable - verify backend is healthy
# 2. Nginx configuration error - check nginx.conf
# 3. Build failed - check package.json and dependencies
```

### Database Connection Issues

```powershell
# Check PostgreSQL logs
docker-compose logs postgres

# Test connection from host
docker exec -it portfolio-postgres psql -U portfolio_user -d portfolio_db

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

## 📦 Build & Deployment

### Building Docker Images

```powershell
# Build all images
docker-compose build

# Build specific service
docker-compose build backend-api
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Production Deployment

1. Update environment variables in docker-compose.yml
2. Change `ASPNETCORE_ENVIRONMENT` to `Production`
3. Use proper JWT secret (32+ characters)
4. Configure SSL/TLS certificates
5. Set up reverse proxy (nginx/traefik)
6. Enable CORS properly
7. Configure logging and monitoring

### CI/CD Pipeline

Existing Azure DevOps pipelines in `portfolio.api/k8s/azure-pipelines/`:
- `backend-pipeline.yml` - Backend build & deploy
- `frontend-pipeline.yml` - Frontend build & deploy

## 🔐 Security Considerations

1. **JWT Secret**: Change to a secure random string (32+ chars)
2. **Database Credentials**: Use secrets management in production
3. **CORS**: Configure allowed origins properly
4. **HTTPS**: Use SSL/TLS certificates in production
5. **Container Security**: Run containers as non-root users
6. **Network Isolation**: Use Docker networks properly

## 📈 Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis for caching
3. **CDN**: Use CDN for static assets
4. **Connection Pooling**: Configure EF Core connection pooling
5. **Lazy Loading**: Enable lazy loading in Angular
6. **Image Optimization**: Compress images and use WebP

## 📚 Additional Resources

- [.NET 9 Documentation](https://docs.microsoft.com/en-us/dotnet/)
- [Angular 19 Documentation](https://angular.io/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Playwright MCP Documentation](https://playwright.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## ✨ Features Summary

### Backend
✅ Clean Architecture (Domain, Application, Infrastructure, API)
✅ CQRS pattern with Command/Query handlers
✅ JWT Authentication with BCrypt password hashing
✅ Multi-tenancy support
✅ Entity Framework Core 9 with PostgreSQL
✅ Swagger/OpenAPI documentation
✅ Docker support with health checks
✅ Unit tests with xUnit, Moq, FluentAssertions
✅ Kafka messaging support
✅ Repository pattern
✅ Error handling middleware

### Frontend
✅ Angular 19 with standalone components
✅ Reactive forms with validation
✅ HTTP interceptors for authentication
✅ Lazy loading routes
✅ Responsive design with SCSS
✅ Login, Dashboard, Blogs, Portfolios, Users, Tenants pages
✅ CRUD operations for all entities
✅ Form validation and error handling
✅ Navbar with routing
✅ Docker support with nginx
✅ Production-ready build configuration

### DevOps
✅ Docker Compose orchestration
✅ Multi-stage Docker builds
✅ Health checks for all services
✅ Volume persistence for database
✅ Azure DevOps CI/CD pipelines
✅ Kubernetes deployment (Helm charts)
✅ E2E testing setup (Playwright MCP)

## 🎉 Getting Started Checklist

- [ ] Clone the repository
- [ ] Install Docker Desktop
- [ ] Run `docker-compose up -d`
- [ ] Wait for services to start (check with `docker-compose ps`)
- [ ] Access frontend at http://localhost:4200
- [ ] Access backend API at http://localhost:8080/swagger
- [ ] Run unit tests with `dotnet test`
- [ ] Run E2E tests with Playwright MCP (port 9000)
- [ ] Start building your portfolio! 🚀
