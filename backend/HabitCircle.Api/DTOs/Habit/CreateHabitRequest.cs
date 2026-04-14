using HabitCircle.Models;

namespace HabitCircle.DTOs.Habit;

public class CreateHabitRequest
{
  public string Title { get; set; } = string.Empty;
  public string? Description { get; set; }
  public FrequencyType FrequencyType { get; set; } = FrequencyType.Daily;
  public List<Guid>? CircleIds { get; set; }
}