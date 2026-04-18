const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/serviceController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");


router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  serviceController.createService
);

router.get(
  "/dashboard",
  verifyToken,
  authorizeRoles("admin"),
  serviceController.getDashboardStats
);

router.get(
  "/",
  verifyToken,
  serviceController.getServices
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  serviceController.updateService
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  serviceController.deleteService
);

module.exports = router;