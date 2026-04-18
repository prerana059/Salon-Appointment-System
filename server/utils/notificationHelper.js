const db = require("../config/db");

/**
 * Insert a notification for a user.
 * Status defaults to 'unread' per DB schema.
 */
exports.createNotification = (userId, message, callback) => {
  if (!userId || !message) {
    if (callback) callback(new Error("userId and message are required"));
    return;
  }

  const sql = `INSERT INTO notifications (user_id, message) VALUES (?, ?)`;
  db.query(sql, [userId, message], (err, result) => {
    if (callback) callback(err, result);
  });
};

