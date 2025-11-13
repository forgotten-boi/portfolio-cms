# API Documentation

Complete reference for all Portfolio CMS API endpoints.

## Base URL

- Development: `http://localhost:5000`
- Production: `https://api.yourcompany.com`

## Authentication

Most endpoints require a JWT token obtained via the `/api/auth/login` endpoint.

**Include in requests:**
```
Authorization: Bearer <your-jwt-token>
```

## Multi-Tenancy

All requests must include the tenant identifier:

```
X-Tenant-Id: <tenant-guid>
```

Or via subdomain: `https://mycompany.api.yourcompany.com`

---

## Tenant Endpoints

### Get All Tenants
```
GET /api/tenants
```

**Response:**
```json
[
  {
    "id": "guid",
    "name": "Company Name",
    "subdomain": "company",
    "isActive": true,
    "createdAt": "2025-11-12T10:00:00Z",
    "settings": { "theme": "dark" }
  }
]
```

### Get Tenant by ID
```
GET /api/tenants/{id}
```

### Get Tenant by Subdomain
```
GET /api/tenants/subdomain/{subdomain}
```

### Create Tenant
```
POST /api/tenants
```

**Request Body:**
```json
{
  "name": "Company Name",
  "subdomain": "company"
}
```

**Response:** `201 Created` with tenant object

### Update Tenant
```
PUT /api/tenants/{id}
```

**Request Body:**
```json
{
  "id": "existing-guid",
  "name": "Updated Name",
  "subdomain": "updated",
  "isActive": true,
  "settings": { "theme": "light", "primaryColor": "#007bff" }
}
```

---

## User Endpoints

### Get All Users (Auth Required)
```
GET /api/users
```
**Headers:** `Authorization`, `X-Tenant-Id`

**Response:**
```json
[
  {
    "id": "guid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Admin",
    "isActive": true,
    "createdAt": "2025-11-12T10:00:00Z"
  }
]
```

### Get User by ID (Auth Required)
```
GET /api/users/{id}
```

### Create User (Auth Required)
```
POST /api/users
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "Editor"
}
```

**Validation:**
- Email: Required, valid format
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
- Role: `Admin`, `Editor`, or `Viewer`

### Update User (Auth Required)
```
PUT /api/users/{id}
```

**Request Body:**
```json
{
  "id": "existing-guid",
  "email": "updated@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "isActive": true
}
```

---

## Blog Endpoints

### Get All Blogs
```
GET /api/blogs?publishedOnly=true&page=1&pageSize=10
```

**Query Parameters:**
- `publishedOnly` (bool): Filter published blogs
- `page` (int): Page number
- `pageSize` (int): Items per page

**Response:**
```json
[
  {
    "id": "guid",
    "title": "Blog Post Title",
    "slug": "blog-post-title",
    "content": "<p>HTML content</p>",
    "summary": "Brief summary",
    "isPublished": true,
    "publishedAt": "2025-11-12T10:00:00Z",
    "authorId": "guid",
    "tags": ["tech", "programming"],
    "views": 150,
    "createdAt": "2025-11-12T09:00:00Z"
  }
]
```

### Get Blog by ID
```
GET /api/blogs/{id}
```

### Get Blog by Slug
```
GET /api/blogs/slug/{slug}
```

### Create Blog (Auth Required)
```
POST /api/blogs
```

**Request Body:**
```json
{
  "title": "My New Blog Post",
  "content": "<h1>Introduction</h1><p>This is the content...</p>",
  "summary": "A brief summary of the post",
  "isPublished": true,
  "publishedAt": "2025-11-12T10:00:00Z",
  "tags": ["technology", "tutorial"]
}
```

**Notes:**
- `slug` is auto-generated from `title` if not provided
- `authorId` is extracted from JWT token
- `publishedAt` defaults to now if `isPublished=true`

### Update Blog (Auth Required)
```
PUT /api/blogs/{id}
```

**Request Body:**
```json
{
  "id": "existing-guid",
  "title": "Updated Title",
  "content": "<p>Updated content</p>",
  "isPublished": false,
  "tags": ["updated", "draft"]
}
```

### Delete Blog (Auth Required)
```
DELETE /api/blogs/{id}
```

**Response:** `204 No Content`

---

## Portfolio Endpoints

### Get All Portfolios (Auth Required)
```
GET /api/portfolios
```

**Response:**
```json
[
  {
    "id": "guid",
    "userId": "guid",
    "title": "John Doe - Software Engineer",
    "subtitle": "Full Stack Developer",
    "bio": "Passionate developer...",
    "template": "Modern",
    "isPublic": true,
    "featuredBlogsEnabled": true,
    "createdAt": "2025-11-12T10:00:00Z",
    "data": {
      "workExperiences": [...],
      "education": [...],
      "skills": [...],
      "projects": [...],
      "certifications": [...]
    }
  }
]
```

### Get Portfolio by ID (Auth Required)
```
GET /api/portfolios/{id}
```

### Get Portfolio by User ID (Auth Required)
```
GET /api/portfolios/user/{userId}
```

### Create Portfolio (Auth Required)
```
POST /api/portfolios
```

**Request Body:**
```json
{
  "title": "Jane Smith - UX Designer",
  "subtitle": "Creating Beautiful Experiences",
  "bio": "Award-winning designer with 7 years of experience",
  "template": "Minimalist",
  "isPublic": true,
  "featuredBlogsEnabled": true,
  "data": {
    "workExperiences": [
      {
        "company": "Tech Corp",
        "position": "Senior Designer",
        "startDate": "2020-01-01T00:00:00Z",
        "endDate": "2025-11-12T00:00:00Z",
        "description": "Led design team..."
      }
    ],
    "education": [
      {
        "institution": "Design University",
        "degree": "Bachelor of Fine Arts",
        "fieldOfStudy": "Graphic Design",
        "graduationDate": "2018-05-15T00:00:00Z"
      }
    ],
    "skills": [
      {
        "name": "Figma",
        "level": 95,
        "category": "Design Tools"
      }
    ],
    "projects": [
      {
        "name": "E-commerce Redesign",
        "description": "Complete UI/UX overhaul",
        "url": "https://example.com/project",
        "imageUrl": "https://example.com/image.jpg",
        "technologies": ["Figma", "Adobe XD"]
      }
    ],
    "certifications": [
      {
        "name": "UX Design Professional",
        "issuingOrganization": "Google",
        "issueDate": "2023-06-01T00:00:00Z"
      }
    ]
  }
}
```

**Template Options:**
- `Modern` - Clean, contemporary design
- `Classic` - Traditional layout
- `Minimalist` - Simplified aesthetic
- `Creative` - Bold and artistic

### Update Portfolio (Auth Required)
```
PUT /api/portfolios/{id}
```

### Import from LinkedIn (Auth Required)
```
POST /api/portfolios/import/linkedin
```

**Request Body:**
```json
{
  "userId": "guid",
  "linkedInData": {
    "profile_url": "https://linkedin.com/in/username",
    "headline": "Software Engineer at Tech Corp",
    "summary": "Experienced developer...",
    "experiences": [...],
    "education": [...],
    "skills": [...]
  }
}
```

### Import from Resume (Auth Required)
```
POST /api/portfolios/import/resume
```

**Request Body:**
```json
{
  "userId": "guid",
  "resumeData": {
    "parsed_text": "Full text of resume...",
    "contact_info": {...},
    "work_history": [...],
    "education": [...],
    "skills": [...]
  }
}
```

---

## Authentication Endpoints

### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "tenantId": "tenant-guid"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user-guid"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### OAuth Login
```
POST /api/auth/oauth
```

**Request Body:**
```json
{
  "provider": "LinkedIn",
  "code": "oauth-authorization-code",
  "redirectUri": "https://yourapp.com/callback",
  "tenantId": "tenant-guid"
}
```

**Supported Providers:**
- `LinkedIn`
- `Google`

**Response:** Same as `/login`

---

## Error Responses

### 400 Bad Request
```json
{
  "title": "One or more validation errors occurred",
  "status": 400,
  "errors": {
    "Email": ["Invalid email format"],
    "Password": ["Password must be at least 8 characters"]
  }
}
```

### 401 Unauthorized
```json
{
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "title": "Not Found",
  "status": 404,
  "detail": "Resource with ID 'guid' not found"
}
```

### 500 Internal Server Error
```json
{
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authenticated**: 500 requests per minute per user
- **Headers**:
  - `X-RateLimit-Limit`: Max requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## Pagination

List endpoints support pagination:

```
GET /api/blogs?page=1&pageSize=20
```

**Response Headers:**
- `X-Pagination-TotalCount`: Total items
- `X-Pagination-PageSize`: Items per page
- `X-Pagination-CurrentPage`: Current page
- `X-Pagination-TotalPages`: Total pages

---

## Event Publishing

The following actions publish events to Kafka:

| Action | Event Topic | Payload |
|--------|-------------|---------|
| Tenant Created | `tenant.created` | TenantDto |
| Blog Created | `blog.created` | BlogDto |
| Portfolio Generated | `portfolio.generated` | PortfolioDto |

Subscribe to these topics to integrate with other services.

---

## Postman Collection

Import the Postman collection for easy testing:

1. Download: `docs/Portfolio-CMS-API.postman_collection.json`
2. Import into Postman
3. Set environment variables:
   - `base_url`: `http://localhost:5000`
   - `tenant_id`: Your tenant GUID
   - `token`: JWT token from login

---

## Further Reading

- **Quickstart Guide**: `docs/Quickstart.md`
- **Architecture**: See README.md
- **Angular Integration**: `docs/Angular-Integration.md`
