# Quickstart Guide

This guide will help you get the Portfolio CMS API up and running in minutes.

## Prerequisites

- .NET 9 SDK installed
- Docker Desktop installed and running
- Git installed

## Step 1: Get the Code

```bash
git clone <repository-url>
cd portfolio.api
```

## Step 2: Start Dependencies with Docker

The easiest way to get started is using Docker Compose:

```bash
docker-compose -f deploy/docker-compose.yml up -d
```

This starts:
- PostgreSQL database
- Redpanda (Kafka alternative)
- The Portfolio API

Wait ~30 seconds for all services to be healthy.

## Step 3: Verify the API

Open your browser and navigate to:
- **Swagger UI**: http://localhost:5000/swagger
- **Health Check**: http://localhost:5000/health

## Step 4: Create Your First Tenant

Using curl or Postman:

```bash
curl -X POST http://localhost:5000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "subdomain": "mycompany"
  }'
```

Response:
```json
{
  "id": "...guid...",
  "name": "My Company",
  "subdomain": "mycompany",
  "isActive": true,
  "createdAt": "2025-11-12T..."
}
```

## Step 5: Create a User

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: <tenant-id-from-step-4>" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

## Step 6: Login and Get JWT Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "tenantId": "<tenant-id>"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "...guid..."
}
```

## Step 7: Create a Blog Post

```bash
curl -X POST http://localhost:5000/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-from-step-6>" \
  -H "X-Tenant-Id: <tenant-id>" \
  -d '{
    "title": "My First Blog Post",
    "content": "<p>This is my first blog post!</p>",
    "summary": "An introduction to my blog",
    "isPublished": true,
    "tags": ["introduction", "first-post"]
  }'
```

## Step 8: Get Your Blog Posts

```bash
curl http://localhost:5000/api/blogs?publishedOnly=true \
  -H "X-Tenant-Id: <tenant-id>"
```

## Step 9: Create a Portfolio

```bash
curl -X POST http://localhost:5000/api/portfolios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-Id: <tenant-id>" \
  -d '{
    "title": "John Doe - Software Engineer",
    "subtitle": "Full Stack Developer",
    "bio": "Passionate developer with 5 years of experience",
    "template": "Modern",
    "featuredBlogsEnabled": true
  }'
```

## Alternative: Run Locally Without Docker

If you prefer to run the API locally:

```bash
# 1. Update appsettings.json with your local PostgreSQL connection
# 2. Set USE_MOCKS=true to skip Kafka requirement
# 3. Run migrations
dotnet ef database update -p src/Portfolio.Infrastructure -s src/Portfolio.Api

# 4. Run the API
dotnet run --project src/Portfolio.Api
```

## Next Steps

- Explore the **Swagger UI** at http://localhost:5000/swagger
- Read the full **API Documentation** in `docs/API.md`
- Check out **example Angular integration** in `docs/Angular-Integration.md`
- Set up **OAuth providers** (LinkedIn, Google)

## Troubleshooting

### Port Already in Use

If port 5000 is already in use:
```bash
# Edit deploy/docker-compose.yml and change the port mapping:
ports:
  - "5001:8080"  # Changed from 5000:8080
```

### Database Connection Errors

Make sure PostgreSQL is running:
```bash
docker ps | grep postgres
```

### Kafka/Redpanda Not Required

Set `USE_MOCKS=true` in appsettings.json to use in-memory message bus.

## Clean Up

To stop and remove all containers:
```bash
docker-compose -f deploy/docker-compose.yml down -v
```

## Support

- Check the **README.md** for more details
- Review **logs**: `docker-compose -f deploy/docker-compose.yml logs api`
- Open an issue on GitHub
