namespace HabitCircle.Api.Helpers;

public static class CircleHelpers
{
  private const string Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  public static string GenerateInviteCode(int length = 6)
  {
    var random = new Random();
    return new string(Enumerable.Range(0, length)
        .Select(_ => Chars[random.Next(Chars.Length)])
        .ToArray());
  }
}