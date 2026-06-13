import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);

app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("OrganicFarm API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
