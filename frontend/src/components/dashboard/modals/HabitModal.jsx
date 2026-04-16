import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import api from "../../../api/axios";
import { toastError, toastLoading, toastSuccess } from "../../../utils/toast";

const DEFAULT_FORM = {
  title: "",
  description: "",
  frequencyType: "Daily",
  circleIds: [],
};

const FREQUENCY_OPTIONS = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Yearly", label: "Yearly" },
];

const normalizeId = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export default function HabitModal({
  open,
  onClose,
  onSuccess,
  circles = [],
  initialData = null,
  initialError = "",
}) {
  const isEdit = !!initialData;
  const habitId = initialData?.id ?? initialData?.Id ?? null;

  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const circleOptions = useMemo(() => {
    return (circles ?? [])
      .map((c) => {
        const id = normalizeId(c.id ?? c.Id ?? c.circleId ?? c.CircleId);
        if (!id) return null;

        const name =
          c.name ?? c.Name ?? c.circleName ?? c.CircleName ?? "Circle";

        return { value: id, label: String(name) };
      })
      .filter(Boolean);
  }, [circles]);

  useEffect(() => {
    if (!open) return;

    setError(initialError || "");

    if (!initialData) {
      setForm(DEFAULT_FORM);
      return;
    }

    const shared =
      initialData.sharedInCircles ?? initialData.SharedInCircles ?? [];
    const sharedCircleIds = shared
      .map((c) => normalizeId(c.circleId ?? c.CircleId))
      .filter(Boolean);

    setForm({
      title: initialData.title ?? initialData.Title ?? "",
      description: initialData.description ?? initialData.Description ?? "",
      frequencyType:
        initialData.frequencyType ?? initialData.FrequencyType ?? "Daily",
      circleIds: sharedCircleIds,
    });
  }, [initialData, open, initialError]);

  const handleTextChange = (field) => (e) => {
    if (error) setError("");

    const value =
      typeof e === "string"
        ? e
        : (e?.target?.value ?? e?.currentTarget?.value ?? "");

    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleFrequencyChange = (value) => {
    if (error) setError("");
    if (!value) return;

    setForm((p) => ({ ...p, frequencyType: String(value) }));
  };

  const handleCirclesChange = (values) => {
    if (error) setError("");

    setForm((p) => ({
      ...p,
      circleIds: (values ?? []).map(normalizeId).filter(Boolean),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const toastId = toastLoading(
      isEdit ? "Updating habit..." : "Creating habit...",
    );

    try {
      const payload = {
        ...form,
        circleIds: (form.circleIds ?? []).map(normalizeId).filter(Boolean),
      };

      if (isEdit) {
        if (!habitId) {
          setError("Could not determine habit id.");
          return;
        }

        await api.put(`/habit/${habitId}`, payload);
        toastSuccess(
          `"${payload.title}" was updated.`,
          "Habit updated",
          toastId,
        );
      } else {
        await api.post("/habit", payload);
        toastSuccess(
          `"${payload.title}" was created.`,
          "Habit created",
          toastId,
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);

      const data = err?.response?.data;
      const modelErrors =
        data?.errors && typeof data.errors === "object" ? data.errors : null;

      const detailsFromModelState = modelErrors
        ? Object.values(modelErrors).flat().filter(Boolean).join(" ")
        : "";

      const message =
        data?.message ||
        detailsFromModelState ||
        data?.title ||
        err?.message ||
        "Could not save habit.";

      setError(message);
      toastError(
        message,
        isEdit ? "Habit update failed" : "Habit create failed",
        toastId,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={isEdit ? "Edit Habit" : "Create Habit"}
      centered
      size="lg"
      closeOnClickOutside
      closeOnEscape
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <TextInput
            label="Title"
            placeholder="Habit title"
            value={form.title}
            onChange={handleTextChange("title")}
            required
          />

          <Textarea
            label="Description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleTextChange("description")}
            autosize
            minRows={3}
          />

          <Select
            label="Frequency"
            placeholder="Select frequency"
            data={FREQUENCY_OPTIONS}
            value={form.frequencyType}
            onChange={handleFrequencyChange}
            allowDeselect={false}
          />

          <MultiSelect
            label="Share in circles"
            placeholder="Select circles"
            data={circleOptions}
            value={form.circleIds}
            onChange={handleCirclesChange}
            searchable
            clearable
            nothingFoundMessage="No circles found"
          />

          <Group justify="flex-end" mt="xs">
            <Button
              type="button"
              variant="default"
              onClick={onClose}
              disabled={saving}
            >
              Close
            </Button>

            <Button
              type="submit"
              className="hcPrimaryButton"
              loading={saving}
              disabled={saving}
              loaderProps={{ color: "white" }}
            >
              {isEdit ? "Update Habit" : "Create Habit"}
            </Button>
          </Group>

          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}
        </Stack>
      </form>
    </Modal>
  );
}
