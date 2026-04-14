using HabitCircle.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HabitCircle.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Each DbSet = one table in the database
        public DbSet<User> Users => Set<User>();
        public DbSet<Circle> Circles => Set<Circle>();
        public DbSet<CircleMember> CircleMembers => Set<CircleMember>();
        public DbSet<Habit> Habits => Set<Habit>();
        public DbSet<HabitLog> HabitLogs => Set<HabitLog>();
        public DbSet<CircleHabit> CircleHabits => Set<CircleHabit>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // CircleMember composite key
            modelBuilder.Entity<CircleMember>()
                .HasKey(cm => new { cm.UserId, cm.CircleId });

            // CircleHabit composite key
            modelBuilder.Entity<CircleHabit>()
                .HasKey(ch => new { ch.HabitId, ch.CircleId });

            // Explicitly map CreatedBy → CreatedByUserId
            modelBuilder.Entity<Circle>()
                .HasOne(c => c.CreatedBy)
                .WithMany()
                .HasForeignKey(c => c.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Unique indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Circle>()
                .HasIndex(c => c.InviteCode)
                .IsUnique();
            modelBuilder.Entity<Habit>()
                .Property(h => h.FrequencyType)
                .HasConversion<string>();
        }
    }
}