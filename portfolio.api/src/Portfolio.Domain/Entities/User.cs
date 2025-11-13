namespace Portfolio.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfileImageUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public AuthProvider AuthProvider { get; set; } = AuthProvider.Email;
    public string? ExternalId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    
    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
}

public enum UserRole
{
    User = 0,
    Admin = 1,
    SuperAdmin = 2
}

public enum AuthProvider
{
    Email = 0,
    LinkedIn = 1,
    Google = 2
}
