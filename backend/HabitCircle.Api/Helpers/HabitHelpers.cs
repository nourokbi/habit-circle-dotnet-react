namespace HabitCircle.Api.Helpers;

public static class HabitHelpers
{
  public static int CalculateStreak(IEnumerable<DateTime> logDates)
  {
    if (!logDates.Any()) return 0;

    var loggedDays = logDates
        .Select(d => d.Date)
        .Distinct()
        .OrderByDescending(d => d)
        .ToList();

    var today = DateTime.UtcNow.Date;
    var streak = 0;
    var expected = loggedDays[0] == today ? today : today.AddDays(-1);

    foreach (var day in loggedDays)
    {
      if (day == expected)
      {
        streak++;
        expected = expected.AddDays(-1);
      }
      else break;
    }

    return streak;
  }
}