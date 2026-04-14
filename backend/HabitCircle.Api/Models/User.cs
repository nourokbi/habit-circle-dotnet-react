using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HabitCircle.Api.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public string AvatarUrl { get; set; } = "https://www.gravatar.com/avatar?d=mp";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<CircleMember> CircleMemberships { get; set; } = new List<CircleMember>();
        public ICollection<Habit> Habits { get; set; } = new List<Habit>();
    }
}