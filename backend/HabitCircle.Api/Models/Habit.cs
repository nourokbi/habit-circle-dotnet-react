using HabitCircle.Models;

namespace HabitCircle.Api.Models;

public class Habit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public FrequencyType FrequencyType { get; set; } = FrequencyType.Daily;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    // A habit can be shared into many circles
    public ICollection<CircleHabit> CircleHabits { get; set; } = new List<CircleHabit>();
    public ICollection<HabitLog> Logs { get; set; } = new List<HabitLog>();
}