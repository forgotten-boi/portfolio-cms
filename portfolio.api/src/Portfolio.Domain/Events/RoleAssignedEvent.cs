namespace Portfolio.Domain.Events;

public class RoleAssignedEvent : DomainEvent
{
    public Guid UserId { get; init; }
    public Guid RoleId { get; init; }
    public string RoleName { get; init; } = string.Empty;
    public Guid? AssignedByUserId { get; init; }

    public RoleAssignedEvent()
    {
        EventType = "RoleAssigned";
    }
}
