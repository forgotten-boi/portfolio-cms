using Portfolio.Domain.Entities;

namespace Portfolio.Application.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface ITenantRepository : IRepository<Tenant>
{
    Task<Tenant?> GetBySubdomainAsync(string subdomain, CancellationToken cancellationToken = default);
    Task<IEnumerable<Tenant>> GetActiveTenantsAsync(CancellationToken cancellationToken = default);
}

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, Guid tenantId, CancellationToken cancellationToken = default);
    Task<User?> GetByExternalIdAsync(string externalId, AuthProvider provider, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
}

public interface IBlogRepository : IRepository<Blog>
{
    Task<IEnumerable<Blog>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Blog>> GetPublishedByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<Blog?> GetBySlugAsync(string slug, Guid tenantId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Blog>> GetByAuthorIdAsync(Guid authorId, CancellationToken cancellationToken = default);
}

public interface IPortfolioRepository : IRepository<PortfolioEntity>
{
    Task<PortfolioEntity?> GetByUserIdAsync(Guid userId, Guid tenantId, CancellationToken cancellationToken = default);
    Task<IEnumerable<PortfolioEntity>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
