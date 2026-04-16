using HabitCircle.Api.Data;
using HabitCircle.DTOs.Habit;
using HabitCircle.Api.Models;
using Microsoft.EntityFrameworkCore;
using HabitCircle.Api.Helpers;

namespace HabitCircle.Services;

public class HabitService
{
  private readonly AppDbContext _db;

  public HabitService(AppDbContext db)
  {
    _db = db;
  }

  public async Task<(bool success, string message, HabitResponse? habit)> CreateAsync(
    CreateHabitRequest request, Guid userId)
  {
    var habit = new Habit
    {
      Title = request.Title,
      Description = request.Description,
      FrequencyType = request.FrequencyType,
      UserId = userId
    };

    _db.Habits.Add(habit);

    // If circle IDs were provided, validate and share immediately
    if (request.CircleIds != null && request.CircleIds.Count > 0)
    {
      foreach (var circleId in request.CircleIds)
      {
        // Confirm the user is actually a member of this circle
        var isMember = await _db.CircleMembers
            .AnyAsync(cm => cm.CircleId == circleId && cm.UserId == userId);

        if (!isMember)
          return (false, $"You are not a member of circle {circleId}.", null);

        _db.CircleHabits.Add(new CircleHabit
        {
          HabitId = habit.Id,
          CircleId = circleId
        });
      }
    }

    await _db.SaveChangesAsync();

    // Reload with circle info for the response
    var created = await _db.Habits
        .Include(h => h.Logs)
        .Include(h => h.CircleHabits)
            .ThenInclude(ch => ch.Circle)
        .AsSplitQuery()
        .FirstAsync(h => h.Id == habit.Id);

    return (true, "Habit created.", MapToResponse(created, created.Logs.ToList()));
  }

  public async Task<List<HabitResponse>> GetMyHabitsAsync(Guid userId)
  {
    var habits = await _db.Habits
        .Where(h => h.UserId == userId)
        .Include(h => h.Logs)
        .Include(h => h.CircleHabits)
            .ThenInclude(ch => ch.Circle)
        .AsSplitQuery()
        .ToListAsync();

    return habits.Select(h => MapToResponse(h, h.Logs.ToList())).ToList();
  }

  public async Task<HabitResponse?> GetByIdAsync(Guid habitId, Guid userId)
  {
    var habit = await _db.Habits
        .Include(h => h.Logs)
        .Include(h => h.CircleHabits)
            .ThenInclude(ch => ch.Circle)
        .AsSplitQuery()
        .FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);

    if (habit == null) return null;
    return MapToResponse(habit, habit.Logs.ToList());
  }

  public async Task<(bool success, string message, HabitLogResponse? log)> LogAsync(
      Guid habitId, LogHabitRequest request, Guid userId)
  {
    // Make sure the habit belongs to this user
    var habit = await _db.Habits
        .FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);

    if (habit == null)
      return (false, "Habit not found.", null);

    // Prevent logging the same habit twice in one day
    var today = DateTime.UtcNow.Date;
    var alreadyLoggedToday = await _db.HabitLogs
        .AnyAsync(l => l.HabitId == habitId && l.LoggedAt.Date == today);

    if (alreadyLoggedToday)
      return (false, "Already logged today.", null);

    var log = new HabitLog
    {
      HabitId = habitId,
      Note = request.Note
    };

    _db.HabitLogs.Add(log);
    await _db.SaveChangesAsync();

    return (true, "Logged successfully.", new HabitLogResponse
    {
      Id = log.Id,
      LoggedAt = log.LoggedAt,
      Note = log.Note
    });
  }

  public async Task<List<HabitLogResponse>> GetLogsAsync(Guid habitId, Guid userId)
  {
    // Confirm the habit belongs to the user
    var habitExists = await _db.Habits
        .AnyAsync(h => h.Id == habitId && h.UserId == userId);

    if (!habitExists) return new List<HabitLogResponse>();

    return await _db.HabitLogs
        .Where(l => l.HabitId == habitId)
        .OrderByDescending(l => l.LoggedAt)
        .Select(l => new HabitLogResponse
        {
          Id = l.Id,
          LoggedAt = l.LoggedAt,
          Note = l.Note
        })
        .ToListAsync();
  }
  public async Task<(bool success, string message)> DeleteTodayLogAsync(Guid habitId, Guid userId)
  {
    // Make sure the habit belongs to this user
    var habit = await _db.Habits
        .FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);

    if (habit == null)
      return (false, "Habit not found.");

    var today = DateTime.UtcNow.Date;

    var log = await _db.HabitLogs
        .FirstOrDefaultAsync(l => l.HabitId == habitId && l.LoggedAt.Date == today);

    if (log == null)
      return (false, "No log found for today.");

    _db.HabitLogs.Remove(log);
    await _db.SaveChangesAsync();
    return (true, "Log removed.");
  }

  public async Task<(bool success, string message)> DeleteAsync(Guid habitId, Guid userId)
  {
    var habit = await _db.Habits
        .FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);

    if (habit == null)
      return (false, "Habit not found.");

    _db.Habits.Remove(habit);
    await _db.SaveChangesAsync();
    return (true, "Habit deleted.");
  }

  public async Task<(bool success, string message, HabitResponse? habit)> UpdateAsync(
    Guid habitId, UpdateHabitRequest request, Guid userId)
  {
    var habit = await _db.Habits
        .Include(h => h.Logs)
        .Include(h => h.CircleHabits)
            .ThenInclude(ch => ch.Circle)
        .AsSplitQuery()
        .FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);

    if (habit == null)
      return (false, "Habit not found.", null);

    // Only update fields that were actually sent (null = don't change)
    if (request.Title != null)
      habit.Title = request.Title;

    if (request.Description != null)
      habit.Description = request.Description;

    if (request.FrequencyType != null)
      habit.FrequencyType = request.FrequencyType.Value;

    // Handle circle changes if CircleIds was sent
    if (request.CircleIds != null)
    {
      var requestedCircleIds = request.CircleIds.Distinct().ToList();

      // Validate membership for each requested circle first
      foreach (var circleId in requestedCircleIds)
      {
        var isMember = await _db.CircleMembers
            .AnyAsync(cm => cm.CircleId == circleId && cm.UserId == userId);

        if (!isMember)
          return (false, $"You are not a member of circle {circleId}.", null);
      }

      var requestedSet = requestedCircleIds.ToHashSet();

      // Remove shares that are no longer requested
      var toRemove = habit.CircleHabits
          .Where(ch => !requestedSet.Contains(ch.CircleId))
          .ToList();
      _db.CircleHabits.RemoveRange(toRemove);

      // Add any missing shares
      var existingSet = habit.CircleHabits.Select(ch => ch.CircleId).ToHashSet();
      var toAdd = requestedCircleIds.Where(id => !existingSet.Contains(id));

      foreach (var circleId in toAdd)
      {
        _db.CircleHabits.Add(new CircleHabit
        {
          HabitId = habitId,
          CircleId = circleId
        });
      }
    }

    await _db.SaveChangesAsync();

    // Reload fresh after save
    var updated = await _db.Habits
        .Include(h => h.Logs)
        .Include(h => h.CircleHabits)
            .ThenInclude(ch => ch.Circle)
        .AsSplitQuery()
        .FirstAsync(h => h.Id == habitId);

    return (true, "Habit updated.", MapToResponse(updated, updated.Logs.ToList()));
  }

  // ── Helpers ──────────────────────────────────────────────

  private static HabitResponse MapToResponse(Habit habit, List<HabitLog> logs)
  {
    var today = DateTime.UtcNow.Date;

    return new HabitResponse
    {
      Id = habit.Id,
      Title = habit.Title,
      Description = habit.Description,
      FrequencyType = habit.FrequencyType.ToString(),
      CreatedAt = habit.CreatedAt,
      TotalLogs = logs.Count,
      LoggedToday = logs.Any(l => l.LoggedAt.Date == today),
      CurrentStreak = HabitHelpers.CalculateStreak(logs.Select(l => l.LoggedAt)),
      SharedInCircles = habit.CircleHabits?.Select(ch => new SharedCircleInfo
      {
        CircleId = ch.CircleId,
        CircleName = ch.Circle.Name,
        SharedAt = ch.SharedAt
      }).ToList() ?? new()
    };
  }
}