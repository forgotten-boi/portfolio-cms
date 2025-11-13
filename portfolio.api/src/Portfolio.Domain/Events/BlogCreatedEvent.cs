namespace Portfolio.Domain.Events;

public class BlogCreatedEvent : DomainEvent
{
    public Guid BlogId { get; }
    public Guid TenantId { get; }
    public Guid AuthorId { get; }
    public string Title { get; }
    public bool IsPublished { get; }

    public BlogCreatedEvent(Guid blogId, Guid tenantId, Guid authorId, string title, bool isPublished)
    {
        BlogId = blogId;
        TenantId = tenantId;
        AuthorId = authorId;
        Title = title;
        IsPublished = isPublished;
        EventType = nameof(BlogCreatedEvent);
    }
}
