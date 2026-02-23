using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;
using Portfolio.Application.Queries;

namespace Portfolio.Application.Handlers;

// Tenant Query Handlers
public class GetTenantByIdQueryHandler : IQueryHandler<GetTenantByIdQuery, TenantDto?>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantByIdQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<TenantDto?> HandleAsync(GetTenantByIdQuery query, CancellationToken cancellationToken = default)
    {
        var tenant = await _tenantRepository.GetByIdAsync(query.TenantId, cancellationToken);
        if (tenant == null) return null;

        return new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Subdomain = tenant.Subdomain,
            IsActive = tenant.IsActive,
            CreatedAt = tenant.CreatedAt
        };
    }
}

public class GetTenantBySubdomainQueryHandler : IQueryHandler<GetTenantBySubdomainQuery, TenantDto?>
{
    private readonly ITenantRepository _tenantRepository;

    public GetTenantBySubdomainQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<TenantDto?> HandleAsync(GetTenantBySubdomainQuery query, CancellationToken cancellationToken = default)
    {
        var tenant = await _tenantRepository.GetBySubdomainAsync(query.Subdomain, cancellationToken);
        if (tenant == null) return null;

        return new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Subdomain = tenant.Subdomain,
            IsActive = tenant.IsActive,
            CreatedAt = tenant.CreatedAt
        };
    }
}

public class GetAllTenantsQueryHandler : IQueryHandler<GetAllTenantsQuery, IEnumerable<TenantDto>>
{
    private readonly ITenantRepository _tenantRepository;

    public GetAllTenantsQueryHandler(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
    }

    public async Task<IEnumerable<TenantDto>> HandleAsync(GetAllTenantsQuery query, CancellationToken cancellationToken = default)
    {
        var tenants = await _tenantRepository.GetAllAsync(cancellationToken);
        
        return tenants.Select(t => new TenantDto
        {
            Id = t.Id,
            Name = t.Name,
            Subdomain = t.Subdomain,
            IsActive = t.IsActive,
            CreatedAt = t.CreatedAt
        });
    }
}

// User Query Handlers
public class GetUserByIdQueryHandler : IQueryHandler<GetUserByIdQuery, UserDto?>
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto?> HandleAsync(GetUserByIdQuery query, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(query.UserId, cancellationToken);
        if (user == null || user.TenantId != query.TenantId) return null;

        return new UserDto
        {
            Id = user.Id,
            TenantId = user.TenantId,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfileImageUrl = user.ProfileImageUrl,
            Role = user.Role.ToString(),
            AuthProvider = user.AuthProvider.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}

public class GetUserByEmailQueryHandler : IQueryHandler<GetUserByEmailQuery, UserDto?>
{
    private readonly IUserRepository _userRepository;

    public GetUserByEmailQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto?> HandleAsync(GetUserByEmailQuery query, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(query.Email, query.TenantId, cancellationToken);
        if (user == null) return null;

        return new UserDto
        {
            Id = user.Id,
            TenantId = user.TenantId,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfileImageUrl = user.ProfileImageUrl,
            Role = user.Role.ToString(),
            AuthProvider = user.AuthProvider.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}

public class GetUsersByTenantQueryHandler : IQueryHandler<GetUsersByTenantQuery, IEnumerable<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersByTenantQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> HandleAsync(GetUsersByTenantQuery query, CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetByTenantIdAsync(query.TenantId, cancellationToken);
        
        return users.Select(u => new UserDto
        {
            Id = u.Id,
            TenantId = u.TenantId,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            ProfileImageUrl = u.ProfileImageUrl,
            Role = u.Role.ToString(),
            AuthProvider = u.AuthProvider.ToString(),
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        });
    }
}

// Blog Query Handlers
public class GetBlogByIdQueryHandler : IQueryHandler<GetBlogByIdQuery, BlogDto?>
{
    private readonly IBlogRepository _blogRepository;

    public GetBlogByIdQueryHandler(IBlogRepository blogRepository)
    {
        _blogRepository = blogRepository;
    }

    public async Task<BlogDto?> HandleAsync(GetBlogByIdQuery query, CancellationToken cancellationToken = default)
    {
        var blog = await _blogRepository.GetByIdAsync(query.BlogId, cancellationToken);
        if (blog == null || blog.TenantId != query.TenantId) return null;

        return new BlogDto
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
    }
}

public class GetBlogBySlugQueryHandler : IQueryHandler<GetBlogBySlugQuery, BlogDto?>
{
    private readonly IBlogRepository _blogRepository;

    public GetBlogBySlugQueryHandler(IBlogRepository blogRepository)
    {
        _blogRepository = blogRepository;
    }

    public async Task<BlogDto?> HandleAsync(GetBlogBySlugQuery query, CancellationToken cancellationToken = default)
    {
        var blog = await _blogRepository.GetBySlugAsync(query.Slug, query.TenantId, cancellationToken);
        if (blog == null) return null;

        return new BlogDto
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
    }
}

public class GetBlogsByTenantQueryHandler : IQueryHandler<GetBlogsByTenantQuery, IEnumerable<BlogDto>>
{
    private readonly IBlogRepository _blogRepository;

    public GetBlogsByTenantQueryHandler(IBlogRepository blogRepository)
    {
        _blogRepository = blogRepository;
    }

    public async Task<IEnumerable<BlogDto>> HandleAsync(GetBlogsByTenantQuery query, CancellationToken cancellationToken = default)
    {
        var blogs = query.PublishedOnly
            ? await _blogRepository.GetPublishedByTenantIdAsync(query.TenantId, cancellationToken)
            : await _blogRepository.GetByTenantIdAsync(query.TenantId, cancellationToken);
        
        return blogs.Select(b => new BlogDto
        {
            Id = b.Id,
            TenantId = b.TenantId,
            AuthorId = b.AuthorId,
            Title = b.Title,
            Slug = b.Slug,
            Content = b.Content,
            Summary = b.Summary,
            HeaderImageUrl = b.HeaderImageUrl,
            IsPublished = b.IsPublished,
            PublishedAt = b.PublishedAt,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            ViewCount = b.ViewCount,
            Tags = b.Tags.ToList()
        });
    }
}

public class GetBlogsByAuthorQueryHandler : IQueryHandler<GetBlogsByAuthorQuery, IEnumerable<BlogDto>>
{
    private readonly IBlogRepository _blogRepository;

    public GetBlogsByAuthorQueryHandler(IBlogRepository blogRepository)
    {
        _blogRepository = blogRepository;
    }

    public async Task<IEnumerable<BlogDto>> HandleAsync(GetBlogsByAuthorQuery query, CancellationToken cancellationToken = default)
    {
        var blogs = await _blogRepository.GetByAuthorIdAsync(query.AuthorId, cancellationToken);
        
        return blogs.Where(b => b.TenantId == query.TenantId).Select(b => new BlogDto
        {
            Id = b.Id,
            TenantId = b.TenantId,
            AuthorId = b.AuthorId,
            Title = b.Title,
            Slug = b.Slug,
            Content = b.Content,
            Summary = b.Summary,
            HeaderImageUrl = b.HeaderImageUrl,
            IsPublished = b.IsPublished,
            PublishedAt = b.PublishedAt,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt,
            ViewCount = b.ViewCount,
            Tags = b.Tags.ToList()
        });
    }
}

// Portfolio Query Handlers
public class GetPortfolioByIdQueryHandler : IQueryHandler<GetPortfolioByIdQuery, PortfolioDto?>
{
    private readonly IPortfolioRepository _portfolioRepository;

    public GetPortfolioByIdQueryHandler(IPortfolioRepository portfolioRepository)
    {
        _portfolioRepository = portfolioRepository;
    }

    public async Task<PortfolioDto?> HandleAsync(GetPortfolioByIdQuery query, CancellationToken cancellationToken = default)
    {
        var portfolio = await _portfolioRepository.GetByIdAsync(query.PortfolioId, cancellationToken);
        if (portfolio == null || portfolio.TenantId != query.TenantId) return null;

        return new PortfolioDto
        {
            Id = portfolio.Id,
            TenantId = portfolio.TenantId,
            UserId = portfolio.UserId,
            Title = portfolio.Title,
            Subtitle = portfolio.Subtitle,
            Bio = portfolio.Bio,
            ProfileImageUrl = portfolio.ProfileImageUrl,
            ResumeUrl = portfolio.ResumeUrl,
            LinkedInUrl = portfolio.LinkedInUrl,
            GitHubUrl = portfolio.GitHubUrl,
            WebsiteUrl = portfolio.WebsiteUrl,
            Template = portfolio.Template.ToString(),
            FeaturedBlogsEnabled = portfolio.FeaturedBlogsEnabled,
            MaxFeaturedBlogs = portfolio.MaxFeaturedBlogs,
            Data = portfolio.Data,
            CreatedAt = portfolio.CreatedAt,
            UpdatedAt = portfolio.UpdatedAt
        };
    }
}

public class GetPortfolioByUserIdQueryHandler : IQueryHandler<GetPortfolioByUserIdQuery, PortfolioDto?>
{
    private readonly IPortfolioRepository _portfolioRepository;

    public GetPortfolioByUserIdQueryHandler(IPortfolioRepository portfolioRepository)
    {
        _portfolioRepository = portfolioRepository;
    }

    public async Task<PortfolioDto?> HandleAsync(GetPortfolioByUserIdQuery query, CancellationToken cancellationToken = default)
    {
        var portfolio = await _portfolioRepository.GetByUserIdAsync(query.UserId, query.TenantId, cancellationToken);
        if (portfolio == null) return null;

        return new PortfolioDto
        {
            Id = portfolio.Id,
            TenantId = portfolio.TenantId,
            UserId = portfolio.UserId,
            Title = portfolio.Title,
            Subtitle = portfolio.Subtitle,
            Bio = portfolio.Bio,
            ProfileImageUrl = portfolio.ProfileImageUrl,
            ResumeUrl = portfolio.ResumeUrl,
            LinkedInUrl = portfolio.LinkedInUrl,
            GitHubUrl = portfolio.GitHubUrl,
            WebsiteUrl = portfolio.WebsiteUrl,
            Template = portfolio.Template.ToString(),
            FeaturedBlogsEnabled = portfolio.FeaturedBlogsEnabled,
            MaxFeaturedBlogs = portfolio.MaxFeaturedBlogs,
            Data = portfolio.Data,
            CreatedAt = portfolio.CreatedAt,
            UpdatedAt = portfolio.UpdatedAt
        };
    }
}

public class GetPortfoliosByTenantQueryHandler : IQueryHandler<GetPortfoliosByTenantQuery, IEnumerable<PortfolioDto>>
{
    private readonly IPortfolioRepository _portfolioRepository;

    public GetPortfoliosByTenantQueryHandler(IPortfolioRepository portfolioRepository)
    {
        _portfolioRepository = portfolioRepository;
    }

    public async Task<IEnumerable<PortfolioDto>> HandleAsync(GetPortfoliosByTenantQuery query, CancellationToken cancellationToken = default)
    {
        var portfolios = await _portfolioRepository.GetByTenantIdAsync(query.TenantId, cancellationToken);
        
        return portfolios.Select(p => new PortfolioDto
        {
            Id = p.Id,
            TenantId = p.TenantId,
            UserId = p.UserId,
            Title = p.Title,
            Subtitle = p.Subtitle,
            Bio = p.Bio,
            ProfileImageUrl = p.ProfileImageUrl,
            ResumeUrl = p.ResumeUrl,
            LinkedInUrl = p.LinkedInUrl,
            GitHubUrl = p.GitHubUrl,
            WebsiteUrl = p.WebsiteUrl,
            Template = p.Template.ToString(),
            FeaturedBlogsEnabled = p.FeaturedBlogsEnabled,
            MaxFeaturedBlogs = p.MaxFeaturedBlogs,
            Data = p.Data,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        });
    }
}

public class GetPortfolioBySlugQueryHandler : IQueryHandler<GetPortfolioBySlugQuery, PortfolioDto?>
{
    private readonly IPortfolioRepository _portfolioRepository;

    public GetPortfolioBySlugQueryHandler(IPortfolioRepository portfolioRepository)
    {
        _portfolioRepository = portfolioRepository;
    }

    public async Task<PortfolioDto?> HandleAsync(GetPortfolioBySlugQuery query, CancellationToken cancellationToken = default)
    {
        var portfolio = await _portfolioRepository.GetBySlugAsync(query.Slug, cancellationToken);
        if (portfolio == null) return null;

        return new PortfolioDto
        {
            Id = portfolio.Id,
            TenantId = portfolio.TenantId,
            UserId = portfolio.UserId,
            Title = portfolio.Title,
            Slug = portfolio.Slug,
            Subtitle = portfolio.Subtitle,
            Bio = portfolio.Bio,
            ProfileImageUrl = portfolio.ProfileImageUrl,
            ResumeUrl = portfolio.ResumeUrl,
            LinkedInUrl = portfolio.LinkedInUrl,
            GitHubUrl = portfolio.GitHubUrl,
            WebsiteUrl = portfolio.WebsiteUrl,
            Template = portfolio.Template.ToString(),
            FeaturedBlogsEnabled = portfolio.FeaturedBlogsEnabled,
            MaxFeaturedBlogs = portfolio.MaxFeaturedBlogs,
            IsPublished = portfolio.IsPublished,
            PublishedAt = portfolio.PublishedAt,
            Data = portfolio.Data,
            CreatedAt = portfolio.CreatedAt,
            UpdatedAt = portfolio.UpdatedAt
        };
    }
}
