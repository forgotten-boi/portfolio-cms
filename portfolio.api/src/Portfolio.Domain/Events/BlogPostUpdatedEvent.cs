namespace Portfolio.Domain.Events;

public class BlogPostUpdatedEvent : DomainEvent
{
    public Guid BlogId { get; init; }
    public Guid AuthorId { get; init; }
    public DateTime UpdatedAt { get; init; }
    public bool IsPublished { get; init; }

    public BlogPostUpdatedEvent()
    {
        EventType = "BlogPostUpdated";
    }
}
