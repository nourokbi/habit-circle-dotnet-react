namespace HabitCircle.DTOs.Habit;

public class HabitLogResponse
{
  public Guid Id { get; set; }
  public DateTime LoggedAt { get; set; }
  public string? Note { get; set; }
}