namespace HabitCircle.DTOs.Habit;

public class HabitResponse
{
  public Guid Id { get; set; }
  public string Title { get; set; } = string.Empty;
  public string? Description { get; set; }
  public string FrequencyType { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; }
  public int CurrentStreak { get; set; }
  public int TotalLogs { get; set; }
  public bool LoggedToday { get; set; }

  // Which circles this habit is visible in
  public List<SharedCircleInfo> SharedInCircles { get; set; } = new();
}

public class SharedCircleInfo
{
  public Guid CircleId { get; set; }
  public string CircleName { get; set; } = string.Empty;
  public DateTime SharedAt { get; set; }
}