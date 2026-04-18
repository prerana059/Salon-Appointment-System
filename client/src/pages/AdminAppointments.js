import React, { useEffect, useMemo, useState } from "react";
import {
  cancelAdminAppointment,
  completeAdminAppointment,
  fetchAdminAppointments,
  softDeleteAdminAppointment
} from "../api/appointmentService";
import AdminSidebar from "../components/AdminSidebar";
import { useNotification } from "../context/NotificationContext";
import { getApiErrorMessage } from "../utils/errorMessages";

const STATUS_OPTIONS = ["all", "booked", "completed", "cancelled"];

const StatusBadge = ({ status }) => {
  const normalized = String(status || "").toLowerCase();
  const palette = {
    booked: { background: "#ecf5ff", color: "#4a6691", border: "#b7d5f8" },
    completed: { background: "#f2e9ff", color: "#6a4f99", border: "#ccb5f3" },
    cancelled: { background: "#fdeef6", color: "#8e5069", border: "#f6bfd5" }
  };
  const colors = palette[normalized] || palette.booked;

  return (
    <span
      style={{
        ...styles.badge,
        backgroundColor: colors.background,
        color: colors.color,
        borderColor: colors.border
      }}
    >
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [processingAction, setProcessingAction] = useState({
    id: null,
    type: ""
  });
  const { success, error: notifyError, warning } = useNotification();

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error("Failed to load appointments:", requestError);
      const message = getApiErrorMessage(
        requestError,
        "Unable to fetch appointments right now. Please try again."
      );
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const staffOptions = useMemo(() => {
    const staffs = appointments
      .map((appointment) => appointment.staff_name)
      .filter(Boolean);
    return [...new Set(staffs)].sort((a, b) => a.localeCompare(b));
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const normalizedStatus = String(appointment.status || "").toLowerCase();
      const appointmentDate = normalizeDate(appointment.appointment_date);

      const statusMatch =
        statusFilter === "all" || normalizedStatus === statusFilter;
      const staffMatch =
        staffFilter === "all" || appointment.staff_name === staffFilter;
      const dateMatch = !dateFilter || appointmentDate === dateFilter;
      const searchMatch = [appointment.customer_name, appointment.service_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      return statusMatch && staffMatch && dateMatch && searchMatch;
    });
  }, [appointments, statusFilter, staffFilter, dateFilter, search]);

  const runAction = async (actionType, appointmentId, actionCallback) => {
    setError("");
    setProcessingAction({ id: appointmentId, type: actionType });
    try {
      await actionCallback();
      success("Appointment updated successfully.");
      await loadAppointments();
    } catch (requestError) {
      console.error(`Failed to ${actionType} appointment:`, requestError);
      const message = getApiErrorMessage(requestError, "Action failed. Please try again.");
      setError(message);
      notifyError(message);
    } finally {
      setProcessingAction({ id: null, type: "" });
    }
  };

  const handleComplete = async (appointment) => {
    if (String(appointment.status).toLowerCase() === "completed") {
      return;
    }

    await runAction("complete", appointment.id, () =>
      completeAdminAppointment(appointment.id)
    );
  };

  const handleCancel = async (appointment) => {
    const confirmed = window.confirm(
      "Cancel this appointment? This action will update its status immediately."
    );
    if (!confirmed) {
      warning("Cancellation was aborted.");
      return;
    }
    await runAction("cancel", appointment.id, () =>
      cancelAdminAppointment(appointment.id)
    );
  };

  const handleSoftDelete = async (appointment) => {
    const confirmed = window.confirm(
      "Soft delete this appointment? It will be marked cancelled."
    );
    if (!confirmed) {
      warning("Delete action was aborted.");
      return;
    }
    await runAction("delete", appointment.id, () =>
      softDeleteAdminAppointment(appointment.id)
    );
  };

  return (
    <div className="ui-page">
      <div className="admin-layout">
        <AdminSidebar />
        <div className="ui-card" style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 className="ui-title">All Appointments</h2>
            <p className="ui-subtitle">
              View, filter, and manage salon appointments from a single place.
            </p>
          </div>
          <button onClick={loadAppointments} className="ui-btn ui-btn-secondary">
            Refresh
          </button>
        </div>

        <div style={styles.filtersContainer}>
          <input
            type="text"
            placeholder="Search customer or service"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="ui-input"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="ui-select"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="ui-input"
          />

          <select
            value={staffFilter}
            onChange={(event) => setStaffFilter(event.target.value)}
            className="ui-select"
          >
            <option value="all">All Staff</option>
            {staffOptions.map((staffName) => (
              <option key={staffName} value={staffName}>
                {staffName}
              </option>
            ))}
          </select>
        </div>

        {error ? <div className="ui-toast ui-toast-error">{error}</div> : null}

        {loading ? (
          <div style={styles.stateBox}>
            <div className="ui-skeleton" style={{ height: "18px", marginBottom: "12px" }} />
            <div className="ui-skeleton" style={{ height: "18px", marginBottom: "12px" }} />
            <div className="ui-skeleton" style={{ height: "18px" }} />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="ui-empty">
            <span className="ui-empty-icon">C</span>
            No appointments found for the current filters.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Customer Name</th>
                  <th style={styles.th}>Staff Name</th>
                  <th style={styles.th}>Service Name</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => {
                  const isProcessing =
                    processingAction.id === appointment.id;
                  const normalizedStatus = String(
                    appointment.status || ""
                  ).toLowerCase();
                  const isBooked = normalizedStatus === "booked";
                  const canComplete = normalizedStatus !== "completed";

                  return (
                    <tr key={appointment.id}>
                      <td style={styles.td}>{appointment.customer_name}</td>
                      <td style={styles.td}>{appointment.staff_name}</td>
                      <td style={styles.td}>{appointment.service_name}</td>
                      <td style={styles.td}>
                        {formatDateDisplay(appointment.appointment_date)}
                      </td>
                      <td style={styles.td}>
                        {formatTimeRange(
                          appointment.start_time,
                          appointment.end_time
                        )}
                      </td>
                      <td style={styles.td}>
                        <StatusBadge status={appointment.status} />
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            className="ui-btn ui-btn-primary"
                            style={{ ...styles.actionButton, opacity: canComplete ? 1 : 0.5 }}
                            disabled={!canComplete || isProcessing}
                            onClick={() => handleComplete(appointment)}
                          >
                            {isProcessing && processingAction.type === "complete"
                              ? "Saving..."
                              : "Mark Completed"}
                          </button>
                          <button
                            className="ui-btn ui-btn-danger"
                            style={{ ...styles.actionButton, opacity: isBooked ? 1 : 0.75 }}
                            disabled={isProcessing || normalizedStatus === "cancelled"}
                            onClick={() => handleCancel(appointment)}
                          >
                            {isProcessing && processingAction.type === "cancel"
                              ? "Saving..."
                              : "Cancel"}
                          </button>
                          <button
                            className="ui-btn ui-btn-secondary"
                            style={styles.actionButton}
                            disabled={isProcessing}
                            onClick={() => handleSoftDelete(appointment)}
                          >
                            {isProcessing && processingAction.type === "delete"
                              ? "Saving..."
                              : "Delete (Soft)"}
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
      </div>
    </div>
  );
};

function normalizeDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function formatDateDisplay(value) {
  const normalized = normalizeDate(value);
  if (!normalized) return "-";

  const date = new Date(`${normalized}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return "-";
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

const styles = {
  card: {
    padding: "20px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap"
  },
  filtersContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginBottom: "16px"
  },
  tableWrapper: {
    overflowX: "auto",
    border: "1px solid #eddcf1",
    borderRadius: "10px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "980px",
    backgroundColor: "#ffffff"
  },
  th: {
    textAlign: "left",
    padding: "12px",
    backgroundColor: "#fcf6fe",
    borderBottom: "1px solid #eddcf1",
    color: "#6c5474",
    fontSize: "0.85rem",
    letterSpacing: "0.02em",
    textTransform: "uppercase"
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #f2e7f6",
    color: "#46324d",
    fontSize: "0.92rem",
    verticalAlign: "top"
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  actionButton: {
    padding: "7px 10px",
    fontSize: "0.8rem"
  },
  stateBox: {
    marginTop: "12px",
    textAlign: "center",
    padding: "28px",
    borderRadius: "10px",
    backgroundColor: "#fbf5fd",
    color: "#7f6487"
  },
  errorBox: {
    marginBottom: "10px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#b91c1c",
    padding: "10px 12px",
    borderRadius: "8px"
  },
  noticeBox: {
    marginBottom: "10px",
    backgroundColor: "#ecfdf3",
    border: "1px solid #86efac",
    color: "#166534",
    padding: "10px 12px",
    borderRadius: "8px"
  },
  badge: {
    display: "inline-block",
    border: "1px solid",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "0.75rem",
    fontWeight: 700
  }
};

export default AdminAppointments;