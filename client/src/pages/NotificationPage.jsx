import React, { useEffect, useMemo, useState } from "react";
import { useNotification } from "../context/NotificationContext";
import { getApiErrorMessage } from "../utils/errorMessages";
import NotificationItem from "../components/NotificationItem";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../api/notificationService";

export default function NotificationPage() {
  const { success, error: notifyError } = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const unreadCount = useMemo(() => {
    return items.filter((n) => String(n.status).toLowerCase() === "unread").length;
  }, [items]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchNotifications();
      setItems(data);
    } catch (e) {
      console.error(e);
      const msg = getApiErrorMessage(e, "Failed to load notifications.");
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkAll = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) =>
        prev.map((n) => ({
          ...n,
          status: "read"
        }))
      );
      success("All notifications marked as read.");
    } catch (e) {
      console.error(e);
      notifyError(getApiErrorMessage(e, "Failed to mark all as read."));
    } finally {
      setProcessing(false);
    }
  };

  const handleClickItem = async (item) => {
    const isUnread = String(item?.status || "").toLowerCase() === "unread";
    if (!isUnread || processing) return;

    setProcessing(true);
    try {
      await markNotificationRead(item.id);
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, status: "read" } : n)));
    } catch (e) {
      console.error(e);
      notifyError(getApiErrorMessage(e, "Failed to mark as read."));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="ui-page">
      <div className="ui-card" style={{ maxWidth: 920, margin: "0 auto", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="ui-title">Notifications</h1>
            <p className="ui-subtitle">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up."}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="ui-btn ui-btn-secondary" onClick={load} disabled={loading || processing}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              className="ui-btn ui-btn-primary"
              onClick={handleMarkAll}
              disabled={processing || unreadCount === 0}
            >
              {processing ? "Working..." : "Mark All as Read"}
            </button>
          </div>
        </div>

        {error ? <div className="ui-toast ui-toast-error">{error}</div> : null}

        {loading ? (
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="ui-skeleton" style={{ height: 70 }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="ui-empty" style={{ marginTop: 14 }}>
            <span className="ui-empty-icon">🔔</span>
            No notifications yet
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => handleClickItem(n)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

