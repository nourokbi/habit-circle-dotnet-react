import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useHabits } from "../hooks/useHabits";
import { useCircles } from "../hooks/useCircles";
import api from "../api/axios";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsRow from "../components/dashboard/StatsRow";
import HabitsPanel from "../components/dashboard/HabitsPanel";
import CirclesPanel from "../components/dashboard/CirclesPanel";
import HabitModal from "../components/dashboard/modals/HabitModal";

import "./dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const { habits, loading, error, refetch } = useHabits();
  const {
    circles,
    loading: cLoading,
    error: cError,
    refetch: refetchCircles,
  } = useCircles();

  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [habitModalError, setHabitModalError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 250);

    return () => clearTimeout(t);
  }, [searchInput]);

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  const handleEditHabit = async (habit) => {
    try {
      const { data } = await api.get(`/habit/${habit.id}`);
      setEditHabit(data);
      setHabitModalError("");
      setOpen(true);
    } catch (err) {
      console.error(err);
      setEditHabit(habit);
      setHabitModalError(
        err.response?.data?.message ||
          "Could not load habit details for editing.",
      );
      setOpen(true);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <DashboardHeader username={user?.username} />

        <StatsRow habits={habits} circles={circles} />

        <div className="dashboard-search">
          <div className="dashboard-search-wrap">
            <Search size={16} className="dashboard-search-icon" />
            <input
              className="dashboard-search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") clearSearch();
              }}
              placeholder="Search habits and circles..."
              aria-label="Search habits and circles"
            />
            {searchInput.trim() && (
              <button
                type="button"
                className="dashboard-search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
                title="Clear"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="dashboard-columns">
          <HabitsPanel
            habits={habits}
            loading={loading}
            error={error}
            filter={filter}
            setFilter={setFilter}
            searchQuery={searchQuery}
            onCreate={() => {
              setEditHabit(null);
              setHabitModalError("");
              setOpen(true);
            }}
            onEdit={handleEditHabit}
            refetch={refetch}
          />

          <CirclesPanel
            circles={circles}
            loading={cLoading}
            error={cError}
            searchQuery={searchQuery}
            currentUserId={user?.id}
            onChanged={refetchCircles}
          />
        </div>

        <HabitModal
          open={open}
          onClose={() => {
            setOpen(false);
            setHabitModalError("");
          }}
          onSuccess={() => {
            refetch();
            refetchCircles();
          }}
          circles={circles}
          initialData={editHabit}
          initialError={habitModalError}
        />
      </div>
    </div>
  );
}
