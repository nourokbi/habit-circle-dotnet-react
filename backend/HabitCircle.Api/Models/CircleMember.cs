using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HabitCircle.Api.Models
{
    public class CircleMember
    {
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid CircleId { get; set; }
        public Circle Circle { get; set; } = null!;

        public string Role { get; set; } = "member"; // "admin" or "member"
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    }
}