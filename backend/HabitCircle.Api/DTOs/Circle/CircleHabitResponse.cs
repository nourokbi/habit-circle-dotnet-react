namespace HabitCircle.DTOs.Circle;

public class CircleHabitResponse
{
  public Guid HabitId { get; set; }
  public string Title { get; set; } = string.Empty;
  public string? Description { get; set; }
  public string FrequencyType { get; set; } = string.Empty;
  public string OwnerUsername { get; set; } = string.Empty;
  public Guid OwnerUserId { get; set; }
  public DateTime SharedAt { get; set; }

  // How many times logged this week
  public int LogsThisWeek { get; set; }
}