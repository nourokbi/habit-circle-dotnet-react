import { useState } from "react";
import { Plus } from "lucide-react";
import api from "../../api/axios";
import { toastDelete, toastError, toastLoading } from "../../utils/toast";

import HabitCard from "./HabitCard";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";

const FILTERS = ["All", "Daily", "Weekly", "Monthly", "Yearly"];

export default function HabitsPanel({
  habits,
  loading,
  error,
  filter,
  setFilter,
  searchQuery,
  onCreate,
  onEdit,
  refetch,
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteHabit, setDeleteHabit] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const filteredByFrequency =
    filter === "All"
      ? habits
      : habits.filter((h) => h.frequencyType === filter);

  const terms = (searchQuery ?? "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const visibleHabits =
    terms.length === 0
      ? filteredByFrequency
      : filteredByFrequency.filter((h) => {
          const haystack = `${h.title ?? ""} ${h.description ?? ""}`
            .toLowerCase()
            .trim();
          return terms.every((t) => haystack.includes(t));
        });

  const closeDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteHabit(null);
    setDeleteError("");
  };

  const requestDelete = (habit) => {
    setDeleteHabit(habit);
    setDeleteError("");
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteHabit?.id) return;

    setDeleteError("");
    setDeleting(true);
    const habitTitle = deleteHabit?.title ?? "habit";

    const toastId = toastLoading(`Deleting "${habitTitle}"...`);

    try {
      await api.delete(`/habit/${deleteHabit.id}`);
      toastDelete(`Habit deleted: "${habitTitle}".`, "", toastId);
      closeDelete();
      refetch();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Could not delete habit.";

      setDeleteError(message);
      toastError(message, "Delete failed", toastId);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>My habits</h2>
        <button className="btn-new" onClick={onCreate}>
          <Plus size={14} />
          New habit
        </button>
      </div>

      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && visibleHabits.length === 0 && (
        <EmptyState
          message={
            habits.length === 0
              ? "No habits yet."
              : terms.length > 0
                ? filter === "All"
                  ? `No habits match "${searchQuery}".`
                  : `No ${filter.toLowerCase()} habits match "${searchQuery}".`
                : filter === "All"
                  ? "No habits yet."
                  : `No ${filter.toLowerCase()} habits.`
          }
        />
      )}

      <div className="habit-list">
        {visibleHabits.map((h) => (
          <HabitCard
            key={h.id}
            habit={h}
            onChecked={refetch}
            onRequestDelete={requestDelete}
            onEdit={() => onEdit(h)}
          />
        ))}
      </div>

      <ConfirmDeleteModal
        opened={deleteOpen}
        onClose={closeDelete}
        title="Delete habit"
        entityName={deleteHabit?.title ?? "this habit"}
        error={deleteError}
        confirming={deleting}
        confirmDisabled={!deleteHabit?.id}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
