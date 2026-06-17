import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  getSellerDashboard,
  getBuyerDashboard,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/seller", protect, authorizeRoles("seller"), getSellerDashboard);

router.get("/buyer", protect, authorizeRoles("buyer"), getBuyerDashboard);

export default router;
