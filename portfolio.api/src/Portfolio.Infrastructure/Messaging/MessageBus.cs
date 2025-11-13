using Confluent.Kafka;
using Portfolio.Application.Interfaces;
using Portfolio.Domain.Events;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Portfolio.Infrastructure.Messaging;

public class KafkaMessageBus : IMessageBus
{
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<KafkaMessageBus> _logger;
    private readonly bool _isEnabled;

    public KafkaMessageBus(IConfiguration configuration, ILogger<KafkaMessageBus> logger)
    {
        _logger = logger;
        _isEnabled = configuration.GetValue<bool>("Kafka:Enabled", false);

        if (_isEnabled)
        {
            var config = new ProducerConfig
            {
                BootstrapServers = configuration["Kafka:BootstrapServers"] ?? "localhost:9092",
                ClientId = "portfolio-api",
                Acks = Acks.All,
                EnableIdempotence = true
            };

            _producer = new ProducerBuilder<string, string>(config).Build();
            _logger.LogInformation("Kafka producer initialized");
        }
        else
        {
            _producer = null!;
            _logger.LogInformation("Kafka is disabled, using in-memory message bus");
        }
    }

    public async Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default) where TEvent : DomainEvent
    {
        var topic = GetTopicName(@event);
        await PublishAsync(@event, topic, cancellationToken);
    }

    public async Task PublishAsync<TEvent>(TEvent @event, string topic, CancellationToken cancellationToken = default) where TEvent : DomainEvent
    {
        if (!_isEnabled)
        {
            _logger.LogInformation("Event {@Event} published to topic {Topic} (mock mode)", @event, topic);
            return;
        }

        try
        {
            var message = new Message<string, string>
            {
                Key = @event.Id.ToString(),
                Value = JsonSerializer.Serialize(@event),
                Headers = new Headers
                {
                    { "event-type", System.Text.Encoding.UTF8.GetBytes(@event.EventType) },
                    { "event-id", System.Text.Encoding.UTF8.GetBytes(@event.Id.ToString()) },
                    { "occurred-at", System.Text.Encoding.UTF8.GetBytes(@event.OccurredAt.ToString("O")) }
                }
            };

            var result = await _producer.ProduceAsync(topic, message, cancellationToken);
            _logger.LogInformation(
                "Event {EventType} published to topic {Topic} at offset {Offset}",
                @event.EventType,
                topic,
                result.Offset);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish event {EventType} to topic {Topic}", @event.EventType, topic);
            throw;
        }
    }

    private static string GetTopicName<TEvent>(TEvent @event) where TEvent : DomainEvent
    {
        return @event.EventType.ToLowerInvariant() switch
        {
            "tenantcreatedevent" => "tenants.created",
            "blogcreatedevent" => "blogs.created",
            "portfoliogeneratedevent" => "portfolio.generated",
            _ => "domain.events"
        };
    }
}

public class InMemoryMessageBus : IMessageBus
{
    private readonly ILogger<InMemoryMessageBus> _logger;

    public InMemoryMessageBus(ILogger<InMemoryMessageBus> logger)
    {
        _logger = logger;
    }

    public Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken = default) where TEvent : DomainEvent
    {
        _logger.LogInformation("InMemory: Event {@Event} published", @event);
        return Task.CompletedTask;
    }

    public Task PublishAsync<TEvent>(TEvent @event, string topic, CancellationToken cancellationToken = default) where TEvent : DomainEvent
    {
        _logger.LogInformation("InMemory: Event {@Event} published to topic {Topic}", @event, topic);
        return Task.CompletedTask;
    }
}
