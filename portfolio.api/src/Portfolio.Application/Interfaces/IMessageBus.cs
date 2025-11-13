using Portfolio.Domain.Events;

namespace Portfolio.Application.Interfaces;

public interface IMessageBus
{
    Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default) where TEvent : DomainEvent;
    Task PublishAsync<TEvent>(TEvent @event, string topic, CancellationToken cancellationToken = default) where TEvent : DomainEvent;
}
