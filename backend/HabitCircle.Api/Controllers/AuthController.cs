using HabitCircle.DTOs.Auth;
using HabitCircle.Services;
using Microsoft.AspNetCore.Mvc;

namespace HabitCircle.Controllers;

[ApiController]
[Route("api/[controller]")]  // resolves to: api/auth
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]  // POST api/auth/register
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);

        if (result == null)
            return BadRequest(new { message = "Email is already in use." });

        return Ok(result);
    }

    [HttpPost("login")]  // POST api/auth/login
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);

        if (result == null)
            return Unauthorized(new { message = "Invalid email or password." });

        return Ok(result);
    }
}