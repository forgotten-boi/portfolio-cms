# Portfolio CMS Application

> A full-stack portfolio and blog management system built with Angular 19 and .NET 10

## 🎯 Project Overview

Portfolio CMS is a comprehensive solution for managing personal portfolios and blogs. It features a modern Angular frontend with a sidebar navigation, dark/light theme support, multi-language support, rich text editing, and a robust .NET backend with Clean Architecture, containerized deployment with Docker.

---

## 📋 Quick Links

| Resource | Purpose |
|----------|---------|
| [📚 Complete Documentation](./COMPLETE_DOCUMENTATION.md) | Full project reference with architecture, API docs, troubleshooting |
| [🚀 Quick Start Guide](./QUICK_START.md) | 5-minute setup using Docker |
| [🐳 Docker Orchestration Guide](./DOCKER_ORCHESTRATION_GUIDE.md) | Advanced Docker/Aspire orchestration |
| [📝 Implementation Details](./README_IMPLEMENTATION.md) | Component-by-component implementation summary |

---

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### Deploy Immediately

```powershell
# Navigate to project directory
cd path/to/portfolio

# Run the deployment script
.\build-and-deploy.ps1

# Access the application
Start-Process "http://localhost:4200"
```

**Services will be available at:**
- 🌐 Frontend: http://localhost:4200
- 🔌 Backend API: http://localhost:8085/api
- 💾 Database: PostgreSQL on localhost:5432

### Check Service Status

```powershell
# View running containers
docker-compose ps

# View live logs from all services
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│           Frontend (Angular 19, Port 4200)          │
│  - Dashboard, Portfolio, Blog, Admin Management     │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Nginx Proxy       │
        │  (Reverse Proxy)    │
        └──────────┬──────────┘
                   │
┌──────────────────┼──────────────────┐
│                  │                  │
▼                  ▼                  ▼
Backend API     PostgreSQL         Kafka
(.NET 10)       (Port 5432)        Cluster
(Port 8085)
```

**Docker Services:**
1. **portfolio-backend-api** - .NET 10 API service (Clean Architecture)
2. **portfolio-frontend** - Angular 19 web app (Nginx served)
3. **postgres** - PostgreSQL 17 database
4. **kafka** - Message streaming (for analytics events)
5. **zookeeper** - Kafka coordination
6. **redis** - Caching layer (optional)

---

## 📊 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Angular | 19.0+ |
| | TypeScript | 5.6+ |
| | Quill | 2.0 (Rich Text Editor) |
| | SCSS | Modern variables/themes |
| **Backend** | .NET | 10.0 |
| | Entity Framework Core | 10.0 |
| | Clean Architecture | Applied |
| | MediatR | CQRS Pattern |
| **Database** | PostgreSQL | 17 |
| **Container** | Docker | Latest |
| | Docker Compose | Latest |
| | .NET Aspire | Orchestration |
| **Message Queue** | Kafka | 3.x |

---

## ✨ Features & Functionality

### 🔐 Authentication & Authorization

| Feature | Description |
|---------|-------------|
| **User Registration** | Sign up with email, name, password. Creates user + portfolio in one step |
| **User Login** | JWT-based login with access + refresh tokens |
| **Token Refresh** | Automatic token refresh for seamless session management |
| **Auth Guard** | Route protection — unauthenticated users are redirected to `/login` |
| **Role-Based Access** | `admin`, `user` roles with different capabilities |
| **Multi-Tenant** | Tenant isolation — each user belongs to a tenant |

**Login Flow:**
1. Navigate to `/login`
2. Enter email and password
3. JWT token stored in `localStorage`
4. Redirected to `/dashboard`

**Registration Flow:**
1. Navigate to `/register`
2. Fill in: Full Name, Email, Password, Confirm Password
3. Optionally enter Tenant ID (or new tenant is created)
4. On success → redirected to `/login`

---

### 🏠 Dashboard

The main dashboard (`/dashboard`) provides:
- Summary statistics: total portfolios, blogs, views
- Quick action cards for navigating to common tasks
- Recent activity overview

---

### ✍️ Blog Management

| Feature | Description |
|---------|-------------|
| **List My Blogs** | Shows all blogs belonging to the authenticated user |
| **Create Blog** | Rich-text editor (Quill 2.0) with title, summary, tags, slug |
| **Edit Blog** | Update existing blog content, metadata |
| **Delete Blog** | Confirmation dialog before deletion |
| **Publish/Unpublish** | Toggle blog visibility with a single click |
| **View Public Blog** | Direct link to public blog page (`/blog/:slug`) |
| **Copy Link** | One-click copy of the public blog URL |
| **Share on LinkedIn** | Share published blog to LinkedIn |
| **Share on Facebook** | Share published blog to Facebook |
| **Blog Status** | Visual badge: Published (green) / Draft (red) |

**Blog Create/Edit Flow:**
1. Navigate to `/dashboard/blogs`
2. Click "Create New Blog"
3. Fill in title, content (rich text), summary, tags
4. Optionally set a custom slug (auto-generated from title)
5. Save as draft or publish immediately

---

### 🗂️ Portfolio Management

| Feature | Description |
|---------|-------------|
| **List Portfolios** | View all portfolios with status indicators |
| **Create Portfolio** | Add name, description, skills, experience, links |
| **Edit Portfolio** | Update portfolio fields and metadata |
| **Delete Portfolio** | Remove portfolio with confirmation |
| **Public Portfolio** | Shareable portfolio page (`/portfolio/:slug`) |
| **Portfolio Form** | Multi-field form: bio, skills, projects, experience, education |

**Portfolio Create Flow:**
1. Navigate to `/dashboard/portfolios`
2. Click "Add Portfolio"
3. Fill: Title, Description, Tech Stack, GitHub URL, Live URL
4. Save → portfolio is visible at `/portfolio/:slug`

---

### 📄 CV Manager

The CV Manager (`/dashboard/cv-manager`) provides:
- Upload and manage CV/Resume files
- Generate CV from portfolio data
- Preview CV in the browser
- Download CV as PDF

---

### 📑 Resume Generator

The Resume Generator (`/dashboard/resume-generator`) provides:
- Generate a professional resume from your profile and portfolio data
- Multiple resume templates
- Download as HTML/PDF
- Customizable sections: Summary, Skills, Experience, Education, Projects

---

### 🎯 Job Matcher

The Job Matcher (`/dashboard/job-matcher`) provides:
- Paste a job description
- AI-powered matching against your skills and portfolio
- Match score percentage
- Gap analysis: Missing skills vs. your skills
- Suggestions for improvement

---

### 📊 Analytics

The Analytics page (`/dashboard/analytics`) provides:
- Blog post view counts over time
- Portfolio view tracking
- Top performing content
- Traffic sources

---

### ⚙️ Settings

The Settings page (`/dashboard/settings`) provides:
- **Theme**: Toggle between Light and Dark mode
- **Language**: Switch between English (EN), Spanish (ES), German (DE), Hindi (HI)
- **Profile**: Update display name, email, and bio
- **Password**: Change account password
- **Notifications**: Configure email notification preferences

---

### 👥 User Management (Admin)

| Feature | Description |
|---------|-------------|
| **List Users** | View all users in the system (admin only) |
| **Edit User** | Update user role and status |
| **Delete User** | Remove user account |
| **Role Assignment** | Assign `admin` or `user` role |

---

### 🏢 Tenant Management (Admin)

| Feature | Description |
|---------|-------------|
| **List Tenants** | View all registered tenants |
| **Create Tenant** | Add a new tenant |
| **Update Tenant** | Modify tenant name |

---

### 🌐 Public Pages

| Page | URL | Description |
|------|-----|-------------|
| **Public Portfolio** | `/portfolio/:slug` | View a user's public portfolio |
| **Public Blog** | `/blog/:slug` | Read a published blog post |

---

### 🎨 UI/UX Features

| Feature | Description |
|---------|-------------|
| **Sidebar Navigation** | Collapsible sidebar with icons and labels |
| **Topbar** | Shows current page, notifications, user menu |
| **Dark/Light Theme** | CSS variables-based theming, persisted in localStorage |
| **Multi-language** | EN/ES/DE/HI translations throughout the UI |
| **Responsive Design** | Works on mobile, tablet, and desktop |
| **CSS Variables** | Consistent theming with SCSS design tokens |
| **Loading States** | Spinners and skeleton loaders |
| **Error Handling** | User-friendly error messages |
| **Confirmation Dialogs** | Before destructive actions |

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register           Register new user
POST   /api/auth/login              Login user
POST   /api/auth/refresh-token      Refresh JWT token
POST   /api/auth/logout             Logout user
```

### Portfolio Management
```
GET    /api/portfolios              List all portfolios
GET    /api/portfolios/{id}         Get portfolio by ID
GET    /api/portfolios/slug/{slug}  Get portfolio by slug (public)
GET    /api/portfolios/user/{id}    Get portfolios by user
POST   /api/portfolios              Create new portfolio
PUT    /api/portfolios/{id}         Update portfolio
DELETE /api/portfolios/{id}         Delete portfolio
```

### Blog Management
```
GET    /api/blogs                   List all blog posts
GET    /api/blogs/my                Get current user's blogs
GET    /api/blogs/{id}              Get blog post by ID
GET    /api/blogs/slug/{slug}       Get blog by slug (public)
POST   /api/blogs                   Create new blog post
PUT    /api/blogs/{id}              Update blog post (publish/unpublish)
DELETE /api/blogs/{id}              Delete blog post
```

### User Management
```
GET    /api/users                   List all users (admin only)
GET    /api/users/{id}              Get user by ID
PUT    /api/users/{id}              Update user
DELETE /api/users/{id}              Delete user
```

### Tenant Management
```
GET    /api/tenants                 List all tenants (admin)
POST   /api/tenants                 Create new tenant
PUT    /api/tenants/{id}            Update tenant
DELETE /api/tenants/{id}            Delete tenant
```

For complete API documentation with request/response examples, see [COMPLETE_DOCUMENTATION.md](./COMPLETE_DOCUMENTATION.md).

---

## 🎨 Frontend Routes

| Route | Component | Auth Required | Purpose |
|-------|-----------|--------------|---------|
| `/login` | LoginComponent | No | User login |
| `/register` | RegistrationComponent | No | User registration |
| `/dashboard` | DashboardComponent | Yes | Main dashboard |
| `/dashboard/blogs` | BlogsComponent | Yes | List & manage blogs |
| `/dashboard/blogs/new` | BlogFormComponent | Yes | Create new blog |
| `/dashboard/blogs/edit/:id` | BlogFormComponent | Yes | Edit existing blog |
| `/dashboard/portfolios` | PortfoliosComponent | Yes | List & manage portfolios |
| `/dashboard/portfolios/new` | PortfolioFormComponent | Yes | Create new portfolio |
| `/dashboard/portfolios/edit/:id` | PortfolioFormComponent | Yes | Edit existing portfolio |
| `/dashboard/cv-manager` | CvManagerComponent | Yes | CV management |
| `/dashboard/resume-generator` | ResumeGeneratorComponent | Yes | Resume generation |
| `/dashboard/job-matcher` | JobMatcherComponent | Yes | Job description matching |
| `/dashboard/analytics` | AnalyticsComponent | Yes | View analytics |
| `/dashboard/settings` | SettingsComponent | Yes | App settings & preferences |
| `/dashboard/users` | UsersComponent | Yes (admin) | Manage users |
| `/dashboard/tenants` | TenantsComponent | Yes (admin) | Manage tenants |
| `/portfolio/:slug` | PublicPortfolioComponent | No | Public portfolio view |
| `/blog/:slug` | PublicBlogComponent | No | Public blog view |

---

## 🗄️ Database Schema

**Core Tables:**
- `users` - User accounts, hashed passwords, roles, tenant reference
- `tenants` - Multi-tenant organization records
- `portfolios` - Portfolio entries (title, bio, skills, links)
- `portfolio_items` - Individual portfolio projects/experience entries
- `blogs` - Blog posts (title, content, slug, isPublished, views)
- `blog_categories` - Blog post categorization tags

Full schema with SQL: See [COMPLETE_DOCUMENTATION.md](./COMPLETE_DOCUMENTATION.md)

---

## 🧪 Testing

### Run Tests

```bash
# Frontend unit tests
cd portfolio-cms-web
npm test

# Backend tests
cd portfolio.api
dotnet test

# E2E Tests
cd e2e
npm install
npx playwright test
```

### E2E Test Specs
- `e2e/basic-verification.spec.ts` - Login, registration, navigation checks
- `e2e/complete-flow.spec.ts` - Full user flow: register → login → create portfolio → create blog
- `e2e/portfolio-creation.spec.ts` - Portfolio CRUD flow

---

## 🛠️ Build & Deploy

### Docker Deployment (Recommended)

```powershell
# Full deployment
.\build-and-deploy.ps1

# With verbose output for debugging
.\build-and-deploy.ps1 -Verbose

# Skip compilation, redeploy with existing images
.\build-and-deploy.ps1 -SkipBuild

# Status check only (no deploy)
.\build-and-deploy.ps1 -StatusOnly

# Clean containers
.\build-and-deploy.ps1 -CleanOnly
```

### Manual Development Build

```bash
# Frontend
cd portfolio-cms-web
npm install
npm start           # Dev server on http://localhost:4200
npm run build       # Production build

# Backend
cd portfolio.api
dotnet restore
dotnet run --project src/Portfolio.Api/Portfolio.Api.csproj  # API on http://localhost:8085
```

---

## 🧠 .NET Aspire Orchestration

Use the Aspire orchestration host to start all services with a single command:

```powershell
cd portfolio.api
dotnet run --project .\src\Portfolio.AppHost\Portfolio.AppHost.csproj
```

**What starts:**
| Resource | Access |
|----------|--------|
| Portfolio API | http://localhost:8085 |
| Angular Frontend | http://localhost:4200 |
| PostgreSQL | localhost:5432 |
| pgAdmin | http://localhost:5050 |
| Kafka + Zookeeper | kafka:9092 (optional) |

**Environment variables:**
- `USE_MOCKS=true` — Skip Kafka/Zookeeper, use in-memory bus
- `REBUILD_FRONTEND=true` — Force frontend Docker image rebuild

For more details, see [DOCKER_ORCHESTRATION_GUIDE.md](./DOCKER_ORCHESTRATION_GUIDE.md).

---

## 📋 Project Structure

```
portfolio/
├── portfolio-cms-web/           # Angular 19 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # All Angular components
│   │   │   │   ├── analytics/   # Analytics dashboard
│   │   │   │   ├── blog-form/   # Blog create/edit (Quill)
│   │   │   │   ├── blogs/       # Blog list management
│   │   │   │   ├── cv-manager/  # CV/Resume management
│   │   │   │   ├── dashboard/   # Main dashboard
│   │   │   │   ├── job-matcher/ # Job description matcher
│   │   │   │   ├── login/       # Login page
│   │   │   │   ├── navbar/      # Top navigation bar
│   │   │   │   ├── portfolio-form/ # Portfolio create/edit
│   │   │   │   ├── portfolios/  # Portfolio list
│   │   │   │   ├── public-blog/ # Public blog view
│   │   │   │   ├── public-portfolio/ # Public portfolio view
│   │   │   │   ├── registration/ # Registration page
│   │   │   │   ├── resume-generator/ # Resume generator
│   │   │   │   ├── settings/    # App settings
│   │   │   │   ├── sidebar/     # Collapsible sidebar nav
│   │   │   │   ├── tenants/     # Tenant management
│   │   │   │   ├── topbar/      # Top bar with user menu
│   │   │   │   └── users/       # User management
│   │   │   ├── guards/          # Auth guard
│   │   │   ├── models/          # TypeScript interfaces
│   │   │   ├── pipes/           # translate pipe
│   │   │   ├── services/        # HTTP services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── blog.service.ts
│   │   │   │   ├── portfolio.service.ts
│   │   │   │   ├── settings.service.ts
│   │   │   │   ├── theme.service.ts
│   │   │   │   └── translation.service.ts
│   │   │   ├── app.component.*  # Root component
│   │   │   ├── app.config.*     # App config (SSR/CSR)
│   │   │   └── app.routes.ts    # Route definitions
│   │   ├── environments/        # Dev/Prod configs
│   │   └── styles.scss          # Global styles + CSS variables
│   ├── Dockerfile
│   └── package.json
│
├── portfolio.api/               # .NET 10 Backend (Clean Architecture)
│   └── src/
│       ├── Portfolio.Api/       # Entry point, endpoints, middleware
│       ├── Portfolio.Application/ # CQRS commands, queries, handlers, DTOs
│       ├── Portfolio.Domain/    # Entities, value objects
│       ├── Portfolio.Infrastructure/ # EF Core, repositories, DB
│       ├── Portfolio.AppHost/   # .NET Aspire orchestration host
│       └── Portfolio.ServiceDefaults/ # Shared Aspire defaults
│
├── Portfolio.Api.Tests/         # Unit & integration tests
├── e2e/                         # Playwright E2E tests
├── init-scripts/                # DB initialization SQL
├── docker-compose.yml           # Production orchestration
├── docker-compose.dev.yml       # Development orchestration
├── build-and-deploy.ps1         # Standard deployment script
├── build-and-deploy-enhanced.ps1 # Enhanced deployment script
├── orchestrate.ps1              # Manual orchestration helper
└── README.md                    # This file
```

---

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full system access: manage all users, tenants, portfolios, blogs |
| **User** | Own content: create/edit own portfolios and blogs, view analytics |
| **Viewer** | Public only: view public portfolios and blog posts |

---

## 🐛 Known Issues & Flags

1. **`blogs.component.ts` uses `getMyBlogs()`** — calls `GET /api/blogs/my` which requires the user's author information to be properly set in the blog record. Verify that blog creation sets `authorId` from the JWT token.

2. **Kafka is optional** — The app runs without Kafka using in-memory message bus (`USE_MOCKS=true`). Analytics events may not persist if Kafka is not running.

3. **CV Manager** — The CV file upload feature requires proper server-side storage configuration. Verify the upload path in `appsettings.json`.

4. **Job Matcher & Resume Generator** — These features use AI/LLM integration which may require an API key configured in the backend. Check `appsettings.json` for `AiSettings:ApiKey`.

---

## 🔒 Security

- Passwords hashed with BCrypt
- JWT tokens with expiry and refresh
- CORS configured for frontend origin only
- Input validation on all API endpoints
- SQL injection prevention via EF Core parameterized queries
- Auth guard on all authenticated routes

---

## 🐛 Troubleshooting

**Port Already in Use**
```powershell
Get-NetTCPConnection -LocalPort 4200
Stop-Process -Id <PID> -Force
```

**Docker Build Failures**
```powershell
docker system prune -a
.\build-and-deploy.ps1
```

**Services Not Starting**
```powershell
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose restart
```

**Database Connection Issues**
```powershell
docker-compose ps postgres
# Default connection: Server=postgres;Port=5432;Database=portfolio;Username=postgres;Password=postgres
```

**Login / Registration Issues**
- Ensure the backend API is running on port 8085
- Check the browser console for CORS errors
- Verify `environment.ts` has correct `apiUrl`

For more troubleshooting, see [COMPLETE_DOCUMENTATION.md](./COMPLETE_DOCUMENTATION.md).

---

## 📝 License

This project is proprietary and confidential.
