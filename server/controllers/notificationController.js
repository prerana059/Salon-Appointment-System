const db = require("../config/db");

exports.getMyNotifications = (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT id, user_id, message, status, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("getMyNotifications error:", err);
      return res.status(500).json({ message: "Failed to fetch notifications" });
    }
    res.json(Array.isArray(rows) ? rows : []);
  });
};

exports.markNotificationRead = (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  const sql = `
    UPDATE notifications
    SET status = 'read'
    WHERE id = ? AND user_id = ? AND status = 'unread'
  `;

  db.query(sql, [notificationId, userId], (err, result) => {
    if (err) {
      console.error("markNotificationRead error:", err);
      return res.status(500).json({ message: "Failed to mark notification as read" });
    }

    res.json({
      message: "Notification marked as read",
      updated: result.affectedRows || 0
    });
  });
};

exports.markAllRead = (req, res) => {
  const userId = req.user.id;

  const sql = `
    UPDATE notifications
    SET status = 'read'
    WHERE user_id = ? AND status = 'unread'
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("markAllRead error:", err);
      return res.status(500).json({ message: "Failed to mark all notifications as read" });
    }

    res.json({
      message: "All notifications marked as read",
      updated: result.affectedRows || 0
    });
  });
};

