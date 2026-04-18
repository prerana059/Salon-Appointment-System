import React from "react";

export default function NotificationItem({ notification, onClick }) {
  const unread = String(notification?.status || "").toLowerCase() === "unread";
  return (
    <button
      type="button"
      className={`ui-noti-item ${unread ? "ui-noti-unread" : ""}`}
      onClick={onClick}
    >
      <div className="ui-noti-row">
        <div className="ui-noti-message">{notification?.message || "-"}</div>
        {unread ? <span className="ui-noti-dot" aria-label="Unread" /> : null}
      </div>
      <div className="ui-noti-meta">
        <span className="ui-noti-time">{formatTimestamp(notification?.created_at)}</span>
        <span className={`ui-noti-status ${unread ? "unread" : "read"}`}>
          {unread ? "Unread" : "Read"}
        </span>
      </div>
    </button>
  );
}

function formatTimestamp(value) {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleString();
}

