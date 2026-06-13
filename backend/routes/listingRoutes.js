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
} from "../controllers/listingController.js";

const router = express.Router();

router.get("/", getAllListings);

router.get("/my", protect, getMyListings);

router.get("/:id", getListingById);

router.post("/", protect, authorizeRoles("seller"), createListing);

router.delete("/:id", protect, deleteListing);

router.put("/:id", protect, updateListing);

export default router;
