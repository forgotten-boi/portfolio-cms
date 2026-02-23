using Portfolio.Application.DTOs;

namespace Portfolio.Application.Queries;

public abstract class Query<TResult>
{
    public Guid QueryId { get; } = Guid.NewGuid();
    public DateTime CreatedAt { get; } = DateTime.UtcNow;
}

// Tenant Queries
public class GetTenantByIdQuery : Query<TenantDto?>
{
    public Guid TenantId { get; }

    public GetTenantByIdQuery(Guid tenantId)
    {
        TenantId = tenantId;
    }
}

public class GetTenantBySubdomainQuery : Query<TenantDto?>
{
    public string Subdomain { get; }

    public GetTenantBySubdomainQuery(string subdomain)
    {
        Subdomain = subdomain;
    }
}

public class GetAllTenantsQuery : Query<IEnumerable<TenantDto>>
{
}

// User Queries
public class GetUserByIdQuery : Query<UserDto?>
{
    public Guid UserId { get; }
    public Guid TenantId { get; }

    public GetUserByIdQuery(Guid userId, Guid tenantId)
    {
        UserId = userId;
        TenantId = tenantId;
    }
}

public class GetUserByEmailQuery : Query<UserDto?>
{
    public string Email { get; }
    public Guid TenantId { get; }

    public GetUserByEmailQuery(string email, Guid tenantId)
    {
        Email = email;
        TenantId = tenantId;
    }
}

public class GetUsersByTenantQuery : Query<IEnumerable<UserDto>>
{
    public Guid TenantId { get; }

    public GetUsersByTenantQuery(Guid tenantId)
    {
        TenantId = tenantId;
    }
}

// Blog Queries
public class GetBlogByIdQuery : Query<BlogDto?>
{
    public Guid BlogId { get; }
    public Guid TenantId { get; }

    public GetBlogByIdQuery(Guid blogId, Guid tenantId)
    {
        BlogId = blogId;
        TenantId = tenantId;
    }
}

public class GetBlogBySlugQuery : Query<BlogDto?>
{
    public string Slug { get; }
    public Guid TenantId { get; }

    public GetBlogBySlugQuery(string slug, Guid tenantId)
    {
        Slug = slug;
        TenantId = tenantId;
    }
}

public class GetBlogsByTenantQuery : Query<IEnumerable<BlogDto>>
{
    public Guid TenantId { get; }
    public bool PublishedOnly { get; }

    public GetBlogsByTenantQuery(Guid tenantId, bool publishedOnly = false)
    {
        TenantId = tenantId;
        PublishedOnly = publishedOnly;
    }
}

public class GetBlogsByAuthorQuery : Query<IEnumerable<BlogDto>>
{
    public Guid AuthorId { get; }
    public Guid TenantId { get; }

    public GetBlogsByAuthorQuery(Guid authorId, Guid tenantId)
    {
        AuthorId = authorId;
        TenantId = tenantId;
    }
}

// Portfolio Queries
public class GetPortfolioByIdQuery : Query<PortfolioDto?>
{
    public Guid PortfolioId { get; }
    public Guid TenantId { get; }

    public GetPortfolioByIdQuery(Guid portfolioId, Guid tenantId)
    {
        PortfolioId = portfolioId;
        TenantId = tenantId;
    }
}

public class GetPortfolioByUserIdQuery : Query<PortfolioDto?>
{
    public Guid UserId { get; }
    public Guid TenantId { get; }

    public GetPortfolioByUserIdQuery(Guid userId, Guid tenantId)
    {
        UserId = userId;
        TenantId = tenantId;
    }
}

public class GetPortfoliosByTenantQuery : Query<IEnumerable<PortfolioDto>>
{
    public Guid TenantId { get; }

    public GetPortfoliosByTenantQuery(Guid tenantId)
    {
        TenantId = tenantId;
    }
}

public class GetPortfolioBySlugQuery : Query<PortfolioDto?>
{
    public string Slug { get; }

    public GetPortfolioBySlugQuery(string slug)
    {
        Slug = slug;
    }
}
