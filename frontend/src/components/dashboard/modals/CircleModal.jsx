import { useEffect, useState } from "react";
import { Button, Divider, Modal, TextInput, Textarea } from "@mantine/core";

import api from "../../../api/axios";
import { toastError, toastLoading, toastSuccess } from "../../../utils/toast";

export default function CircleModal({ opened, onClose, onChanged }) {
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!opened) return;

    setSubmitting(false);
    setModalError("");

    setInviteCode("");
    setInviteError("");
    setName("");
    setDescription("");
  }, [opened]);

  const close = () => {
    if (submitting) return;
    onClose?.();
  };

  const submitJoin = async () => {
    const code = inviteCode.trim();
    if (!code || submitting) return;

    setInviteError("");
    setSubmitting(true);

    const toastId = toastLoading("Joining circle...");

    try {
      await api.post(`/circle/join/${encodeURIComponent(code)}`);
      toastSuccess("You joined a new circle.", "Joined circle", toastId);
      close();
      try {
        await onChanged?.();
      } catch {
        // Ignore refetch errors; joining succeeded.
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Invalid invite code.";
      setInviteError(message);
      toastError(message, "Join failed", toastId);
    } finally {
      setSubmitting(false);
    }
  };

  const submitCreate = async () => {
    const circleName = name.trim();
    if (!circleName || submitting) return;

    setModalError("");
    setSubmitting(true);

    const toastId = toastLoading("Creating circle...");

    try {
      await api.post("/circle", {
        name: circleName,
        description: description.trim() || null,
      });
      toastSuccess(`"${circleName}" was created.`, "Circle created", toastId);
      close();
      try {
        await onChanged?.();
      } catch {
        // Ignore refetch errors; creation succeeded.
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Could not create circle.";
      setModalError(message);
      toastError(message, "Create failed", toastId);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={!!opened}
      onClose={close}
      title="Circles"
      centered
      overlayProps={{ opacity: 0.55, blur: 4 }}
      closeOnClickOutside={!submitting}
      closeOnEscape={!submitting}
    >
      <div className="circle-modal-body">
        <div className="circle-modal-joinRow">
          <div className="circle-modal-grow">
            <TextInput
              label="Join with invite code"
              placeholder="e.g. X4KP2A"
              value={inviteCode}
              styles={
                inviteError
                  ? {
                      input: {
                        borderColor: "var(--danger)",
                        boxShadow: "0 0 0 3px rgba(192, 84, 74, 0.1)",
                      },
                    }
                  : undefined
              }
              onChange={(e) => {
                setInviteCode(e.currentTarget.value);
                if (inviteError) setInviteError("");
              }}
            />
          </div>

          <Button
            className="hcPrimaryButton"
            onClick={submitJoin}
            loading={submitting}
            disabled={submitting || !inviteCode.trim()}
          >
            Join circle
          </Button>
        </div>

        {inviteError && (
          <div className="circle-modal-joinError">{inviteError}</div>
        )}

        <Divider label="or" labelPosition="center" my="xs" />

        <TextInput
          label="Create a new circle"
          placeholder="Circle name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Description (optional)"
          placeholder="What is this circle for?"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={3}
        />
      </div>

      {modalError && (
        <div style={{ marginTop: 12, color: "var(--danger)", fontSize: 13 }}>
          {modalError}
        </div>
      )}

      <div className="circle-modal-footer">
        <Button variant="default" onClick={close} disabled={submitting}>
          Close
        </Button>
        <Button
          className="hcPrimaryButton"
          onClick={submitCreate}
          loading={submitting}
          disabled={submitting || !name.trim()}
        >
          Create circle
        </Button>
      </div>
    </Modal>
  );
}
