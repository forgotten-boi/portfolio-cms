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

        portfolio.UpdatedAt = DateTime.UtcNow;

        await _portfolioRepository.UpdateAsync(portfolio, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
