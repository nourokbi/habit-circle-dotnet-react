import { createElement as h } from "react";
import { notifications } from "@mantine/notifications";

const DEFAULT_DURATION_MS = 5000;

const themedStyles = () => () => ({
  root: {
    "--notification-color": "transparent",
    background: "var(--bg-surface)",
    border: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    borderRadius: 9999,
    overflow: "hidden",
    padding: "12px 16px 16px",
    maxWidth: "min(680px, calc(100vw - 24px))",
  },
  title: { display: "none" },
  description: { color: "var(--text-primary)" },
  closeButton: { color: "var(--text-muted)" },
});

const oneLineText = (message, title) => {
  const m = String(message ?? "").trim();
  const t = String(title ?? "").trim();
  if (!t) return m;
  if (!m) return t;
  return `${t}: ${m}`;
};

const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `t_${Math.random().toString(36).slice(2)}`;
};

const messageOneLine = (text, textColor) =>
  h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: 20,
      },
    },
    h(
      "span",
      {
        style: {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          color: textColor,
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.25,
        },
      },
      text,
    ),
  );

const messageWithProgress = (text, barColor, textColor, durationMs) =>
  h(
    "div",
    {
      style: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        minHeight: 20,
      },
    },
    h(
      "span",
      {
        style: {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          color: textColor,
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.25,
        },
      },
      text,
    ),
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: -14,
          right: -14,
          bottom: -14,
          height: 3,
          background: "var(--bg-overlay)",
          overflow: "hidden",
        },
      },
      h("div", {
        style: {
          height: "100%",
          width: "100%",
          background: barColor,
          transformOrigin: "left",
          animation: `hcToastProgress ${durationMs}ms linear forwards`,
        },
      }),
    ),
  );

const showOrUpdate = (opts) => {
  const id = opts.id ?? makeId();
  const payload = { id, styles: themedStyles(), ...opts.payload };

  if (opts.id) notifications.update(payload);
  else notifications.show(payload);

  return id;
};

export function toastLoading(message, title = "", id) {
  const text = oneLineText(message, title);
  return showOrUpdate({
    id,
    payload: {
      message: messageOneLine(text, "var(--text-secondary)"),
      loading: true,
      autoClose: false,
      withCloseButton: false,
    },
  });
}

export function toastSuccess(
  message,
  title = "",
  durationOrId = DEFAULT_DURATION_MS,
  maybeId,
) {
  const durationMs =
    typeof durationOrId === "number" ? durationOrId : DEFAULT_DURATION_MS;
  const id = typeof durationOrId === "string" ? durationOrId : maybeId;

  const accent = "var(--success)";
  const text = oneLineText(message, title);

  return showOrUpdate({
    id,
    payload: {
      message: messageWithProgress(text, accent, accent, durationMs),
      loading: false,
      autoClose: durationMs,
      withCloseButton: true,
    },
  });
}

export function toastDelete(
  message,
  title = "",
  durationOrId = DEFAULT_DURATION_MS,
  maybeId,
) {
  const durationMs =
    typeof durationOrId === "number" ? durationOrId : DEFAULT_DURATION_MS;
  const id = typeof durationOrId === "string" ? durationOrId : maybeId;

  const accent = "var(--danger)";
  const text = oneLineText(message, title);

  return showOrUpdate({
    id,
    payload: {
      message: messageWithProgress(text, accent, accent, durationMs),
      loading: false,
      autoClose: durationMs,
      withCloseButton: true,
    },
  });
}

export function toastError(
  message,
  title = "",
  durationOrId = DEFAULT_DURATION_MS,
  maybeId,
) {
  const durationMs =
    typeof durationOrId === "number" ? durationOrId : DEFAULT_DURATION_MS;
  const id = typeof durationOrId === "string" ? durationOrId : maybeId;

  const accent = "var(--danger)";
  const text = oneLineText(message, title);

  return showOrUpdate({
    id,
    payload: {
      message: messageWithProgress(text, accent, accent, durationMs),
      loading: false,
      autoClose: durationMs,
      withCloseButton: true,
    },
  });
}

export function toastInfo(
  message,
  title = "",
  durationOrId = DEFAULT_DURATION_MS,
  maybeId,
) {
  const durationMs =
    typeof durationOrId === "number" ? durationOrId : DEFAULT_DURATION_MS;
  const id = typeof durationOrId === "string" ? durationOrId : maybeId;

  const accent = "var(--gold)";
  const text = oneLineText(message, title);

  return showOrUpdate({
    id,
    payload: {
      message: messageWithProgress(
        text,
        accent,
        "var(--text-primary)",
        durationMs,
      ),
      loading: false,
      autoClose: durationMs,
      withCloseButton: true,
    },
  });
}
