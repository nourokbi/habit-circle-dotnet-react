namespace HabitCircle.Api.Models;

public class CircleHabit
{
  public Guid HabitId { get; set; }
  public Habit Habit { get; set; } = null!;

  public Guid CircleId { get; set; }
  public Circle Circle { get; set; } = null!;

  // When the user shared this habit into the circle
  public DateTime SharedAt { get; set; } = DateTime.UtcNow;
}