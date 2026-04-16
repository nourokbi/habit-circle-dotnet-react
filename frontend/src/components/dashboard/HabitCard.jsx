import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function HabitCard({
  habit,
  onChecked,
  onEdit,
  onRequestDelete,
}) {
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const api = (await import("../../api/axios")).default;
      if (habit.loggedToday) {
        // Already done — undo it
        await api.delete(`/habit/${habit.id}/log/today`);
      } else {
        // Not done — mark it
        await api.post(`/habit/${habit.id}/log`, { note: "" });
      }
      onChecked();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setChecking(false);
    }
  };

  const handleDeleteClick = () => {
    if (checking) return;
    if (typeof onRequestDelete === "function") onRequestDelete(habit);
  };
  return (
    <div className={`habit-card ${habit.loggedToday ? "habit-done" : ""}`}>
      <div className="habit-info">
        <span className="habit-title">{habit.title}</span>

        {!!habit.description && (
          <span className="habit-desc">{habit.description}</span>
        )}

        <span className="habit-meta">
          <span className="freq-badge">{habit.frequencyType}</span>
          {habit.currentStreak > 0 && (
            <span className="streak-text">
              🔥 {habit.currentStreak} day streak
            </span>
          )}
        </span>
      </div>
      <div className="habit-actions">
        <button
          type="button"
          className="delete-btn"
          onClick={handleDeleteClick}
          disabled={checking}
          title="Delete habit"
        >
          <Trash2 size={16} />
        </button>

        {typeof onEdit === "function" && (
          <button
            type="button"
            className="edit-btn"
            onClick={onEdit}
            disabled={checking}
            title="Edit habit"
          >
            <Pencil size={16} />
          </button>
        )}

        <button
          type="button"
          className={`check-btn ${habit.loggedToday ? "checked" : ""}`}
          onClick={handleCheck}
          disabled={habit.loggedToday || checking}
          title={habit.loggedToday ? "Done for today" : "Mark as done"}
        >
          {checking ? "..." : habit.loggedToday ? "✓" : ""}
        </button>
      </div>
    </div>
  );
}
