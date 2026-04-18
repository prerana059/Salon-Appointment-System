const db = require("../config/db");

exports.createAvailability = (req, res) => {
  const { staff_id, available_date, start_time, end_time } = req.body;

  const checkSql = `
    SELECT * FROM staff_availability
    WHERE staff_id = ? AND available_date = ?
  `;

  db.query(checkSql, [staff_id, available_date], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      return res.status(400).json({
        message: "Availability already exists for this staff on this date"
      });
    }

    // ✅ INSERT
    const insertSql = `
      INSERT INTO staff_availability
      (staff_id, available_date, start_time, end_time)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [staff_id, available_date, start_time, end_time],
      (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({ message: "Availability added successfully" });
      }
    );
  });
};

exports.getAvailability = (req, res) => {
  const sql = `
    SELECT sa.id, sa.staff_id, sa.available_date, sa.start_time, sa.end_time, u.name AS staff_name
    FROM staff_availability sa
    LEFT JOIN users u ON sa.staff_id = u.id
    ORDER BY sa.available_date DESC, sa.start_time ASC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.deleteAvailability = (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM staff_availability
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Availability not found"
      });
    }

    res.json({
      message: "Availability deleted successfully"
    });
  });
};