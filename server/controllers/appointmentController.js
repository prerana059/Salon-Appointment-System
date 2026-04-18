const db = require("../config/db");
const { createNotification } = require("../utils/notificationHelper");

// BOOK APPOINTMENT
exports.bookAppointment = (req, res) => {
  const customer_id = req.user.id;

  const {
    service_id,
    staff_id,
    appointment_date,
    start_time,
    end_time
  } = req.body;

  if (!service_id || !staff_id || !appointment_date || !start_time || !end_time) {
    return res.status(400).json({
      message: "All booking fields are required"
    });
  }

  if (start_time < "09:00" || end_time > "22:00") {
    return res.status(400).json({
      message: "Appointments must be between 09:00 and 22:00"
    });
  }


  const checkQuery = `
    SELECT *
    FROM appointments
    WHERE staff_id = ?
      AND appointment_date = ?
      AND status = 'booked'
      AND (
        start_time < ?
        AND end_time > ?
      )
  `;

  // ✅ 1. Check staff availability FIRST
const availabilityCheck = `
  SELECT *
  FROM staff_availability
  WHERE staff_id = ?
    AND available_date = ?
    AND start_time <= ?
    AND end_time >= ?
`;

db.query(
  availabilityCheck,
  [staff_id, appointment_date, start_time, end_time],
  (err, availabilityResult) => {
    if (err) {
      console.log("Availability check error:", err);
      return res.status(500).json(err);
    }

    if (availabilityResult.length === 0) {
      return res.status(400).json({
        message: "Staff is not available at this time"
      });
    }

    db.query(
      checkQuery,
      [staff_id, appointment_date, end_time, start_time],
      (err, result) => {
        if (err) {
          console.log("Booking conflict check error:", err);
          return res.status(500).json(err);
        }

        if (result.length > 0) {
          return res.status(400).json({
            message: "This staff member already has an appointment at this time."
          });
        }

        // ✅ 3. Insert booking
        const insertQuery = `
          INSERT INTO appointments
          (customer_id, service_id, staff_id, appointment_date, start_time, end_time, status)
          VALUES (?, ?, ?, ?, ?, ?, 'booked')
        `;

        db.query(
          insertQuery,
          [customer_id, service_id, staff_id, appointment_date, start_time, end_time],
          (err, result) => {
            if (err) {
              console.log("Booking insert error:", err);
              return res.status(500).json(err);
            }

            createNotification(customer_id, "Appointment booked successfully", (nErr) => {
              if (nErr) console.error("Notification insert error:", nErr);
              res.json({
                message: "Appointment booked successfully"
              });
            });
          }
        );
      }
    );
  }
);
};

// RESCHEDULE APPOINTMENT
exports.rescheduleAppointment = (req, res) => {
  const { id } = req.params;
  const { appointment_date, start_time } = req.body;

  if (!appointment_date || !start_time) {
    return res.status(400).json({
      message: "appointment_date and start_time are required"
    });
  }

  const getAppointmentSql = `
    SELECT a.id, a.staff_id, a.customer_id, a.status, a.service_id, s.duration
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.id = ?
  `;

  db.query(getAppointmentSql, [id], (err, appointmentResult) => {
    if (err) {
      console.log("Get appointment error:", err);
      return res.status(500).json(err);
    }

    if (appointmentResult.length === 0) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    if (appointmentResult[0].status !== "booked") {
      return res.status(400).json({
        message: "Only booked appointments can be rescheduled"
      });
    }

    const staff_id = appointmentResult[0].staff_id;
    const durationMinutes = Number(appointmentResult[0].duration || 0);

    if (!durationMinutes) {
      return res.status(400).json({
        message: "Service duration missing for this appointment"
      });
    }

    // Compute end_time from service duration so conflict checks are accurate.
    // Also normalize start_time to HH:MM to avoid lexicographic comparison issues.
    const [startHour, startMinute] = start_time.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(startHour);
    startDate.setMinutes(startMinute);
    startDate.setMinutes(startDate.getMinutes() + durationMinutes);

    const endHour = String(startDate.getHours()).padStart(2, "0");
    const endMinute = String(startDate.getMinutes()).padStart(2, "0");
    const end_time = `${endHour}:${endMinute}`;

    const normalizedStartTime = `${String(startHour).padStart(2, "0")}:${String(
      startMinute
    ).padStart(2, "0")}`;

    if (normalizedStartTime < "09:00" || end_time > "17:00") {
      return res.status(400).json({
        message: "Appointments must be between 09:00 and 17:00"
      });
    }

    const checkSql = `
      SELECT *
      FROM appointments
      WHERE staff_id = ?
        AND appointment_date = ?
        AND status = 'booked'
        AND id != ?
        AND (
          start_time < ?
          AND end_time > ?
        )
    `;

    db.query(
      checkSql,
      [staff_id, appointment_date, id, end_time, normalizedStartTime],
      (err, conflictResult) => {
        if (err) {
          console.log("Reschedule conflict check error:", err);
          return res.status(500).json(err);
        }

        if (conflictResult.length > 0) {
          return res.status(400).json({
            message: "This staff member is already booked for that time slot"
          });
        }

        const updateSql = `
          UPDATE appointments
          SET appointment_date = ?, start_time = ?, end_time = ?
          WHERE id = ?
        `;

        db.query(
          updateSql,
          [appointment_date, normalizedStartTime, end_time, id],
          (err, result) => {
            if (err) {
              console.log("Reschedule update error:", err);
              return res.status(500).json(err);
            }

            const customerId = appointmentResult[0].customer_id;
            const actorRole = String(req.user?.role || "").toLowerCase();
            const message =
              actorRole === "admin"
                ? "Your appointment has been rescheduled"
                : "Your appointment has been rescheduled";

            createNotification(customerId, message, (nErr) => {
              if (nErr) console.error("Notification insert error:", nErr);
              res.json({
                message: "Appointment rescheduled successfully"
              });
            });
          }
        );
      }
    );
  });
};

// GET ALL APPOINTMENTS (Admin)
// GET ALL APPOINTMENTS (Admin)
exports.getAllAppointments = (req, res) => {
  const sql = `
    SELECT 
      a.id,
      a.appointment_date,
      a.start_time,
      a.end_time,
      a.status,
      a.customer_id,
      a.staff_id,
      a.service_id,
      customer.name AS customer_name,
      staff.name AS staff_name,
      s.service_name,
      s.price
    FROM appointments a
    JOIN users customer ON a.customer_id = customer.id
    JOIN users staff ON a.staff_id = staff.id
    JOIN services s ON a.service_id = s.id
    ORDER BY a.appointment_date DESC, a.start_time ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("getAllAppointments error:", err);
      return res.status(500).json({
        message: "Failed to fetch appointments",
        error: err.message
      });
    }

    res.json(result);
  });
};

// CANCEL APPOINTMENT
exports.cancelAppointment = (req, res) => {
  const { id } = req.params;
  const actorRole = String(req.user?.role || "").toLowerCase();
  const actorId = req.user?.id;

  const getSql = `SELECT id, customer_id, status FROM appointments WHERE id = ?`;
  db.query(getSql, [id], (err, rows) => {
    if (err) {
      console.error("Cancel get appointment error:", err);
      return res.status(500).json({ message: "Failed to cancel appointment" });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointment = rows[0];
    if (String(appointment.status).toLowerCase() === "cancelled") {
      return res.json({ message: "Appointment already cancelled" });
    }
    if (String(appointment.status).toLowerCase() === "completed") {
      return res.status(400).json({ message: "Completed appointments cannot be cancelled" });
    }

    // Customers can only cancel their own appointment
    if (actorRole === "customer" && Number(appointment.customer_id) !== Number(actorId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updateSql = `UPDATE appointments SET status = 'cancelled' WHERE id = ?`;
    db.query(updateSql, [id], (uErr, result) => {
      if (uErr) {
        console.error("Cancel update error:", uErr);
        return res.status(500).json({ message: "Failed to cancel appointment" });
      }

      const customerId = appointment.customer_id;
      const message =
        actorRole === "customer"
          ? "You cancelled your appointment"
          : "Your appointment was cancelled by staff/admin";

      createNotification(customerId, message, (nErr) => {
        if (nErr) console.error("Notification insert error:", nErr);
        res.json({ message: "Appointment cancelled" });
      });
    });
  });
};

// CUSTOMER VIEW OWN APPOINTMENTS
exports.getMyAppointments = (req, res) => {
  const customer_id = req.user.id;

  const sql = `
    SELECT 
      a.id,
      DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
      a.start_time,
      a.end_time,
      a.status,
      a.service_id,
      s.service_name,
      s.duration,
      u.name AS staff_name
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN users u ON a.staff_id = u.id
    WHERE a.customer_id = ?
    ORDER BY a.appointment_date DESC, a.start_time DESC
  `;

  db.query(sql, [customer_id], (err, result) => {
    if (err) {
      console.log("getMyAppointments error:", err);
      return res.status(500).json({
        message: "Failed to fetch appointments",
        error: err.message
      });
    }

    res.json(result);
  });
};

// STAFF SCHEDULE
exports.getStaffAppointments = (req, res) => {
  const staffId = req.user.id;

  const sql = `
    SELECT 
      a.id,
      a.appointment_date,
      a.start_time,
      a.end_time,
      a.status,
      u.name AS customer_name,
      s.service_name
    FROM appointments a
    JOIN users u ON a.customer_id = u.id
    JOIN services s ON a.service_id = s.id
    WHERE a.staff_id = ?
    ORDER BY a.appointment_date DESC, a.start_time ASC
  `;

  db.query(sql, [staffId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching staff appointments" });
    }

    res.json(result);
  });
};

// MARK AS COMPLETED
exports.markCompleted = (req, res) => {
  const appointmentId = req.params.id;

  const getSql = `SELECT id, customer_id, status FROM appointments WHERE id = ?`;
  db.query(getSql, [appointmentId], (gErr, rows) => {
    if (gErr) {
      console.error("markCompleted get error:", gErr);
      return res.status(500).json({ message: "Error updating status" });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointment = rows[0];
    const currentStatus = String(appointment.status || "").toLowerCase();
    if (currentStatus === "completed") {
      return res.json({ message: "Appointment already completed" });
    }
    if (currentStatus === "cancelled") {
      return res.status(400).json({ message: "Cancelled appointments cannot be completed" });
    }

    const sql = `UPDATE appointments SET status = 'completed' WHERE id = ?`;
    db.query(sql, [appointmentId], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating status" });
      }

      createNotification(appointment.customer_id, "Your appointment has been completed", (nErr) => {
        if (nErr) console.error("Notification insert error:", nErr);
        res.json({ message: "Appointment marked as completed" });
      });
    });
  });
};

// DASHBOARD STATS
exports.getDashboardStats = (req, res) => {
  const stats = {};

  db.query("SELECT COUNT(*) as totalUsers FROM users", (err, users) => {
    if (err) return res.status(500).json(err);
    stats.totalUsers = users[0].totalUsers;

    db.query("SELECT COUNT(*) as totalServices FROM services", (err, services) => {
      if (err) return res.status(500).json(err);
      stats.totalServices = services[0].totalServices;

      db.query(
        "SELECT COUNT(*) as totalAppointments FROM appointments WHERE status='booked'",
        (err, appointments) => {
          if (err) return res.status(500).json(err);
          stats.activeAppointments = appointments[0].totalAppointments;

          db.query(
            `SELECT SUM(s.price) as totalRevenue
             FROM appointments a
             JOIN services s ON a.service_id = s.id
             WHERE a.status='completed'`,
            (err, revenue) => {
              if (err) return res.status(500).json(err);
              stats.totalRevenue = revenue[0].totalRevenue || 0;
              res.json(stats);
            }
          );
        }
      );
    });
  });
};

exports.getAvailableSlots = (req, res) => {
  const { staff_id, date, service_id } = req.query;

  if (!staff_id || !date) {
    return res.status(400).json({
      message: "staff_id and date are required"
    });
  }

  const serviceSql = `
  SELECT duration FROM services WHERE id = ?
`;

db.query(serviceSql, [service_id], (err, serviceResult) => {
  if (err) return res.status(500).json(err);

  const duration = serviceResult[0]?.duration;

  if (!duration) {
    return res.status(400).json({
      message: "Service duration not found"
    });
  }
  

  // 1. Get availability
  const availabilitySql = `
    SELECT start_time, end_time
    FROM staff_availability
    WHERE staff_id = ? AND available_date = ?
  `;

  db.query(availabilitySql, [staff_id, date], (err, availability) => {
    if (err) return res.status(500).json(err);

    if (availability.length === 0) {
      return res.json([]); // no slots
    }

    const { start_time, end_time } = availability[0];

    // 2. Get booked appointments
    const bookedSql = `
      SELECT start_time, end_time
      FROM appointments
      WHERE staff_id = ?
      AND appointment_date = ?
      AND status = 'booked'
    `;

    db.query(bookedSql, [staff_id, date], (err, booked) => {
      if (err) return res.status(500).json(err);

      let slots = [];

      let current = start_time;

      while (current < end_time) {
  let next = addMinutes(current, duration);

  let isBooked = booked.some(b =>
    current < b.end_time && next > b.start_time
  );

  slots.push({
    start: current,
    end: next,
    available: !isBooked
  });

  current = next;
}

      res.json(slots);
    });
  });
});
};

// helper
function addMinutes(time, minutes) {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m + minutes);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

