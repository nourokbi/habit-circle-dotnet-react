namespace HabitCircle.DTOs.Circle;

public class CircleResponse
{
  public Guid Id { get; set; }
  public string Name { get; set; } = string.Empty;
  public string? Description { get; set; }
  public string InviteCode { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; }
  public List<MemberResponse> Members { get; set; } = new();

  // Used by the frontend to show "X habits shared"
  public List<Guid> CircleHabits { get; set; } = new();
}

public class MemberResponse
{
  public Guid UserId { get; set; }
  public string Username { get; set; } = string.Empty;
  public string Role { get; set; } = string.Empty;
  public DateTime JoinedAt { get; set; }
}