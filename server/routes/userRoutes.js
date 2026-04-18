const express = require("express");
const router = express.Router();
const db = require("../config/db");

const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const userController = require("../controllers/userController");

// GET all users (Admin only)
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  (req, res) => {
    db.query("SELECT id, name, email, role FROM users", (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  }
);

// DELETE user (Admin only)
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "User deleted successfully" });
    });
  }
);

router.get(
  "/staff",
  verifyToken,
  authorizeRoles("customer", "admin"),
  userController.getStaff
);

module.exports = router;