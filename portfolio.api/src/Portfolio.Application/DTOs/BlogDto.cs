namespace Portfolio.Application.DTOs;

public class BlogDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid AuthorId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? HeaderImageUrl { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int ViewCount { get; set; }
    public List<string> Tags { get; set; } = new();
    public UserDto? Author { get; set; }
}

public class CreateBlogDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? HeaderImageUrl { get; set; }
    public bool IsPublished { get; set; }
    public List<string> Tags { get; set; } = new();
}

public class UpdateBlogDto
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? Summary { get; set; }
    public string? HeaderImageUrl { get; set; }
    public bool? IsPublished { get; set; }
    public List<string>? Tags { get; set; }
}
