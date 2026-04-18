import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import { getApiErrorMessage } from "../utils/errorMessages";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState({ id: null, type: "" });
  const [error, setError] = useState("");
  const { success, error: notifyError, warning } = useNotification();

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/appointments/my");
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error(requestError);
      const message = getApiErrorMessage(requestError, "Failed to load appointments.");
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const cancelAppointment = async (id) => {
    if (processingAction.id) return;
    const confirmed = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmed) {
      warning("Cancellation cancelled.");
      return;
    }
    setProcessingAction({ id, type: "cancel" });
    try {
      await api.put(`/appointments/cancel/${id}`);
      success("Appointment cancelled successfully.");
      await fetchAppointments();
    } catch (requestError) {
      console.error(requestError);
      notifyError(getApiErrorMessage(requestError, "Cancel failed."));
    } finally {
      setProcessingAction({ id: null, type: "" });
    }
  };

  const reschedule = async (id) => {
    if (processingAction.id) return;
    const newDate = window.prompt("Enter new date (YYYY-MM-DD)");
    if (!newDate) {
      warning("Reschedule cancelled.");
      return;
    }
    const newTime = window.prompt("Enter new time (HH:MM)");
    if (!newTime) {
      warning("Reschedule cancelled.");
      return;
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const timePattern = /^\d{2}:\d{2}$/;
    if (!datePattern.test(newDate) || !timePattern.test(newTime)) {
      warning("Use valid formats: date YYYY-MM-DD and time HH:MM.");
      return;
    }

    setProcessingAction({ id, type: "reschedule" });
    try {
      await api.put(`/appointments/reschedule/${id}`, {
        appointment_date: newDate,
        start_time: newTime
      });
      success("Appointment rescheduled successfully.");
      await fetchAppointments();
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Reschedule failed."));
    } finally {
      setProcessingAction({ id: null, type: "" });
    }
  };

  return (
    <div className="ui-page">
      <div className="ui-card" style={styles.container}>
        <h2 className="ui-title">My Appointments</h2>
        <p className="ui-subtitle">Track and manage your upcoming salon bookings.</p>
        {error ? <div className="ui-toast ui-toast-error">{error}</div> : null}

        {loading ? (
          <div style={{ display: "grid", gap: "10px", marginTop: "16px" }}>
            {[1, 2, 3].map((item) => (
              <div key={item} className="ui-skeleton" style={{ height: "56px" }} />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="ui-empty" style={{ marginTop: "14px" }}>
            <span className="ui-empty-icon">C</span>
            No appointments found.
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Service</th>
                  <th style={styles.th}>Staff</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  const isBooked = appointment.status === "booked";
                  const isProcessing = processingAction.id === appointment.id;
                  return (
                    <tr key={appointment.id}>
                      <td style={styles.td}>{appointment.service_name}</td>
                      <td style={styles.td}>{appointment.staff_name}</td>
                      <td style={styles.td}>{formatDate(appointment.appointment_date)}</td>
                      <td style={styles.td}>
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </td>
                      <td style={styles.td}>
                        <StatusPill status={appointment.status} />
                      </td>
                      <td style={styles.td}>
                        {isBooked ? (
                          <div style={styles.actions}>
                            <button
                              className="ui-btn ui-btn-danger"
                              style={styles.button}
                              disabled={isProcessing}
                              onClick={() => cancelAppointment(appointment.id)}
                            >
                              {isProcessing && processingAction.type === "cancel"
                                ? "Cancelling..."
                                : "Cancel"}
                            </button>
                            <button
                              className="ui-btn ui-btn-secondary"
                              style={styles.button}
                              disabled={isProcessing}
                              onClick={() => reschedule(appointment.id)}
                            >
                              {isProcessing && processingAction.type === "reschedule"
                                ? "Saving..."
                                : "Reschedule"}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#8a7291" }}>No actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const normalized = normalizeDateOnly(value);
  const date = new Date(`${normalized}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
}

function normalizeDateOnly(value) {
  if (!value) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
      value.getDate()
    ).padStart(2, "0")}`;
  }

  const str = String(value);
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnlyPattern.test(str)) {
    return str;
  }

  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(
      parsed.getDate()
    ).padStart(2, "0")}`;
  }

  return str.slice(0, 10);
}

function formatTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 5);
}

function StatusPill({ status }) {
  const normalized = String(status || "").toLowerCase();
  const colors = {
    booked: { background: "#ecf5ff", border: "#b7d5f8", color: "#4a6691" },
    completed: { background: "#f2e9ff", border: "#ccb5f3", color: "#6a4f99" },
    cancelled: { background: "#fdeef6", border: "#f6bfd5", color: "#8e5069" }
  };
  const palette = colors[normalized] || colors.booked;
  return (
    <span
      style={{
        border: `1px solid ${palette.border}`,
        borderRadius: "999px",
        backgroundColor: palette.background,
        color: palette.color,
        padding: "4px 9px",
        fontSize: "0.74rem",
        fontWeight: 700
      }}
    >
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px"
  },
  tableWrap: {
    marginTop: "16px",
    overflowX: "auto",
    border: "1px solid #eddcf1",
    borderRadius: "12px"
  },
  table: {
    width: "100%",
    minWidth: "760px",
    borderCollapse: "collapse"
  },
  th: {
    textAlign: "left",
    padding: "12px",
    fontSize: "0.82rem",
    color: "#6c5474",
    textTransform: "uppercase",
    borderBottom: "1px solid #eddcf1",
    backgroundColor: "#fcf6fe"
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #f2e7f6",
    fontSize: "0.92rem",
    verticalAlign: "top"
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  button: {
    padding: "6px 10px",
    fontSize: "0.78rem"
  }
};

export default MyAppointments;