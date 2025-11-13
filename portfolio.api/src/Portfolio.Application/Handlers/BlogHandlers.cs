using Portfolio.Application.Commands;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Events;

namespace Portfolio.Application.Handlers;

// Blog Command Handlers
public class CreateBlogCommandHandler : ICommandHandler<CreateBlogCommand, BlogDto>
{
    private readonly IBlogRepository _blogRepository;
    private readonly IMessageBus _messageBus;
    private readonly IUnitOfWork _unitOfWork;

    public CreateBlogCommandHandler(
        IBlogRepository blogRepository,
        IMessageBus messageBus,
        IUnitOfWork unitOfWork)
    {
        _blogRepository = blogRepository;
        _messageBus = messageBus;
        _unitOfWork = unitOfWork;
    }

    public async Task<BlogDto> HandleAsync(CreateBlogCommand command, CancellationToken cancellationToken = default)
    {
        var slug = GenerateSlug(command.Data.Title);
        
        // Check if slug already exists
        var existingBlog = await _blogRepository.GetBySlugAsync(slug, command.TenantId, cancellationToken);
        if (existingBlog != null)
        {
            slug = $"{slug}-{Guid.NewGuid().ToString()[..8]}";
        }

        var blog = new Blog
        {
            Id = Guid.NewGuid(),
            TenantId = command.TenantId,
            AuthorId = command.AuthorId,
            Title = command.Data.Title,
            Slug = slug,
            Content = command.Data.Content,
            Summary = command.Data.Summary,
            HeaderImageUrl = command.Data.HeaderImageUrl,
            IsPublished = command.Data.IsPublished,
            PublishedAt = command.Data.IsPublished ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow,
            Tags = command.Data.Tags
        };

        await _blogRepository.AddAsync(blog, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Publish domain event
        var @event = new BlogCreatedEvent(blog.Id, blog.TenantId, blog.AuthorId, blog.Title, blog.IsPublished);
        await _messageBus.PublishAsync(@event, "blogs.created", cancellationToken);

        return new BlogDto
        {
            Id = blog.Id,
            TenantId = blog.TenantId,
            AuthorId = blog.AuthorId,
            Title = blog.Title,
            Slug = blog.Slug,
            Content = blog.Content,
            Summary = blog.Summary,
            HeaderImageUrl = blog.HeaderImageUrl,
            IsPublished = blog.IsPublished,
            PublishedAt = blog.PublishedAt,
            CreatedAt = blog.CreatedAt,
            ViewCount = blog.ViewCount,
            Tags = blog.Tags.ToList()
        };
    }

    private static string GenerateSlug(string title)
    {
        return title.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("\"", "")
            .Replace("?", "")
            .Replace("!", "")
            .Replace("&", "and");
    }
}

public class UpdateBlogCommandHandler : ICommandHandler<UpdateBlogCommand, BlogDto>
{
    private readonly IBlogRepository _blogRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateBlogCommandHandler(
        IBlogRepository blogRepository,
        IUnitOfWork unitOfWork)
    {
        _blogRepository = blogRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<BlogDto> HandleAsync(UpdateBlogCommand command, CancellationToken cancellationToken = default)
    {
        var blog = await _blogRepository.GetByIdAsync(command.BlogId, cancellationToken);
        if (blog == null || blog.TenantId != command.TenantId)
        {
            throw new KeyNotFoundException($"Blog with ID '{command.BlogId}' not found in this tenant.");
        }

        if (command.Data.Title != null)
            blog.Title = command.Data.Title;

        if (command.Data.Content != null)
            blog.Content = command.Data.Content;

        if (command.Data.Summary != null)
            blog.Summary = command.Data.Summary;

        if (command.Data.HeaderImageUrl != null)
            blog.HeaderImageUrl = command.Data.HeaderImageUrl;

        if (command.Data.IsPublished.HasValue && command.Data.IsPublished.Value && !blog.IsPublished)
        {
            blog.IsPublished = true;
            blog.PublishedAt = DateTime.UtcNow;
        }
        else if (command.Data.IsPublished.HasValue)
        {
            blog.IsPublished = command.Data.IsPublished.Value;
        }

        if (command.Data.Tags != null)
            blog.Tags = command.Data.Tags;

        blog.UpdatedAt = DateTime.UtcNow;

        await _blogRepository.UpdateAsync(blog, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new BlogDto
        {
            Id = blog.Id,
            TenantId = blog.TenantId,
            AuthorId = blog.AuthorId,
            Title = blog.Title,
            Slug = blog.Slug,
            Content = blog.Content,
            Summary = blog.Summary,
            HeaderImageUrl = blog.HeaderImageUrl,
            IsPublished = blog.IsPublished,
            PublishedAt = blog.PublishedAt,
            CreatedAt = blog.CreatedAt,
            UpdatedAt = blog.UpdatedAt,
            ViewCount = blog.ViewCount,
            Tags = blog.Tags.ToList()
        };
    }
}

public class DeleteBlogCommandHandler : ICommandHandler<DeleteBlogCommand, bool>
{
    private readonly IBlogRepository _blogRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteBlogCommandHandler(
        IBlogRepository blogRepository,
        IUnitOfWork unitOfWork)
    {
        _blogRepository = blogRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> HandleAsync(DeleteBlogCommand command, CancellationToken cancellationToken = default)
    {
        var blog = await _blogRepository.GetByIdAsync(command.BlogId, cancellationToken);
        if (blog == null || blog.TenantId != command.TenantId)
        {
            throw new KeyNotFoundException($"Blog with ID '{command.BlogId}' not found in this tenant.");
        }

        await _blogRepository.DeleteAsync(command.BlogId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
