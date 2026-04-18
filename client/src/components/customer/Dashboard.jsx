import React, { useMemo, useState } from "react";
import AppointmentCard from "./AppointmentCard";
import styles from "../../css/customerDashboard.module.css";

export default function Dashboard({
  heading,
  error,
  loading,
  upcomingAppointments,
  pastAppointments,
  processingAction,
  onCancel,
  onReschedule,
  onBookNew,
  onOpenNotifications,
  unreadCount
}) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const isDialogBusy = Boolean(processingAction?.id && processingAction?.type === "reschedule");

  const upcomingEmpty = !loading && (!upcomingAppointments || upcomingAppointments.length === 0);
  const pastEmpty = !loading && (!pastAppointments || pastAppointments.length === 0);

  const openReschedule = (appointment) => {
    const date = String(appointment?.appointment_date || "").slice(0, 10);
    const time = String(appointment?.start_time || "").slice(0, 5);
    setRescheduleTarget(appointment);
    setRescheduleDate(date);
    setRescheduleTime(time);
    setRescheduleOpen(true);
  };

  const closeReschedule = () => {
    if (isDialogBusy) return;
    setRescheduleOpen(false);
    setRescheduleTarget(null);
  };

  const canSubmitReschedule = useMemo(() => {
    return Boolean(rescheduleTarget?.id && rescheduleDate && rescheduleTime);
  }, [rescheduleTarget, rescheduleDate, rescheduleTime]);

  const submitReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget?.id) return;
    await onReschedule(rescheduleTarget.id, { date: rescheduleDate, time: rescheduleTime });
    setRescheduleOpen(false);
    setRescheduleTarget(null);
  };

  return (
    <div className="ui-page">
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div>
            <h1 className="ui-title">{heading}</h1>
            <p className="ui-subtitle">Manage your appointments and take quick actions.</p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={`ui-btn ${styles.bellBtn}`}
              onClick={onOpenNotifications}
              type="button"
              aria-label="Open notifications"
            >
              <span className={styles.bellIcon} aria-hidden="true">
                🔔
              </span>
              {unreadCount > 0 ? (
                <span className={styles.badgeCount} aria-label={`${unreadCount} unread`}>
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <button className="ui-btn ui-btn-primary" onClick={onBookNew}>
              Book New Appointment
            </button>
          </div>
        </div>

        {error ? <div className="ui-toast ui-toast-error">{error}</div> : null}

        <div className={styles.grid}>
          <section className={`ui-card ${styles.section}`}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Upcoming Appointments</h2>
              <p className={styles.sectionHint}>Your next scheduled bookings.</p>
            </div>

            {loading ? (
              <SkeletonList />
            ) : upcomingEmpty ? (
              <EmptyState message="No appointments yet" />
            ) : (
              <div className={styles.cardList}>
                {upcomingAppointments.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    variant="upcoming"
                    isProcessing={processingAction?.id === appt.id}
                    processingType={processingAction?.type}
                    onCancel={onCancel}
                    onReschedule={openReschedule}
                  />
                ))}
              </div>
            )}
          </section>

          <section className={`ui-card ${styles.section}`}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Past Appointments</h2>
              <p className={styles.sectionHint}>Completed or cancelled bookings.</p>
            </div>

            {loading ? (
              <SkeletonList />
            ) : pastEmpty ? (
              <EmptyState message="No past appointments" />
            ) : (
              <div className={styles.cardList}>
                {pastAppointments.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    variant="past"
                    isProcessing={processingAction?.id === appt.id}
                    processingType={processingAction?.type}
                    onCancel={onCancel}
                    onReschedule={openReschedule}
                  />
                ))}
              </div>
            )}
          </section>

          <section className={`ui-card ${styles.section} ${styles.quickActions}`}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
              <p className={styles.sectionHint}>Shortcuts to keep you moving.</p>
            </div>

            <div className={styles.quickRow}>
              <button className="ui-btn ui-btn-primary" onClick={onBookNew}>
                Book New Appointment
              </button>
              <button
                className="ui-btn ui-btn-secondary"
                type="button"
                onClick={onOpenNotifications}
              >
                View Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
              <div className={styles.tip}>
                Tip: You can cancel or reschedule any <strong>Booked</strong> appointment.
              </div>
            </div>
          </section>
        </div>
      </div>

      {rescheduleOpen ? (
        <div className={styles.modalOverlay} role="presentation" onMouseDown={closeReschedule}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Reschedule appointment"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <div>
                <div className={styles.modalTitle}>Reschedule Appointment</div>
                <div className={styles.modalSubtitle}>
                  {rescheduleTarget?.service_name ? `${rescheduleTarget.service_name} • ` : ""}
                  {rescheduleTarget?.staff_name || "Staff"}
                </div>
              </div>
              <button
                className={`ui-btn ${styles.closeBtn}`}
                type="button"
                onClick={closeReschedule}
                disabled={isDialogBusy}
              >
                Close
              </button>
            </div>

            <form className={styles.modalBody} onSubmit={submitReschedule}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>New date</span>
                <input
                  className="ui-input"
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  required
                  disabled={isDialogBusy}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>New time</span>
                <input
                  className="ui-input"
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  required
                  disabled={isDialogBusy}
                />
              </label>

              <div className={styles.modalActions}>
                <button
                  className="ui-btn ui-btn-secondary"
                  type="button"
                  onClick={closeReschedule}
                  disabled={isDialogBusy}
                >
                  Cancel
                </button>
                <button
                  className="ui-btn ui-btn-primary"
                  type="submit"
                  disabled={!canSubmitReschedule || isDialogBusy}
                >
                  {isDialogBusy ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="ui-empty" style={{ marginTop: 12 }}>
      <span className="ui-empty-icon">C</span>
      {message}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className={styles.skeletonList} aria-label="Loading appointments">
      {[1, 2, 3].map((n) => (
        <div key={n} className="ui-skeleton" style={{ height: 98 }} />
      ))}
    </div>
  );
}

