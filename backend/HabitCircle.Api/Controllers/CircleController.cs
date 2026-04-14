using HabitCircle.DTOs.Circle;
using HabitCircle.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HabitCircle.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // every endpoint here requires a valid JWT
public class CircleController : ControllerBase
{
    private readonly CircleService _circleService;

    public CircleController(CircleService circleService)
    {
        _circleService = circleService;
    }

    // Helper — reads the user's id out of their JWT token
    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]  // POST api/circle
    public async Task<IActionResult> Create(CreateCircleRequest request)
    {
        var circle = await _circleService.CreateAsync(request, GetUserId());
        return Ok(circle);
    }

    [HttpGet("{id}")]  // GET api/circle/{id}
    public async Task<IActionResult> GetById(Guid id)
    {
        var circle = await _circleService.GetByIdAsync(id, GetUserId());
        if (circle == null) return NotFound(new { message = "Circle not found or access denied." });
        return Ok(circle);
    }

    [HttpPost("join/{inviteCode}")]  // POST api/circle/join/X4KP2A
    public async Task<IActionResult> Join(string inviteCode)
    {
        var (success, message, circle) = await _circleService.JoinAsync(inviteCode, GetUserId());
        if (!success) return BadRequest(new { message });
        return Ok(circle);
    }

    [HttpPost("{id}/habits")]  // POST api/circle/{id}/habits
    public async Task<IActionResult> ShareHabit(Guid id, ShareHabitRequest request)
    {
        var (success, message) = await _circleService.ShareHabitAsync(id, request, GetUserId());
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }

    [HttpGet("{id}/habits")]  // GET api/circle/{id}/habits
    public async Task<IActionResult> GetHabits(Guid id)
    {
        var habits = await _circleService.GetCircleHabitsAsync(id, GetUserId());
        return Ok(habits);
    }
    [HttpGet("my")]   // GET api/circle/my
    public async Task<IActionResult> GetMyCircles()
    {
        var circles = await _circleService.GetMyCirclesAsync(GetUserId());
        return Ok(circles);
    }
}