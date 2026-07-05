import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  createRental,
  getMyRentals,
  getSellerRentals,
  updateRentalStatus,
  deleteRental,
  createRentalPaymentOrder,
  verifyRentalPayment,
} from "../controllers/rentalController.js";

const router = express.Router();

// Create Razorpay Order for Rental
router.post(
  "/create-payment-order",
  protect,
  authorizeRoles("buyer"),
  createRentalPaymentOrder,
);

// Verify Rental Payment
router.post(
  "/verify-payment",
  protect,
  authorizeRoles("buyer"),
  verifyRentalPayment,
);
// Buyer creates rental request
router.post("/", protect, authorizeRoles("buyer"), createRental);

// Buyer rentals
router.get("/my-rentals", protect, authorizeRoles("buyer"), getMyRentals);

// Seller rental requests
router.get(
  "/seller-rentals",
  protect,
  authorizeRoles("seller"),
  getSellerRentals,
);

// Seller updates rental status
router.put(
  "/:id/status",
  protect,
  authorizeRoles("seller"),
  updateRentalStatus,
);

// Seller deletes rental
router.delete("/:id", protect, authorizeRoles("seller"), deleteRental);

export default router;
