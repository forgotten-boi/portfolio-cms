# Portfolio CMS Backend API

A production-ready, multi-tenant Portfolio CMS backend built with .NET 9, Clean Architecture, and CQRS pattern.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with a custom CQRS implementation:

- **Domain Layer**: Entities, value objects, domain events
- **Application Layer**: Commands, queries, handlers, DTOs, interfaces
- **Infrastructure Layer**: EF Core, repositories, Kafka, JWT auth
- **API Layer**: Minimal API endpoints, middleware, DI configuration

## 🚀 Features

- ✅ Multi-tenancy with tenant isolation
- ✅ JWT & OAuth2 authentication (LinkedIn, Google, Email/Password)
- ✅ Clean Architecture with CQRS pattern
- ✅ Event-driven architecture with Kafka/Redpanda
- ✅ Blog management with WYSIWYG content
- ✅ Portfolio generation from LinkedIn/Resume
- ✅ PostgreSQL with EF Core
- ✅ Docker & Kubernetes ready
- ✅ Swagger/OpenAPI documentation
- ✅ Serilog structured logging
- ✅ Azure DevOps CI/CD pipeline

## 📋 Prerequisites

- .NET 9 SDK
- Docker & Docker Compose
- PostgreSQL 16
- Kafka/Redpanda (optional, can use mock mode)

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd portfolio.api
```

### 2. Run with Docker Compose

```bash
docker-compose -f deploy/docker-compose.yml up -d
```

This will start:
- PostgreSQL on port 5432
- Redpanda (Kafka) on port 19092
- Portfolio API on port 5000

### 3. Run Locally (Development)

```bash
# Restore dependencies
dotnet restore

# Run the API
dotnet run --project src/Portfolio.Api

# API will be available at http://localhost:5000
# Swagger UI: http://localhost:5000/swagger
```

### 4. Database Migrations

```bash
# Create a migration
dotnet ef migrations add InitialCreate -p src/Portfolio.Infrastructure -s src/Portfolio.Api

# Apply migrations
dotnet ef database update -p src/Portfolio.Infrastructure -s src/Portfolio.Api
```

## 📚 API Endpoints

See [API Documentation](docs/API.md) for detailed endpoint information.

### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/oauth` - OAuth login (LinkedIn, Google)

### Tenants
- `GET /api/tenants` - List all tenants
- `POST /api/tenants` - Create tenant
- `GET /api/tenants/{id}` - Get tenant by ID
- `PUT /api/tenants/{id}` - Update tenant

### Blogs
- `GET /api/blogs` - List blogs
- `POST /api/blogs` - Create blog
- `GET /api/blogs/{id}` - Get blog by ID
- `PUT /api/blogs/{id}` - Update blog
- `DELETE /api/blogs/{id}` - Delete blog

### Portfolios
- `GET /api/portfolios` - List portfolios
- `POST /api/portfolios` - Create portfolio
- `POST /api/portfolios/import/linkedin` - Import from LinkedIn
- `POST /api/portfolios/import/resume` - Import from resume

## ⚙️ Configuration

Key configuration in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=portfolio;..."
  },
  "Jwt": {
    "Secret": "your-secret-key",
    "ExpiryMinutes": 60
  },
  "Kafka": {
    "Enabled": false,
    "BootstrapServers": "localhost:9092"
  },
  "USE_MOCKS": true
}
```

## 🧪 Testing

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t portfolio-api .

# Run container
docker run -d -p 5000:8080 \
  -e ConnectionStrings__DefaultConnection="..." \
  -e Kafka__Enabled=true \
  portfolio-api
```

## ☸️ Kubernetes Deployment

```bash
# Install with Helm
helm install portfolio-api ./deploy/helm \
  --namespace portfolio \
  --create-namespace \
  --set image.tag=latest
```

## 🔐 Security

- JWT tokens with configurable expiry
- OAuth2 integration for LinkedIn and Google
- Password hashing with BCrypt
- Rate limiting middleware (configurable)
- CORS policy configuration
- Secrets management with Azure Key Vault

## 📊 Monitoring & Observability

- Structured logging with Serilog
- Health check endpoint: `/health`
- Request logging middleware
- Exception handling middleware
- Optional Prometheus metrics

## 🌍 Multi-Tenancy

Tenant identification via:
1. `X-Tenant-Id` header
2. Subdomain (e.g., `tenant1.api.com`)
3. JWT claim (`tenantId`)

## 🔄 Event-Driven Architecture

Domain events published to Kafka topics:
- `tenants.created` - Tenant created
- `blogs.created` - Blog created
- `portfolio.generated` - Portfolio generated

## 📝 Conventional Commits

```
feat: Add new feature
fix: Bug fix
chore: Maintenance tasks
test: Add tests
docs: Documentation updates
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed by Portfolio Team

## 📞 Support

For issues and questions, please open an issue on GitHub.
