namespace Portfolio.Domain.Events;

public class UserRegisteredEvent : DomainEvent
{
    public Guid UserId { get; init; }
    public Guid TenantId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public Guid RoleId { get; init; }

    public UserRegisteredEvent()
    {
        EventType = "UserRegistered";
    }
}
