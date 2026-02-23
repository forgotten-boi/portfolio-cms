using Portfolio.Api.Middleware;
using Portfolio.Application.Commands;
using Portfolio.Application.DTOs;
using Portfolio.Application.Handlers;
using Portfolio.Application.Interfaces;
using Portfolio.Application.Queries;
using System.IdentityModel.Tokens.Jwt;

namespace Portfolio.Api.Endpoints;

public static class TenantEndpoints
{
    public static RouteGroupBuilder MapTenantEndpoints(this RouteGroupBuilder group)
    {
        var tenants = group.MapGroup("/tenants").WithTags("Tenants");

        tenants.MapGet("/", async (IQueryHandler<GetAllTenantsQuery, IEnumerable<TenantDto>> handler) =>
        {
            var result = await handler.HandleAsync(new GetAllTenantsQuery());
            return Results.Ok(result);
        });

        tenants.MapGet("/{id:guid}", async (Guid id, IQueryHandler<GetTenantByIdQuery, TenantDto?> handler) =>
        {
            var result = await handler.HandleAsync(new GetTenantByIdQuery(id));
            return result != null ? Results.Ok(result) : Results.NotFound();
        });

        tenants.MapGet("/subdomain/{subdomain}", async (string subdomain, IQueryHandler<GetTenantBySubdomainQuery, TenantDto?> handler) =>
        {
            var result = await handler.HandleAsync(new GetTenantBySubdomainQuery(subdomain));
            return result != null ? Results.Ok(result) : Results.NotFound();
        });

        tenants.MapPost("/", async (CreateTenantDto dto, ICommandHandler<CreateTenantCommand, TenantDto> handler) =>
        {
            var result = await handler.HandleAsync(new CreateTenantCommand(dto));
            return Results.Created($"/api/tenants/{result.Id}", result);
        });

        tenants.MapPut("/{id:guid}", async (Guid id, UpdateTenantDto dto, ICommandHandler<UpdateTenantCommand, TenantDto> handler) =>
        {
            var result = await handler.HandleAsync(new UpdateTenantCommand(id, dto));
            return Results.Ok(result);
        });

        return group;
    }
}

public static class UserEndpoints
{
    public static RouteGroupBuilder MapUserEndpoints(this RouteGroupBuilder group)
    {
        var users = group.MapGroup("/users").WithTags("Users").RequireAuthorization();

        users.MapGet("/", async (HttpContext context, IQueryHandler<GetUsersByTenantQuery, IEnumerable<UserDto>> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new GetUsersByTenantQuery(tenantId.Value));
            return Results.Ok(result);
        });

        users.MapGet("/{id:guid}", async (Guid id, HttpContext context, IQueryHandler<GetUserByIdQuery, UserDto?> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new GetUserByIdQuery(id, tenantId.Value));
            return result != null ? Results.Ok(result) : Results.NotFound();
        });

        users.MapPost("/", async (CreateUserDto dto, HttpContext context, ICommandHandler<CreateUserCommand, UserDto> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new CreateUserCommand(tenantId.Value, dto));
            return Results.Created($"/api/users/{result.Id}", result);
        });

        users.MapPut("/{id:guid}", async (Guid id, UpdateUserDto dto, HttpContext context, ICommandHandler<UpdateUserCommand, UserDto> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new UpdateUserCommand(id, tenantId.Value, dto));
            return Results.Ok(result);
        });

        return group;
    }
}

public static class BlogEndpoints
{
    public static RouteGroupBuilder MapBlogEndpoints(this RouteGroupBuilder group)
    {
        var blogs = group.MapGroup("/blogs").WithTags("Blogs");

        blogs.MapGet("/", async (HttpContext context, bool? publishedOnly, IQueryHandler<GetBlogsByTenantQuery, IEnumerable<BlogDto>> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new GetBlogsByTenantQuery(tenantId.Value, publishedOnly ?? false));
            return Results.Ok(result);
        });

        blogs.MapGet("/my", async (HttpContext context, IQueryHandler<GetBlogsByAuthorQuery, IEnumerable<BlogDto>> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null || !Guid.TryParse(userId, out var authorId))
                return Results.Unauthorized();

            var result = await handler.HandleAsync(new GetBlogsByAuthorQuery(authorId, tenantId.Value));
            return Results.Ok(result);
        }).RequireAuthorization();

        blogs.MapGet("/{id:guid}", async (Guid id, HttpContext context, IQueryHandler<GetBlogByIdQuery, BlogDto?> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new GetBlogByIdQuery(id, tenantId.Value));
            return result != null ? Results.Ok(result) : Results.NotFound();
        }).RequireAuthorization();

        blogs.MapGet("/slug/{slug}", async (string slug, HttpContext context, IQueryHandler<GetBlogBySlugQuery, BlogDto?> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new GetBlogBySlugQuery(slug, tenantId.Value));
            return result != null ? Results.Ok(result) : Results.NotFound();
        });

        blogs.MapPost("/", async (CreateBlogDto dto, HttpContext context, ICommandHandler<CreateBlogCommand, BlogDto> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null || !Guid.TryParse(userId, out var authorId))
                return Results.Unauthorized();

            var result = await handler.HandleAsync(new CreateBlogCommand(tenantId.Value, authorId, dto));
            return Results.Created($"/api/blogs/{result.Id}", result);
        }).RequireAuthorization();

        blogs.MapPut("/{id:guid}", async (Guid id, UpdateBlogDto dto, HttpContext context, ICommandHandler<UpdateBlogCommand, BlogDto> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new UpdateBlogCommand(id, tenantId.Value, dto));
            return Results.Ok(result);
        }).RequireAuthorization();

        blogs.MapDelete("/{id:guid}", async (Guid id, HttpContext context, ICommandHandler<DeleteBlogCommand, bool> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            await handler.HandleAsync(new DeleteBlogCommand(id, tenantId.Value));
            return Results.NoContent();
        }).RequireAuthorization();

        // Public blog endpoint (no auth required)
        group.MapGet("/blogs/{slug}", async (string slug, IBlogRepository blogRepo) =>
        {
            // Default to first tenant for public access
            var tenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
            var blog = await blogRepo.GetBySlugAsync(slug, tenantId);
            
            if (blog == null || !blog.IsPublished)
                return Results.NotFound();

            var blogDto = new BlogDto
            {
                Id = blog.Id,
                TenantId = blog.TenantId,
                AuthorId = blog.AuthorId,
                Title = blog.Title,
                Slug = blog.Slug,
                Content = blog.Content,
                Summary = blog.Summary,
                HeaderImageUrl = blog.HeaderImageUrl,
                IsPublished = blog.IsPublished,
                PublishedAt = blog.PublishedAt,
                CreatedAt = blog.CreatedAt,
                UpdatedAt = blog.UpdatedAt,
                ViewCount = blog.ViewCount,
                Tags = blog.Tags.ToList()
            };

            return Results.Ok(blogDto);
        })
        .WithName("GetPublicBlog")
        .WithDescription("Get published blog by slug (no authentication required)")
        .AllowAnonymous();

        return group;
    }
}

public static class PortfolioEndpoints
{
    public static RouteGroupBuilder MapPortfolioEndpoints(this RouteGroupBuilder group)
    {
        var portfolios = group.MapGroup("/portfolios").WithTags("Portfolios").RequireAuthorization();

        portfolios.MapGet("/", async (HttpContext context, IQueryHandler<GetPortfoliosByTenantQuery, IEnumerable<PortfolioDto>> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new GetPortfoliosByTenantQuery(tenantId.Value));
            return Results.Ok(result);
        });

        portfolios.MapGet("/{id:guid}", async (Guid id, HttpContext context, IQueryHandler<GetPortfolioByIdQuery, PortfolioDto?> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new GetPortfolioByIdQuery(id, tenantId.Value));
            return result != null ? Results.Ok(result) : Results.NotFound();
        });

        portfolios.MapGet("/user/{userId:guid}", async (Guid userId, HttpContext context, IQueryHandler<GetPortfolioByUserIdQuery, PortfolioDto?> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new GetPortfolioByUserIdQuery(userId, tenantId.Value));
            return result != null ? Results.Ok(result) : Results.NotFound();
        });

        portfolios.MapPost("/", async (CreatePortfolioDto dto, HttpContext context, ICommandHandler<CreatePortfolioCommand, PortfolioDto> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null || !Guid.TryParse(userId, out var parsedUserId))
                return Results.Unauthorized();

            var result = await handler.HandleAsync(new CreatePortfolioCommand(tenantId.Value, parsedUserId, dto));
            return Results.Created($"/api/portfolios/{result.Id}", result);
        });

        portfolios.MapPost("/generate", async (GeneratePortfolioDto dto, HttpContext context, ICommandHandler<GeneratePortfolioCommand, PortfolioDto> handler) =>
        {
            var tenantId = context.GetTenantId() ?? Guid.Parse("00000000-0000-0000-0000-000000000001");
            
            var userIdClaim = context.User.FindFirst(JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return Results.Unauthorized();

            try
            {
                var result = await handler.HandleAsync(new GeneratePortfolioCommand(userId, tenantId, dto));
                return Results.Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("GeneratePortfolio")
        .WithDescription("Generate portfolio from PDF resume or LinkedIn URL")
        .Produces<PortfolioDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        portfolios.MapPut("/{id:guid}", async (Guid id, UpdatePortfolioDto dto, HttpContext context, ICommandHandler<UpdatePortfolioCommand, PortfolioDto> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var result = await handler.HandleAsync(new UpdatePortfolioCommand(id, tenantId.Value, dto));
            return Results.Ok(result);
        });

        portfolios.MapPost("/import/linkedin", async (ImportLinkedInDto dto, HttpContext context, ICommandHandler<ImportLinkedInCommand, PortfolioDto> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null || !Guid.TryParse(userId, out var parsedUserId))
                return Results.Unauthorized();

            var result = await handler.HandleAsync(new ImportLinkedInCommand(tenantId.Value, parsedUserId, dto));
            return Results.Ok(result);
        });

        portfolios.MapPost("/import/resume", async (ImportResumeDto dto, HttpContext context, ICommandHandler<ImportResumeCommand, PortfolioDto> handler) =>
        {
            var tenantId = context.GetTenantId();
            if (tenantId == null) return Results.BadRequest("Tenant ID is required");

            var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null || !Guid.TryParse(userId, out var parsedUserId))
                return Results.Unauthorized();

            var result = await handler.HandleAsync(new ImportResumeCommand(tenantId.Value, parsedUserId, dto));
            return Results.Ok(result);
        });

        // Public portfolio endpoint (no auth required)
        group.MapGet("/portfolio/{slug}", async (string slug, IQueryHandler<GetPortfolioBySlugQuery, PortfolioDto?> handler) =>
        {
            var result = await handler.HandleAsync(new GetPortfolioBySlugQuery(slug));
            return result != null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetPublicPortfolio")
        .WithDescription("Get public portfolio by slug (no authentication required)")
        .AllowAnonymous();

        return group;
    }
}

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        var auth = group.MapGroup("/auth").WithTags("Authentication");

        auth.MapPost("/login", async (LoginRequest request, IAuthService authService) =>
        {
            // Use default tenant (Guid.Empty) if TenantId is not provided or is empty
            var tenantId = request.TenantId == Guid.Empty || request.TenantId == null 
                ? Guid.Empty 
                : request.TenantId.Value;
                
            var result = await authService.AuthenticateAsync(request.Email, request.Password, tenantId);
            return result.Success ? Results.Ok(result) : Results.Unauthorized();
        });

        auth.MapPost("/register", async (RegisterUserDto dto, ICommandHandler<RegisterUserCommand, UserDto> handler) =>
        {
            try
            {
                var result = await handler.HandleAsync(new RegisterUserCommand(dto));
                return Results.Created($"/api/users/{result.Id}", result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });

        auth.MapPost("/oauth", async (OAuthRequest request, IAuthService authService) =>
        {
            var result = await authService.AuthenticateWithOAuthAsync(request);
            return result.Success ? Results.Ok(result) : Results.Unauthorized();
        });

        return group;
    }

    public static RouteGroupBuilder MapAdminEndpoints(this RouteGroupBuilder group)
    {
        var admin = group.MapGroup("/admin").RequireAuthorization("Admin");

        admin.MapPost("/users", async (CreateAdminDto dto, ICommandHandler<CreateAdminCommand, UserDto> handler, HttpContext httpContext) =>
        {
            try
            {
                // Get current user ID from JWT claims
                var userIdClaim = httpContext.User.FindFirst(JwtRegisteredClaimNames.Sub);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var requestingUserId))
                {
                    return Results.Unauthorized();
                }

                var result = await handler.HandleAsync(new CreateAdminCommand(dto, requestingUserId));
                return Results.Created($"/api/users/{result.Id}", result);
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Unauthorized();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("CreateAdmin")
        .WithDescription("Admin-only endpoint to create other admin users")
        .Produces<UserDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        return group;
    }
}

public record LoginRequest(string Email, string Password, Guid? TenantId);
