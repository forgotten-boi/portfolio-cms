namespace Portfolio.Domain.Events;

public class TenantCreatedEvent : DomainEvent
{
    public Guid TenantId { get; }
    public string Name { get; }
    public string Subdomain { get; }

    public TenantCreatedEvent(Guid tenantId, string name, string subdomain)
    {
        TenantId = tenantId;
        Name = name;
        Subdomain = subdomain;
        EventType = nameof(TenantCreatedEvent);
    }
}
