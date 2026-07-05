import Rental from "../models/Rental.js";
import Listing from "../models/Listing.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Notification from "../models/Notification.js";
import { io } from "../server.js";

export const createRental = async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (listing.type !== "rent") {
      return res.status(400).json({
        message: "This listing is not available for rent",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // Calculate days
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const totalRent = totalDays * listing.rentPerDay;

    const rental = await Rental.create({
      renter: req.user._id,
      owner: listing.owner,
      listing: listing._id,

      startDate,
      endDate,

      totalDays,
      rentPerDay: listing.rentPerDay,
      totalRent,

      paymentStatus: "pending",
      rentalStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Rental Request Sent",
      rental,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================
// Buyer Rentals
// =========================================

export const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({
      renter: req.user._id,
    })
      .populate("listing", "title image")
      .populate("owner", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================
// Seller Rentals
// =========================================

export const getSellerRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({
      owner: req.user._id,
    })
      .populate("listing", "title image")
      .populate("renter", "name email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================
// Update Rental Status
// =========================================

export const updateRentalStatus = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    // Only owner can update
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }

    // Get Listing
    const listing = await Listing.findById(rental.listing);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    const newStatus = req.body.rentalStatus;

    // Reserve machine only when first approved
    if (newStatus === "approved" && rental.rentalStatus !== "approved") {
      if (listing.quantity <= 0) {
        return res.status(400).json({
          message: "Machine is not available",
        });
      }

      listing.quantity -= 1;

      if (listing.quantity === 0) {
        listing.available = false;
      }

      await listing.save();
    }

    // Active doesn't change quantity.
    // It was already reduced when approved.

    // Return machine when completed
    if (newStatus === "completed" && rental.rentalStatus !== "completed") {
      listing.quantity += 1;
      listing.available = true;

      await listing.save();
    }

    rental.rentalStatus = newStatus;

    await rental.save();

    res.status(200).json({
      success: true,
      message: "Rental Status Updated",
      rental,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================================
// Delete Rental
// =========================================

export const deleteRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }

    await rental.deleteOne();

    res.status(200).json({
      success: true,
      message: "Rental Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createRentalPaymentOrder = async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
      return res.status(400).json({
        message: "Invalid rental dates",
      });
    }

    const totalRent = totalDays * listing.rentPerDay;

    const order = await razorpay.orders.create({
      amount: totalRent * 100,
      currency: "INR",
      receipt: `rental_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      order,
      totalRent,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyRentalPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      listingId,
      startDate,
      endDate,
    } = req.body;

    // Verify Razorpay Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid Payment Signature",
      });
    }

    // Get Listing
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (!listing.available) {
      return res.status(400).json({
        message: "Machine is currently unavailable",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const totalRent = totalDays * listing.rentPerDay;

    // Create Rental
    const rental = await Rental.create({
      renter: req.user._id,
      owner: listing.owner,
      listing: listing._id,

      startDate,
      endDate,

      totalDays,
      rentPerDay: listing.rentPerDay,
      totalRent,

      paymentStatus: "paid",
      paymentId: razorpay_payment_id,

      rentalStatus: "pending",
    });

    // Create Notification
    const notification = await Notification.create({
      user: listing.owner,
      message: `${req.user.name} requested to rent ${listing.title}`,
      type: "order",
    });

    // Send Socket Notification
    io.to(listing.owner.toString()).emit("new-rental", {
      _id: notification._id,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,

      renter: {
        name: req.user.name,
        email: req.user.email,
      },

      machine: listing.title,

      totalRent,

      totalDays,

      rentalStatus: rental.rentalStatus,
    });

    res.status(200).json({
      success: true,
      message: "Rental Payment Successful",
      rental,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
