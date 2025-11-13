namespace Portfolio.Domain.ValueObjects;

public record TenantContext
{
    public Guid TenantId { get; init; }
    public string Subdomain { get; init; } = string.Empty;

    public TenantContext(Guid tenantId, string subdomain)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("TenantId cannot be empty", nameof(tenantId));
        
        if (string.IsNullOrWhiteSpace(subdomain))
            throw new ArgumentException("Subdomain cannot be empty", nameof(subdomain));

        TenantId = tenantId;
        Subdomain = subdomain;
    }
}
