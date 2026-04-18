const db = require("../config/db");


// CREATE SERVICE
exports.createService = (req, res) => {

  const { service_name, description, price, duration } = req.body;

  const sql = `
    INSERT INTO services (service_name, description, price, duration)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [service_name, description, price, duration], (err, result) => {

    if (!service_name || !price || !duration) {
    return res.status(400).json({ message: "Missing required fields" });
    }
    
    if (err) {
      console.error("Create Service Error:", err);
      return res.status(500).json({ message: "Error creating service" });
    }
    

    res.json({
      message: "Service created successfully",
      serviceId: result.insertId
    });

  });
};



// GET ALL SERVICES
exports.getServices = (req, res) => {

  const sql = "SELECT * FROM services";

  db.query(sql, (err, result) => {

    if (err) {
      console.error("Get Services Error:", err);
      return res.status(500).json({ message: "Error fetching services" });
    }

    res.json(result);

  });

};



// UPDATE SERVICE
exports.updateService = (req, res) => {

  const { id } = req.params;
  const { service_name, description, price, duration, status } = req.body;

  const sql = `
    UPDATE services
    SET service_name=?, description=?, price=?, duration=?, status=?
    WHERE id=?
  `;

  db.query(
    sql,
    [service_name, description, price, duration, status, id],
    (err, result) => {

      if (err) {
        console.error("Update Service Error:", err);
        return res.status(500).json({ message: "Error updating service" });
      }

      res.json({ message: "Service updated successfully" });

    }
  );

};



// DELETE SERVICE
exports.deleteService = (req, res) => {

  const { id } = req.params;

  const sql = "DELETE FROM services WHERE id=?";

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.error("Delete Service Error:", err);
      return res.status(500).json({ message: "Error deleting service" });
    }

    res.json({ message: "Service deleted successfully" });

  });

};



// ADMIN DASHBOARD STATS
exports.getDashboardStats = (req, res) => {

  const stats = {};

  db.query(
    "SELECT COUNT(*) AS totalUsers FROM users",
    (err, users) => {

      if (err) return res.status(500).json(err);

      stats.totalUsers = users[0].totalUsers;

      db.query(
        "SELECT COUNT(*) AS totalServices FROM services",
        (err, services) => {

          if (err) return res.status(500).json(err);

          stats.totalServices = services[0].totalServices;

          db.query(
            "SELECT COUNT(*) AS totalAppointments FROM appointments WHERE status='booked'",
            (err, appointments) => {

              if (err) return res.status(500).json(err);

              stats.activeAppointments = appointments[0].totalAppointments;

              db.query(
                `
                SELECT SUM(s.price) AS totalRevenue
                FROM appointments a
                JOIN services s ON a.service_id = s.id
                WHERE a.status='completed'
                `,
                (err, revenue) => {

                  if (err) return res.status(500).json(err);

                  stats.totalRevenue = revenue[0].totalRevenue || 0;

                  res.json(stats);

                }
              );

            }
          );

        }
      );

    }
  );

};

exports.getStaffSchedule = (req, res) => {

  const staffId = req.user.id;

  const sql = `
  SELECT a.*, s.service_name
  FROM appointments a
  JOIN services s ON a.service_id = s.id
  WHERE a.staff_id = ?
  `;

  db.query(sql, [staffId], (err, result) => {

    if (err) return res.status(500).json(err);

    res.json(result);

  });

};