import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import { createPaymentOrder } from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/create-order",
  protect,
  authorizeRoles("buyer"),
  createPaymentOrder,
);

export default router;
