using Portfolio.Domain.Entities;

namespace Portfolio.Application.DTOs;

public class PortfolioDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? ResumeUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? GitHubUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string Template { get; set; } = string.Empty;
    public int TemplateId { get; set; }
    public bool IsPublished { get; set; }
    public bool FeaturedBlogsEnabled { get; set; }
    public int MaxFeaturedBlogs { get; set; }
    public PortfolioData Data { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
}

public class CreatePortfolioDto
{
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? ResumeUrl { get; set; }
    public string Template { get; set; } = "Modern";
    public bool FeaturedBlogsEnabled { get; set; }
    public bool IsPublished { get; set; }
}

public class UpdatePortfolioDto
{
    public string? Title { get; set; }
    public string? Subtitle { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? ResumeUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? GitHubUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Template { get; set; }
    public bool? FeaturedBlogsEnabled { get; set; }
    public bool? IsPublished { get; set; }
    public int? MaxFeaturedBlogs { get; set; }
    public PortfolioData? Data { get; set; }
}

public class ImportLinkedInDto
{
    public string AccessToken { get; set; } = string.Empty;
}

public class ImportResumeDto
{
    public string ResumeUrl { get; set; } = string.Empty;
    public string? ResumeText { get; set; }
}

public class GeneratePortfolioDto
{
    public string? PdfUrl { get; set; }
    /// <summary>Base64-encoded PDF resume (alternative to PdfUrl)</summary>
    public string? PdfBase64 { get; set; }
    public string? LinkedInUrl { get; set; }
    /// <summary>LinkedIn profile URL alias used by the frontend</summary>
    public string? LinkedInProfileUrl { get; set; }
    public string? ResumeText { get; set; }
    public int TemplateId { get; set; } = 1;
    /// <summary>Template name alias (e.g. "Modern", "Classic") — mapped to TemplateId if TemplateId is 0</summary>
    public string? TemplateName { get; set; }
}
