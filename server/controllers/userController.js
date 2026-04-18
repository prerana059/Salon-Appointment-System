const db = require("../config/db");

exports.getStaff = (req, res) => {

  const sql = "SELECT id, name FROM users WHERE role='staff'";

  db.query(sql, (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

};