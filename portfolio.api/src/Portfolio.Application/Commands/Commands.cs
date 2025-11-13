using Portfolio.Application.DTOs;

namespace Portfolio.Application.Commands;

public abstract class Command<TResult>
{
    public Guid CommandId { get; } = Guid.NewGuid();
    public DateTime CreatedAt { get; } = DateTime.UtcNow;
}

// Tenant Commands
public class CreateTenantCommand : Command<TenantDto>
{
    public CreateTenantDto Data { get; }

    public CreateTenantCommand(CreateTenantDto data)
    {
        Data = data;
    }
}

public class UpdateTenantCommand : Command<TenantDto>
{
    public Guid TenantId { get; }
    public UpdateTenantDto Data { get; }

    public UpdateTenantCommand(Guid tenantId, UpdateTenantDto data)
    {
        TenantId = tenantId;
        Data = data;
    }
}

// User Commands
public class CreateUserCommand : Command<UserDto>
{
    public Guid TenantId { get; }
    public CreateUserDto Data { get; }

    public CreateUserCommand(Guid tenantId, CreateUserDto data)
    {
        TenantId = tenantId;
        Data = data;
    }
}

public class UpdateUserCommand : Command<UserDto>
{
    public Guid UserId { get; }
    public Guid TenantId { get; }
    public UpdateUserDto Data { get; }

    public UpdateUserCommand(Guid userId, Guid tenantId, UpdateUserDto data)
    {
        UserId = userId;
        TenantId = tenantId;
        Data = data;
    }
}

// Blog Commands
public class CreateBlogCommand : Command<BlogDto>
{
    public Guid TenantId { get; }
    public Guid AuthorId { get; }
    public CreateBlogDto Data { get; }

    public CreateBlogCommand(Guid tenantId, Guid authorId, CreateBlogDto data)
    {
        TenantId = tenantId;
        AuthorId = authorId;
        Data = data;
    }
}

public class UpdateBlogCommand : Command<BlogDto>
{
    public Guid BlogId { get; }
    public Guid TenantId { get; }
    public UpdateBlogDto Data { get; }

    public UpdateBlogCommand(Guid blogId, Guid tenantId, UpdateBlogDto data)
    {
        BlogId = blogId;
        TenantId = tenantId;
        Data = data;
    }
}

public class DeleteBlogCommand : Command<bool>
{
    public Guid BlogId { get; }
    public Guid TenantId { get; }

    public DeleteBlogCommand(Guid blogId, Guid tenantId)
    {
        BlogId = blogId;
        TenantId = tenantId;
    }
}

// Portfolio Commands
public class CreatePortfolioCommand : Command<PortfolioDto>
{
    public Guid TenantId { get; }
    public Guid UserId { get; }
    public CreatePortfolioDto Data { get; }

    public CreatePortfolioCommand(Guid tenantId, Guid userId, CreatePortfolioDto data)
    {
        TenantId = tenantId;
        UserId = userId;
        Data = data;
    }
}

public class UpdatePortfolioCommand : Command<PortfolioDto>
{
    public Guid PortfolioId { get; }
    public Guid TenantId { get; }
    public UpdatePortfolioDto Data { get; }

    public UpdatePortfolioCommand(Guid portfolioId, Guid tenantId, UpdatePortfolioDto data)
    {
        PortfolioId = portfolioId;
        TenantId = tenantId;
        Data = data;
    }
}

public class ImportLinkedInCommand : Command<PortfolioDto>
{
    public Guid TenantId { get; }
    public Guid UserId { get; }
    public ImportLinkedInDto Data { get; }

    public ImportLinkedInCommand(Guid tenantId, Guid userId, ImportLinkedInDto data)
    {
        TenantId = tenantId;
        UserId = userId;
        Data = data;
    }
}

public class ImportResumeCommand : Command<PortfolioDto>
{
    public Guid TenantId { get; }
    public Guid UserId { get; }
    public ImportResumeDto Data { get; }

    public ImportResumeCommand(Guid tenantId, Guid userId, ImportResumeDto data)
    {
        TenantId = tenantId;
        UserId = userId;
        Data = data;
    }
}
