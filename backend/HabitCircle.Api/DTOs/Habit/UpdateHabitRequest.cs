using HabitCircle.Models;

namespace HabitCircle.DTOs.Habit;

public class UpdateHabitRequest
{
  public string? Title { get; set; }
  public string? Description { get; set; }
  public FrequencyType? FrequencyType { get; set; }

  // The NEW complete list of circles — replaces whatever was there before
  // Send null to leave circles unchanged, send empty list [] to remove from all circles
  public List<Guid>? CircleIds { get; set; }
}