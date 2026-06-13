import express from "express";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { createOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("buyer"), createOrder);

export default router;
