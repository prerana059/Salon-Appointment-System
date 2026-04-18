const express = require("express");
const router = express.Router();

const {
  createAvailability,
  getAvailability,
  deleteAvailability
} = require("../controllers/availabilityController");

const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// CREATE
router.post("/", verifyToken, authorizeRoles("admin"), createAvailability);

// GET ALL
router.get("/", verifyToken, authorizeRoles("admin"), getAvailability);

// DELETE
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteAvailability);

module.exports = router;