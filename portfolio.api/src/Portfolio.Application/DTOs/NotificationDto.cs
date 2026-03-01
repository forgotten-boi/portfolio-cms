namespace Portfolio.Application.DTOs;

public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
}

public class CreateNotificationDto
{
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
