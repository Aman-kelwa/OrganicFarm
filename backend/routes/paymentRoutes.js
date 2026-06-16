import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/create-order",
  protect,
  authorizeRoles("buyer"),
  createPaymentOrder,
);

router.post("/verify", protect, authorizeRoles("buyer"), verifyPayment);

export default router;
