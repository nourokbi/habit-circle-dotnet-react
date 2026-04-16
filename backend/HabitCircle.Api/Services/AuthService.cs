using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using HabitCircle.Api.Data;
using HabitCircle.DTOs.Auth;
using HabitCircle.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Google.Apis.Auth;
using HabitCircle.Api.DTOs.Auth;

namespace HabitCircle.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly HttpClient _http;

    // ASP.NET automatically injects these via dependency injection
    public AuthService(AppDbContext db, IConfiguration config, HttpClient http)
    {
        _db = db;
        _config = config;
        _http = http;
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
    private sealed record GoogleProfile(string Email, string? Name, string? PictureUrl);

    private sealed class GoogleTokenInfoResponse
    {
        [JsonPropertyName("aud")]
        public string? Aud { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("email_verified")]
        public JsonElement EmailVerified { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("picture")]
        public string? Picture { get; set; }
    }

    public async Task<AuthResponse?> GoogleLoginAsync(GoogleLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
            return null;

        var clientId = _config["GoogleAuth:ClientId"];
        if (string.IsNullOrWhiteSpace(clientId))
            return null;

        GoogleProfile? profile = null;

        // Try verifying as an ID token (JWT) first
        try
        {
            if (request.Token.Split('.').Length == 3)
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, settings);

                if (!string.IsNullOrWhiteSpace(payload.Email))
                    profile = new GoogleProfile(payload.Email, payload.Name, payload.Picture);
            }
        }
        catch
        {
            // Ignore and try access_token validation below
        }

        // Fallback: accept a Google access_token from the frontend and validate it via Google's tokeninfo endpoint
        if (profile == null)
        {
            try
            {
                var url = $"https://oauth2.googleapis.com/tokeninfo?access_token={Uri.EscapeDataString(request.Token)}";
                var info = await _http.GetFromJsonAsync<GoogleTokenInfoResponse>(url);

                if (info == null)
                    return null;

                if (!string.Equals(info.Aud, clientId, StringComparison.Ordinal))
                    return null;

                if (string.IsNullOrWhiteSpace(info.Email))
                    return null;

                var emailVerified = info.EmailVerified.ValueKind == JsonValueKind.True
                    || (info.EmailVerified.ValueKind == JsonValueKind.String
                        && string.Equals(info.EmailVerified.GetString(), "true", StringComparison.OrdinalIgnoreCase));

                if (!emailVerified)
                    return null;

                profile = new GoogleProfile(info.Email, info.Name, info.Picture);
            }
            catch
            {
                return null;
            }
        }

        // Check if this Google user already has an account
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == profile.Email);

        if (user == null)
        {
            // First time — create an account for them automatically
            user = new User
            {
                Email = profile.Email,
                Username = profile.Name ?? profile.Email.Split('@')[0],
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                AvatarUrl = profile.PictureUrl ?? "https://www.gravatar.com/avatar?d=mp"
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        return new AuthResponse
        {
            Token = GenerateToken(user),
            Username = user.Username,
            Email = user.Email,
            UserId = user.Id
        };
    }
}