namespace Portfolio.Domain.Events;

public class NotificationCreatedEvent : DomainEvent
{
    public Guid NotificationId { get; }
    public Guid TenantId { get; }
    public Guid UserId { get; }
    public string Type { get; }
    public string Message { get; }

    public NotificationCreatedEvent(Guid notificationId, Guid tenantId, Guid userId, string type, string message)
    {
        NotificationId = notificationId;
        TenantId = tenantId;
        UserId = userId;
        Type = type;
        Message = message;
        EventType = nameof(NotificationCreatedEvent);
    }
}
