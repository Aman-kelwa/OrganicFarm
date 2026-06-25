import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import {
  createListing,
  getAllListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
  createListingReview,
} from "../controllers/listingController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("seller"),
  upload.single("image"),
  createListing,
);

router.get("/", getAllListings);

router.get("/my", protect, getMyListings);

router.get("/:id", getListingById);

router.delete("/:id", protect, deleteListing);

router.put(
  "/:id",
  protect,
  authorizeRoles("seller"),
  upload.single("image"),
  updateListing,
);

router.post(
  "/:id/reviews",
  protect,
  authorizeRoles("buyer", "seller"),
  createListingReview,
);

export default router;
