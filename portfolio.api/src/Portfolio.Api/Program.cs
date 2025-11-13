using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Portfolio.Api.Endpoints;
using Portfolio.Api.Middleware;
using Portfolio.Application.Commands;
using Portfolio.Application.DTOs;
using Portfolio.Application.Handlers;
using Portfolio.Application.Interfaces;
using Portfolio.Application.Queries;
using Portfolio.Infrastructure.Auth;
using Portfolio.Infrastructure.Data;
using Portfolio.Infrastructure.Messaging;
using Portfolio.Infrastructure.Persistence;
using Portfolio.Infrastructure.Repositories;
using Serilog;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
var configuration = builder.Configuration;

// Database
var connectionString = configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Database=portfolio;Username=postgres;Password=postgres";

builder.Services.AddDbContext<PortfolioDbContext>(options =>
    options.UseNpgsql(connectionString));

// Repositories
builder.Services.AddScoped<ITenantRepository, TenantRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBlogRepository, BlogRepository>();
builder.Services.AddScoped<IPortfolioRepository, PortfolioRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IUserRoleAssignmentRepository, UserRoleAssignmentRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Message Bus (check if Kafka is enabled or use in-memory)
var useMocks = configuration.GetValue<bool>("USE_MOCKS", false);
if (useMocks || !configuration.GetValue<bool>("Kafka:Enabled", false))
{
    builder.Services.AddSingleton<IMessageBus, InMemoryMessageBus>();
}
else
{
    builder.Services.AddSingleton<IMessageBus, KafkaMessageBus>();
}

// Auth Service
builder.Services.AddScoped<IAuthService, JwtAuthService>();

// Command Handlers
builder.Services.AddScoped<ICommandHandler<CreateTenantCommand, TenantDto>, CreateTenantCommandHandler>();
builder.Services.AddScoped<ICommandHandler<UpdateTenantCommand, TenantDto>, UpdateTenantCommandHandler>();
builder.Services.AddScoped<ICommandHandler<CreateUserCommand, UserDto>, CreateUserCommandHandler>();
builder.Services.AddScoped<ICommandHandler<RegisterUserCommand, UserDto>, RegisterUserCommandHandler>();
builder.Services.AddScoped<ICommandHandler<CreateAdminCommand, UserDto>, CreateAdminCommandHandler>();
builder.Services.AddScoped<ICommandHandler<UpdateUserCommand, UserDto>, UpdateUserCommandHandler>();
builder.Services.AddScoped<ICommandHandler<CreateBlogCommand, BlogDto>, CreateBlogCommandHandler>();
builder.Services.AddScoped<ICommandHandler<UpdateBlogCommand, BlogDto>, UpdateBlogCommandHandler>();
builder.Services.AddScoped<ICommandHandler<DeleteBlogCommand, bool>, DeleteBlogCommandHandler>();
builder.Services.AddScoped<ICommandHandler<CreatePortfolioCommand, PortfolioDto>, CreatePortfolioCommandHandler>();
builder.Services.AddScoped<ICommandHandler<GeneratePortfolioCommand, PortfolioDto>, GeneratePortfolioCommandHandler>();
builder.Services.AddScoped<ICommandHandler<UpdatePortfolioCommand, PortfolioDto>, UpdatePortfolioCommandHandler>();
builder.Services.AddScoped<ICommandHandler<ImportLinkedInCommand, PortfolioDto>, ImportLinkedInCommandHandler>();
builder.Services.AddScoped<ICommandHandler<ImportResumeCommand, PortfolioDto>, ImportResumeCommandHandler>();

// Query Handlers
builder.Services.AddScoped<IQueryHandler<GetTenantByIdQuery, TenantDto?>, GetTenantByIdQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetTenantBySubdomainQuery, TenantDto?>, GetTenantBySubdomainQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetAllTenantsQuery, IEnumerable<TenantDto>>, GetAllTenantsQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetUserByIdQuery, UserDto?>, GetUserByIdQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetUserByEmailQuery, UserDto?>, GetUserByEmailQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetUsersByTenantQuery, IEnumerable<UserDto>>, GetUsersByTenantQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetBlogByIdQuery, BlogDto?>, GetBlogByIdQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetBlogBySlugQuery, BlogDto?>, GetBlogBySlugQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetBlogsByTenantQuery, IEnumerable<BlogDto>>, GetBlogsByTenantQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetBlogsByAuthorQuery, IEnumerable<BlogDto>>, GetBlogsByAuthorQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetPortfolioByIdQuery, PortfolioDto?>, GetPortfolioByIdQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetPortfolioByUserIdQuery, PortfolioDto?>, GetPortfolioByUserIdQueryHandler>();
builder.Services.AddScoped<IQueryHandler<GetPortfoliosByTenantQuery, IEnumerable<PortfolioDto>>, GetPortfoliosByTenantQueryHandler>();

// JWT Authentication
var jwtSecret = configuration["Jwt:Secret"] ?? "your-super-secret-key-min-32-chars-long-for-security";
var jwtIssuer = configuration["Jwt:Issuer"] ?? "portfolio-api";
var jwtAudience = configuration["Jwt:Audience"] ?? "portfolio-client";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Admin policy - requires Admin role
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    
    // Member policy - requires Member or Admin role
    options.AddPolicy("Member", policy => policy.RequireRole("Member", "Admin"));
    
    // Guest policy - any authenticated user (Guest, Member, or Admin)
    options.AddPolicy("Guest", policy => policy.RequireAuthenticatedUser());
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Portfolio CMS API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors();
app.UseSerilogRequestLogging();

app.UseAuthentication();
app.UseAuthorization();
app.UseTenantMiddleware();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .WithName("HealthCheck")
    .WithTags("Health");

// Import endpoint files
app.MapGroup("/api").MapTenantEndpoints();
app.MapGroup("/api").MapUserEndpoints();
app.MapGroup("/api").MapBlogEndpoints();
app.MapGroup("/api").MapPortfolioEndpoints();
app.MapGroup("/api").MapAuthEndpoints();
app.MapGroup("/api").MapAdminEndpoints();

app.Run();
