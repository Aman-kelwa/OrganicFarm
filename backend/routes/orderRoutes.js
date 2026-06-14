import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/my-orders", protect, authorizeRoles("buyer"), getMyOrders);

router.get(
  "/seller-orders",
  protect,
  authorizeRoles("seller"),
  getSellerOrders,
);

router.put("/:id/status", protect, authorizeRoles("seller"), updateOrderStatus);
router.post("/", protect, authorizeRoles("buyer"), createOrder);

export default router;
