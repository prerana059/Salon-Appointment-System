const express = require("express");
const router = express.Router();

const {
  bookAppointment,
  getAllAppointments,
  cancelAppointment,
  getMyAppointments,
  rescheduleAppointment,
  getDashboardStats,
  getStaffAppointments,
  markCompleted,
  getAvailableSlots
} = require("../controllers/appointmentController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Customer books appointment
router.post(
  "/",
  verifyToken,
  authorizeRoles("customer"),
  bookAppointment
);

// Admin views all appointments
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  getAllAppointments
);

// Cancel appointment (customer or admin)
router.put(
  "/cancel/:id",
  verifyToken,
  authorizeRoles("customer", "admin"),
  cancelAppointment
);

router.get(
  "/my",
  verifyToken,
  authorizeRoles("customer"),
  getMyAppointments
);

router.get(
  "/staff", 
  verifyToken, 
  authorizeRoles("staff"), 
  getStaffAppointments
);

router.put(
  "/reschedule/:id",
  verifyToken,
  authorizeRoles("customer", "admin"),
  rescheduleAppointment
);

router.put(
  "/complete/:id",
  verifyToken,
  authorizeRoles("admin", "staff"),
  markCompleted
);

router.get(
  "/dashboard",
  verifyToken,
  authorizeRoles("admin"),
  getDashboardStats
);

router.get(
  "/available-slots",
  verifyToken,
  authorizeRoles("customer"),
  getAvailableSlots
);

module.exports = router;