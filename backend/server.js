import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import path from "path";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://organic-farm-beta.vercel.app",
      "https://organic-farm-ohb6pagj5-aman-kelwas-projects.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json());
const httpServer = createServer(app);
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);

app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/uploads", express.static("uploads"));

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // Join user to their personal room
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {});
});

app.get("/", (req, res) => {
  res.send("OrganicFarm API Running...");
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

export { io };
