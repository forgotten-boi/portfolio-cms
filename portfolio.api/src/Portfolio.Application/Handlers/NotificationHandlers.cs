using Portfolio.Application.Commands;
using Portfolio.Application.DTOs;
using Portfolio.Application.Interfaces;
using Portfolio.Application.Queries;
using Portfolio.Domain.Entities;
using Portfolio.Domain.Events;

namespace Portfolio.Application.Handlers;

// Notification Command Handlers
public class CreateNotificationCommandHandler : ICommandHandler<CreateNotificationCommand, NotificationDto>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IMessageBus _messageBus;
    private readonly IUnitOfWork _unitOfWork;

    public CreateNotificationCommandHandler(
        INotificationRepository notificationRepository,
        IMessageBus messageBus,
        IUnitOfWork unitOfWork)
    {
        _notificationRepository = notificationRepository;
        _messageBus = messageBus;
        _unitOfWork = unitOfWork;
    }

    public async Task<NotificationDto> HandleAsync(CreateNotificationCommand command, CancellationToken cancellationToken = default)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            TenantId = command.TenantId,
            UserId = command.UserId,
            Type = command.Data.Type,
            Message = command.Data.Message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepository.AddAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var @event = new NotificationCreatedEvent(
            notification.Id, notification.TenantId, notification.UserId,
            notification.Type, notification.Message);
        await _messageBus.PublishAsync(@event, "notifications.created", cancellationToken);

        return new NotificationDto
        {
            Id = notification.Id,
            TenantId = notification.TenantId,
            UserId = notification.UserId,
            Type = notification.Type,
            Message = notification.Message,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            ReadAt = notification.ReadAt
        };
    }
}

public class MarkAllNotificationsReadCommandHandler : ICommandHandler<MarkAllNotificationsReadCommand, bool>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public MarkAllNotificationsReadCommandHandler(
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork)
    {
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> HandleAsync(MarkAllNotificationsReadCommand command, CancellationToken cancellationToken = default)
    {
        await _notificationRepository.MarkAllAsReadAsync(command.UserId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public class ClearNotificationsCommandHandler : ICommandHandler<ClearNotificationsCommand, bool>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ClearNotificationsCommandHandler(
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork)
    {
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> HandleAsync(ClearNotificationsCommand command, CancellationToken cancellationToken = default)
    {
        await _notificationRepository.DeleteAllByUserIdAsync(command.UserId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

// Notification Query Handlers
public class GetNotificationsByUserQueryHandler : IQueryHandler<GetNotificationsByUserQuery, IEnumerable<NotificationDto>>
{
    private readonly INotificationRepository _notificationRepository;

    public GetNotificationsByUserQueryHandler(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<IEnumerable<NotificationDto>> HandleAsync(GetNotificationsByUserQuery query, CancellationToken cancellationToken = default)
    {
        var notifications = await _notificationRepository.GetByUserIdAsync(query.UserId, cancellationToken);

        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            TenantId = n.TenantId,
            UserId = n.UserId,
            Type = n.Type,
            Message = n.Message,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt,
            ReadAt = n.ReadAt
        });
    }
}

public class GetUnreadNotificationCountQueryHandler : IQueryHandler<GetUnreadNotificationCountQuery, int>
{
    private readonly INotificationRepository _notificationRepository;

    public GetUnreadNotificationCountQueryHandler(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<int> HandleAsync(GetUnreadNotificationCountQuery query, CancellationToken cancellationToken = default)
    {
        return await _notificationRepository.GetUnreadCountAsync(query.UserId, cancellationToken);
    }
}
