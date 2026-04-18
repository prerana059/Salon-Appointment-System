import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
import { getApiErrorMessage } from "../utils/errorMessages";

const BookAppointment = () => {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [staff, setStaff] = useState([]);
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const { success, error: notifyError, warning } = useNotification();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchServices = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/services",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setServices(res.data);
      } catch (err) {
        console.error(err);
        notifyError(getApiErrorMessage(err, "Unable to load services."));
      } finally {
        setLoadingServices(false);
      }
    };

    const fetchStaff = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/users/staff",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStaff(res.data);
      } catch (err) {
        console.error(err);
        notifyError(getApiErrorMessage(err, "Unable to load staff list."));
      }
    };

    fetchServices();
    fetchStaff();
  }, []);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/appointments/available-slots?staff_id=${staffId}&date=${date}&service_id=${serviceId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSlots(res.data);
    } catch (err) {
      console.error("Slot fetch error:", err);
      notifyError(getApiErrorMessage(err, "Could not fetch slots for the selected date."));
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (serviceId && staffId && date) {
      fetchSlots();
    }
  }, [serviceId, staffId, date]);

  const selectedService = services.find(
    (s) => String(s.id) === String(serviceId)
  );

  const handleBooking = async () => {
    if (booking) {
      return;
    }
    if (!serviceId || !staffId || !date || !time || !endTime) {
      warning("Please select all fields including a slot.");
      return;
    }

    setBooking(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/appointments",
        {
          service_id: serviceId,
          staff_id: staffId,
          appointment_date: date,
          start_time: time,
          end_time: endTime
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      success("Appointment booked successfully.");

      setServiceId("");
      setStaffId("");
      setDate("");
      setTime("");
      setEndTime("");
      setSlots([]);

    } catch (error) {
      console.error(error);
      notifyError(getApiErrorMessage(error, "Booking failed"));
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="ui-page">
      <div className="ui-card" style={styles.card}>
        <h2 className="ui-title">Book Appointment</h2>
        <p className="ui-subtitle">
          Choose a service, staff member, and time slot to confirm your booking.
        </p>

        <div style={styles.formGrid}>
          <div>
            <label style={styles.label}>Service</label>
            {loadingServices ? (
              <div className="ui-skeleton" style={{ height: "42px" }} />
            ) : (
              <select
                className="ui-select"
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  setSlots([]);
                  setTime("");
                  setEndTime("");
                }}
              >
                <option value="">Select Service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.service_name} - Rs {s.price}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label style={styles.label}>Staff Member</label>
            <select
              className="ui-select"
              value={staffId}
              onChange={(e) => {
                setStaffId(e.target.value);
                setSlots([]);
                setTime("");
                setEndTime("");
              }}
            >
              <option value="">Select Staff</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>Date</label>
            <input
              className="ui-input"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSlots([]);
                setTime("");
                setEndTime("");
              }}
            />
          </div>
        </div>

        {selectedService ? (
          <p style={{ margin: "14px 0 6px", color: "#735b7c" }}>
            Service Duration: <strong>{selectedService.duration} minutes</strong>
          </p>
        ) : null}

        <h3 style={{ margin: "20px 0 10px" }}>Available Slots</h3>
        {loadingSlots ? (
          <div style={styles.slotGrid}>
            {[1, 2, 3, 4].map((slot) => (
              <div key={slot} className="ui-skeleton" style={{ height: "40px" }} />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="ui-empty">
            <span className="ui-empty-icon">T</span>
            Select service, staff, and date to view available slots.
          </div>
        ) : (
          <div style={styles.slotGrid}>
            {slots.map((slot, index) => (
              <button
                key={index}
                disabled={!slot.available}
                onClick={() => {
                  setTime(slot.start);
                  setEndTime(slot.end);
                }}
                className="ui-btn"
                style={{
                  ...styles.slotButton,
                  backgroundColor: !slot.available
                    ? "#efe3f4"
                    : time === slot.start
                    ? "#d8b8f3"
                    : "#fff",
                  color: !slot.available ? "#ae94b8" : time === slot.start ? "#4f3a66" : "#5c4866",
                  borderColor: time === slot.start ? "#d8b8f3" : "#e4d0ef"
                }}
              >
                {slot.start} - {slot.end}
              </button>
            ))}
          </div>
        )}

        {time ? (
          <p style={{ marginTop: "16px" }}>
            Selected Time: <strong>{time} - {endTime}</strong>
          </p>
        ) : null}

        <button
          className="ui-btn ui-btn-primary"
          onClick={handleBooking}
          disabled={booking}
          style={{ marginTop: "16px" }}
        >
          {booking ? "Booking..." : "Book Appointment"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    maxWidth: "880px",
    margin: "0 auto",
    padding: "24px"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginTop: "16px"
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#6f5877",
    fontSize: "0.9rem",
    fontWeight: 600
  },
  slotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "10px"
  },
  slotButton: {
    border: "1px solid",
    fontWeight: 600
  }
};

export default BookAppointment;