import { useState } from "react";
import { Plus } from "lucide-react";

import api from "../../api/axios";
import { toastDelete, toastError, toastLoading } from "../../utils/toast";

import CircleCard from "./CircleCard";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import CircleModal from "./modals/CircleModal";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";

export default function CirclesPanel({
  circles,
  loading,
  error,
  currentUserId,
  searchQuery,
  onChanged,
}) {
  const [open, setOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCircle, setDeleteCircle] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const terms = (searchQuery ?? "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const visibleCircles =
    terms.length === 0
      ? circles
      : circles.filter((c) => {
          const haystack = `${c.name ?? ""} ${c.description ?? ""}`
            .toLowerCase()
            .trim();
          return terms.every((t) => haystack.includes(t));
        });

  const openModal = () => setOpen(true);

  const closeDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteCircle(null);
    setDeleteError("");
  };

  const requestDelete = (circle) => {
    setDeleteCircle(circle);
    setDeleteError("");
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteCircle?.id) return;

    setDeleteError("");
    setDeleting(true);
    const circleName = deleteCircle?.name ?? "circle";

    const toastId = toastLoading(`Deleting "${circleName}"...`);

    try {
      await api.delete(`/circle/${deleteCircle.id}`);
      toastDelete(`Circle deleted: "${circleName}".`, "", toastId);
      closeDelete();
      try {
        await onChanged?.();
      } catch {
        // Ignore refetch errors; deletion succeeded.
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        "Could not delete circle.";

      setDeleteError(message);
      toastError(message, "Delete failed", toastId);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>My circles</h2>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && visibleCircles.length === 0 && (
        <EmptyState
          message={
            circles.length === 0
              ? "You haven't joined any circles yet."
              : terms.length > 0
                ? `No circles match "${searchQuery}".`
                : "No circles."
          }
        />
      )}

      <div className="circle-list">
        {visibleCircles.map((c) => (
          <CircleCard
            key={c.id}
            circle={c}
            currentUserId={currentUserId}
            onRequestDelete={requestDelete}
          />
        ))}
      </div>

      <button className="btn-join-circle" type="button" onClick={openModal}>
        <Plus size={14} />
        Join or create a circle
      </button>

      <CircleModal
        opened={open}
        onClose={() => setOpen(false)}
        onChanged={onChanged}
      />

      <ConfirmDeleteModal
        opened={deleteOpen}
        onClose={closeDelete}
        title="Delete circle"
        entityName={deleteCircle?.name ?? "this circle"}
        error={deleteError}
        confirming={deleting}
        confirmDisabled={!deleteCircle?.id}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
