# Feature: User Registration, Roles, and Admin Controls

**Context:**  
We have an existing Login page and a common `docker-compose` setup with separate backend and frontend containers. We are using:

Update backend to dotnet 10. 

**Updates:**

1. **Registration Page**  
   - Create a new Registration page from the existing Login page.  
   - Collect username, email, password, profile photo and optional profile fields.  
   - New users registering through this page automatically get the role `Member`.

2. **Roles Management**  
   - Create a Role page listing all roles.  
   - Define three default roles: `Admin`, `Member`, `Guest`.  
   - Only `Admin` users can create new `Admin` users.  
   - Assign roles to users in the database and enforce in backend authorization logic.

3. **Admin User Features**  
   - Admin can view a list of all registered users and their data.  
   - Admin can view all Blogs by users.  
   - Only one Admin can create another Admin.  
   - Restrict access appropriately using role-based authorization in backend API.  

4. **Database & Backend**  
   - Create necessary tables/entities for `Roles` and `UserRoles` (many-to-many if needed).  
   - Backend endpoints for registration, role assignment, user listing, and blog access.  
   - Enforce role checks in API endpoints.  

5. **Frontend**  
   - Angular pages/components for Registration, Login, Role Management, User List, Blog view.  
   - Show/hide UI elements based on user role.  

6. **Testing**  
   - Use Playwright to verify registration, login, role assignment, and admin restrictions.  
   - Run tests against the backend and frontend running in Docker containers from your common `docker-compose`.

7. **Docker Guidance**  
   - Evaluate whether to use one Docker container for backend + frontend or separate containers.  
   - Provide recommendation based on industry best practices and microservices standards.  

**Deliverables:**  
- Fully implemented registration page and role system.  
- Backend endpoints with role-based security.  
- Angular frontend pages for Registration, Roles, Users, and Blogs.  
- Playwright end-to-end tests verifying roles and permissions.  
- Updated `docker-compose.yml` configuration with recommended container separation.  
- Documentation of design choices for role management and Docker setup.

**Constraints:**  
- Follow Clean Architecture and CQRS (custom) conventions.  
- Use .NET 10, EF Core, Angular 18+, Docker-compose.  
- Ensure multi-tenant support is preserved.  But on login page, TenantId is optional. If user doesn't put it, we assume a default tenant.

Further Details of Implementation:

1. Add to Domain Layer

Entities: Role, UserRole (join table if many-to-many).

Default Roles: Admin, Member, Guest.

Events: UserRegisteredEvent, AdminCreatedEvent, RoleAssignedEvent.

2. Application Layer

Commands:

RegisterUserCommand → assigns Member role by default.

CreateAdminUserCommand → only allowed if current user is Admin.

AssignRoleCommand → restricted to Admin.

Queries:

GetAllUsersQuery → returns users + roles + blogs (Admin only).

GetUserBlogsQuery.

3. Infrastructure

EF Core:

Roles table, UserRoles table (many-to-many).

Enforce role constraints (e.g., one Admin can create another Admin).

Seeding: Default roles inserted on startup.

4. API Layer

Endpoints:

POST /api/register → registers user, assigns Member.

GET /api/roles → lists roles.

POST /api/users/admin → create admin (Admin only).

GET /api/users → list all users + blogs (Admin only).

5. Frontend (Angular)

Registration Page → derived from login page.

Role Page → displays all roles; only visible to Admin.

User List Page → Admin-only, shows all users and their blogs.

Blog links on user profile → conditional on user preference.

Hide/show components based on user role (JWT claim).

6. Testing (Playwright)

Verify registration flow assigns Member.

Admin can create other Admins (only 1 Admin can create another).

Non-admin cannot access Admin-only pages.

Validate blog listing per user.

Run tests against Docker Compose stack.

7. Docker Guidance

Recommendation: Keep backend and frontend in separate containers (industry best practice).

Common docker-compose.yml orchestrates both + Postgres + Kafka.

Optional: Use an additional container for tests (Playwright) to run against stack.

8. Instructions Integration

Add these sections under “User Registration & Roles” in your main Markdown instructions.

Update Quickstart & API docs with new endpoints and role-based access examples.

Ensure multi-tenant logic is applied in backend queries and UI.


(Optional) Provide sample .env configurations for different tenants.
(Optional) Update Instructions.md file with all the new changes. 