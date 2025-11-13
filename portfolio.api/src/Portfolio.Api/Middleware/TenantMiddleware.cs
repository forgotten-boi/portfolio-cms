using Portfolio.Application.Interfaces;

namespace Portfolio.Api.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantMiddleware> _logger;

    public TenantMiddleware(RequestDelegate next, ILogger<TenantMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ITenantRepository tenantRepository)
    {
        // Try to get tenant from header
        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdValue))
        {
            if (Guid.TryParse(tenantIdValue, out var tenantId))
            {
                context.Items["TenantId"] = tenantId;
                _logger.LogInformation("Tenant {TenantId} identified from header", tenantId);
            }
        }
        // Try to get tenant from subdomain (e.g., tenant1.api.com)
        else
        {
            var host = context.Request.Host.Host;
            var parts = host.Split('.');
            
            if (parts.Length > 2)
            {
                var subdomain = parts[0];
                var tenant = await tenantRepository.GetBySubdomainAsync(subdomain);
                
                if (tenant != null)
                {
                    context.Items["TenantId"] = tenant.Id;
                    context.Items["Subdomain"] = tenant.Subdomain;
                    _logger.LogInformation("Tenant {TenantId} identified from subdomain {Subdomain}", tenant.Id, subdomain);
                }
            }
        }

        // Try to get tenant from JWT claims
        if (!context.Items.ContainsKey("TenantId") && context.User.Identity?.IsAuthenticated == true)
        {
            var tenantClaim = context.User.FindFirst("tenantId");
            if (tenantClaim != null && Guid.TryParse(tenantClaim.Value, out var tenantId))
            {
                context.Items["TenantId"] = tenantId;
                _logger.LogInformation("Tenant {TenantId} identified from JWT", tenantId);
            }
        }

        await _next(context);
    }
}

public static class TenantMiddlewareExtensions
{
    public static IApplicationBuilder UseTenantMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<TenantMiddleware>();
    }

    public static Guid? GetTenantId(this HttpContext context)
    {
        return context.Items.TryGetValue("TenantId", out var tenantId) ? (Guid?)tenantId : null;
    }
}
