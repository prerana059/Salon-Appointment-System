import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

function createNotification(payload) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: payload.type || "success",
    title: payload.title || "",
    message: payload.message || "",
    duration: payload.duration ?? 3500
  };
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (payload) => {
      const notification = createNotification(payload);
      setNotifications((current) => [...current, notification]);
      if (notification.duration > 0) {
        window.setTimeout(() => removeNotification(notification.id), notification.duration);
      }
      return notification.id;
    },
    [removeNotification]
  );

  const api = useMemo(
    () => ({
      notify,
      success: (message, title = "Success") =>
        notify({ type: "success", message, title }),
      error: (message, title = "Error") =>
        notify({ type: "error", message, title, duration: 4500 }),
      warning: (message, title = "Warning") =>
        notify({ type: "warning", message, title }),
      removeNotification
    }),
    [notify, removeNotification]
  );

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <div className="ui-toast-viewport" aria-live="polite" aria-atomic="true">
        {notifications.map((item) => (
          <div key={item.id} className={`ui-global-toast ui-global-toast-${item.type}`}>
            <div>
              <p className="ui-global-toast-title">{item.title}</p>
              <p className="ui-global-toast-message">{item.message}</p>
            </div>
            <button
              type="button"
              className="ui-global-toast-close"
              onClick={() => removeNotification(item.id)}
              aria-label="Dismiss notification"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
