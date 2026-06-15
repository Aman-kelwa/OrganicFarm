import express from "express";

import protect from "../middleware/authMiddleware.js";

import authorizeRoles from "../middleware/roleMiddleware.js";

import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", protect, authorizeRoles("buyer"), addToCart);

router.get("/", protect, authorizeRoles("buyer"), getCart);

router.delete("/:listingId", protect, authorizeRoles("buyer"), removeFromCart);

router.put("/update", protect, authorizeRoles("buyer"), updateCartQuantity);

export default router;
