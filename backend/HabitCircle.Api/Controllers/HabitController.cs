using HabitCircle.DTOs.Habit;
using HabitCircle.Models;
using HabitCircle.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HabitCircle.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HabitController : ControllerBase
{
  private readonly HabitService _habitService;

  public HabitController(HabitService habitService)
  {
    _habitService = habitService;
  }

  private Guid GetUserId() =>
      Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

  [HttpPost]
  public async Task<IActionResult> Create(CreateHabitRequest request)
  {
    var (success, message, habit) = await _habitService.CreateAsync(request, GetUserId());
    if (!success) return BadRequest(new { message });
    return Ok(habit);
  }

  [HttpGet]                         // GET api/habit
  public async Task<IActionResult> GetMyHabits()
  {
    var habits = await _habitService.GetMyHabitsAsync(GetUserId());
    return Ok(habits);
  }

  [HttpGet("{id}")]                 // GET api/habit/{id}
  public async Task<IActionResult> GetById(Guid id)
  {
    var habit = await _habitService.GetByIdAsync(id, GetUserId());
    if (habit == null) return NotFound(new { message = "Habit not found." });
    return Ok(habit);
  }

  [HttpPost("{id}/log")]            // POST api/habit/{id}/log
  public async Task<IActionResult> Log(Guid id, LogHabitRequest request)
  {
    var (success, message, log) = await _habitService.LogAsync(id, request, GetUserId());
    if (!success) return BadRequest(new { message });
    return Ok(log);
  }

  [HttpGet("{id}/logs")]            // GET api/habit/{id}/logs
  public async Task<IActionResult> GetLogs(Guid id)
  {
    var logs = await _habitService.GetLogsAsync(id, GetUserId());
    return Ok(logs);
  }

  [HttpDelete("{id}")]              // DELETE api/habit/{id}
  public async Task<IActionResult> Delete(Guid id)
  {
    var (success, message) = await _habitService.DeleteAsync(id, GetUserId());
    if (!success) return NotFound(new { message });
    return Ok(new { message });
  }
  [HttpGet("frequency-types")]   // GET api/habit/frequency-types
  [AllowAnonymous]
  public IActionResult GetFrequencyTypes()
  {
    var types = Enum.GetValues<FrequencyType>()
        .Select(f => new
        {
          value = f.ToString(),
          label = f.ToString()  // frontend can display this directly
        });

    return Ok(types);
  }

  [HttpPut("{id}")]   // PUT api/habit/{id}
  public async Task<IActionResult> Update(Guid id, UpdateHabitRequest request)
  {
    var (success, message, habit) = await _habitService.UpdateAsync(id, request, GetUserId());
    if (!success) return BadRequest(new { message });
    return Ok(habit);
  }
}