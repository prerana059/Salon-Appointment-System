import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useNotification } from "../context/NotificationContext";
import { getApiErrorMessage } from "../utils/errorMessages";

const FILTERS = [
  { id: "today", label: "Today's Appointments" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" }
];

const StaffDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("today");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { success, error: notifyError, warning } = useNotification();

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/appointments/staff");
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      console.error("Error fetching staff appointments:", requestError);
      const message = getApiErrorMessage(requestError, "Failed to load assigned appointments.");
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const markCompleted = async (id) => {
    setError("");
    setUpdatingId(id);
    const confirmed = window.confirm("Mark this appointment as completed?");
    if (!confirmed) {
      setUpdatingId(null);
      warning("Update cancelled.");
      return;
    }
    try {
      await api.put(`/appointments/complete/${id}`);
      success("Appointment marked as completed.");
      await fetchAppointments();
    } catch (requestError) {
      console.error("Error updating appointment:", requestError);
      const message = getApiErrorMessage(
        requestError,
        "Unable to update appointment status right now."
      );
      setError(message);
      notifyError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments.filter((appointment) => {
      const status = String(appointment.status || "").toLowerCase();
      const date = getAppointmentDate(appointment.appointment_date);
      if (!date) return false;

      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      if (activeFilter === "completed") {
        return status === "completed";
      }
      if (activeFilter === "today") {
        return normalizedDate.getTime() === today.getTime();
      }
      if (activeFilter === "upcoming") {
        return normalizedDate.getTime() > today.getTime() && status !== "completed";
      }
      return true;
    });
  }, [appointments, activeFilter]);

  return (
    <div className="ui-page">
      <div className="ui-card" style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 className="ui-title">Staff Dashboard</h2>
            <p className="ui-subtitle">
              View your assigned appointments and complete tasks quickly.
            </p>
          </div>
          <button className="ui-btn ui-btn-secondary" onClick={fetchAppointments}>
            Refresh
          </button>
        </div>

        {error ? <div className="ui-toast ui-toast-error">{error}</div> : null}

        <div style={styles.filterWrap}>
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              className="ui-btn"
              onClick={() => setActiveFilter(filter.id)}
              style={{
                ...styles.filterButton,
                backgroundColor: activeFilter === filter.id ? "#d8b8f3" : "#ffffff",
                color: activeFilter === filter.id ? "#4f3a66" : "#5c4866",
                borderColor: activeFilter === filter.id ? "#d8b8f3" : "#e4d0ef"
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.loadingWrap}>
            {[1, 2, 3].map((row) => (
              <div key={row} className="ui-skeleton" style={{ height: "52px" }} />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="ui-empty">
            <span className="ui-empty-icon">C</span>
            No appointments in this view.
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Service</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => {
                  const isToday = isTodayAppointment(appointment.appointment_date);
                  const status = String(appointment.status || "").toLowerCase();
                  const isCompleted = status === "completed";

                  return (
                    <tr
                      key={appointment.id}
                      style={isToday ? styles.todayRow : undefined}
                    >
                      <td style={styles.td}>
                        {appointment.customer_name}
                        {isToday ? <span style={styles.todayTag}>Today</span> : null}
                      </td>
                      <td style={styles.td}>{appointment.service_name}</td>
                      <td style={styles.td}>
                        {formatDate(appointment.appointment_date)}
                      </td>
                      <td style={styles.td}>
                        {formatTime(appointment.start_time)} -{" "}
                        {formatTime(appointment.end_time)}
                      </td>
                      <td style={styles.td}>
                        <StatusPill status={status} />
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            className="ui-btn ui-btn-secondary"
                            style={styles.actionButton}
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            View Details
                          </button>
                          <button
                            className="ui-btn ui-btn-primary"
                            style={styles.actionButton}
                            disabled={isCompleted || updatingId === appointment.id}
                            onClick={() => markCompleted(appointment.id)}
                          >
                            {updatingId === appointment.id
                              ? "Saving..."
                              : "Mark Completed"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAppointment ? (
        <div style={styles.modalOverlay} onClick={() => setSelectedAppointment(null)}>
          <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Appointment Details</h3>
            <p>
              <strong>Customer:</strong> {selectedAppointment.customer_name}
            </p>
            <p>
              <strong>Service:</strong> {selectedAppointment.service_name}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(selectedAppointment.appointment_date)}
            </p>
            <p>
              <strong>Time:</strong> {formatTime(selectedAppointment.start_time)} -{" "}
              {formatTime(selectedAppointment.end_time)}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {String(selectedAppointment.status || "").toUpperCase()}
            </p>
            <button
              className="ui-btn ui-btn-secondary"
              onClick={() => setSelectedAppointment(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

function StatusPill({ status }) {
  const palette = {
    booked: { bg: "#ecf5ff", border: "#b7d5f8", color: "#4a6691" },
    completed: { bg: "#f2e9ff", border: "#ccb5f3", color: "#6a4f99" },
    cancelled: { bg: "#fdeef6", border: "#f6bfd5", color: "#8e5069" }
  };
  const colors = palette[status] || palette.booked;
  return (
    <span
      style={{
        borderRadius: "999px",
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        color: colors.color,
        fontSize: "0.74rem",
        fontWeight: 700,
        padding: "4px 10px"
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function getAppointmentDate(value) {
  if (!value) return null;
  const normalized = String(value).slice(0, 10);
  return new Date(`${normalized}T00:00:00`);
}

function isTodayAppointment(value) {
  const date = getAppointmentDate(value);
  if (!date) return false;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function formatDate(value) {
  const date = getAppointmentDate(value);
  if (!date) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
}

function formatTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 5);
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap"
  },
  filterWrap: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    margin: "14px 0 16px"
  },
  filterButton: {
    border: "1px solid",
    fontSize: "0.86rem",
    padding: "8px 12px"
  },
  loadingWrap: {
    display: "grid",
    gap: "10px"
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #eddcf1",
    borderRadius: "12px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "760px"
  },
  th: {
    textAlign: "left",
    backgroundColor: "#fcf6fe",
    padding: "12px",
    borderBottom: "1px solid #eddcf1",
    fontSize: "0.82rem",
    textTransform: "uppercase",
    color: "#6c5474",
    letterSpacing: "0.02em"
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #f2e7f6",
    verticalAlign: "top",
    fontSize: "0.92rem"
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  actionButton: {
    padding: "7px 10px",
    fontSize: "0.78rem"
  },
  todayRow: {
    backgroundColor: "#f5ebff"
  },
  todayTag: {
    marginLeft: "8px",
    fontSize: "0.72rem",
    backgroundColor: "#e8d8fb",
    color: "#7754a5",
    borderRadius: "999px",
    padding: "2px 8px",
    fontWeight: 700
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(133, 95, 156, 0.35)",
    display: "grid",
    placeItems: "center",
    padding: "16px",
    zIndex: 20
  },
  modal: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 20px 40px rgba(147, 110, 173, 0.25)"
  }
};

export default StaffDashboard;