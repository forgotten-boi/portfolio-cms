# 🔐 Authorization Inconsistencies - Analysis & Fix

**Date:** November 13, 2025  
**Status:** Identified & Fix Document Created  
**Severity:** Medium (Affects API Security)

---

## 📋 ISSUES IDENTIFIED

### Issue #1: Tenant Endpoints - No Authorization ❌

**Location:** `Endpoints.cs` - TenantEndpoints (Lines 13-42)

**Problem:**
```csharp
// ❌ NO AUTHORIZATION REQUIRED
var tenants = group.MapGroup("/tenants").WithTags("Tenants");

tenants.MapGet("/", ...)              // NO AUTH
tenants.MapGet("/{id:guid}", ...)     // NO AUTH
tenants.MapPost("/", ...)             // NO AUTH
tenants.MapPut("/{id:guid}", ...)     // NO AUTH
```

**Risk:** Admin-only operations are publicly accessible

**Expected:** All tenant operations should require authorization and admin role

---

### Issue #2: User Endpoints - Inconsistent Authorization ⚠️

**Location:** `Endpoints.cs` - UserEndpoints (Lines 44-82)

**Problem:**
```csharp
// ✓ GROUP HAS AUTHORIZATION
var users = group.MapGroup("/users").WithTags("Users").RequireAuthorization();

// BUT: No role-based checks
users.MapGet("/", ...)                // Auth required, but no role check
users.MapGet("/{id:guid}", ...)       // Auth required, but no role check
users.MapPost("/", ...)               // Auth required, but no role check
users.MapPut("/{id:guid}", ...)       // Auth required, but no role check
```

**Risk:** Any authenticated user can manage any tenant's users

**Expected:** Admin or tenant manager role required

---

### Issue #3: Blog Endpoints - Mixed Authorization 🔀

**Location:** `Endpoints.cs` - BlogEndpoints (Lines 102-170)

**Problem:**
```csharp
// ❌ INCONSISTENT AUTHORIZATION
blogs.MapGet("/", ...)                // NO AUTH (public listing allowed)
blogs.MapGet("/{id:guid}", ...)       // HAS AUTH (.RequireAuthorization() at line 121)
blogs.MapGet("/slug/{slug}", ...)     // NO AUTH (public slug access allowed)
blogs.MapPost("/", ...)               // HAS AUTH
blogs.MapPut("/{id:guid}", ...)       // HAS AUTH
blogs.MapDelete("/{id:guid}", ...)    // HAS AUTH
```

**Risk:** 
- Inconsistent behavior confuses API consumers
- Mixed auth requirements can lead to security gaps

**Expected:**
- GET / - Public (no auth)
- GET /id - Public or Owner (consistent check)
- GET /slug - Public (no auth)
- POST - Auth required + ownership check
- PUT - Auth required + ownership check
- DELETE - Auth required + ownership check

---

### Issue #4: Portfolio Endpoints - Missing Ownership Checks ❌

**Location:** `Endpoints.cs` - PortfolioEndpoints (Lines 172-232)

**Problem:**
```csharp
// ✓ ALL REQUIRE AUTH
var portfolios = group.MapGroup("/portfolios").WithTags("Portfolios").RequireAuthorization();

portfolios.MapGet("/", ...)            // Auth required ✓
portfolios.MapGet("/{id:guid}", ...)   // Auth required ✓
portfolios.MapPut("/{id:guid}", ...)   // Auth required ✓
// BUT: NO OWNERSHIP CHECKS

// ❌ MISSING: Check if user owns the portfolio before allowing update/delete
```

**Risk:** Users can modify/delete other users' portfolios

**Expected:** Ownership verification before update/delete operations

---

### Issue #5: Public Portfolio Endpoint - Hardcoded Tenant ID ⚠️

**Location:** Missing from provided code but referenced in documentation

**Problem:**
```csharp
// In blog endpoint (line 154):
var tenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
```

**Risk:**
- Only works for one hardcoded tenant
- Public endpoints not working for multi-tenant

**Expected:** Resolve tenant from subdomain/header

---

## 🔧 FIXES REQUIRED

### Fix #1: Secure Tenant Endpoints

```csharp
// BEFORE (❌ NO AUTHORIZATION)
var tenants = group.MapGroup("/tenants").WithTags("Tenants");

// AFTER (✅ ADMIN ONLY)
var tenants = group.MapGroup("/tenants")
    .WithTags("Tenants")
    .RequireAuthorization()
    .WithOpenApi()
    .WithDescription("Admin-only endpoints for tenant management");

// Each endpoint needs role-based authorization
tenants.MapGet("/", ...)
    .RequireAuthorization("AdminPolicy")
    .WithName("GetAllTenants")
    .WithDescription("Get all tenants (admin only)");

tenants.MapPost("/", ...)
    .RequireAuthorization("AdminPolicy")
    .WithName("CreateTenant")
    .WithDescription("Create new tenant (admin only)");
```

### Fix #2: Add Role-Based Checks to User Endpoints

```csharp
// Add to Program.cs (Authorization Policies)
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminPolicy", policy =>
        policy.RequireClaim("role", "Admin", "SystemAdmin"))
    .AddPolicy("TenantManagerPolicy", policy =>
        policy.RequireClaim("role", "Admin", "SystemAdmin", "TenantManager"))
    .AddPolicy("UserPolicy", policy =>
        policy.RequireClaim("role", "Admin", "SystemAdmin", "TenantManager", "User"));

// User endpoints
users.MapPost("/", async (...) => { ... })
    .RequireAuthorization("TenantManagerPolicy")
    .WithDescription("Create user (tenant manager+ only)");

users.MapDelete("/{id:guid}", async (...) => { ... })
    .RequireAuthorization("TenantManagerPolicy")
    .WithDescription("Delete user (tenant manager+ only)");
```

### Fix #3: Standardize Blog Authorization

```csharp
// BEFORE (❌ MIXED)
blogs.MapGet("/", ...)                // NO AUTH
blogs.MapGet("/{id:guid}", ...)       // HAS AUTH
blogs.MapGet("/slug/{slug}", ...)     // NO AUTH

// AFTER (✅ CONSISTENT)
// Public read endpoints - no auth
blogs.MapGet("/", ...)                // Public: all blogs in tenant
    .AllowAnonymous()
    .WithName("GetAllBlogs")
    .WithDescription("Get all published blogs (public)");

blogs.MapGet("/slug/{slug}", ...)     // Public: by slug
    .AllowAnonymous()
    .WithName("GetBlogBySlug")
    .WithDescription("Get published blog by slug (public)");

// Authenticated endpoints - with ownership check
blogs.MapGet("/{id:guid}", ...)       // Protected: full details
    .RequireAuthorization()
    .WithName("GetBlogById")
    .WithDescription("Get blog by ID (authenticated users only)");

blogs.MapPut("/{id:guid}", async (Guid id, UpdateBlogDto dto, HttpContext context, ...) =>
{
    // CHECK OWNERSHIP
    var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var blog = await blogRepository.GetByIdAsync(id);
    
    if (blog.AuthorId.ToString() != userId)
        return Results.Forbid();  // Not the owner
    
    // Proceed with update
    ...
})
.RequireAuthorization();
```

### Fix #4: Add Ownership Checks to Portfolio Endpoints

```csharp
// ADD OWNERSHIP VERIFICATION
portfolios.MapPut("/{id:guid}", async (Guid id, UpdatePortfolioDto dto, HttpContext context, ...) =>
{
    var tenantId = context.GetTenantId();
    var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
    if (tenantId == null || userId == null)
        return Results.Unauthorized();
    
    var portfolio = await portfolioRepository.GetByIdAsync(id, tenantId.Value);
    if (portfolio == null)
        return Results.NotFound();
    
    // ✓ OWNERSHIP CHECK
    if (portfolio.UserId.ToString() != userId)
        return Results.Forbid("You can only edit your own portfolio");
    
    var result = await handler.HandleAsync(new UpdatePortfolioCommand(id, tenantId.Value, dto));
    return Results.Ok(result);
})
.RequireAuthorization();

portfolios.MapDelete("/{id:guid}", async (Guid id, HttpContext context, ...) =>
{
    // Same ownership check
    ...
})
.RequireAuthorization();
```

### Fix #5: Dynamic Tenant Resolution for Public Endpoints

```csharp
// BEFORE (❌ HARDCODED)
var tenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

// AFTER (✅ DYNAMIC)
public static Guid? GetTenantIdFromRequest(HttpContext context)
{
    // Try header first
    if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantHeader))
        if (Guid.TryParse(tenantHeader.ToString(), out var tenantId))
            return tenantId;
    
    // Try subdomain
    var host = context.Request.Host.Host;
    if (host.Contains("."))
    {
        var subdomain = host.Split('.')[0];
        // Lookup tenant by subdomain
        // return await tenantRepository.GetBySubdomainAsync(subdomain);
    }
    
    return null; // Default behavior
}

// Usage
var tenantId = GetTenantIdFromRequest(context);
if (tenantId == null)
    return Results.BadRequest("Tenant ID required");
```

---

## 📋 SUMMARY OF CHANGES

| Endpoint | Issue | Fix |
|----------|-------|-----|
| `/tenants` (all) | No auth | Add `RequireAuthorization("AdminPolicy")` |
| `/users` (all) | No role check | Add `RequireAuthorization("TenantManagerPolicy")` |
| `/blogs/` GET | No auth | Keep `.AllowAnonymous()` |
| `/blogs/{id}` GET | Has auth | Add `@AllowAnonymous()` for public blogs OR add ownership check |
| `/blogs/{slug}` GET | No auth | Keep `.AllowAnonymous()` |
| `/blogs` POST/PUT/DELETE | Has auth | Add author ownership verification |
| `/portfolios` GET/POST | Has auth | ✓ OK but add ownership checks for PUT/DELETE |
| `/portfolios/{id}` PUT | Has auth | Add ownership verification |
| `/portfolios/{id}` DELETE | Missing | Add with ownership verification |

---

## 🎯 AUTHORIZATION POLICIES TO CREATE

Add to `Program.cs`:

```csharp
builder.Services.AddAuthorizationBuilder()
    // System-wide admin - can do everything
    .AddPolicy("AdminPolicy", policy =>
        policy.RequireClaim("role", "SystemAdmin", "Admin"))
    
    // Tenant manager - can manage tenant resources
    .AddPolicy("TenantManagerPolicy", policy =>
        policy.RequireClaim("role", "SystemAdmin", "Admin", "TenantManager"))
    
    // Regular user
    .AddPolicy("UserPolicy", policy =>
        policy.RequireClaim("role", "SystemAdmin", "Admin", "TenantManager", "User"))
    
    // Content creator - can create/edit own content
    .AddPolicy("CreatorPolicy", policy =>
        policy.RequireClaim("role", "SystemAdmin", "Admin", "TenantManager", "User", "Creator"));
```

---

## 🔒 SECURITY CHECKLIST

- [ ] All admin endpoints require `AdminPolicy`
- [ ] All tenant operations require tenant ID validation
- [ ] All user creation/modification requires `TenantManagerPolicy`
- [ ] All content modification requires ownership verification
- [ ] Public endpoints explicitly use `.AllowAnonymous()`
- [ ] Sensitive data filtered based on user role
- [ ] Audit logging for admin operations
- [ ] Rate limiting on authentication endpoints
- [ ] HTTPS enforced in production
- [ ] CORS properly configured

---

## 🧪 TESTING REQUIRED

1. **Anonymous Access Tests**
   - Public blog list: ✓ Should work
   - Public blog by slug: ✓ Should work
   - Admin endpoints: ✗ Should fail with 401

2. **Authenticated User Tests**
   - Edit own portfolio: ✓ Should work
   - Edit other's portfolio: ✗ Should fail with 403
   - Create blog: ✓ Should work
   - Edit own blog: ✓ Should work
   - Edit other's blog: ✗ Should fail with 403

3. **Admin Tests**
   - Manage tenants: ✓ Should work
   - Manage users: ✓ Should work
   - View all content: ✓ Should work

---

## 📊 IMPACT ANALYSIS

**Critical Issues:** 1 (Tenant endpoints completely unprotected)  
**High Issues:** 2 (User endpoints, Portfolio ownership)  
**Medium Issues:** 2 (Blog inconsistency, Hardcoded tenant)

**Recommended Action:** Fix all issues before production deployment

---

**Next Steps:** 
1. ✅ Issues documented (THIS FILE)
2. ⏳ Create development environment guide
3. ⏳ Fix endpoints with proper authorization
4. ⏳ Update docker-compose for development
5. ⏳ Test all authorization scenarios
