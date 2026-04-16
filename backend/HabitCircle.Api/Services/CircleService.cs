using HabitCircle.Api.Data;
using HabitCircle.DTOs.Circle;
using HabitCircle.Api.Models;
using Microsoft.EntityFrameworkCore;
using HabitCircle.Api.Helpers;

namespace HabitCircle.Services;

public class CircleService
{
    private readonly AppDbContext _db;

    public CircleService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CircleResponse> CreateAsync(CreateCircleRequest request, Guid userId)
    {
        var circle = new Circle
        {
            Name = request.Name,
            Description = request.Description,
            CreatedByUserId = userId,
            InviteCode = CircleHelpers.GenerateInviteCode()
        };

        // Creator automatically becomes an admin member
        var membership = new CircleMember
        {
            UserId = userId,
            CircleId = circle.Id,
            Role = "admin"
        };

        _db.Circles.Add(circle);
        _db.CircleMembers.Add(membership);
        await _db.SaveChangesAsync();

        return await GetByIdAsync(circle.Id, userId) ?? throw new Exception("Failed to load circle.");
    }

    public async Task<CircleResponse?> GetByIdAsync(Guid circleId, Guid requestingUserId)
    {
        // Only members can see a circle
        var isMember = await _db.CircleMembers
            .AnyAsync(cm => cm.CircleId == circleId && cm.UserId == requestingUserId);

        if (!isMember) return null;

        var circle = await _db.Circles
            .Include(c => c.Members)
            .ThenInclude(m => m.User)
            .Include(c => c.CircleHabits)
            .AsSplitQuery()
            .FirstOrDefaultAsync(c => c.Id == circleId);

        if (circle == null) return null;

        return MapToResponse(circle);
    }

    public async Task<CirclePageResponse?> GetPageAsync(Guid circleId, Guid requestingUserId)
    {
        // Only members can see a circle
        var isMember = await _db.CircleMembers
            .AnyAsync(cm => cm.CircleId == circleId && cm.UserId == requestingUserId);

        if (!isMember) return null;

        var circle = await _db.Circles
            .AsNoTracking()
            .Include(c => c.Members)
                .ThenInclude(m => m.User)
            .Include(c => c.CircleHabits)
                .ThenInclude(ch => ch.Habit)
                    .ThenInclude(h => h.User)
            .Include(c => c.CircleHabits)
                .ThenInclude(ch => ch.Habit)
                    .ThenInclude(h => h.Logs)
            .AsSplitQuery()
            .FirstOrDefaultAsync(c => c.Id == circleId);

        if (circle == null) return null;

        var now = DateTime.UtcNow;
        var today = now.Date;
        var weekAgo = now.AddDays(-7);

        var sharedHabits = circle.CircleHabits
            .Select(ch => ch.Habit)
            .Where(h => h != null)
            .ToList()!;

        var totalLogsThisWeek = sharedHabits.Sum(h => h.Logs.Count(l => l.LoggedAt >= weekAgo));

        var longestHabit = sharedHabits
            .Select(h => new
            {
                Habit = h,
                Streak = HabitHelpers.CalculateStreak(h.Logs.Select(l => l.LoggedAt))
            })
            .OrderByDescending(x => x.Streak)
            .FirstOrDefault();

        var response = new CirclePageResponse
        {
            Id = circle.Id,
            Name = circle.Name,
            Description = circle.Description,
            MemberCount = circle.Members.Count,
            SharedHabitsCount = circle.CircleHabits.Count,
            Stats = new CirclePageStats
            {
                TotalLogsThisWeek = totalLogsThisWeek,
                LongestStreak = longestHabit?.Streak ?? 0,
                LongestStreakUsername = longestHabit?.Habit.User.Username,
                LongestStreakHabitTitle = longestHabit?.Habit.Title
            },
            Members = circle.Members
                .OrderBy(m => m.JoinedAt)
                .Select(m => new CircleMemberHabitsResponse
                {
                    UserId = m.UserId,
                    Username = m.User.Username,
                    Role = m.Role,
                    JoinedAt = m.JoinedAt,
                    Habits = sharedHabits
                        .Where(h => h.UserId == m.UserId)
                        .OrderBy(h => h.Title)
                        .Select(h =>
                        {
                            var logDates = h.Logs.Select(l => l.LoggedAt);
                            return new CircleMemberHabitResponse
                            {
                                HabitId = h.Id,
                                Title = h.Title,
                                Description = h.Description,
                                FrequencyType = h.FrequencyType.ToString(),
                                CurrentStreak = HabitHelpers.CalculateStreak(logDates),
                                DaysLogged = logDates.Select(d => d.Date).Distinct().Count(),
                                LoggedToday = logDates.Any(d => d.Date == today)
                            };
                        })
                        .ToList()
                })
                .ToList()
        };

        return response;
    }

    public async Task<(bool success, string message, CircleResponse? circle)> JoinAsync(string inviteCode, Guid userId)
    {
        var circle = await _db.Circles
            .Include(c => c.Members)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(c => c.InviteCode == inviteCode);

        if (circle == null)
            return (false, "Invalid invite code.", null);

        var alreadyMember = circle.Members.Any(m => m.UserId == userId);
        if (alreadyMember)
            return (false, "You are already in this circle.", null);

        var membership = new CircleMember
        {
            UserId = userId,
            CircleId = circle.Id,
            Role = "member"
        };

        _db.CircleMembers.Add(membership);
        await _db.SaveChangesAsync();

        // Reload to include the new member in the response
        return (true, "Joined successfully.", await GetByIdAsync(circle.Id, userId));
    }

    public async Task<(bool success, string message)> ShareHabitAsync(
        Guid circleId, ShareHabitRequest request, Guid userId)
    {
        // Confirm the user is a member of this circle
        var isMember = await _db.CircleMembers
            .AnyAsync(cm => cm.CircleId == circleId && cm.UserId == userId);

        if (!isMember)
            return (false, "You are not a member of this circle.");

        // Confirm the habit belongs to the user
        var habit = await _db.Habits
            .FirstOrDefaultAsync(h => h.Id == request.HabitId && h.UserId == userId);

        if (habit == null)
            return (false, "Habit not found or doesn't belong to you.");

        // Check not already shared
        var alreadyShared = await _db.CircleHabits
            .AnyAsync(ch => ch.HabitId == request.HabitId && ch.CircleId == circleId);

        if (alreadyShared)
            return (false, "This habit is already shared in this circle.");

        _db.CircleHabits.Add(new CircleHabit
        {
            HabitId = request.HabitId,
            CircleId = circleId
        });

        await _db.SaveChangesAsync();
        return (true, "Habit shared successfully.");
    }

    public async Task<List<CircleHabitResponse>> GetCircleHabitsAsync(Guid circleId, Guid requestingUserId)
    {
        var isMember = await _db.CircleMembers
            .AnyAsync(cm => cm.CircleId == circleId && cm.UserId == requestingUserId);

        if (!isMember) return new List<CircleHabitResponse>();

        var weekAgo = DateTime.UtcNow.AddDays(-7);

        var circleHabits = await _db.CircleHabits
            .Where(ch => ch.CircleId == circleId)
            .Include(ch => ch.Habit)
                .ThenInclude(h => h.User)
            .Include(ch => ch.Habit)
                .ThenInclude(h => h.Logs)
            .ToListAsync();

        return circleHabits.Select(ch => new CircleHabitResponse
        {
            HabitId = ch.HabitId,
            Title = ch.Habit.Title,
            Description = ch.Habit.Description,
            FrequencyType = ch.Habit.FrequencyType.ToString(),
            OwnerUsername = ch.Habit.User.Username,
            OwnerUserId = ch.Habit.UserId,
            SharedAt = ch.SharedAt,
            LogsThisWeek = ch.Habit.Logs.Count(l => l.LoggedAt >= weekAgo)
        }).ToList();
    }

    public async Task<List<CircleResponse>> GetMyCirclesAsync(Guid userId)
    {
        var circles = await _db.Circles
            .Include(c => c.Members)
                .ThenInclude(m => m.User)
            .Include(c => c.CircleHabits)
            .AsSplitQuery()
            .Where(c => c.Members.Any(m => m.UserId == userId))
            .ToListAsync();

        return circles.Select(MapToResponse).ToList();
    }

    public async Task<(bool success, string message)> DeleteAsync(Guid circleId, Guid requestingUserId)
    {
        var circle = await _db.Circles.FirstOrDefaultAsync(c => c.Id == circleId);
        if (circle == null)
            return (false, "Circle not found.");

        var isAdmin = await _db.CircleMembers.AnyAsync(cm =>
            cm.CircleId == circleId &&
            cm.UserId == requestingUserId &&
            cm.Role == "admin");

        if (!isAdmin)
            return (false, "Only circle admins can delete this circle.");

        var circleHabits = _db.CircleHabits.Where(ch => ch.CircleId == circleId);
        _db.CircleHabits.RemoveRange(circleHabits);

        var members = _db.CircleMembers.Where(cm => cm.CircleId == circleId);
        _db.CircleMembers.RemoveRange(members);

        _db.Circles.Remove(circle);
        await _db.SaveChangesAsync();

        return (true, "Circle deleted.");
    }

    //Helper method to convert Circle entity to CircleResponse DTO
    private static CircleResponse MapToResponse(Circle circle) => new()
    {
        Id = circle.Id,
        Name = circle.Name,
        Description = circle.Description,
        InviteCode = circle.InviteCode,
        CreatedAt = circle.CreatedAt,
        CircleHabits = circle.CircleHabits.Select(ch => ch.HabitId).ToList(),
        Members = circle.Members.Select(m => new MemberResponse
        {
            UserId = m.UserId,
            Username = m.User.Username,
            Role = m.Role,
            JoinedAt = m.JoinedAt
        }).ToList()
    };
}