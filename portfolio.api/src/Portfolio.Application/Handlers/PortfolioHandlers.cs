using Portfolio.Application.Commands;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Events;

namespace Portfolio.Application.Handlers;

// Portfolio Command Handlers
public class CreatePortfolioCommandHandler : ICommandHandler<CreatePortfolioCommand, PortfolioDto>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IMessageBus _messageBus;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePortfolioCommandHandler(
        IPortfolioRepository portfolioRepository,
        IMessageBus messageBus,
        IUnitOfWork unitOfWork)
    {
        _portfolioRepository = portfolioRepository;
        _messageBus = messageBus;
        _unitOfWork = unitOfWork;
    }

    public async Task<PortfolioDto> HandleAsync(CreatePortfolioCommand command, CancellationToken cancellationToken = default)
    {
        // Check if user already has a portfolio
        var existingPortfolio = await _portfolioRepository.GetByUserIdAsync(command.UserId, command.TenantId, cancellationToken);
        if (existingPortfolio != null)
        {
            throw new InvalidOperationException($"Portfolio already exists for user '{command.UserId}'.");
        }

        var template = Enum.TryParse<PortfolioTemplate>(command.Data.Template, out var parsedTemplate)
            ? parsedTemplate
            : PortfolioTemplate.Modern;

        var portfolio = new PortfolioEntity
        {
            Id = Guid.NewGuid(),
            TenantId = command.TenantId,
            UserId = command.UserId,
            Title = command.Data.Title,
            Subtitle = command.Data.Subtitle,
            Bio = command.Data.Bio,
            ProfileImageUrl = command.Data.ProfileImageUrl,
            LinkedInUrl = command.Data.LinkedInUrl,
            ResumeUrl = command.Data.ResumeUrl,
            Template = template,
            FeaturedBlogsEnabled = command.Data.FeaturedBlogsEnabled,
            CreatedAt = DateTime.UtcNow,
            LastGeneratedAt = DateTime.UtcNow
        };

        await _portfolioRepository.AddAsync(portfolio, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Publish domain event
        var @event = new PortfolioGeneratedEvent(
            portfolio.Id,
            portfolio.TenantId,
            portfolio.UserId,
            portfolio.Title,
            portfolio.Template.ToString()
        );
        await _messageBus.PublishAsync(@event, "portfolio.generated", cancellationToken);

        return new PortfolioDto
        {
            Id = portfolio.Id,
            TenantId = portfolio.TenantId,
            UserId = portfolio.UserId,
            Title = portfolio.Title,
            Slug = portfolio.Slug,
            Subtitle = portfolio.Subtitle,
            Bio = portfolio.Bio,
            ProfileImageUrl = portfolio.ProfileImageUrl,
            ResumeUrl = portfolio.ResumeUrl,
            LinkedInUrl = portfolio.LinkedInUrl,
            GitHubUrl = portfolio.GitHubUrl,
            WebsiteUrl = portfolio.WebsiteUrl,
            Template = portfolio.Template.ToString(),
            TemplateId = portfolio.TemplateId,
            IsPublished = portfolio.IsPublished,
            FeaturedBlogsEnabled = portfolio.FeaturedBlogsEnabled,
            MaxFeaturedBlogs = portfolio.MaxFeaturedBlogs,
            Data = portfolio.Data,
            CreatedAt = portfolio.CreatedAt,
            UpdatedAt = portfolio.UpdatedAt,
            PublishedAt = portfolio.PublishedAt
        };
    }
}

// Generate Portfolio Command Handler (PDF/LinkedIn import)
public class GeneratePortfolioCommandHandler : ICommandHandler<GeneratePortfolioCommand, PortfolioDto>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMessageBus _messageBus;
    private readonly IUnitOfWork _unitOfWork;

    public GeneratePortfolioCommandHandler(
        IPortfolioRepository portfolioRepository,
        IUserRepository userRepository,
        IMessageBus messageBus,
        IUnitOfWork unitOfWork)
    {
        _portfolioRepository = portfolioRepository;
        _userRepository = userRepository;
        _messageBus = messageBus;
        _unitOfWork = unitOfWork;
    }

    public async Task<PortfolioDto> HandleAsync(GeneratePortfolioCommand command, CancellationToken cancellationToken = default)
    {
        // Get user for default data
        var user = await _userRepository.GetByIdAsync(command.UserId, cancellationToken);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Check if portfolio already exists
        var existingPortfolio = await _portfolioRepository.GetByUserIdAsync(command.UserId, command.TenantId, cancellationToken);
        
        // Parse PDF or LinkedIn data (PLACEHOLDER for Perplexity/Gemini API)
        var portfolioData = await ParseResumeDataAsync(command.Data, cancellationToken);
        
        // Generate slug from user name
        var slug = GenerateSlug($"{user.FirstName} {user.LastName}");

        if (existingPortfolio != null)
        {
            // Update existing portfolio
            existingPortfolio.Title = portfolioData.Title;
            existingPortfolio.Subtitle = portfolioData.Subtitle;
            existingPortfolio.Bio = portfolioData.Bio;
            existingPortfolio.LinkedInUrl = command.Data.LinkedInUrl ?? existingPortfolio.LinkedInUrl;
            existingPortfolio.ResumeUrl = command.Data.PdfUrl ?? existingPortfolio.ResumeUrl;
            existingPortfolio.TemplateId = command.Data.TemplateId;
            existingPortfolio.Data = portfolioData.Data;
            existingPortfolio.UpdatedAt = DateTime.UtcNow;
            existingPortfolio.LastGeneratedAt = DateTime.UtcNow;

            await _portfolioRepository.UpdateAsync(existingPortfolio, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Publish update event
            var updateEvent = new PortfolioUpdatedEvent
            {
                PortfolioId = existingPortfolio.Id,
                UserId = existingPortfolio.UserId,
                UpdatedAt = existingPortfolio.UpdatedAt.Value
            };
            await _messageBus.PublishAsync(updateEvent, "portfolio.updated", cancellationToken);

            return MapToDto(existingPortfolio);
        }
        else
        {
            // Create new portfolio
            var portfolio = new PortfolioEntity
            {
                Id = Guid.NewGuid(),
                TenantId = command.TenantId,
                UserId = command.UserId,
                Title = portfolioData.Title,
                Slug = slug,
                Subtitle = portfolioData.Subtitle,
                Bio = portfolioData.Bio,
                ProfileImageUrl = user.ProfileImageUrl,
                LinkedInUrl = command.Data.LinkedInUrl,
                ResumeUrl = command.Data.PdfUrl,
                Template = PortfolioTemplate.Modern,
                TemplateId = command.Data.TemplateId,
                IsPublished = false,
                FeaturedBlogsEnabled = false,
                Data = portfolioData.Data,
                CreatedAt = DateTime.UtcNow,
                LastGeneratedAt = DateTime.UtcNow
            };

            await _portfolioRepository.AddAsync(portfolio, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Publish generation event
            var @event = new PortfolioGeneratedEvent(
                portfolio.Id,
                portfolio.TenantId,
                portfolio.UserId,
                portfolio.Title,
                portfolio.Template.ToString()
            );
            await _messageBus.PublishAsync(@event, "portfolio.generated", cancellationToken);

            return MapToDto(portfolio);
        }
    }

    private async Task<ParsedPortfolioData> ParseResumeDataAsync(GeneratePortfolioDto dto, CancellationToken cancellationToken)
    {
        // PLACEHOLDER: This is where Perplexity/Gemini API integration would go
        // For now, return placeholder data or extract basic text

        if (!string.IsNullOrEmpty(dto.ResumeText))
        {
            // Use provided text
            return new ParsedPortfolioData
            {
                Title = "Professional Portfolio",
                Subtitle = "Software Developer",
                Bio = dto.ResumeText.Length > 500 ? dto.ResumeText.Substring(0, 500) : dto.ResumeText,
                Data = new PortfolioData
                {
                    WorkExperiences = new List<WorkExperience>
                    {
                        new WorkExperience
                        {
                            Company = "Example Company",
                            Position = "Software Developer",
                            StartDate = DateTime.UtcNow.AddYears(-2),
                            IsCurrent = true,
                            Description = "Extracted from resume text (placeholder)"
                        }
                    },
                    Skills = new List<Skill>
                    {
                        new Skill { Name = "C#", Level = SkillLevel.Advanced },
                        new Skill { Name = ".NET", Level = SkillLevel.Advanced },
                        new Skill { Name = "Angular", Level = SkillLevel.Intermediate }
                    }
                }
            };
        }

        // Default placeholder data
        return new ParsedPortfolioData
        {
            Title = "My Professional Portfolio",
            Subtitle = "Experienced Professional",
            Bio = "This portfolio was generated from your resume. Please update the information to reflect your experience.",
            Data = new PortfolioData
            {
                WorkExperiences = new List<WorkExperience>
                {
                    new WorkExperience
                    {
                        Company = "Your Company",
                        Position = "Your Position",
                        StartDate = DateTime.UtcNow.AddYears(-1),
                        IsCurrent = true,
                        Description = "Add your work experience details here"
                    }
                },
                Skills = new List<Skill>
                {
                    new Skill { Name = "Skill 1", Level = SkillLevel.Intermediate },
                    new Skill { Name = "Skill 2", Level = SkillLevel.Advanced }
                },
                Educations = new List<Education>
                {
                    new Education
                    {
                        Institution = "Your University",
                        Degree = "Your Degree",
                        StartDate = DateTime.UtcNow.AddYears(-4),
                        EndDate = DateTime.UtcNow
                    }
                }
            }
        };
    }

    private string GenerateSlug(string name)
    {
        return name.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace(".", "")
            .Replace(",", "");
    }

    private PortfolioDto MapToDto(PortfolioEntity portfolio)
    {
        return new PortfolioDto
        {
            Id = portfolio.Id,
            TenantId = portfolio.TenantId,
            UserId = portfolio.UserId,
            Title = portfolio.Title,
            Slug = portfolio.Slug,
            Subtitle = portfolio.Subtitle,
            Bio = portfolio.Bio,
            ProfileImageUrl = portfolio.ProfileImageUrl,
            ResumeUrl = portfolio.ResumeUrl,
            LinkedInUrl = portfolio.LinkedInUrl,
            GitHubUrl = portfolio.GitHubUrl,
            WebsiteUrl = portfolio.WebsiteUrl,
            Template = portfolio.Template.ToString(),
            TemplateId = portfolio.TemplateId,
            IsPublished = portfolio.IsPublished,
            FeaturedBlogsEnabled = portfolio.FeaturedBlogsEnabled,
            MaxFeaturedBlogs = portfolio.MaxFeaturedBlogs,
            Data = portfolio.Data,
            CreatedAt = portfolio.CreatedAt,
            UpdatedAt = portfolio.UpdatedAt,
            PublishedAt = portfolio.PublishedAt
        };
    }

    private class ParsedPortfolioData
    {
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? Bio { get; set; }
        public PortfolioData Data { get; set; } = new();
    }
}

public class UpdatePortfolioCommandHandler : ICommandHandler<UpdatePortfolioCommand, PortfolioDto>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePortfolioCommandHandler(
        IPortfolioRepository portfolioRepository,
        IUnitOfWork unitOfWork)
    {
        _portfolioRepository = portfolioRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PortfolioDto> HandleAsync(UpdatePortfolioCommand command, CancellationToken cancellationToken = default)
    {
        var portfolio = await _portfolioRepository.GetByIdAsync(command.PortfolioId, cancellationToken);
        if (portfolio == null || portfolio.TenantId != command.TenantId)
        {
            throw new KeyNotFoundException($"Portfolio with ID '{command.PortfolioId}' not found in this tenant.");
        }

        if (command.Data.Title != null)
            portfolio.Title = command.Data.Title;

        if (command.Data.Subtitle != null)
            portfolio.Subtitle = command.Data.Subtitle;

        if (command.Data.Bio != null)
            portfolio.Bio = command.Data.Bio;

        if (command.Data.ProfileImageUrl != null)
            portfolio.ProfileImageUrl = command.Data.ProfileImageUrl;

        if (command.Data.ResumeUrl != null)
            portfolio.ResumeUrl = command.Data.ResumeUrl;

        if (command.Data.LinkedInUrl != null)
            portfolio.LinkedInUrl = command.Data.LinkedInUrl;

        if (command.Data.GitHubUrl != null)
            portfolio.GitHubUrl = command.Data.GitHubUrl;

        if (command.Data.WebsiteUrl != null)
            portfolio.WebsiteUrl = command.Data.WebsiteUrl;

        if (command.Data.Template != null && Enum.TryParse<PortfolioTemplate>(command.Data.Template, out var template))
            portfolio.Template = template;

        if (command.Data.FeaturedBlogsEnabled.HasValue)
            portfolio.FeaturedBlogsEnabled = command.Data.FeaturedBlogsEnabled.Value;

        if (command.Data.MaxFeaturedBlogs.HasValue)
            portfolio.MaxFeaturedBlogs = command.Data.MaxFeaturedBlogs.Value;

        if (command.Data.Data != null)
            portfolio.Data = command.Data.Data;

        if (command.Data.IsPublished.HasValue)
        {
            portfolio.IsPublished = command.Data.IsPublished.Value;
            if (command.Data.IsPublished.Value && portfolio.PublishedAt == null)
                portfolio.PublishedAt = DateTime.UtcNow;
        }

        portfolio.UpdatedAt = DateTime.UtcNow;

        await _portfolioRepository.UpdateAsync(portfolio, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new PortfolioDto
        {
            Id = portfolio.Id,
            TenantId = portfolio.TenantId,
            UserId = portfolio.UserId,
            Title = portfolio.Title,
            Slug = portfolio.Slug,
            Subtitle = portfolio.Subtitle,
            Bio = portfolio.Bio,
            ProfileImageUrl = portfolio.ProfileImageUrl,
            ResumeUrl = portfolio.ResumeUrl,
            LinkedInUrl = portfolio.LinkedInUrl,
            GitHubUrl = portfolio.GitHubUrl,
            WebsiteUrl = portfolio.WebsiteUrl,
            Template = portfolio.Template.ToString(),
            FeaturedBlogsEnabled = portfolio.FeaturedBlogsEnabled,
            MaxFeaturedBlogs = portfolio.MaxFeaturedBlogs,
            IsPublished = portfolio.IsPublished,
            PublishedAt = portfolio.PublishedAt,
            Data = portfolio.Data,
            CreatedAt = portfolio.CreatedAt,
            UpdatedAt = portfolio.UpdatedAt
        };
    }
}

public class ImportLinkedInCommandHandler : ICommandHandler<ImportLinkedInCommand, PortfolioDto>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IMessageBus _messageBus;
    private readonly IUnitOfWork _unitOfWork;

    public ImportLinkedInCommandHandler(
        IPortfolioRepository portfolioRepository,
        IMessageBus messageBus,
        IUnitOfWork unitOfWork)
    {
        _portfolioRepository = portfolioRepository;
        _messageBus = messageBus;
        _unitOfWork = unitOfWork;
    }

    public async Task<PortfolioDto> HandleAsync(ImportLinkedInCommand command, CancellationToken cancellationToken = default)
    {
        // Get or create portfolio
        var portfolio = await _portfolioRepository.GetByUserIdAsync(command.UserId, command.TenantId, cancellationToken);
        
        if (portfolio == null)
        {
            portfolio = new PortfolioEntity
            {
                Id = Guid.NewGuid(),
                TenantId = command.TenantId,
                UserId = command.UserId,
                Title = "My Portfolio",
                Template = PortfolioTemplate.Modern,
                CreatedAt = DateTime.UtcNow
            };
            await _portfolioRepository.AddAsync(portfolio, cancellationToken);
        }

        // TODO: Implement LinkedIn API integration to fetch profile data
        // For now, this is a placeholder that would call LinkedIn API
        // and populate portfolio.Data with work experience, education, skills, etc.

        portfolio.LastGeneratedAt = DateTime.UtcNow;
        portfolio.UpdatedAt = DateTime.UtcNow;

        await _portfolioRepository.UpdateAsync(portfolio, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var @event = new PortfolioGeneratedEvent(
            portfolio.Id,
            portfolio.TenantId,
            portfolio.UserId,
            portfolio.Title,
            portfolio.Template.ToString()
        );
        await _messageBus.PublishAsync(@event, "portfolio.generated", cancellationToken);

        return new PortfolioDto
        {
            Id = portfolio.Id,
            TenantId = portfolio.TenantId,
            UserId = portfolio.UserId,
            Title = portfolio.Title,
            Subtitle = portfolio.Subtitle,
            Bio = portfolio.Bio,
            ProfileImageUrl = portfolio.ProfileImageUrl,
            ResumeUrl = portfolio.ResumeUrl,
            LinkedInUrl = portfolio.LinkedInUrl,
            GitHubUrl = portfolio.GitHubUrl,
            WebsiteUrl = portfolio.WebsiteUrl,
            Template = portfolio.Template.ToString(),
            FeaturedBlogsEnabled = portfolio.FeaturedBlogsEnabled,
            MaxFeaturedBlogs = portfolio.MaxFeaturedBlogs,
            Data = portfolio.Data,
            CreatedAt = portfolio.CreatedAt,
            UpdatedAt = portfolio.UpdatedAt
        };
    }
}

public class ImportResumeCommandHandler : ICommandHandler<ImportResumeCommand, PortfolioDto>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IMessageBus _messageBus;
    private readonly IUnitOfWork _unitOfWork;

    public ImportResumeCommandHandler(
        IPortfolioRepository portfolioRepository,
        IMessageBus messageBus,
        IUnitOfWork unitOfWork)
    {
        _portfolioRepository = portfolioRepository;
        _messageBus = messageBus;
        _unitOfWork = unitOfWork;
    }

    public async Task<PortfolioDto> HandleAsync(ImportResumeCommand command, CancellationToken cancellationToken = default)
    {
        // Get or create portfolio
        var portfolio = await _portfolioRepository.GetByUserIdAsync(command.UserId, command.TenantId, cancellationToken);
        
        if (portfolio == null)
        {
            portfolio = new PortfolioEntity
            {
                Id = Guid.NewGuid(),
                TenantId = command.TenantId,
                UserId = command.UserId,
                Title = "My Portfolio",
                Template = PortfolioTemplate.Modern,
                CreatedAt = DateTime.UtcNow
            };
            await _portfolioRepository.AddAsync(portfolio, cancellationToken);
        }

        portfolio.ResumeUrl = command.Data.ResumeUrl;

        // TODO: Implement AI-assisted resume parsing
        // This would use OCR/NLP to extract sections from resume
        // and populate portfolio.Data

        portfolio.LastGeneratedAt = DateTime.UtcNow;
        portfolio.UpdatedAt = DateTime.UtcNow;

        await _portfolioRepository.UpdateAsync(portfolio, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var @event = new PortfolioGeneratedEvent(
            portfolio.Id,
            portfolio.TenantId,
            portfolio.UserId,
            portfolio.Title,
            portfolio.Template.ToString()
        );
        await _messageBus.PublishAsync(@event, "portfolio.generated", cancellationToken);

        return new PortfolioDto
        {
            Id = portfolio.Id,
            TenantId = portfolio.TenantId,
            UserId = portfolio.UserId,
            Title = portfolio.Title,
            Subtitle = portfolio.Subtitle,
            Bio = portfolio.Bio,
            ProfileImageUrl = portfolio.ProfileImageUrl,
            ResumeUrl = portfolio.ResumeUrl,
            LinkedInUrl = portfolio.LinkedInUrl,
            GitHubUrl = portfolio.GitHubUrl,
            WebsiteUrl = portfolio.WebsiteUrl,
            Template = portfolio.Template.ToString(),
            FeaturedBlogsEnabled = portfolio.FeaturedBlogsEnabled,
            MaxFeaturedBlogs = portfolio.MaxFeaturedBlogs,
            Data = portfolio.Data,
            CreatedAt = portfolio.CreatedAt,
            UpdatedAt = portfolio.UpdatedAt
        };
    }
}
