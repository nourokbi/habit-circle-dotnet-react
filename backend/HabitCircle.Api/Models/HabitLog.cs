using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HabitCircle.Api.Models
{
    public class HabitLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? Note { get; set; }
        public DateTime LoggedAt { get; set; } = DateTime.UtcNow;

        public Guid HabitId { get; set; }
        public Habit Habit { get; set; } = null!;

    }
}