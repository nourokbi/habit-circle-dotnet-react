namespace HabitCircle.Api.Models
{
    public class Circle
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string InviteCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Guid CreatedByUserId { get; set; }
        public User CreatedBy { get; set; } = null!;

        public ICollection<CircleMember> Members { get; set; } = new List<CircleMember>();

        // Habits that members chose to share into this circle
        public ICollection<CircleHabit> CircleHabits { get; set; } = new List<CircleHabit>();
    }
}