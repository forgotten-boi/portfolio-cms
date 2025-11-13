namespace Portfolio.Domain.Events;

public class PortfolioGeneratedEvent : DomainEvent
{
    public Guid PortfolioId { get; }
    public Guid TenantId { get; }
    public Guid UserId { get; }
    public string Title { get; }
    public string Template { get; }

    public PortfolioGeneratedEvent(Guid portfolioId, Guid tenantId, Guid userId, string title, string template)
    {
        PortfolioId = portfolioId;
        TenantId = tenantId;
        UserId = userId;
        Title = title;
        Template = template;
        EventType = nameof(PortfolioGeneratedEvent);
    }
}
