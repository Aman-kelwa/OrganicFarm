import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  createListing,
  getAllListings,
  getListingById,
  deleteListing,
} from "../controllers/listingController.js";

const router = express.Router();

router.get("/", getAllListings);

router.get("/:id", getListingById);

router.post("/", protect, createListing);

router.delete("/:id", protect, deleteListing);

export default router;
