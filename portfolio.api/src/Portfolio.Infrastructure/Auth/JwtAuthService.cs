using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Portfolio.Application.Interfaces;
using Portfolio.Domain.Entities;
using Portfolio.Domain.ValueObjects;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Portfolio.Infrastructure.Auth;

public class JwtAuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IConfiguration _configuration;
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;
    private readonly int _jwtExpiryMinutes;

    public JwtAuthService(IUserRepository userRepository, IRoleRepository roleRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _configuration = configuration;
        _jwtSecret = configuration["Jwt:Secret"] ?? "your-super-secret-key-min-32-chars-long-for-security";
        _jwtIssuer = configuration["Jwt:Issuer"] ?? "portfolio-api";
        _jwtAudience = configuration["Jwt:Audience"] ?? "portfolio-client";
        _jwtExpiryMinutes = configuration.GetValue<int>("Jwt:ExpiryMinutes", 60);
    }

    public async Task<AuthResult> AuthenticateAsync(string email, string password, Guid tenantId, CancellationToken cancellationToken = default)
    {
        // If tenantId is Guid.Empty, use the default tenant (first tenant in system or specific default)
        if (tenantId == Guid.Empty)
        {
            // Use the default tenant ID (update this to match your default tenant's actual ID)
            tenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        }
        
        var user = await _userRepository.GetByEmailAsync(email, tenantId, cancellationToken);
        
        if (user == null || !user.IsActive)
        {
            return new AuthResult
            {
                Success = false,
                ErrorMessage = "Invalid email or password"
            };
        }

        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            return new AuthResult
            {
                Success = false,
                ErrorMessage = "Please login with your OAuth provider"
            };
        }

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return new AuthResult
            {
                Success = false,
                ErrorMessage = "Invalid email or password"
            };
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        // Get user roles from UserRoleAssignments
        var userRoles = await _roleRepository.GetRolesByUserIdAsync(user.Id, cancellationToken);
        var roleNames = userRoles.Select(r => r.Name).ToList();
        
        // Fallback to UserRole enum if no roles assigned
        if (!roleNames.Any())
        {
            roleNames.Add(user.Role.ToString());
        }

        var token = await GenerateTokenAsync(user.Id, user.TenantId, user.Email, roleNames, cancellationToken);

        return new AuthResult
        {
            Success = true,
            Token = token,
            UserId = user.Id
        };
    }

    public async Task<AuthResult> AuthenticateWithOAuthAsync(OAuthRequest request, CancellationToken cancellationToken = default)
    {
        // Check if user exists by external ID
        User? user = null;
        
        if (!string.IsNullOrEmpty(request.ExternalId))
        {
            var provider = Enum.Parse<AuthProvider>(request.Provider, true);
            user = await _userRepository.GetByExternalIdAsync(request.ExternalId, provider, cancellationToken);
        }

        // If not found by external ID, try by email
        if (user == null && !string.IsNullOrEmpty(request.Email))
        {
            user = await _userRepository.GetByEmailAsync(request.Email, request.TenantId, cancellationToken);
        }

        // Create new user if doesn't exist
        if (user == null)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return new AuthResult
                {
                    Success = false,
                    ErrorMessage = "Email is required for OAuth authentication"
                };
            }

            user = new User
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                ProfileImageUrl = request.ProfileImageUrl,
                Role = UserRole.User,
                AuthProvider = Enum.Parse<AuthProvider>(request.Provider, true),
                ExternalId = request.ExternalId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user, cancellationToken);
        }
        else
        {
            // Update existing user
            if (!string.IsNullOrEmpty(request.FirstName))
                user.FirstName = request.FirstName;
            
            if (!string.IsNullOrEmpty(request.LastName))
                user.LastName = request.LastName;
            
            if (!string.IsNullOrEmpty(request.ProfileImageUrl))
                user.ProfileImageUrl = request.ProfileImageUrl;
            
            user.LastLoginAt = DateTime.UtcNow;
            
            await _userRepository.UpdateAsync(user, cancellationToken);
        }

        // Get user roles from UserRoleAssignments
        var userRoles = await _roleRepository.GetRolesByUserIdAsync(user.Id, cancellationToken);
        var roleNames = userRoles.Select(r => r.Name).ToList();
        
        // Fallback to UserRole enum if no roles assigned
        if (!roleNames.Any())
        {
            roleNames.Add(user.Role.ToString());
        }

        var token = await GenerateTokenAsync(user.Id, user.TenantId, user.Email, roleNames, cancellationToken);

        return new AuthResult
        {
            Success = true,
            Token = token,
            UserId = user.Id
        };
    }

    public Task<string> GenerateTokenAsync(Guid userId, Guid tenantId, string email, IEnumerable<string> roles, CancellationToken cancellationToken = default)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("tenantId", tenantId.ToString())
        };

        // Add role claims - each role as a separate claim
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtExpiryMinutes),
            signingCredentials: credentials
        );

        return Task.FromResult(new JwtSecurityTokenHandler().WriteToken(token));
    }

    public Task<bool> ValidateTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
            var tokenHandler = new JwtSecurityTokenHandler();

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = true,
                ValidIssuer = _jwtIssuer,
                ValidateAudience = true,
                ValidAudience = _jwtAudience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);

            return Task.FromResult(true);
        }
        catch
        {
            return Task.FromResult(false);
        }
    }

    public Task<TenantContext?> GetTenantContextFromTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            var tenantIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "tenantId");
            if (tenantIdClaim == null || !Guid.TryParse(tenantIdClaim.Value, out var tenantId))
            {
                return Task.FromResult<TenantContext?>(null);
            }

            // Note: Subdomain would typically be fetched from database or another claim
            // For now, returning a basic context
            return Task.FromResult<TenantContext?>(new TenantContext(tenantId, "unknown"));
        }
        catch
        {
            return Task.FromResult<TenantContext?>(null);
        }
    }
}
