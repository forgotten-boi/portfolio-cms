namespace Portfolio.Domain.Entities;

public class Blog
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid AuthorId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? HeaderImageUrl { get; set; }
    public bool IsPublished { get; set; } = false;
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public int ViewCount { get; set; } = 0;
    public ICollection<string> Tags { get; set; } = new List<string>();
    
    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public User Author { get; set; } = null!;
}
