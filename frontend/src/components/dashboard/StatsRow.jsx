import { Flame, CheckSquare, Users } from "lucide-react";

export default function StatsRow({ habits, circles }) {
  const longestStreak = habits.length
    ? Math.max(...habits.map((h) => h.currentStreak))
    : 0;

  const checkedToday = habits.filter((h) => h.loggedToday).length;

  return (
    <div className="stats-row">
      <div className="stat-card stat-gold">
        <Flame size={18} />
        <div>
          <span className="stat-label">Longest streak</span>
          <span className="stat-value">{longestStreak} days</span>
        </div>
      </div>

      <div className="stat-card stat-teal">
        <CheckSquare size={18} />
        <div>
          <span className="stat-label">Checked today</span>
          <span className="stat-value">
            {checkedToday} / {habits.length}
          </span>
        </div>
      </div>

      <div className="stat-card stat-purple">
        <Users size={18} />
        <div>
          <span className="stat-label">Active circles</span>
          <span className="stat-value">{circles.length}</span>
        </div>
      </div>
    </div>
  );
}
