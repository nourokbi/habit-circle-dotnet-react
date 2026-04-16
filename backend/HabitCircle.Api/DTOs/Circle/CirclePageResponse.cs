namespace HabitCircle.DTOs.Circle;

public class CirclePageResponse
{
  public Guid Id { get; set; }
  public string Name { get; set; } = string.Empty;
  public string? Description { get; set; }

  public int MemberCount { get; set; }
  public int SharedHabitsCount { get; set; }

  public CirclePageStats Stats { get; set; } = new();
  public List<CircleMemberHabitsResponse> Members { get; set; } = new();
}

public class CirclePageStats
{
  public int TotalLogsThisWeek { get; set; }

  public int LongestStreak { get; set; }
  public string? LongestStreakUsername { get; set; }
  public string? LongestStreakHabitTitle { get; set; }
}

public class CircleMemberHabitsResponse
{
  public Guid UserId { get; set; }
  public string Username { get; set; } = string.Empty;
  public string Role { get; set; } = string.Empty;
  public DateTime JoinedAt { get; set; }

  public List<CircleMemberHabitResponse> Habits { get; set; } = new();
}

public class CircleMemberHabitResponse
{
  public Guid HabitId { get; set; }
  public string Title { get; set; } = string.Empty;
  public string? Description { get; set; }
  public string FrequencyType { get; set; } = string.Empty;

  public int CurrentStreak { get; set; }
  public int DaysLogged { get; set; }
  public bool LoggedToday { get; set; }
}
