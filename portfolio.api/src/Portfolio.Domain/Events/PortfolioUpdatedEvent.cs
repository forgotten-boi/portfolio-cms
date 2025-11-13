namespace Portfolio.Domain.Events;

public class PortfolioUpdatedEvent : DomainEvent
{
    public Guid PortfolioId { get; init; }
    public Guid UserId { get; init; }
    public DateTime UpdatedAt { get; init; }

    public PortfolioUpdatedEvent()
    {
        EventType = "PortfolioUpdated";
    }
}
