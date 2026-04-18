import React from "react";
import styles from "../../css/customerDashboard.module.css";

export default function AppointmentCard({
  appointment,
  variant,
  isProcessing,
  processingType,
  onCancel,
  onReschedule
}) {
  const status = normalizeStatus(appointment?.status);
  const actionsDisabled = status !== "booked" || isProcessing;

  return (
    <article className={styles.apptCard}>
      <div className={styles.apptTop}>
        <div className={styles.apptTitleRow}>
          <h3 className={styles.apptTitle}>{appointment?.service_name || "Service"}</h3>
          <span className={`${styles.badge} ${badgeClass(status)}`}>
            {labelStatus(status)}
          </span>
        </div>
        <p className={styles.apptMeta}>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Staff</span>
            <span className={styles.metaValue}>{appointment?.staff_name || "-"}</span>
          </span>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Date</span>
            <span className={styles.metaValue}>{formatDate(appointment?.appointment_date)}</span>
          </span>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Time</span>
            <span className={styles.metaValue}>
              {formatTime(appointment?.start_time)}
              {appointment?.end_time ? ` - ${formatTime(appointment?.end_time)}` : ""}
            </span>
          </span>
        </p>
      </div>

      <div className={styles.apptActions} data-variant={variant}>
        <button
          className="ui-btn ui-btn-danger"
          disabled={actionsDisabled}
          onClick={() => onCancel(appointment.id)}
        >
          {isProcessing && processingType === "cancel" ? "Cancelling..." : "Cancel"}
        </button>
        <button
          className="ui-btn ui-btn-secondary"
          disabled={actionsDisabled}
          onClick={() => onReschedule(appointment)}
        >
          {isProcessing && processingType === "reschedule" ? "Saving..." : "Reschedule"}
        </button>
      </div>
    </article>
  );
}

function normalizeStatus(value) {
  const s = String(value || "").toLowerCase();
  if (s === "completed" || s === "cancelled" || s === "booked") return s;
  return s || "booked";
}

function labelStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function badgeClass(status) {
  if (status === "completed") return styles.badgeCompleted;
  if (status === "cancelled") return styles.badgeCancelled;
  return styles.badgeBooked;
}

function formatDate(value) {
  if (!value) return "-";
  const normalized = String(value).slice(0, 10);
  const date = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(date.getTime())) return normalized;
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

