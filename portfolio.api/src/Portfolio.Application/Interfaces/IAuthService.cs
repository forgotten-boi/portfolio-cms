using Portfolio.Domain.ValueObjects;

namespace Portfolio.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResult> AuthenticateAsync(string email, string password, Guid tenantId, CancellationToken cancellationToken = default);
    Task<AuthResult> AuthenticateWithOAuthAsync(OAuthRequest request, CancellationToken cancellationToken = default);
    Task<string> GenerateTokenAsync(Guid userId, Guid tenantId, string email, IEnumerable<string> roles, CancellationToken cancellationToken = default);
    Task<bool> ValidateTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<TenantContext?> GetTenantContextFromTokenAsync(string token, CancellationToken cancellationToken = default);
}

public class AuthResult
{
    public bool Success { get; set; }
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
    public Guid UserId { get; set; }
    public string? ErrorMessage { get; set; }
}

public class OAuthRequest
{
    public string Provider { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string? ExternalId { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfileImageUrl { get; set; }
    public Guid TenantId { get; set; }
}
