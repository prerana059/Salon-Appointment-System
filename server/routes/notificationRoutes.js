const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markNotificationRead,
  markAllRead
} = require("../controllers/notificationController");

const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getMyNotifications);
router.put("/:id/read", verifyToken, markNotificationRead);
router.put("/read-all", verifyToken, markAllRead);

module.exports = router;

