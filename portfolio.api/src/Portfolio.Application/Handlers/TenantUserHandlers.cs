using Portfolio.Application.Commands;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Events;

namespace Portfolio.Application.Handlers;

// Tenant Command Handlers
public class CreateTenantCommandHandler : ICommandHandler<CreateTenantCommand, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IMessageBus _messageBus;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantCommandHandler(
        ITenantRepository tenantRepository,
        IMessageBus messageBus,
        IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _messageBus = messageBus;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto> HandleAsync(CreateTenantCommand command, CancellationToken cancellationToken = default)
    {
        // Check if subdomain already exists
        var existingTenant = await _tenantRepository.GetBySubdomainAsync(command.Data.Subdomain, cancellationToken);
        if (existingTenant != null)
        {
            throw new InvalidOperationException($"Tenant with subdomain '{command.Data.Subdomain}' already exists.");
        }

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = command.Data.Name,
            Subdomain = command.Data.Subdomain.ToLowerInvariant(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _tenantRepository.AddAsync(tenant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Publish domain event
        var @event = new TenantCreatedEvent(tenant.Id, tenant.Name, tenant.Subdomain);
        await _messageBus.PublishAsync(@event, "tenants.created", cancellationToken);

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

public class UpdateTenantCommandHandler : ICommandHandler<UpdateTenantCommand, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTenantCommandHandler(
        ITenantRepository tenantRepository,
        IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto> HandleAsync(UpdateTenantCommand command, CancellationToken cancellationToken = default)
    {
        var tenant = await _tenantRepository.GetByIdAsync(command.TenantId, cancellationToken);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{command.TenantId}' not found.");
        }

        if (command.Data.Name != null)
            tenant.Name = command.Data.Name;

        if (command.Data.IsActive.HasValue)
            tenant.IsActive = command.Data.IsActive.Value;

        tenant.UpdatedAt = DateTime.UtcNow;

        await _tenantRepository.UpdateAsync(tenant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

// User Command Handlers
public class CreateUserCommandHandler : ICommandHandler<CreateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUserCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserDto> HandleAsync(CreateUserCommand command, CancellationToken cancellationToken = default)
    {
        // Check if user already exists
        var existingUser = await _userRepository.GetByEmailAsync(command.Data.Email, command.TenantId, cancellationToken);
        if (existingUser != null)
        {
            throw new InvalidOperationException($"User with email '{command.Data.Email}' already exists in this tenant.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            TenantId = command.TenantId,
            Email = command.Data.Email,
            FirstName = command.Data.FirstName,
            LastName = command.Data.LastName,
            ProfileImageUrl = command.Data.ProfileImageUrl,
            Role = UserRole.User,
            AuthProvider = AuthProvider.Email,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Hash password if provided
        if (!string.IsNullOrWhiteSpace(command.Data.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(command.Data.Password);
        }

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

public class UpdateUserCommandHandler : ICommandHandler<UpdateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserDto> HandleAsync(UpdateUserCommand command, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(command.UserId, cancellationToken);
        if (user == null || user.TenantId != command.TenantId)
        {
            throw new KeyNotFoundException($"User with ID '{command.UserId}' not found in this tenant.");
        }

        if (command.Data.FirstName != null)
            user.FirstName = command.Data.FirstName;

        if (command.Data.LastName != null)
            user.LastName = command.Data.LastName;

        if (command.Data.ProfileImageUrl != null)
            user.ProfileImageUrl = command.Data.ProfileImageUrl;

        if (command.Data.IsActive.HasValue)
            user.IsActive = command.Data.IsActive.Value;

        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
