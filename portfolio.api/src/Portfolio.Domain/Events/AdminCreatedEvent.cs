namespace Portfolio.Domain.Events;

public class AdminCreatedEvent : DomainEvent
{
    public Guid AdminUserId { get; init; }
    public Guid TenantId { get; init; }
    public string Email { get; init; } = string.Empty;
    public Guid CreatedByUserId { get; init; }

    public AdminCreatedEvent()
    {
        EventType = "AdminCreated";
    }
}
