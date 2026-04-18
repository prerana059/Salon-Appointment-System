import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Dashboard from "../components/customer/Dashboard";
import { useNotification } from "../context/NotificationContext";
import { getApiErrorMessage } from "../utils/errorMessages";

function CustomerDashboard() {
  const navigate = useNavigate();
  const { success, error: notifyError, warning } = useNotification();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingAction, setProcessingAction] = useState({ id: null, type: "" });
  const [unreadCount, setUnreadCount] = useState(0);

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

  const fetchUnreadNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      const items = Array.isArray(response.data) ? response.data : [];
      setUnreadCount(items.filter((n) => String(n.status).toLowerCase() === "unread").length);
    } catch (e) {
      // Non-blocking for dashboard UX
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchUnreadNotifications();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      fetchUnreadNotifications();
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const now = new Date();
    const isPast = (appt) => {
      const status = String(appt?.status || "").toLowerCase();
      if (status === "completed" || status === "cancelled") return true;
      const date = String(appt?.appointment_date || "").slice(0, 10);
      const time = String(appt?.start_time || "").slice(0, 5);
      if (!date) return false;
      const dt = new Date(`${date}T${time || "00:00"}:00`);
      return dt.getTime() < now.getTime();
    };

    const upcoming = [];
    const past = [];
    (appointments || []).forEach((a) => {
      (isPast(a) ? past : upcoming).push(a);
    });

    const byDateAsc = (a, b) => toDateTime(a) - toDateTime(b);
    const byDateDesc = (a, b) => toDateTime(b) - toDateTime(a);
    upcoming.sort(byDateAsc);
    past.sort(byDateDesc);

    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [appointments]);

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
      await fetchUnreadNotifications();
    } catch (requestError) {
      console.error(requestError);
      notifyError(getApiErrorMessage(requestError, "Cancel failed."));
    } finally {
      setProcessingAction({ id: null, type: "" });
    }
  };

  const rescheduleAppointment = async (id, { date, time }) => {
    if (processingAction.id) return;

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const timePattern = /^\d{2}:\d{2}$/;
    if (!datePattern.test(date) || !timePattern.test(time)) {
      warning("Use valid formats: date YYYY-MM-DD and time HH:MM.");
      return;
    }

    setProcessingAction({ id, type: "reschedule" });
    try {
      await api.put(`/appointments/reschedule/${id}`, {
        appointment_date: date,
        start_time: time
      });
      success("Appointment rescheduled successfully.");
      await fetchAppointments();
      await fetchUnreadNotifications();
    } catch (requestError) {
      console.error(requestError);
      notifyError(getApiErrorMessage(requestError, "Reschedule failed."));
    } finally {
      setProcessingAction({ id: null, type: "" });
    }
  };

  return (
    <Dashboard
      heading="My Dashboard"
      error={error}
      loading={loading}
      upcomingAppointments={upcomingAppointments}
      pastAppointments={pastAppointments}
      processingAction={processingAction}
      onCancel={cancelAppointment}
      onReschedule={rescheduleAppointment}
      onBookNew={() => navigate("/book")}
      onOpenNotifications={() => navigate("/notifications")}
      unreadCount={unreadCount}
    />
  );
}

function toDateTime(appt) {
  const date = String(appt?.appointment_date || "").slice(0, 10);
  const time = String(appt?.start_time || "").slice(0, 5);
  if (!date) return Number.POSITIVE_INFINITY;
  return new Date(`${date}T${time || "00:00"}:00`).getTime();
}

export default CustomerDashboard;