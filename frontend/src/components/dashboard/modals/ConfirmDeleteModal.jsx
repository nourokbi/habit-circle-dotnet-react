import { Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";

export default function ConfirmDeleteModal({
  opened,
  onClose,
  title = "Delete",
  entityName = "this item",
  error = "",
  confirming = false,
  confirmDisabled = false,
  onConfirm,
  confirmText = "Delete",
  closeText = "Close",
}) {
  return (
    <Modal
      opened={!!opened}
      onClose={onClose}
      centered
      title={title}
      closeOnClickOutside={!confirming}
      closeOnEscape={!confirming}
    >
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          Delete <strong>{entityName}</strong>? This action cannot be undone.
        </Text>

        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose} disabled={confirming}>
            {closeText}
          </Button>
          <Button
            className="hcDangerButton"
            onClick={onConfirm}
            loading={confirming}
            disabled={confirmDisabled}
            loaderProps={{ color: "white" }}
          >
            {confirmText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
