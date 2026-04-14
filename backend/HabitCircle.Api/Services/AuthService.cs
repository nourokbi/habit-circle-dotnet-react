using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HabitCircle.Api.Data;
using HabitCircle.DTOs.Auth;
using HabitCircle.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace HabitCircle.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    // ASP.NET automatically injects these via dependency injection
    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        var exists = await _db.Users.AnyAsync(u => u.Email == request.Email);
        if (exists) return null;

        // Create the user — never store plain text passwords
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Token = GenerateToken(user),
            Username = user.Username,
            Email = user.Email,
            UserId = user.Id
        };
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        // Find user by email
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        // Verify password against the stored hash
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return new AuthResponse
        {
            Token = GenerateToken(user),
            Username = user.Username,
            Email = user.Email,
            UserId = user.Id
        };
    }

    private string GenerateToken(User user)
    {
        // Claims are pieces of info baked into the token
        // The frontend and other controllers can read these without hitting the DB
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var secret = _config["JwtSettings:Secret"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}