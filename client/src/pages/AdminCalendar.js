import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fetchAdminAppointments } from "../api/appointmentService";
import AdminSidebar from "../components/AdminSidebar";

import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";

const locales = {
  "en-US": enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const appointments = await fetchAdminAppointments();
      setAppointments(Array.isArray(appointments) ? appointments : []);

      const formatted = appointments
        .map((appt) => {
          const appointmentDate = normalizeDate(appt.appointment_date);
          const start = buildDateTime(appointmentDate, appt.start_time);
          const end = buildDateTime(appointmentDate, appt.end_time);

          if (!start || !end) {
            return null;
          }

          return {
            title: `${appt.service_name} - ${appt.customer_name}`,
            start,
            end,
            status: String(appt.status || "").toLowerCase(),
            service_name: appt.service_name,
            customer_name: appt.customer_name,
            staff_name: appt.staff_name,
            start_time: appt.start_time,
            end_time: appt.end_time,
            appointment_date: normalizeDate(appt.appointment_date)
          };
        })
        .filter(Boolean);

      setEvents(formatted);
    } catch (err) {
      console.error("Calendar fetch error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load calendar appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 🎨 Color events based on status
  const eventStyleGetter = (event) => {
    let backgroundColor = "#9bc4f3";

    if (event.status === "completed") backgroundColor = "#c7a8ef";
    if (event.status === "cancelled") backgroundColor = "#f2adc8";
    if (event.status === "booked") backgroundColor = "#9bc4f3";

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        color: "white",
        border: "none",
        padding: "4px 6px",
        fontSize: "0.78rem"
      }
    };
  };

  const selectedDateAppointments = appointments.filter((appointment) => {
    const selected = normalizeDate(toDateOnlyString(selectedDate));
    const appointmentDate = normalizeDate(appointment.appointment_date);
    return appointmentDate === selected;
  });

  return (
    <div className="ui-page">
      <div className="admin-layout">
        <AdminSidebar />
        <div className="ui-card" style={{ padding: "20px" }}>
          <h2 className="ui-title">Appointment Calendar</h2>
          <p className="ui-subtitle">
            Monthly appointment visualization with quick date-wise schedule view.
          </p>
          <button className="ui-btn ui-btn-secondary" onClick={fetchAppointments}>
            Refresh Calendar
          </button>

          {loading ? (
            <div style={{ marginTop: "12px" }}>
              <div className="ui-skeleton" style={{ height: "30px", marginBottom: "8px" }} />
              <div className="ui-skeleton" style={{ height: "420px" }} />
            </div>
          ) : null}

          {error ? <div className="ui-toast ui-toast-error">{error}</div> : null}

          {!loading && !error && events.length === 0 ? (
            <div className="ui-empty">
              <span className="ui-empty-icon">C</span>
              No appointments available to display.
            </div>
          ) : null}

          <div
            style={{
              height: "600px",
              background: "white",
              padding: "10px",
              borderRadius: "10px",
              boxShadow: "0 8px 24px rgba(166, 127, 191, 0.2)"
            }}
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView="month"
              views={["month", "week", "day"]}
              selectable
              popup
              onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
              onSelectEvent={(event) => setSelectedEvent(event)}
              style={{ height: "100%" }}
              eventPropGetter={eventStyleGetter}
            />
          </div>

          <div style={styles.selectedDateCard}>
            <h3 style={styles.selectedDateTitle}>
              Appointments on {formatDateHeader(selectedDate)}
            </h3>
            {selectedDateAppointments.length === 0 ? (
              <div className="ui-empty" style={{ padding: "20px" }}>
                <span className="ui-empty-icon">C</span>
                No appointments on this date.
              </div>
            ) : (
              <div style={styles.dateList}>
                {selectedDateAppointments.map((appointment) => (
                  <div key={appointment.id} style={styles.dateListItem}>
                    <div>
                      <p style={styles.dateListHeading}>{appointment.service_name}</p>
                      <p style={styles.dateListSub}>
                        Staff: {appointment.staff_name} | Customer: {appointment.customer_name}
                      </p>
                    </div>
                    <div style={styles.dateListRight}>
                      <p style={styles.dateListTime}>
                        {formatTime(appointment.start_time)} -{" "}
                        {formatTime(appointment.end_time)}
                      </p>
                      <span style={getStatusPillStyle(appointment.status)}>
                        {String(appointment.status || "").toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedEvent ? (
        <div style={styles.modalOverlay} onClick={() => setSelectedEvent(null)}>
          <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Appointment Details</h3>
            <p>
              <strong>Service:</strong> {selectedEvent.service_name}
            </p>
            <p>
              <strong>Customer:</strong> {selectedEvent.customer_name}
            </p>
            <p>
              <strong>Staff:</strong> {selectedEvent.staff_name}
            </p>
            <p>
              <strong>Date:</strong> {formatDateHeader(new Date(`${selectedEvent.appointment_date}T00:00:00`))}
            </p>
            <p>
              <strong>Time:</strong> {formatTime(selectedEvent.start_time)} -{" "}
              {formatTime(selectedEvent.end_time)}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span style={getStatusPillStyle(selectedEvent.status)}>
                {String(selectedEvent.status || "").toUpperCase()}
              </span>
            </p>
            <button
              className="ui-btn ui-btn-secondary"
              onClick={() => setSelectedEvent(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminCalendar;

function normalizeDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function buildDateTime(datePart, timePart) {
  if (!datePart || !timePart) return null;
  const cleanTime = String(timePart).slice(0, 8);
  const [hours, minutes] = cleanTime.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const date = new Date(`${datePart}T00:00:00`);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 5);
}

function toDateOnlyString(dateObj) {
  if (!(dateObj instanceof Date)) return "";
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateHeader(dateObj) {
  if (!(dateObj instanceof Date)) return "-";
  return dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
}

function getStatusPillStyle(status) {
  const normalized = String(status || "").toLowerCase();
  const palette = {
    booked: { bg: "#ecf5ff", border: "#b7d5f8", color: "#4a6691" },
    completed: { bg: "#f2e9ff", border: "#ccb5f3", color: "#6a4f99" },
    cancelled: { bg: "#fdeef6", border: "#f6bfd5", color: "#8e5069" }
  };
  const colors = palette[normalized] || palette.booked;
  return {
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.bg,
    color: colors.color,
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "0.72rem",
    fontWeight: 700,
    display: "inline-block"
  };
}

const styles = {
  selectedDateCard: {
    marginTop: "16px",
    border: "1px solid #eddcf1",
    borderRadius: "12px",
    padding: "14px",
    backgroundColor: "#ffffff"
  },
  selectedDateTitle: {
    margin: "0 0 12px"
  },
  dateList: {
    display: "grid",
    gap: "10px"
  },
  dateListItem: {
    border: "1px solid #eddcf1",
    borderRadius: "10px",
    padding: "10px 12px",
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap"
  },
  dateListHeading: {
    margin: 0,
    fontWeight: 700
  },
  dateListSub: {
    margin: "6px 0 0",
    color: "#7f6487",
    fontSize: "0.88rem"
  },
  dateListRight: {
    textAlign: "right"
  },
  dateListTime: {
    margin: "0 0 6px",
    fontWeight: 700,
    fontSize: "0.88rem"
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(133, 95, 156, 0.36)",
    display: "grid",
    placeItems: "center",
    padding: "16px",
    zIndex: 30
  },
  modal: {
    width: "100%",
    maxWidth: "440px",
    borderRadius: "12px",
    backgroundColor: "#fff",
    padding: "20px",
    boxShadow: "0 20px 40px rgba(147, 110, 173, 0.25)"
  }
};