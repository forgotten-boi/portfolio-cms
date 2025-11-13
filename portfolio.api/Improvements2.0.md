# Portfolio Web App – Requirements (Updated)

## 1. Overview

This project is a **portfolio CMS** with multi-tenant, event-driven architecture.  
It allows users to generate a portfolio from their resume or LinkedIn profile, maintain blogs, and share their portfolio and blogs publicly.  

**Key technologies:**
- Backend: .NET 10 Minimal API, Clean Architecture, EF Core/Postgres  
- Frontend: Angular (SPA, future support for Blazor optional)  
- Message bus: Kafka or Azure Service Bus  
- Authentication: LinkedIn, Gmail, username/password  
- DevOps: Docker Compose, Kubernetes-ready, Azure DevOps CI/CD  
- Testing: Playwright for E2E, xUnit + Moq for unit tests  
- Multi-tenant support  

---
Further Improvements. Ensure the following features are implemented:
## 2. User Roles & Flow

### User
1. **Registration**  
   - Registers via Registration page → default role `Member`  
   - Email verification / optional 2FA placeholder  
   - Password reset / forgot password flow placeholder
2. **Portfolio Generation**  
   - Upload PDF or provide LinkedIn URL  
   - Backend reads text from PDF / LinkedIn, saves relevant fields to database  
   - Backend applies one of **five HTML templates** (stored in `templates/`) to generate portfolio page  
   - Public URL: `/portfolio/{user-name}`  
   - Conflict handling for duplicate slugs  
   - Draft vs Published flag for portfolio (future Admin approval)  
   - User can preview templates and select design after login  
   - PDF/LinkedIn integration **placeholder** for Perplexity API / Gemini API
3. **Profile Updates**  
   - Login → update resume details → reflected in portfolio  
   - Generate a new resume PDF based on saved data + optional job description (via Perplexity/Gemini)  
   - Versioning / edit history stored for audits
4. **Blog Management**  
   - Create/Edit blogs with title, WYSIWYG content, header image  
   - Draft vs Published flag  
   - Public URLs for each blog: `/blogs/{slug}`  
   - Conflict handling for duplicate slugs  
   - Share blog/portfolio via popular social media  
5. **Optional Future Features**  
   - Admin approval workflow for portfolio publication  
   - Portfolio export / PDF generation  

### Admin
1. **Admin Login**  
   - Email verification / 2FA placeholder(Optional)  
2. **Manage Users & Roles**  
   - One Admin can create other Admins  
   - View all users, blogs, portfolios  
3. **Editorials**  
   - Create blog posts visible to all users  
4. **Future Features**  
   - Approval workflow for portfolios  
   - Audit and version tracking  

---

## 3. Domain Model

### Entities
- **User**
  - Id, Name, Email, RoleId, PasswordHash, CreatedAt, UpdatedAt
- **Role**
  - Admin, Member, Guest
- **Portfolio**
  - Id, OwnerId, Title, Summary, Experience[], Education[], Skills[], PublicUrl, TemplateId, Draft/Published, CreatedAt, UpdatedAt, VersionHistory[]
- **BlogPost**
  - Id, OwnerId, Title, Content, HeaderImageUrl, PublicUrl, Draft/Published, CreatedAt, UpdatedAt, VersionHistory[]
- **Domain Events**
  - UserRegisteredEvent, PortfolioGeneratedEvent, PortfolioUpdatedEvent, BlogPostCreatedEvent, BlogPostUpdatedEvent
  - Event consumers placeholders: notifications, analytics, indexing

---

## 4. Application Layer

### Commands
- `RegisterUserCommand` → default Member role, triggers UserRegisteredEvent  
- `GeneratePortfolioCommand` → upload PDF / LinkedIn → create portfolio, triggers PortfolioGeneratedEvent  
- `UpdatePortfolioCommand` → owner-only, triggers PortfolioUpdatedEvent  
- `CreateBlogPostCommand`, `UpdateBlogPostCommand` → triggers BlogPost events  
- `AssignRoleCommand` → admin only  
- `CreateAdminUserCommand` → only one admin can create another  

### Queries
- `GetUserByIdQuery`  
- `GetAllUsersQuery` → Admin only  
- `GetPortfolioByIdQuery` → owner view  
- `GetPortfolioPublicQuery` → public view  
- `GetBlogPostByIdQuery`, `GetBlogPostPublicQuery`  

### DTOs
- PortfolioDTO, BlogPostDTO, UserDTO  
- Include `Editable` flags for frontend  
- Include `Draft` / `Published` flags  

---

## 5. Infrastructure Layer

- **EF Core tables:** Users, Roles, Portfolios, BlogPosts, UserRoles, VersionHistory  
- **Storage:** Blob storage for PDF resume and blog header images  
- **Kafka / Azure Service Bus:** publish domain events; placeholders for consumers (notifications, analytics)  
- **PDF / LinkedIn integration:** placeholder for Perplexity API / Gemini API keys in `appsettings.json`  
- **Slug uniqueness & conflict resolution**  

---

## 6. API Layer Endpoints

### User
- `POST /api/register` → create user  
- `POST /api/portfolios/generate` → upload PDF / LinkedIn → generate portfolio  
- `PUT /api/portfolios/{id}` → edit portfolio (owner only)  
- `GET /api/portfolios/{id}` → owner view  
- `GET /portfolio/{slug}` → public view  
- `POST /api/blogs` → create blog  
- `PUT /api/blogs/{id}` → update blog (owner only)  
- `GET /blogs/{slug}` → public view  

### Admin
- `GET /api/users` → list all users  
- `POST /api/users/admin` → create admin (admin only)  
- `GET /api/blogs/editorials` → view editorial blogs  
- `POST /api/blogs/editorials` → create editorial  

---

## 7. Frontend (Angular)

- Registration / Login pages  
- Portfolio preview & template selection  
- Portfolio editor page (update resume fields)  
- Blog editor with WYSIWYG & header image  
- Public pages: `/portfolio/{slug}`, `/blogs/{slug}`  
- Conditional rendering based on user role  
- Display draft vs published status  
- Display version history for edits  

---

--- For Frontend and backend ensure the following: ---
- Events for registration & roles
- UserRegisteredEvent, AdminCreatedEvent, RoleAssignedEvent placeholders exist, but event consumers (notifications/analytics) are not fully defined.
- Quickstart & API docs
- Endpoints are defined, but explicit examples for role-based access (e.g., JWT claim usage) are not fully in Quickstart.
- Tenant-based filtering in queries & UI
- Mentioned, but implementation instructions are placeholders. Need clear query patterns and UI guidance for optional TenantId.
- .env / configuration per tenant
- Optional notes exist, but no sample .env or environment config examples included.

## 8. Docker & DevOps

- **Docker Compose:**  
  - Backend, Frontend, Postgres, Kafka / Azure Bus  
  - Placeholder for Playwright test container  
- **Future separation:** Portfolio module can be moved to separate container  
- **CI/CD:** Azure DevOps pipeline → build, test, deploy to Kubernetes (AKS or other cloud)  
- **Secrets management:** move Perplexity/Gemini keys to Azure Secrets  

---

## 9. Testing

- Unit tests: xUnit + Moq  
- Integration tests: backend endpoints  
- End-to-End: Playwright verifying:
  - Registration flow → Member role  
  - Portfolio creation from PDF / LinkedIn  
  - Draft vs Published portfolio/blog behavior  
  - Public URLs access  
  - Blog creation / edit / public access  
  - Admin-only actions  
  - Event consumers placeholders  

---

## 10. Include this after completion of previous steps Flow Items

- Admin approval workflow for portfolio  
- Password reset / forgot password  
- Email verification / optional 2FA  
- Multi-tenant isolation enforcement  
- Versioning / edit history  
- Slug collision handling  
- Event consumers for notifications / analytics  
- PDF parsing error handling / fallback  
- Monitoring & logging for production readiness  
- Token expiry / refresh for JWT  

---

## 11. PDF / LinkedIn Integration Placeholder

- User uploads PDF or provides LinkedIn URL  
- **Placeholder in `appsettings.json`** for keys and config  of Perplexity API or Gemini API
- Use Perplexity API or Gemini API to parse PDFs or LinkedIn data if  API keys are provided and store in `Portfolios` table
- IF Perplexity or Gemini API is not available Backend should extract relevant texts from document or linkedin(if possible) and store in `Portfolios` table. If it cannot, put random texts as placeholder until integration is done.  

---

## 12. HTML Templates

- 5 pre-generated HTML templates in `/templates/` folder  for Portfolio
- User selects template after login  
- Templates use portfolio data to render public page  
- Screenshots available to user in frontend template selector  
- User can regenerate portfolio anytime with updated data  


---

## 13. Public URL Flow

- Portfolio: `/portfolio/{user-name}`  
- Blog: `/blogs/{slug}`  
- Owner sees edit buttons; public users see view-only  
- Share buttons for social media  

---

## 14. Quickstart & Notes

1. Clone repo  
2. Update `appsettings.json` with DB, Kafka/Service Bus, Perplexity/Gemini keys  
3. Run `docker-compose up` to start backend + frontend + Postgres + Kafka  
4. Run Playwright tests: `npx playwright test`  
5. Access frontend → register → upload PDF / LinkedIn → preview portfolio  

Run End to End testing using playwright to ensure the flow works as expected.
---

**End of Requirements.md**
